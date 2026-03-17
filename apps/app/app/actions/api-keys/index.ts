"use server";

import { createCipheriv, randomBytes } from "node:crypto";
import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import type { ActionResult, ApiKeySummary } from "@/lib/types";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function encryptKey(plaintext: string): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  const keyBuf = Buffer.from(key, "hex");
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuf, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64");
}

export async function getApiKeys(): Promise<{ data: ApiKeySummary[] }> {
  const { orgId } = await auth();
  if (!orgId) {
    return { data: [] };
  }

  const keys = await database.apiKey.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      service: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const masked: ApiKeySummary[] = keys.map((k) => ({
    ...k,
    maskedKey: k.keyPrefix
      ? `${"*".repeat(Math.max(0, k.keyPrefix.length - 4))}${k.keyPrefix.slice(-4)}`
      : "****",
  }));

  return { data: masked };
}

export async function createApiKey(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const { orgId, userId } = await auth();
  if (!(orgId && userId)) {
    return { ok: false, error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const service = formData.get("service") as string;
  const key = formData.get("key") as string;

  if (!(name && service && key)) {
    return { ok: false, error: "Name, service, and key are required" };
  }

  const encryptedKey = encryptKey(key);
  const keyPrefix = key.slice(0, 8);

  const apiKey = await database.apiKey.create({
    data: {
      organizationId: orgId,
      service: service as
        | "linear"
        | "github"
        | "openai"
        | "anthropic"
        | "custom",
      name,
      encryptedKey,
      keyPrefix,
      createdBy: userId,
    },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "api_key_created",
      resourceType: "api_key",
      resourceId: apiKey.id,
      metadata: { service, name },
    },
  });

  revalidatePath("/api-keys");
  return { ok: true, data: { id: apiKey.id } };
}

export async function deleteApiKey(id: string): Promise<ActionResult> {
  const { orgId, userId } = await auth();
  if (!(orgId && userId)) {
    return { ok: false, error: "Not authenticated" };
  }

  const existing = await database.apiKey.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });

  if (!existing) {
    return { ok: false, error: "API key not found" };
  }

  await database.apiKey.delete({
    where: { id },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "api_key_deleted",
      resourceType: "api_key",
      resourceId: id,
      metadata: { service: existing.service, name: existing.name },
    },
  });

  revalidatePath("/api-keys");
  return { ok: true, data: undefined };
}

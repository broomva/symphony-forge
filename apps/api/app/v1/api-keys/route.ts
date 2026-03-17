import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, authenticateRequest } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  service: z.enum(["linear", "github", "openai", "anthropic", "custom"]),
  key: z.string().min(1),
});

/**
 * GET /v1/api-keys — List API keys for the organization.
 * Masks the encrypted key value — only returns the last 4 chars of the key prefix.
 */
export async function GET(): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId } = result.ctx;

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

  // Mask keyPrefix to show only last 4 chars
  const masked = keys.map((key) => ({
    ...key,
    maskedKey: key.keyPrefix
      ? `${"*".repeat(Math.max(0, key.keyPrefix.length - 4))}${key.keyPrefix.slice(-4)}`
      : "****",
  }));

  return NextResponse.json({ data: masked });
}

/**
 * POST /v1/api-keys — Create a new API key with encrypted storage.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId, userId } = result.ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_BODY", 400);
  }

  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
      "VALIDATION_ERROR",
      400
    );
  }

  const encryptedKey = encrypt(parsed.data.key);
  const keyPrefix = parsed.data.key.slice(0, 8);

  const apiKey = await database.apiKey.create({
    data: {
      organizationId: orgId,
      service: parsed.data.service,
      name: parsed.data.name,
      encryptedKey,
      keyPrefix,
      createdBy: userId,
    },
    select: {
      id: true,
      service: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "api_key_created",
      resourceType: "api_key",
      resourceId: apiKey.id,
      metadata: { service: parsed.data.service, name: parsed.data.name },
    },
  });

  return NextResponse.json(
    {
      data: {
        ...apiKey,
        maskedKey: `${"*".repeat(Math.max(0, keyPrefix.length - 4))}${keyPrefix.slice(-4)}`,
      },
    },
    { status: 201 }
  );
}

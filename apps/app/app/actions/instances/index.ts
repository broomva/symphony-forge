"use server";

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/crypto";

export interface InstanceSummary {
  _count: { runs: number; deployments: number };
  createdAt: Date;
  host: string;
  id: string;
  lastHealthCheck: Date | null;
  name: string;
  port: number;
  status: string;
  updatedAt: Date;
  version: string | null;
}

export async function getInstances(): Promise<InstanceSummary[]> {
  const { orgId } = await auth();
  if (!orgId) {
    return [];
  }

  const instances = await database.symphonyInstance.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      status: true,
      version: true,
      lastHealthCheck: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { runs: true, deployments: true } },
    },
  });

  return instances;
}

export async function createInstance(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { orgId, userId } = await auth();
  if (!(orgId && userId)) {
    return { ok: false, error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const host = formData.get("host") as string;
  const portStr = formData.get("port") as string;
  const apiToken = formData.get("apiToken") as string;

  if (!(name && host && portStr)) {
    return { ok: false, error: "Name, host, and port are required" };
  }

  const port = Number.parseInt(portStr, 10);
  if (Number.isNaN(port) || port < 1 || port > 65_535) {
    return { ok: false, error: "Port must be between 1 and 65535" };
  }

  // Check instance limit
  const settings = await database.organizationSettings.findUnique({
    where: { organizationId: orgId },
  });
  const maxInstances = settings?.maxInstances ?? 1;
  const currentCount = await database.symphonyInstance.count({
    where: { organizationId: orgId, deletedAt: null },
  });
  if (currentCount >= maxInstances) {
    return {
      ok: false,
      error: `Instance limit reached (${maxInstances}). Upgrade your plan for more.`,
    };
  }

  let encryptedToken: string | null = null;
  if (apiToken) {
    encryptedToken = encrypt(apiToken);
  }

  const instance = await database.symphonyInstance.create({
    data: {
      organizationId: orgId,
      name,
      host,
      port,
      apiToken: encryptedToken,
    },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "instance_created",
      resourceType: "instance",
      resourceId: instance.id,
      metadata: { name, host, port },
    },
  });

  revalidatePath("/instances");
  return { ok: true, id: instance.id };
}

export async function deleteInstance(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { orgId, userId } = await auth();
  if (!(orgId && userId)) {
    return { ok: false, error: "Not authenticated" };
  }

  const instance = await database.symphonyInstance.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });

  if (!instance) {
    return { ok: false, error: "Instance not found" };
  }

  await database.symphonyInstance.update({
    where: { id },
    data: { deletedAt: new Date(), status: "decommissioned" },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "instance_deleted",
      resourceType: "instance",
      resourceId: id,
    },
  });

  revalidatePath("/instances");
  return { ok: true };
}

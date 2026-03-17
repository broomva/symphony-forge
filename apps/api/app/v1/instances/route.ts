import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, authenticateRequest } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

const CreateInstanceSchema = z.object({
  name: z.string().min(1).max(100),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65_535),
  apiToken: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /v1/instances — List instances for the current organization.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId } = result.ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const instances = await database.symphonyInstance.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      status: true,
      version: true,
      lastHealthCheck: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { runs: true, deployments: true } },
    },
  });

  return NextResponse.json({ data: instances, count: instances.length });
}

/**
 * POST /v1/instances — Create a new instance.
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

  const parsed = CreateInstanceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((i) => i.message).join(", "),
      "VALIDATION_ERROR",
      400
    );
  }

  const { name, host, port, apiToken, metadata } = parsed.data;

  // Check instance limit
  const settings = await database.organizationSettings.findUnique({
    where: { organizationId: orgId },
  });
  const maxInstances = settings?.maxInstances ?? 1;
  const currentCount = await database.symphonyInstance.count({
    where: { organizationId: orgId, deletedAt: null },
  });
  if (currentCount >= maxInstances) {
    return apiError(
      `Instance limit reached (${maxInstances}). Upgrade your plan for more.`,
      "INSTANCE_LIMIT",
      403
    );
  }

  const instance = await database.symphonyInstance.create({
    data: {
      organizationId: orgId,
      name,
      host,
      port,
      apiToken: apiToken ? encrypt(apiToken) : null,
      metadata: metadata ?? undefined,
    },
  });

  // Audit log
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

  return NextResponse.json(instance, { status: 201 });
}

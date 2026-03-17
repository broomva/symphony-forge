import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, authenticateRequest } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

const UpdateInstanceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  host: z.string().min(1).optional(),
  port: z.number().int().min(1).max(65_535).optional(),
  apiToken: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getOwnedInstance(orgId: string, id: string) {
  return database.symphonyInstance.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
}

/**
 * GET /v1/instances/:id — Get instance detail.
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }

  const { id } = await params;
  const instance = await database.symphonyInstance.findFirst({
    where: { id, organizationId: result.ctx.orgId, deletedAt: null },
    include: {
      _count: { select: { runs: true, deployments: true } },
      deployments: {
        orderBy: { deployedAt: "desc" },
        take: 5,
        select: {
          id: true,
          version: true,
          deployedAt: true,
          success: true,
          workflow: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!instance) {
    return apiError("Instance not found", "NOT_FOUND", 404);
  }

  return NextResponse.json(instance);
}

/**
 * PATCH /v1/instances/:id — Update instance configuration.
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId, userId } = result.ctx;

  const { id } = await params;
  const existing = await getOwnedInstance(orgId, id);
  if (!existing) {
    return apiError("Instance not found", "NOT_FOUND", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_BODY", 400);
  }

  const parsed = UpdateInstanceSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((i) => i.message).join(", "),
      "VALIDATION_ERROR",
      400
    );
  }

  const { apiToken, metadata, ...rest } = parsed.data;

  const instance = await database.symphonyInstance.update({
    where: { id },
    data: {
      ...rest,
      ...(metadata === undefined ? {} : { metadata }),
      ...(apiToken === undefined
        ? {}
        : { apiToken: apiToken ? encrypt(apiToken) : null }),
    },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "instance_updated",
      resourceType: "instance",
      resourceId: id,
      metadata: { fields: Object.keys(parsed.data) },
    },
  });

  return NextResponse.json(instance);
}

/**
 * DELETE /v1/instances/:id — Soft-delete an instance.
 */
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId, userId } = result.ctx;

  const { id } = await params;
  const existing = await getOwnedInstance(orgId, id);
  if (!existing) {
    return apiError("Instance not found", "NOT_FOUND", 404);
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

  return new NextResponse(null, { status: 204 });
}

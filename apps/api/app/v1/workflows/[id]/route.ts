import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, authenticateRequest } from "@/lib/auth";

const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
  changeNote: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getOwnedWorkflow(orgId: string, id: string) {
  return database.workflow.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
}

/**
 * GET /v1/workflows/:id — Get workflow detail with version history and recent deployments.
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
  const workflow = await database.workflow.findFirst({
    where: { id, organizationId: result.ctx.orgId, deletedAt: null },
    include: {
      _count: { select: { versions: true, deployments: true } },
      versions: {
        orderBy: { version: "desc" },
        take: 20,
        select: {
          id: true,
          version: true,
          changeNote: true,
          createdBy: true,
          createdAt: true,
        },
      },
      deployments: {
        orderBy: { deployedAt: "desc" },
        take: 10,
        select: {
          id: true,
          version: true,
          deployedBy: true,
          deployedAt: true,
          success: true,
          error: true,
          instance: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!workflow) {
    return apiError("Workflow not found", "NOT_FOUND", 404);
  }

  return NextResponse.json(workflow);
}

/**
 * PATCH /v1/workflows/:id — Update workflow. If content changes, auto-create a new version.
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
  const existing = await getOwnedWorkflow(orgId, id);
  if (!existing) {
    return apiError("Workflow not found", "NOT_FOUND", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_BODY", 400);
  }

  const parsed = UpdateWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((i) => i.message).join(", "),
      "VALIDATION_ERROR",
      400
    );
  }

  const { content, changeNote, ...rest } = parsed.data;

  // If content is being updated, bump version and create a version snapshot
  const newVersion = content ? existing.version + 1 : undefined;

  const workflow = await database.workflow.update({
    where: { id },
    data: {
      ...rest,
      ...(content ? { content, version: newVersion } : {}),
      ...(content
        ? {
            versions: {
              create: {
                version: newVersion as number,
                content,
                changeNote: changeNote ?? null,
                createdBy: userId,
              },
            },
          }
        : {}),
    },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "workflow_updated",
      resourceType: "workflow",
      resourceId: id,
      metadata: {
        fields: Object.keys(parsed.data),
        ...(newVersion ? { newVersion } : {}),
      },
    },
  });

  return NextResponse.json(workflow);
}

/**
 * DELETE /v1/workflows/:id — Soft-delete a workflow.
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
  const existing = await getOwnedWorkflow(orgId, id);
  if (!existing) {
    return apiError("Workflow not found", "NOT_FOUND", 404);
  }

  await database.workflow.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "workflow_updated",
      resourceType: "workflow",
      resourceId: id,
      metadata: { action: "soft_delete" },
    },
  });

  return new NextResponse(null, { status: 204 });
}

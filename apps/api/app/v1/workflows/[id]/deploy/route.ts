import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, authenticateRequest } from "@/lib/auth";

const DeployWorkflowSchema = z.object({
  instanceId: z.string().min(1),
  version: z.number().int().positive().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /v1/workflows/:id/deploy — Deploy a workflow to an instance.
 * Creates a WorkflowDeployment record.
 */
export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId, userId } = result.ctx;

  const { id } = await params;

  // Verify workflow exists and belongs to org
  const workflow = await database.workflow.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
  if (!workflow) {
    return apiError("Workflow not found", "NOT_FOUND", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "INVALID_BODY", 400);
  }

  const parsed = DeployWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((i) => i.message).join(", "),
      "VALIDATION_ERROR",
      400
    );
  }

  const { instanceId, version } = parsed.data;
  const deployVersion = version ?? workflow.version;

  // Verify instance exists and belongs to org
  const instance = await database.symphonyInstance.findFirst({
    where: { id: instanceId, organizationId: orgId, deletedAt: null },
  });
  if (!instance) {
    return apiError("Instance not found", "NOT_FOUND", 404);
  }

  // Verify the requested version exists
  if (version) {
    const versionRecord = await database.workflowVersion.findFirst({
      where: { workflowId: id, version },
    });
    if (!versionRecord) {
      return apiError(
        `Workflow version ${version} not found`,
        "VERSION_NOT_FOUND",
        404
      );
    }
  }

  const deployment = await database.workflowDeployment.create({
    data: {
      workflowId: id,
      instanceId,
      version: deployVersion,
      deployedBy: userId,
    },
    include: {
      workflow: { select: { id: true, name: true } },
      instance: { select: { id: true, name: true } },
    },
  });

  // Audit log
  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "workflow_deployed",
      resourceType: "workflow",
      resourceId: id,
      metadata: {
        instanceId,
        instanceName: instance.name,
        version: deployVersion,
      },
    },
  });

  return NextResponse.json(deployment, { status: 201 });
}

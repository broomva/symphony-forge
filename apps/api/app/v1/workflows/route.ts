import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, authenticateRequest } from "@/lib/auth";

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  content: z.string().min(1),
});

/**
 * GET /v1/workflows — List workflows for the current organization.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId } = result.ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const workflows = await database.workflow.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      ...(status === "active" ? { isActive: true } : {}),
      ...(status === "inactive" ? { isActive: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      version: true,
      isActive: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { versions: true, deployments: true } },
    },
  });

  return NextResponse.json({ data: workflows, count: workflows.length });
}

/**
 * POST /v1/workflows — Create a new workflow with an initial version.
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

  const parsed = CreateWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((i) => i.message).join(", "),
      "VALIDATION_ERROR",
      400
    );
  }

  const { name, description, content } = parsed.data;

  const workflow = await database.workflow.create({
    data: {
      organizationId: orgId,
      name,
      description,
      content,
      version: 1,
      createdBy: userId,
      versions: {
        create: {
          version: 1,
          content,
          changeNote: "Initial version",
          createdBy: userId,
        },
      },
    },
    include: {
      versions: true,
    },
  });

  // Audit log
  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "workflow_created",
      resourceType: "workflow",
      resourceId: workflow.id,
      metadata: { name },
    },
  });

  return NextResponse.json(workflow, { status: 201 });
}

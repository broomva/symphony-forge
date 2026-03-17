"use server";

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";

export interface WorkflowSummary {
  _count: { versions: number; deployments: number };
  createdAt: Date;
  createdBy: string;
  description: string | null;
  id: string;
  isActive: boolean;
  name: string;
  updatedAt: Date;
  version: number;
}

export interface WorkflowVersion {
  changeNote: string | null;
  createdAt: Date;
  createdBy: string;
  id: string;
  version: number;
}

export interface WorkflowDeployment {
  deployedAt: Date;
  deployedBy: string;
  error: string | null;
  id: string;
  instance: { id: string; name: string };
  success: boolean;
  version: number;
}

export interface WorkflowDetail {
  _count: { versions: number; deployments: number };
  content: string;
  createdAt: Date;
  createdBy: string;
  deployments: WorkflowDeployment[];
  description: string | null;
  id: string;
  isActive: boolean;
  name: string;
  updatedAt: Date;
  version: number;
  versions: WorkflowVersion[];
}

export async function getWorkflows(): Promise<WorkflowSummary[]> {
  const { orgId } = await auth();
  if (!orgId) {
    return [];
  }

  const workflows = await database.workflow.findMany({
    where: { organizationId: orgId, deletedAt: null },
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

  return workflows;
}

export async function getWorkflow(id: string): Promise<WorkflowDetail | null> {
  const { orgId } = await auth();
  if (!orgId) {
    return null;
  }

  const workflow = await database.workflow.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
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

  return workflow;
}

export async function createWorkflow(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { orgId, userId } = await auth();
  if (!(orgId && userId)) {
    return { ok: false, error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const content = formData.get("content") as string;

  if (!(name && content)) {
    return { ok: false, error: "Name and content are required" };
  }

  const workflow = await database.workflow.create({
    data: {
      organizationId: orgId,
      name,
      description: description || null,
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
  });

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

  revalidatePath("/workflows");
  return { ok: true, id: workflow.id };
}

export async function deleteWorkflow(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { orgId, userId } = await auth();
  if (!(orgId && userId)) {
    return { ok: false, error: "Not authenticated" };
  }

  const workflow = await database.workflow.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });

  if (!workflow) {
    return { ok: false, error: "Workflow not found" };
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

  revalidatePath("/workflows");
  return { ok: true };
}

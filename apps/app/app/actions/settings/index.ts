"use server";

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import type { ActionResult, OrgSettings } from "@/lib/types";

export async function getSettings(): Promise<{ data: OrgSettings | null }> {
  const { orgId } = await auth();
  if (!orgId) {
    return { data: null };
  }

  const settings = await database.organizationSettings.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      billingPlan: "starter",
      maxConcurrentAgents: 3,
      maxInstances: 1,
    },
    update: {},
  });

  return { data: settings };
}

export async function updateSettings(
  formData: FormData
): Promise<ActionResult<OrgSettings>> {
  const { orgId, userId } = await auth();
  if (!(orgId && userId)) {
    return { ok: false, error: "Not authenticated" };
  }

  const billingPlan = formData.get("billingPlan") as string | null;
  const maxConcurrentAgents = formData.get("maxConcurrentAgents") as
    | string
    | null;
  const maxInstances = formData.get("maxInstances") as string | null;

  const updateData: Record<string, unknown> = {};
  if (billingPlan) {
    updateData.billingPlan = billingPlan;
  }
  if (maxConcurrentAgents) {
    updateData.maxConcurrentAgents = Number.parseInt(maxConcurrentAgents, 10);
  }
  if (maxInstances) {
    updateData.maxInstances = Number.parseInt(maxInstances, 10);
  }

  const settings = await database.organizationSettings.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      billingPlan:
        (billingPlan as "starter" | "team" | "enterprise") ?? "starter",
      maxConcurrentAgents: maxConcurrentAgents
        ? Number.parseInt(maxConcurrentAgents, 10)
        : 3,
      maxInstances: maxInstances ? Number.parseInt(maxInstances, 10) : 1,
    },
    update: updateData,
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "settings_updated",
      resourceType: "organization_settings",
      resourceId: settings.id,
      metadata: JSON.parse(JSON.stringify({ changes: updateData })),
    },
  });

  revalidatePath("/settings");
  return { ok: true, data: settings };
}

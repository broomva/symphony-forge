import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, authenticateRequest } from "@/lib/auth";

const updateSettingsSchema = z.object({
  billingPlan: z.enum(["starter", "team", "enterprise"]).optional(),
  maxConcurrentAgents: z.number().int().min(1).max(100).optional(),
  maxInstances: z.number().int().min(1).max(50).optional(),
});

/**
 * GET /v1/settings — Get organization settings.
 * Creates a default settings record if none exists (upsert pattern).
 */
export async function GET(): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId } = result.ctx;

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

  return NextResponse.json({ data: settings });
}

/**
 * PATCH /v1/settings — Update organization settings.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
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

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues.map((i) => i.message).join(", "),
      "VALIDATION_ERROR",
      400
    );
  }

  const settings = await database.organizationSettings.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      billingPlan: parsed.data.billingPlan ?? "starter",
      maxConcurrentAgents: parsed.data.maxConcurrentAgents ?? 3,
      maxInstances: parsed.data.maxInstances ?? 1,
    },
    update: parsed.data,
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "settings_updated",
      resourceType: "organization_settings",
      resourceId: settings.id,
      metadata: JSON.parse(JSON.stringify({ changes: parsed.data })),
    },
  });

  return NextResponse.json({ data: settings });
}

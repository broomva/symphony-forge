import { database } from "@repo/database";
import { SymphonyClient } from "@repo/symphony-client";
import { NextResponse } from "next/server";
import { apiError, authenticateRequest } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /v1/instances/:id/shutdown — Proxy to the Symphony engine's POST /api/v1/shutdown
 * for graceful shutdown. Requires auth + instance ownership.
 */
export async function POST(
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
  });

  if (!instance) {
    return apiError("Instance not found", "NOT_FOUND", 404);
  }

  const client = new SymphonyClient({
    baseUrl: `https://${instance.host}:${instance.port}`,
    apiToken: instance.apiToken ? decrypt(instance.apiToken) : undefined,
    timeoutMs: 15_000,
  });

  try {
    const response = await client.triggerShutdown();

    // Log the shutdown request in the audit log (using instance_updated action)
    await database.auditLog.create({
      data: {
        organizationId: result.ctx.orgId,
        userId: result.ctx.userId,
        action: "instance_updated",
        resourceType: "instance",
        resourceId: id,
        metadata: { operation: "shutdown", shutdown: response.shutdown },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach engine";
    return apiError(message, "ENGINE_UNREACHABLE", 502);
  }
}

import { database } from "@repo/database";
import { SymphonyClient } from "@repo/symphony-client";
import { NextResponse } from "next/server";
import { apiError, authenticateRequest } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /v1/instances/:id/agents — Proxy to the Symphony engine's GET /api/v1/state,
 * extract and return active agents grouped by status.
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
    const state = await client.getState();
    return NextResponse.json({
      data: {
        running: state.running,
        retrying: state.retrying,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach engine";
    return apiError(message, "ENGINE_UNREACHABLE", 502);
  }
}

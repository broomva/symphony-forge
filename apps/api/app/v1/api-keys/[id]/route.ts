import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { apiError, authenticateRequest } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /v1/api-keys/:id — Hard-delete an API key with audit log.
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

  const existing = await database.apiKey.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });

  if (!existing) {
    return apiError("API key not found", "NOT_FOUND", 404);
  }

  // Hard-delete the key
  await database.apiKey.delete({
    where: { id },
  });

  await database.auditLog.create({
    data: {
      organizationId: orgId,
      userId,
      action: "api_key_deleted",
      resourceType: "api_key",
      resourceId: id,
      metadata: {
        service: existing.service,
        name: existing.name,
      },
    },
  });

  return NextResponse.json({ success: true });
}

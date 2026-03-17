import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { apiError, authenticateRequest } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /v1/runs/:id — Get run detail with sessions included
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId } = result.ctx;

  const { id } = await params;

  const run = await database.run.findFirst({
    where: { id, organizationId: orgId },
    include: {
      instance: { select: { id: true, name: true, host: true } },
      sessions: {
        orderBy: { startedAt: "asc" },
      },
    },
  });

  if (!run) {
    return apiError("Run not found", "NOT_FOUND", 404);
  }

  return NextResponse.json({ data: run });
}

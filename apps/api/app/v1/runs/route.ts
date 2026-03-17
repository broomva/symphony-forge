import type { Prisma } from "@repo/database";
import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

/**
 * GET /v1/runs — List runs for the organization with cursor-based pagination.
 *
 * Query params:
 *   cursor   — cursor ID for pagination
 *   take     — page size (default 20, max 100)
 *   status   — filter by RunStatus
 *   instanceId — filter by instance
 */
export async function GET(request: Request): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId } = result.ctx;

  const { searchParams } = new URL(request.url);

  const cursor = searchParams.get("cursor") ?? undefined;
  const takeRaw = Number.parseInt(searchParams.get("take") ?? "20", 10);
  const take = Math.min(Math.max(takeRaw, 1), 100);
  const status = searchParams.get("status") ?? undefined;
  const instanceId = searchParams.get("instanceId") ?? undefined;

  const where: Prisma.RunWhereInput = {
    organizationId: orgId,
    ...(status ? { status: status as Prisma.RunWhereInput["status"] } : {}),
    ...(instanceId ? { instanceId } : {}),
  };

  const runs = await database.run.findMany({
    where,
    take: take + 1, // fetch one extra to detect if there are more
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // skip the cursor itself
        }
      : {}),
    orderBy: { startedAt: "desc" },
    include: {
      instance: { select: { id: true, name: true } },
    },
  });

  const hasMore = runs.length > take;
  const data = hasMore ? runs.slice(0, take) : runs;
  const nextCursor = hasMore ? data.at(-1)?.id : undefined;

  return NextResponse.json({
    data,
    pagination: {
      nextCursor,
      hasMore,
    },
  });
}

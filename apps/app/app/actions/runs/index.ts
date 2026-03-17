"use server";

import { auth } from "@repo/auth/server";
import type { Prisma } from "@repo/database";
import { database } from "@repo/database";
import type { PaginatedResult, RunDetail, RunSummary } from "@/lib/types";

interface GetRunsOptions {
  cursor?: string;
  instanceId?: string;
  status?: string;
  take?: number;
}

export async function getRuns(
  options: GetRunsOptions = {}
): Promise<PaginatedResult<RunSummary>> {
  const { orgId } = await auth();
  if (!orgId) {
    return { data: [], pagination: { nextCursor: undefined, hasMore: false } };
  }

  const take = Math.min(Math.max(options.take ?? 20, 1), 100);

  const where: Prisma.RunWhereInput = {
    organizationId: orgId,
    ...(options.status
      ? { status: options.status as Prisma.RunWhereInput["status"] }
      : {}),
    ...(options.instanceId ? { instanceId: options.instanceId } : {}),
  };

  const runs = await database.run.findMany({
    where,
    take: take + 1,
    ...(options.cursor
      ? {
          cursor: { id: options.cursor },
          skip: 1,
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

  return {
    data,
    pagination: {
      nextCursor,
      hasMore,
    },
  };
}

export async function getRun(id: string): Promise<{ data: RunDetail | null }> {
  const { orgId } = await auth();
  if (!orgId) {
    return { data: null };
  }

  const run = await database.run.findFirst({
    where: { id, organizationId: orgId },
    include: {
      instance: { select: { id: true, name: true, host: true } },
      sessions: {
        orderBy: { startedAt: "asc" },
      },
    },
  });

  return { data: run };
}

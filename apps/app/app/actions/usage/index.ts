"use server";

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import type { UsageData } from "@/lib/types";

export async function getUsage(
  startDate?: string,
  endDate?: string
): Promise<{ data: UsageData }> {
  const { orgId } = await auth();
  if (!orgId) {
    return {
      data: {
        period: { start: "", end: "" },
        totals: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          agentSeconds: 0,
          runCount: 0,
          peakConcurrent: 0,
        },
        records: [],
      },
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const start = startDate ? new Date(startDate) : startOfMonth;
  const end = endDate ? new Date(endDate) : now;

  const usageRecords = await database.usageRecord.findMany({
    where: {
      organizationId: orgId,
      periodStart: { gte: start },
      periodEnd: { lte: end },
    },
    orderBy: { periodStart: "desc" },
  });

  const totals = usageRecords.reduce(
    (acc, record) => ({
      inputTokens: acc.inputTokens + Number(record.inputTokens),
      outputTokens: acc.outputTokens + Number(record.outputTokens),
      totalTokens: acc.totalTokens + Number(record.totalTokens),
      agentSeconds: acc.agentSeconds + record.agentSeconds,
      runCount: acc.runCount + record.runCount,
      peakConcurrent: Math.max(acc.peakConcurrent, record.peakConcurrent),
    }),
    {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      agentSeconds: 0,
      runCount: 0,
      peakConcurrent: 0,
    }
  );

  return {
    data: {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      totals,
      records: usageRecords,
    },
  };
}

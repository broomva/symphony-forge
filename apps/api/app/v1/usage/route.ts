import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { apiError, authenticateRequest } from "@/lib/auth";

/**
 * GET /v1/usage — Aggregate usage for a billing period.
 *
 * Query params:
 *   startDate — ISO date string (default: start of current month)
 *   endDate   — ISO date string (default: now)
 */
export async function GET(request: Request): Promise<NextResponse> {
  const result = await authenticateRequest();
  if (!result.ok) {
    return result.response;
  }
  const { orgId } = result.ctx;

  try {
    const { searchParams } = new URL(request.url);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : startOfMonth;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : now;

    // Fetch usage records within the period
    const usageRecords = await database.usageRecord.findMany({
      where: {
        organizationId: orgId,
        periodStart: { gte: startDate },
        periodEnd: { lte: endDate },
      },
      orderBy: { periodStart: "desc" },
    });

    // Aggregate totals
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

    return NextResponse.json({
      data: {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        totals,
        records: usageRecords,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch usage";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}

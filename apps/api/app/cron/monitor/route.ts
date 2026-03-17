import { log } from "@repo/observability/log";
import { NextResponse } from "next/server";
import { runHealthChecks } from "@/lib/monitoring";

/**
 * GET /cron/monitor — Periodic health check for all Symphony instances.
 * Called by Vercel Cron or an external scheduler.
 *
 * Protects against unauthorized access via CRON_SECRET.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runHealthChecks();

    const summary = {
      checked: results.length,
      online: results.filter((r) => r.newStatus === "online").length,
      offline: results.filter((r) => r.newStatus === "offline").length,
      degraded: results.filter((r) => r.newStatus === "degraded").length,
      statusChanges: results.filter((r) => r.previousStatus !== r.newStatus)
        .length,
    };

    log.info("Instance health check completed", summary);

    return NextResponse.json({
      ok: true,
      ...summary,
      results: results.map((r) => ({
        instanceId: r.instanceId,
        name: r.name,
        status: r.newStatus,
        changed: r.previousStatus !== r.newStatus,
        healthy: r.healthy,
        ready: r.ready,
        metrics: r.metrics,
        error: r.error,
      })),
    });
  } catch (error) {
    log.error("Health check cron failed", { error });
    return NextResponse.json(
      { ok: false, message: "Health check failed" },
      { status: 500 }
    );
  }
}

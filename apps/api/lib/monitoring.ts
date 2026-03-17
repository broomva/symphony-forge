import { database } from "@repo/database";
import { SymphonyClient } from "@repo/symphony-client";
import { decrypt } from "./crypto";

type InstanceStatus =
  | "provisioning"
  | "online"
  | "offline"
  | "degraded"
  | "decommissioned";

interface HealthCheckResult {
  error?: string;
  healthy: boolean;
  instanceId: string;
  metrics: EngineMetrics | null;
  name: string;
  newStatus: InstanceStatus;
  previousStatus: string;
  ready: boolean;
}

interface EngineMetrics {
  retrying: number;
  running: number;
  secondsRunning: number;
  totalTokens: number;
}

/**
 * Check the health and readiness of a single Symphony instance.
 */
async function checkInstance(instance: {
  id: string;
  name: string;
  host: string;
  port: number;
  apiToken: string | null;
  status: InstanceStatus;
}): Promise<HealthCheckResult> {
  const client = new SymphonyClient({
    baseUrl: `https://${instance.host}:${instance.port}`,
    apiToken: instance.apiToken ? decrypt(instance.apiToken) : undefined,
    timeoutMs: 10_000,
    retries: 1,
  });

  let healthy = false;
  let ready = false;
  let metrics: EngineMetrics | null = null;
  let error: string | undefined;

  try {
    [healthy, ready] = await Promise.all([
      client.isHealthy(),
      client.isReady(),
    ]);

    if (ready) {
      try {
        const state = await client.getState();
        metrics = {
          running: state.counts.running,
          retrying: state.counts.retrying,
          totalTokens: state.codex_totals.total_tokens,
          secondsRunning: state.codex_totals.seconds_running,
        };
      } catch {
        // Metrics fetch failed, but instance is still ready
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  let newStatus: InstanceStatus;
  if (instance.status === "decommissioned") {
    newStatus = "decommissioned";
  } else if (ready && healthy) {
    newStatus = "online";
  } else if (healthy && !ready) {
    newStatus = "degraded";
  } else {
    newStatus = "offline";
  }

  return {
    instanceId: instance.id,
    name: instance.name,
    previousStatus: instance.status,
    newStatus,
    healthy,
    ready,
    metrics,
    error,
  };
}

/**
 * Run health checks on all active instances and update their status in the database.
 * Returns a summary of all check results.
 */
export async function runHealthChecks(): Promise<HealthCheckResult[]> {
  const instances = await database.symphonyInstance.findMany({
    where: {
      deletedAt: null,
      status: { not: "decommissioned" },
    },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      apiToken: true,
      status: true,
    },
  });

  if (instances.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    instances.map((instance) => checkInstance(instance))
  );

  const checkResults: HealthCheckResult[] = [];

  for (const settled of results) {
    if (settled.status === "rejected") {
      continue;
    }

    const result = settled.value;
    checkResults.push(result);

    // Update status in DB if it changed
    if (result.newStatus !== result.previousStatus) {
      await database.symphonyInstance.update({
        where: { id: result.instanceId },
        data: {
          status: result.newStatus,
          lastHealthCheck: new Date(),
        },
      });
    } else {
      await database.symphonyInstance.update({
        where: { id: result.instanceId },
        data: { lastHealthCheck: new Date() },
      });
    }
  }

  return checkResults;
}

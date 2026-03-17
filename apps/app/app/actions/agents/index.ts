"use server";

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import type { RetryingInfo, RunningInfo } from "@repo/symphony-client";
import { SymphonyClient } from "@repo/symphony-client";
import { decrypt } from "@/lib/crypto";

export interface AgentRunning extends RunningInfo {
  instanceId: string;
  instanceName: string;
}

export interface AgentRetrying extends RetryingInfo {
  instanceId: string;
  instanceName: string;
}

export interface ActiveAgentsResult {
  retrying: AgentRetrying[];
  running: AgentRunning[];
}

/**
 * Fetch active agents from a specific instance via the Symphony engine API.
 */
export async function getActiveAgents(
  instanceId: string
): Promise<ActiveAgentsResult> {
  const { orgId } = await auth();
  if (!orgId) {
    return { running: [], retrying: [] };
  }

  const instance = await database.symphonyInstance.findFirst({
    where: { id: instanceId, organizationId: orgId, deletedAt: null },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      apiToken: true,
      status: true,
    },
  });

  if (!instance || instance.status !== "online") {
    return { running: [], retrying: [] };
  }

  const client = new SymphonyClient({
    baseUrl: `https://${instance.host}:${instance.port}`,
    apiToken: instance.apiToken ? decrypt(instance.apiToken) : undefined,
    timeoutMs: 10_000,
    retries: 1,
  });

  try {
    const state = await client.getState();
    return {
      running: state.running.map((r) => ({
        ...r,
        instanceId: instance.id,
        instanceName: instance.name,
      })),
      retrying: state.retrying.map((r) => ({
        ...r,
        instanceId: instance.id,
        instanceName: instance.name,
      })),
    };
  } catch {
    return { running: [], retrying: [] };
  }
}

/**
 * Aggregate active agents across all online instances for the current org.
 */
export async function getAllActiveAgents(): Promise<ActiveAgentsResult> {
  const { orgId } = await auth();
  if (!orgId) {
    return { running: [], retrying: [] };
  }

  const instances = await database.symphonyInstance.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: "online",
    },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      apiToken: true,
    },
  });

  if (instances.length === 0) {
    return { running: [], retrying: [] };
  }

  const results = await Promise.allSettled(
    instances.map(async (instance) => {
      const client = new SymphonyClient({
        baseUrl: `https://${instance.host}:${instance.port}`,
        apiToken: instance.apiToken ? decrypt(instance.apiToken) : undefined,
        timeoutMs: 10_000,
        retries: 1,
      });

      const state = await client.getState();
      return {
        running: state.running.map((r) => ({
          ...r,
          instanceId: instance.id,
          instanceName: instance.name,
        })),
        retrying: state.retrying.map((r) => ({
          ...r,
          instanceId: instance.id,
          instanceName: instance.name,
        })),
      };
    })
  );

  const running: AgentRunning[] = [];
  const retrying: AgentRetrying[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      running.push(...result.value.running);
      retrying.push(...result.value.retrying);
    }
  }

  return { running, retrying };
}

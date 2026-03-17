import { auth } from "@repo/auth/server";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  AlertTriangleIcon,
  BotIcon,
  ClockIcon,
  CoinsIcon,
  ServerIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllActiveAgents } from "@/app/actions/agents";
import { Header } from "../components/header";

const title = "Agents";
const description = "Monitor and manage running Symphony agents";

export const metadata: Metadata = {
  title,
  description,
};

function formatTokens(num: number): string {
  if (num === 0) {
    return "0";
  }
  if (num < 1000) {
    return num.toLocaleString();
  }
  if (num < 1_000_000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${(num / 1_000_000).toFixed(1)}M`;
}

function formatDuration(isoStart: string): string {
  const start = new Date(isoStart);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - start.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

const AgentsPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const { running, retrying } = await getAllActiveAgents();
  const totalAgents = running.length + retrying.length;

  return (
    <>
      <Header page="Agents" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-muted-foreground text-sm">
                Total Active
              </p>
              <BotIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <p className="font-bold text-2xl">{totalAgents}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-muted-foreground text-sm">
                Running
              </p>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <p className="font-bold text-2xl">{running.length}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-muted-foreground text-sm">
                Retrying
              </p>
              <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <p className="font-bold text-2xl">{retrying.length}</p>
            </div>
          </div>
        </div>

        {/* Running Agents */}
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Running Agents</h3>
          {running.length === 0 ? (
            <p className="mt-2 text-muted-foreground text-sm">
              No agents are currently running. Agents will appear here when a
              connected Symphony instance begins processing issues.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {running.map((agent) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={`${agent.instanceId}-${agent.identifier}`}
                >
                  <div className="flex items-center gap-3">
                    <BotIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {agent.identifier}
                        <Badge className="ml-2" variant="default">
                          {agent.state}
                        </Badge>
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <ServerIcon className="h-3 w-3" />
                          {agent.instanceName}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {formatDuration(agent.started_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CoinsIcon className="h-3 w-3" />
                          {formatTokens(agent.tokens.total_tokens)} tokens
                        </span>
                        <span>Turn {agent.turn_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Retrying Agents */}
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Retrying Agents</h3>
          {retrying.length === 0 ? (
            <p className="mt-2 text-muted-foreground text-sm">
              No agents are currently retrying.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {retrying.map((agent) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={`${agent.instanceId}-${agent.identifier}`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangleIcon className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="font-medium text-sm">
                        {agent.identifier}
                        <Badge className="ml-2" variant="destructive">
                          retry #{agent.attempt}
                        </Badge>
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <ServerIcon className="h-3 w-3" />
                          {agent.instanceName}
                        </span>
                        {agent.error && (
                          <span className="text-destructive">
                            {agent.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AgentsPage;

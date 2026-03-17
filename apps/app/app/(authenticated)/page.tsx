import { auth } from "@repo/auth/server";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  AlertTriangleIcon,
  BotIcon,
  ClockIcon,
  CoinsIcon,
  PlayIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstances } from "@/app/actions/instances";
import { getRuns } from "@/app/actions/runs";
import { getUsage } from "@/app/actions/usage";
import { Header } from "./components/header";

const title = "Symphony Cloud";
const description =
  "Managed platform for Symphony — the open-source coding agent orchestrator";

export const metadata: Metadata = {
  title,
  description,
};

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium text-muted-foreground text-sm">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <p className="font-bold text-2xl">{value}</p>
        {subtitle && (
          <p className="mt-1 text-muted-foreground text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

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

function formatSeconds(seconds: number): string {
  if (seconds === 0) {
    return "0s";
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function instanceStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "online":
      return "default";
    case "degraded":
      return "destructive";
    default:
      return "secondary";
  }
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "succeeded":
      return "default";
    case "running":
    case "pending":
      return "secondary";
    case "failed":
    case "timed_out":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

const DashboardPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const [instances, runsResult, usageResult] = await Promise.all([
    getInstances(),
    getRuns({ take: 5 }),
    getUsage(),
  ]);

  const runs = runsResult.data;
  const usage = usageResult.data;

  const onlineInstances = instances.filter(
    (i: { status: string }) => i.status === "online"
  );
  const retryingRuns = runs.filter(
    (r: { status: string }) => r.status === "retrying"
  );

  return (
    <>
      <Header page="Dashboard" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BotIcon}
            subtitle={
              instances.length > 0
                ? `${onlineInstances.length} of ${instances.length} instances online`
                : "No Symphony instance connected"
            }
            title="Instances"
            value={instances.length}
          />
          <StatCard
            icon={CoinsIcon}
            subtitle={
              usage.totals.totalTokens > 0
                ? `In: ${formatTokens(usage.totals.inputTokens)} / Out: ${formatTokens(usage.totals.outputTokens)}`
                : "Connect an instance to track usage"
            }
            title="Total Tokens (Period)"
            value={formatTokens(usage.totals.totalTokens)}
          />
          <StatCard
            icon={AlertTriangleIcon}
            subtitle={
              retryingRuns.length > 0
                ? "Runs currently retrying"
                : "No retries in progress"
            }
            title="Retrying"
            value={retryingRuns.length}
          />
          <StatCard
            icon={ClockIcon}
            subtitle="Total agent runtime this period"
            title="Runtime"
            value={formatSeconds(usage.totals.agentSeconds)}
          />
        </div>

        {/* Recent Runs */}
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Runs</h3>
            {runs.length > 0 && (
              <Link
                className="text-primary text-sm hover:underline"
                href="/runs"
              >
                View all
              </Link>
            )}
          </div>
          {runs.length === 0 ? (
            <p className="mt-2 text-muted-foreground text-sm">
              No runs yet. Runs will appear here once agents start processing
              issues.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {runs.map((run) => (
                <Link
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  href={`/runs/${run.id}`}
                  key={run.id}
                >
                  <div className="flex items-center gap-3">
                    <PlayIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {run.issueIdentifier}
                        {run.issueTitle && (
                          <span className="ml-2 font-normal text-muted-foreground">
                            {run.issueTitle}
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {run.instance?.name ?? "Unknown instance"} -{" "}
                        {run.startedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(run.status)}>
                    {run.status.replace("_", " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Instances */}
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Instances</h3>
            <Link
              className="text-primary text-sm hover:underline"
              href="/instances"
            >
              Manage
            </Link>
          </div>
          {instances.length === 0 ? (
            <p className="mt-2 text-muted-foreground text-sm">
              No agents running. Connect a Symphony instance in{" "}
              <Link className="underline" href="/instances">
                Instances
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {instances
                .slice(0, 5)
                .map(
                  (instance: {
                    id: string;
                    name: string;
                    host: string;
                    port: number;
                    status: string;
                  }) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-3"
                      key={instance.id}
                    >
                      <div>
                        <p className="font-medium text-sm">{instance.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {instance.host}:{instance.port}
                        </p>
                      </div>
                      <Badge variant={instanceStatusVariant(instance.status)}>
                        {instance.status}
                      </Badge>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

import { auth } from "@repo/auth/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  ActivityIcon,
  ClockIcon,
  CoinsIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUsage } from "@/app/actions/usage";
import { Header } from "../components/header";

const title = "Usage";
const description = "Token consumption and billing period usage";

export const metadata: Metadata = {
  title,
  description,
};

function formatNumber(num: number): string {
  if (num === 0) {
    return "0";
  }
  if (num < 1000) {
    return num.toLocaleString();
  }
  if (num < 1_000_000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  if (num < 1_000_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  return `${(num / 1_000_000_000).toFixed(2)}B`;
}

function formatSeconds(seconds: number): string {
  if (seconds === 0) {
    return "0s";
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-muted-foreground text-sm">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-bold text-2xl">{value}</p>
        {subtitle && (
          <p className="mt-1 text-muted-foreground text-xs">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

const UsagePage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const { data: usage } = await getUsage();

  const periodStart = usage.period.start
    ? new Date(usage.period.start).toLocaleDateString()
    : "--";
  const periodEnd = usage.period.end
    ? new Date(usage.period.end).toLocaleDateString()
    : "--";

  return (
    <>
      <Header page="Usage" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Usage Overview</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Billing period: {periodStart} - {periodEnd}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={CoinsIcon}
            subtitle={`In: ${formatNumber(usage.totals.inputTokens)} / Out: ${formatNumber(usage.totals.outputTokens)}`}
            title="Total Tokens"
            value={formatNumber(usage.totals.totalTokens)}
          />
          <StatCard
            icon={ClockIcon}
            subtitle="Total agent compute time"
            title="Agent Seconds"
            value={formatSeconds(usage.totals.agentSeconds)}
          />
          <StatCard
            icon={ActivityIcon}
            subtitle="Total completed runs"
            title="Run Count"
            value={usage.totals.runCount.toLocaleString()}
          />
          <StatCard
            icon={UsersIcon}
            subtitle="Max concurrent agents"
            title="Peak Concurrent"
            value={usage.totals.peakConcurrent.toString()}
          />
          <StatCard
            icon={ZapIcon}
            subtitle="Input tokens consumed"
            title="Input Tokens"
            value={formatNumber(usage.totals.inputTokens)}
          />
          <StatCard
            icon={ZapIcon}
            subtitle="Output tokens generated"
            title="Output Tokens"
            value={formatNumber(usage.totals.outputTokens)}
          />
        </div>

        {usage.records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Period Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usage.records.map(
                  (record: {
                    id: string;
                    periodStart: Date | string;
                    periodEnd: Date | string;
                    totalTokens: bigint | number;
                    runCount: number;
                    agentSeconds: number;
                    reportedToStripe: boolean;
                  }) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-3"
                      key={record.id}
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {new Date(record.periodStart).toLocaleDateString()} -{" "}
                          {new Date(record.periodEnd).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {record.runCount} runs,{" "}
                          {formatSeconds(record.agentSeconds)} agent time
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatNumber(Number(record.totalTokens))} tokens
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {record.reportedToStripe
                            ? "Reported to billing"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default UsagePage;

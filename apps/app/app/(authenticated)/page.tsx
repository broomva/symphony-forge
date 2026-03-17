import { auth } from "@repo/auth/server";
import { AlertTriangleIcon, BotIcon, ClockIcon, CoinsIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

const DashboardPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Dashboard" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BotIcon}
            subtitle="No Symphony instance connected"
            title="Active Agents"
            value={0}
          />
          <StatCard
            icon={CoinsIcon}
            subtitle="Connect an instance to track usage"
            title="Total Tokens Today"
            value="—"
          />
          <StatCard icon={AlertTriangleIcon} title="Retrying" value={0} />
          <StatCard
            icon={ClockIcon}
            subtitle="Total agent runtime"
            title="Runtime"
            value="0s"
          />
        </div>

        {/* Active Agents */}
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Active Agents</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            No agents running. Connect a Symphony instance in{" "}
            <a className="underline" href="/instances">
              Instances
            </a>{" "}
            to get started.
          </p>
        </div>

        {/* Recent Runs */}
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Recent Runs</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            No runs yet. Runs will appear here once agents start processing
            issues.
          </p>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

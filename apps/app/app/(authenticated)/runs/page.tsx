import { auth } from "@repo/auth/server";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { ClockIcon, CoinsIcon, PlayIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRuns } from "@/app/actions/runs";
import { Header } from "../components/header";

const title = "Runs";
const description = "View historical agent run data";

export const metadata: Metadata = {
  title,
  description,
};

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

function formatDuration(ms: number | null | undefined): string {
  if (!ms) {
    return "--";
  }
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatTokens(tokens: bigint | number): string {
  const num = Number(tokens);
  if (num === 0) {
    return "0";
  }
  if (num < 1000) {
    return num.toString();
  }
  if (num < 1_000_000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${(num / 1_000_000).toFixed(1)}M`;
}

const RunsPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const { data: runs } = await getRuns({ take: 50 });

  return (
    <>
      <Header page="Runs" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Agent Runs</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Historical run data with status, duration, and token usage.
              </p>
            </div>
          </div>
        </div>

        {runs.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-card-foreground shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <PlayIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No runs yet</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  Runs will appear here once agents start processing issues.
                  Connect a Symphony instance to get started.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead>Instance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      Duration
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <CoinsIcon className="h-3 w-3" />
                      Tokens
                    </div>
                  </TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <Link
                        className="font-medium text-primary hover:underline"
                        href={`/runs/${run.id}`}
                      >
                        {run.issueIdentifier}
                      </Link>
                      {run.issueTitle && (
                        <p className="mt-0.5 max-w-[200px] truncate text-muted-foreground text-xs">
                          {run.issueTitle}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {run.instance?.name ?? "--"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(run.status)}>
                        {run.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDuration(run.durationMs)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatTokens(run.totalTokens)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {run.startedAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default RunsPage;

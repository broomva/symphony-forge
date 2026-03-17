import { auth } from "@repo/auth/server";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRun } from "@/app/actions/runs";
import { Header } from "../../components/header";

const title = "Run Detail";
const description = "Detailed view of a specific agent run";

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
    case "streaming_turn":
    case "launching_agent":
    case "building_prompt":
    case "preparing_workspace":
    case "initializing_session":
      return "secondary";
    case "failed":
    case "timed_out":
    case "cancelled":
    case "stalled":
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
    return num.toLocaleString();
  }
  if (num < 1_000_000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${(num / 1_000_000).toFixed(1)}M`;
}

interface RunDetailPageProps {
  params: Promise<{ id: string }>;
}

const RunDetailPage = async ({ params }: RunDetailPageProps) => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const { id } = await params;
  const { data: run } = await getRun(id);

  if (!run) {
    notFound();
  }

  return (
    <>
      <Header page={run.issueIdentifier} pages={["Symphony Cloud", "Runs"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Run Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={statusVariant(run.status)}>
                {run.status.replace("_", " ")}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-2xl">
                {formatDuration(run.durationMs)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Total Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-2xl">
                {formatTokens(run.totalTokens)}
              </p>
              <p className="text-muted-foreground text-xs">
                In: {formatTokens(run.inputTokens)} / Out:{" "}
                {formatTokens(run.outputTokens)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Instance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{run.instance?.name ?? "--"}</p>
              <p className="text-muted-foreground text-xs">
                {run.instance?.host ?? ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Run Info */}
        <Card>
          <CardHeader>
            <CardTitle>Run Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Issue</p>
                <p className="font-medium">
                  {run.issueUrl ? (
                    <Link
                      className="text-primary hover:underline"
                      href={run.issueUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {run.issueIdentifier}
                    </Link>
                  ) : (
                    run.issueIdentifier
                  )}
                  {run.issueTitle && (
                    <span className="ml-2 text-muted-foreground">
                      {run.issueTitle}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Attempt</p>
                <p className="font-medium">{run.attempt}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Started</p>
                <p className="font-medium">{run.startedAt.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Completed</p>
                <p className="font-medium">
                  {run.completedAt?.toLocaleString() ?? "In progress"}
                </p>
              </div>
              {run.error && (
                <div className="md:col-span-2">
                  <p className="text-muted-foreground text-sm">Error</p>
                  <p className="font-medium text-destructive">{run.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sessions Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions ({run.sessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {run.sessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No sessions recorded for this run.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Turns</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Last Event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {run.sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-xs">
                        {session.sessionId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(session.status)}>
                          {session.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {session.turnCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatTokens(session.totalTokens)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {session.startedAt.toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                        {session.lastMessage ?? session.lastEvent ?? "--"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RunDetailPage;

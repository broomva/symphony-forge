"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import type { WorkflowDeployment } from "@/app/actions/workflows";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DeploymentHistory({
  deployments,
}: {
  deployments: WorkflowDeployment[];
}) {
  if (deployments.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="font-semibold">Deployments</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          This workflow has not been deployed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="mb-4 font-semibold">Recent Deployments</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instance</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deployed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">{d.instance.name}</TableCell>
              <TableCell>
                <span className="font-mono">v{d.version}</span>
              </TableCell>
              <TableCell>
                <Badge variant={d.success ? "default" : "destructive"}>
                  {d.success ? "Success" : "Failed"}
                </Badge>
                {d.error && (
                  <p className="mt-1 text-destructive text-xs">{d.error}</p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(d.deployedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

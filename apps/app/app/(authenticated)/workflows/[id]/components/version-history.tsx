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
import type { WorkflowVersion } from "@/app/actions/workflows";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VersionHistory({
  versions,
  currentVersion,
}: {
  currentVersion: number;
  versions: WorkflowVersion[];
}) {
  if (versions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="font-semibold">Version History</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          No version history available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="mb-4 font-semibold">Version History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Change Note</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono">v{v.version}</span>
                  {v.version === currentVersion && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {v.changeNote || "No note"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(v.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

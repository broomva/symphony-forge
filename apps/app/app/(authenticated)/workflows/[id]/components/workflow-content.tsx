"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import type { WorkflowDetail } from "@/app/actions/workflows";

export function WorkflowContent({ workflow }: { workflow: WorkflowDetail }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Content</h3>
        <Badge variant="outline">v{workflow.version}</Badge>
      </div>
      <pre className="max-h-[500px] overflow-auto rounded-lg bg-muted p-4 font-mono text-sm">
        {workflow.content}
      </pre>
    </div>
  );
}

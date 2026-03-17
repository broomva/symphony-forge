"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { FileTextIcon } from "lucide-react";
import type { WorkflowSummary } from "@/app/actions/workflows";
import { CreateWorkflowDialog } from "./create-workflow-dialog";
import { WorkflowCard } from "./workflow-card";

export function WorkflowList({ workflows }: { workflows: WorkflowSummary[] }) {
  if (workflows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>No workflows</EmptyTitle>
          <EmptyDescription>
            Create your first WORKFLOW.md configuration to get started.
            Workflows define how Symphony agents process issues.
          </EmptyDescription>
        </EmptyHeader>
        <CreateWorkflowDialog />
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}

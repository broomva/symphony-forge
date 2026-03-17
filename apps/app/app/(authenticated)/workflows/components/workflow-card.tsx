"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/design-system/components/ui/alert-dialog";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import {
  FileTextIcon,
  GitBranchIcon,
  MoreVerticalIcon,
  RocketIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteWorkflow, type WorkflowSummary } from "@/app/actions/workflows";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WorkflowCard({ workflow }: { workflow: WorkflowSummary }) {
  const [isPending, startTransition] = useTransition();
  const [alertOpen, setAlertOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteWorkflow(workflow.id);
    });
  };

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between">
        <Link
          className="flex items-center gap-3 hover:opacity-80"
          href={`/workflows/${workflow.id}`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileTextIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{workflow.name}</h3>
            {workflow.description && (
              <p className="text-muted-foreground text-sm">
                {workflow.description}
              </p>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={workflow.isActive ? "default" : "outline"}>
            {workflow.isActive ? "Active" : "Inactive"}
          </Badge>
          <AlertDialog onOpenChange={setAlertOpen} open={alertOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8" size="icon" variant="ghost">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive"
                    disabled={isPending}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workflow</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &ldquo;{workflow.name}&rdquo;?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={isPending} onClick={handleDelete}>
                  {isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Versions</p>
          <p className="font-medium">{workflow._count.versions}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Deployments</p>
          <p className="font-medium">{workflow._count.deployments}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Updated</p>
          <p className="font-medium">{formatDate(workflow.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-muted-foreground text-xs">
        <span className="flex items-center gap-1">
          <GitBranchIcon className="h-3 w-3" />v{workflow.version}
        </span>
        {workflow._count.deployments > 0 && (
          <span className="flex items-center gap-1">
            <RocketIcon className="h-3 w-3" />
            {workflow._count.deployments} deployment
            {workflow._count.deployments === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}

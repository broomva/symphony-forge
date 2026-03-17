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
  ActivityIcon,
  MoreVerticalIcon,
  ServerIcon,
  TrashIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { deleteInstance, type InstanceSummary } from "@/app/actions/instances";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  provisioning: { label: "Provisioning", variant: "outline" },
  online: { label: "Online", variant: "default" },
  offline: { label: "Offline", variant: "destructive" },
  degraded: { label: "Degraded", variant: "secondary" },
  decommissioned: { label: "Decommissioned", variant: "outline" },
};

function formatDate(date: Date | null): string {
  if (!date) {
    return "Never";
  }
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InstanceCard({ instance }: { instance: InstanceSummary }) {
  const [isPending, startTransition] = useTransition();
  const [alertOpen, setAlertOpen] = useState(false);
  const config = statusConfig[instance.status] ?? statusConfig.offline;

  const handleDelete = () => {
    startTransition(async () => {
      await deleteInstance(instance.id);
    });
  };

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <ServerIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{instance.name}</h3>
            <p className="text-muted-foreground text-sm">
              {instance.host}:{instance.port}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.variant}>{config.label}</Badge>
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
                <AlertDialogTitle>Delete instance</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &ldquo;{instance.name}&rdquo;?
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
          <p className="text-muted-foreground">Runs</p>
          <p className="font-medium">{instance._count.runs}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Deployments</p>
          <p className="font-medium">{instance._count.deployments}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Last Check</p>
          <p className="font-medium">{formatDate(instance.lastHealthCheck)}</p>
        </div>
      </div>

      {instance.version && (
        <div className="mt-3 flex items-center gap-1.5 text-muted-foreground text-xs">
          <ActivityIcon className="h-3 w-3" />
          <span>v{instance.version}</span>
        </div>
      )}
    </div>
  );
}

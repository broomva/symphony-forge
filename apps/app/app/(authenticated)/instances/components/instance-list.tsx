"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { ServerIcon } from "lucide-react";
import type { InstanceSummary } from "@/app/actions/instances";
import { CreateInstanceDialog } from "./create-instance-dialog";
import { InstanceCard } from "./instance-card";

export function InstanceList({ instances }: { instances: InstanceSummary[] }) {
  if (instances.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ServerIcon />
          </EmptyMedia>
          <EmptyTitle>No instances</EmptyTitle>
          <EmptyDescription>
            Add a Symphony engine instance to get started. You can connect to an
            existing self-hosted instance or provision a new one.
          </EmptyDescription>
        </EmptyHeader>
        <CreateInstanceDialog />
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {instances.map((instance) => (
        <InstanceCard instance={instance} key={instance.id} />
      ))}
    </div>
  );
}

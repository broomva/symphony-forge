import { auth } from "@repo/auth/server";
import { Badge } from "@repo/design-system/components/ui/badge";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkflow } from "@/app/actions/workflows";
import { Header } from "../../components/header";
import { DeploymentHistory } from "./components/deployment-history";
import { VersionHistory } from "./components/version-history";
import { WorkflowContent } from "./components/workflow-content";

export const metadata: Metadata = {
  title: "Workflow Detail",
  description: "View workflow configuration, version history, and deployments",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const WorkflowDetailPage = async ({ params }: PageProps) => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const { id } = await params;
  const workflow = await getWorkflow(id);

  if (!workflow) {
    return notFound();
  }

  return (
    <>
      <Header page={workflow.name} pages={["Symphony Cloud", "Workflows"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-lg">{workflow.name}</h2>
              {workflow.description && (
                <p className="mt-1 text-muted-foreground text-sm">
                  {workflow.description}
                </p>
              )}
            </div>
            <Badge variant={workflow.isActive ? "default" : "outline"}>
              {workflow.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Current Version</p>
              <p className="font-medium">v{workflow.version}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Versions</p>
              <p className="font-medium">{workflow._count.versions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deployments</p>
              <p className="font-medium">{workflow._count.deployments}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(workflow.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <WorkflowContent workflow={workflow} />

        <div className="grid gap-4 lg:grid-cols-2">
          <VersionHistory
            currentVersion={workflow.version}
            versions={workflow.versions}
          />
          <DeploymentHistory deployments={workflow.deployments} />
        </div>
      </div>
    </>
  );
};

export default WorkflowDetailPage;

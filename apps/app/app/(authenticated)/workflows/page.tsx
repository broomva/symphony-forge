import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkflows } from "@/app/actions/workflows";
import { Header } from "../components/header";
import { CreateWorkflowDialog } from "./components/create-workflow-dialog";
import { WorkflowList } from "./components/workflow-list";

const title = "Workflows";
const description = "Manage WORKFLOW.md configurations for Symphony instances";

export const metadata: Metadata = {
  title,
  description,
};

const WorkflowsPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const workflows = await getWorkflows();

  return (
    <>
      <Header page="Workflows" pages={["Symphony Cloud"]}>
        <div className="pr-4">
          <CreateWorkflowDialog />
        </div>
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <WorkflowList workflows={workflows} />
      </div>
    </>
  );
};

export default WorkflowsPage;

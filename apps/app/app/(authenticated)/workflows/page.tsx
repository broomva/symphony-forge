import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../components/header";

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

  return (
    <>
      <Header page="Workflows" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Workflows</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage your WORKFLOW.md configurations here. Create, edit, and
            deploy workflows to Symphony instances.
          </p>
        </div>
      </div>
    </>
  );
};

export default WorkflowsPage;

import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../../components/header";

const title = "Edit Workflow";
const description = "Edit a WORKFLOW.md configuration";

export const metadata: Metadata = {
  title,
  description,
};

const EditWorkflowPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Edit" pages={["Symphony Cloud", "Workflows"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Edit Workflow</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Workflow editor with YAML syntax highlighting will be implemented
            here.
          </p>
        </div>
      </div>
    </>
  );
};

export default EditWorkflowPage;

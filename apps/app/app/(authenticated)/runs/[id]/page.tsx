import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../../components/header";

const title = "Run Detail";
const description = "Detailed view of a specific agent run";

export const metadata: Metadata = {
  title,
  description,
};

const RunDetailPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Detail" pages={["Symphony Cloud", "Runs"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Run Detail</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Detailed view of a specific run including sessions, token usage, and
            logs.
          </p>
        </div>
      </div>
    </>
  );
};

export default RunDetailPage;

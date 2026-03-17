import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../components/header";

const title = "Runs";
const description = "View historical agent run data";

export const metadata: Metadata = {
  title,
  description,
};

const RunsPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Runs" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Runs</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Historical run data with filtering. View completed, failed, and
            timed-out agent runs.
          </p>
        </div>
      </div>
    </>
  );
};

export default RunsPage;

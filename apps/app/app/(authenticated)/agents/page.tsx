import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../components/header";

const title = "Agents";
const description = "Monitor and manage running Symphony agents";

export const metadata: Metadata = {
  title,
  description,
};

const AgentsPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Agents" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Agents</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Running and retrying agents will appear here in real-time once a
            Symphony instance is connected.
          </p>
        </div>
      </div>
    </>
  );
};

export default AgentsPage;

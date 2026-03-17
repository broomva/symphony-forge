import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../components/header";

const title = "API Keys";
const description = "Manage external service API keys for Symphony instances";

export const metadata: Metadata = {
  title,
  description,
};

const ApiKeysPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="API Keys" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">API Keys</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage external service API keys (Linear, GitHub, etc.) for your
            Symphony instances.
          </p>
        </div>
      </div>
    </>
  );
};

export default ApiKeysPage;

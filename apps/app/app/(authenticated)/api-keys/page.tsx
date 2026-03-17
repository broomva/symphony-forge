import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApiKeys } from "@/app/actions/api-keys";
import { Header } from "../components/header";
import { ApiKeysClient } from "./client";

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

  const { data: keys } = await getApiKeys();

  return (
    <>
      <Header page="API Keys" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ApiKeysClient initialKeys={keys} />
      </div>
    </>
  );
};

export default ApiKeysPage;

import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../components/header";

const title = "Usage";
const description = "Token consumption and billing period usage";

export const metadata: Metadata = {
  title,
  description,
};

const UsagePage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Usage" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Usage</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Token consumption charts and billing period usage will be displayed
            here.
          </p>
        </div>
      </div>
    </>
  );
};

export default UsagePage;

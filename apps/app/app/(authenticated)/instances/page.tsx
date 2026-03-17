import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../components/header";

const title = "Instances";
const description = "Manage Symphony engine instances";

export const metadata: Metadata = {
  title,
  description,
};

const InstancesPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Instances" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="font-semibold">Instances</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage your Symphony engine instances. Add, remove, and monitor
            instance health.
          </p>
        </div>
      </div>
    </>
  );
};

export default InstancesPage;

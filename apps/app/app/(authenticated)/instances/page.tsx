import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstances } from "@/app/actions/instances";
import { Header } from "../components/header";
import { CreateInstanceDialog } from "./components/create-instance-dialog";
import { InstanceList } from "./components/instance-list";

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

  const instances = await getInstances();

  return (
    <>
      <Header page="Instances" pages={["Symphony Cloud"]}>
        <div className="pr-4">
          <CreateInstanceDialog />
        </div>
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <InstanceList instances={instances} />
      </div>
    </>
  );
};

export default InstancesPage;

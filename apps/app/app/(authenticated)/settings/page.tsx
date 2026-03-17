import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/app/actions/settings";
import { Header } from "../components/header";
import { SettingsClient } from "./client";

const title = "Settings";
const description = "Organization settings, billing plan, and preferences";

export const metadata: Metadata = {
  title,
  description,
};

const SettingsPage = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  const { data: settings } = await getSettings();

  if (!settings) {
    notFound();
  }

  return (
    <>
      <Header page="Settings" pages={["Symphony Cloud"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <SettingsClient initialSettings={settings} />
      </div>
    </>
  );
};

export default SettingsPage;

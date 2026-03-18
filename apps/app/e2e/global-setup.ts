import { clerkSetup } from "@clerk/testing/playwright";
import type { FullConfig } from "@playwright/test";

export default async function globalSetup(_config: FullConfig) {
  // @clerk/testing expects CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
  // but Next.js uses NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — bridge them
  if (
    !process.env.CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    process.env.CLERK_PUBLISHABLE_KEY =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  }

  await clerkSetup();
}

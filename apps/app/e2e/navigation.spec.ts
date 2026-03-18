import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

const SIGN_IN_PATTERN = /sign-in/;

test.describe("Navigation", () => {
  test("sign-in page has Sign up link", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/sign-in");
    await page.waitForSelector("text=Email address", { timeout: 15_000 });
    await expect(page.locator("text=Sign up").first()).toBeVisible();
  });

  test("authenticated pages redirect unauthenticated users", async ({
    page,
  }) => {
    await setupClerkTestingToken({ page });
    const protectedPages = ["/instances", "/settings", "/api-keys"];
    for (const path of protectedPages) {
      await page.goto(path);
      await page.waitForURL(SIGN_IN_PATTERN, { timeout: 15_000 });
      expect(page.url()).toContain("/sign-in");
    }
  });
});

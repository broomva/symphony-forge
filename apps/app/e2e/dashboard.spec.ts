import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

const SIGN_IN_PATTERN = /sign-in/;

test.describe("Dashboard", () => {
  test("root page does not return 500 error", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/");
    await page.waitForTimeout(3000);
    const body = await page.textContent("body");
    expect(body).not.toContain("Internal Server Error");
  });

  test("unauthenticated root redirects to sign-in", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/");
    await page.waitForURL(SIGN_IN_PATTERN, { timeout: 15_000 });
    expect(page.url()).toContain("/sign-in");
  });
});

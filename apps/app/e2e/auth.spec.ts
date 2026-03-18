import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

const SIGN_IN_PATTERN = /sign-in/;

test.describe("Authentication", () => {
  test("sign-in page loads with Clerk component", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/sign-in");
    await page.waitForSelector("text=Email address", { timeout: 15_000 });
    const heading = page.locator("h1");
    await expect(heading).toContainText("Sign in", { timeout: 5000 });
  });

  test("unauthenticated access redirects to sign-in", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/");
    await page.waitForURL(SIGN_IN_PATTERN, { timeout: 15_000 });
    expect(page.url()).toContain("/sign-in");
  });

  test("sign-in page shows Google OAuth option", async ({ page }) => {
    await setupClerkTestingToken({ page });
    await page.goto("/sign-in");
    await page.waitForSelector("text=Email address", { timeout: 15_000 });
    await expect(page.locator("text=Google").first()).toBeVisible();
  });
});

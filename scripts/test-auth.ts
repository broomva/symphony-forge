/**
 * Creates a Clerk test user and generates a testing token for E2E testing.
 *
 * Usage:
 *   bun run scripts/test-auth.ts
 *
 * Requires CLERK_SECRET_KEY in apps/app/.env.local
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClerkClient } from "@clerk/backend";

// Load env from apps/app/.env.local
config({ path: resolve(__dirname, "../apps/app/.env.local") });

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) {
  console.error("CLERK_SECRET_KEY is not set. Add it to apps/app/.env.local");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });

async function main() {
  // 1. Create a testing token (bypasses CAPTCHA/bot detection)
  const testingToken = await clerk.testingTokens.createTestingToken();
  console.log("Testing Token:", testingToken.token);

  // 2. Find or create a test user
  const testEmail = "test@symphony-cloud.dev";
  const testPassword = "Symph0ny!Cl0ud#2026xQ";
  const users = await clerk.users.getUserList({
    emailAddress: [testEmail],
  });

  let user;
  if (users.data.length > 0) {
    user = users.data[0];
    // Update password to the new one
    await clerk.users.updateUser(user.id, {
      password: testPassword,
      skipPasswordChecks: true,
    });
    console.log("Found existing test user:", user.id, "(password updated)");
  } else {
    try {
      user = await clerk.users.createUser({
        emailAddress: [testEmail],
        password: testPassword,
        firstName: "Test",
        lastName: "User",
        skipPasswordChecks: true,
      });
      console.log("Created test user:", user.id);
    } catch (e: any) {
      console.log("User creation error:", e.errors?.[0]?.message || e.message);
      console.log("Trying with a different email...");
      const altEmail = `test+${Date.now()}@symphony-cloud.dev`;
      user = await clerk.users.createUser({
        emailAddress: [altEmail],
        password: testPassword,
        firstName: "Test",
        lastName: "User",
        skipPasswordChecks: true,
      });
      console.log("Created test user:", user.id, "with email:", altEmail);
    }
  }

  // 3. Output instructions
  console.log("\n--- E2E Testing Setup ---");
  console.log(`Testing Token: ${testingToken.token}`);
  console.log(`User Email: ${testEmail}`);
  console.log(`User Password: ${testPassword}`);
  console.log(`Token expires: ${testingToken.expiresAt}`);
  console.log(
    "\nAppend ?__clerk_testing_token=<token> to bypass bot detection."
  );
}

main().catch(console.error);

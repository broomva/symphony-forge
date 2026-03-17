/**
 * Creates a Clerk sign-in session via Backend API and outputs the session token.
 * This bypasses all UI, CAPTCHA, and OTP requirements.
 *
 * Usage: bun run scripts/test-signin.ts
 */

import { resolve } from "node:path";
import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";

config({ path: resolve(import.meta.dirname, "../apps/app/.env.local") });

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) {
  console.error("CLERK_SECRET_KEY is not set");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });

async function main() {
  const testEmail = "test@symphony-cloud.dev";

  // Find the user
  const users = await clerk.users.getUserList({ emailAddress: [testEmail] });
  if (users.data.length === 0) {
    console.error("Test user not found. Run test-auth.ts first.");
    process.exit(1);
  }

  const user = users.data[0];
  console.log("User:", user.id, user.emailAddresses[0]?.emailAddress);

  // Create a session for the user via Backend API
  // Note: This requires using the signIn flow or impersonation
  // Let's use the Backend API to get a sign-in token
  const signInToken = await clerk.signInTokens.createSignInToken({
    userId: user.id,
    expiresInSeconds: 300,
  });

  console.log("\n--- Sign-in Token ---");
  console.log(`Token: ${signInToken.token}`);
  console.log(`URL: ${signInToken.url}`);
  console.log(
    "\nOpen this URL in the browser to sign in without password/OTP:"
  );
  console.log(signInToken.url);
}

main().catch(console.error);

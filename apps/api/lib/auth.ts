import { auth } from "@repo/auth/server";
import { NextResponse } from "next/server";

export interface AuthContext {
  orgId: string;
  userId: string;
}

/**
 * Authenticate a v1 API request using Clerk.
 * Returns the org/user context or a JSON error response.
 */
export async function authenticateRequest(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  const { orgId, userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Not authenticated", code: "UNAUTHORIZED", status: 401 },
        { status: 401 }
      ),
    };
  }

  if (!orgId) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          message: "No organization selected",
          code: "NO_ORGANIZATION",
          status: 403,
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, ctx: { orgId, userId } };
}

/**
 * Standard JSON error response.
 */
export function apiError(
  message: string,
  code: string,
  status: number
): NextResponse {
  return NextResponse.json({ message, code, status }, { status });
}

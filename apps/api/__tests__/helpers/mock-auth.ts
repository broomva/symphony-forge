import { type Mock, vi } from "vitest";

// Mock authenticateRequest to return a successful auth context
export function mockAuth(orgId = "org_test123", userId = "user_test456"): Mock {
  return vi.fn().mockResolvedValue({
    ok: true as const,
    ctx: { orgId, userId },
  });
}

// Mock authenticateRequest to return unauthorized
export function mockAuthUnauthorized(): Mock {
  const { NextResponse } = require("next/server");
  return vi.fn().mockResolvedValue({
    ok: false as const,
    response: NextResponse.json(
      { message: "Not authenticated", code: "UNAUTHORIZED", status: 401 },
      { status: 401 }
    ),
  });
}

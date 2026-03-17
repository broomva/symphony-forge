import { afterEach, describe, expect, type Mock, test, vi } from "vitest";

// Mock the Clerk auth module before importing the code under test
vi.mock("@repo/auth/server", () => ({
  auth: vi.fn(),
}));

// Mock server-only (it's a no-op guard that fails outside Next.js)
vi.mock("server-only", () => ({}));

import { auth } from "@repo/auth/server";
import { apiError, authenticateRequest } from "../lib/auth";

const mockAuth = auth as unknown as Mock;

describe("authenticateRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns ok:true with valid orgId and userId", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_abc",
      userId: "user_xyz",
    });

    const result = await authenticateRequest();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ctx.orgId).toBe("org_abc");
      expect(result.ctx.userId).toBe("user_xyz");
    }
  });

  test("returns 401 when userId is null", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_abc",
      userId: null,
    });

    const result = await authenticateRequest();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      const body = await result.response.json();
      expect(body.code).toBe("UNAUTHORIZED");
      expect(body.message).toBe("Not authenticated");
    }
  });

  test("returns 403 when orgId is null", async () => {
    mockAuth.mockResolvedValue({
      orgId: null,
      userId: "user_xyz",
    });

    const result = await authenticateRequest();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      const body = await result.response.json();
      expect(body.code).toBe("NO_ORGANIZATION");
      expect(body.message).toBe("No organization selected");
    }
  });
});

describe("apiError", () => {
  test("returns NextResponse with correct status and JSON body", async () => {
    const response = apiError("Something went wrong", "INTERNAL_ERROR", 500);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      message: "Something went wrong",
      code: "INTERNAL_ERROR",
      status: 500,
    });
  });

  test("returns 400 for bad request", async () => {
    const response = apiError("Invalid input", "BAD_REQUEST", 400);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe("BAD_REQUEST");
  });

  test("returns 404 for not found", async () => {
    const response = apiError("Resource not found", "NOT_FOUND", 404);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toBe("Resource not found");
  });
});

import { describe, expect, it, type Mock, vi } from "vitest";

// Mock dependencies before imports
vi.mock("@repo/database", () => ({
  database: {
    symphonyInstance: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    organizationSettings: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@repo/auth/server", () => ({
  auth: vi.fn(),
}));

vi.mock("../lib/crypto", () => ({
  encrypt: vi.fn((val: string) => `encrypted:${val}`),
  decrypt: vi.fn((val: string) => val.replace("encrypted:", "")),
}));

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";

const mockAuth = auth as unknown as Mock;
const mockFindMany = database.symphonyInstance.findMany as Mock;
const mockFindFirst = database.symphonyInstance.findFirst as Mock;
const mockCreate = database.symphonyInstance.create as Mock;
const mockUpdate = database.symphonyInstance.update as Mock;
const mockCount = database.symphonyInstance.count as Mock;
const mockSettingsFindUnique = database.organizationSettings.findUnique as Mock;
const mockAuditCreate = database.auditLog.create as Mock;

describe("GET /v1/instances", () => {
  it("returns instances for the authenticated org", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_test",
      userId: "user_test",
    });
    mockFindMany.mockResolvedValue([
      {
        id: "inst_1",
        name: "prod-01",
        host: "example.com",
        port: 443,
        status: "online",
      },
    ]);

    const { GET } = await import("../app/v1/instances/route");
    const request = new Request("http://localhost:3002/v1/instances");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("prod-01");
    expect(body.count).toBe(1);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ orgId: null, userId: null });

    const { GET } = await import("../app/v1/instances/route");
    const request = new Request("http://localhost:3002/v1/instances");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("returns 403 when no org selected", async () => {
    mockAuth.mockResolvedValue({ orgId: null, userId: "user_test" });

    const { GET } = await import("../app/v1/instances/route");
    const request = new Request("http://localhost:3002/v1/instances");
    const response = await GET(request);

    expect(response.status).toBe(403);
  });
});

describe("POST /v1/instances", () => {
  it("creates an instance with valid data", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_test",
      userId: "user_test",
    });
    mockSettingsFindUnique.mockResolvedValue({ maxInstances: 5 });
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: "inst_new",
      name: "staging",
      host: "staging.example.com",
      port: 443,
    });
    mockAuditCreate.mockResolvedValue({});

    const { POST } = await import("../app/v1/instances/route");
    const request = new Request("http://localhost:3002/v1/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "staging",
        host: "staging.example.com",
        port: 443,
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockAuditCreate).toHaveBeenCalledOnce();
  });

  it("rejects invalid body", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_test",
      userId: "user_test",
    });

    const { POST } = await import("../app/v1/instances/route");
    const request = new Request("http://localhost:3002/v1/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("enforces instance limit", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_test",
      userId: "user_test",
    });
    mockSettingsFindUnique.mockResolvedValue({ maxInstances: 1 });
    mockCount.mockResolvedValue(1);

    const { POST } = await import("../app/v1/instances/route");
    const request = new Request("http://localhost:3002/v1/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "over-limit",
        host: "example.com",
        port: 443,
      }),
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.code).toBe("INSTANCE_LIMIT");
  });

  it("encrypts API token when provided", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_test",
      userId: "user_test",
    });
    mockSettingsFindUnique.mockResolvedValue({ maxInstances: 5 });
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({ id: "inst_new" });
    mockAuditCreate.mockResolvedValue({});

    const { POST } = await import("../app/v1/instances/route");
    const request = new Request("http://localhost:3002/v1/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "with-token",
        host: "example.com",
        port: 443,
        apiToken: "secret-token-123",
      }),
    });
    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          apiToken: "encrypted:secret-token-123",
        }),
      })
    );
  });
});

describe("DELETE /v1/instances/:id", () => {
  it("soft-deletes an owned instance", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_test",
      userId: "user_test",
    });
    mockFindFirst.mockResolvedValue({
      id: "inst_1",
      organizationId: "org_test",
    });
    mockUpdate.mockResolvedValue({});
    mockAuditCreate.mockResolvedValue({});

    const { DELETE } = await import("../app/v1/instances/[id]/route");
    const request = new Request("http://localhost:3002/v1/instances/inst_1", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "inst_1" }),
    });

    expect(response.status).toBe(204);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "decommissioned",
        }),
      })
    );
  });

  it("returns 404 for non-existent instance", async () => {
    mockAuth.mockResolvedValue({
      orgId: "org_test",
      userId: "user_test",
    });
    mockFindFirst.mockResolvedValue(null);

    const { DELETE } = await import("../app/v1/instances/[id]/route");
    const request = new Request(
      "http://localhost:3002/v1/instances/nonexistent",
      { method: "DELETE" }
    );
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
  });
});

import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be set up before importing the code under test
// ---------------------------------------------------------------------------

// Mock server-only (no-op guard that fails outside Next.js)
vi.mock("server-only", () => ({}));

// Mock @repo/database
const mockFindMany = vi.fn();
const mockUpdate = vi.fn();
vi.mock("@repo/database", () => ({
  database: {
    symphonyInstance: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Mock SymphonyClient from @repo/symphony-client using a class
const mockIsHealthy = vi.fn();
const mockIsReady = vi.fn();
const mockGetState = vi.fn();

vi.mock("@repo/symphony-client", () => {
  return {
    SymphonyClient: class MockSymphonyClient {
      isHealthy = mockIsHealthy;
      isReady = mockIsReady;
      getState = mockGetState;
    },
  };
});

import { runHealthChecks } from "../lib/monitoring";

describe("monitoring – runHealthChecks", () => {
  beforeEach(() => {
    // Set a valid encryption key so decrypt() won't fail
    process.env.ENCRYPTION_KEY = randomBytes(32).toString("base64");
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    // biome-ignore lint/performance/noDelete: must truly remove env var
    delete process.env.ENCRYPTION_KEY;
  });

  test("empty instance list returns []", async () => {
    mockFindMany.mockResolvedValue([]);

    const results = await runHealthChecks();

    expect(results).toEqual([]);
    expect(mockFindMany).toHaveBeenCalledOnce();
  });

  test("healthy and ready instance gets status 'online'", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "inst_1",
        name: "prod-1",
        host: "engine.example.com",
        port: 443,
        apiToken: null,
        status: "offline",
      },
    ]);

    mockIsHealthy.mockResolvedValue(true);
    mockIsReady.mockResolvedValue(true);
    mockGetState.mockResolvedValue({
      counts: { running: 5, retrying: 1 },
      codex_totals: { total_tokens: 1000, seconds_running: 3600 },
    });

    const results = await runHealthChecks();

    expect(results).toHaveLength(1);
    expect(results[0].newStatus).toBe("online");
    expect(results[0].previousStatus).toBe("offline");
    expect(results[0].healthy).toBe(true);
    expect(results[0].ready).toBe(true);
    expect(results[0].metrics).toEqual({
      running: 5,
      retrying: 1,
      totalTokens: 1000,
      secondsRunning: 3600,
    });

    // Should update status in DB since it changed from offline to online
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inst_1" },
        data: expect.objectContaining({ status: "online" }),
      })
    );
  });

  test("unreachable instance gets status 'offline'", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "inst_2",
        name: "staging-1",
        host: "staging.example.com",
        port: 443,
        apiToken: null,
        status: "online",
      },
    ]);

    mockIsHealthy.mockRejectedValue(new Error("Connection refused"));
    mockIsReady.mockRejectedValue(new Error("Connection refused"));

    const results = await runHealthChecks();

    expect(results).toHaveLength(1);
    expect(results[0].newStatus).toBe("offline");
    expect(results[0].previousStatus).toBe("online");
    expect(results[0].healthy).toBe(false);
    expect(results[0].ready).toBe(false);
    expect(results[0].error).toBeDefined();

    // Should update status in DB since it changed from online to offline
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inst_2" },
        data: expect.objectContaining({ status: "offline" }),
      })
    );
  });

  test("healthy but not ready instance gets status 'degraded'", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "inst_3",
        name: "prod-2",
        host: "engine2.example.com",
        port: 443,
        apiToken: null,
        status: "online",
      },
    ]);

    mockIsHealthy.mockResolvedValue(true);
    mockIsReady.mockResolvedValue(false);

    const results = await runHealthChecks();

    expect(results).toHaveLength(1);
    expect(results[0].newStatus).toBe("degraded");
    expect(results[0].healthy).toBe(true);
    expect(results[0].ready).toBe(false);
  });

  test("decommissioned instance stays decommissioned", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "inst_4",
        name: "retired-1",
        host: "old.example.com",
        port: 443,
        apiToken: null,
        status: "decommissioned",
      },
    ]);

    mockIsHealthy.mockResolvedValue(true);
    mockIsReady.mockResolvedValue(true);
    mockGetState.mockResolvedValue({
      counts: { running: 0, retrying: 0 },
      codex_totals: { total_tokens: 0, seconds_running: 0 },
    });

    const results = await runHealthChecks();

    expect(results).toHaveLength(1);
    expect(results[0].newStatus).toBe("decommissioned");
  });

  test("status unchanged still updates lastHealthCheck", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "inst_5",
        name: "stable-1",
        host: "stable.example.com",
        port: 443,
        apiToken: null,
        status: "online",
      },
    ]);

    mockIsHealthy.mockResolvedValue(true);
    mockIsReady.mockResolvedValue(true);
    mockGetState.mockResolvedValue({
      counts: { running: 2, retrying: 0 },
      codex_totals: { total_tokens: 500, seconds_running: 1800 },
    });

    const results = await runHealthChecks();

    expect(results).toHaveLength(1);
    expect(results[0].newStatus).toBe("online");
    expect(results[0].previousStatus).toBe("online");

    // Should still call update for lastHealthCheck even though status didn't change
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inst_5" },
        data: expect.objectContaining({ lastHealthCheck: expect.any(Date) }),
      })
    );
  });
});

/**
 * Shared types for Symphony Cloud server actions.
 *
 * These interfaces provide explicit return-type contracts consumed by
 * dashboard pages and API routes.  Where practical the shapes mirror
 * Prisma's generated types so the compiler catches schema drift.
 */

import type {
  ApiKeyService,
  BillingPlan,
  RunStatus,
  SessionStatus,
} from "@repo/database";

// ─── Generic wrappers ───────────────────────────────────────

/** Discriminated-union result type for mutating server actions. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Cursor-based pagination envelope returned by list endpoints. */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    nextCursor: string | undefined;
    hasMore: boolean;
  };
}

// ─── Runs ───────────────────────────────────────────────────

export interface RunInstanceRef {
  id: string;
  name: string;
}

export interface RunSummary {
  attempt: number;
  completedAt: Date | null;
  createdAt: Date;
  durationMs: number | null;
  error: string | null;
  id: string;
  inputTokens: bigint;
  instance: RunInstanceRef;
  instanceId: string;
  issueId: string;
  issueIdentifier: string;
  issueTitle: string | null;
  issueUrl: string | null;
  metadata: unknown;
  organizationId: string;
  outputTokens: bigint;
  startedAt: Date;
  status: RunStatus;
  totalTokens: bigint;
  updatedAt: Date;
}

export interface SessionSummary {
  completedAt: Date | null;
  createdAt: Date;
  error: string | null;
  id: string;
  inputTokens: bigint;
  lastEvent: string | null;
  lastEventAt: Date | null;
  lastMessage: string | null;
  outputTokens: bigint;
  runId: string;
  sessionId: string;
  startedAt: Date;
  status: SessionStatus;
  threadId: string | null;
  totalTokens: bigint;
  turnCount: number;
  turnId: string | null;
  updatedAt: Date;
}

export interface RunDetailInstance {
  host: string;
  id: string;
  name: string;
}

export interface RunDetail {
  attempt: number;
  completedAt: Date | null;
  createdAt: Date;
  durationMs: number | null;
  error: string | null;
  id: string;
  inputTokens: bigint;
  instance: RunDetailInstance;
  instanceId: string;
  issueId: string;
  issueIdentifier: string;
  issueTitle: string | null;
  issueUrl: string | null;
  metadata: unknown;
  organizationId: string;
  outputTokens: bigint;
  sessions: SessionSummary[];
  startedAt: Date;
  status: RunStatus;
  totalTokens: bigint;
  updatedAt: Date;
}

// ─── API Keys ───────────────────────────────────────────────

export interface ApiKeySummary {
  createdAt: Date;
  createdBy: string;
  expiresAt: Date | null;
  id: string;
  keyPrefix: string | null;
  lastUsedAt: Date | null;
  maskedKey: string;
  name: string;
  service: ApiKeyService;
  updatedAt: Date;
}

// ─── Usage ──────────────────────────────────────────────────

export interface UsagePeriod {
  end: string;
  start: string;
}

export interface UsageTotals {
  agentSeconds: number;
  inputTokens: number;
  outputTokens: number;
  peakConcurrent: number;
  runCount: number;
  totalTokens: number;
}

export interface UsageRecord {
  agentSeconds: number;
  createdAt: Date;
  id: string;
  inputTokens: bigint;
  organizationId: string;
  outputTokens: bigint;
  peakConcurrent: number;
  periodEnd: Date;
  periodStart: Date;
  reportedToStripe: boolean;
  runCount: number;
  stripeUsageRecordId: string | null;
  totalTokens: bigint;
  updatedAt: Date;
}

export interface UsageData {
  period: UsagePeriod;
  records: UsageRecord[];
  totals: UsageTotals;
}

// ─── Organization Settings ──────────────────────────────────

export interface OrgSettings {
  billingPlan: BillingPlan;
  createdAt: Date;
  id: string;
  maxConcurrentAgents: number;
  maxInstances: number;
  organizationId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: Date;
}

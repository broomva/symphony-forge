// ---------------------------------------------------------------------------
// Symphony Engine API — TypeScript type definitions
// Mirrors the Rust engine's HTTP API response shapes.
// ---------------------------------------------------------------------------

/** Token counts for a single session or run. */
export interface TokenInfo {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

/** Aggregate totals across all codex operations. */
export interface CodexTotalsInfo {
  input_tokens: number;
  output_tokens: number;
  seconds_running: number;
  total_tokens: number;
}

/** An issue (agent) that is currently running. */
export interface RunningInfo {
  identifier: string;
  issue_id: string;
  session_id?: string;
  started_at: string;
  state: string;
  tokens: TokenInfo;
  turn_count: number;
}

/** An issue (agent) that is waiting to be retried. */
export interface RetryingInfo {
  attempt: number;
  due_at_ms: number;
  error?: string;
  identifier: string;
  issue_id: string;
}

/** Top-level state summary returned by GET /api/v1/state. */
export interface StateSummary {
  codex_totals: CodexTotalsInfo;
  counts: {
    running: number;
    retrying: number;
  };
  generated_at: string;
  rate_limits: Record<string, unknown>;
  retrying: RetryingInfo[];
  running: RunningInfo[];
}

// ---------------------------------------------------------------------------
// Issue detail — returned by GET /api/v1/{identifier}
// ---------------------------------------------------------------------------

/** Detail payload when the issue is in a running state. */
export interface IssueRunningDetail {
  identifier: string;
  issue_id: string;
  session_id?: string;
  started_at: string;
  state: string;
  status: "running";
  tokens: TokenInfo;
  turn_count: number;
}

/** Detail payload when the issue is in a retrying state. */
export interface IssueRetryingDetail {
  attempt: number;
  due_at_ms: number;
  error?: string;
  identifier: string;
  issue_id: string;
  status: "retrying";
}

/** Union of all possible issue detail shapes. */
export type IssueDetail = IssueRunningDetail | IssueRetryingDetail;

// ---------------------------------------------------------------------------
// Workspaces — returned by GET /api/v1/workspaces
// ---------------------------------------------------------------------------

/** A single workspace entry. */
export interface WorkspaceEntry {
  name: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Action responses
// ---------------------------------------------------------------------------

/** Response from POST /api/v1/refresh. */
export interface RefreshResponse {
  coalesced: number;
  operations: string[];
  queued: number;
  requested_at: string;
}

/** Response from POST /api/v1/shutdown. */
export interface ShutdownResponse {
  requested_at: string;
  shutdown: boolean;
}

// ---------------------------------------------------------------------------
// Error envelope — standard error shape from the engine
// ---------------------------------------------------------------------------

/** Standard error response wrapper. */
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

/** Configuration for constructing a SymphonyClient instance. */
export interface SymphonyClientConfig {
  /** Optional bearer token for Authorization header. */
  apiToken?: string;
  /** Base URL of the Symphony engine (e.g. "http://localhost:3001"). */
  baseUrl: string;

  /**
   * Optional custom fetch implementation.
   * Useful for testing or environments that need a polyfill.
   */
  fetch?: typeof globalThis.fetch;

  /** Number of retries on transient errors (502/503/504). Default: 2. */
  retries?: number;

  /** Request timeout in milliseconds. Default: 10 000. */
  timeoutMs?: number;
}

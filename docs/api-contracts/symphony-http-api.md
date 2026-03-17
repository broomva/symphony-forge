---
title: "Symphony Engine HTTP API"
type: api-contract
domain: symphony-client
phase: 1
status: active
tags:
  - domain/symphony-client
  - phase/1
  - status/active
  - type/api-contract
---

# Symphony Engine HTTP API

> [!context]
> This documents the HTTP API exposed by the Symphony engine (Rust). Symphony Cloud communicates with engine instances via this API. The engine source lives at `/Users/broomva/symphony`.

## Base URL

Each Symphony instance exposes its API at `http://{host}:{port}`. The default port is typically `8080`.

## Authentication

Requests may include an `Authorization: Bearer {token}` header when the engine is configured with an API token.

## Endpoints

### GET /api/v1/state

Returns a summary of the current orchestrator state, including running agents, retrying agents, token consumption, and codex totals.

**Response**: `200 OK`

```typescript
interface StateSummary {
  running: RunningInfo[];
  retrying: RetryingInfo[];
  tokens: TokenInfo;
  codex_totals: CodexTotals;
}

interface RunningInfo {
  identifier: string;
  workspace: string;
  started_at: string; // ISO 8601
  tokens_used: number;
  session_id: string;
  turn_count: number;
}

interface RetryingInfo {
  identifier: string;
  workspace: string;
  retry_count: number;
  last_error: string;
  next_retry_at: string; // ISO 8601
}

interface TokenInfo {
  total_input: number;
  total_output: number;
  total_combined: number;
  period_start: string; // ISO 8601
}

interface CodexTotals {
  completions: number;
  failures: number;
  avg_tokens_per_completion: number;
}
```

**Example**:
```json
{
  "running": [
    {
      "identifier": "ISSUE-123",
      "workspace": "/workspaces/my-repo",
      "started_at": "2026-03-16T10:00:00Z",
      "tokens_used": 15420,
      "session_id": "sess_abc123",
      "turn_count": 5
    }
  ],
  "retrying": [],
  "tokens": {
    "total_input": 1200000,
    "total_output": 340000,
    "total_combined": 1540000,
    "period_start": "2026-03-01T00:00:00Z"
  },
  "codex_totals": {
    "completions": 142,
    "failures": 3,
    "avg_tokens_per_completion": 10845
  }
}
```

---

### GET /api/v1/{identifier}

Returns detailed information about a specific issue/agent by its identifier.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `identifier` | string | Issue ID or agent identifier (e.g., `ISSUE-123`) |

**Response**: `200 OK`

```typescript
interface IssueDetail {
  identifier: string;
  workspace: string;
  status: "running" | "completed" | "failed" | "retrying" | "queued";
  started_at: string;
  completed_at?: string;
  tokens_used: number;
  sessions: SessionInfo[];
  error?: string;
}

interface SessionInfo {
  session_id: string;
  turn_count: number;
  tokens: number;
  status: "active" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
}
```

**Error Responses**:
- `404 Not Found` -- identifier does not match any known issue

---

### GET /api/v1/workspaces

Returns a list of workspaces the engine is managing.

**Response**: `200 OK`

```typescript
interface WorkspaceEntry {
  path: string;
  name: string;
  active_agents: number;
  total_runs: number;
}
```

---

### POST /api/v1/refresh

Triggers the engine to poll for new issues and update its state.

**Request Body**: None

**Response**: `200 OK`

```typescript
interface RefreshResponse {
  refreshed: boolean;
  new_issues: number;
  timestamp: string; // ISO 8601
}
```

---

### POST /api/v1/shutdown

Initiates a graceful shutdown of the engine. Running agents will complete their current turn before stopping.

**Request Body**: None

**Response**: `200 OK`

```typescript
interface ShutdownResponse {
  accepted: boolean;
  running_agents: number;
  estimated_completion_seconds: number;
}
```

> [!warning]
> This endpoint initiates shutdown of the entire engine instance. Use with caution. The control plane should confirm with the user before calling this endpoint.

---

### GET /healthz

Liveness probe. Returns `200 OK` if the process is alive.

**Response**: `200 OK`

```json
{ "status": "ok" }
```

---

### GET /readyz

Readiness probe. Returns `200 OK` if the engine is ready to accept work.

**Response**: `200 OK`

```json
{ "status": "ready" }
```

**Response**: `503 Service Unavailable` (if not ready)

```json
{ "status": "not_ready", "reason": "initializing" }
```

## Error Format

All error responses follow a consistent format:

```typescript
interface EngineError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Resource not found |
| 500 | Internal engine error |
| 502 | Engine backend unavailable |
| 503 | Engine not ready |

## Client Implementation

The `@repo/symphony-client` package (planned, Phase 2) will provide a type-safe client for this API with:
- Typed request/response interfaces
- Retry with exponential backoff on 502/503/504
- 10-second default timeout
- Custom error hierarchy (`SymphonyError`, `ConnectionError`, `AuthError`, `NotFoundError`, `TimeoutError`)

See [[api-contracts/control-plane-api]] for how the control plane proxies these endpoints.

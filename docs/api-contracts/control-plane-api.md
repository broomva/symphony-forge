---
title: "Control Plane REST API"
type: api-contract
domain: api
phase: 1
status: active
tags:
  - domain/api
  - phase/1
  - status/active
  - type/api-contract
---

# Control Plane REST API

> [!context]
> The control plane API lives in `apps/api` and provides the REST interface that the dashboard (`apps/app`) consumes. It mediates between the frontend and both the database (Neon) and Symphony engine instances.

## Base URL

- **Development**: `http://localhost:3002`
- **Production**: `https://api.symphonycloud.dev` (planned)

## Authentication

All `/v1/*` routes require a valid Clerk session. The request must include:
- A valid Clerk JWT in the `Authorization: Bearer {token}` header
- The JWT must contain an `org_id` claim (user must have selected an organization)

## Endpoints

### Instances

#### GET /v1/instances

List all Symphony instances for the current organization.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | -- | Filter by status: `provisioning`, `running`, `stopped`, `error` |

**Response**: `200 OK`

```typescript
interface InstanceListResponse {
  data: SymphonyInstance[];
  count: number;
}

interface SymphonyInstance {
  id: string;
  organizationId: string;
  name: string;
  host: string;
  port: number;
  status: "provisioning" | "running" | "stopped" | "error";
  createdAt: string;
  updatedAt: string;
}
```

#### POST /v1/instances

Register a new Symphony instance.

**Request Body**:
```typescript
{
  name: string;
  host: string;
  port: number;
  apiToken?: string;
}
```

**Response**: `201 Created` -- Returns the created `SymphonyInstance`.

#### GET /v1/instances/{id}

Get a specific instance by ID.

**Response**: `200 OK` -- Returns `SymphonyInstance`.

#### PATCH /v1/instances/{id}

Update instance configuration.

**Request Body**: Partial `{ name, host, port, apiToken }`.

**Response**: `200 OK` -- Returns updated `SymphonyInstance`.

#### DELETE /v1/instances/{id}

Soft-delete an instance.

**Response**: `204 No Content`.

#### GET /v1/instances/{id}/state

Proxy to the Symphony engine's `GET /api/v1/state` endpoint.

**Response**: `200 OK` -- Returns `StateSummary` from the engine. See [[api-contracts/symphony-http-api]].

#### POST /v1/instances/{id}/refresh

Proxy to the Symphony engine's `POST /api/v1/refresh` endpoint.

**Response**: `200 OK` -- Returns `RefreshResponse` from the engine.

---

### Workflows

#### GET /v1/workflows

List workflows for the current organization.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `active` | boolean | -- | Filter by `isActive` |

**Response**: `200 OK`

```typescript
interface WorkflowListResponse {
  data: Workflow[];
  count: number;
}

interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### POST /v1/workflows

Create a new workflow.

**Request Body**:
```typescript
{
  name: string;
  content: string;
}
```

**Response**: `201 Created`.

#### GET /v1/workflows/{id}

Get workflow detail, including version history.

**Response**: `200 OK`

```typescript
interface WorkflowDetailResponse extends Workflow {
  versions: WorkflowVersion[];
}
```

#### PATCH /v1/workflows/{id}

Update a workflow. Creates a new version automatically.

**Request Body**:
```typescript
{
  name?: string;
  content?: string;
  changeNote?: string;
}
```

**Response**: `200 OK`.

#### DELETE /v1/workflows/{id}

Soft-delete a workflow.

**Response**: `204 No Content`.

#### POST /v1/workflows/{id}/deploy

Deploy a workflow to a specific instance.

**Request Body**:
```typescript
{
  instanceId: string;
  version?: number; // defaults to latest
}
```

**Response**: `200 OK`

```typescript
interface DeployResponse {
  deploymentId: string;
  success: boolean;
  version: number;
}
```

---

### Runs

#### GET /v1/runs

List runs for the current organization with pagination.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | -- | Filter by status |
| `instanceId` | string | -- | Filter by instance |

**Response**: `200 OK`

```typescript
interface RunListResponse {
  data: Run[];
  count: number;
  page: number;
  totalPages: number;
}

interface Run {
  id: string;
  organizationId: string;
  instanceId: string;
  issueId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  tokens: bigint;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}
```

#### GET /v1/runs/{id}

Get run detail with sessions.

**Response**: `200 OK`

```typescript
interface RunDetailResponse extends Run {
  sessions: Session[];
}
```

---

### API Keys

#### GET /v1/api-keys

List API keys for the current organization (keys are masked).

**Response**: `200 OK`

```typescript
interface ApiKeyListResponse {
  data: ApiKeyInfo[];
}

interface ApiKeyInfo {
  id: string;
  service: "openai" | "anthropic" | "github" | "custom";
  maskedKey: string; // e.g., "sk-...abc123"
  createdAt: string;
}
```

#### POST /v1/api-keys

Store a new encrypted API key.

**Request Body**:
```typescript
{
  service: "openai" | "anthropic" | "github" | "custom";
  key: string;
}
```

**Response**: `201 Created`.

> [!warning]
> API keys are encrypted at rest. The plaintext key is never returned after creation.

#### DELETE /v1/api-keys/{id}

Revoke and delete an API key.

**Response**: `204 No Content`.

---

### Usage

#### GET /v1/usage

Get usage statistics for the current billing period.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | current | `current`, `previous`, or ISO date range |

**Response**: `200 OK`

```typescript
interface UsageResponse {
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  tokens: bigint;
  agentSeconds: number;
  runCount: number;
  activeInstances: number;
}
```

---

### Settings

#### GET /v1/settings

Get organization settings.

**Response**: `200 OK`

```typescript
interface OrganizationSettings {
  organizationId: string;
  billingPlan: "free" | "pro" | "enterprise";
  stripeCustomerId?: string;
  limits: {
    maxInstances: number;
    maxTokensPerMonth: bigint;
    maxConcurrentAgents: number;
  };
}
```

#### PATCH /v1/settings

Update organization settings.

**Request Body**: Partial settings (billing plan changes go through Stripe).

**Response**: `200 OK`.

## Error Format

All errors follow a consistent format:

```typescript
interface ApiError {
  message: string;
  code: string;
  status: number;
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized (wrong org) |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |

## Status

> [!decision]
> These endpoints are planned for Phase 3. The current `apps/api` only has webhook handlers and a health check. See [[architecture/app-api]] for the current state.

See [[api-contracts/webhook-contracts]] for the webhook endpoints that are already implemented.

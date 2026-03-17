---
title: "Data Flow Diagrams"
type: architecture
domain: all
phase: 1
status: active
tags:
  - domain/all
  - phase/1
  - status/active
  - type/architecture
---

# Data Flow Diagrams

> [!context]
> This document traces the primary data flows through Symphony Cloud, from user interaction through to the Symphony engine and external services.

## Primary Request Flow: Dashboard to Engine

```mermaid
sequenceDiagram
    participant User
    participant Dashboard as apps/app<br/>(:3000)
    participant Clerk
    participant ControlPlane as apps/api<br/>(:3002)
    participant DB as Neon PostgreSQL
    participant Engine as Symphony Engine

    User->>Dashboard: Browse /agents
    Dashboard->>Clerk: auth() — validate session
    Clerk-->>Dashboard: { userId, orgId }
    Dashboard->>ControlPlane: GET /v1/instances?orgId=...
    ControlPlane->>DB: SELECT * FROM instances WHERE org_id = ...
    DB-->>ControlPlane: Instance records
    ControlPlane->>Engine: GET /api/v1/state (per instance)
    Engine-->>ControlPlane: StateSummary
    ControlPlane-->>Dashboard: Aggregated response
    Dashboard-->>User: Render agent list
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant App as apps/app
    participant Clerk
    participant Middleware

    Browser->>App: GET /
    App->>Middleware: clerkMiddleware()
    Middleware->>Clerk: Validate JWT
    alt Authenticated + has orgId
        Clerk-->>Middleware: Valid session
        Middleware-->>App: Continue to (authenticated)/
        App-->>Browser: Dashboard page
    else Not authenticated
        Clerk-->>Middleware: No session
        Middleware-->>Browser: Redirect /sign-in
    end
```

## Webhook Flow: Clerk Events

```mermaid
sequenceDiagram
    participant Clerk
    participant API as apps/api
    participant Svix as Svix Verifier
    participant PostHog

    Clerk->>API: POST /webhooks/auth
    Note over API: Headers: svix-id, svix-timestamp, svix-signature
    API->>Svix: Verify(body, headers)
    alt Verified
        Svix-->>API: WebhookEvent
        API->>API: Route by event.type
        alt user.created
            API->>PostHog: identify + capture("User Created")
        else organization.created
            API->>PostHog: groupIdentify + capture("Organization Created")
        else organizationMembership.created
            API->>PostHog: groupIdentify + capture("Member Created")
        end
        API-->>Clerk: 201
    else Invalid
        API-->>Clerk: 400
    end
```

## Webhook Flow: Stripe Events

```mermaid
sequenceDiagram
    participant Stripe
    participant API as apps/api
    participant Clerk
    participant PostHog

    Stripe->>API: POST /webhooks/payments
    Note over API: Header: stripe-signature
    API->>API: stripe.webhooks.constructEvent()
    alt Verified
        API->>Clerk: List users
        API->>API: Match by privateMetadata.stripeCustomerId
        alt checkout.session.completed
            API->>PostHog: capture("User Subscribed")
        else subscription_schedule.canceled
            API->>PostHog: capture("User Unsubscribed")
        end
        API-->>Stripe: 200 OK
    else Invalid
        API-->>Stripe: 500 Error
    end
```

## Database Access Pattern

```mermaid
graph LR
    SC["Server Component<br/>(apps/app)"]
    API["API Route<br/>(apps/api)"]
    PKG["@repo/database"]
    PRISMA["PrismaClient"]
    NEON["Neon PostgreSQL"]

    SC -->|"import { database }"| PKG
    API -->|"import { database }"| PKG
    PKG -->|"PrismaNeon adapter"| PRISMA
    PRISMA -->|"WebSocket"| NEON
```

> [!important]
> The `@repo/database` package uses `server-only`, so it cannot be imported in Client Components. All database access must happen in Server Components or API routes.

## Symphony Engine Proxy Flow (Planned)

```mermaid
sequenceDiagram
    participant Dashboard as apps/app
    participant API as apps/api
    participant DB as Neon
    participant Client as @repo/symphony-client
    participant Engine as Symphony Engine

    Dashboard->>API: POST /v1/instances/{id}/refresh
    API->>DB: Get instance (host, port, token)
    DB-->>API: Instance record
    API->>Client: new SymphonyClient(host, port, token)
    Client->>Engine: POST /api/v1/refresh
    Engine-->>Client: RefreshResponse
    Client-->>API: Typed response
    API-->>Dashboard: 200 OK
```

## Cron Job Flow

```mermaid
sequenceDiagram
    participant Vercel as Vercel Cron
    participant API as apps/api
    participant Engine as Symphony Engine

    Vercel->>API: GET /cron/keep-alive
    API->>Engine: GET /healthz (per instance)
    Engine-->>API: 200 OK / timeout
    API->>API: Update instance status
    API-->>Vercel: 200 OK
```

## Data Flow Summary

| Flow | Source | Destination | Protocol | Auth |
|------|--------|-------------|----------|------|
| Dashboard data fetch | `apps/app` | `apps/api` | HTTP (internal) | Clerk JWT |
| Engine proxy | `apps/api` | Symphony Engine | HTTP | API token (per instance) |
| Clerk webhooks | Clerk | `apps/api` | HTTPS + Svix | Svix signature |
| Stripe webhooks | Stripe | `apps/api` | HTTPS | Stripe signature |
| Database queries | `@repo/database` | Neon | WebSocket | Connection string |
| Analytics events | `@repo/analytics` | PostHog | HTTPS | API key |
| Error reporting | `@repo/observability` | Sentry | HTTPS | DSN |
| Collaboration | `@repo/collaboration` | Liveblocks | WebSocket | Secret key |

See [[api-contracts/symphony-http-api]] for the complete engine API contract and [[api-contracts/control-plane-api]] for the control plane REST API.

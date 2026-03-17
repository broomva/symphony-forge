---
title: "Environment Variables Catalog"
type: schema
domain: all
phase: 1
status: active
tags:
  - domain/all
  - phase/1
  - status/active
  - type/schema
---

# Environment Variables Catalog

> [!context]
> This catalogs all environment variables used across Symphony Cloud. Variables are validated at runtime using `@t3-oss/env-nextjs` with Zod schemas in each package's `keys.ts` file.

## Configuration Pattern

Each package defines its env vars in a `keys.ts` file:

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      MY_VAR: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_MY_VAR: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      MY_VAR: process.env.MY_VAR,
      NEXT_PUBLIC_MY_VAR: process.env.NEXT_PUBLIC_MY_VAR,
    },
  });
```

Apps compose these in their `env.ts`:

```typescript
import { keys as authKeys } from "@repo/auth/keys";
import { keys as databaseKeys } from "@repo/database/keys";

export const env = createEnv({
  extends: [authKeys(), databaseKeys()],
  // app-specific vars...
});
```

## Variable Catalog

### Authentication (`@repo/auth`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `CLERK_SECRET_KEY` | string | Yes | Server | Clerk API secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | string | Yes | Client | Clerk publishable key |
| `CLERK_WEBHOOK_SECRET` | string | For webhooks | Server | Svix signing secret for Clerk webhooks |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | string | No | Client | Custom sign-in page URL |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | string | No | Client | Custom sign-up page URL |

### Database (`@repo/database`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `DATABASE_URL` | string | Yes | Server | Neon PostgreSQL connection string |

### Payments (`@repo/payments`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | string | For billing | Server | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | string | For webhooks | Server | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | string | For billing | Client | Stripe publishable key |

### Observability (`@repo/observability`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `SENTRY_DSN` | string | No | Server | Sentry Data Source Name |
| `NEXT_PUBLIC_SENTRY_DSN` | string | No | Client | Sentry DSN for browser |
| `SENTRY_AUTH_TOKEN` | string | No | Server | Sentry auth for source maps |
| `SENTRY_ORG` | string | No | Server | Sentry organization slug |
| `SENTRY_PROJECT` | string | No | Server | Sentry project slug |
| `LOGTAIL_SOURCE_TOKEN` | string | No | Server | Logtail/Better Stack token |

### Analytics (`@repo/analytics`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | string | No | Client | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | string | No | Client | PostHog API host |

### Collaboration (`@repo/collaboration`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `LIVEBLOCKS_SECRET` | string | No | Server | Liveblocks secret key |

### CMS (`@repo/cms`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `BASEHUB_TOKEN` | string | No | Server | BaseHub CMS token |

### Email (`@repo/email`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `RESEND_API_KEY` | string | No | Server | Resend API key for transactional email |

### Feature Flags (`@repo/feature-flags`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `FLAGS_SECRET` | string | No | Server | Feature flag secret for Vercel flags |

### Rate Limiting (`@repo/rate-limit`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `UPSTASH_REDIS_REST_URL` | string | No | Server | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | string | No | Server | Upstash Redis token |

### Storage (`@repo/storage`)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `BLOB_READ_WRITE_TOKEN` | string | No | Server | Vercel Blob storage token |

### Symphony Client (`@repo/symphony-client`, planned)

| Variable | Type | Required | Scope | Description |
|----------|------|----------|-------|-------------|
| `SYMPHONY_API_URL` | string | For engine | Server | Default Symphony engine URL |
| `SYMPHONY_API_TOKEN` | string | No | Server | Default Symphony engine API token |

## App-Level Variables

### apps/app

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | string | No | Dashboard URL (default: http://localhost:3000) |

### apps/api

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | string | No | API URL (default: http://localhost:3002) |

### apps/web

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_WEB_URL` | string | No | Marketing site URL (default: http://localhost:3001) |

## Security Notes

> [!warning]
> - **Never commit `.env.local` files** -- they are gitignored
> - **Server-only variables** (no `NEXT_PUBLIC_` prefix) are never exposed to the browser
> - **`emptyStringAsUndefined: true`** means empty strings are treated as missing values
> - API keys and secrets should be rotated regularly
> - Use different keys for development and production

## File Locations

Environment files per app:
- `apps/app/.env.local`
- `apps/api/.env.local`
- `apps/web/.env.local`

Example files (safe to commit):
- `apps/app/.env.example`
- `apps/api/.env.example`
- `apps/web/.env.example`

> [!tip]
> Turborepo tracks `**/.env.*local` as a global dependency (`turbo.json`). Any env file change invalidates all task caches.

## Related

- [[runbooks/local-dev-setup]] -- Setting up env vars for development
- [[architecture/package-map]] -- Which packages use which env vars
- [[api-contracts/webhook-contracts]] -- Webhook-specific env vars

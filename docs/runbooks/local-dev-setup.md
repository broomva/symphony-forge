---
title: "Runbook: Local Development Setup"
type: runbook
domain: infra
phase: 1
status: active
tags:
  - domain/infra
  - phase/1
  - status/active
  - type/runbook
---

# Runbook: Local Development Setup

> [!context]
> This runbook covers setting up Symphony Cloud for local development from scratch. Follow these steps in order.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18 | `brew install node` or [nvm](https://github.com/nvm-sh/nvm) |
| Bun | 1.3.10+ | `curl -fsSL https://bun.sh/install \| bash` |
| Git | Latest | `brew install git` |

### External Service Accounts

You will need accounts and API keys for:

| Service | Required | Purpose | Docs |
|---------|----------|---------|------|
| Clerk | Yes | Authentication | https://clerk.com |
| Neon | Yes | PostgreSQL database | https://neon.tech |
| Stripe | For billing | Payment processing | https://stripe.com |
| Sentry | For observability | Error tracking | https://sentry.io |
| PostHog | For analytics | Product analytics | https://posthog.com |
| Liveblocks | Optional | Real-time collaboration | https://liveblocks.io |

## Steps

### 1. Clone the Repository

```bash
git clone <repository-url> symphony-cloud
cd symphony-cloud
```

### 2. Install Dependencies

```bash
bun install
```

> [!tip]
> Bun is the required package manager (`packageManager: "bun@1.3.10"` in `package.json`). Do not use npm or yarn.

### 3. Configure Environment Variables

Copy the example env files for each app:

```bash
cp apps/app/.env.example apps/app/.env.local
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
```

Fill in the required values. See [[schemas/env-variables]] for the complete catalog.

**Minimum required variables**:

```env
# Clerk (apps/app and apps/api)
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Database (packages/database)
DATABASE_URL=postgresql://...@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 4. Generate Prisma Client

```bash
cd packages/database && bunx prisma generate && cd ../..
```

Or use the root script:

```bash
bun db:push
```

### 5. Push Database Schema

For initial setup (no migration files needed):

```bash
bun db:push
```

For creating migration files:

```bash
bun migrate
```

See [[runbooks/database-migration]] for the full migration workflow.

### 6. Start Development Servers

Start all apps simultaneously:

```bash
bun dev
```

Or start individual apps:

```bash
# Dashboard only
cd apps/app && bun dev

# API only
cd apps/api && bun dev
```

### 7. Verify Setup

| URL | Expected |
|-----|----------|
| http://localhost:3000 | Dashboard (redirects to sign-in) |
| http://localhost:3001 | Marketing site |
| http://localhost:3002/health | API health check (`200 OK`) |
| http://localhost:3004 | Mintlify docs |
| http://localhost:3003 | React Email preview |
| http://localhost:6006 | Storybook |

### 8. Install Git Hooks (Optional)

```bash
# If scripts/harness/install-hooks.sh exists:
bash scripts/harness/install-hooks.sh
```

## Common Tasks

### Running Tests

```bash
bun test
```

### Linting

```bash
bun check        # Check for lint errors
bun run fix      # Auto-fix lint errors
```

### Building

```bash
bun build
```

> [!important]
> `bun build` runs tests first (configured in `turbo.json`). If tests fail, the build will not proceed.

### Opening Prisma Studio

```bash
cd packages/database && bunx prisma studio
```

Or start the studio app (port 3005).

## Troubleshooting

### "DATABASE_URL is not set"

Ensure your `.env.local` file exists in the app directory and contains a valid `DATABASE_URL`. The `@repo/database` package reads this via `@t3-oss/env-nextjs`.

### Prisma Client Not Generated

Run `bunx prisma generate` in `packages/database/`. The generated client is output to `packages/database/generated/`.

### Port Already in Use

The default ports are 3000-3005 and 6006. If a port is occupied, Next.js will auto-increment to the next available port.

### Clerk Redirect Loops

Ensure both `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are set. They must be from the same Clerk application.

## Related

- [[architecture/monorepo-topology]] -- Workspace structure
- [[schemas/env-variables]] -- All environment variables
- [[runbooks/database-migration]] -- Schema change workflow
- [[decisions/adr-001-next-forge]] -- Why next-forge

---
title: "ADR-002: Clerk for Authentication"
type: decision
domain: auth
phase: 1
status: active
tags:
  - domain/auth
  - phase/1
  - status/active
  - type/decision
---

# ADR-002: Clerk for Authentication

## Status

**Accepted** -- 2026-03

## Context

Symphony Cloud is a multi-tenant SaaS platform where each tenant (organization) manages their own Symphony engine instances, workflows, and agent runs. The auth system must support:

1. **Multi-tenancy via organizations** -- users belong to organizations, all resources are org-scoped
2. **Pre-built UI components** -- sign-in, sign-up, user profile, org switcher
3. **Webhook events** -- real-time notifications for user/org lifecycle changes
4. **Server-side auth** -- `auth()` function for Server Components and API routes
5. **JWT-based sessions** -- stateless auth for edge and serverless environments

## Options Considered

### Option A: Clerk

- Pre-built React components (SignIn, UserButton, OrganizationSwitcher)
- First-class Next.js App Router support (`@clerk/nextjs`)
- Organization model built in (multi-tenancy out of the box)
- Svix-based webhooks for user/org events
- `auth()` function for Server Components
- Middleware support for route protection

### Option B: NextAuth.js (Auth.js)

- Open-source, self-hostable
- Multiple provider support (OAuth, credentials, magic links)
- No built-in organization/multi-tenancy model
- No pre-built UI components
- Requires manual implementation of org switching and role management

### Option C: Supabase Auth

- Integrated with Supabase ecosystem
- Row-level security for multi-tenancy
- Would couple us to Supabase database (conflicts with Neon choice)
- Less mature Next.js App Router support

## Decision

> [!decision]
> Use **Clerk** (`@clerk/nextjs` 7.x) for authentication and organization management. Clerk's built-in organization model directly maps to Symphony Cloud's multi-tenancy requirement, and its pre-built components eliminate significant UI development.

## Rationale

- **Organization model**: Clerk's organizations map directly to Symphony Cloud tenants. Every `orgId` from Clerk becomes the `organizationId` foreign key in our database models.
- **Pre-built UI**: `OrganizationSwitcher` and `UserButton` are production-ready components that handle complex UX (org creation, switching, member management) with zero custom code.
- **Server Components**: `auth()` works in Server Components and returns `{ userId, orgId }`, enabling direct database queries without API round-trips.
- **Webhooks**: Clerk's Svix-based webhooks notify us of user/org changes in real-time, which we use for analytics tracking (see [[api-contracts/webhook-contracts]]).
- **next-forge integration**: Clerk is pre-integrated in the next-forge scaffold, with `@repo/auth` already configured.

## Implementation

### Package Structure

The `@repo/auth` package (`packages/auth/`) wraps Clerk:

- **Server exports** (`server.ts`): `auth()`, `clerkClient()`, `clerkMiddleware`, webhook types
- **Client exports** (`client.ts`): `OrganizationSwitcher`, `UserButton`, `SignIn`, `SignUp`
- **Keys** (`keys.ts`): `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` via `@t3-oss/env-nextjs`

### Auth Pattern in Server Components

```typescript
import { auth } from "@repo/auth/server";

const Page = async () => {
  const { orgId } = await auth();
  if (!orgId) notFound();
  // Query database with orgId
};
```

### Route Protection

Clerk middleware protects all routes under `(authenticated)/`. Unauthenticated users are redirected to `/sign-in`.

## Consequences

### Positive
- Zero custom auth UI code needed
- Organization multi-tenancy built in
- Webhook handlers already implemented for analytics
- Strong TypeScript types for all auth operations

### Negative
- Vendor lock-in to Clerk (migration would require rewriting auth layer)
- No user table in our database (user data lives in Clerk, referenced by string IDs)
- Pricing scales with monthly active users
- Stripe customer ID stored in Clerk `privateMetadata` (cross-service coupling)

### Risks
- Clerk outage would prevent all user authentication
- The current Stripe user resolution (O(n) scan via `getUserList()`) will not scale

## Related

- [[architecture/app-dashboard]] -- Dashboard auth flow
- [[architecture/app-api]] -- API webhook handlers
- [[api-contracts/webhook-contracts]] -- Clerk webhook schemas
- [[schemas/env-variables]] -- Clerk env vars

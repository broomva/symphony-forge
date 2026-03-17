---
title: "ADR-001: next-forge as Foundation"
type: decision
domain: infra
phase: 1
status: active
tags:
  - domain/infra
  - phase/1
  - status/active
  - type/decision
---

# ADR-001: next-forge as Foundation

## Status

**Accepted** -- 2026-03

## Context

Symphony Cloud needed a production-ready monorepo scaffold to build a SaaS platform on top of the Symphony orchestrator. The key requirements were:

1. **Multi-app monorepo** -- separate apps for dashboard, API, marketing site, docs
2. **Pre-integrated auth, billing, observability** -- avoid boilerplate for standard SaaS concerns
3. **Modern React stack** -- Next.js App Router, Server Components, Tailwind CSS
4. **TypeScript-first** -- strict typing across all packages
5. **Fast iteration** -- pre-built UI components, working auth flows, webhook handlers

## Options Considered

### Option A: next-forge (v6)

- Turborepo monorepo with 7 apps and 20+ packages
- Pre-integrated: Clerk auth, Stripe billing, Sentry observability, Prisma ORM
- shadcn/ui component library with design system package
- Biome linter, Vitest test runner, Bun package manager
- Active maintenance by Vercel community

### Option B: Custom Turborepo scaffold

- Build from scratch using `create-turbo`
- Full control over every integration
- Significant upfront work to wire auth, billing, observability
- No pre-built dashboard or webhook handlers

### Option C: T3 Stack + manual monorepo

- `create-t3-app` for the main app
- Manually add workspace packages
- Strong TypeScript conventions (tRPC, Zod)
- Not designed for multi-app monorepos

## Decision

> [!decision]
> Use **next-forge v6** as the monorepo foundation. It provides the most complete starting point for a SaaS platform, with all critical integrations pre-wired and a proven workspace structure.

## Rationale

- **Time-to-value**: next-forge ships with working Clerk auth (including webhook handlers), Stripe billing, and a functioning dashboard layout. This saves weeks of integration work.
- **Workspace structure**: The 7-app + 20-package structure cleanly separates concerns and allows independent deployment.
- **Component library**: The `@repo/design-system` package with shadcn/ui provides production-quality UI components out of the box.
- **Tooling**: Biome (fast linting), Vitest (fast testing), and Bun (fast package management) provide excellent developer experience.
- **Upgrade path**: Individual packages can be replaced without affecting the overall structure. If we outgrow Clerk, only `@repo/auth` changes.

## Consequences

### Positive
- Immediate working scaffold with auth, billing, and observability
- Consistent package structure across 20 packages
- shadcn/ui components are customizable and accessible
- Turborepo caching speeds up builds

### Negative
- Template code includes example data (e.g., "Acme Inc", sample sidebar items) that must be cleaned up
- Some packages may not be needed (e.g., `@repo/cms`, `@repo/internationalization`) but exist as stubs
- Tight coupling to next-forge conventions may limit certain architectural choices
- The root `package.json` still has next-forge publishing metadata that should be removed

### Risks
- next-forge major version upgrades may be difficult to adopt
- Some packages depend on specific service providers (Clerk, Stripe) with no abstraction layer

## Related

- [[architecture/overview]] -- System architecture
- [[architecture/monorepo-topology]] -- Workspace structure
- [[decisions/adr-002-clerk-auth]] -- Auth provider decision
- [[decisions/adr-003-prisma-neon]] -- Database decision

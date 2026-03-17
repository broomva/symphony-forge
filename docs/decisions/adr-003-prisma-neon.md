---
title: "ADR-003: Prisma + Neon PostgreSQL"
type: decision
domain: database
phase: 1
status: active
tags:
  - domain/database
  - phase/1
  - status/active
  - type/decision
---

# ADR-003: Prisma + Neon PostgreSQL

## Status

**Accepted** -- 2026-03

## Context

Symphony Cloud needs a relational database for tenant data (instances, workflows, runs, sessions, API keys, usage records). Requirements:

1. **Serverless-compatible** -- works in edge and serverless environments without connection pooling issues
2. **Type-safe ORM** -- generated TypeScript types from schema, compile-time query validation
3. **Migration tooling** -- declarative schema changes with versioned migrations
4. **Multi-tenant isolation** -- all queries scoped by `organizationId`
5. **PostgreSQL** -- proven for relational data, JSON support for flexible fields

> [!context]
> Note: The `CLAUDE.md` file references "Drizzle ORM" but the actual codebase uses Prisma. This ADR documents the reality.

## Options Considered

### Option A: Prisma + Neon

- Prisma ORM with `@prisma/adapter-neon` for serverless WebSocket connections
- Neon serverless PostgreSQL with auto-scaling and branching
- Schema-first development with `schema.prisma`
- Generated TypeScript client with full type safety
- `prisma migrate` for versioned migrations

### Option B: Drizzle + Neon

- Lighter-weight ORM with SQL-like query builder
- Better edge runtime support (smaller bundle)
- Schema defined in TypeScript (no separate schema file)
- Less mature migration tooling
- Would require replacing the existing Prisma setup

### Option C: Prisma + Supabase

- Same Prisma ORM, different PostgreSQL provider
- Supabase includes additional features (auth, storage, realtime)
- Feature overlap with Clerk (auth) and other packages
- Non-serverless connection model (requires connection pooler)

## Decision

> [!decision]
> Use **Prisma** as the ORM with **Neon PostgreSQL** as the serverless database. This combination is already integrated in the next-forge scaffold and provides the best balance of type safety, migration tooling, and serverless compatibility.

## Rationale

- **Pre-integrated**: The `@repo/database` package already uses Prisma with the `@prisma/adapter-neon` adapter and WebSocket connections.
- **Type safety**: Prisma generates a full TypeScript client from `schema.prisma`, providing autocomplete and compile-time validation for all queries.
- **Serverless**: The `PrismaNeon` adapter uses WebSocket connections via `@neondatabase/serverless`, which works in serverless and edge environments without connection pooling.
- **Migration tooling**: `prisma migrate dev` creates versioned migration files, and `prisma db push` enables rapid prototyping.
- **Schema readability**: The Prisma schema language is declarative and easy to review in PRs.

## Implementation

### Database Package (`packages/database/`)

```
packages/database/
├── prisma/
│   └── schema.prisma      # Schema definition
├── generated/              # Auto-generated Prisma client
│   ├── client.ts
│   ├── models.ts
│   ├── enums.ts
│   └── ...
├── index.ts                # Exports `database` (PrismaClient) + generated types
├── keys.ts                 # DATABASE_URL env validation
├── prisma.config.ts        # Prisma config
├── package.json
└── tsconfig.json
```

### Connection Setup

```typescript
// packages/database/index.ts
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: databaseUrl });
const database = new PrismaClient({ adapter });
```

> [!important]
> The `@repo/database` package imports `server-only`, preventing accidental client-side imports that would expose the database connection string.

### Current Schema

The current schema has only a stub `Page` model. The planned schema (Phase 2) will include 10 models and 6 enums. See [[schemas/database-schema]] for the full schema documentation.

### Migration Commands

| Command | Purpose |
|---------|---------|
| `bun migrate` | Format + generate + migrate dev (creates migration files) |
| `bun db:push` | Format + generate + push (no migration files, for prototyping) |
| `bun migrate:deploy` | Generate + migrate deploy (for CI/production) |

See [[runbooks/database-migration]] for the complete migration workflow.

## Consequences

### Positive
- Full TypeScript type safety for all database operations
- Serverless-compatible WebSocket connections via Neon
- Declarative schema with versioned migrations
- Prisma Studio available for database inspection (`apps/studio`, port 3005)

### Negative
- Prisma client bundle size is larger than Drizzle
- Prisma's `relationMode: "prisma"` means relations are enforced at the application level, not the database level
- Generated code in `generated/` must be committed or regenerated in CI
- Single `DATABASE_URL` env var (no read replica support without additional configuration)

### Risks
- Neon cold start latency on the free tier
- Prisma ORM lock-in (migrating to Drizzle would require rewriting all queries)
- `relationMode: "prisma"` can lead to orphaned records if application-level cascade logic has bugs

## Related

- [[schemas/database-schema]] -- Full schema documentation
- [[runbooks/database-migration]] -- Migration workflow
- [[architecture/package-map]] -- Package dependencies
- [[architecture/data-flow]] -- Database access patterns

# CLAUDE.md - Symphony Cloud

## Project
Symphony Cloud is the managed service platform for Symphony (the open-source coding agent orchestrator).
This is a next-forge monorepo with Next.js, Clerk auth, Stripe billing, and a control plane API.

## Relationship to Symphony
- The open-source engine lives at /Users/broomva/symphony (Rust, Apache 2.0)
- This repo is the proprietary SaaS layer (TypeScript, Proprietary)
- The dashboard connects to Symphony's HTTP API (/api/v1/state, /api/v1/refresh)

## Stack
- next-forge (Turborepo + Next.js 15)
- Bun as package manager
- Clerk for auth
- Stripe for billing
- Prisma ORM + Neon PostgreSQL
- shadcn/ui + Tailwind CSS v4
- Sentry for observability

## Commands
- `bun install` — install dependencies
- `bun dev` — start all apps in dev mode
- `bun build` — build all apps
- `bun lint` — lint all packages

## Conventions
- App Router (Next.js) — no pages/ directory
- Server Components by default, 'use client' only when needed
- Shared UI components in packages/ui
- Database schema in packages/database (Prisma)
- Symphony API client in packages/symphony-client

## Knowledge Graph

The knowledge graph lives in `docs/` using Obsidian-flavored Markdown with frontmatter tags.

- **Entry point**: `docs/_index.md` — full graph map, tag taxonomy, traversal instructions
- **Architecture**: `docs/architecture/` — system diagrams, monorepo topology, app descriptions
- **API Contracts**: `docs/api-contracts/` — Symphony HTTP API, control plane API, webhooks
- **Decisions**: `docs/decisions/` — Architecture Decision Records (ADRs)
- **Runbooks**: `docs/runbooks/` — step-by-step operational procedures
- **Schemas**: `docs/schemas/` — database schema docs, environment variable catalog
- **Glossary**: `docs/glossary.md` — terminology definitions

Linking conventions: `[[architecture/overview]]` for wikilinks, Mermaid for diagrams, `> [!decision]` / `> [!warning]` for callouts.

## Control Harness

Policy gates and automation scripts live alongside the code:

- **`.control/policy.yaml`** — Risk gates for database migrations, dependency updates, env changes, new packages, deploys
- **`.control/commands.yaml`** — Canonical command definitions (smoke, check, test, build, ci, docs-check, deploy, migrate)
- **`.control/topology.yaml`** — Full repo map: all apps, packages, knowledge entry points
- **`scripts/harness/`** — Executable bash scripts for each command
- **`Makefile.control`** — `make -f Makefile.control <target>` to run any harness command

Key commands:
- `make -f Makefile.control smoke` — quick validation (~120s)
- `make -f Makefile.control check` — lint + typecheck (~60s)
- `make -f Makefile.control ci` — full pipeline: check + test + build (~600s)
- `make -f Makefile.control audit` — entropy audit: topology coverage, stale docs, broken links

## Working Protocol

Follow this protocol for every task:

1. **Read `AGENTS.md`** — understand commands, constraints, and knowledge graph structure
2. **Traverse `docs/`** — start at `docs/_index.md`, navigate to domain-specific docs
3. **Check policy** — run `make -f Makefile.control policy-check` to see if changes trigger risk gates
4. **Implement** — follow the constraints in AGENTS.md (App Router, Server Components by default, Prisma for DB, etc.)
5. **Update docs** — any schema, API, or env var change must have a corresponding doc update in `docs/`
6. **Run checks** — `make -f Makefile.control check` before committing; `make -f Makefile.control ci` before pushing

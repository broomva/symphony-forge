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

## Dependency Management

Library updates and dependency hygiene are a first-class concern in this project:

- **Check for open dependabot PRs** — Before starting work on a feature branch, check `gh pr list --state open` for pending dependency updates. If the feature touches packages with pending updates, incorporate those updates into the work.
- **Batch updates by type** — In a Bun monorepo, prefer updating dependencies at the workspace root (`bun update <pkg>`) rather than merging individual per-package dependabot PRs. This keeps the lockfile consistent.
- **Risk tiers for updates**:
  - **Patch versions** (e.g., 16.1.6 → 16.1.7): Low risk — batch and merge freely after `bun build` passes.
  - **Minor versions** (e.g., 1.2.0 → 1.3.0): Medium risk — review changelogs, run full test suite.
  - **Major versions** (e.g., 1.x → 2.x): High risk — review migration guides, test thoroughly, consider an ADR if the upgrade changes behavior significantly.
  - **Type-only updates** (`@types/*`): Low risk — update freely, just ensure typecheck passes.
- **After updating**: Always run `bun install`, then `make -f Makefile.control check` (lint + typecheck) and `make -f Makefile.control test` at minimum.
- **Close superseded dependabot PRs** — Once updates are applied in a consolidated branch, close the individual dependabot PRs with a comment referencing the consolidation commit/PR.
- **Policy gate**: Dependency updates trigger the `dependency-update` policy in `.control/policy.yaml` — ensure audit, build, and tests pass.

## Working Protocol

Follow this protocol for every task:

1. **Read `AGENTS.md`** — understand commands, constraints, and knowledge graph structure
2. **Traverse `docs/`** — start at `docs/_index.md`, navigate to domain-specific docs
3. **Check dependencies** — run `gh pr list --state open` to review pending dependabot PRs. If relevant updates exist for packages you're touching, incorporate them into your work.
4. **Check policy** — run `make -f Makefile.control policy-check` to see if changes trigger risk gates
5. **Implement** — follow the constraints in AGENTS.md (App Router, Server Components by default, Prisma for DB, etc.)
6. **Update docs** — any schema, API, or env var change must have a corresponding doc update in `docs/`
7. **Run checks** — `make -f Makefile.control check` before committing; `make -f Makefile.control ci` before pushing
8. **PR feedback loop** — after pushing a PR, close the loop:
   - **Fetch PR comments**: `gh api repos/{owner}/{repo}/pulls/{pr}/comments` for inline review comments, `gh pr view {pr} --comments` for top-level comments. Filter out bot comments (vercel[bot], github-actions[bot]).
   - **Triage each comment**: Accept (apply the suggestion), Fix (implement a different solution addressing the concern), or Reject (reply explaining why — only when the suggestion is incorrect or conflicts with architecture).
   - **Apply fixes in a single commit**, then push and re-check CI.
   - **Resolve conversations**: After committing fixes, use `gh api` to resolve addressed review threads: `gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies -f body="Fixed in <commit>"`. Note: only PR authors or users with write access can resolve threads via the GitHub UI — agents should reply to confirm resolution and the author can resolve in the UI.
   - **Verify all checks green**: `gh pr checks {pr}` — all CI and deployment checks must pass before requesting merge.
   - **Iterate**: If new comments appear after fixes, repeat the triage-fix-verify cycle.

## PR Review Resolution

When resolving PR review comments programmatically:

```bash
# List all inline review comments
gh api repos/{owner}/{repo}/pulls/{pr}/comments

# Reply to a comment (confirms resolution)
gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies \
  -f body="Fixed in <short-sha>: <brief description>"

# List top-level PR comments (filter out bots)
gh pr view {pr} --comments --json comments

# Check all CI/deployment status
gh pr checks {pr}
```

The feedback loop connects to the control metalayer: PR comments are a **sensor** in the control system — they surface deviations from code quality setpoints (style, correctness, security). Resolving them is the **actuator** response. The CI re-run after fixes is the **stability check** that confirms the system returned to its setpoint.

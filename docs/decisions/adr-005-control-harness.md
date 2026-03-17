---
title: "ADR-005: Control Harness & Metalayer"
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

# ADR-005: Control Harness & Metalayer

## Status

**Accepted** -- 2026-03

## Context

Symphony Cloud is built by human developers and AI coding agents working together. Without guardrails, agents can:

1. Make changes without understanding the broader architecture
2. Skip tests or linting before committing
3. Introduce breaking changes to API contracts without updating docs
4. Ignore existing Architecture Decision Records

We need a **control metalayer** -- a set of policies, scripts, and automation that ensures quality and consistency regardless of who (or what) is making changes.

## Options Considered

### Option A: Harness scripts + policy files + CI workflows

- Shell scripts in `scripts/harness/` for common operations (smoke test, check, CI)
- YAML policy files in `.control/` defining gates and constraints
- GitHub Actions workflows enforcing policies on PR/push
- Makefile for human-friendly command interface
- Lightweight, transparent, versionable

### Option B: Custom CLI tool

- TypeScript CLI (`symphony-cloud-cli`) with commands for check, test, build
- More powerful but requires maintenance of the CLI itself
- Adds complexity to the development setup
- Harder for agents to understand and modify

### Option C: GitHub Actions only

- All enforcement happens in CI
- No local enforcement (catch issues only after push)
- Slower feedback loop
- No protection against pushing broken code

## Decision

> [!decision]
> Implement a **three-layer control harness**: (1) `.control/` YAML configuration, (2) `scripts/harness/` shell scripts, and (3) GitHub Actions workflows. This provides both local and CI enforcement with minimal tooling overhead.

## Rationale

- **Local-first**: Developers and agents get immediate feedback via harness scripts before pushing
- **Policy-as-code**: `.control/policy.yaml` makes quality gates explicit and reviewable
- **Composable**: Scripts can be combined (e.g., `ci.sh` = `check.sh` + test + build)
- **Agent-friendly**: Shell scripts are universally understood by coding agents
- **Progressive enforcement**: Pre-commit hooks catch issues early, CI enforces on PR

## Architecture

### Layer 1: Configuration (`.control/`)

```yaml
# .control/policy.yaml
gates:
  database-migration:
    requires: [adr, test, review]
  api-contract-change:
    requires: [adr, backward-compatible]
  new-package:
    requires: [runbook-update, topology-update]
  deploy:
    requires: [ci-pass, smoke-test]

# .control/commands.yaml
commands:
  smoke: scripts/harness/smoke.sh
  check: scripts/harness/check.sh
  ci: scripts/harness/ci.sh
  docs-check: scripts/harness/check-docs-freshness.sh

# .control/topology.yaml
apps:
  app: { port: 3000, risk: high, domain: dashboard }
  api: { port: 3002, risk: high, domain: api }
  web: { port: 3001, risk: medium, domain: marketing }
  docs: { port: 3004, risk: low, domain: docs }
  email: { port: 3003, risk: low, domain: email }
  storybook: { port: 6006, risk: low, domain: design }
  studio: { port: 3005, risk: low, domain: database }
```

### Layer 2: Scripts (`scripts/harness/`)

| Script | Purpose | Runs |
|--------|---------|------|
| `smoke.sh` | Quick validation: install + lint + build | Manual, pre-commit |
| `check.sh` | Full lint (Biome) + typecheck (tsc) | Manual, CI |
| `ci.sh` | check + test + build | CI |
| `pre-commit.sh` | Lint staged + typecheck + docs freshness | Git hook |
| `check-docs-freshness.sh` | Verify all docs are indexed in `_index.md` | Pre-commit, CI |
| `check-wikilinks.sh` | Validate no broken `[[wikilinks]]` | Pre-commit, CI |
| `check-policy.sh` | Policy compliance for staged changes | Pre-commit |
| `audit.sh` | Entropy audit (stale docs, unused deps) | Manual, weekly |
| `install-hooks.sh` | Copy pre-commit to `.git/hooks/` | Setup |

### Layer 3: CI (`.github/workflows/`)

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `ci.yml` | PR, push to main | check -> test -> build |
| `docs-sync.yml` | Changes to `docs/` | check-docs-freshness + check-wikilinks |

## Agent Integration

Agents must:

1. Start every session by reading `docs/_index.md`
2. Run `make -f Makefile.control check` before committing
3. Update relevant docs when changing architecture
4. Create an ADR before making significant technical decisions
5. Follow runbooks for operational tasks

The `AGENTS.md` file at the repo root provides the canonical agent protocol. See [[decisions/adr-004-knowledge-system]] for the knowledge system design.

## Consequences

### Positive
- Quality gates are explicit, reviewable, and versionable
- Local and CI enforcement prevents broken code from landing
- Agents have clear constraints and procedures
- Pre-commit hooks provide immediate feedback
- Policy changes go through PR review

### Negative
- Additional files to maintain (`.control/`, `scripts/harness/`, workflows)
- Pre-commit hooks add latency to commits
- Shell scripts may have cross-platform issues (macOS vs Linux)
- Overhead for small changes (e.g., README typo fix still runs checks)

### Mitigations
- `Makefile.control` provides a simple interface
- Scripts target <10s execution time for pre-commit
- Shell scripts tested in CI on both macOS and Linux runners

## Related

- [[decisions/adr-004-knowledge-system]] -- Knowledge graph design
- [[runbooks/local-dev-setup]] -- Setup instructions including hook installation
- [[architecture/monorepo-topology]] -- Repository structure

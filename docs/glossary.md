---
title: "Glossary"
type: glossary
domain: all
phase: 1
status: active
tags:
  - domain/all
  - phase/1
  - status/active
  - type/glossary
---

# Glossary

> [!context]
> Canonical definitions for terms used throughout the Symphony Cloud codebase and documentation. When in doubt about terminology, this is the source of truth.

## Core Concepts

| Term | Definition |
|------|-----------|
| **Symphony** | The open-source Rust coding agent orchestrator that Symphony Cloud wraps as a managed service. Source lives at `/Users/broomva/symphony`. |
| **Symphony Cloud** | The proprietary SaaS platform (this repository) that provides a managed control plane, dashboard, billing, and multi-tenancy on top of the Symphony engine. |
| **Agent** | An autonomous coding entity managed by Symphony. Agents execute tasks against codebases, consuming tokens and producing code changes. |
| **Orchestrator** | The Symphony engine component that coordinates multiple agents, manages their lifecycle, handles retries, and tracks token consumption. |
| **Tenant** | An organization in Clerk that maps to an isolated set of resources (instances, workflows, runs) in Symphony Cloud. Identified by `organizationId`. |
| **Instance** | A running deployment of the Symphony engine (`SymphonyInstance`). Each tenant can have one or more instances, each with a host, port, and API token. |
| **Workflow** | A declarative WORKFLOW.md document that defines what agents should do. Stored as versioned content in the database. |
| **Run** | A single execution of an agent against an issue/task. Tracked with status, token consumption, and timing. |
| **Session** | A turn-level subdivision of a Run. Each session tracks individual interaction turns, token counts, and status. |
| **Token** | A unit of LLM consumption (input + output). Tracked as `BigInt` for precision. The primary billing metric. |
| **Codex** | Symphony's internal concept for aggregated completion statistics. Exposed via `codex_totals` in the state API. |

## Infrastructure Terms

| Term | Definition |
|------|-----------|
| **next-forge** | The Turborepo-based monorepo scaffold used as the foundation for Symphony Cloud. See [[decisions/adr-001-next-forge]]. |
| **Turborepo** | The build system that manages the monorepo workspace, task dependencies, and caching. |
| **App Router** | Next.js 15 routing paradigm using directory-based routes under `app/`. No `pages/` directory exists. |
| **Server Component** | The default React component type in App Router. Runs on the server, can directly access databases and APIs. |
| **Client Component** | A React component marked with `'use client'` that runs in the browser. Used only when interactivity is required. |
| **Workspace** | A Bun/npm workspace package within the monorepo, either under `apps/` or `packages/`. |

## Auth & Billing Terms

| Term | Definition |
|------|-----------|
| **Clerk** | The authentication provider. Manages users, organizations, sessions, and JWTs. See [[decisions/adr-002-clerk-auth]]. |
| **Organization** | A Clerk concept mapping to a tenant. Users belong to organizations, and all Symphony Cloud resources are scoped to an organization. |
| **Stripe** | The payment processor handling subscriptions and usage-based billing. |
| **Billing Plan** | The subscription tier for a tenant: `free`, `pro`, or `enterprise`. Determines resource limits. |

## Database Terms

| Term | Definition |
|------|-----------|
| **Prisma** | The TypeScript ORM used for database access. Schema defined in `schema.prisma`. See [[decisions/adr-003-prisma-neon]]. |
| **Neon** | Serverless PostgreSQL provider. Accessed via the `@neondatabase/serverless` driver with WebSocket support. |
| **Migration** | A versioned schema change managed by `prisma migrate`. See [[runbooks/database-migration]]. |

## Observability Terms

| Term | Definition |
|------|-----------|
| **Sentry** | Error tracking and performance monitoring, integrated via `@sentry/nextjs` in the `@repo/observability` package. |
| **Logtail** | Structured logging service integrated via `@logtail/next`. |
| **PostHog** | Product analytics platform used for event tracking and user identification via `@repo/analytics`. |

## API Terms

| Term | Definition |
|------|-----------|
| **State Summary** | The response from `GET /api/v1/state` on the Symphony engine, containing running agents, retrying agents, token info, and codex totals. |
| **Control Plane** | The REST API layer in `apps/api` that mediates between the dashboard and Symphony engine instances. |
| **Webhook** | An inbound HTTP callback from Clerk (user/org events) or Stripe (payment events) to `apps/api/app/webhooks/`. |
| **Health Probe** | `GET /healthz` (liveness) and `GET /readyz` (readiness) endpoints on the Symphony engine. |

## Knowledge System Terms

| Term | Definition |
|------|-----------|
| **Knowledge Graph** | This documentation system stored in `docs/`. Uses Obsidian-flavored Markdown with wikilinks. See [[decisions/adr-004-knowledge-system]]. |
| **ADR** | Architecture Decision Record. Documents a significant technical decision with context, options, and rationale. |
| **Runbook** | A step-by-step operational procedure for a specific task. |
| **Wikilink** | An `[[internal-link]]` that connects notes in the knowledge graph. |
| **Callout** | An Obsidian `> [!type]` block used for decision notes, warnings, tips, and context. |

## symphony-forge Terms

| Term | Definition |
|------|-----------|
| **symphony-forge** | CLI tool that scaffolds next-forge projects with a composable control metalayer. Published as `npx symphony-forge`. See [[architecture/symphony-forge-cli]]. |
| **Layer** | A composable scaffold module (control, harness, knowledge, consciousness, autoany) that generates a set of files from a `ProjectConfig`. See [[decisions/adr-006-composable-layers]]. |
| **Control Metalayer** | The governance framework generated by symphony-forge, mapping to control theory: sensors (policy gates), actuators (harness scripts), model (knowledge graph), controller (CLAUDE.md/AGENTS.md). |
| **Manifest** | The `.symphony-forge.json` file that tracks installed layers, package manager, and timestamps. |
| **EGRI** | Evaluator-Governed Recursive Improvement — the self-improvement loop configured by the autoany layer in `.control/egri.yaml`. |
| **Entropy Audit** | The `symphony-forge audit` command that checks topology coverage, stale docs, index coverage, and manifest validity. |
| **Agent Skill** | A portable knowledge package installable via `npx skills add`. symphony-forge ships as a skill for 42+ AI agents. |
| **Soft Dependency** | A layer relationship where content adapts but doesn't fail when the dependency is absent. Missing layers trigger `> [!warning]` callouts. |

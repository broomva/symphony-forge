---
title: "Symphony Cloud Knowledge Graph"
type: index
domain: all
phase: 1
status: active
tags:
  - domain/all
  - phase/1
  - status/active
  - type/index
---

# Symphony Cloud Knowledge Graph

> [!context]
> This is the entry point for the Symphony Cloud knowledge system. Every agent session should start here to understand the codebase topology, conventions, and decision history before making changes.

## Graph Map

```mermaid
graph TD
    INDEX["_index.md<br/>(you are here)"]
    GLOSS["glossary.md"]

    subgraph Architecture
        ARCH_OV["architecture/overview.md"]
        ARCH_MONO["architecture/monorepo-topology.md"]
        ARCH_DASH["architecture/app-dashboard.md"]
        ARCH_API["architecture/app-api.md"]
        ARCH_PKG["architecture/package-map.md"]
        ARCH_FLOW["architecture/data-flow.md"]
        ARCH_FORGE["architecture/symphony-forge-cli.md"]
    end

    subgraph API Contracts
        API_SYM["api-contracts/symphony-http-api.md"]
        API_CP["api-contracts/control-plane-api.md"]
        API_WH["api-contracts/webhook-contracts.md"]
    end

    subgraph Decisions
        ADR1["decisions/adr-001-next-forge.md"]
        ADR2["decisions/adr-002-clerk-auth.md"]
        ADR3["decisions/adr-003-prisma-neon.md"]
        ADR4["decisions/adr-004-knowledge-system.md"]
        ADR5["decisions/adr-005-control-harness.md"]
        ADR6["decisions/adr-006-composable-layers.md"]
    end

    subgraph Showcase
        SHOW_SKILLS["showcase/skills-inventory.md"]
        SHOW_THREAD["showcase/thread.md"]
    end

    subgraph Runbooks
        RB_DEV["runbooks/local-dev-setup.md"]
        RB_DB["runbooks/database-migration.md"]
        RB_PKG["runbooks/add-new-package.md"]
    end

    subgraph Schemas
        SCH_DB["schemas/database-schema.md"]
        SCH_ENV["schemas/env-variables.md"]
    end

    subgraph Templates
        TPL_ADR["_templates/adr.md"]
        TPL_ARCH["_templates/architecture-note.md"]
        TPL_RUN["_templates/runbook.md"]
        TPL_API["_templates/api-contract.md"]
        TPL_SCH["_templates/schema-note.md"]
    end

    INDEX --> GLOSS
    INDEX --> ARCH_OV
    INDEX --> API_SYM
    INDEX --> ADR1
    INDEX --> RB_DEV
    INDEX --> SCH_DB

    ARCH_OV --> ARCH_MONO
    ARCH_OV --> ARCH_DASH
    ARCH_OV --> ARCH_API
    ARCH_OV --> ARCH_PKG
    ARCH_OV --> ARCH_FLOW
    ARCH_OV --> ARCH_FORGE

    ARCH_FORGE --> ADR6
    ARCH_FORGE --> SHOW_SKILLS
    SHOW_SKILLS --> SHOW_THREAD

    ARCH_DASH --> API_CP
    ARCH_API --> API_WH
    ARCH_API --> API_SYM

    ADR3 --> SCH_DB
    RB_DB --> SCH_DB
    SCH_ENV --> ARCH_OV
```

## Tag Taxonomy

| Prefix | Values | Purpose |
|--------|--------|---------|
| `domain/` | `auth`, `database`, `billing`, `dashboard`, `api`, `symphony-client`, `infra`, `all` | Which subsystem the note covers |
| `phase/` | `1` (foundation), `2` (schema+SDK), `3` (dashboard), `4` (polish), `5` (scale) | Roadmap phase |
| `status/` | `draft`, `active`, `deprecated` | Note lifecycle |
| `type/` | `architecture`, `api-contract`, `decision`, `runbook`, `schema`, `index`, `glossary`, `template` | Document type |

## Traversal Instructions

1. **Start here** -- read this index to orient yourself in the knowledge graph
2. **Understand the system** -- read [[architecture/overview]] and [[glossary]]
3. **Find the relevant subsystem** -- follow links to specific architecture notes
4. **Check for decisions** -- before proposing alternatives, read [[decisions/adr-001-next-forge]] through the relevant ADRs
5. **Follow runbooks** -- for operational tasks, use the runbook for that workflow
6. **Use templates** -- when creating new docs, copy from [[_templates/adr]], [[_templates/architecture-note]], [[_templates/runbook]], [[_templates/api-contract]], or [[_templates/schema-note]]

## Document Registry

### Architecture
- [[architecture/overview]] -- System architecture with Mermaid diagrams
- [[architecture/monorepo-topology]] -- Turborepo workspace map
- [[architecture/app-dashboard]] -- `apps/app` (dashboard :3000)
- [[architecture/app-api]] -- `apps/api` (API :3002)
- [[architecture/package-map]] -- All 20 packages with dependencies
- [[architecture/data-flow]] -- Request flow diagrams
- [[architecture/symphony-forge-cli]] -- CLI architecture, layer system, build pipeline

### API Contracts
- [[api-contracts/symphony-http-api]] -- Symphony engine HTTP API
- [[api-contracts/control-plane-api]] -- Control plane REST API
- [[api-contracts/webhook-contracts]] -- Stripe and Clerk webhook schemas

### Decisions
- [[decisions/adr-001-next-forge]] -- Why next-forge as the foundation
- [[decisions/adr-002-clerk-auth]] -- Clerk as auth provider
- [[decisions/adr-003-prisma-neon]] -- Prisma ORM + Neon PostgreSQL
- [[decisions/adr-004-knowledge-system]] -- This knowledge system
- [[decisions/adr-005-control-harness]] -- Control metalayer design
- [[decisions/adr-006-composable-layers]] -- Composable layer architecture

### Runbooks
- [[runbooks/local-dev-setup]] -- Getting started from scratch
- [[runbooks/database-migration]] -- Schema change workflow
- [[runbooks/add-new-package]] -- Creating new workspace packages

### Schemas
- [[schemas/database-schema]] -- Prisma schema documentation
- [[schemas/env-variables]] -- Environment variables catalog

### Showcase
- [[showcase/symphony-forge]] -- Product showcase video (35s, Remotion)
- [[showcase/skills-inventory]] -- Agent skills ecosystem inventory and visualization
- [[showcase/thread]] -- 7-post X thread for skills showcase

### Glossary
- [[glossary]] -- Key terms and definitions

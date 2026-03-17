---
title: "[Schema Name]"
type: schema
domain: # auth | database | billing | dashboard | api | symphony-client
phase: # 1 | 2 | 3 | 4 | 5
status: draft
tags:
  - domain/{area}
  - phase/{n}
  - status/draft
  - type/schema
---

# [Schema Name]

> [!context]
> Brief description of what this schema defines and where it is used.

## Overview

<!-- What data does this schema describe? Where is it defined? -->

## Schema Definition

<!-- The actual schema, in whatever format is appropriate -->

```
# Prisma, JSON Schema, TypeScript interface, env var table, etc.
```

## Entity Relationship Diagram

```mermaid
erDiagram
    EntityA ||--o{ EntityB : "relationship"
    EntityA {
        string id PK
        string name
    }
    EntityB {
        string id PK
        string entityAId FK
    }
```

## Field Reference

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| | | | |

## Enums

| Enum | Values | Description |
|------|--------|-------------|
| | | |

## Conventions

<!-- Naming conventions, patterns, constraints -->

## Migration History

<!-- Notable schema changes -->

| Date | Change | Migration |
|------|--------|-----------|
| | | |

## Related

- [[schemas/database-schema]]
- [[runbooks/database-migration]]

---
title: "Runbook: Database Migration"
type: runbook
domain: database
phase: 1
status: active
tags:
  - domain/database
  - phase/1
  - status/active
  - type/runbook
---

# Runbook: Database Migration

> [!context]
> This runbook covers the database schema change workflow using Prisma migrations against Neon PostgreSQL. All schema changes go through `packages/database/prisma/schema.prisma`.

## When to Use This Runbook

- Adding a new model (table)
- Modifying existing model fields
- Adding or modifying indexes
- Changing enum values
- Any change to `schema.prisma`

> [!decision]
> Per [[decisions/adr-005-control-harness]], database migrations require an ADR for significant schema changes. Minor additive changes (e.g., adding an optional field) may skip the ADR if they are backward-compatible.

## Pre-Flight Checklist

- [ ] Read the current schema: `packages/database/prisma/schema.prisma`
- [ ] Review [[schemas/database-schema]] for context
- [ ] Check if an ADR is needed (significant changes)
- [ ] Ensure `DATABASE_URL` is set in your environment

## Steps

### 1. Edit the Schema

Modify `packages/database/prisma/schema.prisma`:

```prisma
// Example: adding a new model
model WorkflowVersion {
  id         String   @id @default(cuid())
  workflowId String
  version    Int
  content    String
  changeNote String?
  createdAt  DateTime @default(now())

  @@index([workflowId])
  @@map("workflow_versions")
}
```

### 2. Format the Schema

```bash
cd packages/database && bunx prisma format
```

This normalizes whitespace and field alignment.

### 3. Create Migration (Development)

For development with migration files:

```bash
bun migrate
```

This runs three commands in sequence:
1. `prisma format` -- format the schema
2. `prisma generate` -- regenerate the TypeScript client
3. `prisma migrate dev` -- create a migration file and apply it

Prisma will prompt for a migration name. Use a descriptive name:
```
add_workflow_versions_table
```

The migration file is created at:
```
packages/database/prisma/migrations/{timestamp}_{name}/migration.sql
```

### 4. Prototyping (No Migration Files)

For rapid prototyping where you do not want to create migration files:

```bash
bun db:push
```

> [!warning]
> `db:push` can be destructive. It will drop data if you remove columns or tables. Only use this for development databases.

### 5. Verify Generated Client

After migration, check that the generated client includes your new types:

```
packages/database/generated/
├── client.ts       # PrismaClient with new model methods
├── models.ts       # TypeScript types for all models
├── enums.ts        # Enum types
└── models/{Model}.ts  # Individual model types
```

### 6. Update Documentation

- Update [[schemas/database-schema]] with the new model/field documentation
- If the change is significant, create an ADR in [[decisions/]]

### 7. Test

```bash
bun test
```

Ensure all existing tests pass and add tests for the new schema functionality.

## Production Deployment

For deploying migrations to production/staging:

```bash
bun migrate:deploy
```

This runs:
1. `prisma generate` -- regenerate client
2. `prisma migrate deploy` -- apply pending migrations (no interactive prompts)

> [!important]
> `migrate deploy` only applies pending migrations. It never creates new migration files. The migration files must already exist from development.

## Rollback

Prisma does not have a built-in rollback command. To reverse a migration:

1. Create a new migration that undoes the change
2. Apply with `bun migrate`

For emergencies, you can manually edit the database and mark the migration as rolled back in the `_prisma_migrations` table.

## Neon Branch Strategy

Neon supports database branching for safe schema development:

1. Create a branch from production in the Neon dashboard
2. Point `DATABASE_URL` to the branch
3. Develop and test the migration
4. Merge the branch (or apply the migration to production)

## Conventions

| Convention | Rule |
|------------|------|
| Table naming | `@@map("snake_case")` for PostgreSQL table names |
| ID format | `@id @default(cuid())` for all primary keys |
| Timestamps | `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` |
| Soft deletes | `deletedAt DateTime?` on models that support soft deletion |
| Tenant scoping | `@@index([organizationId])` on every tenant-scoped table |
| Token fields | `BigInt` type for token counts (large numbers) |
| Relation mode | `relationMode = "prisma"` (application-level relations) |

## Related

- [[schemas/database-schema]] -- Full schema documentation
- [[decisions/adr-003-prisma-neon]] -- Why Prisma + Neon
- [[runbooks/local-dev-setup]] -- Development environment setup
- [[architecture/data-flow]] -- Database access patterns

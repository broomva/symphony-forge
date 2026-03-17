---
title: "Runbook: Add New Package"
type: runbook
domain: infra
phase: 1
status: active
tags:
  - domain/infra
  - phase/1
  - status/active
  - type/runbook
---

# Runbook: Add New Package

> [!context]
> This runbook covers creating a new workspace package under `packages/`. All shared code in Symphony Cloud lives in `@repo/*` packages. Follow these steps to create a properly structured package.

## When to Use This Runbook

- Extracting shared logic from an app into a reusable package
- Adding a new external service integration
- Creating a new domain-specific module (e.g., `@repo/symphony-client`)

## Pre-Flight Checklist

- [ ] Confirm the functionality does not already exist in an existing package (see [[architecture/package-map]])
- [ ] Choose a package name following the `@repo/{name}` convention
- [ ] Determine if the package needs `server-only` (contains secrets or server APIs)

## Steps

### 1. Create Package Directory

```bash
mkdir -p packages/{package-name}
```

### 2. Create `package.json`

```json
{
  "name": "@repo/{package-name}",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "dependencies": {
    "@t3-oss/env-nextjs": "^0.13.10",
    "server-only": "^0.0.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.9.3"
  }
}
```

> [!tip]
> Remove `server-only` from dependencies if the package needs to run in both server and client environments (e.g., a pure utility library).

### 3. Create `tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Create `keys.ts` (If Package Has Env Vars)

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      MY_SERVICE_API_KEY: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      MY_SERVICE_API_KEY: process.env.MY_SERVICE_API_KEY,
    },
  });
```

### 5. Create `index.ts`

```typescript
import "server-only"; // Remove if client-compatible

// Export your package's public API
export { MyClient } from "./client";
export type { MyConfig, MyResponse } from "./types";
```

### 6. Install Dependencies

From the repository root:

```bash
bun install
```

Bun automatically resolves the new workspace package.

### 7. Add to Consuming Apps

In the consuming app's `package.json`:

```json
{
  "dependencies": {
    "@repo/{package-name}": "workspace:*"
  }
}
```

Then import:

```typescript
import { MyClient } from "@repo/{package-name}";
```

### 8. Register Environment Variables

If the package has env vars, add them to consuming apps' `env.ts`:

```typescript
import { keys as packageNameKeys } from "@repo/{package-name}/keys";

export const env = createEnv({
  extends: [packageNameKeys()],
  // ...
});
```

### 9. Update Documentation

- Update [[architecture/package-map]] with the new package
- Update [[schemas/env-variables]] if new env vars are introduced
- Update [[architecture/monorepo-topology]] if the structure changed significantly

### 10. Run Checks

```bash
bun check    # Lint
bun build    # Ensure build passes
bun test     # Run tests
```

## Package Patterns

### Server-Only Package (e.g., database, auth)

```typescript
// index.ts
import "server-only";
export { client } from "./client";
```

### Universal Package (e.g., types, utils)

```typescript
// index.ts — no "server-only" import
export { formatDate } from "./utils";
export type { Config } from "./types";
```

### Package with Client/Server Split (e.g., auth)

```
packages/{name}/
├── client.ts    # Client-safe exports ('use client' components)
├── server.ts    # Server-only exports (import "server-only")
├── keys.ts      # Env vars
└── index.ts     # Re-exports
```

## Naming Conventions

| Convention | Example |
|------------|---------|
| Package directory | `packages/symphony-client` |
| Package name | `@repo/symphony-client` |
| Import path | `@repo/symphony-client` |
| Sub-path imports | `@repo/symphony-client/types` |

## Related

- [[architecture/package-map]] -- Complete package catalog
- [[architecture/monorepo-topology]] -- Workspace structure
- [[schemas/env-variables]] -- Environment variable catalog
- [[decisions/adr-001-next-forge]] -- Monorepo foundation

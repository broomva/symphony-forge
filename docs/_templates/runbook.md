---
title: "Runbook: [Task Name]"
type: runbook
domain: # auth | database | billing | dashboard | api | symphony-client | infra
phase: # 1 | 2 | 3 | 4 | 5
status: draft
tags:
  - domain/{area}
  - phase/{n}
  - status/draft
  - type/runbook
---

# Runbook: [Task Name]

> [!context]
> Brief description of what this runbook covers and when to use it.

## When to Use This Runbook

<!-- Specific scenarios that trigger this procedure -->

- Scenario 1
- Scenario 2

## Pre-Flight Checklist

- [ ] Prerequisite 1
- [ ] Prerequisite 2
- [ ] Prerequisite 3

## Steps

### 1. [First Step]

```bash
# Command
```

<!-- Explanation -->

### 2. [Second Step]

```bash
# Command
```

<!-- Explanation -->

### 3. [Third Step]

```bash
# Command
```

<!-- Explanation -->

## Verification

<!-- How to verify the procedure completed successfully -->

| Check | Expected Result |
|-------|-----------------|
| | |

## Rollback

<!-- How to undo the changes if something goes wrong -->

> [!warning]
> Describe any destructive steps and their rollback procedures.

## Troubleshooting

### [Common Issue 1]

<!-- Symptom, cause, fix -->

### [Common Issue 2]

<!-- Symptom, cause, fix -->

## Related

- [[runbooks/local-dev-setup]]

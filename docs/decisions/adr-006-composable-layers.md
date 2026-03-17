---
title: "ADR-006: Composable Layer Architecture"
type: decision
domain: all
phase: 1
status: accepted
tags:
  - domain/all
  - phase/1
  - status/active
  - type/decision
---

# ADR-006: Composable Layer Architecture

> **Status**: Accepted (2026-03)

## Context

symphony-forge needs to add a multi-file control metalayer to next-forge projects. Different teams have different needs:

- Some want full governance (all 5 layers)
- Some only want agent instructions (consciousness layer)
- Some want build automation without the knowledge graph
- Some want to start minimal and add layers incrementally

A monolithic scaffold that writes everything at once fails these use cases.

## Options Considered

### Option A: Monolithic scaffold
One command writes all files. Simple but inflexible.

### Option B: Feature flags
One scaffold with `--no-docs`, `--no-harness` flags. Combinatorial explosion of flags.

### Option C: Composable layers (selected)
Independent layer modules that self-compose based on what's installed.

## Decision

Implement a **composable layer system** where each layer:

1. **Declares** its name, description, and soft dependencies
2. **Generates** a set of `FileEntry[]` from a `ProjectConfig`
3. **Adapts** its content based on co-installed layers (via `hasLayer()`)
4. **Operates independently** — every layer produces valid output alone

The five layers are:

| Layer | Files | Purpose |
|-------|-------|---------|
| **control** | `.control/*.yaml` | Governance gates, command registry, topology |
| **harness** | `scripts/harness/*.sh`, `Makefile.control`, CI | Build automation |
| **knowledge** | `docs/` skeleton | Obsidian knowledge graph |
| **consciousness** | `CLAUDE.md`, `AGENTS.md` | AI agent instructions |
| **autoany** | `.control/egri.yaml` | EGRI self-improvement loop |

## Rationale

1. **Incremental adoption** — teams can start with one layer and add more later
2. **No hard dependencies** — soft deps emit helpful warnings instead of errors
3. **Single interface** — all layers implement `Layer`, making it trivial to add new ones
4. **Manifest tracking** — `.symphony-forge.json` records what's installed, enabling safe re-runs
5. **Template portability** — `ProjectConfig` carries package manager choice through all layers

## Consequences

### Positive
- Users can customize their metalayer to match their governance needs
- Adding a new layer is one file + one registry entry
- Layers can be tested in isolation
- `--force` flag allows safe re-scaffolding

### Negative
- Soft dependency logic adds conditional branches to template generation
- Content quality is lower when dependencies are missing (mitigated by `> [!warning]` callouts)

### Risks
- Layer count growing unbounded — mitigated by keeping the interface minimal and layers focused
- Circular soft dependencies — mitigated by the directed dependency graph (consciousness depends on others, not vice versa)

## Related

- [[decisions/adr-005-control-harness]] — The control harness this layer system implements
- [[architecture/symphony-forge-cli]] — CLI architecture showing layer engine

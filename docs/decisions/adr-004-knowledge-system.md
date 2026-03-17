---
title: "ADR-004: Obsidian Knowledge System"
type: decision
domain: all
phase: 1
status: active
tags:
  - domain/all
  - phase/1
  - status/active
  - type/decision
---

# ADR-004: Obsidian Knowledge System

## Status

**Accepted** -- 2026-03

## Context

Symphony Cloud is developed by both human engineers and AI coding agents. Both need:

1. **Navigable architecture documentation** that stays in sync with the codebase
2. **Decision records** that explain *why* things are built a certain way
3. **Operational runbooks** for repeatable tasks
4. **API contracts** that define integration surfaces
5. **A system that agents can traverse** to build context before making changes

Traditional documentation approaches (wiki, Notion, Google Docs) are disconnected from the codebase. README files are flat and unlinked. We need a knowledge graph that lives in the repo.

## Options Considered

### Option A: Obsidian-flavored Markdown in `docs/`

- Plain Markdown files with YAML frontmatter and `[[wikilinks]]`
- Directory-based organization (architecture, decisions, runbooks, schemas)
- Mermaid diagrams for visual architecture
- Callout blocks (`> [!decision]`, `> [!warning]`) for structured annotations
- Can be opened in Obsidian for graph visualization
- Can be read by any Markdown renderer or AI agent

### Option B: Mintlify docs (existing `apps/docs/`)

- Already exists in the monorepo
- Designed for public-facing API docs
- MDX format with custom components
- Not designed for internal architecture decisions or agent traversal
- Separate build process

### Option C: GitHub Wiki

- Built into the GitHub repository
- Separate git repo (not in the main codebase)
- No wikilink support
- No frontmatter/tag system
- Hard for agents to access

### Option D: Notion / Confluence

- Rich editing experience
- Completely disconnected from the codebase
- Requires manual sync
- Not accessible to CLI-based agents

## Decision

> [!decision]
> Create an **Obsidian-flavored Markdown knowledge graph** in the `docs/` directory at the repository root. This system is separate from `apps/docs/` (the Mintlify public docs) and serves as the internal knowledge base for both human developers and AI agents.

## Rationale

- **In-repo**: Documentation lives next to the code it describes. Git tracks changes, PRs review doc updates alongside code changes.
- **Agent-traversable**: `[[wikilinks]]` create a navigable graph. Agents start at `docs/_index.md` and follow links to relevant context.
- **Tag taxonomy**: YAML frontmatter with `domain/`, `phase/`, `status/`, `type/` tags enables filtered queries (e.g., "find all active architecture docs for the database domain").
- **Visual**: Mermaid diagrams render in GitHub, VS Code, and Obsidian. Callout blocks provide structured annotations.
- **Tooling-agnostic**: Plain Markdown works everywhere. Obsidian provides optional graph visualization but is not required.
- **Templates**: Standardized templates (`_templates/`) ensure consistency across all document types.

## Structure

```
docs/
├── _index.md                # Entry point and graph map
├── _templates/              # Note templates
├── architecture/            # System architecture notes
├── api-contracts/           # API specifications
├── decisions/               # Architecture Decision Records
├── runbooks/                # Operational procedures
├── schemas/                 # Data schemas and env vars
└── glossary.md              # Term definitions
```

## Format Conventions

### Frontmatter

Every file has YAML frontmatter:

```yaml
---
title: "Note Title"
type: architecture | api-contract | decision | runbook | schema
domain: auth | database | billing | dashboard | api | symphony-client
phase: 1 | 2 | 3 | 4 | 5
status: draft | active | deprecated
tags:
  - domain/{area}
  - phase/{n}
  - status/{state}
  - type/{doc-type}
---
```

### Linking

- Internal links: `[[architecture/overview]]`
- Section links: `[[architecture/overview#technology-stack]]`
- No relative file paths -- always use note names

### Callouts

- `> [!decision]` -- for key decisions
- `> [!warning]` -- for risks and gotchas
- `> [!context]` -- for background information
- `> [!tip]` -- for best practices
- `> [!important]` -- for critical notes

### Diagrams

Use Mermaid for all visual diagrams (architecture, sequences, data flow).

## Consequences

### Positive
- Documentation is version-controlled alongside code
- Agents can build context by traversing the graph
- Templates enforce consistency
- Tags enable programmatic querying
- Works with any Markdown editor

### Negative
- Requires discipline to keep docs updated with code changes
- Wikilinks are not standard Markdown (require Obsidian or compatible renderer)
- No built-in search (relies on file search / grep)
- Graph visualization requires Obsidian

### Mitigations
- Pre-commit hooks check for broken wikilinks and index freshness
- ADR template mandates "Related" section with wikilinks
- Biome config excludes `docs/` from linting (`"!docs"` in `biome.jsonc`)

## Related

- [[_index]] -- Knowledge graph entry point
- [[decisions/adr-005-control-harness]] -- Control metalayer that enforces doc quality
- [[_templates/adr]] -- ADR template
- [[_templates/architecture-note]] -- Architecture note template

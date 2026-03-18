---
title: "Showcase: X Thread — symphony-forge"
type: architecture
domain: all
phase: 1
status: active
tags:
  - domain/all
  - phase/1
  - status/active
  - type/architecture
---

# symphony-forge — X Thread

> [!context]
> 7-post X thread for the symphony-forge product launch. Attach the showcase video to Post 1.
>
> **Video**: `projects/symphony-forge-showcase/out/showcase.mp4` or [GitHub Release](https://github.com/broomva/symphony-forge/releases/tag/v0.1.0)

---

## Post 1 (Hook + Video)

> [Attach: showcase.mp4]

I built a CLI that scaffolds any next-forge project with a control metalayer — governance, automation, knowledge graph, and AI agent instructions in one command.

It's called symphony-forge. Open source, Apache 2.0.

Here's what it does and why it matters:

---

## Post 2 (The problem)

Every next-forge project starts the same way:

You clone the template, then spend days adding CI workflows, writing CLAUDE.md, setting up docs, creating policy gates, wiring git hooks...

All of that is boilerplate. And it's the same boilerplate every time.

symphony-forge generates all of it in seconds.

---

## Post 3 (The 5 layers)

Five composable layers — use all of them or pick what you need:

- control — policy gates + command registry + repo topology
- harness — bash scripts, Makefile, CI workflow, git hooks
- knowledge — Obsidian docs skeleton with templates and ADRs
- consciousness — CLAUDE.md + AGENTS.md (metalayer-aware)
- autoany — EGRI self-improvement loop config

Each layer works independently. Install one now, add more later.

---

## Post 4 (Control theory)

The layers aren't arbitrary. They map to control theory:

- Sensors → policy gates detect high-risk changes
- Actuators → harness scripts enforce standards
- Model → knowledge graph is the system's self-description
- Controller → CLAUDE.md/AGENTS.md close the feedback loop
- Feedback → entropy audit measures drift

Your repo becomes a control system that agents can reason about.

---

## Post 5 (How to use it)

Three commands:

```
npx symphony-forge init my-app       # new project
npx symphony-forge layer all         # existing project
npx symphony-forge audit             # check entropy
```

Works with bun, npm, yarn, or pnpm. Generates 30+ files. Tracks state in .symphony-forge.json.

Also ships as an agent skill — installs across 42+ AI coding agents:

```
npx skills add broomva/symphony-forge
```

---

## Post 6 (What gets generated)

One command, full scaffold:

```
.control/policy.yaml          # 6 risk gates
.control/commands.yaml         # 8 canonical commands
.control/topology.yaml         # repo map
scripts/harness/smoke.sh       # quick validation
scripts/harness/ci.sh          # full pipeline
docs/_index.md                 # knowledge graph entry
docs/decisions/adr-001-*.md    # first ADR
CLAUDE.md                      # agent instructions
AGENTS.md                      # agent constraints
Makefile.control               # make targets
.github/workflows/ci.yml       # GitHub Actions
```

Every file adapts based on which layers are installed.

---

## Post 7 (CTA)

symphony-forge is open source: github.com/broomva/symphony-forge

If you're starting a next-forge project — or any Turborepo monorepo — and want agents to operate safely from day one, this is the fastest way to get there.

What would you add to the metalayer?

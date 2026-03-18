// Arcan-inspired palette
// AI Blue: #0066FF | Web3 Green: #00CC66 | BG: #12121A / #001F3F
// Alert Red: #FF3B30 | Success Green: #34C759

export interface Layer {
  color: string;
  description: string;
  files: string;
  icon: string;
  name: string;
}

export const layers: Layer[] = [
  {
    name: "control",
    icon: "\u2699",
    color: "#0066FF",
    files: ".control/*.yaml",
    description: "Policy gates, command registry, repo topology",
  },
  {
    name: "harness",
    icon: "\u2692",
    color: "#00CC66",
    files: "scripts/harness/*.sh",
    description: "Build automation, git hooks, CI/CD workflow",
  },
  {
    name: "knowledge",
    icon: "\uD83D\uDCDA",
    color: "#34C759",
    files: "docs/ skeleton",
    description: "Obsidian knowledge graph with templates",
  },
  {
    name: "consciousness",
    icon: "\uD83E\uDDE0",
    color: "#3399FF",
    files: "CLAUDE.md + AGENTS.md",
    description: "AI agent instructions, metalayer-aware",
  },
  {
    name: "autoany",
    icon: "\u267B",
    color: "#FF3B30",
    files: ".control/egri.yaml",
    description: "EGRI self-improvement loop config",
  },
];

export interface Command {
  cmd: string;
  description: string;
}

export const commands: Command[] = [
  {
    cmd: "npx symphony-forge init my-app",
    description: "Scaffold new project",
  },
  { cmd: "npx symphony-forge layer all", description: "Add all 5 layers" },
  {
    cmd: "npx symphony-forge layer control",
    description: "Add single layer",
  },
  { cmd: "npx symphony-forge audit", description: "Run entropy audit" },
];

export const fileTree = [
  { path: ".control/", indent: 0, color: "#0066FF" },
  { path: "policy.yaml", indent: 1, color: "#0066FF" },
  { path: "commands.yaml", indent: 1, color: "#0066FF" },
  { path: "topology.yaml", indent: 1, color: "#0066FF" },
  { path: "egri.yaml", indent: 1, color: "#FF3B30" },
  { path: "scripts/harness/", indent: 0, color: "#00CC66" },
  { path: "smoke.sh", indent: 1, color: "#00CC66" },
  { path: "check.sh", indent: 1, color: "#00CC66" },
  { path: "ci.sh", indent: 1, color: "#00CC66" },
  { path: "docs/", indent: 0, color: "#34C759" },
  { path: "_index.md", indent: 1, color: "#34C759" },
  { path: "architecture/", indent: 1, color: "#34C759" },
  { path: "decisions/", indent: 1, color: "#34C759" },
  { path: "CLAUDE.md", indent: 0, color: "#3399FF" },
  { path: "AGENTS.md", indent: 0, color: "#3399FF" },
  { path: "Makefile.control", indent: 0, color: "#00CC66" },
  { path: ".github/workflows/ci.yml", indent: 0, color: "#00CC66" },
];

export const metalayerMapping = [
  { theory: "Sensors", implementation: "Policy gates", color: "#0066FF" },
  {
    theory: "Actuators",
    implementation: "Harness scripts",
    color: "#00CC66",
  },
  { theory: "Model", implementation: "Knowledge graph", color: "#34C759" },
  {
    theory: "Controller",
    implementation: "CLAUDE.md / AGENTS.md",
    color: "#3399FF",
  },
  { theory: "Feedback", implementation: "EGRI + audit", color: "#FF3B30" },
];

export const stats = {
  layers: 5,
  generatedFiles: 30,
  agents: 42,
  packageManagers: 4,
};

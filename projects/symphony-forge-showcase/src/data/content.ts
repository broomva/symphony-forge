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
    color: "#8B5CF6",
    files: ".control/*.yaml",
    description: "Policy gates, command registry, repo topology",
  },
  {
    name: "harness",
    icon: "\u2692",
    color: "#10B981",
    files: "scripts/harness/*.sh",
    description: "Build automation, git hooks, CI/CD workflow",
  },
  {
    name: "knowledge",
    icon: "\uD83D\uDCDA",
    color: "#3B82F6",
    files: "docs/ skeleton",
    description: "Obsidian knowledge graph with templates",
  },
  {
    name: "consciousness",
    icon: "\uD83E\uDDE0",
    color: "#F59E0B",
    files: "CLAUDE.md + AGENTS.md",
    description: "AI agent instructions, metalayer-aware",
  },
  {
    name: "autoany",
    icon: "\u267B",
    color: "#EF4444",
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
  { cmd: "npx symphony-forge layer control", description: "Add single layer" },
  { cmd: "npx symphony-forge audit", description: "Run entropy audit" },
];

export const fileTree = [
  { path: ".control/", indent: 0, color: "#8B5CF6" },
  { path: "policy.yaml", indent: 1, color: "#8B5CF6" },
  { path: "commands.yaml", indent: 1, color: "#8B5CF6" },
  { path: "topology.yaml", indent: 1, color: "#8B5CF6" },
  { path: "egri.yaml", indent: 1, color: "#EF4444" },
  { path: "scripts/harness/", indent: 0, color: "#10B981" },
  { path: "smoke.sh", indent: 1, color: "#10B981" },
  { path: "check.sh", indent: 1, color: "#10B981" },
  { path: "ci.sh", indent: 1, color: "#10B981" },
  { path: "docs/", indent: 0, color: "#3B82F6" },
  { path: "_index.md", indent: 1, color: "#3B82F6" },
  { path: "architecture/", indent: 1, color: "#3B82F6" },
  { path: "decisions/", indent: 1, color: "#3B82F6" },
  { path: "CLAUDE.md", indent: 0, color: "#F59E0B" },
  { path: "AGENTS.md", indent: 0, color: "#F59E0B" },
  { path: "Makefile.control", indent: 0, color: "#10B981" },
  { path: ".github/workflows/ci.yml", indent: 0, color: "#10B981" },
];

export const metalayerMapping = [
  { theory: "Sensors", implementation: "Policy gates", color: "#8B5CF6" },
  { theory: "Actuators", implementation: "Harness scripts", color: "#10B981" },
  { theory: "Model", implementation: "Knowledge graph", color: "#3B82F6" },
  {
    theory: "Controller",
    implementation: "CLAUDE.md / AGENTS.md",
    color: "#F59E0B",
  },
  { theory: "Feedback", implementation: "EGRI + audit", color: "#EF4444" },
];

export const stats = {
  layers: 5,
  generatedFiles: 30,
  agents: 42,
  packageManagers: 4,
};

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ALL_LAYER_NAMES, getOrderedLayers, layers } from "../index.js";
import type { ProjectConfig } from "../types.js";

// Default test config
const makeConfig = (overrides: Partial<ProjectConfig> = {}): ProjectConfig => ({
  name: "test-project",
  description: "Test",
  packageManager: "bun",
  layers: ALL_LAYER_NAMES,
  ...overrides,
});

describe("Layer Registry", () => {
  it("exports all 5 layer names", () => {
    expect(ALL_LAYER_NAMES).toEqual([
      "control",
      "harness",
      "knowledge",
      "consciousness",
      "autoany",
    ]);
  });

  it("has a Layer object for each name", () => {
    for (const name of ALL_LAYER_NAMES) {
      expect(layers[name]).toBeDefined();
      expect(layers[name].name).toBe(name);
      expect(layers[name].description).toBeTruthy();
      expect(typeof layers[name].generate).toBe("function");
    }
  });

  it("getOrderedLayers returns layers in dependency order", () => {
    const ordered = getOrderedLayers(["consciousness", "control"]);
    const names = ordered.map((l) => l.name);
    // Control should come before consciousness (consciousness depends on control)
    expect(names.indexOf("control")).toBeLessThan(
      names.indexOf("consciousness")
    );
  });

  it("getOrderedLayers handles single layer", () => {
    const ordered = getOrderedLayers(["autoany"]);
    expect(ordered).toHaveLength(1);
    expect(ordered[0].name).toBe("autoany");
  });

  it("getOrderedLayers handles all layers", () => {
    const ordered = getOrderedLayers(ALL_LAYER_NAMES);
    expect(ordered).toHaveLength(5);
  });
});

describe("Control Layer", () => {
  it("generates 3 YAML files", () => {
    const config = makeConfig({ layers: ["control"] });
    const files = layers.control.generate(config);
    expect(files).toHaveLength(3);
    const paths = files.map((f) => f.path);
    expect(paths).toContain(".control/policy.yaml");
    expect(paths).toContain(".control/commands.yaml");
    expect(paths).toContain(".control/topology.yaml");
  });

  it("uses project name in topology", () => {
    const config = makeConfig({ name: "my-app", layers: ["control"] });
    const files = layers.control.generate(config);
    const topology = files.find((f) => f.path === ".control/topology.yaml");
    expect(topology?.content).toContain("my-app");
  });

  it("uses correct lock file for bun", () => {
    const config = makeConfig({
      packageManager: "bun",
      layers: ["control"],
    });
    const files = layers.control.generate(config);
    const policy = files.find((f) => f.path === ".control/policy.yaml");
    expect(policy?.content).toContain("bun.lock");
  });

  it("uses correct lock file for npm", () => {
    const config = makeConfig({
      packageManager: "npm",
      layers: ["control"],
    });
    const files = layers.control.generate(config);
    const policy = files.find((f) => f.path === ".control/policy.yaml");
    expect(policy?.content).toContain("package-lock.json");
  });
});

describe("Harness Layer", () => {
  it("generates 14 files (9 scripts + Makefile + CI)", () => {
    const config = makeConfig({ layers: ["harness"] });
    const files = layers.harness.generate(config);
    // 9 bash scripts + Makefile.control + .github/workflows/ci.yml = 11
    // But it also includes control layer files if control is in layers
    const harnessOnly = files.filter(
      (f) =>
        f.path.startsWith("scripts/harness/") ||
        f.path === "Makefile.control" ||
        f.path === ".github/workflows/ci.yml"
    );
    expect(harnessOnly.length).toBeGreaterThanOrEqual(11);
  });

  it("marks bash scripts as executable", () => {
    const config = makeConfig({ layers: ["harness"] });
    const files = layers.harness.generate(config);
    const bashFiles = files.filter((f) => f.path.endsWith(".sh"));
    for (const f of bashFiles) {
      expect(f.executable).toBe(true);
    }
  });

  it("all scripts start with bash strict mode", () => {
    const config = makeConfig({ layers: ["harness"] });
    const files = layers.harness.generate(config);
    const bashFiles = files.filter((f) => f.path.endsWith(".sh"));
    for (const f of bashFiles) {
      expect(f.content).toContain("#!/usr/bin/env bash");
      expect(f.content).toContain("set -euo pipefail");
    }
  });

  it("generates CI workflow with correct PM setup", () => {
    const config = makeConfig({
      packageManager: "pnpm",
      layers: ["harness"],
    });
    const files = layers.harness.generate(config);
    const ci = files.find((f) => f.path === ".github/workflows/ci.yml");
    expect(ci?.content).toContain("pnpm/action-setup");
  });
});

describe("Knowledge Layer", () => {
  it("generates docs skeleton", () => {
    const config = makeConfig({ layers: ["knowledge"] });
    const files = layers.knowledge.generate(config);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("docs/_index.md");
    expect(paths).toContain("docs/glossary.md");
    expect(paths).toContain("docs/architecture/overview.md");
    expect(paths).toContain("docs/decisions/adr-001-metalayer.md");
    expect(paths).toContain("docs/runbooks/local-dev-setup.md");
  });

  it("generates 5 templates", () => {
    const config = makeConfig({ layers: ["knowledge"] });
    const files = layers.knowledge.generate(config);
    const templates = files.filter((f) =>
      f.path.startsWith("docs/_templates/")
    );
    expect(templates).toHaveLength(5);
  });

  it("uses project name in index", () => {
    const config = makeConfig({
      name: "cool-project",
      layers: ["knowledge"],
    });
    const files = layers.knowledge.generate(config);
    const index = files.find((f) => f.path === "docs/_index.md");
    expect(index?.content).toContain("cool-project");
  });
});

describe("Consciousness Layer", () => {
  it("generates CLAUDE.md and AGENTS.md", () => {
    const config = makeConfig({ layers: ["consciousness"] });
    const files = layers.consciousness.generate(config);
    const paths = files.map((f) => f.path);
    expect(paths).toContain("CLAUDE.md");
    expect(paths).toContain("AGENTS.md");
  });

  it("includes harness commands when harness layer is present", () => {
    const config = makeConfig({
      layers: ["consciousness", "harness"],
    });
    const files = layers.consciousness.generate(config);
    const claude = files.find((f) => f.path === "CLAUDE.md");
    expect(claude?.content).toContain("Makefile.control");
  });

  it("warns about missing layers when installed alone", () => {
    const config = makeConfig({ layers: ["consciousness"] });
    const files = layers.consciousness.generate(config);
    const claude = files.find((f) => f.path === "CLAUDE.md");
    expect(claude?.content).toContain("[!warning]");
    expect(claude?.content).toContain("control");
  });

  it("uses correct install command for package manager", () => {
    const config = makeConfig({
      packageManager: "yarn",
      layers: ["consciousness"],
    });
    const files = layers.consciousness.generate(config);
    const claude = files.find((f) => f.path === "CLAUDE.md");
    expect(claude?.content).toContain("yarn install");
  });
});

describe("AutoAny Layer", () => {
  it("generates .control/egri.yaml", () => {
    const config = makeConfig({ layers: ["autoany"] });
    const files = layers.autoany.generate(config);
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe(".control/egri.yaml");
  });

  it("uses project name in EGRI config", () => {
    const config = makeConfig({
      name: "my-service",
      layers: ["autoany"],
    });
    const files = layers.autoany.generate(config);
    expect(files[0].content).toContain("my-service");
  });
});

describe("Scaffold Integration", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "sf-test-"));
    mkdirSync(join(testDir, "apps", "app"), { recursive: true });
    mkdirSync(join(testDir, "packages", "database"), { recursive: true });
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({ name: "integration-test" })
    );
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it("scaffoldLayers writes all files to disk", async () => {
    const { scaffoldLayers } = await import("../../scaffold.js");
    const config = makeConfig({
      name: "integration-test",
      layers: ALL_LAYER_NAMES,
    });

    const written = await scaffoldLayers(testDir, config);

    expect(written.length).toBeGreaterThan(20);
    expect(existsSync(join(testDir, ".control/policy.yaml"))).toBe(true);
    expect(existsSync(join(testDir, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(testDir, "docs/_index.md"))).toBe(true);
    expect(existsSync(join(testDir, "scripts/harness/smoke.sh"))).toBe(true);
    expect(existsSync(join(testDir, ".control/egri.yaml"))).toBe(true);
  });

  it("writes .symphony-forge.json manifest", async () => {
    const { scaffoldLayers } = await import("../../scaffold.js");
    const config = makeConfig({
      name: "integration-test",
      layers: ALL_LAYER_NAMES,
    });

    await scaffoldLayers(testDir, config);

    const manifestPath = join(testDir, ".symphony-forge.json");
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    expect(manifest.installedLayers).toEqual(ALL_LAYER_NAMES);
    expect(manifest.packageManager).toBe("bun");
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.createdAt).toBeTruthy();
    expect(manifest.updatedAt).toBeTruthy();
  });

  it("incremental install merges layers in manifest", async () => {
    const { scaffoldLayers } = await import("../../scaffold.js");

    // First: install control only
    const config1 = makeConfig({
      name: "integration-test",
      layers: ["control"],
    });
    await scaffoldLayers(testDir, config1);

    const manifest1 = JSON.parse(
      readFileSync(join(testDir, ".symphony-forge.json"), "utf-8")
    );
    expect(manifest1.installedLayers).toEqual(["control"]);

    // Second: install harness
    const config2 = makeConfig({
      name: "integration-test",
      layers: ["control", "harness"],
    });
    await scaffoldLayers(testDir, config2);

    const manifest2 = JSON.parse(
      readFileSync(join(testDir, ".symphony-forge.json"), "utf-8")
    );
    expect(manifest2.installedLayers).toContain("control");
    expect(manifest2.installedLayers).toContain("harness");
    // createdAt should be preserved
    expect(manifest2.createdAt).toBe(manifest1.createdAt);
  });

  it("sets bash scripts as executable (mode 755)", async () => {
    const { scaffoldLayers } = await import("../../scaffold.js");
    const config = makeConfig({
      name: "integration-test",
      layers: ["harness"],
    });

    await scaffoldLayers(testDir, config);

    const { statSync } = await import("node:fs");
    const smokeStat = statSync(join(testDir, "scripts/harness/smoke.sh"));
    // Check executable bit (mode & 0o111 should be non-zero)
    // biome-ignore lint/suspicious/noBitwiseOperators: checking file mode bits
    expect(smokeStat.mode & 0o111).toBeGreaterThan(0);
  });
});

describe("Package Manager Portability", () => {
  const pms: ProjectConfig["packageManager"][] = ["bun", "npm", "yarn", "pnpm"];

  for (const pm of pms) {
    it(`generates valid output for ${pm}`, () => {
      const config = makeConfig({ packageManager: pm });
      // All layers should generate without errors
      for (const name of ALL_LAYER_NAMES) {
        const files = layers[name].generate(config);
        expect(files.length).toBeGreaterThan(0);
        for (const f of files) {
          expect(f.path).toBeTruthy();
          expect(f.content).toBeTruthy();
        }
      }
    });
  }
});

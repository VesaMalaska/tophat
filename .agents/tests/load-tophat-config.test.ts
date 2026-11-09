import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadTophatConfig, parseTophatConfig, TophatConfigError } from "../scripts/load-tophat-config.ts";

const base = () => ({
  schemaVersion: 1,
  workspace: { kind: "web", framework: "sveltekit" },
  documentation: { package: "docs/project", manifest: "manifest.json", derivedTargets: ["README.md", "docs/user-guide/"] },
  validation: {
    scripts: { typecheck: "check", lint: "lint", unit: "test:unit", build: "build" },
    commitGate: ["typecheck", "lint", "unit", "build"],
    developmentPhaseGate: ["unit", "build"],
    projectCompletionGate: ["typecheck", "build"],
  },
  routingMatrix: { "/workspace-init": "Claude Opus" },
});
const parse = (value: unknown) => parseTophatConfig(JSON.stringify(value));
const denies = (value: unknown, pattern: RegExp) =>
  assert.throws(() => parse(value), (error: unknown) =>
    error instanceof TophatConfigError && error.code === "TOPHAT_CONFIG_INVALID" && pattern.test(error.message));

const combinations: Array<[string, string, string[]]> = [
  ["web", "svelte", ["web-ui", "svelte", "web-qa"]],
  ["web", "sveltekit", ["web-ui", "svelte", "sveltekit", "node-server", "web-qa"]],
  ["web", "react", ["web-ui", "react", "web-qa"]],
  ["web", "nextjs", ["web-ui", "react", "nextjs", "node-server", "web-qa"]],
  ["backend", "none", ["node-server"]],
  ["desktop", "svelte", ["electron", "node-main", "renderer-ui", "svelte", "desktop-qa"]],
  ["desktop", "react", ["electron", "node-main", "renderer-ui", "react", "desktop-qa"]],
  ["desktop", "none", ["electron", "node-main", "desktop-qa"]],
];
for (const [kind, framework, capabilities] of combinations) {
  test(`${kind}+${framework} derives exact capabilities`, () => {
    assert.deepEqual(parse({ ...base(), workspace: { kind, framework } }).capabilities, capabilities);
  });
}

test("missing file and malformed JSON deny structurally", () => {
  const root = mkdtempSync(join(tmpdir(), "tophat-config-"));
  try {
    assert.throws(() => loadTophatConfig(root), TophatConfigError);
    mkdirSync(join(root, ".agents"));
    writeFileSync(join(root, ".agents/tophat.config.json"), "{invalid");
    assert.throws(() => loadTophatConfig(root), /not valid JSON/);
    writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify(base()));
    assert.deepEqual(loadTophatConfig(root).capabilities, combinations[1][2]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("missing, unknown, and incompatible workspace data deny", () => {
  denies({ ...base(), workspace: null }, /workspace must be an object/);
  denies({ ...base(), workspace: { kind: "web", framework: "vue" } }, /unsupported workspace/);
  for (const [kind, framework] of [["backend", "sveltekit"], ["web", "none"], ["desktop", "nextjs"]])
    denies({ ...base(), workspace: { kind, framework } }, /unsupported workspace/);
  denies({ ...base(), workspace: { kind: "web", framework: "react", capabilities: ["svelte"] } }, /not supported/);
  denies({ ...base(), capabilities: ["svelte"] }, /not supported/);
  denies({ ...base(), schemaVersion: 2 }, /schemaVersion/);
});

test("invalid paths and private targets deny", () => {
  for (const path of ["/etc/project", "../outside", "docs/../outside", "C:/outside", "docs\\project", "docs//project"])
    denies({ ...base(), documentation: { ...base().documentation, package: path } }, /workspace-relative path/);
  denies({ ...base(), documentation: { ...base().documentation, manifest: "../manifest.json" } }, /workspace-relative path/);
  for (const path of [".agents/", ".agents/private.md", "Strategy.md", "docs/../private"])
    denies({ ...base(), documentation: { ...base().documentation, derivedTargets: [path] } }, /private orchestration|workspace-relative/);
  denies({ ...base(), documentation: { ...base().documentation, derivedTargets: ["README.md", "README.md/"] } }, /duplicate derived target/);
});

test("script names, categories, and required mappings deny", () => {
  denies({ ...base(), validation: { ...base().validation, scripts: { unit: "pnpm run test" } } }, /package-script name|without a script/);
  denies({ ...base(), validation: { ...base().validation, commitGate: ["coverage"] } }, /without a script/);
  denies({ ...base(), validation: { ...base().validation, commitGate: ["custom"] } }, /unknown category/);
  denies({ ...base(), validation: { ...base().validation, unexpectedGate: ["unit"] } }, /not supported/);
  denies({ ...base(), validation: { ...base().validation, commitGate: [] } }, /nonempty category array/);
  assert.deepEqual(parse({ ...base(), validation: { ...base().validation,
    developmentPhaseGate: [], projectCompletionGate: [] } }).validation.projectCompletionGate, []);
  denies({ ...base(), validation: { ...base().validation, developmentPhaseGate: null } }, /category array/);
  denies({ ...base(), validation: { ...base().validation, commitGate: ["unit", "unit"] } }, /repeats unit/);
});

test("validated object and nested collections are immutable; gate order is retained", () => {
  const config = parse(base());
  assert.deepEqual(config.validation.commitGate, ["typecheck", "lint", "unit", "build"]);
  assert.ok(Object.isFrozen(config));
  assert.ok(Object.isFrozen(config.workspace));
  assert.ok(Object.isFrozen(config.validation.scripts));
  assert.ok(Object.isFrozen(config.documentation.derivedTargets));
  assert.ok(Object.isFrozen(config.capabilities));
  assert.throws(() => (config.capabilities as string[]).push("svelte"));
  assert.throws(() => (config.validation.scripts as Record<string, string>).unit = "other");
  assert.throws(() => (config.routingMatrix as Record<string, string>)["/workspace-init"] = "Other");
});

test("vault template is visibly unconfigured and fails to load", () => {
  assert.throws(() => loadTophatConfig(process.cwd()), /workspace must be an object/);
});

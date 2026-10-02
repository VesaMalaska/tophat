import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { evaluateSvelteWrite } from "../scripts/enforce-svelte-runes.ts";
import { parseTophatConfig } from "../scripts/load-tophat-config.ts";
import { selectTaskGuidance, TaskGuidanceError, type TaskGuidanceRequest } from "../scripts/select-task-guidance.ts";

const source = (kind: string, framework: string) => ({
  schemaVersion: 1, workspace: { kind, framework },
  documentation: { package: "docs/project", manifest: "manifest.json", derivedTargets: ["README.md"] },
  validation: { scripts: { unit: "test" }, commitGate: ["unit"], developmentPhaseGate: ["unit"], projectCompletionGate: ["unit"] },
  routingMatrix: { "/workspace-init": "Claude Opus" },
});
const request = (skills: string[], taskTopics: TaskGuidanceRequest["taskTopics"] = [], frameworkInstructions: TaskGuidanceRequest["frameworkInstructions"] = []): TaskGuidanceRequest =>
  ({ requestedSkills: skills, taskTopics, frameworkInstructions });
const write = (code: string) => JSON.stringify({ toolCall: { name: "write_to_file", args: { TargetFile: "src/Example.svelte", CodeContent: code } } });
function fixture(kind: string, framework: string, configSource = JSON.stringify(source(kind, framework))) {
  const root = mkdtempSync(join(tmpdir(), "tophat-framework-"));
  mkdirSync(join(root, ".agents"));
  writeFileSync(join(root, ".agents/tophat.config.json"), configSource);
  return root;
}

test("Svelte guard enforces only Svelte profiles and makes non-applicability visible", () => {
  const legacy = write("export let name;\n$: doubled = count * 2;");
  for (const [kind, framework] of [["web", "svelte"], ["web", "sveltekit"], ["desktop", "svelte"]]) {
    const root = fixture(kind, framework);
    try {
      assert.equal(evaluateSvelteWrite(legacy, root).status, "SVELTE_5_CONSTRAINT_VIOLATION");
      assert.equal(evaluateSvelteWrite(write("let { name } = $props();"), root).decision, "allow");
    } finally { rmSync(root, { recursive: true, force: true }); }
  }
  for (const [kind, framework] of [["web", "react"], ["web", "nextjs"], ["backend", "none"], ["desktop", "react"], ["desktop", "none"]]) {
    const root = fixture(kind, framework);
    try { assert.deepEqual(evaluateSvelteWrite(legacy, root).decision, "allow"); assert.equal(evaluateSvelteWrite(legacy, root).status, "SKIPPED_NOT_APPLICABLE"); }
    finally { rmSync(root, { recursive: true, force: true }); }
  }
});

test("hook rejects malformed input or configuration, including non-Svelte workspaces", () => {
  const root = fixture("web", "react");
  const badConfig = fixture("web", "react", "{");
  try {
    assert.equal(evaluateSvelteWrite("{", root).status, "HOOK_INPUT_INVALID");
    assert.equal(evaluateSvelteWrite("{}", root).decision, "deny");
    assert.equal(evaluateSvelteWrite(JSON.stringify({ toolCall: { name: "write_to_file", args: { TargetFile: "x.svelte" } } }), root).status, "HOOK_INPUT_INVALID");
    assert.equal(evaluateSvelteWrite(write("export let x"), badConfig).status, "TOPHAT_CONFIG_INVALID");
    assert.equal(evaluateSvelteWrite(write("export let x"), process.cwd()).status, "TOPHAT_CONFIG_INVALID");
  } finally { rmSync(root, { recursive: true, force: true }); rmSync(badConfig, { recursive: true, force: true }); }
});

test("registered Svelte hook executes on stdin/stdout with a real host config", () => {
  const root = fixture("web", "sveltekit");
  try {
    const script = resolve(".agents/scripts/enforce-svelte-runes.ts");
    const run = spawnSync(process.execPath, [script], { cwd: root, input: write("export let foo;"), encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(JSON.parse(run.stdout).status, "SVELTE_5_CONSTRAINT_VIOLATION");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("all eight workspace profiles select matching framework and smoke boundaries", () => {
  const rows: Array<[string, string, string[], string[], string, string | null]> = [
    ["web", "svelte", ["svelte5-runes-architecture", "playwright-qa-flows-web"], ["svelte"], "web", null],
    ["web", "sveltekit", ["svelte5-kit-architecture", "nodejs-backend-architecture"], ["sveltekit"], "web", null],
    ["web", "react", ["react-architecture", "playwright-qa-flows-web"], ["react"], "web", null],
    ["web", "nextjs", ["react-architecture", "nextjs-architecture", "nodejs-backend-architecture"], ["react", "nextjs"], "web", null],
    ["backend", "none", ["nodejs-backend-architecture"], [], "backend", null],
    ["desktop", "svelte", ["electron-secure-ipc", "svelte5-runes-architecture", "playwright-qa-flows-desktop"], ["svelte"], "desktop", "svelte"],
    ["desktop", "react", ["electron-secure-ipc", "react-architecture", "playwright-qa-flows-desktop"], ["react"], "desktop", "react"],
    ["desktop", "none", ["electron-secure-ipc", "nodejs-main-process", "playwright-qa-flows-desktop"], [], "desktop", "none"],
  ];
  for (const [kind, framework, skills, instructions, smokeProfile, renderer] of rows) {
    const config = parseTophatConfig(JSON.stringify(source(kind, framework)));
    const topics: TaskGuidanceRequest["taskTopics"] = [
      ...(skills.includes("nodejs-backend-architecture") ? ["backend" as const] : []),
      ...(kind === "web" ? ["browser-flow" as const] : []),
      ...(kind === "desktop" ? ["desktop-flow" as const, "electron-ipc" as const] : []),
    ];
    const selected = selectTaskGuidance(config, request(skills, topics, instructions as TaskGuidanceRequest["frameworkInstructions"]));
    assert.deepEqual(selected.skills, skills);
    assert.equal(selected.smokeProfile, smokeProfile);
    assert.equal(selected.renderer, renderer);
    assert.ok(Object.isFrozen(selected.skills));
  }
});

test("incompatible task skills, framework instructions, and undeclared optional tools deny", () => {
  const react = parseTophatConfig(JSON.stringify(source("web", "react")));
  const backend = parseTophatConfig(JSON.stringify(source("backend", "none")));
  const desktop = parseTophatConfig(JSON.stringify(source("desktop", "react")));
  const denies = (config: typeof react, proposal: TaskGuidanceRequest, pattern: RegExp) =>
    assert.throws(() => selectTaskGuidance(config, proposal), (e: unknown) => e instanceof TaskGuidanceError && pattern.test(e.message));
  denies(react, request(["svelte5-runes-architecture"]), /requires absent capability svelte/);
  denies(react, request(["react-architecture"], [], ["svelte"]), /Instruction svelte/);
  denies(backend, request(["playwright-qa-flows-web"], ["browser-flow"]), /web-qa/);
  denies(desktop, request(["svelte5-runes-architecture"]), /svelte/);
  denies(react, request(["tailwind-semantic-ui"]), /task topic tailwind/);
  denies(react, request(["vitest-tdd"]), /task topic vitest/);
  denies(react, request(["invented-skill"]), /Unknown skill/);
  denies(react, request(["react-architecture", "react-architecture"]), /Duplicate/);
});

test("Next.js server, client, route, and action task samples carry distinct boundaries", () => {
  const next = parseTophatConfig(JSON.stringify(source("web", "nextjs")));
  const samples = ["server-component", "client-component", "route-handler", "server-action"] as const;
  const notes = samples.map((topic) => selectTaskGuidance(next, request(
    ["react-architecture", "nextjs-architecture"], [topic], ["react", "nextjs"],
  )).boundaries[0]);
  assert.equal(new Set(notes).size, 4);
  assert.match(notes[0], /server-only data and secrets/);
  assert.match(notes[1], /no server secrets/);
  assert.match(notes[2], /authorization.*response/);
  assert.match(notes[3], /mutation and cache invalidation/);
  assert.ok(notes.every((note) => !/svelte/i.test(note)));
  assert.throws(() => selectTaskGuidance(next, request(["react-architecture"], ["route-handler"])), /nextjs-architecture/);
});

test("Electron main, preload, renderer, and IPC samples retain process boundaries", () => {
  const desktop = parseTophatConfig(JSON.stringify(source("desktop", "react")));
  const selected = selectTaskGuidance(desktop, request(
    ["electron-secure-ipc", "react-architecture"],
    ["desktop-main", "desktop-preload", "desktop-renderer", "electron-ipc"], ["react"],
  ));
  assert.equal(selected.renderer, "react");
  assert.equal(selected.boundaries.length, 4);
  assert.match(selected.boundaries.join(" "), /main process.*preload.*renderer.*typed channels/);
  assert.throws(() => selectTaskGuidance(parseTophatConfig(JSON.stringify(source("desktop", "none"))),
    request([], ["desktop-renderer"])), /renderer-ui/);
});

test("guidance command denies incompatibility before handoff", () => {
  const root = fixture("backend", "none");
  try {
    const script = resolve(".agents/scripts/select-task-guidance.ts");
    const run = spawnSync(process.execPath, [script], { cwd: root, input: JSON.stringify(request(["react-architecture"])), encoding: "utf8" });
    assert.equal(run.status, 1);
    assert.equal(JSON.parse(run.stdout).code, "TASK_GUIDANCE_INCOMPATIBLE");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

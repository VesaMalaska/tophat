import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runValidation } from "../scripts/run-validation.ts";

function fixture(callback: (root: string, pnpm: string, config: any) => void): void {
  const root = mkdtempSync(join(tmpdir(), "tophat-validation-"));
  const config = {
    schemaVersion: 1, workspace: { kind: "backend", framework: "none" },
    documentation: { package: "docs/project", manifest: "manifest.json", derivedTargets: [] },
    validation: { scripts: { unit: "test:unit", lint: "lint", coverage: "test:coverage" },
      commitGate: ["lint", "unit"], developmentPhaseGate: ["coverage"], projectCompletionGate: [] },
    routingMatrix: {},
  };
  const pnpm = join(root, "fake-pnpm");
  try {
    mkdirSync(join(root, ".agents"));
    writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify(config));
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: {
      "test:unit": "node --test", lint: "eslint", "test:coverage": "node --test --experimental-test-coverage",
    } }));
    writeFileSync(pnpm, `#!${process.execPath}\nconst fs = require('node:fs');
fs.appendFileSync('calls.log', process.argv.slice(2).join(' ') + '\\n');
if (process.argv[3] === 'test:coverage' && process.env.FAIL_COVERAGE === '1') process.exit(2);
if (process.env.CHANGE_TRACKED === '1') fs.appendFileSync('tracked.txt', 'mutation');\n`);
    chmodSync(pnpm, 0o755);
    writeFileSync(join(root, "tracked.txt"), "original");
    writeFileSync(join(root, ".gitignore"), "calls.log\nfake-pnpm\n");
    execFileSync("git", ["init", "-q", root]);
    execFileSync("git", ["-C", root, "add", "."]);
    execFileSync("git", ["-C", root, "-c", "user.name=Fixture", "-c", "user.email=fixture@invalid.example", "commit", "-qm", "fixture"]);
    callback(root, pnpm, config);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test("gate order, appended categories, precommit SHA, and explicit optional skip", () => fixture((root, pnpm) => {
  const report = runValidation({ gate: "commitGate", additionalCategories: ["coverage"] }, root, pnpm);
  assert.equal(report.decision, "allow");
  assert.equal(report.evidenceKind, "PRE_COMMIT_SNAPSHOT");
  assert.match(report.testedCommit!, /^[0-9a-f]{40}$/);
  assert.deepEqual(report.results.map((r) => [r.category, r.script, r.status, r.exitStatus]), [
    ["lint", "lint", "PASSED", 0], ["unit", "test:unit", "PASSED", 0],
    ["coverage", "test:coverage", "PASSED", 0],
  ]);
  assert.equal(readFileSync(join(root, "calls.log"), "utf8"), "run lint\nrun test:unit\nrun test:coverage\n");
  assert.equal(runValidation({ gate: "projectCompletionGate" }, root, pnpm).status, "SKIPPED_NOT_APPLICABLE");
  assert.equal(runValidation({ gate: "commitGate", additionalCategories: ["lint"] }, root, pnpm).code,
    "VALIDATION_INPUT_DENIED");
}));

test("preflight refuses absent scripts without running earlier categories", () => fixture((root, pnpm) => {
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { lint: "eslint" } }));
  const report = runValidation({ gate: "commitGate" }, root, pnpm);
  assert.equal(report.code, "SCRIPT_MISSING");
  assert.deepEqual(report.results, []);
}));

test("missing pnpm, failed coverage, and tracked mutation deny truthfully", () => fixture((root, pnpm) => {
  assert.equal(runValidation({ gate: "commitGate" }, root, join(root, "absent-pnpm")).code, "SCRIPT_SPAWN_FAILED");
  process.env.FAIL_COVERAGE = "1";
  try {
    const failed = runValidation({ gate: "developmentPhaseGate" }, root, pnpm);
    assert.equal(failed.code, "SCRIPT_FAILED");
    assert.deepEqual(failed.results.map((r) => r.status), ["FAILED"]);
  } finally { delete process.env.FAIL_COVERAGE; }
  process.env.CHANGE_TRACKED = "1";
  try { assert.equal(runValidation({ gate: "commitGate" }, root, pnpm).code, "TRACKED_STATE_CHANGED"); }
  finally { delete process.env.CHANGE_TRACKED; }
}));

test("malformed requests and invalid configuration deny", () => fixture((root, pnpm, config) => {
  assert.equal(runValidation({ gate: "custom" } as any, root, pnpm).decision, "deny");
  assert.equal(runValidation({ gate: "commitGate", additionalCategories: ["evil"] } as any, root, pnpm).decision, "deny");
  config.validation.commitGate = [];
  writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify(config));
  assert.equal(runValidation({ gate: "commitGate" }, root, pnpm).decision, "deny");
}));

test("different host-owned coverage thresholds drive only the declared pnpm script result", () => fixture((root, _pnpm, config) => {
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: {
    "coverage:50": "node -e 'process.exit(65 >= 50 ? 0 : 1)'",
    "coverage:80": "node -e 'process.exit(65 >= 80 ? 0 : 1)'",
  } }));
  config.validation.commitGate = ["coverage"];
  config.validation.scripts.coverage = "coverage:50";
  writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify(config));
  const passing = runValidation({ gate: "commitGate" }, root);
  assert.equal(passing.decision, "allow");
  assert.deepEqual(passing.results.map((result) => result.script), ["coverage:50"]);
  config.validation.scripts.coverage = "coverage:80";
  writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify(config));
  const failing = runValidation({ gate: "commitGate" }, root);
  assert.equal(failing.code, "SCRIPT_FAILED");
  assert.deepEqual(failing.results.map((result) => result.script), ["coverage:80"]);
}));

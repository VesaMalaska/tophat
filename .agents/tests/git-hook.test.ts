import assert from "node:assert/strict";
import { spawnSync, execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { hookRequest } from "./fixtures/git-safety.ts";
import { installGitHook } from "../scripts/install-git-hook.ts";

function fixture(callback: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "tophat-native-hook-"));
  try {
    mkdirSync(join(root, ".agents"));
    cpSync(resolve(".agents/scripts"), join(root, ".agents/scripts"), { recursive: true });
    cpSync(resolve(".agents/git-hooks"), join(root, ".agents/git-hooks"), { recursive: true });
    writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify({
      schemaVersion: 1, workspace: { kind: "backend", framework: "none" },
      documentation: { package: "docs/project", manifest: "manifest.json", derivedTargets: [] },
      validation: { scripts: { unit: "unit" }, commitGate: ["unit"],
        developmentPhaseGate: [], projectCompletionGate: [] }, routingMatrix: {},
    }));
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { unit: "node -e 'process.exit(0)'" } }));
    execFileSync("git", ["init", "-q", root]);
    execFileSync("git", ["-C", root, "add", "."]);
    execFileSync("git", ["-C", root, "-c", "user.name=Fixture", "-c", "user.email=fixture@invalid.example", "commit", "-qm", "baseline"]);
    callback(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

function commit(root: string, name: string) {
  return spawnSync("git", ["-c", "user.name=Fixture", "-c", "user.email=fixture@invalid.example",
    "commit", "--allow-empty", "-m", name], { cwd: root, encoding: "utf8" });
}

test("installed native hook denies failed validation before commit and permits passing validation", () => fixture((root) => {
  assert.equal(installGitHook(root, hookRequest(root)).status, "INSTALLED");
  assert.equal(installGitHook(root, hookRequest(root)).status, "ALREADY_INSTALLED");
  const baseline = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { unit: "node -e 'process.exit(7)'" } }));
  execFileSync("git", ["-C", root, "add", "package.json"]);
  const rejected = commit(root, "must-not-exist");
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stdout + rejected.stderr, /SCRIPT_FAILED/);
  assert.equal(execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), baseline);
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { unit: "node -e 'process.exit(0)'" } }));
  execFileSync("git", ["-C", root, "add", "package.json"]);
  const accepted = commit(root, "validated");
  assert.equal(accepted.status, 0, accepted.stderr + accepted.stdout);
  assert.equal(execFileSync("git", ["-C", root, "log", "-1", "--format=%s"], { encoding: "utf8" }).trim(), "validated");
}));

test("installer refuses existing hook and redirected hooksPath", () => fixture((root) => {
  const dest = join(root, ".git/hooks/pre-commit");
  writeFileSync(dest, "#!/bin/sh\nexit 0\n");
  assert.equal(installGitHook(root, hookRequest(root)).code, "HOOK_CONFLICT");
  assert.equal(readFileSync(dest, "utf8"), "#!/bin/sh\nexit 0\n");
  execFileSync("git", ["-C", root, "config", "core.hooksPath", ".custom-hooks"]);
  assert.equal(installGitHook(root, hookRequest(root)).code, "GIT_HOOKS_PATH_CONFIGURED");
}));

test("installer missing approval or stale intended host state never writes a hook", () => fixture((root) => {
  const baseline = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  assert.equal(installGitHook(root).status, "DENIED");
  const approved = hookRequest(root);
  writeFileSync(join(root, "unexpected.txt"), "unapproved\n");
  assert.equal(installGitHook(root, approved).status, "DENIED");
  assert.throws(() => readFileSync(join(root, ".git/hooks/pre-commit")));
  assert.equal(execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), baseline);
}));

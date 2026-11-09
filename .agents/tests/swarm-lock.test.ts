import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { evaluateSwarmLock } from "../scripts/swarm-lock.ts";

const input = (conversationId = "session-a", name = "write_to_file") =>
  JSON.stringify({ conversationId, toolCall: { name, args: { TargetFile: "Context.md", CodeContent: "x" } } });

test("atomic conflict, owner-safe release, and missing release deny", () => {
  const root = mkdtempSync(join(tmpdir(), "tophat-lock-"));
  try {
    assert.equal(spawnSync("git", ["init", "-b", "fixture"], {cwd:root}).status, 0);
    assert.equal(evaluateSwarmLock("acquire", "tophat", input(), root).status, "LOCK_ACQUIRED");
    assert.equal(evaluateSwarmLock("acquire", "tophat", input("session-b"), root).status, "LOCK_CONFLICT");
    assert.equal(evaluateSwarmLock("release", "tophat", input("session-b"), root).status, "LOCK_OWNER_MISMATCH");
    assert.match(readFileSync(join(root, ".git/locks/tophat.lock"), "utf8"), /owner/);
    assert.equal(evaluateSwarmLock("release", "tophat", input(), root).status, "LOCK_RELEASED");
    assert.equal(evaluateSwarmLock("release", "tophat", input(), root).status, "LOCK_RELEASE_FAILED");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("malformed hook, wrong tool, directory failure, and unknown action deny", () => {
  const root = mkdtempSync(join(tmpdir(), "tophat-lock-error-"));
  try {
    assert.equal(spawnSync("git", ["init", "-b", "fixture"], {cwd:root}).status, 0);
    assert.equal(evaluateSwarmLock("acquire", "tophat", "", root).status, "LOCK_INPUT_INVALID");
    assert.equal(evaluateSwarmLock("acquire", "tophat", input("session-a", "run_command"), root).status, "LOCK_INPUT_INVALID");
    assert.equal(evaluateSwarmLock("noop", "tophat", input(), root).status, "LOCK_ARGUMENT_INVALID");
    writeFileSync(join(root, ".git/locks"), "not a directory");
    assert.equal(evaluateSwarmLock("acquire", "tophat", input(), root).status, "LOCK_ACQUIRE_FAILED");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("linked worktrees contend in the same common directory and interrupted owner is preserved", () => {
  const root = mkdtempSync(join(tmpdir(), "tophat-linked-lock-")), linked = root + "-linked";
  const git = (args: string[]) => { const r = spawnSync("git", args, { cwd:root, encoding:"utf8" }); assert.equal(r.status,0,r.stderr); };
  try {
    git(["init","-b","fixture"]); git(["-c","user.name=Fixture","-c","user.email=fixture@example.invalid","commit","--allow-empty","-m","fixture"]);
    git(["worktree","add","-b","linked",linked]);
    assert.equal(evaluateSwarmLock("acquire","tophat",input(),linked).status,"LOCK_ACQUIRED");
    const preserved = readFileSync(join(root,".git/locks/tophat.lock"),"utf8");
    assert.equal(evaluateSwarmLock("acquire","tophat",input("different"),root).status,"LOCK_CONFLICT");
    assert.equal(evaluateSwarmLock("release","tophat",input("different"),root).status,"LOCK_OWNER_MISMATCH");
    assert.equal(readFileSync(join(root,".git/locks/tophat.lock"),"utf8"),preserved);
    assert.equal(evaluateSwarmLock("release","tophat",input(),root).status,"LOCK_RELEASED");
  } finally { rmSync(linked,{recursive:true,force:true}); rmSync(root,{recursive:true,force:true}); }
});

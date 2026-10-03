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
    mkdirSync(join(root, ".git"));
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
    mkdirSync(join(root, ".git"));
    assert.equal(evaluateSwarmLock("acquire", "tophat", "", root).status, "LOCK_INPUT_INVALID");
    assert.equal(evaluateSwarmLock("acquire", "tophat", input("session-a", "run_command"), root).status, "LOCK_INPUT_INVALID");
    assert.equal(evaluateSwarmLock("noop", "tophat", input(), root).status, "LOCK_ARGUMENT_INVALID");
    writeFileSync(join(root, ".git/locks"), "not a directory");
    assert.equal(evaluateSwarmLock("acquire", "tophat", input(), root).status, "LOCK_ACQUIRE_FAILED");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

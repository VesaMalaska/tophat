import assert from "node:assert/strict";
import test from "node:test";
import { evaluateProtectedWrite } from "../scripts/enforce-strategy-lock.ts";

const payload = (name: string, args: object) => JSON.stringify({ toolCall: { name, args } });

test("protected writes fail closed on malformed payloads", () => {
  assert.equal(evaluateProtectedWrite("").status, "HOOK_INPUT_INVALID");
  assert.equal(evaluateProtectedWrite("{}").decision, "deny");
  assert.equal(evaluateProtectedWrite(payload("write_to_file", { TargetFile: "Context.md" })).decision, "deny");
  assert.equal(evaluateProtectedWrite(payload("multi_replace_file_content", {
    TargetFile: "Context.md", ReplacementChunks: [{}],
  })).decision, "deny");
});

test("Strategy approval and Context chunk protection remain explicit", () => {
  assert.equal(evaluateProtectedWrite(payload("write_to_file", {
    TargetFile: "/work/Strategy.md", CodeContent: "text",
  })).decision, "ask");
  assert.equal(evaluateProtectedWrite(payload("write_to_file", {
    TargetFile: "Context.md", CodeContent: "blank",
  })).status, "ACTIVE_CHUNK_MISSING");
  assert.equal(evaluateProtectedWrite(payload("replace_file_content", {
    TargetFile: "Context.md", ReplacementContent: "##### 🎯 Active Sprint Chunk:",
  })).decision, "ask");
  assert.equal(evaluateProtectedWrite(payload("write_to_file", {
    TargetFile: "Context.md", CodeContent: "##### 🎯 Active Sprint Chunk:\nA",
  })).decision, "allow");
});

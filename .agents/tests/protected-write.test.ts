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
    TargetFile: "Context.md", ReplacementContent: "### 🎯 Active Sprint Chunk:",
  })).decision, "ask");
  assert.equal(evaluateProtectedWrite(payload("write_to_file", {
    TargetFile: "Context.md", CodeContent: "### 🎯 Active Sprint Chunk:\nA",
  })).decision, "allow");
});

import { readFileSync } from "node:fs";
test("canonical Context template accepts CRLF whitespace and rejects duplicates", () => {
  const content = readFileSync("Context.md", "utf8");
  for (const text of [content, content.replace("### 🎯 Active Sprint Chunk:", "### 🎯 Active Sprint Chunk:  ").replaceAll("\n", "\r\n")])
    assert.equal(evaluateProtectedWrite(payload("write_to_file", { TargetFile: "Context.md", CodeContent: text })).decision, "allow");
  assert.equal(evaluateProtectedWrite(payload("write_to_file", { TargetFile: "Context.md", CodeContent: content + "\n### 🎯 Active Sprint Chunk:" })).status, "ACTIVE_CHUNK_DUPLICATE");
});
test("partial replacements protect removal and preserve ambiguous calls for human inspection", () => {
  for (const args of [
    { ReplacementContent: "notes" },
    { TargetContent: "### 🎯 Active Sprint Chunk:", ReplacementContent: "" },
    { ReplacementChunks: [{ TargetContent: "### 🎯 Active Sprint Chunk:", ReplacementContent: "" }] },
  ]) assert.equal(evaluateProtectedWrite(payload("ReplacementChunks" in args ? "multi_replace_file_content" : "replace_file_content", { TargetFile: "Context.md", ...args })).decision, "ask");
  assert.equal(evaluateProtectedWrite(payload("replace_file_content", { TargetFile: "Context.md", TargetContent: "notes", ReplacementContent: "new notes" })).decision, "allow");
});

test("malformed later replacement chunks deny before an earlier ambiguity asks", () => {
 for (const target of ["Context.md","Strategy.md"])
  assert.equal(evaluateProtectedWrite(payload("multi_replace_file_content", {TargetFile:target,ReplacementChunks:[{ReplacementContent:"notes"},{TargetContent:5,ReplacementContent:"notes"}]})).status,"HOOK_INPUT_INVALID");
});

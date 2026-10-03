import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, symlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { host, git, evidence, refreshIndex } from "./fixtures/routing/fixture.ts";
import { captureRole, verifyRole, inspectRoleSession } from "../scripts/inspect-role-session.ts";
import { renderHud } from "../scripts/update-hud.ts";
import { classifyTask, fingerprint } from "../scripts/classify-task.ts";
import { validateQAEvidence, publicationReadiness, verifyPublishedPR } from "../scripts/validate-qa-evidence.ts";
import { runValidation } from "../scripts/run-validation.ts";

test("PM advisory session accepts existing dirty/failing evidence without mutation", () => {
  const f = host("web", "react", 'node -e "console.error(\'baseline failed\');process.exit(1)"'); try {
    const failingEvidence = runValidation({ gate: "commitGate" }, f.root, "pnpm", { timeoutMs: 10000, disableAutomaticSetup: true });
    assert.equal(failingEvidence.status, "FAILED");
    writeFileSync(join(f.root, "Context.md"), "Existing blocker: failing validation\n");
    const d = { schemaVersion: 1, role: "pm", sessionId: "pm-session", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: null };
    const before = captureRole(f.root, d), bytes = readFileSync(join(f.root, "Context.md"));
    const result = verifyRole(f.root, d, before, [{ category: "read", detail: "Read failing report and recommend separate remediation", authorized: true }]);
    assert.equal(result.status, "SESSION_UNCHANGED"); assert.deepEqual(readFileSync(join(f.root, "Context.md")), bytes);
    for (const category of ["command", "file-write", "git-mutation", "external-state-mutation"] as const) {
      assert.equal(verifyRole(f.root, d, before, [{ category, detail: "Forbidden PM operation", authorized: true, ...(category === "file-write" ? { path: "HUD.md" } : {}) }]).status, "DENIED");
    }
    assert.throws(() => captureRole(f.root, { ...d, outputPaths: ["coverage"] }), /PM cannot/);
    assert.throws(() => verifyRole(f.root, d, null, []));
  } finally { f.close(); }
});
test("bounded QA runner CLI suppresses automatic pnpm setup and rejects unknown flags", () => {
  const f = host("web", "react", 'node -e "console.log(process.env.pnpm_config_verify_deps_before_run,process.env.pnpm_config_manage_package_manager_versions)"'); try {
    const file = resolve(".agents/scripts/run-validation.ts");
    const run = spawnSync(process.execPath, [file, JSON.stringify({ gate: "commitGate" }), "--qa"], { cwd: f.root, encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout); const r = JSON.parse(run.stdout); assert.equal(r.status, "PASSED"); assert.match(r.results[0].stdout, /false false/);
    const unknown = spawnSync(process.execPath, [file, JSON.stringify({ gate: "commitGate" }), "--unknown"], { cwd: f.root, encoding: "utf8" }); assert.notEqual(unknown.status, 0);
  } finally { f.close(); }
});
test("failed mutating host script still receives rejecting role postflight", () => {
  const f = host("web", "react", 'node -e "require(\'fs\').writeFileSync(\'product.ts\',\'unauthorized\');console.error(\'failed after mutation\');process.exit(1)"'); try {
    const d = { schemaVersion: 1, role: "qa", sessionId: "qa", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: f.artifacts }, before = captureRole(f.root, d);
    const r = runValidation({ gate: "commitGate" }, f.root, "pnpm", { timeoutMs: 10000, disableAutomaticSetup: true });
    assert.equal(r.status, "FAILED"); assert.match(r.results[0].stderr!, /failed after mutation/);
    assert.equal(verifyRole(f.root, d, before, [{ category: "command", detail: "Authorized test failed after writing", authorized: true }]).status, "DENIED");
  } finally { f.close(); }
});
test("PM private/product/index writes and unknown operation categories deny", () => {
  for (const file of ["product.ts", "Context.md", ".agents/pm-private.json"]) { const f = host(); try {
    const d = { schemaVersion: 1, role: "pm", sessionId: "pm-session", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: null }, before = captureRole(f.root, d);
    writeFileSync(join(f.root, file), "unauthorized"); assert.equal(verifyRole(f.root, d, before, []).status, "DENIED");
    git(f.root, ["add", file]); assert.equal(verifyRole(f.root, d, before, []).status, "DENIED");
    assert.throws(() => verifyRole(f.root, d, before, [{ category: "made-up", detail: "Unknown", authorized: true }]));
  } finally { f.close(); } }
});
test("QA preflight detached HEAD, conflict, unsafe output and unavailable Git deny", () => {
  const f = host(); try {
    const d = { schemaVersion: 1, role: "qa", sessionId: "qa", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: null };
    for (const p of ["../escape", "C:/escape", ".agents", "Context.md", "docs"]) assert.throws(() => captureRole(f.root, { ...d, outputPaths: [p] }));
    git(f.root, ["checkout", "--detach"]); assert.throws(() => captureRole(f.root, d), /attached branch/); git(f.root, ["checkout", "feature/qa"]);
    writeFileSync(join(f.root, ".git/MERGE_HEAD"), git(f.root, ["rev-parse", "HEAD"])); assert.throws(() => captureRole(f.root, d), /active Git operation/);
    assert.throws(() => captureRole(f.artifacts, d));
  } finally { f.close(); }
});
test("declared ignored output is inventoried; unexpected ignored private output denies", () => {
  const f = host(); try {
    const d = { schemaVersion: 1, role: "qa", sessionId: "qa", expectedBranch: "feature/qa", inputPaths: [], outputPaths: ["coverage"], artifactRoot: null };
    const before = captureRole(f.root, d); mkdirSync(join(f.root, "coverage")); writeFileSync(join(f.root, "coverage/summary.json"), "{}");
    const result = verifyRole(f.root, d, before, [{ category: "file-write", path: "coverage/summary.json", detail: "Declared script output", authorized: true }]);
    assert.equal(result.status, "SESSION_UNCHANGED"); assert.equal(result.after.outputs.length, 1);
    writeFileSync(join(f.root, ".git/info/exclude"), ".agents/unexpected/\n"); mkdirSync(join(f.root, ".agents/unexpected")); writeFileSync(join(f.root, ".agents/unexpected/state.json"), "{}");
    assert.equal(verifyRole(f.root, d, before, []).status, "DENIED");
  } finally { f.close(); }
});
test("HUD route cannot be bypassed with substring flags or contradictory tiers", () => {
  const f = host(); try {
    const route = classifyTask(f.root, f.task), filename = "task-record.json"; writeFileSync(join(f.root, filename), JSON.stringify(f.task));
    const hud = renderHud(["--routing-file", filename, "--status", "In Review: Security"], f.root);
    assert.match(hud, /Dev Tier: mid/); assert.match(hud, new RegExp(route.taskFingerprint)); assert.match(hud, /not approval evidence/);
    assert.throws(() => renderHud(["--sec", "none"], f.root), /bypass flags/); assert.throws(() => renderHud(["--qa", "not-required"], f.root));
    assert.throws(() => renderHud(["--routing-file", filename, "--tier", "junior"], f.root), /HUD tier/);
    assert.match(renderHud([], f.root), /UNVERIFIED/);
  } finally { f.close(); }
});
test("actual stdin CLIs are read-only and reject duplicate members", () => {
  const f = host(); try {
    const before = git(f.root, ["status", "--porcelain"]), base = resolve(".agents/scripts");
    const run = (file: string, data: string) => spawnSync(process.execPath, [join(base, file)], { cwd: f.root, encoding: "utf8", input: data });
    const route = run("classify-task.ts", JSON.stringify(f.task)); assert.equal(route.status, 0); assert.equal(JSON.parse(route.stdout).status, "ROUTING_VALID");
    assert.notEqual(run("classify-task.ts", '{"schemaVersion":1,"schemaVersion":1}').status, 0);
    const d = { schemaVersion: 1, operation: "capture", role: "pm", sessionId: "pm", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: null };
    const captured = run("inspect-role-session.ts", JSON.stringify(d)); assert.equal(captured.status, 0);
    assert.notEqual(run("inspect-role-session.ts", '{"operation":"capture","operation":"verify"}').status, 0);
    const e = evidence(f); const qa = run("validate-qa-evidence.ts", JSON.stringify(e.request)); assert.equal(qa.status, 0, qa.stdout); assert.equal(JSON.parse(qa.stdout).approvalAllowed, true);
    assert.notEqual(run("validate-qa-evidence.ts", '{"operation":"publish","operation":"validate"}').status, 0);
    assert.equal(git(f.root, ["status", "--porcelain"]), before);
  } finally { f.close(); }
});
test("new attempt cannot approve unchanged code after failed QA; refreshed candidate can", () => {
  const f = host(); try {
    const e = evidence(f), previous = structuredClone(e.report); previous.verdict = "CHANGES_REQUIRED"; previous.criteria[0].result = "FAILED";
    e.report.identity.sequence = 2; e.report.identity.attemptId = "attempt-2"; e.report.startedAt = "2026-10-03T17:01:00.000Z"; e.report.completedAt = "2026-10-03T17:01:01.000Z";
    e.index.entries = [{ sequence: 1, attemptId: "attempt-1", reportSha256: fingerprint(previous), report: previous }, { sequence: 2, attemptId: "attempt-2", reportSha256: fingerprint(e.report), report: e.report }]; e.index.currentAttempt = "attempt-2";
    assert.equal(validateQAEvidence(f.root, e.request).issues[0].code, "ROUTE_STAGE_INVALID");
    writeFileSync(join(f.root, "product.ts"), "export const value = 2;"); git(f.root, ["add", "product.ts"]); git(f.root, ["commit", "-m", "Fix QA defect"]);
    const fresh = evidence(f); fresh.report.identity.sequence = 2; fresh.report.identity.attemptId = "attempt-2"; fresh.report.startedAt = e.report.startedAt; fresh.report.completedAt = e.report.completedAt;
    fresh.index.entries = [{ sequence: 1, attemptId: "attempt-1", reportSha256: fingerprint(previous), report: previous }, { sequence: 2, attemptId: "attempt-2", reportSha256: fingerprint(fresh.report), report: fresh.report }]; fresh.index.currentAttempt = "attempt-2";
    assert.equal(validateQAEvidence(f.root, fresh.request).approvalAllowed, true);
  } finally { f.close(); }
});
test("created PR head/base mismatch and runner-log hallucination deny", () => {
  const f = host(); try {
    const e = evidence(f), ready = publicationReadiness(f.root, e.publish); assert.equal(ready.status, "PUBLICATION_READY");
    verifyPublishedPR(ready, "development", ready.candidateCommit!, "development");
    assert.throws(() => verifyPublishedPR(ready, "development", "0".repeat(40), "development"), /PR head\/base/);
    assert.throws(() => verifyPublishedPR(ready, "development", ready.candidateCommit!, "main"), /PR head\/base/);
    (e.report.commands[0].validation as any).reason = "Invented success"; refreshIndex(e); assert.equal(validateQAEvidence(f.root, e.request).approvalAllowed, false);
  } finally { f.close(); }
});

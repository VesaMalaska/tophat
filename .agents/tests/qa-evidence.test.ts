import test from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { host, evidence, refreshIndex, git, stageRecords } from "./fixtures/routing/fixture.ts";
import { publicationReadiness, validateQAEvidence } from "../scripts/validate-qa-evidence.ts";
import { captureRole, verifyRole } from "../scripts/inspect-role-session.ts";
import { fingerprint, classifyTask, validateStages } from "../scripts/classify-task.ts";
import { runValidation } from "../scripts/run-validation.ts";
import { digest } from "../scripts/validate-doc-package.ts";

test("complete current web evidence permits publication; helpers do not mutate", () => {
  const f = host(); try {
    const e = evidence(f), before = git(f.root, ["status", "--porcelain"]);
    assert.equal(e.validation.status, "PASSED", JSON.stringify(e.validation));
    assert.equal(validateQAEvidence(f.root, e.request).approvalAllowed, true, JSON.stringify(validateQAEvidence(f.root, e.request)));
    assert.equal(publicationReadiness(f.root, e.publish).status, "PUBLICATION_READY", JSON.stringify(publicationReadiness(f.root, e.publish)));
    assert.equal(git(f.root, ["status", "--porcelain"]), before);
  } finally { f.close(); }
});
test("all three QA verdicts align with evidence and only approval publishes", () => {
  for (const verdict of ["APPROVED", "CHANGES_REQUIRED", "BLOCKED"] as const) { const f = host(); try {
    const e = evidence(f, verdict), r = validateQAEvidence(f.root, e.request);
    assert.equal(r.evidenceValid, true, JSON.stringify(r)); assert.equal(r.verdict, verdict); assert.equal(r.approvalAllowed, verdict === "APPROVED");
    assert.equal(publicationReadiness(f.root, e.publish).approvalAllowed, verdict === "APPROVED");
  } finally { f.close(); } }
});
test("product and private-state-only commits both invalidate commit A", () => {
  for (const file of ["product.ts", "Context.md"]) { const f = host(); try {
    const e = evidence(f); writeFileSync(join(f.root, file), "changed\n"); git(f.root, ["add", file]); git(f.root, ["commit", "-m", "Candidate B"]);
    const r = publicationReadiness(f.root, e.publish); assert.equal(r.issues[0].code, "QA_APPROVAL_STALE");
    assert.equal(validateQAEvidence(f.root, e.request).issues[0].code, "QA_APPROVAL_STALE");
  } finally { f.close(); } }
});
test("dirty, index, branch and unexpected untracked changes deny at unchanged HEAD", () => {
  for (const change of [(root: string) => writeFileSync(join(root, "product.ts"), "changed"), (root: string) => { writeFileSync(join(root, "product.ts"), "staged"); git(root, ["add", "product.ts"]); }, (root: string) => git(root, ["checkout", "-b", "unexpected"]), (root: string) => writeFileSync(join(root, "surprise.txt"), "surprise")]) {
    const f = host(); try { const e = evidence(f); change(f.root); assert.equal(publicationReadiness(f.root, e.publish).approvalAllowed, false); } finally { f.close(); }
  }
});
test("missing, duplicate, foreign and method-unmapped criterion evidence denies", () => {
  const f = host(); try { const e = evidence(f);
    for (const change of [(v: any) => v.report.criteria.pop(), (v: any) => v.report.criteria.push(v.report.criteria[0]), (v: any) => v.report.criteria[0].id = "foreign", (v: any) => v.report.methodResults.pop(), (v: any) => v.report.criteria.forEach((c: any) => c.methods = ["e2e-web"]), (v: any) => v.report.criteria[0].result = "NOT_APPLICABLE", (v: any) => v.report.environment.viewportsReason = null, (v: any) => v.report.surprise = true, (v: any) => v.report.identity.taskFingerprint = "0".repeat(64)]) {
      const copy = structuredClone(e.request); change(copy); copy.attemptIndex.entries[0].reportSha256 = fingerprint(copy.report);
      assert.equal(validateQAEvidence(f.root, copy).approvalAllowed, false);
    }
  } finally { f.close(); }
});
test("artifact missing, modified, escaped, symlinked or case-colliding denies", () => {
  for (const change of [(f: ReturnType<typeof host>, e: ReturnType<typeof evidence>) => rmSync(join(f.artifacts, "run.log")), (f: ReturnType<typeof host>, e: ReturnType<typeof evidence>) => writeFileSync(join(f.artifacts, "run.log"), "tampered"), (f: ReturnType<typeof host>, e: ReturnType<typeof evidence>) => e.report.artifacts[0].path = "../escape", (f: ReturnType<typeof host>, e: ReturnType<typeof evidence>) => e.report.artifacts[0].path = "C:/escape", (f: ReturnType<typeof host>, e: ReturnType<typeof evidence>) => symlinkSync(join(f.root, "product.ts"), join(f.artifacts, "escape")), (f: ReturnType<typeof host>, e: ReturnType<typeof evidence>) => writeFileSync(join(f.artifacts, "RUN.LOG"), "case")]) {
    const f = host(); try { const e = evidence(f); change(f, e); refreshIndex(e); assert.equal(validateQAEvidence(f.root, e.request).approvalAllowed, false); } finally { f.close(); }
  }
});
test("later failed attempt prevents old approval and forged index fallback", () => {
  const f = host(); try {
    const e = evidence(f), later = structuredClone(e.report); later.identity.attemptId = "attempt-2"; later.identity.sequence = 2; later.startedAt = "2026-10-03T17:01:00.000Z"; later.completedAt = "2026-10-03T17:01:01.000Z";
    later.verdict = "CHANGES_REQUIRED"; later.criteria[0].result = "FAILED";
    e.index.entries.push({ sequence: 2, attemptId: "attempt-2", reportSha256: fingerprint(later), report: later }); e.index.currentAttempt = "attempt-2";
    assert.equal(publicationReadiness(f.root, e.publish).issues[0].code, "QA_APPROVAL_STALE");
    e.index.currentAttempt = "attempt-1"; assert.equal(publicationReadiness(f.root, e.publish).approvalAllowed, false);
    e.index.entries[1].sequence = 1; assert.equal(publicationReadiness(f.root, e.publish).approvalAllowed, false);
  } finally { f.close(); }
});
test("human design requires recorded exact-candidate acceptance", () => {
  const f = host(); try {
    f.task.userEffects.push("human-design"); const e = evidence(f);
    assert.equal(validateQAEvidence(f.root, e.request).approvalAllowed, false);
    const h = e.report.methodResults.find(x => x.method === "human-design")!;
    h.humanAcceptance = { signal: "APPROVED", taskFingerprint: e.report.identity.taskFingerprint, testedCommit: e.report.identity.testedCommit, human: "Synthetic human", evidenceLocator: "fixture-transcript:design" }; refreshIndex(e);
    assert.equal(validateQAEvidence(f.root, e.request).approvalAllowed, true);
    h.humanAcceptance.testedCommit = "0".repeat(40); refreshIndex(e); assert.equal(validateQAEvidence(f.root, e.request).approvalAllowed, false);
  } finally { f.close(); }
});
test("failed host script preserves stderr and cannot approve", () => {
  const f = host("web", "react", 'node -e "console.error(\'existing failure\');process.exit(1)"'); try {
    const e = evidence(f); assert.match(e.validation.results[0].stderr!, /existing failure/);
    const r = validateQAEvidence(f.root, e.request); assert.equal(r.evidenceValid, true, JSON.stringify(r)); assert.equal(r.verdict, "CHANGES_REQUIRED"); assert.equal(publicationReadiness(f.root, e.publish).approvalAllowed, false);
  } finally { f.close(); }
});
test("QA source/test/config/private mutation and forged postcondition fail", () => {
  for (const file of ["product.ts", "package.json", "Context.md", ".agents/tophat.config.json", "test.ts"]) { const f = host(); try {
    const e = evidence(f); writeFileSync(join(f.root, file), "unauthorized");
    const post = verifyRole(f.root, e.before.declaration, e.before, []); assert.equal(post.status, "DENIED");
    assert.equal(publicationReadiness(f.root, e.publish).approvalAllowed, false);
  } finally { f.close(); } }
  const f = host(); try { const e = evidence(f); (e.after as any).unchangedProtectedState = false; assert.equal(validateQAEvidence(f.root, e.request).evidenceValid, false); } finally { f.close(); }
});
test("reported transient QA product write denies even if bytes restored", () => {
  const f = host(); try {
    const e = evidence(f); const post = verifyRole(f.root, e.before.declaration, e.before, [{ category: "file-write", detail: "Changed then restored product", path: "product.ts", authorized: true }]);
    assert.equal(post.status, "DENIED"); assert.equal(post.unchangedProtectedState, true);
  } finally { f.close(); }
});
test("remediation requires a new commit and fresh route, cannot self-review", () => {
  const f = host(); try {
    const records = stageRecords(f.root, f.task), route = classifyTask(f.root, f.task);
    records[1].verdict = "CHANGES_REQUIRED"; records[1].findings = ["Defect"];
    const copied = stageRecords(f.root, f.task).map((r, i) => ({ ...r, sequence: records.length + i + 1 }));
    assert.throws(() => validateStages([...records, ...copied], route, copied[0].inspectedCommit), /new developer commit/);
    writeFileSync(join(f.root, "product.ts"), "export const value = 2;"); git(f.root, ["add", "product.ts"]); git(f.root, ["commit", "-m", "Developer remediation"]);
    const fresh = stageRecords(f.root, f.task).map((r, i) => ({ ...r, sequence: records.length + i + 1 }));
    assert.equal(validateStages([...records, ...fresh], route, fresh[0].inspectedCommit).length, 3);
    fresh[1].sessionId = fresh[0].sessionId; assert.throws(() => validateStages([...records, ...fresh], route, fresh[0].inspectedCommit), /own implementation/);
    const e = evidence(f); assert.equal(publicationReadiness(f.root, e.publish).approvalAllowed, true);
  } finally { f.close(); }
});
test("backend no-QA route publishes only with explicit skip and applicable stages", () => {
  const f = host("backend", "none"); try {
    const route = classifyTask(f.root, f.task), before = captureRole(f.root, { schemaVersion: 1, role: "qa", sessionId: "validation-session", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: f.artifacts });
    const validation = runValidation({ gate: "commitGate" }, f.root, "pnpm", { timeoutMs: 10000, disableAutomaticSetup: true });
    const logBytes = JSON.stringify(validation); writeFileSync(join(f.artifacts, "run.log"), logBytes);
    const request = { schemaVersion: 1, operation: "publish", task: f.task, expectedBranch: "feature/qa", expectedBase: "development", stageRecords: stageRecords(f.root, f.task), validation,
      validationArtifact: { path: "run.log", sha256: digest(logBytes) },
      qa: { status: "QA_NOT_APPLICABLE", taskFingerprint: route.taskFingerprint, reason: f.task.noUserFacingReason }, session: { before, observedOperations: [] } };
    assert.equal(publicationReadiness(f.root, request).status, "PUBLICATION_READY"); request.stageRecords.pop(); assert.equal(publicationReadiness(f.root, request).approvalAllowed, false);
  } finally { f.close(); }
});

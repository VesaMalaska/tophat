import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { host, git, stageRecords } from "./routing/fixture.ts";
import { classifyTask, fingerprint } from "../../scripts/classify-task.ts";
import { loadTophatConfig } from "../../scripts/load-tophat-config.ts";
import { digest } from "../../scripts/validate-doc-package.ts";
import { runValidation } from "../../scripts/run-validation.ts";
import { captureDocSession, postDocSession } from "../../scripts/inspect-derived-doc-session.ts";
import { captureRole, verifyRole } from "../../scripts/inspect-role-session.ts";
import { reviewChecklist, completionDimensions, documentGateRequest, type CheckRecord, type DocCandidate, type DocReceipt } from "../../scripts/validate-derived-docs.ts";
export { git };
export function fixture(options: { documentation?: string; emptyTargets?: boolean } = {}) {
  const f = host("backend", "none"); let log = 0;
  const cfg = JSON.parse(readFileSync(join(f.root, ".agents/tophat.config.json"), "utf8"));
  cfg.documentation.derivedTargets = options.emptyTargets ? [] : ["README.md", "docs/user-guide/"];
  if (options.documentation) {
    cfg.validation.scripts.documentation = "docs:check";
    const pkg = JSON.parse(readFileSync(join(f.root, "package.json"), "utf8")); pkg.scripts["docs:check"] = options.documentation; writeFileSync(join(f.root, "package.json"), JSON.stringify(pkg));
  }
  writeFileSync(join(f.root, ".agents/tophat.config.json"), JSON.stringify(cfg)); mkdirSync(join(f.root, "docs/user-guide"), { recursive: true });
  git(f.root, ["add", "."]); git(f.root, ["commit", "-m", "Declare fixture document boundary"]);
  const check = (request: CheckRecord["request"]): CheckRecord => {
    const report = runValidation(request, f.root, "pnpm", { timeoutMs: 10000, maxBufferBytes: 65536, disableAutomaticSetup: true });
    if (report.status === "SKIPPED_NOT_APPLICABLE") return { request, report, artifact: null };
    const path = `gate-${++log}.json`, bytes = JSON.stringify(report); writeFileSync(join(f.artifacts, path), bytes);
    return { request, report, artifact: { root: f.artifacts, path, sha256: digest(bytes) } };
  };
  const completion = () => {
    const route = classifyTask(f.root, f.task), commit = git(f.root, ["rev-parse", "HEAD"]);
    return { task: structuredClone(f.task), testedCommit: commit, integratedCommit: commit, stages: stageRecords(f.root, f.task), validation: check({ gate: "commitGate" }), qa: null,
      acceptance: { signal: "APPROVED" as const, human: "Synthetic human", locator: "fixture:task", taskFingerprint: route.taskFingerprint, testedCommit: commit } };
  };
  return { ...f, check, completion, cfg };
}
export function record(f: ReturnType<typeof fixture>, change = true, mode: "phase" | "immediate" = "phase") {
  if (mode === "immediate") f.task.immediateDocumentation = { required: true, reason: "migration", rationale: "Migration must be documented before task acceptance" };
  const task = f.completion(), baseline = git(f.root, ["rev-parse", "HEAD"]), gate = mode === "immediate" ? "commitGate" : "developmentPhaseGate";
  const request = documentGateRequest(f.root, gate, mode === "immediate" ? ["unit"] : []);
  const baselineValidation = f.check(request), bytes = "# Sample service\n\nVerified setup and user guide.\n";
  const plan = change ? [{ path: "README.md", operation: "replace" as const, oldSha256: digest(readFileSync(join(f.root, "README.md"))), newSha256: digest(bytes), reason: "Document realized service setup", references: ["product#REQ-001"] }] : [];
  let writer = null;
  if (change) {
    const session = { schemaVersion: 1 as const, sessionId: "writer", expectedBranch: "feature/qa", inputPaths: [], plan, authorization: { signal: "APPROVED" as const, planFingerprint: fingerprint(plan), human: "Synthetic human", locator: "fixture:plan" } };
    const before = captureDocSession(f.root, session); writeFileSync(join(f.root, "README.md"), bytes);
    writer = postDocSession(f.root, before, [{ category: "file-write", path: "README.md", detail: "Authorized README edit", authorized: true }]);
    git(f.root, ["add", "README.md"]); git(f.root, ["commit", "-m", "Derived documentation candidate"]);
  }
  const finalRequest = documentGateRequest(f.root, gate, [...(mode === "immediate" ? ["unit" as const] : []), ...(f.cfg.validation.scripts.documentation ? ["documentation" as const] : [])]);
  const finalValidation = f.check(finalRequest);
  const declaration = { schemaVersion: 1 as const, role: "qa" as const, sessionId: "document-review", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: null };
  const before = captureRole(f.root, declaration), after = verifyRole(f.root, declaration, before, [{ category: "read", detail: "Independent document review", authorized: true }]);
  const candidate: DocCandidate = { schemaVersion: 1, identity: { mode, id: mode === "phase" ? f.task.authority.developmentPhaseId : f.task.taskId, phaseId: f.task.authority.developmentPhaseId, attemptId: "attempt-1", sequence: 1, expectedBranch: "feature/qa", expectedBase: "development", baselineCommit: baseline, candidateCommit: git(f.root, ["rev-parse", "HEAD"]), authorityFingerprint: f.task.authority.authorityFingerprint,
    configFingerprint: fingerprint(loadTophatConfig(f.root)), startedAt: "2026-10-03T19:00:00.000Z", completedAt: "2026-10-03T19:00:01.000Z" },
    membership: [f.task.taskId], tasks: [task], phases: [], assessment: { outcome: change ? "CHANGES_PROPOSED" : "NO_DOCUMENTATION_CHANGE_REQUIRED", rationale: change ? "Document realized service" : "Current service guidance remains accurate", references: ["product#REQ-001"], conflicts: [], plan }, writer, baselineValidation, finalValidation, seal: { before, after },
    claims: [{ id: "claim-1", sourceCriterion: "product#AC-001", kind: "editorial", procedure: "Compare service guide to approved source", expected: "Accurate guide", observed: "Guide accurately describes existing realization", methods: [], result: "PASSED", rationale: null, evidence: null }], completion: [] };
  return candidate;
}
export function receipt(candidate: DocCandidate): DocReceipt {
  const review = { role: "independent-document-review" as const, sessionId: candidate.seal.before.declaration.sessionId, candidateFingerprint: fingerprint(candidate), candidateCommit: candidate.identity.candidateCommit, reviewedAt: "2026-10-03T19:00:02.000Z", verdict: "APPROVED" as const, findings: [], checklist: reviewChecklist.map(id => ({ id, result: "PASSED" as const, rationale: "Synthetic independent checklist observation" })) };
  return { candidate, review, acceptance: { signal: "APPROVED", human: "Synthetic human", locator: "fixture:acceptance", candidateFingerprint: fingerprint(candidate), reviewSha256: fingerprint(review), acceptedAt: "2026-10-03T19:00:03.000Z" } };
}
export function request(r: DocReceipt, operation = "accept") {
  const c = r.candidate, row = { id: c.identity.id, attemptId: c.identity.attemptId, candidateCommit: c.identity.candidateCommit, completedAt: c.identity.completedAt, verdict: "APPROVED", receipt: r };
  return { schemaVersion: 1, operation, receipt: r, attemptIndex: { id: c.identity.id, currentAttempt: c.identity.attemptId, entries: [{ sequence: 1, attemptId: c.identity.attemptId, record: row, sha256: fingerprint(row) }] } };
}
export { completionDimensions };

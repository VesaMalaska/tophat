import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadTophatConfig } from "./load-tophat-config.ts";
import { git, collectOutput, fileState, relativeName, collate, cleanSnapshot } from "./inspect-workspace-attachment.ts";
import { checkedCapture, verifyRole, type RoleCapture, type RoleVerification } from "./inspect-role-session.ts";
import { classifyTask, validateStages, record, fields, text, array, strings, hash, commitSha, instant, fingerprint, inputJson, fail, issue, type Classified, type Verdict } from "./classify-task.ts";
import { safePath, isMain } from "./validate-doc-package.ts";

export interface Artifact { id: string; path: string; kind: "log" | "screenshot" | "trace" | "report"; sha256: string }
export interface CriterionEvidence {
  id: string; sourceCriterion: string; qaApplicable: boolean; applicabilityReason: string | null;
  methods: string[]; procedure: string; expected: string; observed: string;
  result: "PASSED" | "FAILED" | "BLOCKED" | "NOT_APPLICABLE"; commandIds: string[]; artifactIds: string[]; regression: string;
}
export interface QAReport {
  schemaVersion: 1;
  identity: { taskId: string; attemptId: string; sequence: number; taskFingerprint: string; expectedBranch: string; testedCommit: string };
  environment: { workspaceKind: string; framework: string; nodeVersion: string; pnpmVersion: string; os: string; applicationVersion: string;
    buildCommit: string; buildEvidence: string; target: string; configuration: string; roles: string[]; controlledData: string; resetProcedure: string;
    externalDependencies: string; states: string[]; statesReason: string | null; viewports: string[]; viewportsReason: string | null; available: boolean };
  methodResults: { method: string; result: "PASSED" | "FAILED" | "BLOCKED"; procedure: string; artifactIds: string[]; humanAcceptance: null | { signal: "APPROVED"; taskFingerprint: string; testedCommit: string; human: string; evidenceLocator: string } }[];
  criteria: CriterionEvidence[];
  commands: { id: string; category: string; script: string; artifactId: string; result: "PASSED" | "FAILED" | "NOT_RUN"; validation: unknown }[];
  artifacts: Artifact[]; findings: { severity: "CRITICAL" | "MAJOR" | "MINOR"; message: string }[];
  preflight: string; postflight: string; reviewer: { role: "qa"; sessionId: string; independentOf: string[] };
  startedAt: string; completedAt: string; verdict: Verdict;
}
export interface AttemptIndex {
  schemaVersion: 1; taskId: string; currentAttempt: string;
  entries: { sequence: number; attemptId: string; reportSha256: string; report: QAReport }[];
}
export interface EvidenceResult {
  schemaVersion: 1; status: "EVIDENCE_VALID" | "PUBLICATION_READY" | "DENIED"; evidenceValid: boolean; approvalAllowed: boolean;
  issues: { code: string; message: string }[]; candidateCommit?: string; taskFingerprint?: string; reportFingerprint?: string; verdict?: Verdict; qaDisposition?: string;
}
const resultValues = ["PASSED", "FAILED", "BLOCKED", "NOT_APPLICABLE"];
function positive(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1) fail("QA_EVIDENCE_INVALID", "Invalid sequence"); return value as number; }
function exactIds(actual: string[], expected: string[], code = "QA_EVIDENCE_INVALID"): void {
  if (new Set(actual).size !== actual.length || fingerprint([...actual].sort()) !== fingerprint([...expected].sort())) fail(code, "Missing, duplicate or foreign evidence IDs");
}
export function checkedReport(value: unknown): QAReport {
  const v = record(value, "QA report"); fields(v, ["schemaVersion", "identity", "environment", "methodResults", "criteria", "commands", "artifacts", "findings", "preflight", "postflight", "reviewer", "startedAt", "completedAt", "verdict"]);
  if (v.schemaVersion !== 1 || !["APPROVED", "CHANGES_REQUIRED", "BLOCKED"].includes(v.verdict as string)) fail("QA_EVIDENCE_INVALID", "Unsupported QA report");
  const id = record(v.identity, "identity"); fields(id, ["taskId", "attemptId", "sequence", "taskFingerprint", "expectedBranch", "testedCommit"]);
  text(id.taskId); text(id.attemptId); positive(id.sequence); hash(id.taskFingerprint); text(id.expectedBranch); commitSha(id.testedCommit);
  const env = record(v.environment, "environment"); fields(env, ["workspaceKind", "framework", "nodeVersion", "pnpmVersion", "os", "applicationVersion", "buildCommit", "buildEvidence", "target", "configuration", "roles", "controlledData", "resetProcedure", "externalDependencies", "states", "statesReason", "viewports", "viewportsReason", "available"]);
  for (const key of ["workspaceKind", "framework", "nodeVersion", "pnpmVersion", "os", "applicationVersion", "buildEvidence", "target", "configuration", "controlledData", "resetProcedure", "externalDependencies"]) text(env[key]);
  commitSha(env.buildCommit); strings(env.roles, undefined, true);
  for (const [a, reason] of [["states", "statesReason"], ["viewports", "viewportsReason"]]) {
    const values = strings(env[a]); if (!values.length) text(env[reason]); else if (env[reason] !== null) fail("QA_EVIDENCE_INVALID", "Contradictory environment applicability");
  }
  if (typeof env.available !== "boolean") fail("QA_EVIDENCE_INVALID", "Missing environment availability");
  for (const raw of array(v.methodResults)) {
    const m = record(raw, "method"); fields(m, ["method", "result", "procedure", "artifactIds", "humanAcceptance"]);
    text(m.method); text(m.procedure); strings(m.artifactIds);
    if (!resultValues.slice(0, 3).includes(m.result as string)) fail("QA_EVIDENCE_INVALID", "Invalid method result");
    if (m.humanAcceptance !== null) {
      const h = record(m.humanAcceptance, "human acceptance"); fields(h, ["signal", "taskFingerprint", "testedCommit", "human", "evidenceLocator"]);
      if (h.signal !== "APPROVED" || m.method !== "human-design") fail("QA_EVIDENCE_INVALID", "Invalid human acceptance");
      hash(h.taskFingerprint); commitSha(h.testedCommit); text(h.human); text(h.evidenceLocator);
    }
  }
  for (const raw of array(v.criteria)) {
    const c = record(raw, "criterion"); fields(c, ["id", "sourceCriterion", "qaApplicable", "applicabilityReason", "methods", "procedure", "expected", "observed", "result", "commandIds", "artifactIds", "regression"]);
    for (const key of ["id", "sourceCriterion", "procedure", "expected", "observed", "regression"]) text(c[key]);
    strings(c.methods); strings(c.commandIds); strings(c.artifactIds);
    if (typeof c.qaApplicable !== "boolean" || !resultValues.includes(c.result as string)) fail("QA_EVIDENCE_INVALID", "Invalid criterion result");
    if (c.qaApplicable) { if (c.applicabilityReason !== null || c.result === "NOT_APPLICABLE") fail("QA_EVIDENCE_INVALID", "Applicable criterion cannot skip"); }
    else text(c.applicabilityReason);
  }
  for (const raw of array(v.commands)) {
    const c = record(raw, "command"); fields(c, ["id", "category", "script", "artifactId", "result", "validation"]);
    for (const key of ["id", "category", "script", "artifactId"]) text(c[key]);
    if (!["PASSED", "FAILED", "NOT_RUN"].includes(c.result as string)) fail("QA_EVIDENCE_INVALID", "Invalid command outcome");
  }
  for (const raw of array(v.artifacts)) {
    const a = record(raw, "artifact"); fields(a, ["id", "path", "kind", "sha256"]); text(a.id); relativeName(a.path); hash(a.sha256);
    if (!["log", "screenshot", "trace", "report"].includes(a.kind as string)) fail("QA_ARTIFACT_INVALID", "Unknown artifact kind");
  }
  for (const raw of array(v.findings)) { const f = record(raw, "finding"); fields(f, ["severity", "message"]); text(f.message); if (!["CRITICAL", "MAJOR", "MINOR"].includes(f.severity as string)) fail("QA_EVIDENCE_INVALID", "Invalid finding"); }
  hash(v.preflight); hash(v.postflight);
  const reviewer = record(v.reviewer, "reviewer"); fields(reviewer, ["role", "sessionId", "independentOf"]);
  if (reviewer.role !== "qa") fail("ROLE_BOUNDARY_VIOLATION", "Wrong QA role"); text(reviewer.sessionId); strings(reviewer.independentOf, undefined, true);
  if (instant(v.completedAt) < instant(v.startedAt)) fail("QA_EVIDENCE_INVALID", "Reversed QA timestamps");
  return v as unknown as QAReport;
}
function attempts(value: unknown, current: QAReport): void {
  const v = record(value, "attempt index"); fields(v, ["schemaVersion", "taskId", "currentAttempt", "entries"]);
  const entries = array(v.entries);
  if (v.schemaVersion !== 1 || v.taskId !== current.identity.taskId || !entries.length || entries.length > 256) fail("QA_EVIDENCE_INVALID", "Invalid attempt index");
  const ids = new Set<string>();
  entries.forEach((raw, i) => {
    const e = record(raw, "attempt"); fields(e, ["sequence", "attemptId", "reportSha256", "report"]);
    const r = checkedReport(e.report);
    if (e.sequence !== i + 1 || r.identity.sequence !== e.sequence || r.identity.attemptId !== e.attemptId || ids.has(text(e.attemptId)) || r.identity.taskId !== v.taskId || e.reportSha256 !== fingerprint(r))
      fail("QA_EVIDENCE_INVALID", "Incomplete or tampered attempt history");
    ids.add(e.attemptId as string);
    if (current.verdict === "APPROVED" && i < entries.length - 1 && r.verdict === "CHANGES_REQUIRED" && r.identity.testedCommit === current.identity.testedCommit)
      fail("ROUTE_STAGE_INVALID", "QA code remediation requires a new developer commit and fresh route");
    if (i > 0 && instant(r.startedAt) < instant((entries[i - 1] as { report: QAReport }).report.completedAt)) fail("QA_EVIDENCE_INVALID", "Attempt history timestamps overlap");
  });
  const last = entries.at(-1) as { attemptId: string; reportSha256: string };
  if (last.attemptId !== v.currentAttempt || last.attemptId !== current.identity.attemptId || last.reportSha256 !== fingerprint(current)) fail("QA_APPROVAL_STALE", "Selected report is not the latest recorded attempt");
}
export function verification(value: unknown, before: RoleCapture): RoleVerification {
  const v = record(value, "postflight"); fields(v, ["schemaVersion", "status", "issues", "before", "after", "observedOperations", "unchangedProtectedState", "postconditionFingerprint"]);
  const { postconditionFingerprint: fp, ...body } = v;
  if (fp !== fingerprint(body) || fingerprint(v.before) !== fingerprint(before)) fail("POSTCONDITION_UNVERIFIED", "Postflight is missing or tampered");
  checkedCapture(v.after);
  const after = v.after as RoleCapture;
  if (fingerprint(after.declaration) !== fingerprint(before.declaration)) fail("POSTCONDITION_UNVERIFIED", "Postflight declaration changed");
  // Verify reported invariants independently; a boolean is not evidence by itself.
  const unchanged = fingerprint(before.snapshot) === fingerprint(after.snapshot) && fingerprint(before.privateState) === fingerprint(after.privateState) && before.artifactRootIdentity === after.artifactRootIdentity;
  if (v.unchangedProtectedState !== unchanged || (v.status === "SESSION_UNCHANGED" && (!unchanged || array(v.issues).length))) fail("POSTCONDITION_UNVERIFIED", "Inconsistent postflight invariant");
  for (const raw of array(v.observedOperations)) {
    const o = record(raw, "observed operation"); fields(o, ["category", "detail", "authorized"], ["path"]); text(o.detail);
    if (!["read", "command", "file-write", "git-mutation", "external-state-mutation"].includes(o.category as string) || typeof o.authorized !== "boolean") fail("POSTCONDITION_UNVERIFIED", "Invalid operation record");
    if (o.category === "file-write") {
      const p = relativeName(o.path);
      if (!(before.declaration.artifactRoot === null ? before.declaration.outputPaths.some(q => p === q || p.startsWith(q + "/")) : after.externalArtifacts.some(f => f.path === p))) fail("ROLE_BOUNDARY_VIOLATION", "QA wrote outside evidence outputs");
    } else if (o.path !== undefined) fail("ROLE_BOUNDARY_VIOLATION", "Unexpected operation path");
    if (!o.authorized || ["git-mutation", "external-state-mutation"].includes(o.category as string)) fail("ROLE_BOUNDARY_VIOLATION", "Forbidden QA operation");
  }
  if (v.schemaVersion !== 1 || !["SESSION_UNCHANGED", "DENIED"].includes(v.status as string)) fail("POSTCONDITION_UNVERIFIED", "Invalid postflight result");
  return v as unknown as RoleVerification;
}
function validation(root: string, value: unknown, route: Classified, commit: string): { allPassed: boolean } {
  const v = record(value, "validation"); fields(v, ["schemaVersion", "gate", "profile", "categories", "results", "status", "decision", "code", "reason", "testedCommit", "evidenceKind"]);
  const cfg = loadTophatConfig(root), selected = [...cfg.validation.commitGate, ...route.task.validationCategories.filter(x => !cfg.validation.commitGate.includes(x))];
  if (v.schemaVersion !== 1 || v.gate !== "commitGate" || v.profile !== `${cfg.workspace.kind}:${cfg.workspace.framework}` || v.testedCommit !== commit || v.evidenceKind !== "PRE_COMMIT_SNAPSHOT") fail("QA_EVIDENCE_INVALID", "Validation identity differs from clean candidate");
  if (fingerprint(v.categories) !== fingerprint(selected)) fail("QA_EVIDENCE_INVALID", "Validation selection differs from task gate");
  const results = array(v.results); let failed = false;
  results.forEach((raw, i) => {
    const r = record(raw, "category result"); fields(r, ["category", "script", "status", "exitStatus"], ["stdout", "stderr", "signal"]);
    if ((r.exitStatus !== null && (!Number.isInteger(r.exitStatus) || (r.exitStatus as number) < 0)) ||
      [r.stdout, r.stderr].some(x => x !== undefined && typeof x !== "string") ||
      (r.signal !== undefined && r.signal !== null && typeof r.signal !== "string")) fail("QA_EVIDENCE_INVALID", "Invalid script result field types");
    if (failed || r.category !== selected[i] || r.script !== cfg.validation.scripts[selected[i]] || !["PASSED", "FAILED"].includes(r.status as string) ||
      (r.status === "PASSED" && (r.exitStatus !== 0 || r.signal != null)) || (r.status === "FAILED" && r.exitStatus === 0 && r.signal == null)) fail("QA_EVIDENCE_INVALID", "Invalid ordered script outcomes");
    failed = r.status === "FAILED";
  });
  const passed = results.length === selected.length && !failed;
  if (v.status === "PASSED" ? !passed || v.decision !== "allow" : v.status !== "FAILED" || v.decision !== "deny") fail("QA_EVIDENCE_INVALID", "Validation verdict contradicts outcomes");
  text(v.code); text(v.reason); return { allPassed: v.status === "PASSED" };
}
export function validateQAEvidence(root: string, input: unknown, historicalCommit?: string): EvidenceResult {
  try {
    const v = record(input, "QA request"); fields(v, ["schemaVersion", "operation", "task", "report", "before", "after", "attemptIndex", "stageRecords"]);
    if (v.schemaVersion !== 1 || v.operation !== "validate") fail("QA_EVIDENCE_INVALID", "Unsupported evidence request");
    const route = classifyTask(root, v.task, historicalCommit), r = checkedReport(v.report), before = checkedCapture(v.before), post = verification(v.after, before);
    if ((historicalCommit ?? git(root, ["rev-parse", "HEAD"]).trim()) !== r.identity.testedCommit) fail("QA_APPROVAL_STALE", "Inspected HEAD differs from QA commit");
    if (!route.qaRequired || before.declaration.role !== "qa" || r.identity.taskId !== route.task.taskId || r.identity.taskFingerprint !== route.taskFingerprint || r.preflight !== before.snapshotFingerprint || r.postflight !== post.postconditionFingerprint || r.reviewer.sessionId !== before.declaration.sessionId)
      fail("QA_EVIDENCE_INVALID", "Task/session evidence does not match");
    if (r.identity.expectedBranch !== before.declaration.expectedBranch || r.identity.testedCommit !== before.snapshot.commit || before.snapshot.branch !== r.identity.expectedBranch) fail("QA_PREFLIGHT_DENIED", "QA preflight branch/commit differs");
    cleanSnapshot(before.snapshot, before.declaration.expectedBranch, before.declaration.inputPaths);
    const stageRecords = validateStages(v.stageRecords, route, r.identity.testedCommit), developer = stageRecords[0];
    if (r.reviewer.sessionId === developer.sessionId || !r.reviewer.independentOf.includes(developer.sessionId)) fail("ROLE_BOUNDARY_VIOLATION", "QA cannot approve own developer work");
    attempts(v.attemptIndex, r);
    const config = loadTophatConfig(root);
    if (r.environment.workspaceKind !== config.workspace.kind || r.environment.framework !== config.workspace.framework || !/^\d+\.\d+\.\d+$/.test(r.environment.nodeVersion) || Number(r.environment.nodeVersion.split(".")[0]) < 24 || r.environment.buildCommit !== r.identity.testedCommit)
      fail("QA_EVIDENCE_INVALID", "Environment/build is not the tested candidate");
    exactIds(r.methodResults.map(x => x.method), route.qaMethods);
    const checkIds = [...route.task.authority.references.acceptanceCriteria, ...route.task.acceptanceChecks.map(c => c.id)];
    exactIds(r.criteria.map(x => x.id), checkIds);
    const artifactIds = r.artifacts.map(a => a.id), commandIds = r.commands.map(c => c.id);
    if (new Set(artifactIds).size !== artifactIds.length || new Set(commandIds).size !== commandIds.length) fail("QA_EVIDENCE_INVALID", "Duplicate evidence IDs");
    collate(r.artifacts.map(a => a.path));
    if (new Set(r.artifacts.map(a => a.path)).size !== r.artifacts.length) fail("QA_ARTIFACT_INVALID", "Duplicate artifact paths");
    const files = before.declaration.artifactRoot === null ? post.after.outputs : post.after.externalArtifacts;
    const artifactBase = before.declaration.artifactRoot === null ? root : resolve(before.declaration.artifactRoot);
    if (!historicalCommit) {
      const fresh = verifyRole(root, before.declaration, before, post.observedOperations);
      if (fingerprint(fresh.after.outputs) !== fingerprint(post.after.outputs) || fingerprint(fresh.after.externalArtifacts) !== fingerprint(post.after.externalArtifacts)) fail("QA_ARTIFACT_INVALID", "Session outputs changed after postflight");
      if (r.verdict === "APPROVED" && fresh.status !== "SESSION_UNCHANGED") fail("ROLE_BOUNDARY_VIOLATION", "Current protected state differs from QA candidate");
    } else if (before.declaration.artifactRoot === null) fail("QA_ARTIFACT_INVALID", "Historical QA requires preserved external artifacts");
    for (const a of r.artifacts) {
      const found = files.find(f => f.path === a.path);
      if (!found || found.sha256 !== a.sha256 || fileState(artifactBase, a.path).sha256 !== a.sha256) fail("QA_ARTIFACT_INVALID", "Artifact missing, changed or outside declared outputs");
    }
    // Every artifact-producing session output is classified; receipts should be persisted separately after this check.
    exactIds(r.artifacts.map(a => a.path), files.map(f => f.path), "QA_ARTIFACT_INVALID");
    const references = (a: string[]) => { if (a.some(id => !artifactIds.includes(id))) fail("QA_ARTIFACT_INVALID", "Unresolved artifact reference"); };
    for (const m of r.methodResults) {
      references(m.artifactIds);
      if (m.method === "human-design" && m.result === "PASSED") {
        if (!m.humanAcceptance || m.humanAcceptance.taskFingerprint !== route.taskFingerprint || m.humanAcceptance.testedCommit !== r.identity.testedCommit) fail("QA_EVIDENCE_INVALID", "Human design acceptance is missing or stale");
      }
    }
    for (const c of r.criteria) {
      const taskCheck = route.task.acceptanceChecks.find(x => x.id === c.id);
      if (c.sourceCriterion !== (taskCheck?.sourceCriterion ?? c.id) || (taskCheck && taskCheck.qaApplicable !== c.qaApplicable) || (!route.task.authority.references.acceptanceCriteria.includes(c.sourceCriterion))) fail("QA_EVIDENCE_INVALID", "Criterion source/applicability differs");
      if (c.qaApplicable && (!c.methods.length || c.methods.some(m => !route.qaMethods.includes(m)))) fail("QA_EVIDENCE_INVALID", "Criterion lacks applicable methods");
      if (!c.qaApplicable && (c.methods.length || !c.commandIds.length && !stageRecords.length)) fail("QA_EVIDENCE_INVALID", "Non-QA criterion lacks other validation");
      if (c.commandIds.some(id => !commandIds.includes(id))) fail("QA_EVIDENCE_INVALID", "Unresolved command reference"); references(c.artifactIds);
    }
    for (const method of route.qaMethods) if (!r.criteria.some(c => c.qaApplicable && c.methods.includes(method))) fail("QA_EVIDENCE_INVALID", "Required method is not mapped to any criterion");
    let commandsPassed = true;
    exactIds(r.commands.map(c => c.category), [...new Set([...config.validation.commitGate, ...route.task.validationCategories])]);
    for (const c of r.commands) {
      if (!artifactIds.includes(c.artifactId) || c.script !== config.validation.scripts[c.category as keyof typeof config.validation.scripts]) fail("QA_EVIDENCE_INVALID", "Command mapping/log differs");
      const log = r.artifacts.find(a => a.id === c.artifactId)!;
      if (!["log", "report"].includes(log.kind) || fingerprint(inputJson(readFileSync(safePath(artifactBase, log.path), "utf8"))) !== fingerprint(c.validation)) fail("QA_EVIDENCE_INVALID", "Command record differs from captured runner JSON log");
      const outcome = validation(root, c.validation, route, r.identity.testedCommit);
      const results = (c.validation as { results: { category: string; status: string }[] }).results;
      const category = results.find(x => x.category === c.category);
      if (category ? category.status !== c.result : c.result !== "NOT_RUN" || (c.validation as { status: string }).status !== "FAILED") fail("QA_EVIDENCE_INVALID", "Command claim differs from runner");
      commandsPassed &&= outcome.allPassed;
    }
    const failed = !commandsPassed || r.methodResults.some(m => m.result === "FAILED") || r.criteria.some(c => c.result === "FAILED") || r.findings.some(f => f.severity !== "MINOR");
    const blocked = !r.environment.available || r.methodResults.some(m => m.result === "BLOCKED") || r.criteria.some(c => c.result === "BLOCKED") || post.status !== "SESSION_UNCHANGED";
    const expected = blocked ? "BLOCKED" : failed ? "CHANGES_REQUIRED" : "APPROVED";
    if (r.verdict !== expected) fail("QA_EVIDENCE_INVALID", "Verdict contradicts recorded evidence");
    return { schemaVersion: 1, status: "EVIDENCE_VALID", evidenceValid: true, approvalAllowed: expected === "APPROVED", issues: [], candidateCommit: r.identity.testedCommit, taskFingerprint: route.taskFingerprint, reportFingerprint: fingerprint(r), verdict: r.verdict };
  } catch (e) { return { schemaVersion: 1, status: "DENIED", evidenceValid: false, approvalAllowed: false, issues: [issue(e)] }; }
}
export function publicationReadiness(root: string, input: unknown): EvidenceResult {
  try {
    const v = record(input, "publication"); fields(v, ["schemaVersion", "operation", "task", "expectedBranch", "expectedBase", "stageRecords", "validation", "validationArtifact", "qa", "session"]);
    if (v.schemaVersion !== 1 || v.operation !== "publish") fail("PUBLICATION_EVIDENCE_DENIED", "Unsupported publication request");
    text(v.expectedBase); text(v.expectedBranch);
    const route = classifyTask(root, v.task), commit = git(root, ["rev-parse", "HEAD"]).trim();
    const session = record(v.session, "publication session"); fields(session, ["before", "observedOperations"]);
    const before = checkedCapture(session.before);
    if (before.declaration.role !== "qa" || before.declaration.expectedBranch !== v.expectedBranch) fail("QA_PREFLIGHT_DENIED", "Publication candidate declaration differs");
    if (before.snapshot.commit !== commit) fail("QA_APPROVAL_STALE", "Current HEAD differs from tested candidate");
    const post = verifyRole(root, before.declaration, before, session.observedOperations);
    if (post.status !== "SESSION_UNCHANGED") fail("ROLE_BOUNDARY_VIOLATION", "Publication state differs from candidate");
    validateStages(v.stageRecords, route, commit);
    if (!validation(root, v.validation, route, commit).allPassed) fail("PUBLICATION_EVIDENCE_DENIED", "Task validation failed");
    const log = record(v.validationArtifact, "validation artifact"); fields(log, ["path", "sha256"]); relativeName(log.path); hash(log.sha256);
    const logRoot = before.declaration.artifactRoot === null ? root : resolve(before.declaration.artifactRoot);
    const logFiles = before.declaration.artifactRoot === null ? post.after.outputs : post.after.externalArtifacts;
    if (!logFiles.some(f => f.path === log.path && f.sha256 === log.sha256) || fingerprint(inputJson(readFileSync(safePath(logRoot, log.path as string), "utf8"))) !== fingerprint(v.validation)) fail("QA_ARTIFACT_INVALID", "Publication validation differs from captured JSON log");
    let result: EvidenceResult | null = null;
    if (route.qaRequired) {
      const qa = record(v.qa, "QA evidence"); fields(qa, ["report", "before", "after", "attemptIndex"]);
      if (fingerprint(qa.before) !== fingerprint(before)) fail("QA_APPROVAL_STALE", "Publication differs from QA candidate");
      result = validateQAEvidence(root, { schemaVersion: 1, operation: "validate", task: v.task, ...qa, stageRecords: v.stageRecords });
      if (!result.approvalAllowed) fail(result.issues[0]?.code ?? "PUBLICATION_EVIDENCE_DENIED", result.issues[0]?.message ?? "Latest QA did not approve");
    } else {
      const skip = record(v.qa, "QA disposition"); fields(skip, ["status", "taskFingerprint", "reason"]);
      if (skip.status !== "QA_NOT_APPLICABLE" || skip.taskFingerprint !== route.taskFingerprint || skip.reason !== route.task.noUserFacingReason) fail("PUBLICATION_EVIDENCE_DENIED", "Missing justified QA skip");
    }
    return { schemaVersion: 1, status: "PUBLICATION_READY", evidenceValid: true, approvalAllowed: true, issues: [], candidateCommit: commit, taskFingerprint: route.taskFingerprint, ...(result ? { reportFingerprint: result.reportFingerprint, verdict: result.verdict } : {}), qaDisposition: route.qaRequired ? "APPROVED" : "QA_NOT_APPLICABLE" };
  } catch (e) { return { schemaVersion: 1, status: "DENIED", evidenceValid: false, approvalAllowed: false, issues: [issue(e)] }; }
}
export function verifyPublishedPR(ready: EvidenceResult, expectedBase: string, actualHead: string, actualBase: string): void {
  if (ready.status !== "PUBLICATION_READY" || !ready.approvalAllowed || ready.candidateCommit !== commitSha(actualHead) || text(expectedBase) !== text(actualBase))
    fail("PUBLICATION_EVIDENCE_DENIED", "Created PR head/base differs from checked candidate/policy");
}
if (isMain(import.meta.url)) {
  try { const input = inputJson(readFileSync(0, "utf8")); const operation = record(input, "request").operation;
    const result = operation === "publish" ? publicationReadiness(process.cwd(), input) : validateQAEvidence(process.cwd(), input);
    console.log(JSON.stringify(result)); if (result.status === "DENIED") process.exitCode = 1;
  } catch (e) { console.log(JSON.stringify({ status: "DENIED", evidenceValid: false, approvalAllowed: false, issues: [issue(e)] })); process.exitCode = 1; }
}

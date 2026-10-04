import { readFileSync, realpathSync, lstatSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, isAbsolute, relative, sep } from "node:path";
import { loadTophatConfig, type ValidationCategory } from "./load-tophat-config.ts";
import { inspectDocPackage, digest, safePath, isMain } from "./validate-doc-package.ts";
import { git, fileState, collectOutput, collate, snapshot, cleanSnapshot } from "./inspect-workspace-attachment.ts";
import { checkedCapture, verifyRole, type RoleCapture, type RoleVerification } from "./inspect-role-session.ts";
import { classifyTask, validateStages, record, fields, text, strings, array, hash, commitSha, instant, fingerprint, inputJson, fail, issue, qaMethods, type TaskClassification } from "./classify-task.ts";
import { checkedReport, verification, validateQAEvidence } from "./validate-qa-evidence.ts";
import { derivedPaths, checkedPlan, checkedDocCapture, type DocCapture, type DocPost, type DocWrite } from "./inspect-derived-doc-session.ts";

export interface TaskCompletion { task: TaskClassification; testedCommit: string; integratedCommit: string; stages: unknown[]; validation: CheckRecord; qa: unknown | null; acceptance: { signal: "APPROVED"; human: string; locator: string; taskFingerprint: string; testedCommit: string } }
export interface CheckRecord { request: { gate: "commitGate" | "developmentPhaseGate" | "projectCompletionGate"; additionalCategories?: ValidationCategory[] }; report: unknown; artifact: { root: string; path: string; sha256: string } | null }
export interface Claim { id: string; sourceCriterion: string; kind: "editorial" | "executable" | "screenshot" | "user-facing"; procedure: string; expected: string; observed: string; methods: string[]; result: "PASSED" | "NOT_APPLICABLE" | "FAILED" | "BLOCKED"; rationale: string | null; evidence: unknown | null }
export const reviewChecklist = ["authority-correspondence", "realized-behavior", "coverage", "setup-configuration", "operations-usage", "links-examples-screenshots", "superseded-guidance", "private-leakage", "svg-active-content"];
export const completionDimensions = ["realized-product", "setup-dependencies", "configuration", "operations", "administration", "usage", "migration-compatibility", "examples", "links", "handoff"];
export interface DocCandidate {
  schemaVersion: 1; identity: { mode: "phase" | "immediate" | "project-completion"; id: string; phaseId: string | null; attemptId: string; sequence: number; expectedBranch: string; expectedBase: string; baselineCommit: string; candidateCommit: string; authorityFingerprint: string; configFingerprint: string; startedAt: string; completedAt: string };
  membership: string[]; tasks: TaskCompletion[]; phases: unknown[];
  assessment: { outcome: "CHANGES_PROPOSED" | "NO_DOCUMENTATION_CHANGE_REQUIRED"; rationale: string; references: string[]; conflicts: string[]; plan: DocWrite[] };
  writer: DocPost | null; baselineValidation: CheckRecord; finalValidation: CheckRecord; claims: Claim[];
  seal: { before: RoleCapture; after: RoleVerification };
  completion: { dimension: string; result: "PASSED" | "NOT_APPLICABLE" | "FAILED" | "BLOCKED"; rationale: string }[];
}
export interface DocReview { role: "independent-document-review"; sessionId: string; candidateFingerprint: string; candidateCommit: string; reviewedAt: string; verdict: "APPROVED" | "CHANGES_REQUIRED" | "BLOCKED"; findings: string[]; checklist: { id: string; result: "PASSED" | "NOT_APPLICABLE" | "FAILED" | "BLOCKED"; rationale: string }[] }
export interface DocAcceptance { signal: "APPROVED"; human: string; locator: string; candidateFingerprint: string; reviewSha256: string; acceptedAt: string }
export interface DocReceipt { candidate: DocCandidate; review: DocReview; acceptance: DocAcceptance | null }
export interface DocResult { schemaVersion: 1; status: "DOCUMENTATION_READY" | "DOCUMENTATION_ACCEPTED" | "IMMEDIATE_DOCUMENTATION_ACCEPTED" | "PROJECT_DOCUMENTATION_ACCEPTED" | "DENIED"; approvalAllowed: boolean; candidateCommit?: string; candidateFingerprint?: string; issues: { code: string; message: string }[] }
const same = (a: unknown, b: unknown, code = "DOCUMENTATION_EVIDENCE_STALE") => { if (fingerprint(a) !== fingerprint(b)) fail(code, "Evidence identity/content differs"); };
const exact = (a: string[], b: string[]) => { strings(a); same([...a].sort(), [...b].sort(), "DOCUMENTATION_PREREQUISITE_MISSING"); };
export function documentGateRequest(root: string, gate: CheckRecord["request"]["gate"], extras: ValidationCategory[] = []): CheckRecord["request"] {
  const cfg = loadTophatConfig(root), additionalCategories = [...new Set(extras)].filter(c => !cfg.validation[gate].includes(c));
  return { gate, ...(additionalCategories.length ? { additionalCategories } : {}) };
}
function ancestor(root: string, a: string, b: string): void {
  commitSha(a); commitSha(b); if (git(root, ["merge-base", a, b]).trim() !== a) fail("DOCUMENTATION_PREREQUISITE_MISSING", "Commit not integrated into the declared baseline");
}
function commitFile(root: string, commit: string, path: string): string | null {
  const entry = git(root, ["ls-tree", commit, "--", path]).trim();
  if (!entry) return null;
  if (!entry.startsWith("100644 ")) fail("WRITER_BOUNDARY_VIOLATION", "Only regular non-executable document blobs are allowed");
  const r = spawnSync("git", ["--no-optional-locks", "show", `${commit}:${path}`], { cwd: root, timeout: 10000, maxBuffer: 32 * 1024 * 1024 });
  if (r.error || r.status !== 0) fail("POSTCONDITION_UNVERIFIED", "Cannot inspect exact document blob bytes");
  return digest(r.stdout);
}
function externalFile(root: string, value: unknown): { full: string; bytes: Buffer } {
  const v = record(value, "artifact"); fields(v, ["root", "path", "sha256"]); hash(v.sha256);
  if (!isAbsolute(text(v.root))) fail("DOC_EVIDENCE_INVALID", "Artifact custody must be external");
  const base = resolve(v.root as string), rel = relative(resolve(root), base);
  const outside = (p: string) => p === ".." || p.startsWith(".." + sep);
  if (!outside(rel) || !outside(relative(base, resolve(root))) || realpathSync(base) !== base || !lstatSync(base).isDirectory() || lstatSync(base).isSymbolicLink()) fail("DOC_EVIDENCE_INVALID", "Artifact root overlaps host or is redirected");
  const full = safePath(base, text(v.path)), bytes = readFileSync(full); if (digest(bytes) !== v.sha256) fail("DOC_EVIDENCE_INVALID", "Artifact digest differs");
  return { full, bytes };
}
function checkRecord(root: string, value: unknown, commit: string, expectedRequest: CheckRecord["request"]): void {
  const v = record(value, "check"); fields(v, ["request", "report", "artifact"]); same(v.request, expectedRequest, "DOC_CHECK_INVALID");
  const req = record(v.request, "check request"); fields(req, ["gate"], ["additionalCategories"]);
  const cfg = loadTophatConfig(root), selection = [...cfg.validation[expectedRequest.gate], ...(expectedRequest.additionalCategories ?? []).filter(c => !cfg.validation[expectedRequest.gate].includes(c))];
  const r = record(v.report, "runner report"); fields(r, ["schemaVersion", "gate", "profile", "categories", "results", "status", "decision", "code", "reason", "testedCommit", "evidenceKind"]);
  if (r.schemaVersion !== 1 || r.gate !== expectedRequest.gate || r.profile !== `${cfg.workspace.kind}:${cfg.workspace.framework}` || r.decision !== "allow") fail("DOC_CHECK_INVALID", "Declared gate failed or differs");
  strings(r.categories); same(r.categories, selection, "DOC_CHECK_INVALID"); text(r.code); text(r.reason);
  if (!selection.length) {
    if (r.status !== "SKIPPED_NOT_APPLICABLE" || r.code !== "OPTIONAL_GATE_EMPTY" || r.testedCommit !== null || r.evidenceKind !== null || array(r.results).length || v.artifact !== null) fail("DOC_CHECK_INVALID", "Empty optional gate must skip visibly without fabricated commit/log");
    return;
  }
  if (r.status !== "PASSED" || r.testedCommit !== commit || r.evidenceKind !== (expectedRequest.gate === "commitGate" ? "PRE_COMMIT_SNAPSHOT" : "EXISTING_COMMIT")) fail("DOC_CHECK_INVALID", "Checks are not passing for the candidate");
  const results = array(r.results); if (results.length !== selection.length) fail("DOC_CHECK_INVALID", "Incomplete gate results");
  results.forEach((raw, i) => { const q = record(raw, "outcome"); fields(q, ["category", "script", "status", "exitStatus"], ["stdout", "stderr", "signal"]);
    if (q.category !== selection[i] || q.script !== cfg.validation.scripts[selection[i]] || q.status !== "PASSED" || q.exitStatus !== 0 || q.signal != null || [q.stdout, q.stderr].some(s => s !== undefined && typeof s !== "string")) fail("DOC_CHECK_INVALID", "Script outcome not passing"); });
  const log = externalFile(root, v.artifact); same(inputJson(log.bytes.toString("utf8")), r, "DOC_CHECK_INVALID");
}
function completion(root: string, value: unknown, baseline: string, phaseId: string | null): TaskCompletion {
  const v = record(value, "task completion"); fields(v, ["task", "testedCommit", "integratedCommit", "stages", "validation", "qa", "acceptance"]);
  const tested = commitSha(v.testedCommit), integrated = commitSha(v.integratedCommit); ancestor(root, tested, integrated); ancestor(root, integrated, baseline);
  const route = classifyTask(root, v.task, tested);
  if (phaseId !== null && route.task.authority.developmentPhaseId !== phaseId) fail("DOCUMENTATION_PREREQUISITE_MISSING", "Task from a different phase");
  validateStages(v.stages, route, tested); checkRecord(root, v.validation, tested, documentGateRequest(root, "commitGate", route.task.validationCategories));
  const a = record(v.acceptance, "task acceptance"); fields(a, ["signal", "human", "locator", "taskFingerprint", "testedCommit"]); text(a.human); text(a.locator);
  if (a.signal !== "APPROVED" || a.taskFingerprint !== route.taskFingerprint || a.testedCommit !== tested) fail("DOCUMENTATION_PREREQUISITE_MISSING", "Task acceptance differs from tested route");
  if (route.qaRequired) {
    const q = record(v.qa, "historical QA"); same(q.task, v.task); same(q.stageRecords, v.stages);
    if (!validateQAEvidence(root, q, tested).approvalAllowed) fail("DOCUMENTATION_PREREQUISITE_MISSING", "Historical QA evidence did not pass");
  } else if (v.qa !== null) fail("DOC_EVIDENCE_INVALID", "Unexpected historical QA record");
  return v as unknown as TaskCompletion;
}
function parsedCandidate(root: string, value: unknown): DocCandidate {
  const v = record(value, "candidate"); fields(v, ["schemaVersion", "identity", "membership", "tasks", "phases", "assessment", "writer", "baselineValidation", "finalValidation", "claims", "completion", "seal"]);
  if (v.schemaVersion !== 1) fail("DOC_EVIDENCE_INVALID", "Unsupported candidate schema");
  const id = record(v.identity, "identity"); fields(id, ["mode", "id", "phaseId", "attemptId", "sequence", "expectedBranch", "expectedBase", "baselineCommit", "candidateCommit", "authorityFingerprint", "configFingerprint", "startedAt", "completedAt"]);
  for (const k of ["id", "attemptId", "expectedBranch", "expectedBase"]) text(id[k]);
  if (!["phase", "immediate", "project-completion"].includes(id.mode as string) || !Number.isSafeInteger(id.sequence) || (id.sequence as number) < 1 || instant(id.startedAt) > instant(id.completedAt)) fail("DOC_EVIDENCE_INVALID", "Invalid candidate identity");
  if (id.mode === "project-completion" ? id.phaseId !== null : typeof id.phaseId !== "string" || !id.phaseId.trim()) fail("DOC_EVIDENCE_INVALID", "Invalid phase identity");
  commitSha(id.baselineCommit); commitSha(id.candidateCommit); hash(id.authorityFingerprint); hash(id.configFingerprint);
  strings(v.membership, undefined, true); array(v.tasks); array(v.phases); array(v.claims); array(v.completion);
  const a = record(v.assessment, "assessment"); fields(a, ["outcome", "rationale", "references", "conflicts", "plan"]); text(a.rationale); strings(a.references, undefined, true); strings(a.conflicts);
  if (!["CHANGES_PROPOSED", "NO_DOCUMENTATION_CHANGE_REQUIRED"].includes(a.outcome as string)) fail("DOC_EVIDENCE_INVALID", "Missing explicit assessment");
  if ((a.conflicts as string[]).length) fail("DOCUMENTATION_AUTHORITY_CONFLICT", "Realization conflicts with approved authority");
  const plan = checkedPlan(root, a.plan);
  if ((a.outcome === "NO_DOCUMENTATION_CHANGE_REQUIRED") !== !plan.length || (plan.length === 0 ? v.writer !== null : v.writer === null)) fail("DOC_EVIDENCE_INVALID", "No-change or writer outcome contradicts plan");
  return { ...v, assessment: { ...a, plan } } as unknown as DocCandidate;
}
function currentCandidate(root: string, c: DocCandidate, historical = false): void {
  const id = c.identity, context = derivedPaths(root), p = inspectDocPackage(root).snapshot!;
  if (id.authorityFingerprint !== context.authorityFingerprint || id.configFingerprint !== context.configFingerprint) fail("DOCUMENTATION_EVIDENCE_STALE", "Authority/config changed");
  if (!historical) {
    if (git(root, ["rev-parse", "HEAD"]).trim() !== id.candidateCommit) fail("DOCUMENTATION_EVIDENCE_STALE", "Later commit invalidates document readiness");
    cleanSnapshot(snapshot(root, []), id.expectedBranch, []);
  }
  ancestor(root, id.baselineCommit, id.candidateCommit);
  c.assessment.references.forEach(ref => { if (!p.index.get(ref)?.active) fail("DOC_TRACE_INVALID", "Inactive or unresolved assessment source"); });
  const changed = git(root, ["diff", "--no-renames", "--name-only", "-z", id.baselineCommit, id.candidateCommit]).split("\0").filter(Boolean);
  exact(changed, c.assessment.plan.map(p => p.path));
  for (const w of c.assessment.plan) {
    if (commitFile(root, id.baselineCommit, w.path) !== w.oldSha256 || commitFile(root, id.candidateCommit, w.path) !== w.newSha256) fail("WRITER_BOUNDARY_VIOLATION", "Exact baseline/candidate blob digests differ from plan");
    if (!historical && fileState(root, w.path).sha256 !== w.newSha256) fail("DOCUMENTATION_EVIDENCE_STALE", "Candidate document bytes differ");
  }
  exact(c.tasks.map(t => t.task.taskId), c.membership);
  for (const t of c.tasks) completion(root, t, id.baselineCommit, id.phaseId);
  if (id.mode === "immediate") {
    if (c.tasks.length !== 1 || c.membership[0] !== id.id || c.tasks[0].task.immediateDocumentation?.required !== true) fail("DOC_EVIDENCE_INVALID", "Immediate mode requires one explicitly classified task");
  } else if (id.mode === "phase" && c.identity.id !== id.phaseId) fail("DOC_EVIDENCE_INVALID", "Phase report identity differs");
  if (id.mode !== "project-completion" && (c.phases.length || c.completion.length)) fail("DOC_EVIDENCE_INVALID", "Phase/immediate record cannot certify project completion");
  if (c.writer !== null) {
    const w = record(c.writer, "writer post"); fields(w, ["schemaVersion", "status", "before", "after", "observedOperations", "changed", "issues", "fingerprint"]);
    const { fingerprint: fp, ...body } = w; if (fp !== fingerprint(body) || w.status !== "WRITER_BOUNDARY_VALID" || array(w.issues).length) fail("WRITER_BOUNDARY_VIOLATION", "Writer postcondition did not pass");
    const before = checkedDocCapture(root, w.before), after = checkedDocCapture(root, w.after);
    same(before.declaration.plan, c.assessment.plan); same(after.declaration, before.declaration);
    if (before.snapshot.commit !== id.baselineCommit || after.snapshot.commit !== id.baselineCommit || before.authorityFingerprint !== id.authorityFingerprint || before.configFingerprint !== id.configFingerprint) fail("WRITER_BOUNDARY_VIOLATION", "Writer provenance differs");
    // Verify immutable pre/post metadata and all protected files; commit happens outside the writer.
    const strip = (q: DocCapture) => ({ ...q, fingerprint: undefined, targetFiles: q.targetFiles.filter(f => !c.assessment.plan.some(p => p.path === f.path)), snapshot: { ...q.snapshot, trackedDiff: undefined, tracked: q.snapshot.tracked.filter(f => !c.assessment.plan.some(p => p.path === f.path)), inputs: q.snapshot.inputs.filter(f => !c.assessment.plan.some(p => p.path === f.path)), untracked: q.snapshot.untracked.filter(f => !c.assessment.plan.some(p => p.path === f.path)) } });
    same(strip(before), strip(after), "WRITER_BOUNDARY_VIOLATION");
    for (const op of array(w.observedOperations)) { const o = record(op, "writer operation"); fields(o, ["category", "detail", "authorized"], ["path"]); text(o.detail);
      if (o.authorized !== true || !["read", "file-write"].includes(o.category as string) || (o.category === "file-write" ? !c.assessment.plan.some(p => p.path === o.path) : o.path !== undefined)) fail("WRITER_BOUNDARY_VIOLATION", "Forbidden writer operation"); }
    same(w.changed, c.assessment.plan.map(p => { const f = after.targetFiles.find(f => f.path === p.path); return f ?? { path: p.path, sha256: null, mode: null }; }), "WRITER_BOUNDARY_VIOLATION");
    for (const p of c.assessment.plan) if ((before.targetFiles.find(f => f.path === p.path)?.sha256 ?? null) !== p.oldSha256 || (after.targetFiles.find(f => f.path === p.path)?.sha256 ?? null) !== p.newSha256) fail("WRITER_BOUNDARY_VIOLATION", "Writer digest differs from plan");
  }
  const cfg = loadTophatConfig(root), gate = id.mode === "phase" ? "developmentPhaseGate" : id.mode === "project-completion" ? "projectCompletionGate" : "commitGate";
  const extras = id.mode === "immediate" ? c.tasks[0].task.validationCategories : [];
  checkRecord(root, c.baselineValidation, id.baselineCommit, documentGateRequest(root, gate, extras));
  const finalExtras = [...extras, ...(cfg.validation.scripts.documentation ? ["documentation" as const] : [])];
  checkRecord(root, c.finalValidation, id.candidateCommit, documentGateRequest(root, gate, finalExtras));
  const seal = record(c.seal, "sealed review session"); fields(seal, ["before", "after"]);
  const before = checkedCapture(seal.before), after = verification(seal.after, before);
  if (before.declaration.role !== "qa" || before.snapshot.commit !== id.candidateCommit || before.declaration.expectedBranch !== id.expectedBranch || after.status !== "SESSION_UNCHANGED") fail("POSTCONDITION_UNVERIFIED", "Document review candidate session not unchanged");
  for (const raw of after.observedOperations) {
    const op = record(raw, "document reviewer operation");
    if (op.category !== "read" || op.authorized !== true || op.path !== undefined) fail("ROLE_BOUNDARY_VIOLATION", "Document reviewer cannot execute commands or mutations");
  }
  cleanSnapshot(before.snapshot, id.expectedBranch, before.declaration.inputPaths);
  if (!historical && verifyRole(root, before.declaration, before, after.observedOperations).status !== "SESSION_UNCHANGED") fail("DOCUMENTATION_EVIDENCE_STALE", "Document review protected state changed");
}
function claims(root: string, c: DocCandidate, historical: boolean): void {
  const p = inspectDocPackage(root).snapshot!, ids: string[] = [];
  for (const raw of c.claims) {
    const q = record(raw, "claim"); fields(q, ["id", "sourceCriterion", "kind", "procedure", "expected", "observed", "methods", "result", "rationale", "evidence"]);
    ids.push(text(q.id)); for (const k of ["procedure", "expected", "observed"]) text(q[k]);
    if (p.index.get(text(q.sourceCriterion))?.item.kind !== "acceptance-criterion" || !p.index.get(q.sourceCriterion as string)?.active || !["editorial", "executable", "screenshot", "user-facing"].includes(q.kind as string)) fail("DOC_TRACE_INVALID", "Claim source/kind invalid");
    const methods = strings(q.methods, qaMethods);
    if (q.result === "NOT_APPLICABLE") { text(q.rationale); if (q.kind !== "editorial" || methods.length || q.evidence !== null) fail("DOC_CLAIM_BLOCKED", "Material claim cannot skip verification"); continue; }
    if (q.result !== "PASSED" || q.rationale !== null) fail("DOC_CLAIM_BLOCKED", "Claim verification did not pass");
    if (q.kind === "editorial") { if (methods.length || q.evidence !== null) fail("DOC_EVIDENCE_INVALID", "Editorial claim uses independent review"); continue; }
    if (!methods.length) { externalFile(root, q.evidence); continue; }
    const e = record(q.evidence, "claim QA"); fields(e, ["report", "before", "after"]);
    const r = checkedReport(e.report), before = checkedCapture(e.before), post = verification(e.after, before), cfg = loadTophatConfig(root);
    const subject = fingerprint({ commit: c.identity.candidateCommit, id: q.id, source: q.sourceCriterion, methods, expected: q.expected });
    if (r.identity.testedCommit !== c.identity.candidateCommit || r.identity.taskFingerprint !== subject || r.identity.taskId !== q.id || r.identity.expectedBranch !== c.identity.expectedBranch || before.declaration.expectedBranch !== c.identity.expectedBranch || before.snapshot.branch !== c.identity.expectedBranch || r.preflight !== before.snapshotFingerprint || r.postflight !== post.postconditionFingerprint || r.verdict !== "APPROVED" || post.status !== "SESSION_UNCHANGED" || !r.environment.available || r.environment.buildCommit !== c.identity.candidateCommit || !/^\d+\.\d+\.\d+$/.test(r.environment.nodeVersion) || Number(r.environment.nodeVersion.split(".")[0]) < 24 || r.environment.workspaceKind !== cfg.workspace.kind || r.environment.framework !== cfg.workspace.framework || before.snapshot.commit !== c.identity.candidateCommit || before.declaration.role !== "qa" || r.reviewer.sessionId !== before.declaration.sessionId) fail("DOC_CLAIM_BLOCKED", "Claim QA is stale or blocked");
    cleanSnapshot(before.snapshot, c.identity.expectedBranch, before.declaration.inputPaths);
    if ((methods.includes("e2e-web") && !cfg.capabilities.includes("web-qa")) || (methods.includes("e2e-desktop") && !cfg.capabilities.includes("desktop-qa")) || (methods.some(m => ["visual", "responsive", "accessibility", "human-design"].includes(m)) && !cfg.capabilities.some(k => ["web-ui", "renderer-ui"].includes(k)))) fail("QA_METHOD_INCOMPATIBLE", "Claim QA incompatible");
    const writer = c.writer?.before.declaration.sessionId;
    if (writer && (r.reviewer.sessionId === writer || !r.reviewer.independentOf.includes(writer))) fail("ROLE_BOUNDARY_VIOLATION", "Writer cannot QA own document claim");
    exact(r.methodResults.map(m => m.method), methods); exact(r.criteria.map(x => x.id), [q.sourceCriterion as string]);
    if (r.methodResults.some(m => m.result !== "PASSED") || r.criteria.some(x => x.result !== "PASSED" || x.sourceCriterion !== q.sourceCriterion || x.methods.length !== methods.length) || r.findings.some(f => f.severity !== "MINOR") || r.commands.length) fail("DOC_CLAIM_BLOCKED", "Incomplete claim methods/criterion; commands belong to declared validation");
    for (const criterion of r.criteria) { exact(criterion.methods, methods); if (!criterion.qaApplicable || criterion.commandIds.length || !criterion.artifactIds.length || criterion.artifactIds.some(id => !r.artifacts.some(a => a.id === id))) fail("DOC_CLAIM_BLOCKED", "Claim criterion lacks exact applicable evidence"); }
    for (const m of r.methodResults) { if (!m.artifactIds.length || m.artifactIds.some(id => !r.artifacts.some(a => a.id === id))) fail("DOC_CLAIM_BLOCKED", "Method artifact absent"); if (m.method === "human-design" && (m.humanAcceptance?.taskFingerprint !== subject || m.humanAcceptance.testedCommit !== c.identity.candidateCommit)) fail("DOC_CLAIM_BLOCKED", "Human-design signal absent"); }
    if (before.declaration.artifactRoot === null) fail("DOC_EVIDENCE_INVALID", "Claim QA requires external artifacts");
    collate(r.artifacts.map(a => a.path)); exact(r.artifacts.map(a => a.path), post.after.externalArtifacts.map(f => f.path)); strings(r.artifacts.map(a => a.id));
    for (const a of r.artifacts) if (fileState(before.declaration.artifactRoot, a.path).sha256 !== a.sha256 || post.after.externalArtifacts.find(f => f.path === a.path)?.sha256 !== a.sha256) fail("DOC_CLAIM_BLOCKED", "Claim artifact differs");
    if (!historical && verifyRole(root, before.declaration, before, post.observedOperations).status !== "SESSION_UNCHANGED") fail("ROLE_BOUNDARY_VIOLATION", "Claim QA protected state changed");
  }
  strings(ids); if (!ids.length) fail("DOC_CLAIM_BLOCKED", "Explicit claim/coverage assessment required");
}
function review(value: unknown, c: DocCandidate): DocReview {
  const v = record(value, "document review"); fields(v, ["role", "sessionId", "candidateFingerprint", "candidateCommit", "reviewedAt", "verdict", "findings", "checklist"]);
  text(v.sessionId); instant(v.reviewedAt); strings(v.findings);
  if (v.role !== "independent-document-review" || v.sessionId !== c.seal.before.declaration.sessionId || v.candidateFingerprint !== fingerprint(c) || v.candidateCommit !== c.identity.candidateCommit || v.verdict !== "APPROVED" || (v.findings as string[]).length || instant(v.reviewedAt) < instant(c.identity.completedAt) || v.sessionId === c.writer?.before.declaration.sessionId || c.tasks.some(t => t.stages.some((r: any) => r.stage === "implementation" && r.sessionId === v.sessionId))) fail("DOC_REVIEW_REQUIRED", "Independent current document approval required");
  const list = array(v.checklist); exact(list.map(r => text(record(r, "checklist").id)), reviewChecklist);
  for (const raw of list) { const r = record(raw, "checklist"); fields(r, ["id", "result", "rationale"]); text(r.rationale); if (!["PASSED", "NOT_APPLICABLE"].includes(r.result as string)) fail("DOC_REVIEW_REQUIRED", "Review finding blocks acceptance"); if (r.result === "NOT_APPLICABLE" && r.id !== "svg-active-content") fail("DOC_REVIEW_REQUIRED", "Core review obligation cannot be skipped"); if (r.id === "svg-active-content" && c.assessment.plan.some(p => p.path.toLowerCase().endsWith(".svg")) && r.result !== "PASSED") fail("DOC_REVIEW_REQUIRED", "SVG active content must be audited"); }
  return v as unknown as DocReview;
}
function accepted(value: unknown, c: DocCandidate, r: DocReview): DocAcceptance {
  const v = record(value, "acceptance"); fields(v, ["signal", "human", "locator", "candidateFingerprint", "reviewSha256", "acceptedAt"]); text(v.human); text(v.locator);
  if (v.signal !== "APPROVED" || v.candidateFingerprint !== fingerprint(c) || v.reviewSha256 !== fingerprint(r) || instant(v.acceptedAt) < instant(r.reviewedAt)) fail("DOC_ACCEPTANCE_REQUIRED", "Exact reviewed human acceptance required");
  return v as unknown as DocAcceptance;
}
function inspectReceipt(root: string, raw: unknown, historical: boolean, accept: boolean): DocReceipt {
  const v = record(raw, "receipt"); fields(v, ["candidate", "review", "acceptance"]); const c = parsedCandidate(root, v.candidate);
  currentCandidate(root, c, historical); claims(root, c, historical); const r = review(v.review, c);
  if (accept) accepted(v.acceptance, c, r); else if (v.acceptance !== null) accepted(v.acceptance, c, r);
  return { candidate: c, review: r, acceptance: v.acceptance as DocAcceptance | null };
}
export function validateDerivedDocs(root: string, input: unknown): DocResult {
  try {
    if (Buffer.byteLength(JSON.stringify(input)) > 1024 * 1024) fail("EVIDENCE_INCOMPLETE", "Document evidence exceeds 1 MiB");
    const v = record(input, "request"); fields(v, ["schemaVersion", "operation", "receipt", "attemptIndex"]);
    if (v.schemaVersion !== 1 || !["readiness", "accept"].includes(v.operation as string)) fail("DOC_EVIDENCE_INVALID", "Unknown operation");
    const receipt = inspectReceipt(root, v.receipt, false, v.operation === "accept"), c = receipt.candidate;
    const index = record(v.attemptIndex, "attempt index"); fields(index, ["id", "currentAttempt", "entries"]); const entries = array(index.entries);
    if (index.id !== c.identity.id || index.currentAttempt !== c.identity.attemptId || !entries.length || entries.length > 256) fail("DOCUMENTATION_EVIDENCE_STALE", "Missing/current attempt differs");
    let time = 0; entries.forEach((raw, i) => { const e = record(raw, "attempt"); fields(e, ["sequence", "attemptId", "record", "sha256"]); if (e.sequence !== i + 1) fail("DOC_EVIDENCE_INVALID", "Noncontiguous attempt history"); hash(e.sha256); same(e.sha256, fingerprint(e.record)); const r = record(e.record, "attempt record"); fields(r, ["id", "attemptId", "candidateCommit", "completedAt", "verdict", "receipt"]); if (r.id !== c.identity.id || r.attemptId !== e.attemptId || !["APPROVED", "CHANGES_REQUIRED", "BLOCKED"].includes(r.verdict as string) || instant(r.completedAt) < time) fail("DOC_EVIDENCE_INVALID", "Invalid historical attempt"); time = instant(r.completedAt); commitSha(r.candidateCommit); if (r.verdict === "APPROVED" && r.receipt === null) fail("DOC_EVIDENCE_INVALID", "Approved attempt lacks receipt"); });
    const last = record(record(entries.at(-1), "latest").record, "latest record"); if (last.verdict !== "APPROVED" || last.attemptId !== c.identity.attemptId || c.identity.sequence !== entries.length || last.candidateCommit !== c.identity.candidateCommit) fail("DOCUMENTATION_EVIDENCE_STALE", "Later failure or different candidate"); same(last.receipt, receipt);
    if (c.identity.mode === "project-completion") {
      if (!c.phases.length) fail("DOCUMENTATION_PREREQUISITE_MISSING", "Accepted phase history required");
      const phaseIds: string[] = [], taskIds: string[] = [];
      for (const raw of c.phases) { const p = inspectReceipt(root, raw, true, true); if (p.candidate.identity.mode !== "phase") fail("DOC_EVIDENCE_INVALID", "Immediate report cannot accept a phase"); ancestor(root, p.candidate.identity.candidateCommit, c.identity.baselineCommit); phaseIds.push(p.candidate.identity.id); taskIds.push(...p.candidate.membership); }
      strings(phaseIds); exact(taskIds, c.membership); exact(c.completion.map(d => d.dimension), completionDimensions);
      for (const raw of c.completion) { const d = record(raw, "completion coverage"); fields(d, ["dimension", "result", "rationale"]); text(d.rationale); if (!["PASSED", "NOT_APPLICABLE"].includes(d.result as string) || (["realized-product", "setup-dependencies", "configuration", "links", "handoff"].includes(d.dimension as string) && d.result !== "PASSED")) fail("DOC_COMPLETION_BLOCKED", "Final handoff coverage incomplete"); }
    }
    return { schemaVersion: 1, status: v.operation === "readiness" ? "DOCUMENTATION_READY" : c.identity.mode === "phase" ? "DOCUMENTATION_ACCEPTED" : c.identity.mode === "immediate" ? "IMMEDIATE_DOCUMENTATION_ACCEPTED" : "PROJECT_DOCUMENTATION_ACCEPTED", approvalAllowed: true, candidateCommit: c.identity.candidateCommit, candidateFingerprint: fingerprint(c), issues: [] };
  } catch (e) { return { schemaVersion: 1, status: "DENIED", approvalAllowed: false, issues: [issue(e)] }; }
}
export function verifyDocumentPR(ready: DocResult, expectedBase: string, head: string, base: string): void {
  if (!ready.approvalAllowed || ready.candidateCommit !== head || expectedBase !== base) fail("DOCUMENTATION_EVIDENCE_STALE", "Published PR head/base differs");
}
/** Historical display is never a publication or current-readiness permission. */
export function acceptedDocumentHistory(root: string, value: unknown): { candidateCommit: string; mode: string } | null {
  try { const r = inspectReceipt(root, value, true, true); return { candidateCommit: r.candidate.identity.candidateCommit, mode: r.candidate.identity.mode }; }
  catch { return null; }
}
if (isMain(import.meta.url)) { try { const r = validateDerivedDocs(process.cwd(), inputJson(readFileSync(0, "utf8"))); console.log(JSON.stringify(r)); if (!r.approvalAllowed) process.exitCode = 1; } catch (e) { console.log(JSON.stringify({ status: "DENIED", approvalAllowed: false, issues: [issue(e)] })); process.exitCode = 1; } }

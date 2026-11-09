import {terminalViewportReason} from "../../../scripts/validate-terminal-environment.ts";
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fixture as docs, approve, task as authority } from "../documentation/fixture.ts";
import { classifyTask, fingerprint, type TaskClassification, type StageRecord } from "../../../scripts/classify-task.ts";
import { captureRole, verifyRole } from "../../../scripts/inspect-role-session.ts";
import { runValidation } from "../../../scripts/run-validation.ts";
import { type QAReport, type AttemptIndex } from "../../../scripts/validate-qa-evidence.ts";
export function git(root: string, args: string[]): string {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (r.error || r.status !== 0) throw Error(r.stderr); return r.stdout.trim();
}
export function host(kind = "web", framework = "react", script = 'node -e "console.log(\'unit passed\')"', mode: 'cli'|'tui' = 'tui') {
  const f = docs(); approve(f.root); const root = f.root;
  const config = JSON.parse(readFileSync(join(root, ".agents/tophat.config.json"), "utf8"));
  config.workspace = { kind, framework, ...(kind === "terminal" ? {mode} : {}) };
  writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify(config));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "slice6-fixture", private: true, scripts: { "test:unit": script } }));
  writeFileSync(join(root, ".gitignore"), "coverage/\n"); writeFileSync(join(root, "product.ts"), "export const value = 1;\n");
  writeFileSync(join(root, "Context.md"), "# Private handoff\n");
  const source = authority(root);
  git(root, ["init", "--initial-branch=feature/qa"]); git(root, ["config", "user.name", "Fixture"]); git(root, ["config", "user.email", "fixture@example.invalid"]);
  git(root, ["add", "."]); git(root, ["commit", "-m", "Synthetic Slice 6 candidate"]);
  const artifacts = mkdtempSync(join(tmpdir(), "tophat-qa-artifacts-"));
  const task: TaskClassification = { schemaVersion: 1, taskId: "task-1", authority: source,
    guidance: { requestedSkills: [], taskTopics: kind === "web" ? ["browser-flow"] : kind === "desktop" ? ["desktop-flow"] : kind === "terminal" ? ["terminal-flow"] : [], frameworkInstructions: [] },
    workKinds: kind === "backend" || kind === "terminal" && mode === "cli" ? ["internal"] : kind === "terminal" ? ["terminal-logic"] : ["client-logic"], userEffects: kind === "web" ? ["web-flow"] : kind === "desktop" ? ["desktop-flow"] : kind === "terminal" ? ["terminal-flow"] : ["no-user-facing-change"],
    noUserFacingReason: kind === "backend" ? "Internal health utility; no interface change" : null, validationCategories: ["unit"],
    acceptanceChecks: [{ id: "check-1", sourceCriterion: "product#AC-001", text: "Synthetic behavior check", qaApplicable: kind !== "backend", ...(kind === "backend" ? { applicabilityReason: "Validated by host unit script" } : {}) }] };
  return { root, task, artifacts, close: () => { f.close(); rmSync(artifacts, { recursive: true, force: true }); } };
}
export function stageRecords(root: string, task: TaskClassification, developerSession = "developer-session"): StageRecord[] {
  const route = classifyTask(root, task), commit = git(root, ["rev-parse", "HEAD"]);
  return route.requiredStages.filter(s => s !== "qa").map((stage, i) => ({ stage, sequence: i + 1, taskFingerprint: route.taskFingerprint, inspectedCommit: commit,
    role: stage === "implementation" ? `developer-${route.devTier}` : stage, sessionId: stage === "implementation" ? developerSession : `${stage}-session`, verdict: "APPROVED", findings: [] }));
}
export function evidence(f: ReturnType<typeof host>, verdict: "APPROVED" | "CHANGES_REQUIRED" | "BLOCKED" = "APPROVED") {
  const { root, task } = f, route = classifyTask(root, task), commit = git(root, ["rev-parse", "HEAD"]);
  const declaration = { schemaVersion: 1 as const, role: "qa" as const, sessionId: "qa-session", expectedBranch: "feature/qa", inputPaths: [], outputPaths: [], artifactRoot: f.artifacts };
  const before = captureRole(root, declaration);
  const validation = runValidation({ gate: "commitGate" }, root, "pnpm", { timeoutMs: 10000, maxBufferBytes: 65536, disableAutomaticSetup: true });
  writeFileSync(join(f.artifacts, "run.log"), JSON.stringify(validation) + "\n");
  const after = verifyRole(root, declaration, before, [{ category: "command", detail: "Declared pnpm unit gate", authorized: true }]);
  const report: QAReport = { schemaVersion: 1, identity: { taskId: task.taskId, attemptId: "attempt-1", sequence: 1, taskFingerprint: route.taskFingerprint, expectedBranch: "feature/qa", testedCommit: commit },
    environment: { workspaceKind: JSON.parse(readFileSync(join(root, ".agents/tophat.config.json"), "utf8")).workspace.kind, framework: JSON.parse(readFileSync(join(root, ".agents/tophat.config.json"), "utf8")).workspace.framework,
      nodeVersion: process.versions.node, pnpmVersion: "11.25.0", os: process.platform, applicationVersion: "synthetic-fixture", buildCommit: commit, buildEvidence: "Synthetic build identity; no browser run claimed",
      target: "fixture://behavior", configuration: "No secrets", roles: ["synthetic-user"], controlledData: "Fixture fixed input", resetProcedure: "New temporary fixture",
      externalDependencies: "None", states: ["success", "error"], statesReason: null, viewports: [], viewportsReason: "Synthetic evidence structure test; no browser executed", available: verdict !== "BLOCKED" },
    methodResults: route.qaMethods.map(method => ({ method, result: verdict === "CHANGES_REQUIRED" ? "FAILED" : verdict === "BLOCKED" ? "BLOCKED" : "PASSED", procedure: "Synthetic method observation", artifactIds: ["run-log"], humanAcceptance: null })),
    criteria: ["product#AC-001", "check-1"].map(id => ({ id, sourceCriterion: "product#AC-001", qaApplicable: true, applicabilityReason: null, methods: route.qaMethods,
      procedure: "Synthetic journey", expected: "Expected fixture behavior", observed: verdict === "CHANGES_REQUIRED" ? "Synthetic failure" : "Synthetic expected behavior", result: verdict === "CHANGES_REQUIRED" ? "FAILED" : verdict === "BLOCKED" ? "BLOCKED" : "PASSED", commandIds: ["unit-command"], artifactIds: ["run-log"], regression: "Synthetic neighboring-flow check" })),
    commands: [{ id: "unit-command", category: "unit", script: "test:unit", artifactId: "run-log", result: validation.status === "PASSED" ? "PASSED" : "FAILED", validation }],
    artifacts: [{ id: "run-log", path: "run.log", kind: "log", sha256: after.after.externalArtifacts[0].sha256! }], findings: [], preflight: before.snapshotFingerprint, postflight: after.postconditionFingerprint,
    reviewer: { role: "qa", sessionId: "qa-session", independentOf: ["developer-session"] }, startedAt: "2026-10-03T17:00:00.000Z", completedAt: "2026-10-03T17:00:01.000Z", verdict };
  if (report.environment.workspaceKind === "terminal") {
    const mode = JSON.parse(readFileSync(join(root, ".agents/tophat.config.json"), "utf8")).workspace.mode;
    report.environment.viewportsReason = terminalViewportReason;
    report.environment.terminal = {mode,terminalIdentity:"Synthetic evidence harness v1",term:{value:null,reason:"Structure fixture, no PTY executed"},locale:{value:null,reason:"Not observed by synthetic report"},runtimeInvocation:"Synthetic unit script",nativeDependencies:"None",ttyMode:mode === "tui" ? "pty" : "non-tty",sizes:mode === "tui" ? [{rows:24,columns:80}] : [],sizeReason:mode === "tui" ? null : "No screen dimensions in CLI structure fixture",captureLimitations:"Synthetic metadata only; no native journey acceptance"};
  }
  if (validation.status !== "PASSED") { report.verdict = "CHANGES_REQUIRED"; report.criteria.forEach(c => c.result = "FAILED"); }
  const attemptIndex: AttemptIndex = { schemaVersion: 1, taskId: task.taskId, currentAttempt: "attempt-1", entries: [{ sequence: 1, attemptId: "attempt-1", reportSha256: fingerprint(report), report }] };
  const request = { schemaVersion: 1, operation: "validate", task, report, before, after, attemptIndex, stageRecords: stageRecords(root, task) };
  const publish = { schemaVersion: 1, operation: "publish", task, expectedBranch: "feature/qa", expectedBase: "development", stageRecords: request.stageRecords, validation,
    validationArtifact: { path: "run.log", sha256: report.artifacts[0].sha256 },
    qa: { report, before, after, attemptIndex }, session: { before, observedOperations: [] } };
  return { request, publish, report, before, after, validation, index: attemptIndex };
}
export function refreshIndex(e: ReturnType<typeof evidence>): void { e.index.entries.at(-1)!.reportSha256 = fingerprint(e.report); }

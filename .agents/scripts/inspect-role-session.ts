import { readFileSync, existsSync, readdirSync, realpathSync, lstatSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { snapshot, cleanSnapshot, collectOutput, collate, relativeName, type Snapshot, type FileState } from "./inspect-workspace-attachment.ts";
import { record, fields, text, strings, array, hash, commitSha, fail, fingerprint, inputJson, issue } from "./classify-task.ts";
import { isMain } from "./validate-doc-package.ts";

export interface RoleDeclaration {
  schemaVersion: 1; role: "qa" | "pm"; sessionId: string; expectedBranch: string;
  inputPaths: string[]; outputPaths: string[]; artifactRoot: string | null;
}
export interface RoleCapture {
  schemaVersion: 1; status: "SESSION_CAPTURED"; declaration: RoleDeclaration; snapshot: Snapshot;
  privateState: FileState[]; outputs: FileState[]; externalArtifacts: FileState[]; artifactRootIdentity: string | null; snapshotFingerprint: string;
}
export interface ObservedOperation { category: "read" | "command" | "file-write" | "git-mutation" | "external-state-mutation"; detail: string; authorized: boolean; path?: string }
export interface RoleVerification {
  schemaVersion: 1; status: "SESSION_UNCHANGED" | "DENIED"; issues: { code: string; message: string }[];
  before: RoleCapture; after: RoleCapture; observedOperations: ObservedOperation[]; unchangedProtectedState: boolean; postconditionFingerprint: string;
}
function declaration(input: unknown): RoleDeclaration {
  const v = record(input, "role declaration"); fields(v, ["schemaVersion", "role", "sessionId", "expectedBranch", "inputPaths", "outputPaths", "artifactRoot"]);
  if (v.schemaVersion !== 1 || !["qa", "pm"].includes(v.role as string)) fail("QA_PREFLIGHT_DENIED", "Unsupported role declaration");
  text(v.sessionId); text(v.expectedBranch);
  const inputs = strings(v.inputPaths).map(relativeName), outputs = strings(v.outputPaths).map(relativeName);
  collate([...inputs, ...outputs]);
  if (v.role === "pm" && (outputs.length || v.artifactRoot !== null)) fail("ROLE_BOUNDARY_VIOLATION", "PM cannot have writable outputs");
  if (v.artifactRoot !== null && !isAbsolute(text(v.artifactRoot))) fail("QA_ARTIFACT_INVALID", "External artifact directory must be absolute");
  for (const p of outputs) {
    if (["package.json", "pnpm-lock.yaml", "Context.md", "Strategy.md", "Roadmap.md", "HUD.md"].some(q => p === q || q.startsWith(p + "/")) ||
      p === "docs" || p.startsWith("docs/") || (p.startsWith(".agents") && !/^\.agents\/qa\/[^/]+\/[^/]+\/artifacts(?:\/|$)/.test(p)) ||
      inputs.some(q => q === p || q.startsWith(p + "/") || p.startsWith(q + "/")))
      fail("ROLE_BOUNDARY_VIOLATION", "Evidence outputs overlap protected state");
  }
  if (outputs.some((p, i) => outputs.some((q, j) => i !== j && p.startsWith(q + "/")))) fail("QA_PREFLIGHT_DENIED", "Overlapping output roots");
  return v as unknown as RoleDeclaration;
}
const isOutput = (name: string, d: RoleDeclaration): boolean => d.outputPaths.some(p => name === p || name.startsWith(p + "/"));
function external(root: string, d: RoleDeclaration): { identity: string | null; files: FileState[] } {
  if (d.artifactRoot === null) return { identity: null, files: [] };
  const full = resolve(d.artifactRoot), real = realpathSync(full), host = realpathSync(root);
  if (full !== real || lstatSync(full).isSymbolicLink() || !lstatSync(full).isDirectory() || relative(host, real) === "" || !relative(host, real).startsWith("..") || !relative(real, host).startsWith(".."))
    fail("QA_ARTIFACT_INVALID", "Choose a dedicated external directory without symlink or host overlap");
  return { identity: fingerprint(real), files: collectOutput(real, readdirSync(real).sort()) };
}
export function captureRole(root: string, input: unknown): RoleCapture {
  return capture(root, declaration(input), true);
}
function capture(root: string, d: RoleDeclaration, preflight: boolean): RoleCapture {
  const defaults = [".agents/tophat.config.json", "Context.md", "Strategy.md", "Roadmap.md", "HUD.md"];
  const privateState = existsSync(resolve(root, ".agents")) ? collectOutput(root, [".agents"]).filter(x => !isOutput(x.path, d)) : [];
  const inputs = [...new Set([...defaults, ...d.inputPaths, ...privateState.map(x => x.path)])].sort();
  const s = snapshot(root, inputs, d.outputPaths);
  if (preflight && d.role === "qa") cleanSnapshot(s, d.expectedBranch, d.inputPaths);
  const ext = external(root, d);
  const data = { schemaVersion: 1 as const, status: "SESSION_CAPTURED" as const, declaration: d, snapshot: s, privateState,
    outputs: collectOutput(root, d.outputPaths), externalArtifacts: ext.files, artifactRootIdentity: ext.identity };
  if (Buffer.byteLength(JSON.stringify(data)) > 1024 * 1024) fail("QA_PREFLIGHT_DENIED", "Session snapshot exceeds 1 MiB");
  return { ...data, snapshotFingerprint: fingerprint(data) };
}
export function checkedCapture(value: unknown): RoleCapture {
  const v = record(value, "capture"); fields(v, ["schemaVersion", "status", "declaration", "snapshot", "privateState", "outputs", "externalArtifacts", "artifactRootIdentity", "snapshotFingerprint"]);
  declaration(v.declaration);
  const { snapshotFingerprint: fp, ...body } = v;
  if (v.schemaVersion !== 1 || v.status !== "SESSION_CAPTURED" || fp !== fingerprint(body)) fail("POSTCONDITION_UNVERIFIED", "Invalid capture fingerprint");
  const s = record(v.snapshot, "snapshot"); fields(s, ["rootIdentity", "commit", "branch", "index", "trackedDiff", "tracked", "inputs", "untracked", "hooksPath", "hook", "exclude", "operations", "history", "globalExclude"]);
  for (const key of ["rootIdentity", "index", "trackedDiff", "history"]) hash(s[key]);
  commitSha(s.commit); if (s.branch !== null) text(s.branch); if (s.hooksPath !== null) text(s.hooksPath); strings(s.operations);
  for (const key of ["hook", "exclude"]) {
    const m = record(s[key], key); fields(m, ["sha256", "executable"]); if (m.sha256 !== null) hash(m.sha256);
    if (typeof m.executable !== "boolean") fail("POSTCONDITION_UNVERIFIED", "Invalid Git integration snapshot");
  }
  const global = record(s.globalExclude, "global exclude"); fields(global, ["path", "sha256"]);
  if (global.path !== null) text(global.path); if (global.sha256 !== null) hash(global.sha256);
  if (v.artifactRootIdentity !== null) hash(v.artifactRootIdentity);
  for (const key of ["tracked", "inputs", "untracked"]) fileInventory(s[key]);
  for (const key of ["privateState", "outputs", "externalArtifacts"]) fileInventory(v[key]);
  return v as unknown as RoleCapture;
}
export function fileInventory(value: unknown): FileState[] {
  const a = array(value);
  if (a.length > 16384) fail("QA_EVIDENCE_INVALID", "Excessive inventory");
  for (const x of a) { const f = record(x, "file"); fields(f, ["path", "sha256", "mode"]); relativeName(f.path);
    if ((f.sha256 === null) !== (f.mode === null) || (f.sha256 !== null && !/^[a-f0-9]{64}$/.test(text(f.sha256))) || (f.mode !== null && (!Number.isSafeInteger(f.mode) || (f.mode as number) < 0 || (f.mode as number) > 0o777))) fail("QA_EVIDENCE_INVALID", "Invalid file inventory"); }
  const names = a.map(x => (x as FileState).path); collate(names);
  if (new Set(names).size !== names.length) fail("QA_EVIDENCE_INVALID", "Duplicate file inventory");
  return a as FileState[];
}
export function verifyRole(root: string, input: unknown, beforeValue: unknown, operationsValue: unknown): RoleVerification {
  const d = declaration(input), before = checkedCapture(beforeValue);
  if (fingerprint(d) !== fingerprint(before.declaration)) fail("POSTCONDITION_UNVERIFIED", "Session declaration changed");
  const operations = array(operationsValue).map(raw => {
    const v = record(raw, "operation"); fields(v, ["category", "detail", "authorized"], ["path"]);
    if (!["read", "command", "file-write", "git-mutation", "external-state-mutation"].includes(v.category as string) || typeof v.authorized !== "boolean") fail("ROLE_BOUNDARY_VIOLATION", "Unknown observed operation");
    text(v.detail);
    if (v.category === "file-write") relativeName(v.path);
    else if (v.path !== undefined) fail("ROLE_BOUNDARY_VIOLATION", "Path applies only to file-write operations");
    return v as unknown as ObservedOperation;
  });
  // Capture even a dirty post-state; cleanliness is a preflight, not a reason to omit failed-run evidence.
  const after = capture(root, d, false);
  const unchangedProtectedState = fingerprint(before.snapshot) === fingerprint(after.snapshot) && fingerprint(before.privateState) === fingerprint(after.privateState) && before.artifactRootIdentity === after.artifactRootIdentity;
  const forbidden = operations.some(o => d.role === "pm" ? o.category !== "read" || !o.authorized : !o.authorized || ["git-mutation", "external-state-mutation"].includes(o.category) ||
    (o.category === "file-write" && !(d.artifactRoot === null ? isOutput(o.path!, d) : after.externalArtifacts.some(f => f.path === o.path))));
  const issues = !unchangedProtectedState || forbidden ? [{ code: "ROLE_BOUNDARY_VIOLATION", message: "Protected state changed or forbidden operation observed" }] : [];
  const data = { schemaVersion: 1 as const, status: issues.length ? "DENIED" as const : "SESSION_UNCHANGED" as const, issues, before, after, observedOperations: operations, unchangedProtectedState };
  return { ...data, postconditionFingerprint: fingerprint(data) };
}
export function inspectRoleSession(root: string, input: unknown): RoleCapture | RoleVerification {
  const v = record(input, "session request");
  const common = ["schemaVersion", "operation", "role", "sessionId", "expectedBranch", "inputPaths", "outputPaths", "artifactRoot"];
  fields(v, v.operation === "capture" ? common : [...common, "before", "observedOperations"]);
  const { operation, before, observedOperations, ...d } = v;
  if (operation === "capture") return captureRole(root, d);
  if (operation === "verify") return verifyRole(root, d, before, observedOperations);
  fail("POSTCONDITION_UNVERIFIED", "Unknown session operation");
}
if (isMain(import.meta.url)) {
  try { const result = inspectRoleSession(process.cwd(), inputJson(readFileSync(0, "utf8"))); console.log(JSON.stringify(result)); if (result.status === "DENIED") process.exitCode = 1; }
  catch (e) { console.log(JSON.stringify({ status: "DENIED", issues: [issue(e)] })); process.exitCode = 1; }
}

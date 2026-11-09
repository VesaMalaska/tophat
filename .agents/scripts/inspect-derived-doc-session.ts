import { readFileSync, existsSync, realpathSync } from "node:fs";
import { resolve, extname } from "node:path";
import { loadTophatConfig } from "./load-tophat-config.ts";
import { inspectDocPackage, isMain } from "./validate-doc-package.ts";
import { git, checkedPath, fileState, collate, collectOutput, snapshot, cleanSnapshot, type FileState, type Snapshot } from "./inspect-workspace-attachment.ts";
import { fileInventory, checkedSnapshot } from "./inspect-role-session.ts";
import { record, fields, text, strings, array, hash, fingerprint, inputJson, fail, issue } from "./classify-task.ts";

export interface DocWrite { path: string; operation: "create" | "replace" | "delete"; oldSha256: string | null; newSha256: string | null; reason: string; references: string[] }
export interface DocSessionDeclaration { schemaVersion: 1; sessionId: string; expectedBranch: string; inputPaths: string[]; plan: DocWrite[]; authorization: { signal: "APPROVED"; planFingerprint: string; human: string; locator: string } }
export interface DocCapture { schemaVersion: 1; declaration: DocSessionDeclaration; authorityFingerprint: string; configFingerprint: string; targets: string[]; snapshot: Snapshot; privateState: FileState[]; targetFiles: FileState[]; fingerprint: string }
export interface DocPost { schemaVersion: 1; status: "WRITER_BOUNDARY_VALID" | "DENIED"; before: DocCapture; after: DocCapture; observedOperations: unknown[]; changed: FileState[]; fingerprint: string; issues: { code: string; message: string }[] }
const formats = new Set([".md", ".txt", ".rst", ".adoc", ".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const privateRoots = [".git", ".agents", "node_modules", "src", "lib", "test", "tests", "dist", "build", "Strategy.md", "Roadmap.md", "Context.md", "HUD.md", "DECISIONS.md", "package.json", "pnpm-lock.yaml", ".gitignore"];
const inside = (name: string, target: string): boolean => target.endsWith("/") ? name.startsWith(target) : name === target;
const overlap = (a: string, b: string): boolean => a === b || a.startsWith(b + "/") || b.startsWith(a + "/");
export function derivedPaths(root: string): { targets: string[]; protectedPaths: string[]; authorityFingerprint: string; configFingerprint: string } {
  const cfg = loadTophatConfig(root), p = inspectDocPackage(root);
  if (!p.snapshot || !p.report.planningAllowed) fail(p.report.issues[0]?.code ?? "DOC_PACKAGE_UNAPPROVED", "Current approved documentation is required");
  const s = p.snapshot, protectedPaths = [...privateRoots, `${s.packagePath}/README.md`, `${s.packagePath}/${cfg.documentation.manifest}`, `${s.packagePath}/manifest.schema.json`, ...s.manifest.documents.filter(d => d.role === "authoritative").map(d => `${s.packagePath}/${d.path}`)];
  const names = [...git(root, ["ls-files", "-z"]).split("\0"), ...git(root, ["ls-files", "--others", "--exclude-standard", "-z"]).split("\0")].filter(Boolean);
  const targets = [...cfg.documentation.derivedTargets];
  for (const t of targets) {
    const name = t.replace(/\/$/, ""); checkedPath(root, name);
    if (protectedPaths.some(p => overlap(name.toLowerCase(), p.toLowerCase())) || targets.some(q => q !== t && overlap(name.toLowerCase(), q.replace(/\/$/, "").toLowerCase()))) fail("DERIVED_TARGET_INVALID", "Target overlaps protected state or another target");
    if (!t.endsWith("/")) allowedFile(root, name, s.packagePath, s.manifest.documents);
    for (const f of collectOutput(root, [name])) allowedFile(root, f.path, s.packagePath, s.manifest.documents);
  }
  collate([...names, ...targets.map(t => t.replace(/\/$/, ""))]);
  // Absolute case folding additionally covers the host prefix on insensitive platforms.
  const absolute = targets.map(t => resolve(realpathSync(root), t.replace(/\/$/, "")).toLowerCase());
  if (new Set(absolute).size !== absolute.length) fail("DERIVED_TARGET_INVALID", "Absolute target collision");
  return { targets, protectedPaths, authorityFingerprint: s.authorityFingerprint, configFingerprint: fingerprint(cfg) };
}
function allowedFile(root: string, name: string, packagePath: string, docs: { path: string; role: string }[]): void {
  checkedPath(root, name);
  if (!formats.has(extname(name).toLowerCase()) || name.split("/").some(p => privateRoots.includes(p)) || /(?:^|\/)\.[^/]+(?:\/|$)/.test(name)) fail("DERIVED_TARGET_INVALID", `Unsupported/protected document: ${name}`);
  if (name.startsWith(packagePath + "/") && !docs.some(d => `${packagePath}/${d.path}` === name && d.role === "derived")) fail("DERIVED_TARGET_INVALID", "Package inventory amendment is separate");
  const f = fileState(root, name); if (f.mode !== null && (f.mode & 0o111)) fail("DERIVED_TARGET_INVALID", "Executable document denied");
}
export function checkedPlan(root: string, input: unknown): DocWrite[] {
  const context = derivedPaths(root), p = inspectDocPackage(root).snapshot!;
  const plan = array(input).map(raw => {
    const v = record(raw, "write"); fields(v, ["path", "operation", "oldSha256", "newSha256", "reason", "references"]);
    const path = text(v.path); allowedFile(root, path, p.packagePath, p.manifest.documents);
    if (!context.targets.some(t => inside(path, t))) fail("DERIVED_TARGET_INVALID", "Write is not a declared derived target");
    text(v.reason); strings(v.references, undefined, true).forEach(r => { if (!p.index.get(r)?.active) fail("DOC_TRACE_INVALID", "Unresolved authority reference"); });
    if (!["create", "replace", "delete"].includes(v.operation as string)) fail("DERIVED_TARGET_INVALID", "Unsupported operation");
    if (v.oldSha256 !== null) hash(v.oldSha256); if (v.newSha256 !== null) hash(v.newSha256);
    if ((v.operation === "create" ? v.oldSha256 !== null || v.newSha256 === null : v.operation === "delete" ? v.oldSha256 === null || v.newSha256 !== null : v.oldSha256 === null || v.newSha256 === null || v.oldSha256 === v.newSha256)) fail("DERIVED_TARGET_INVALID", "Contradictory write digests");
    return v as unknown as DocWrite;
  });
  collate([...plan.map(p => p.path), ...git(root, ["ls-files", "-z"]).split("\0").filter(Boolean), ...collectOutput(root, context.targets.map(t => t.replace(/\/$/, ""))).map(f => f.path)]); if (new Set(plan.map(p => p.path)).size !== plan.length) fail("DERIVED_TARGET_INVALID", "Duplicate planned path");
  return plan;
}
function declaration(root: string, value: unknown): DocSessionDeclaration {
  const v = record(value, "session"); fields(v, ["schemaVersion", "sessionId", "expectedBranch", "inputPaths", "plan", "authorization"]);
  if (v.schemaVersion !== 1) fail("DERIVED_TARGET_INVALID", "Unsupported session schema"); text(v.sessionId); text(v.expectedBranch);
  strings(v.inputPaths).forEach(p => checkedPath(root, p)); const plan = checkedPlan(root, v.plan);
  const a = record(v.authorization, "authorization"); fields(a, ["signal", "planFingerprint", "human", "locator"]); text(a.human); text(a.locator);
  if (a.signal !== "APPROVED" || a.planFingerprint !== fingerprint(plan)) fail("DOC_WRITE_APPROVAL_REQUIRED", "Exact human-authorized plan required");
  return { ...v, plan } as unknown as DocSessionDeclaration;
}
function capture(root: string, d: DocSessionDeclaration, clean: boolean): DocCapture {
  const c = derivedPaths(root), privateState = existsSync(resolve(root, ".agents")) ? collectOutput(root, [".agents"]) : [];
  const inputs = [...new Set([...d.inputPaths, ...privateRoots.filter(p => ["Strategy.md", "Roadmap.md", "Context.md", "HUD.md", "DECISIONS.md"].includes(p)), ...privateState.map(p => p.path)])];
  const tracked = new Set(git(root, ["ls-files", "-z"]).split("\0"));
  const s = snapshot(root, inputs, d.plan.filter(p => !tracked.has(p.path) && !d.inputPaths.includes(p.path)).map(p => p.path));
  if (clean) cleanSnapshot(s, d.expectedBranch, d.inputPaths);
  const targetFiles = collectOutput(root, c.targets.map(t => t.replace(/\/$/, "")));
  const body = { schemaVersion: 1 as const, declaration: d, authorityFingerprint: c.authorityFingerprint, configFingerprint: c.configFingerprint, targets: c.targets, snapshot: s, privateState, targetFiles };
  if (Buffer.byteLength(JSON.stringify(body)) > 1024 * 1024) fail("EVIDENCE_INCOMPLETE", "Document capture exceeds 1 MiB");
  return { ...body, fingerprint: fingerprint(body) };
}
export function captureDocSession(root: string, input: unknown): DocCapture {
  const d = declaration(root, input), c = capture(root, d, true);
  for (const p of d.plan) if (fileState(root, p.path).sha256 !== p.oldSha256) fail("DOCUMENTATION_EVIDENCE_STALE", "Planned prior bytes changed");
  return c;
}
export function checkedDocCapture(root: string, value: unknown): DocCapture {
  const v = record(value, "capture"); fields(v, ["schemaVersion", "declaration", "authorityFingerprint", "configFingerprint", "targets", "snapshot", "privateState", "targetFiles", "fingerprint"]);
  const { fingerprint: fp, ...body } = v; if (fp !== fingerprint(body) || v.schemaVersion !== 1) fail("POSTCONDITION_UNVERIFIED", "Capture digest differs");
  declaration(root, v.declaration); hash(v.authorityFingerprint); hash(v.configFingerprint); strings(v.targets);
  fileInventory(v.privateState); fileInventory(v.targetFiles);
  checkedSnapshot(v.snapshot);
  // Full metadata is compared to a freshly captured native snapshot during post/readiness.
  return v as unknown as DocCapture;
}
const withoutWrites = (files: FileState[], plan: DocWrite[]) => files.filter(f => !plan.some(p => p.path === f.path));
export function postDocSession(root: string, beforeValue: unknown, operations: unknown): DocPost {
  const before = checkedDocCapture(root, beforeValue), after = capture(root, before.declaration, false), plan = before.declaration.plan;
  const ops = array(operations); const issues: { code: string; message: string }[] = [];
  try {
    for (const raw of ops) {
      const o = record(raw, "operation"); fields(o, ["category", "detail", "authorized"], ["path"]); text(o.detail);
      if (o.authorized !== true || !["read", "file-write"].includes(o.category as string)) fail("WRITER_BOUNDARY_VIOLATION", "Writer command or mutation prohibited");
      if (o.category === "file-write" ? !plan.some(p => p.path === o.path) : o.path !== undefined) fail("WRITER_BOUNDARY_VIOLATION", "Undeclared operation path");
    }
    const protectedCapture = (c: DocCapture) => ({ ...c, fingerprint: undefined, targetFiles: withoutWrites(c.targetFiles, plan), snapshot: { ...c.snapshot, trackedDiff: undefined, tracked: withoutWrites(c.snapshot.tracked, plan), inputs: withoutWrites(c.snapshot.inputs, plan), untracked: withoutWrites(c.snapshot.untracked, plan) } });
    if (fingerprint(protectedCapture(before)) !== fingerprint(protectedCapture(after))) fail("WRITER_BOUNDARY_VIOLATION", "Protected state, index, HEAD or undeclared outputs changed");
    for (const p of plan) if (fileState(root, p.path).sha256 !== p.newSha256) fail("WRITER_BOUNDARY_VIOLATION", "Surviving document bytes differ from approved plan");
  } catch (e) { issues.push(issue(e)); }
  const changed = plan.map(p => fileState(root, p.path)), body = { schemaVersion: 1 as const, status: issues.length ? "DENIED" as const : "WRITER_BOUNDARY_VALID" as const, before, after, observedOperations: ops, changed, issues };
  return { ...body, fingerprint: fingerprint(body) };
}
export function inspectDocSession(root: string, input: unknown): DocCapture | DocPost {
  const v = record(input, "request"); fields(v, ["schemaVersion", "operation"], v.operation === "capture" ? ["session"] : ["before", "observedOperations"]);
  if (v.schemaVersion !== 1) fail("DERIVED_TARGET_INVALID", "Unsupported request");
  if (v.operation === "capture") return captureDocSession(root, v.session);
  if (v.operation === "post") return postDocSession(root, v.before, v.observedOperations);
  fail("DERIVED_TARGET_INVALID", "Unknown operation");
}
if (isMain(import.meta.url)) {
  try { const r = inspectDocSession(process.cwd(), inputJson(readFileSync(0, "utf8"))); console.log(JSON.stringify(r)); if ("status" in r && r.status === "DENIED") process.exitCode = 1; }
  catch (e) { console.log(JSON.stringify({ status: "DENIED", issues: [issue(e)] })); process.exitCode = 1; }
}

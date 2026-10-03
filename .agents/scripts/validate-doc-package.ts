import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTophatConfig, TophatConfigError } from "./load-tophat-config.ts";

export type DocMode = "approved" | "draft";
export type DocumentationState = "DRAFT" | "AWAITING_HUMAN_APPROVAL" | "APPROVED" | "INVALIDATED";
export type ItemKind = "requirement" | "decision" | "contract" | "acceptance-criterion";
export interface SourceItem {
  id: string; kind: ItemKind; authority: string; scope: string;
  acceptanceCriteria?: string[];
  decisionState?: "proposed" | "accepted" | "rejected" | "superseded";
  supersededBy?: string;
}
export interface DocumentEntry {
  id: string; path: string; version: string; status: "active" | "inactive";
  role: "authoritative" | "derived"; authority: string[]; dependsOn: string[];
  scope: string[]; items: SourceItem[]; sha256?: string;
}
export interface DocManifest {
  $schema: "./manifest.schema.json"; schemaVersion: 1; packageId: string; version: string;
  approvalStatus: "draft" | "awaiting-human-approval" | "approved";
  entryGuide: "README.md"; readingOrder: string[]; scope: { active: string[]; inactive: string[] };
  documents: DocumentEntry[]; approvedAuthorityFingerprint?: string;
}
export interface DocIssue { code: string; message: string; path?: string; expected?: string; calculated?: string }
export interface DocReport {
  schemaVersion: 1; mode: DocMode; status: "APPROVED_VALID" | "DRAFT_VALID" | "DENIED";
  planningAllowed: boolean; documentationState: DocumentationState | null;
  packageId?: string; packageVersion?: string; authorityFingerprint?: string; candidateFingerprint?: string;
  sourceIndex?: Array<{ reference: string; kind: ItemKind; path: string; scope: string; active: boolean }>;
  issues: DocIssue[];
}
export interface IndexedSource { document: DocumentEntry; item: SourceItem; content: string; active: boolean }
export interface PackageSnapshot {
  root: string; packagePath: string; manifestPath: string; manifestBytes: Buffer;
  manifest: DocManifest; index: Map<string, IndexedSource>; hashes: Map<string, string>;
  authorityFingerprint: string; candidateFingerprint: string;
}
export class DocFailure extends Error {
  readonly issue: DocIssue;
  constructor(code: string, message: string, path?: string, extra: Partial<DocIssue> = {}) {
    super(message); this.name = "DocFailure"; this.issue = { code, message, ...(path ? { path } : {}), ...extra };
  }
}
export function deny(code: string, message: string, path?: string): never { throw new DocFailure(code, message, path); }
export const digest = (bytes: string | Buffer): string => createHash("sha256").update(bytes).digest("hex");
export function canonical(value: unknown): string {
  const sort = (v: unknown): unknown => Array.isArray(v) ? v.map(sort) :
    v !== null && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sort((v as Record<string, unknown>)[k])])) : v;
  return JSON.stringify(sort(value));
}
export const idPattern = /^[A-Za-z][A-Za-z0-9._-]*$/;
export const refPattern = /^[A-Za-z][A-Za-z0-9._-]*#[A-Za-z][A-Za-z0-9._-]*$/;
export const hashPattern = /^[a-f0-9]{64}$/;
export function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) deny("DOC_METADATA_INVALID", `${label} must be an object`);
  return value as Record<string, unknown>;
}
export function keys(value: Record<string, unknown>, required: string[], optional: string[], label: string): void {
  for (const key of required) if (!Object.hasOwn(value, key)) deny("DOC_METADATA_INVALID", `${label}.${key} is required`);
  for (const key of Object.keys(value)) if (![...required, ...optional].includes(key)) deny("DOC_METADATA_INVALID", `${label}.${key} is unsupported`);
}
export function text(value: unknown, label: string, pattern?: RegExp): string {
  if (typeof value !== "string" || !value.trim() || (pattern && !pattern.test(value))) deny("DOC_METADATA_INVALID", `${label} is invalid`);
  return value as string;
}
export function list(value: unknown, label: string, pattern?: RegExp, nonempty = false): string[] {
  if (!Array.isArray(value) || (nonempty && !value.length)) deny("DOC_METADATA_INVALID", `${label} must be ${nonempty ? "a nonempty" : "an"} array`);
  const out = value.map((v, i) => text(v, `${label}[${i}]`, pattern));
  if (new Set(out).size !== out.length) deny("DOC_DUPLICATE_ID", `${label} contains duplicates`);
  return out;
}
function one(value: unknown, values: readonly unknown[], label: string): void {
  if (!values.includes(value)) deny("DOC_METADATA_INVALID", `${label} is invalid`);
}

/** JSON.parse alone loses duplicate member names. Scan valid JSON before accepting it. */
export function strictJson(source: string, label: string): unknown {
  let parsed: unknown;
  try { parsed = JSON.parse(source); } catch { deny("DOC_JSON_INVALID", `${label} is not valid JSON`); }
  let at = 0;
  const space = () => { while (/\s/.test(source[at] ?? "") && at < source.length) at++; };
  const string = (): string => {
    const start = at++;
    while (at < source.length) { if (source[at] === "\\") at += 2; else if (source[at++] === '"') break; }
    return JSON.parse(source.slice(start, at));
  };
  const value = (depth: number): void => {
    if (depth > 128) deny("DOC_JSON_INVALID", `${label} exceeds the supported JSON nesting depth`);
    space();
    if (source[at] === '"') { string(); return; }
    if (source[at] === "{") {
      at++; space(); const seen = new Set<string>();
      while (source[at] !== "}") {
        const key = string(); if (seen.has(key)) deny("DOC_JSON_DUPLICATE_KEY", `${label} repeats a JSON member`);
        seen.add(key); space(); at++; value(depth + 1); space(); if (source[at] === ",") { at++; space(); } else break;
      }
      at++; return;
    }
    if (source[at] === "[") {
      at++; space(); while (source[at] !== "]") { value(depth + 1); space(); if (source[at] === ",") { at++; space(); } else break; }
      at++; return;
    }
    while (at < source.length && !/[\s,\]}]/.test(source[at])) at++;
  };
  value(0); return parsed;
}

export function safePath(root: string, input: string, kind: "file" | "directory" = "file"): string {
  if (!input || input.includes("\\") || /[\u0000-\u001f\u007f]/.test(input) || isAbsolute(input) || /^[A-Za-z]:/.test(input) ||
    input.split("/").some(p => !p || p === "." || p === "..")) deny("DOC_PATH_INVALID", "Path must be relative without traversal", input);
  let current = root;
  for (const part of input.split("/")) {
    current = resolve(current, part);
    let stat;
    try { stat = lstatSync(current); } catch { deny("DOC_FILE_UNAVAILABLE", "Declared path cannot be inspected", input); }
    if (stat.isSymbolicLink()) deny("DOC_PATH_INVALID", "Symlinked package paths are unsupported", input);
  }
  const resolved = realpathSync(current);
  const rel = relative(root, resolved);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) deny("DOC_PATH_INVALID", "Path escapes its declared root", input);
  const stat = lstatSync(resolved);
  if (kind === "file" ? !stat.isFile() : !stat.isDirectory()) deny("DOC_FILE_UNAVAILABLE", `Declared path must be a regular ${kind}`, input);
  return resolved;
}
function bytes(path: string, label: string): Buffer {
  try { return readFileSync(path); } catch { deny("DOC_FILE_UNAVAILABLE", "Declared file cannot be read", label); }
}
export const canonicalSchemaPath = resolve(dirname(fileURLToPath(import.meta.url)), "../schemas/doc-manifest.schema.json");

function manifestShape(raw: unknown): DocManifest {
  const m = object(raw, "manifest");
  keys(m, ["$schema", "schemaVersion", "packageId", "version", "approvalStatus", "entryGuide", "readingOrder", "scope", "documents"], ["approvedAuthorityFingerprint"], "manifest");
  one(m.$schema, ["./manifest.schema.json"], "$schema"); one(m.schemaVersion, [1], "schemaVersion");
  one(m.entryGuide, ["README.md"], "entryGuide"); one(m.approvalStatus, ["draft", "awaiting-human-approval", "approved"], "approvalStatus");
  text(m.packageId, "packageId", idPattern); text(m.version, "version");
  list(m.readingOrder, "readingOrder", idPattern, true);
  const scope = object(m.scope, "scope"); keys(scope, ["active", "inactive"], [], "scope");
  const active = list(scope.active, "scope.active", idPattern, true), inactive = list(scope.inactive, "scope.inactive", idPattern);
  if (active.some(s => inactive.includes(s))) deny("DOC_SCOPE_INVALID", "Active and inactive scopes overlap");
  if (m.approvedAuthorityFingerprint !== undefined) text(m.approvedAuthorityFingerprint, "approvedAuthorityFingerprint", hashPattern);
  if (!Array.isArray(m.documents) || !m.documents.length) deny("DOC_METADATA_INVALID", "documents must be nonempty");
  for (const [i, rawDoc] of m.documents.entries()) {
    const label = `documents[${i}]`, d = object(rawDoc, label);
    keys(d, ["id", "path", "version", "status", "role", "authority", "dependsOn", "scope", "items"], ["sha256"], label);
    text(d.id, `${label}.id`, idPattern); text(d.path, `${label}.path`); text(d.version, `${label}.version`);
    one(d.status, ["active", "inactive"], `${label}.status`); one(d.role, ["authoritative", "derived"], `${label}.role`);
    list(d.authority, `${label}.authority`, idPattern, d.role === "authoritative");
    list(d.dependsOn, `${label}.dependsOn`, idPattern); list(d.scope, `${label}.scope`, idPattern, true);
    if (d.sha256 !== undefined) text(d.sha256, `${label}.sha256`, hashPattern);
    if (!Array.isArray(d.items)) deny("DOC_METADATA_INVALID", `${label}.items must be an array`);
    if (d.role === "derived" && ((d.authority as string[]).length || d.items.length || d.sha256 !== undefined))
      deny("DOC_AUTHORITY_CONFLICT", "Derived documents cannot own authority, items, or authority hashes", d.path as string);
    for (const [j, rawItem] of d.items.entries()) {
      const l = `${label}.items[${j}]`, item = object(rawItem, l);
      keys(item, ["id", "kind", "authority", "scope"], ["acceptanceCriteria", "decisionState", "supersededBy"], l);
      text(item.id, `${l}.id`, idPattern); text(item.authority, `${l}.authority`, idPattern); text(item.scope, `${l}.scope`, idPattern);
      one(item.kind, ["requirement", "decision", "contract", "acceptance-criterion"], `${l}.kind`);
      if (item.kind === "requirement") list(item.acceptanceCriteria, `${l}.acceptanceCriteria`, refPattern, true);
      else if (item.acceptanceCriteria !== undefined) deny("DOC_METADATA_INVALID", "Only requirements declare acceptanceCriteria");
      if (item.kind === "decision") {
        one(item.decisionState, ["proposed", "accepted", "rejected", "superseded"], `${l}.decisionState`);
        if (item.decisionState === "superseded") text(item.supersededBy, `${l}.supersededBy`, refPattern);
        else if (item.supersededBy !== undefined) deny("DOC_DECISION_INVALID", "Only superseded decisions declare supersededBy");
      } else if (item.decisionState !== undefined || item.supersededBy !== undefined) deny("DOC_DECISION_INVALID", "Only decisions declare decision state");
    }
  }
  return raw as DocManifest;
}

/** Literal anchor lines, outside CommonMark-style backtick/tilde fences. */
export function sourceBlocks(source: string, items: SourceItem[], path: string): Map<string, string> {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const anchors: Array<{ id: string; line: number }> = [];
  let fence: { char: string; length: number } | null = null;
  for (const [line, value] of lines.entries()) {
    const match = value.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (match && match[1][0] === fence.char && match[1].length >= fence.length && !match[2].trim()) fence = null;
      continue;
    }
    if (match && !(match[1][0] === "`" && match[2].includes("`"))) { fence = { char: match[1][0], length: match[1].length }; continue; }
    const anchor = value.match(/^[ \t]*<a[ \t]+id[ \t]*=[ \t]*"([A-Za-z][A-Za-z0-9._-]*)"[ \t]*>[ \t]*<\/a>[ \t]*$/);
    if (anchor) anchors.push({ id: anchor[1], line });
  }
  const declared = new Set(items.map(i => i.id));
  if (declared.size !== items.length) deny("DOC_DUPLICATE_ID", "Source item IDs repeat", path);
  const result = new Map<string, string>();
  for (const [i, anchor] of anchors.entries()) {
    if (!declared.has(anchor.id)) deny("DOC_SOURCE_INVALID", "Undeclared source anchor", `${path}#${anchor.id}`);
    if (result.has(anchor.id)) deny("DOC_DUPLICATE_ID", "Source anchor repeats", `${path}#${anchor.id}`);
    const content = lines.slice(anchor.line + 1, anchors[i + 1]?.line ?? lines.length).join("\n");
    if (!content.trim()) deny("DOC_SOURCE_INVALID", "Source block is empty", `${path}#${anchor.id}`);
    result.set(anchor.id, content);
  }
  for (const item of items) if (!result.has(item.id)) deny("DOC_SOURCE_INVALID", "Source anchor is missing outside examples", `${path}#${item.id}`);
  return result;
}
function acyclic(graph: Map<string, string[]>, code: string): void {
  const visiting = new Set<string>(), visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) deny(code, "Declared dependency cycle", id);
    if (visited.has(id)) return;
    visiting.add(id); for (const next of graph.get(id) ?? []) visit(next); visiting.delete(id); visited.add(id);
  };
  for (const id of graph.keys()) visit(id);
}
function fingerprintMetadata(m: DocManifest): unknown {
  const { approvalStatus: _status, approvedAuthorityFingerprint: _approval, documents, ...rest } = m;
  return { ...rest, documents: documents.map(({ sha256: _hash, ...doc }) => doc) };
}
export function inspectDocPackage(workspaceRoot: string, mode: DocMode = "approved", proposedManifest?: Buffer): { report: DocReport; snapshot?: PackageSnapshot } {
  let manifest: DocManifest | undefined;
  try {
    if (mode !== "draft" && mode !== "approved") deny("DOC_INPUT_INVALID", "mode must be draft or approved");
    const config = loadTophatConfig(workspaceRoot), root = realpathSync(workspaceRoot);
    const packagePath = config.documentation.package.replace(/\/$/, "");
    if (!packagePath.startsWith("docs/") || packagePath === "docs/") deny("DOC_PATH_INVALID", "Package must be below docs/<package>", packagePath);
    const packageRoot = safePath(root, packagePath, "directory");
    const manifestPath = safePath(packageRoot, config.documentation.manifest);
    const manifestBytes = proposedManifest ?? bytes(manifestPath, config.documentation.manifest);
    const raw = strictJson(manifestBytes.toString("utf8"), "manifest");
    // Retain known approval state even if a later schema/metadata check fails.
    if (raw && typeof raw === "object" && !Array.isArray(raw)) manifest = raw as DocManifest;
    const schemaBytes = bytes(safePath(packageRoot, "manifest.schema.json"), "manifest.schema.json");
    const schema = strictJson(schemaBytes.toString("utf8"), "manifest.schema.json");
    const expectedSchema = strictJson(bytes(canonicalSchemaPath, "canonical schema").toString("utf8"), "canonical schema");
    if (canonical(schema) !== canonical(expectedSchema)) deny("DOC_SCHEMA_INVALID", "Package schema must match the closed TopHat v1 schema", "manifest.schema.json");
    manifest = manifestShape(raw);
    const guide = safePath(packageRoot, "README.md"), guideBytes = bytes(guide, "README.md");
    const seenPaths = new Set<string>(), seenFiles = new Set<string>(), docs = new Map<string, DocumentEntry>();
    const register = (path: string, full: string): void => {
      const folded = path.toLowerCase(); const stat = lstatSync(full); const identity = `${stat.dev}:${stat.ino}`;
      if (seenPaths.has(folded) || seenFiles.has(identity)) deny("DOC_DUPLICATE_PATH", "Declared files collide by path or filesystem identity", path);
      seenPaths.add(folded); seenFiles.add(identity);
    };
    register(config.documentation.manifest, manifestPath); register("manifest.schema.json", safePath(packageRoot, "manifest.schema.json")); register("README.md", guide);
    const index = new Map<string, IndexedSource>(), hashes = new Map<string, string>(), owners = new Map<string, string>();
    for (const doc of manifest.documents) {
      if (docs.has(doc.id)) deny("DOC_DUPLICATE_ID", "Document ID repeats", doc.id); docs.set(doc.id, doc);
      const full = safePath(packageRoot, doc.path); register(doc.path, full);
      if (doc.path.split("/").includes(".agents") || ["Context.md", "Strategy.md", "Roadmap.md", "HUD.md", "DECISIONS.md"].includes(doc.path))
        deny("DOC_PRIVATE_PATH", "Private orchestration is not a package document", doc.path);
      const content = bytes(full, doc.path), hash = digest(content); hashes.set(doc.id, hash);
      if (doc.role === "authoritative") {
        if ((mode === "approved" || manifest.approvalStatus === "approved") && !doc.sha256) deny("DOC_HASH_MISSING", "Authoritative hash is required", doc.path);
        if (doc.sha256 && doc.sha256 !== hash) throw new DocFailure("DOC_HASH_MISMATCH", "Authoritative bytes differ from the declared digest", doc.path, { expected: doc.sha256, calculated: hash });
      }
      for (const scope of doc.scope) if (![...manifest.scope.active, ...manifest.scope.inactive].includes(scope)) deny("DOC_SCOPE_INVALID", "Document scope is undeclared", doc.id);
      if (doc.status === "active") for (const label of doc.authority) {
        if (owners.has(label)) deny("DOC_AUTHORITY_CONFLICT", "Authority label has multiple active owners", label); owners.set(label, doc.id);
      }
      const blocks = doc.role === "authoritative" ? sourceBlocks(content.toString("utf8"), doc.items, doc.path) : new Map<string, string>();
      for (const item of doc.items) {
        if (!doc.authority.includes(item.authority)) deny("DOC_AUTHORITY_CONFLICT", "Source responsibility is not owned by its document", `${doc.id}#${item.id}`);
        if (!doc.scope.includes(item.scope)) deny("DOC_SCOPE_INVALID", "Source scope is not declared by its document", `${doc.id}#${item.id}`);
        const active = doc.status === "active" && manifest.scope.active.includes(item.scope);
        if (active && item.kind === "decision" && item.decisionState === "proposed" && (mode === "approved" || manifest.approvalStatus === "approved")) deny("DOC_DECISION_INVALID", "Proposed active decision blocks approval", `${doc.id}#${item.id}`);
        index.set(`${doc.id}#${item.id}`, { document: doc, item, content: blocks.get(item.id)!, active });
      }
    }
    const graph = new Map<string, string[]>();
    for (const doc of docs.values()) {
      graph.set(doc.id, doc.dependsOn);
      for (const dependency of doc.dependsOn) {
        if (!docs.has(dependency)) deny("DOC_DEPENDENCY_INVALID", "Document dependency is unresolved", dependency);
        if (doc.status === "active" && docs.get(dependency)!.status !== "active") deny("DOC_DEPENDENCY_INVALID", "Active document depends on inactive authority", doc.id);
      }
    }
    acyclic(graph, "DOC_DEPENDENCY_CYCLE");
    const activeDocs = [...docs.values()].filter(d => d.status === "active").map(d => d.id);
    if (manifest.readingOrder.length !== activeDocs.length || activeDocs.some(id => !manifest.readingOrder.includes(id))) deny("DOC_READING_ORDER_INVALID", "Reading order must contain every active document exactly once");
    for (const id of manifest.readingOrder) for (const dependency of docs.get(id)?.dependsOn ?? [])
      if (manifest.readingOrder.indexOf(dependency) >= manifest.readingOrder.indexOf(id)) deny("DOC_READING_ORDER_INVALID", "Prerequisites must precede dependants", id);
    const linkedCriteria = new Set<string>(), supersession = new Map<string, string[]>();
    for (const [ref, source] of index) {
      if (source.item.kind === "requirement") for (const target of source.item.acceptanceCriteria!) {
        const criterion = index.get(target);
        if (!criterion || criterion.item.kind !== "acceptance-criterion") deny("DOC_TRACE_INVALID", "Requirement criterion is unresolved or has the wrong kind", target);
        if (source.active && (!criterion.active || criterion.item.scope !== source.item.scope)) deny("DOC_TRACE_INVALID", "Active requirement cites inactive or unrelated criterion", ref);
        if (source.active) linkedCriteria.add(target);
      }
      if (source.item.kind === "decision" && source.item.decisionState === "superseded") {
        const target = source.item.supersededBy!, successor = index.get(target);
        supersession.set(ref, [target]);
        if (!successor || successor.item.kind !== "decision") deny("DOC_DECISION_INVALID", "Supersession target is unresolved", ref);
      }
    }
    acyclic(supersession, "DOC_DECISION_CYCLE");
    for (const [ref, source] of index) {
      if (source.item.kind === "decision" && source.item.decisionState === "superseded" && index.get(source.item.supersededBy!)!.item.decisionState !== "accepted") deny("DOC_DECISION_INVALID", "Supersession target must be accepted", ref);
      if (source.active && source.item.kind === "acceptance-criterion" && !linkedCriteria.has(ref)) deny("DOC_TRACE_INVALID", "Active criterion has no requirement", ref);
    }
    const metadata = fingerprintMetadata(manifest);
    const base = { packagePath, metadata, schema: expectedSchema,
      authoritative: [...hashes].filter(([id]) => docs.get(id)!.role === "authoritative").sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0) };
    const authorityFingerprint = digest(canonical(base));
    const candidateFingerprint = digest(canonical({ ...base, entryGuide: digest(guideBytes),
      derived: [...hashes].filter(([id]) => docs.get(id)!.role === "derived").sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0) }));
    if (mode === "approved" || manifest.approvalStatus === "approved") {
      if (manifest.approvalStatus !== "approved") deny("DOC_PACKAGE_UNAPPROVED", "Package is not approved");
      if (!manifest.approvedAuthorityFingerprint) deny("DOC_APPROVAL_DIGEST_MISSING", "Approved authority fingerprint is required");
      if (manifest.approvedAuthorityFingerprint !== authorityFingerprint) throw new DocFailure("DOC_AUTHORITY_FINGERPRINT_MISMATCH", "Authority metadata or bytes changed after approval", undefined,
        { expected: manifest.approvedAuthorityFingerprint, calculated: authorityFingerprint });
    }
    const state: DocumentationState = manifest.approvalStatus === "approved" ? "APPROVED" : manifest.approvalStatus === "draft" ? "DRAFT" : "AWAITING_HUMAN_APPROVAL";
    const report: DocReport = { schemaVersion: 1, mode, status: mode === "approved" ? "APPROVED_VALID" : "DRAFT_VALID", planningAllowed: mode === "approved",
      documentationState: state, packageId: manifest.packageId, packageVersion: manifest.version, authorityFingerprint, candidateFingerprint,
      sourceIndex: [...index].map(([reference, s]) => ({ reference, kind: s.item.kind, path: s.document.path, scope: s.item.scope, active: s.active })), issues: [] };
    return { report, snapshot: { root, packagePath, manifestPath, manifestBytes, manifest, index, hashes, authorityFingerprint, candidateFingerprint } };
  } catch (error) {
    const issue = error instanceof DocFailure ? error.issue : error instanceof TophatConfigError ?
      { code: error.code, message: "Host configuration must be supplied and valid" } : { code: "DOC_INTERNAL_ERROR", message: "Documentation validation could not establish a safe result" };
    const state = manifest?.approvalStatus === "approved" ? "INVALIDATED" : manifest?.approvalStatus === "draft" ? "DRAFT" : manifest?.approvalStatus === "awaiting-human-approval" ? "AWAITING_HUMAN_APPROVAL" : null;
    return { report: { schemaVersion: 1, mode, status: "DENIED", planningAllowed: false, documentationState: state,
      ...(typeof manifest?.packageId === "string" ? { packageId: manifest.packageId } : {}), issues: [issue] } };
  }
}
export const validateDocPackage = (root: string, mode: DocMode = "approved"): DocReport => inspectDocPackage(root, mode).report;
export const isMain = (url: string): boolean => !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(url);
if (isMain(import.meta.url)) {
  let report: DocReport;
  try {
    const raw = process.argv[2] ?? readFileSync(0, "utf8");
    const request = object(strictJson(raw, "request"), "request"); keys(request, [], ["mode"], "request");
    const mode = request.mode ?? "approved"; if (mode !== "draft" && mode !== "approved") deny("DOC_INPUT_INVALID", "mode must be draft or approved");
    report = validateDocPackage(process.cwd(), mode);
  } catch (e) {
    report = { schemaVersion: 1, mode: "approved", status: "DENIED", planningAllowed: false, documentationState: null,
      issues: [e instanceof DocFailure ? e.issue : { code: "DOC_INTERNAL_ERROR", message: "Request could not be inspected" }] };
  }
  console.log(JSON.stringify(report)); process.exitCode = report.status === "DENIED" ? 1 : 0;
}

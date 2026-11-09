import { readFileSync } from "node:fs";
import { inspectDocPackage, deny, DocFailure, object, keys, text, list, strictJson, safePath, idPattern, hashPattern, refPattern, isMain, type DocIssue, type ItemKind } from "./validate-doc-package.ts";

export interface TaskAuthorityRequest {
  packageId: string; packageVersion: string; authorityFingerprint: string;
  developmentPhaseId: string; sprintChunkId: string; scopeIds: string[];
  references: { requirements: string[]; decisions: string[]; contracts: string[]; acceptanceCriteria: string[] };
  notApplicable: { decisions?: string; contracts?: string };
  extracts: Array<{ reference: string; content: string }>;
}
export interface TaskAuthorityReport { schemaVersion: 1; status: "AUTHORITY_VALID" | "DENIED"; issues: DocIssue[]; authorityFingerprint?: string }
function parseRequest(value: unknown): TaskAuthorityRequest {
  const v = object(value, "task");
  keys(v, ["packageId", "packageVersion", "authorityFingerprint", "developmentPhaseId", "sprintChunkId", "scopeIds", "references", "notApplicable", "extracts"], [], "task");
  for (const key of ["packageId", "developmentPhaseId", "sprintChunkId"]) text(v[key], key, idPattern);
  text(v.packageVersion, "packageVersion"); text(v.authorityFingerprint, "authorityFingerprint", hashPattern);
  list(v.scopeIds, "scopeIds", idPattern, true);
  const refs = object(v.references, "references"); keys(refs, ["requirements", "decisions", "contracts", "acceptanceCriteria"], [], "references");
  for (const key of Object.keys(refs)) list(refs[key], `references.${key}`, refPattern, ["requirements", "acceptanceCriteria"].includes(key));
  const na = object(v.notApplicable, "notApplicable"); keys(na, [], ["decisions", "contracts"], "notApplicable");
  for (const kind of ["decisions", "contracts"]) {
    if (!(refs[kind] as string[]).length) text(na[kind], `notApplicable.${kind}`);
    else if (na[kind] !== undefined) deny("TASK_AUTHORITY_INPUT_INVALID", "Applicability reason contradicts existing references", kind);
  }
  if (!Array.isArray(v.extracts)) deny("TASK_AUTHORITY_INPUT_INVALID", "extracts must be an array");
  for (const raw of v.extracts) {
    const extract = object(raw, "extract"); keys(extract, ["reference", "content"], [], "extract");
    text(extract.reference, "extract.reference", refPattern); text(extract.content, "extract.content");
  }
  return v as unknown as TaskAuthorityRequest;
}
export function activeAuthorityContext(root: string): Record<string, unknown> {
  const source = readFileSync(safePath(root, "Roadmap.md"), "utf8");
  return authorityContextFromSource(source);
}
export function authorityContextFromSource(source: string): Record<string, unknown> {
  const start = source.indexOf("[ACTIVE_SPRINT_CHUNK]");
  if (start < 0 || source.indexOf("[ACTIVE_SPRINT_CHUNK]", start + 1) >= 0) deny("TASK_CHUNK_INVALID", "Roadmap must have one active chunk marker");
  const section = source.slice(start).split(/\n#{1,6}\s/)[0];
  const blocks = [...section.matchAll(/```json[ \t]*\r?\n([\s\S]*?)\r?\n```/g)];
  if (blocks.length !== 1) deny("TASK_CHUNK_INVALID", "Active chunk requires one authorityContext JSON block");
  const wrapper = object(strictJson(blocks[0][1], "authorityContext"), "authorityContext"); keys(wrapper, ["authorityContext"], [], "chunk");
  const context = object(wrapper.authorityContext, "authorityContext");
  keys(context, ["packageId", "packageVersion", "authorityFingerprint", "developmentPhaseId", "sprintChunkId", "scopeIds"], [], "authorityContext");
  for (const key of ["packageId", "developmentPhaseId", "sprintChunkId"]) text(context[key], key, idPattern);
  text(context.packageVersion, "packageVersion"); text(context.authorityFingerprint, "authorityFingerprint", hashPattern);
  list(context.scopeIds, "scopeIds", idPattern, true);
  return context;
}
export function validateTaskAuthority(root: string, input: unknown, historicalChunk?: Record<string, unknown>): TaskAuthorityReport {
  try {
    const request = parseRequest(input), { report, snapshot } = inspectDocPackage(root);
    if (!snapshot || !report.planningAllowed) return { schemaVersion: 1, status: "DENIED", issues: report.issues };
    const m = snapshot.manifest;
    if (request.packageId !== m.packageId || request.packageVersion !== m.version || request.authorityFingerprint !== snapshot.authorityFingerprint)
      deny("TASK_AUTHORITY_STALE", "Task package provenance differs from current approved authority");
    const chunk = historicalChunk ?? activeAuthorityContext(snapshot.root);
    for (const key of ["packageId", "packageVersion", "authorityFingerprint", "developmentPhaseId", "sprintChunkId"] as const)
      if (chunk[key] !== request[key]) deny("TASK_CHUNK_INVALID", "Task provenance differs from the active chunk", key);
    if (request.scopeIds.some(scope => !(chunk.scopeIds as string[]).includes(scope) || !m.scope.active.includes(scope)))
      deny("TASK_SCOPE_INVALID", "Task scope is outside the approved active chunk");
    const kinds: Record<keyof TaskAuthorityRequest["references"], ItemKind> = {
      requirements: "requirement", decisions: "decision", contracts: "contract", acceptanceCriteria: "acceptance-criterion",
    };
    const all = Object.values(request.references).flat();
    if (new Set(all).size !== all.length) deny("TASK_REFERENCE_INVALID", "Authority reference repeats across kinds");
    for (const [kind, refs] of Object.entries(request.references)) for (const ref of refs) {
      const source = snapshot.index.get(ref);
      if (!source || source.item.kind !== kinds[kind as keyof typeof kinds] || !source.active || !request.scopeIds.includes(source.item.scope))
        deny("TASK_REFERENCE_INVALID", "Reference is unresolved, wrong-kind, inactive, or outside task scope", ref);
      if (source.item.kind === "decision" && source.item.decisionState !== "accepted") deny("TASK_REFERENCE_INVALID", "Only accepted decisions can govern a task", ref);
    }
    const linked = new Set<string>();
    for (const ref of request.references.requirements) {
      const criteria = snapshot.index.get(ref)!.item.acceptanceCriteria!;
      if (!criteria.some(ac => request.references.acceptanceCriteria.includes(ac))) deny("TASK_TRACE_INVALID", "Cited requirement lacks an applicable linked task criterion", ref);
      for (const ac of criteria) linked.add(ac);
    }
    for (const ref of request.references.acceptanceCriteria) if (!linked.has(ref)) deny("TASK_TRACE_INVALID", "Task criterion is not linked by a cited requirement", ref);
    const extracts = new Map<string, string>();
    for (const e of request.extracts) {
      if (extracts.has(e.reference) || !all.includes(e.reference)) deny("TASK_EXTRACT_INVALID", "Duplicate or undeclared extract", e.reference);
      extracts.set(e.reference, e.content.replace(/\r\n/g, "\n"));
    }
    for (const ref of all) if (extracts.get(ref) !== snapshot.index.get(ref)!.content) deny("TASK_EXTRACT_INVALID", "Extract must equal the indexed source block", ref);
    return { schemaVersion: 1, status: "AUTHORITY_VALID", issues: [], authorityFingerprint: snapshot.authorityFingerprint };
  } catch (error) {
    return { schemaVersion: 1, status: "DENIED", issues: [error instanceof DocFailure ? error.issue :
      { code: "TASK_AUTHORITY_INTERNAL_ERROR", message: "Task authority could not be established" }] };
  }
}
if (isMain(import.meta.url)) {
  let report: TaskAuthorityReport;
  try { report = validateTaskAuthority(process.cwd(), strictJson(process.argv[2] ?? readFileSync(0, "utf8"), "request")); }
  catch (e) { report = { schemaVersion: 1, status: "DENIED", issues: [e instanceof DocFailure ? e.issue : { code: "TASK_AUTHORITY_INPUT_INVALID", message: "Request cannot be read" }] }; }
  console.log(JSON.stringify(report)); process.exitCode = report.status === "DENIED" ? 1 : 0;
}

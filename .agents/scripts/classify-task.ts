import { readFileSync, existsSync } from "node:fs";
import { loadTophatConfig, validationCategories, type ValidationCategory } from "./load-tophat-config.ts";
import { selectTaskGuidance, type TaskGuidanceRequest } from "./select-task-guidance.ts";
import { validateTaskAuthority, type TaskAuthorityRequest } from "./validate-task-authority.ts";
import { strictJson, canonical, digest, safePath, isMain, DocFailure } from "./validate-doc-package.ts";

export class WorkflowError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}
export function fail(code: string, message: string): never { throw new WorkflowError(code, message); }
export function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("TASK_CLASSIFICATION_INVALID", `${label} must be an object`);
  return value as Record<string, unknown>;
}
export function fields(value: Record<string, unknown>, required: string[], optional: string[] = []): void {
  if (required.some(k => !Object.hasOwn(value, k)) || Object.keys(value).some(k => ![...required, ...optional].includes(k)))
    fail("TASK_CLASSIFICATION_INVALID", "Missing or unknown fields");
}
export function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) fail("TASK_CLASSIFICATION_INVALID", "Expected nonempty string");
  return value;
}
export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) fail("TASK_CLASSIFICATION_INVALID", "Expected array");
  return value;
}
export function strings(value: unknown, allowed?: readonly string[], nonempty = false): string[] {
  const a = array(value).map(text);
  if ((nonempty && !a.length) || new Set(a).size !== a.length || a.some(x => allowed && !allowed.includes(x)))
    fail("TASK_CLASSIFICATION_INVALID", "Empty, duplicate or unsupported entries");
  return a;
}
export function hash(value: unknown): string { const s = text(value); if (!/^[a-f0-9]{64}$/.test(s)) fail("QA_EVIDENCE_INVALID", "Invalid SHA-256"); return s; }
export function commitSha(value: unknown): string { const s = text(value); if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(s)) fail("QA_EVIDENCE_INVALID", "Invalid full commit SHA"); return s; }
export function instant(value: unknown): number {
  const s = text(value), n = Date.parse(s);
  if (!Number.isFinite(n) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s) || new Date(n).toISOString() !== s)
    fail("QA_EVIDENCE_INVALID", "Expected exact UTC timestamp");
  return n;
}
export const fingerprint = (value: unknown): string => digest(canonical(value));
export function inputJson(source: string): unknown {
  if (Buffer.byteLength(source) > 1024 * 1024) fail("TASK_CLASSIFICATION_INVALID", "JSON exceeds 1 MiB");
  return strictJson(source, "workflow request");
}
export function issue(error: unknown): { code: string; message: string } {
  if (error instanceof WorkflowError) return { code: error.code, message: error.message };
  if (error instanceof DocFailure) return error.issue;
  const e = error as { code?: string; message?: string };
  return { code: e?.code ?? "WORKFLOW_INTERNAL_ERROR", message: e?.message ?? "Cannot establish workflow evidence" };
}
export const workKinds = ["static-ui", "client-logic", "server-logic", "api", "database", "auth", "payments", "permissions", "filesystem", "electron-main", "electron-preload", "electron-ipc", "cross-layer", "internal"] as const;
export const userEffects = ["web-flow", "desktop-flow", "visual", "responsive", "accessibility", "human-design", "no-user-facing-change"] as const;
export const qaMethods = ["e2e-web", "e2e-desktop", "exploratory", "visual", "responsive", "accessibility", "human-design"] as const;
export type Verdict = "APPROVED" | "CHANGES_REQUIRED" | "BLOCKED";
export type Stage = "implementation" | "review-standard" | "review-critical" | "security" | "qa";
export interface AcceptanceCheck { id: string; sourceCriterion: string; text: string; qaApplicable: boolean; applicabilityReason?: string }
export interface TaskClassification {
  schemaVersion: 1; taskId: string; authority: TaskAuthorityRequest; guidance: TaskGuidanceRequest;
  workKinds: string[]; userEffects: string[]; noUserFacingReason: string | null;
  validationCategories: ValidationCategory[]; acceptanceChecks: AcceptanceCheck[]; declaredRouting?: Routing;
}
export interface Routing {
  devTier: "junior" | "mid" | "senior"; reviewTier: "standard" | "critical";
  securityRequired: boolean; qaRequired: boolean; qaMethods: string[]; requiredStages: Stage[];
}
export interface Classified extends Routing { status: "ROUTING_VALID"; issues: []; taskFingerprint: string; capabilities: readonly string[]; task: TaskClassification }

export function classifyTask(root: string, input: unknown): Classified {
  const v = record(input, "task");
  fields(v, ["schemaVersion", "taskId", "authority", "guidance", "workKinds", "userEffects", "noUserFacingReason", "validationCategories", "acceptanceChecks"], ["declaredRouting"]);
  if (v.schemaVersion !== 1 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(text(v.taskId))) fail("TASK_CLASSIFICATION_INVALID", "Unsupported version or task ID");
  const kinds = strings(v.workKinds, workKinds, true), effects = strings(v.userEffects, userEffects, true);
  const noUI = effects.includes("no-user-facing-change");
  if (noUI ? effects.length !== 1 || kinds.includes("static-ui") : v.noUserFacingReason !== null)
    fail("TASK_CLASSIFICATION_INVALID", "Contradictory user effects");
  if (noUI) text(v.noUserFacingReason);
  const config = loadTophatConfig(root);
  const authority = validateTaskAuthority(root, v.authority);
  if (authority.status !== "AUTHORITY_VALID") fail(authority.issues[0]?.code ?? "TASK_CLASSIFICATION_INVALID", authority.issues.map(x => x.message).join("; "));
  const guidance = record(v.guidance, "guidance"); fields(guidance, ["requestedSkills", "taskTopics", "frameworkInstructions"]);
  for (const key of Object.keys(guidance)) strings(guidance[key]);
  selectTaskGuidance(config, guidance as unknown as TaskGuidanceRequest);
  const topics = guidance.taskTopics as string[];
  if (topics.some(t => ["server-component", "server-action", "route-handler", "backend"].includes(t)) && !kinds.some(k => ["server-logic", "api", "cross-layer"].includes(k)))
    fail("ROUTING_METADATA_CONFLICT", "Server guidance requires declared server work");
  for (const [topic, kind] of [["desktop-main", "electron-main"], ["desktop-preload", "electron-preload"], ["electron-ipc", "electron-ipc"]])
    if (topics.includes(topic) && !kinds.includes(kind)) fail("ROUTING_METADATA_CONFLICT", `${topic} requires ${kind}`);
  if (kinds.some(k => k.startsWith("electron-")) && !config.capabilities.includes("electron")) fail("ROUTING_METADATA_CONFLICT", "Electron work requires Electron workspace");
  if (kinds.includes("client-logic") && !config.capabilities.some(c => ["web-ui", "renderer-ui"].includes(c))) fail("ROUTING_METADATA_CONFLICT", "Client work requires UI capability");
  const categories = strings(v.validationCategories, validationCategories) as ValidationCategory[];
  const pkg = record(inputJson(readFileSync(safePath(root, "package.json"), "utf8")), "package.json");
  const scripts = record(pkg.scripts, "scripts");
  for (const category of [...new Set([...config.validation.commitGate, ...categories])]) {
    const name = config.validation.scripts[category];
    if (!name || typeof scripts[name] !== "string" || !scripts[name]) fail("SCRIPT_MISSING", `Missing declared ${category} script`);
  }
  const checks = array(v.acceptanceChecks) as unknown[];
  const authorityInput = v.authority as TaskAuthorityRequest;
  const ids = new Set(authorityInput.references.acceptanceCriteria);
  for (const raw of checks) {
    const c = record(raw, "acceptance check"); fields(c, ["id", "sourceCriterion", "text", "qaApplicable"], ["applicabilityReason"]);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(text(c.id)) || ids.has(c.id as string) || !authorityInput.references.acceptanceCriteria.includes(text(c.sourceCriterion)) || typeof c.qaApplicable !== "boolean")
      fail("TASK_CLASSIFICATION_INVALID", "Duplicate check or unresolved source criterion");
    ids.add(c.id as string); text(c.text);
    if (c.qaApplicable) { if (c.applicabilityReason !== undefined || noUI) fail("TASK_CLASSIFICATION_INVALID", "QA applicability contradiction"); }
    else text(c.applicabilityReason);
  }
  const senior = kinds.some(k => !["static-ui", "client-logic"].includes(k));
  const devTier = senior ? "senior" : kinds.includes("client-logic") ? "mid" : "junior";
  const selected = new Set<string>();
  if (effects.includes("web-flow")) { selected.add("e2e-web"); selected.add("exploratory"); }
  if (effects.includes("desktop-flow")) { selected.add("e2e-desktop"); selected.add("exploratory"); }
  if (kinds.includes("static-ui") || effects.some(e => ["visual", "responsive"].includes(e))) { selected.add("visual"); selected.add("responsive"); }
  for (const m of ["accessibility", "human-design"]) if (effects.includes(m)) selected.add(m);
  if ((selected.has("e2e-web") && !config.capabilities.includes("web-qa")) || (selected.has("e2e-desktop") && !config.capabilities.includes("desktop-qa")) ||
      (["visual", "responsive", "accessibility", "human-design"].some(m => selected.has(m)) && !config.capabilities.some(c => ["web-ui", "renderer-ui"].includes(c))))
    fail("QA_METHOD_INCOMPATIBLE", "QA methods require unavailable workspace capabilities");
  if (topics.includes("browser-flow") !== effects.includes("web-flow") || topics.includes("desktop-flow") !== effects.includes("desktop-flow"))
    fail("ROUTING_METADATA_CONFLICT", "Flow guidance and effects differ");
  const methods = qaMethods.filter(m => selected.has(m));
  const route: Routing = { devTier, reviewTier: devTier === "junior" ? "standard" : "critical", securityRequired: devTier !== "junior",
    qaRequired: methods.length > 0, qaMethods: [...methods], requiredStages: ["implementation", devTier === "junior" ? "review-standard" : "review-critical", ...(devTier === "junior" ? [] : ["security" as const]), ...(methods.length ? ["qa" as const] : [])] };
  if (v.declaredRouting !== undefined && canonical(v.declaredRouting) !== canonical(route)) fail("ROUTING_METADATA_CONFLICT", "Displayed routing differs from derived routing");
  if (existsSync(safePath(root, "Context.md")) && /Review Topology[^\r\n]*Standard Review Only/i.test(readFileSync(safePath(root, "Context.md"), "utf8")))
    fail("LEGACY_ROUTING_POLICY_CONFLICT", "Human must amend legacy routing bypass");
  const task = { ...v, authority: { ...authorityInput, extracts: authorityInput.extracts.map(e => ({ ...e, content: e.content.replace(/\r\n/g, "\n") })) },
    workKinds: workKinds.filter(k => kinds.includes(k)), userEffects: userEffects.filter(e => effects.includes(e)) } as unknown as TaskClassification;
  const { declaredRouting: _projection, ...authorityTask } = task;
  return { ...route, status: "ROUTING_VALID", issues: [], taskFingerprint: fingerprint({ task: authorityTask, config }), capabilities: config.capabilities, task };
}
export function nextStage(route: Routing, stage: Stage, verdict: Verdict): Stage | "publication" | "remediation" | "human-decision" {
  if (!route.requiredStages.includes(stage) || !["APPROVED", "CHANGES_REQUIRED", "BLOCKED"].includes(verdict)) fail("ROUTE_STAGE_INVALID", "Wrong stage or verdict");
  if (verdict === "BLOCKED") return "human-decision";
  if (verdict === "CHANGES_REQUIRED") return "remediation";
  return route.requiredStages[route.requiredStages.indexOf(stage) + 1] ?? "publication";
}
export interface StageRecord { stage: Stage; sequence: number; taskFingerprint: string; inspectedCommit: string; role: string; sessionId: string; verdict: Verdict; findings: string[] }
export function validateStages(value: unknown, route: Classified, commit: string): StageRecord[] {
  const entries = array(value), expected = route.requiredStages.filter(s => s !== "qa"), latest = new Map<string, StageRecord>();
  if (!entries.length || entries.length > 256) fail("ROUTE_STAGE_INVALID", "Missing or excessive stage records");
  const roleFor: Record<string, string> = { implementation: `developer-${route.devTier}`, "review-standard": "review-standard", "review-critical": "review-critical", security: "security" };
  entries.forEach((raw, index) => {
    const r = record(raw, "stage"); fields(r, ["stage", "sequence", "taskFingerprint", "inspectedCommit", "role", "sessionId", "verdict", "findings"]);
    if (r.sequence !== index + 1 || !expected.includes(r.stage as Stage) || !["APPROVED", "CHANGES_REQUIRED", "BLOCKED"].includes(r.verdict as string)) fail("ROUTE_STAGE_INVALID", "Invalid stage history");
    hash(r.taskFingerprint); commitSha(r.inspectedCommit); text(r.sessionId); strings(r.findings);
    if (r.role !== roleFor[r.stage as string]) fail("ROUTE_STAGE_INVALID", "Wrong role for stage");
    latest.set(r.stage as string, r as unknown as StageRecord);
  });
  let sequence = 0;
  const result = expected.map(stage => {
    const r = latest.get(stage);
    if (!r || r.taskFingerprint !== route.taskFingerprint || r.inspectedCommit !== commit || r.verdict !== "APPROVED" || r.sequence <= sequence || r.findings.length)
      fail("ROUTE_STAGE_INVALID", "Missing, failed, stale or unordered stage approval");
    sequence = r.sequence; return r;
  });
  const developer = result[0];
  if (result.slice(1).some(r => r.sessionId === developer.sessionId)) fail("ROLE_BOUNDARY_VIOLATION", "Developer cannot approve own implementation");
  for (const raw of entries as StageRecord[]) if (raw.verdict === "CHANGES_REQUIRED" && raw.sequence < developer.sequence && raw.inspectedCommit === developer.inspectedCommit)
    fail("ROUTE_STAGE_INVALID", "Code remediation requires a new developer commit");
  return result;
}
if (isMain(import.meta.url)) {
  try { console.log(JSON.stringify(classifyTask(process.cwd(), inputJson(readFileSync(0, "utf8"))))); }
  catch (e) { console.log(JSON.stringify({ status: "DENIED", issues: [issue(e)] })); process.exitCode = 1; }
}

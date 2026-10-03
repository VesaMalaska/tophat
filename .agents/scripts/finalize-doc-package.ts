import { readFileSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { inspectDocPackage, DocFailure, deny, strictJson, object, keys, text, list, safePath, digest, hashPattern, idPattern, isMain,
  type DocReport, type PackageSnapshot } from "./validate-doc-package.ts";

export interface FinalizeRequest { candidateFingerprint: string; reviewReceipt: string; approvalReceipt: string }
export interface DefinitionReview {
  packageId: string; packageVersion: string; candidateFingerprint: string;
  reviewer: string; role: "independent-review"; reviewedAt: string; evidenceLocator: string;
  priorApprovedVersion: string | null; verdict: "READY_FOR_HUMAN_APPROVAL" | "CHANGES_REQUIRED" | "BLOCKED";
  findings: Array<{ id: string; material: boolean; resolved: boolean; disposition: string }>;
  uncertainties: Array<{ id: string; classification: "confirmed" | "proposed" | "assumed" | "unresolved" | "out-of-scope";
    scope: string; material: boolean; resolved: boolean; disposition: string }>;
}
export interface DefinitionApproval {
  packageId: string; packageVersion: string; candidateFingerprint: string; reviewSha256: string;
  signal: "APPROVED"; human: string; approvedAt: string; evidenceLocator: string;
}
export function receiptBytes(snapshot: PackageSnapshot, input: string): Buffer {
  const prefix = `.agents/project-definition/${snapshot.manifest.packageId}/`;
  if (!input.startsWith(prefix)) deny("DOC_APPROVAL_PATH_INVALID", "Receipt must be in this package's private definition evidence");
  return readFileSync(safePath(snapshot.root, input));
}
function date(value: unknown, label: string): number {
  const s = text(value, label, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/), time = Date.parse(s);
  if (!Number.isFinite(time) || new Date(time).toISOString() !== s) deny("DOC_APPROVAL_INVALID", `${label} must be an exact ISO UTC timestamp`);
  return time;
}
function matches(snapshot: PackageSnapshot, value: Record<string, unknown>): void {
  if (value.packageId !== snapshot.manifest.packageId || value.packageVersion !== snapshot.manifest.version || value.candidateFingerprint !== snapshot.candidateFingerprint)
    deny("DOC_APPROVAL_STALE", "Definition evidence differs from the current candidate");
}
export function reviewEvidence(snapshot: PackageSnapshot, input: string): { review: DefinitionReview; bytes: Buffer } {
  const bytes = receiptBytes(snapshot, input), r = object(strictJson(bytes.toString("utf8"), "review receipt"), "review");
  keys(r, ["packageId", "packageVersion", "candidateFingerprint", "reviewer", "role", "reviewedAt", "evidenceLocator", "priorApprovedVersion", "verdict", "findings", "uncertainties"], [], "review");
  text(r.packageId, "packageId", idPattern); text(r.packageVersion, "packageVersion"); text(r.candidateFingerprint, "candidateFingerprint", hashPattern);
  text(r.reviewer, "reviewer"); text(r.evidenceLocator, "evidenceLocator"); date(r.reviewedAt, "reviewedAt");
  if (r.role !== "independent-review") deny("DOC_REVIEW_INVALID", "Separate independent review is required");
  if (r.verdict !== "READY_FOR_HUMAN_APPROVAL") deny("DOC_REVIEW_REQUIRED", "Review is not ready for human approval");
  if (r.priorApprovedVersion !== null) {
    text(r.priorApprovedVersion, "priorApprovedVersion");
    if (r.priorApprovedVersion === r.packageVersion) deny("DOC_VERSION_UNCHANGED", "Reapproval requires a new package version");
  }
  matches(snapshot, r);
  for (const kind of ["findings", "uncertainties"]) {
    if (!Array.isArray(r[kind])) deny("DOC_REVIEW_INVALID", `${kind} must be an array`);
    const ids: string[] = [];
    for (const raw of r[kind] as unknown[]) {
      const finding = object(raw, kind);
      keys(finding, ["id", "material", "resolved", "disposition", ...(kind === "uncertainties" ? ["classification", "scope"] : [])], [], kind);
      const id = text(finding.id, `${kind}.id`, idPattern); if (ids.includes(id)) deny("DOC_REVIEW_INVALID", "Review entry IDs repeat"); ids.push(id);
      if (typeof finding.material !== "boolean" || typeof finding.resolved !== "boolean") deny("DOC_REVIEW_INVALID", "Review entry flags must be boolean");
      text(finding.disposition, "disposition");
      if (finding.material && !finding.resolved) deny("DOC_UNRESOLVED_MATERIAL_QUESTION", "Material findings and questions must be resolved", id);
      if (kind === "uncertainties") {
        if (!["confirmed", "proposed", "assumed", "unresolved", "out-of-scope"].includes(finding.classification as string)) deny("DOC_REVIEW_INVALID", "Uncertainty classification is invalid");
        const scope = text(finding.scope, "scope", idPattern);
        if (![...snapshot.manifest.scope.active, ...snapshot.manifest.scope.inactive].includes(scope)) deny("DOC_REVIEW_INVALID", "Uncertainty scope is undeclared");
      }
    }
  }
  return { review: r as unknown as DefinitionReview, bytes };
}
interface FinalizerIO {
  write: typeof writeFileSync; rename: typeof renameSync; remove: typeof unlinkSync;
}
const nativeIO: FinalizerIO = { write: writeFileSync, rename: renameSync, remove: unlinkSync };
export function finalizeDocPackage(root: string, input: unknown, io: FinalizerIO = nativeIO): DocReport & { published?: boolean } {
  let temp: string | undefined, published = false;
  try {
    const request = object(input, "finalize request"); keys(request, ["candidateFingerprint", "reviewReceipt", "approvalReceipt"], [], "request");
    text(request.candidateFingerprint, "candidateFingerprint", hashPattern); text(request.reviewReceipt, "reviewReceipt"); text(request.approvalReceipt, "approvalReceipt");
    const initial = inspectDocPackage(root, "draft");
    if (!initial.snapshot || initial.report.status === "DENIED") return initial.report;
    const snapshot = initial.snapshot;
    if (snapshot.manifest.approvalStatus !== "awaiting-human-approval") deny("DOC_PACKAGE_UNAPPROVED", "Finalization requires the reviewed awaiting-human-approval candidate");
    if (request.candidateFingerprint !== snapshot.candidateFingerprint) deny("DOC_APPROVAL_STALE", "Requested candidate changed");
    const { review, bytes: reviewBytes } = reviewEvidence(snapshot, request.reviewReceipt as string);
    const approvalBytes = receiptBytes(snapshot, request.approvalReceipt as string);
    const approval = object(strictJson(approvalBytes.toString("utf8"), "approval receipt"), "approval");
    keys(approval, ["packageId", "packageVersion", "candidateFingerprint", "reviewSha256", "signal", "human", "approvedAt", "evidenceLocator"], [], "approval");
    matches(snapshot, approval); text(approval.human, "human"); text(approval.evidenceLocator, "evidenceLocator"); text(approval.reviewSha256, "reviewSha256", hashPattern);
    if (approval.signal !== "APPROVED" || approval.reviewSha256 !== digest(reviewBytes)) deny("DOC_APPROVAL_INVALID", "Explicit approval must bind to the exact review receipt");
    if (date(approval.approvedAt, "approvedAt") <= date(review.reviewedAt, "reviewedAt")) deny("DOC_APPROVAL_INVALID", "Human approval must follow independent review");
    const proposed = structuredClone(snapshot.manifest); proposed.approvalStatus = "approved";
    for (const doc of proposed.documents) if (doc.role === "authoritative") doc.sha256 = snapshot.hashes.get(doc.id)!;
    proposed.approvedAuthorityFingerprint = snapshot.authorityFingerprint;
    const proposedBytes = Buffer.from(JSON.stringify(proposed, null, 2) + "\n");
    const checked = inspectDocPackage(root, "approved", proposedBytes);
    if (!checked.report.planningAllowed) return checked.report;
    temp = resolve(dirname(snapshot.manifestPath), `.manifest-${randomUUID()}.tmp`);
    io.write(temp, proposedBytes, { flag: "wx" });
    const fresh = inspectDocPackage(root, "draft");
    if (!fresh.snapshot || fresh.snapshot.candidateFingerprint !== snapshot.candidateFingerprint || !fresh.snapshot.manifestBytes.equals(snapshot.manifestBytes) ||
      !receiptBytes(snapshot, request.reviewReceipt as string).equals(reviewBytes) || !receiptBytes(snapshot, request.approvalReceipt as string).equals(approvalBytes))
      deny("DOC_APPROVAL_STALE", "Candidate or evidence changed before publication");
    io.rename(temp, snapshot.manifestPath); temp = undefined; published = true;
    return { ...inspectDocPackage(root).report, published };
  } catch (error) {
    return { schemaVersion: 1, mode: "approved", status: "DENIED", planningAllowed: false, documentationState: null, published,
      issues: [error instanceof DocFailure ? error.issue : { code: "DOC_FINALIZATION_FAILED", message: "Finalization failed; inspect current manifest before retry" }] };
  } finally {
    if (temp) { try { io.remove(temp); } catch { /* Only our own temporary artifact; no destructive recovery. */ } }
  }
}
if (isMain(import.meta.url)) {
  let report: DocReport;
  try { report = finalizeDocPackage(process.cwd(), strictJson(process.argv[2] ?? readFileSync(0, "utf8"), "request")); }
  catch (e) { report = { schemaVersion: 1, mode: "approved", status: "DENIED", planningAllowed: false, documentationState: null,
    issues: [e instanceof DocFailure ? e.issue : { code: "DOC_FINALIZATION_FAILED", message: "Finalization request cannot be read" }] }; }
  console.log(JSON.stringify(report)); process.exitCode = report.planningAllowed ? 0 : 1;
}

import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectDocPackage, digest, type DocManifest } from "../../../scripts/validate-doc-package.ts";
import { finalizeDocPackage } from "../../../scripts/finalize-doc-package.ts";

const vault = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
export function fixture(): { root: string; close: () => void } {
  const root = mkdtempSync(join(tmpdir(), "tophat-docs-"));
  mkdirSync(join(root, ".agents")); mkdirSync(join(root, "docs"));
  cpSync(join(vault, ".agents/templates/documentation-package"), join(root, "docs/project"), { recursive: true });
  writeFileSync(join(root, ".agents/tophat.config.json"), JSON.stringify({
    schemaVersion: 1, workspace: { kind: "backend", framework: "none" },
    documentation: { package: "docs/project", manifest: "manifest.json", derivedTargets: ["README.md"] },
    validation: { scripts: { unit: "test:unit" }, commitGate: ["unit"], developmentPhaseGate: [], projectCompletionGate: [] }, routingMatrix: {},
  }));
  writeFileSync(join(root, "README.md"), "# Sample service\n\nRead docs/project/README.md for product documentation.\n");
  return { root, close: () => rmSync(root, { recursive: true, force: true }) };
}
export const manifest = (root: string): DocManifest => JSON.parse(readFileSync(join(root, "docs/project/manifest.json"), "utf8"));
export const saveManifest = (root: string, m: DocManifest): void => writeFileSync(join(root, "docs/project/manifest.json"), JSON.stringify(m, null, 2) + "\n");
export function receipts(root: string, priorApprovedVersion: string | null = null) {
  const m = manifest(root); m.approvalStatus = "awaiting-human-approval"; delete m.approvedAuthorityFingerprint;
  for (const d of m.documents) delete d.sha256;
  saveManifest(root, m);
  const candidate = inspectDocPackage(root, "draft");
  if (!candidate.snapshot) throw new Error(JSON.stringify(candidate.report));
  const s = candidate.snapshot, prefix = `.agents/project-definition/${m.packageId}`;
  mkdirSync(join(root, prefix), { recursive: true });
  const review = { packageId: m.packageId, packageVersion: m.version, candidateFingerprint: s.candidateFingerprint,
    reviewer: "Independent fixture reviewer", role: "independent-review", reviewedAt: "2026-10-03T10:00:00.000Z", evidenceLocator: "fixture-transcript:review",
    priorApprovedVersion, verdict: "READY_FOR_HUMAN_APPROVAL", findings: [], uncertainties: [] };
  const reviewBytes = JSON.stringify(review, null, 2) + "\n", reviewReceipt = `${prefix}/review.json`, approvalReceipt = `${prefix}/approval.json`;
  writeFileSync(join(root, reviewReceipt), reviewBytes);
  const approval = { packageId: m.packageId, packageVersion: m.version, candidateFingerprint: s.candidateFingerprint, reviewSha256: digest(reviewBytes),
    signal: "APPROVED", human: "Fixture human", approvedAt: "2026-10-03T10:00:01.000Z", evidenceLocator: "fixture-transcript:approval" };
  writeFileSync(join(root, approvalReceipt), JSON.stringify(approval, null, 2) + "\n");
  return { request: { candidateFingerprint: s.candidateFingerprint, reviewReceipt, approvalReceipt }, review, approval };
}
export function approve(root: string): void {
  const result = finalizeDocPackage(root, receipts(root).request);
  if (!result.planningAllowed) throw new Error(JSON.stringify(result));
}
export function task(root: string) {
  const s = inspectDocPackage(root).snapshot!;
  const context = { packageId: s.manifest.packageId, packageVersion: s.manifest.version, authorityFingerprint: s.authorityFingerprint,
    developmentPhaseId: "phase-1", sprintChunkId: "chunk-1", scopeIds: ["core"] };
  writeFileSync(join(root, "Roadmap.md"), `# Private roadmap\n\n### [ACTIVE_SPRINT_CHUNK]\n\n\`\`\`json\n${JSON.stringify({ authorityContext: context }, null, 2)}\n\`\`\`\n\n### [UPCOMING_CHUNKS]\n`);
  const references = { requirements: ["product#REQ-001"], decisions: ["decisions#DEC-001"], contracts: ["contracts#CON-001"], acceptanceCriteria: ["product#AC-001"] };
  return { ...context, references, notApplicable: {}, extracts: Object.values(references).flat().map(reference => ({ reference, content: s.index.get(reference)!.content })) };
}

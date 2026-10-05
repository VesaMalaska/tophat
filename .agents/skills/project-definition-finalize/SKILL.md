---
name: project-definition-finalize
description: "Use for explicit /project-definition-finalize requests. Finalize only a reviewed documentation candidate explicitly approved by the human."
---

## Invocation and required reads

Use the exact human invocation of `/project-definition-finalize` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context if present and the current entry's mandatory resources. Select model advice only from `routingMatrix["/project-definition-finalize"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/project-definition.md`; use only the invoked drafting, independent review or finalization responsibility. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Read `.agents/rules/project-definition.md`. Run draft package validation and inspect the matching independent `review.json`, full question inventory, target version and candidateFingerprint. Halt on structural failure, stale/missing/blocked review or unresolved material findings.
2. Present the exact candidate, authority boundary, review result and target version. STOP for the human's explicit APPROVED addressed to this package candidate. Approval of this workflow plan, task proposal, slice brief, or unrelated earlier package does not authorize finalization.
3. Only after that response, the authorized orchestrator saves `.agents/project-definition/<packageId>/approval.json` containing packageId, packageVersion, candidateFingerprint, SHA-256 of the exact saved review receipt (`reviewSha256`), `signal: APPROVED`, human identity, exact UTC ISO `approvedAt` after reviewedAt, and evidenceLocator. Preserve genuine response/review evidence and prior approved evidence; do not fabricate consent from receipt fields.
4. Invoke the finalizer from the host root, with this structured request on stdin (replace example values with the actual candidate):

   ```json
   {
     "candidateFingerprint": "<64-character candidate SHA-256>",
     "reviewReceipt": ".agents/project-definition/<packageId>/review.json",
     "approvalReceipt": ".agents/project-definition/<packageId>/approval.json"
   }
   ```

   Command: `node .agents/scripts/finalize-doc-package.ts`. It validates receipts/candidate, calculates authoritative hashes and authority fingerprint, validates the proposed approved result and atomically replaces only the manifest. No product text, Git, Linear, or roadmap mutation. A DENIED/nonzero result stops the workflow; do not manually repair approved hashes. If `published: true` accompanies a denial, inspect current authority for a concurrent change rather than roll back unrelated work.
5. Run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'` again. Only APPROVED_VALID authorizes the next planning workflow. Update HUD through a separate authorized orchestrator step. No automatic initialization follows.
6. Output package identity/version, both fingerprints, recorded approval evidence and validation. Recommend `/workspace-init` with its configured model. For existing projects recommend `/workspace-attach` discovery and assessment separately; document approval does not authorize attachment or initialization side effects.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

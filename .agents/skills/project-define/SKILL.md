---
name: project-define
description: "Use for explicit /project-define requests. Prepare a bounded draft product documentation package from incomplete human input."
---

## Invocation and required reads

Use the exact human invocation of `/project-define` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context if present and the current entry's mandatory resources. Select model advice only from `routingMatrix["/project-define"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/project-definition.md`; use only the invoked drafting, independent review or finalization responsibility. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Read `.agents/rules/project-definition.md`. Apply the separate drafting responsibility, not the ordinary Architect's Linear-only write role. Confirm the human invoked this workflow and the exact package path. Load the existing host configuration; if missing/unconfigured, output a setup proposal and halt before writes.
2. Read the selected existing package and human-provided notes/client material. If the package already passes `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'`, this optional stage may be skipped. Never overwrite existing authority without an explicit amendment boundary.
3. Organize confirmed information, proposals, assumptions, unresolved questions and exclusions. Give each material question a stable ID, scope, owner and explicit disposition. Ask conversational product questions; explain that review and human approval will establish authority. Do not make users design manifests or know internal file names.
4. Prepare the public package using `.agents/templates/documentation-package/` and the canonical v1 schema. Choose only the documents/responsibilities needed by this project; combine compatible roles where appropriate. Set exact target document/package versions, authority labels, stable anchors, scope, dependencies and requirement/criterion relationships. No TopHat models, Linear lifecycle or private orchestration text in public documents.
5. On amendment, preserve the previous approved version/manifest/approval evidence privately before preparing the new draft. Clear generated digests, declare a different target version and record `priorApprovedVersion` for review. Never recalculate approved hashes to bypass reapproval.
6. Save the question inventory and input classifications under `.agents/project-definition/<packageId>/`. Run `node .agents/scripts/validate-doc-package.ts '{"mode":"draft"}'`. A nonzero DENIED result halts; DRAFT_VALID remains unauthorized for planning. Update only the declared definition evidence/package; do not seed private roadmap/task state.
7. Output the draft, question inventory, validation result and bounded changed paths. Stop at DRAFT; recommend `/project-definition-review` using its actual routingMatrix model. Do not finalize, create tasks or execute Git operations.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

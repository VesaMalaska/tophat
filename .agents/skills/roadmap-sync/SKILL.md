---
name: roadmap-sync
description: "Use for explicit /roadmap-sync requests. Propose private chunk advancement from completed work and current approved authority."
---

## Invocation and required reads

Use the exact human invocation of `/roadmap-sync` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/roadmap-sync"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-architect.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Invoke `@agent-architect`. Run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'` before private planning advancement; require APPROVED_VALID and planningAllowed. Halt on any denial or mismatch with current roadmap authorityFingerprint.
2. Read Context, Roadmap and completed task/Linear evidence. Verify the current active chunk's deliverables against its source references. Code realization and private ADRs do not redefine product authority.
3. Output the proposed move to REALIZED_CHUNKS and the next ACTIVE_SPRINT_CHUNK with stable Development Phase/Sprint Chunk IDs, declared scopeIds and current fenced JSON authorityContext. Do not change approved product files or generate future tasks.
4. Require explicit human direction before mutation. A separate authorized orchestrator revalidates unchanged authority and applies only the named Roadmap/Strategy/Context/HUD changes. The Architect remains a proposal author; PM is not granted execution authority.
5. Ordinary Sprint Chunk advancement does not synchronize documents. At a Development Phase boundary, halt advancement until `/sync-derived-docs` has a current validated DOCUMENTATION_ACCEPTED receipt and explicit human acceptance. An immediate-task receipt cannot accept the phase. Only the separate authorized orchestrator may mark the phase completed; a HUD/Linear label alone is insufficient. After all phases, `/verify-project-docs` and final human acceptance are still required. Accepted receipts are commit-bound history, not current readiness after later changes. No implicit Git operations.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

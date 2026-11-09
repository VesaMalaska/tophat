---
name: resolve-conflict
description: "Use for explicit /resolve-conflict requests. Reconcile only an already identified, human-authorized merge conflict for an exact task candidate."
---

## Invocation and required reads

Use the exact human invocation of `/resolve-conflict` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Exactly one explicit task locator, preserved verbatim from the human invocation; missing/extra locators halt. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/resolve-conflict"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-junior-dev.md`, `.agents/rules/agent-mid-dev.md`, `.agents/rules/agent-senior-dev.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Read `.agents/docs/git-safety.md`, exact task/feature branch, current HEAD, MERGE_HEAD, all unmerged entries and already staged incoming merge paths. `/resolve-conflict <task-id>` is scoped human authorization for this recorded merge, not permission to initiate a merge or recover history. Preserve the approved complete snapshot and consent locator externally.
2. The separate execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` operation resolve-conflict with that exact conflict authorization. Require GIT_PREFLIGHT_READY. Missing/extra operation markers, unrelated changes, changed parents or ambiguous reconciliation halt. No wildcard checkout, fetch/merge initiation, rebase/cherry-pick recovery, abort or destructive rollback.
3. The assigned developer resolves only the nominated conflict files while preserving both approved contracts. No semantic guess where the correct resolution is ambiguous. Incoming nonconflict staged paths must remain unchanged.
4. Run project-declared applicable checks through run-validation.ts; preserve failure evidence. Preflight stage with the original conflict snapshot and complete intended merge delta; stage only the resolved literal conflict paths. Reinspect index, require no unmerged entries and run preflight commit with the same authorization and complete approved bytes. Inspect commit outcome and verify both parents, complete delta and cleared merge state.
5. Return the new commit for fresh derived standard/critical review, security when required and independent QA when required. No automatic push before publication prerequisites. Separately authorized push/PR uses the existing evidence gates and shared preflight. New candidate invalidates prior exact-HEAD approvals; no automatic state commit after QA.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

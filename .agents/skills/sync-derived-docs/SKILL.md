---
name: sync-derived-docs
description: "Use for explicit /sync-derived-docs requests. Evaluate and synchronize one Development Phase's derived documents, or one explicitly classified immediate task exception."
---

## Invocation and required reads

Use the exact human invocation of `/sync-derived-docs` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/sync-derived-docs"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-technical-writer.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. The orchestrator reads `.agents/docs/derived-documentation.md`. Identify mode, stable phase/task membership, current approved authority, expected branch/base and integrated baseline. Validate complete task acceptance, original classification/chunk provenance, commit ancestry and applicable review/security/QA/validation. Do not infer evidence from Linear/HUD labels. Run the declared phase gate, or the immediate task gate/extras, using the bounded shared runner outside the writer.
2. Assess every relevant derived target and changed implementation. Record an explicit change plan or `NO_DOCUMENTATION_CHANGE_REQUIRED` with coverage/rationale. Conflicting realization/authority returns `DOCUMENTATION_AUTHORITY_CONFLICT`; stop for human resolution. Empty targets can justify no-change, but cannot hide missing necessary guidance.
3. For changes, draft complete proposed content as read-only proposal output; the orchestrator preserves the external draft and calculates the exact new byte digests. Show that concrete content, paths/operations/prior/new digests and sources, and obtain explicit human APPROVED for the plan. Capture via `inspect-derived-doc-session.ts` outside the writer. Invoke `@agent-technical-writer` with the exact approved content and bounded context. Revisions need a new approved plan. Always postcheck, even after failure/abort. On violation, preserve actual state/evidence; do not reset, delete, stash, roll back or auto-repair.
4. The separately authorized orchestrator finalizes the candidate using the human-declared branch/base policy and explicit Git operations with inspected outcomes. No writer/reviewer Git commands. Shared Git safety is defined in `.agents/docs/git-safety.md`. The candidate's complete baseline diff must contain only the authorized documentation operations; intended tracked state updates cannot be smuggled into documentation-only publication.
5. Run final applicable gate plus documentation when mapped, and claim verification/compatible QA when necessary. Missing tooling is BLOCKED; never install it here. Invoke `/review-derived-docs`, externally capturing/checking the read-only review session. Persist the candidate, independent review and attempt index in separate external private custody; the report never hashes itself.
6. Invoke `validate-derived-docs.ts` operation readiness with the closed receipt/index. Require DOCUMENTATION_READY. A documentation-only PR uses `/publish-pr` explicit document mode; a combined task PR still requires fresh Slice 6 exact-HEAD route/QA. Publication never authorizes merge.
7. Obtain explicit human acceptance of the exact candidate and review, then invoke operation accept. Phase mode may yield DOCUMENTATION_ACCEPTED; immediate mode yields only IMMEDIATE_DOCUMENTATION_ACCEPTED and never accepts the enclosing phase. Record acceptance as history outside the sealed host. Any later tracked/private state commit is a new candidate; no automatic post-review Context/HUD commit chain.

Ordinary task/Sprint Chunk completion does not invoke this workflow. Immediate mode requires the task's fingerprinted necessity flag/reason/rationale and does not replace phase/final verification.

No-change outcomes with no candidate diff need no documentation PR: complete review/checks and explicit acceptance directly. They do not fabricate an empty PR or automatically commit orchestration mirrors.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

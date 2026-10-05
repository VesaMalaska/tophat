---
name: publish-pr
description: "Use for explicit /publish-pr requests. Publish the exact evidenced feature head for human review after a read-only readiness check."
---

## Invocation and required reads

Use the exact human invocation of `/publish-pr` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Exactly one explicit task locator, preserved verbatim from the human invocation; missing/extra locators halt. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/publish-pr"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: the separately authorized execution actor; follow the role/session contract in the procedure. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Fetch the exact taskClassification, expected feature branch, explicit human project base policy, applicable latest stage records, task validation report/log and QA attempt evidence or justified QA_NOT_APPLICABLE record. Do not infer approval from Linear status or assume a host's main branch. This TopHat implementation PR targets development.
2. Run `node .agents/scripts/validate-qa-evidence.ts` with operation publish and the exact closed request from `.agents/docs/task-routing-and-qa.md` on stdin. Require PUBLICATION_READY, approvalAllowed true and the candidate SHA. On DENIED, halt visibly with the issues; do not weaken, skip, repair or rewrite receipts.
3. Immediately before publication, repeat the read-only check. The orchestrator opens the PR for that exact feature head and explicit base, with a reviewable description and evidence. Inspect the command/API outcome and verify the created PR head/base match the checked candidate/policy using the exported `verifyPublishedPR` invariant. Race or failure halts; no destructive recovery is authorized. Shared mutation preflight follows `.agents/docs/git-safety.md`.
4. The orchestrator may separately post the PR URL and apply the authorized Linear transition. Do not write or commit tracked Context/Strategy/HUD after QA. State synchronization needed for the candidate happens before QA; archival or later state commits are new candidates requiring fresh applicable evidence.
5. Return the PR URL for independent review and separate explicit human merge approval. This workflow creates the PR; it does not authorize or execute a merge.

Helpers validate supplied evidence consistency when invoked. They do not intercept arbitrary GitHub, Git, terminal or agent actions, authenticate reviewers, or prove actual human consent.

## Explicit documentation-only transaction

The orchestrator may select documentation mode only for a declared `/sync-derived-docs` or `/verify-project-docs` candidate from accepted integrated task work. This does not accept the phase early. Use `validate-derived-docs.ts` operation readiness on the exact closed document receipt/latest-attempt index. Require DOCUMENTATION_READY and approvalAllowed. The baseline ancestry and entire baseline-to-candidate diff must match the authorized derived plan, with passing independent document review, protected-state seal, applicable validation and claim verification. Do not infer this mode from file extensions or commit messages.

Recheck immediately before publication. Open the exact-head PR for the identity's explicit expectedBase and verify returned head/base using `verifyDocumentPR`. Any failure/race halts without destructive repair. No automatic merge or post-review state commit. Combined product/documentation PRs use the existing task gate above, with fresh exact-HEAD route/security/QA evidence after the documentation commit. Old task QA remains historical; it is not automatically refreshed by document review.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

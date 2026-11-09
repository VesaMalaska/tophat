---
name: remediate-task
description: "Use for explicit /remediate-task requests. Separate assigned-tier developer remediation followed by a fresh derived review route."
---

## Invocation and required reads

Use the exact human invocation of `/remediate-task` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Exactly one explicit task locator, preserved verbatim from the human invocation; missing/extra locators halt. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/remediate-task"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-junior-dev.md`, `.agents/rules/agent-mid-dev.md`, `.agents/rules/agent-senior-dev.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Fetch the exact taskClassification and latest review/security/QA findings. Run `node .agents/scripts/classify-task.ts` on stdin; require ROUTING_VALID. Missing/stale/conflicting task metadata halts for a human-reviewed amendment.
2. Invoke the assigned developer tier on the existing expected feature branch. The reviewer or QA role does not implement the fix. Address the recorded defect within task scope; do not add features, weaken checks, rewrite authority or perform unrelated cleanup.
3. Apply the shared clean-code contract in `.agents/docs/task-routing-and-qa.md`. Use the project's declared relevant tests and runner-neutral TDD where applicable. Preserve failure evidence.
4. Product-code remediation requires a new developer commit. Inspect command outcomes and report the exact SHA/session/task fingerprint to the orchestrator. No destructive recovery is authorized. Shared Git safety is defined in `.agents/docs/git-safety.md`.
5. Finalize intended tracked private-state changes before the final candidate review/QA. The orchestrator records a new implementation receipt and returns to the derived standard or critical review. Critical then requires security. Every QA-required task receives fresh independent QA; old approval cannot carry to the new commit.
6. Environment-only blockers may be resolved through separately authorized environment work, followed by a fresh evidence attempt; do not create an empty product commit merely to imitate remediation. Reviewers can review a developer's fix again but cannot approve their own code changes.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

## Terminal applicability

For a validated terminal host, read `.agents/docs/terminal-host-support.md`. Preserve the declared cli/tui mode, closed capability/trait/method mapping and host-approved launch/renderer policy. Do not infer a web server, browser, Electron or styling stack from Node.js. Follow existing actor, authority and exact-candidate boundaries.

---
name: review-standard
description: "Use for explicit /review-standard requests. Independent read-only review-standard inspection of the exact classified candidate."
---

## Invocation and required reads

Use the exact human invocation of `/review-standard` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Exactly one explicit task locator, preserved verbatim from the human invocation; missing/extra locators halt. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/review-standard"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-review-standard.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. The orchestrator fetches the taskClassification and current candidate/stage evidence. Run `node .agents/scripts/classify-task.ts` with the exact JSON on stdin; require ROUTING_VALID and that `review-standard` belongs to requiredStages. A missing legacy record, stale authority or wrong route halts. Standard and critical are alternative reviews.
2. Invoke `@agent-review-standard` with the bounded task/source extracts, applicable skills, exact candidate commit and prior findings. Inspect only relevant code and evidence. Apply the shared understandability/change-locality checklist in `.agents/docs/task-routing-and-qa.md`. Do not change product code, tests, configuration, authority or private state; do not run Git mutation, install dependencies, or implement fixes.
3. Return criterion-linked findings and `APPROVED`, `CHANGES_REQUIRED`, or `BLOCKED`. Re-check prior findings in this role's domain after developer remediation. Do not substitute for another required role's validation or approve your own remediation.
4. The separate orchestrator records the latest stage receipt (sequence, taskFingerprint, inspectedCommit, role/session, verdict, findings) and verifies surviving diffs/observed operations before applying Linear/HUD state. No review agent HUD shell exception is granted.
5. Derive the next stage with `nextStage` from the validated route. Approved critical always leads to `/security-review`; approved standard/security leads to `/qa-validate` if methods are required, otherwise publication readiness. CHANGES_REQUIRED leads to `/remediate-task`; BLOCKED requires human direction. Status labels alone do not authorize publication.

A subsequent code correction requires a new developer commit and a fresh derived review route, then security/QA where required. Actual independence and gate invocation are supervised instructions; no physical IDE prevention is claimed.

Git policy: this workflow authorizes no Git mutation. Any later Git action belongs to a separately authorized execution workflow under the shared Git safety contract; this does not grant command authority to a read-only role.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

## Terminal applicability

For a validated terminal host, read `.agents/docs/terminal-host-support.md`. Preserve the declared cli/tui mode, closed capability/trait/method mapping and host-approved launch/renderer policy. Do not infer a web server, browser, Electron or styling stack from Node.js. Follow existing actor, authority and exact-candidate boundaries.

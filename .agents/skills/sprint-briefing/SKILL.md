---
name: sprint-briefing
description: "Use for explicit /sprint-briefing requests. Advisory read-only sprint briefing; no PM execution or state mutation."
---

## Invocation and required reads

Use the exact human invocation of `/sprint-briefing` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/sprint-briefing"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-pm.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Before the PM session, the separate orchestrator captures current files/private state/Git identity with inspect-role-session.ts role pm and no writable outputs. Existing dirty state or failed authority may be briefing evidence; it does not authorize implementation. If capture is unavailable, mark POSTCONDITION_UNVERIFIED.
2. Invoke @agent-pm. Read Strategy.md, Roadmap.md, Context.md, supplied validation/authority evidence and read-only Linear status through file/MCP reads. Missing or inconsistent evidence is a blocker; do not invent state. Linear authentication failure is advisory blocking evidence, not permission to execute repair.
3. Output Sprint Health, Roadmap Horizon, Recently Completed, Recommended Next Action with derived Dev Tier/model mapping, and Risks/Blockers. Recommend the next separately authorized workflow; do not run it.
4. PM executes no shell command, Git inspection, validation helper, test, build, installation, file write, HUD update, Linear/task mutation, remediation or subagent invocation. No HUD exception exists.
5. After leaving the PM session, the orchestrator verifies the original snapshot and observed operations. A violation rejects the briefing result and requires human direction. Unavailable verification stays POSTCONDITION_UNVERIFIED; a diff cannot prove that invisible operations never occurred.
6. The human selects a separate authorized workflow to apply any recommendation. Antigravity workflow identity/interception remains unverified; this is an instructed boundary plus postcondition detection, not physical prevention.

Git policy: this workflow authorizes no Git mutation. Any later Git action belongs to a separately authorized execution workflow under the shared Git safety contract; this does not grant command authority to a read-only role.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

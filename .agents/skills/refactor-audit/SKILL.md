---
name: refactor-audit
description: "Use for explicit /refactor-audit requests. Read-only architectural debt findings; no task creation or execution authority."
---

## Invocation and required reads

Use the exact human invocation of `/refactor-audit` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/refactor-audit"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-architect.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Load `.agents/rules/agent-architect.md` for a distinct read-only audit session. Read Context, approved criterion/contract inputs and applicable guidance. Inspect authorized source paths with file readers; do not execute shell commands or assume a source directory named src.
2. Return findings grouped as CRITICAL, MAJOR or MINOR debt. Each finding includes affected path, observed behavior, evidence, relevant criterion/contract, uncertainty and scope implications. Do not produce ready-to-create Linear task blocks.
3. This command authorizes no Git mutation, file write, HUD update or Linear mutation. An APPROVED response to an audit is not ticket-creation authorization. The external orchestrator reviews supplied operation traces and current diffs for prohibited actions; missing observations remain UNVERIFIED. The existing PM/QA role-session helper does not accept Architect sessions, and must not be relabeled or presented as an audit enforcement mechanism.
4. If work is desired, the Human Orchestrator resolves missing/out-of-scope authority through documentation/roadmap approval first. `/generate-sprint-tasks` then follows its own source extracts, authorityContext, `validate-task-authority.ts`, `classify-task.ts` and human ticket gate. No automatic downstream invocation.
5. Return findings, checked scope, blockers and permitted next command with host-configured model advice.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

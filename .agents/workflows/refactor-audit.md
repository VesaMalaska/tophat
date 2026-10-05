---
description: Read-only architectural debt findings; no task creation or execution authority.
---

1. Load `.agents/rules/agent-architect.md` for a distinct read-only audit session. Read Context, approved criterion/contract inputs and applicable guidance. Inspect authorized source paths with file readers; do not execute shell commands or assume a source directory named src.
2. Return findings grouped as CRITICAL, MAJOR or MINOR debt. Each finding includes affected path, observed behavior, evidence, relevant criterion/contract, uncertainty and scope implications. Do not produce ready-to-create Linear task blocks.
3. This command authorizes no Git mutation, file write, HUD update or Linear mutation. An APPROVED response to an audit is not ticket-creation authorization. The external orchestrator checks the captured Architect session through the existing role-session procedure; missing evidence remains unverified.
4. If work is desired, the Human Orchestrator resolves missing/out-of-scope authority through documentation/roadmap approval first. `/generate-sprint-tasks` then follows its own source extracts, authorityContext, `validate-task-authority.ts`, `classify-task.ts` and human ticket gate. No automatic downstream invocation.
5. Return findings, checked scope, blockers and permitted next command with host-configured model advice.

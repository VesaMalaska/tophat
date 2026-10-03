---
description: Generates the environment-specific CI/CD smoke test ticket in Linear.
---


## Documentation authority precondition

Before package ingestion or any planning/task side effect, run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'`. Require exit zero, APPROVED_VALID and planningAllowed. Halt on DENIED; never use loose docs discovery, root ADRs, cached state or invented source material as authority. Read only the selected validated inventory.

Before proposing, creating or amending a task, run `node .agents/scripts/validate-task-authority.ts` with the exact structured authority payload on stdin. Require AUTHORITY_VALID and exit zero. Include package provenance, stable phase/chunk IDs, active scopeIds, typed references and exact indexed source extracts; explicit applicability reasons are required for empty decision/contract references. Recheck immediately before approved issue creation/amendment; a changed fingerprint or extract requires a revised human-reviewed proposal. Preserve the exact approved raw Markdown in Linear. Logs/code are evidence, not permission to add scope. A missing approved requirement/criterion is a blocker.

**Steps:**

1.  **Initialize State:** Invoke `@agent-architect`.
2.  **Context Ingestion:** Load the validated workspace declaration and read the project's approved execution-stack documentation. Do not infer a browser from the presence of Node.js.
3.  **Systemic Smoke Test Selection:** Select from the derived workspace profile: web requires a suitable browser-facing boot/route check; `backend + none` requires a service boot, health, or API check without Playwright; Electron requires a desktop boot and relevant IPC check while retaining main/preload/renderer boundaries. Choose a path and tool supported by the host project rather than a fixed test filename. Use `select-task-guidance.ts` to validate all proposed skills and framework instructions before handoff.
4.  **Execution (Linear MCP):** Create a high-priority task for the selected smoke specification only after proposing a fully traced task block and receiving explicit human APPROVED for issue creation. Assign Dev Tier: `senior`; choose the existing review route from task risk rather than assuming `critical` for all environments. Verify it lands in the 'Todo' column. Host validation uses the existing shared runner; full QA method classification remains Slice 6. No approved runtime/operations source for the smoke requirement means halt instead of inventing a ticket.
5.  **Completion:** Output a confirmation summary of the ticket creation.

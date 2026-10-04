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
4.  **Execution (Linear MCP):** Create a high-priority task for the selected smoke specification only after proposing a fully traced task block and receiving explicit human APPROVED for issue creation. Assign Dev Tier: `senior`; use the derived critical review and security route. Verify it lands in the 'Todo' column. Host validation uses the existing shared runner; QA methods come from the same classifier; no browser method is inferred for a backend. No approved runtime/operations source for the smoke requirement means halt instead of inventing a ticket.
5.  **Completion:** Output a confirmation summary of the ticket creation.

## Slice 6 routing precondition

Every generated/amended task embeds the closed taskClassification record from `.agents/docs/task-routing-and-qa.md`. Run `node .agents/scripts/classify-task.ts` on that exact JSON before proposal and again before approved Linear handoff. Require ROUTING_VALID. Copy only derived route/method fields; a missing record or contradiction halts for reviewed amendment. Preserve the approved source/task payload. A senior smoke task always takes critical review and security; backend smoke does not imply browser QA. Private topology cannot bypass the route.

Immediate documentation necessity is optional closed taskClassification metadata: `immediateDocumentation` with required/reason/rationale. Required true needs safe-operation, continued-development, migration, configuration or compatibility plus rationale; false uses null reason/rationale. Include it before fingerprinting/classification. A required update completes in task-bounded `/sync-derived-docs` before the final task review/QA candidate is sealed, and never accepts its Development Phase. Ordinary tasks/chunks do not synchronize documents.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

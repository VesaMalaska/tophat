---
description: Surgical JIT context healing for tasks halted by execution agents due to missing schemas or documentation gaps.
---


## Documentation authority precondition

Before package ingestion or any planning/task side effect, run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'`. Require exit zero, APPROVED_VALID and planningAllowed. Halt on DENIED; never use loose docs discovery, root ADRs, cached state or invented source material as authority. Read only the selected validated inventory.

Before proposing, creating or amending a task, run `node .agents/scripts/validate-task-authority.ts` with the exact structured authority payload on stdin. Require AUTHORITY_VALID and exit zero. Include package provenance, stable phase/chunk IDs, active scopeIds, typed references and exact indexed source extracts; explicit applicability reasons are required for empty decision/contract references. Recheck immediately before approved issue creation/amendment; a changed fingerprint or extract requires a revised human-reviewed proposal. Preserve the exact approved raw Markdown in Linear. Logs/code are evidence, not permission to add scope. A missing approved requirement/criterion is a blocker.

**Steps:**

1. **Initialize Orchestration:** Invoke `@agent-architect`.
2. **Context Ingestion:** "Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the exact `[BLOCKER_ENCOUNTERED]` comment left by the execution agent to identify the missing schema, constraint, or logic requirement."
3. **Validated Discovery:** Read only the approved package's validated inventory. Locate the specific missing source block and stable reference. If it does not exist, output DOCUMENTATION_AUTHORITY_BLOCKER and halt for human resolution and reapproval. Do not invent schemas from architectural conventions.
4. **Bounded proposal:** Output the exact proposed task context amendment, source references and authority payload. Run both shared authority checks. Obtain explicit human APPROVED before applying the unchanged payload through Linear; revalidate immediately before amendment. The ordinary Architect never writes public product authority.

5. **State Reset:** "Use the Linear MCP to transition Task `{{args[0]}}` from 'Blocked' back to 'Todo'."
6. **Separate orchestrator HUD handoff:** "An explicitly authorized orchestrator, not the Architect, may execute `node .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "[Read from task: junior, mid, or senior]" --sec "[yes or no]" --qa "[yes or no]" --status "Todo" --next "/implement-[tier] {{args[0]}}"` via `run_command` to instantly update the visual Orchestrator HUD."
7. **Human Gate:** "Output a summary of the injected context. Prompt the Human Orchestrator to review the patch and re-trigger the appropriate execution agent."

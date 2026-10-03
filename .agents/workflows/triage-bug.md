---
description: Conversational, multi-turn bug diagnostic pipeline. The Lead Architect conducts an analytical root-cause interview with the Human Orchestrator before compiling a Linear bug ticket.
---


## Documentation authority precondition

Before package ingestion or any planning/task side effect, run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'`. Require exit zero, APPROVED_VALID and planningAllowed. Halt on DENIED; never use loose docs discovery, root ADRs, cached state or invented source material as authority. Read only the selected validated inventory.

Before proposing, creating or amending a task, run `node .agents/scripts/validate-task-authority.ts` with the exact structured authority payload on stdin. Require AUTHORITY_VALID and exit zero. Include package provenance, stable phase/chunk IDs, active scopeIds, typed references and exact indexed source extracts; explicit applicability reasons are required for empty decision/contract references. Recheck immediately before approved issue creation/amendment; a changed fingerprint or extract requires a revised human-reviewed proposal. Preserve the exact approved raw Markdown in Linear. Logs/code are evidence, not permission to add scope. A missing approved requirement/criterion is a blocker.

**Steps:**

1. **Initialize Triage:** Invoke `@agent-architect`.
2. **Ingest Initial Context:** Read the initial error logs, stack traces, or descriptions provided by the Human Orchestrator. Cross-reference against `[GLOBAL_CONSTRAINTS]` in `Context.md`.
3. **The Diagnostic Interview (Conversational Loop):**
   - You are STRICTLY FORBIDDEN from generating a task block or Linear ticket during this phase.
   - Think out loud: Analyze the mechanical layers involved in the declared workspace (for example, a UI component, server endpoint, Electron IPC bridge, or data store).
   - Formulate hypotheses regarding the root cause of the bug.
   - Ask targeted, clarifying questions to the Human Orchestrator (e.g., requesting specific terminal logs, steps to reproduce, or clarifying local OS/environment variables).
   - Maintain this diagnostic back-and-forth across multiple turns until the structural root cause is identified and agreed upon.
4. **The Authorization Gate:**
   - At the end of your diagnostic turns, always remind the Human Orchestrator: 'Whenever we have isolated the root cause, reply with the exact command GENERATE BUGFIX to compile the formal Linear task specification.'
   - Do not proceed to Step 5 until the user explicitly outputs 'GENERATE BUGFIX' in the chat.
5. **Task Compilation (Triggered by GENERATE BUGFIX):**
   - Synthesize the entire diagnostic conversation into a standalone, deterministic task specification so downstream developers can execute blind without needing this chat history.
   - Use the exact formatting mandated in your core instructions (Title, Priority, Dev Tier, Review Tier, Security, QA). Prefix the Title with '[BUG]'.
   - Define explicit, testable Acceptance Criteria and at least one relevant regression case using the project's declared test runner. Validate any selected framework skills with the task-guidance check before proposing the task.
   - As the ABSOLUTE FINAL LINE of your output, append this exact closing call-to-action: '🛑 ACTION REQUIRED: Please review the compiled bug spec above. Reply with APPROVED to execute ticket creation in Linear.'
6. **Linear Execution (Post-Approval):**
   - Upon receiving 'APPROVED', invoke the Linear MCP tool to create the issue using your exact Markdown description. Verify the ticket transitions to 'Todo'.

Bug compilation/publication must use the current active chunk provenance. If a justified regression is outside that scope, request a human-authorized bounded roadmap adjustment first; do not widen the task or invent requirements.

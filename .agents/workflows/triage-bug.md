---
description: Conversational, multi-turn bug diagnostic pipeline. The Lead Architect conducts an analytical root-cause interview with the Human Orchestrator before compiling a Linear bug ticket.
---

**Steps:**

1. **Initialize Triage:** Invoke `@agent-architect`.
2. **Ingest Initial Context:** "Read the initial error logs, stack traces, or descriptions provided by the Human Orchestrator. Cross-reference against `[GLOBAL_CONSTRAINTS]` in `Context.md`."
3. **The Diagnostic Interview (Conversational Loop):**
   - "You are STRICTLY FORBIDDEN from generating a task block or Linear ticket during this phase."
   - "Think out loud: Analyze the mechanical layers involved (e.g., Svelte 5 UI, Electron Main Process, IPC Context Bridge, SQLite native bindings)."
   - "Formulate hypotheses regarding the root cause of the bug."
   - "Ask targeted, clarifying questions to the Human Orchestrator (e.g., requesting specific terminal logs, steps to reproduce, or clarifying local OS/environment variables)."
   - "Maintain this diagnostic back-and-forth across multiple turns until the structural root cause is identified and agreed upon."
4. **The Authorization Gate:**
   - "At the end of your diagnostic turns, always remind the Human Orchestrator: 'Whenever we have isolated the root cause, reply with the exact command GENERATE BUGFIX to compile the formal Linear task specification.'"
   - "Do not proceed to Step 5 until the user explicitly outputs 'GENERATE BUGFIX' in the chat."
5. **Task Compilation (Triggered by GENERATE BUGFIX):**
   - "Synthesize the entire diagnostic conversation into a standalone, deterministic task specification so downstream developers can execute blind without needing this chat history."
   - "Use the exact formatting mandated in your core instructions (Title, Priority, Dev Tier, Review Tier, Security, QA). Prefix the Title with '[BUG]'."
   - "Define explicit, testable Acceptance Criteria and at least one edge-case Vitest regression requirement."
   - "As the ABSOLUTE FINAL LINE of your output, append this exact closing call-to-action: '🛑 ACTION REQUIRED: Please review the compiled bug spec above. Reply with APPROVED to execute ticket creation in Linear.'"
6. **Linear Execution (Post-Approval):**
   - "Upon receiving 'APPROVED', invoke the Linear MCP tool to create the issue using your exact Markdown description. Verify the ticket transitions to 'Todo'."

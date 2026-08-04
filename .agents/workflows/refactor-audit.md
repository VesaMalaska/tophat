---
description: Strategic architectural audit to identify technical debt and propose atomic refactoring tasks without mutating code.
---

**Steps:**

1.  **Initialize Audit:** Invoke `@agent-architect`.
2.  **Context Ingestion:** Read the `[GLOBAL_CONSTRAINTS]` in `Context.md` to establish the active tech stack boundaries. Use the `run_command` tool to execute `ls -R src/` (or your primary source directory) to map the codebase structure.
3.  **Targeted Inspection:** Use the view_file tool to sample highly trafficked or complex files. Evaluate the implementation against the active Antigravity Skills appended to the workspace. Look specifically for legacy syntax, broken state boundaries, or inefficient data/IPC bridges.
4.  **The Read-Only Mandate:** You are strictly an observer during this phase. You must NOT use `write_to_file` or `replace_file_content`.
5.  **Audit Synthesis:** Compile a detailed Refactoring Audit Report. Structure your output exactly as follows:
    - **CRITICAL DEBT:** [Security flaws, severe architectural drift blocking future Epics]
    - **MAJOR DEBT:** [Framework syntax violations, bloated state management]
    - **MINOR DEBT:** [File organization, dead code, naming conventions]
6.  **Task Proposal:** Below the report, generate a list of atomic, deterministic Linear task blocks designed to resolve the identified debt. Format these using the standard Phase 1 task proposal template (Title, Priority, Dev Tier, Review Tier, etc.).
7.  **Human Gate:** As the final line of your output, append this exact call-to-action: '🛑 **ACTION REQUIRED:** Please review the Refactoring Audit Report. Reply with APPROVED to authorize the creation of these refactoring tickets in Linear.'
8.  **Linear State Enforcement (Post-Approval):** Only upon receiving the 'APPROVED' signal from the Human Orchestrator, invoke the Linear MCP to create the issues and verify they land in the 'Todo' or 'Backlog' column.

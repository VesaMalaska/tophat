---
description: Strict deterministic environment validation followed by Lead Architect cognitive bootstrapping.
---

**Steps:**

1.  **Initialize State:** Invoke the System Shell (Antigravity Orchestrator).
2.  **Toolchain Audit:** "Execute `node -v`, `pnpm -v`, and `git --version`. Parse the Node version output. If the major version is `< 22`, halt immediately with a `[ENVIRONMENT_FAILURE]` block, instructing the Human Orchestrator to update Node. If any command fails, halt execution."
3.  **Deep Structure Check:** "Verify the existence of the Multi-Agent Matrix. Check for the `.agents/` directory and verify that the core subdirectories (/rules, /workflows, /skills) and the hooks.json file are present at the root of the vault. If the core scaffolding is missing, halt and output a list of the missing files."
4.  **Strict Memory Check:** "Verify that `Strategy.md` and `Context.md` exist at the workspace root and contain the exact Antigravity boilerplate headers (e.g., `[GLOBAL_CONSTRAINTS]`). Do NOT generate these files autonomously. If absent or malformed, halt with `[WORKSPACE_VALIDATION_FAILED]` and instruct the Human Orchestrator to manually add the base templates."
5.  **Integration Ping:** "Attempt a lightweight read operation via the Linear MCP extension. If the ping is unresponsive or unauthorized, halt and output `[LINEAR_AUTH_FAILED]: Please authenticate the Linear MCP before proceeding.`"
6.  **PRD Validation Check:** "Verify the existence of the `docs/` directory and `docs/PRD.md`. If `PRD.md` is absent, halt and instruct the human to provide the foundational documentation."
7.  **Cognitive Handoff:** Invoke @agent-architect.
8.  **Architect Instruction:** "Parse `docs/PRD.md` and any existing ERDs or Architecture docs. Validate the documentation against the Four Mandatory Declarations:
    8.1. **Execution Stack:** Are the frontend, backend, and native frameworks explicitly defined?
    8.2. **State & Storage:** Is the method of data persistence explicitly defined (e.g., PostgreSQL, SQLite, Local JSON, or 'In-Memory Only')?
    8.3. **Identity Strategy:** Is the authentication model defined (e.g., Supabase Auth, Custom JWT, or explicitly 'None/Local Application')?
    8.4. **Scope Boundaries:** Are the high-level Epics listed, and are the 'Out of Scope' boundaries clearly defined?
    Execution Constraint: If any of these six declarations are vague or omitted, HALT execution. Output a `[PRD_REJECTION]` payload detailing exactly which categorical declarations the Human Orchestrator must amend."
9.  **Roadmap Generation:** "If the PRD passes validation, generate `docs/Roadmap.md`. Operate as a living master blueprint. Break the total application scope into high-level 'Phases', and slice those phases into deterministic 'Sprint Chunks'. Provide detailed descriptions of the deliverables for each chunk."
10. **Memory Seeding:** "Inject the validated Tech Stack frameworks into the `[GLOBAL_CONSTRAINTS]` block of `Context.md`. Seed `Strategy.md` with the Phase 1 and Sprint Chunk 1 definitions from the new Roadmap."
11. **Completion:** "Output a confirmation summary of the initial Roadmap. Advise the Human Orchestrator that workspace initialization is complete and they may now trigger `/session-start` or `/new-task` to begin development."

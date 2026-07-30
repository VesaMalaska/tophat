---
description: Strict deterministic environment validation followed by Lead Architect cognitive bootstrapping, Roadmap generation, and Foundational Ticket creation.
---

**Steps:**

1.  **Initialize State:** Invoke the System Shell (TopHat Orchestrator).
2.  **Toolchain Audit:** Execute `node -v`, `pnpm -v`, and `git --version`. Parse the Node.js version output. If the major version is `< 22`, halt immediately with a `[ENVIRONMENT_FAILURE]` block, instructing the Human Orchestrator to update Node.js. If any command fails, halt execution.
3.  **Deep Structure Check:** Verify the existence of the Multi-Agent Matrix. Check for the `.agents/` directory and verify that the core subdirectories (`/rules`, `/workflows`, `/skills`) and the `hooks.json` file are present at the root of the vault. If the core scaffolding is missing, halt and output a list of the missing files.
4.  **Strict Memory Check:** Verify that `Strategy.md`, `Context.md`, `HUD.md`, and `DECISIONS.md` exist at the workspace root. Do NOT generate these files autonomously. If absent or malformed, halt with `[WORKSPACE_VALIDATION_FAILED]` and instruct the Human Orchestrator to restore the missing templates from the TopHat base repository before continuing.
5.  **Integration Ping:** Attempt a lightweight read operation via the Linear MCP extension. If the ping is unresponsive or unauthorized, halt and output `[LINEAR_AUTH_FAILED]: Please authenticate the Linear MCP before proceeding.`
6.  **PRD Validation Check:** Verify the existence of the `docs/` directory and `docs/PRD.md`. If `PRD.md` is absent, halt and instruct the human to provide the foundational documentation.
7.  **Cognitive Handoff:** Invoke `@agent-architect`.
8.  **Linear State Validation:** You possess the strict array of required TopHat custom statuses: ['Backlog', 'Todo', 'In Progress', 'Blocked', 'In Review: Architecture', 'In Review: Security', 'In Review: QA', 'Ready for PR', 'In Review: Orchestrator', 'Changes Requested', 'Done', 'Canceled', 'Duplicate']. Invoke the Linear MCP tool `list_issue_statuses` to retrieve the active workflow states from the authenticated Linear Team. Execute a strict diff against your internal array. Constraint: If ANY required status is missing, missing a matching UUID, or contains a case-sensitive typo, output a [LINEAR_STATE_DESYNC] blocker payload detailing the exact missing statuses. HALT execution instantly until the Human Orchestrator confirms the Linear board is corrected.
9.  **Architect Instruction:** Parse `docs/PRD.md` and any existing ERDs or Architecture docs. Validate the documentation against the Four Mandatory Declarations:
    9.1. **Execution Stack:** Are the frontend, backend, and native frameworks explicitly defined?
    9.2. **State & Storage:** Is the method of data persistence explicitly defined (e.g., PostgreSQL, SQLite, Local JSON, or 'In-Memory Only')?
    9.3. **Identity Strategy:** Is the authentication model defined (e.g., Supabase Auth, Custom JWT, or explicitly 'None/Local Application')?
    9.4. **Scope Boundaries:** Are the high-level Epics listed, and are the 'Out of Scope' boundaries clearly defined?
    Execution Constraint: If any of these six declarations are vague or omitted, HALT execution. Output a `[PRD_REJECTION]` payload detailing exactly which categorical declarations the Human Orchestrator must amend.
10. **Roadmap Generation:** If the PRD passes validation, generate `Roadmap.md`. Operate as a living master blueprint. Break the total application scope into high-level 'Phases', and slice those phases into deterministic 'Sprint Chunks'. Provide detailed descriptions of the deliverables for each chunk.
11. **Modular Sub-Routine Execution (CRITICAL):** You MUST now dynamically load and execute two isolated sub-routines to complete initialization:
    - **Action A:** Use the `view_file` tool to read `.agents/workflows/generate-smoke-test.md`. Execute its exact steps to generate the CI/CD Linear ticket.
    - **Action B:** Use the `view_file` tool to read `.agents/workflows/generate-readme.md`. Execute its exact steps to compile the master documentation, update `Context.md`, and generate the final Phase 0 Pull Request.
12. **Memory Seeding:** Inject the validated Tech Stack frameworks into the `[GLOBAL_CONSTRAINTS]` block of `Context.md`. Seed `Strategy.md` with the `Phase 1` and `Sprint Chunk 1` definitions from the new Roadmap.
13. **Version Control Handoff:**
    - Execute: `git add README.md Context.md Strategy.md Roadmap.md`
    - Execute: `git commit -m 'chore(docs): workspace initialization and master README'`
    - Execute: `git push -u origin chore/workspace-init`
    - Execute: `gh pr create --title 'chore: workspace initialization' --body 'Automated TopHat bootstrapping.' --base main`
14. **Completion:** Output a confirmation summary of the Roadmap, the linked PR, and the created Smoke Test task. Output exactly: `[Next Action: /sprint-briefing]`.

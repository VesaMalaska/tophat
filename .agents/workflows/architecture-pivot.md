---
description: Halts the swarm, reconciles modified PRD/ERD specifications against the Master Roadmap, regenerates documentation, and triages active Linear tasks.
---

**Steps:**

1. **Initialize Reconciliation:** Invoke `@agent-architect`.
2. **Spec Ingestion:** The Human Orchestrator has altered the core specifications. Use the `run_command` tool to execute `ls -1 docs/`. Read the updated `docs/PRD.md`, `docs/ERD.md`, and any other technical files in their entirety.
3. **Roadmap Reconciliation:** Cross-reference the new specifications against `Roadmap.md`. Use the `replace_file_content` tool to surgically update the `[UPCOMING_CHUNKS]` and `[ACTIVE_SPRINT_CHUNK]` to reflect the new architectural reality. Do not alter `[REALIZED_CHUNKS]`.
4. **Master Documentation Sync (CRITICAL):** The core application truth has changed. You MUST autonomously execute the logic of the `/generate-readme` workflow. Re-write the root `README.md` to reflect the new specs, and use `replace_file_content` to update the `#### 🧠 Host Project Snapshot` inside `Context.md`.
5. **Linear Triage (Read-Only):** Use the Linear MCP to scan the active board. Identify any tasks in the 'Todo', 'In Progress', or 'Blocked' columns that are now obsolete, structurally incorrect, or missing critical new schemas based on the pivot.
6. **Strategy Reset:** Update `Strategy.md` to document the pivot in the ADR section and adjust the Active Phase Engine.
7. **Human Gate:** Output a `[TRIAGE_REPORT]` detailing which Linear tasks must be manually canceled or regenerated. Prompt the Human Orchestrator to confirm the new Roadmap state.

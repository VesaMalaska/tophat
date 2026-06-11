---
description: Halts the swarm, reconciles modified PRD/ERD specifications against the Master Roadmap, and triages active Linear tasks.
---

**Steps:**

1. **Initialize Reconciliation:** Invoke `@agent-architect`.
2. **Spec Ingestion:** "The Human Orchestrator has altered the core specifications. Read the updated `docs/PRD.md` and `docs/ERD.md` in their entirety."
3. **Roadmap Reconciliation:** "Cross-reference the new specifications against `docs/Roadmap.md`. Use the replace_file_content tool to surgically update the `[UPCOMING_CHUNKS]` and `[ACTIVE_SPRINT_CHUNK]` to reflect the new architectural reality. Do not alter `[REALIZED_CHUNKS]`."
4. **Linear Triage (Read-Only):** "Use the Linear MCP to scan the active board. Identify any tasks in the 'Todo' or 'In Progress' columns that are now obsolete, structurally incorrect, or missing critical new schemas based on the pivot."
5. **Strategy Reset:** "Update `Strategy.md` to document the pivot in the ADR section and adjust the Active Phase Engine."
6. **Human Gate:** "Output a `[TRIAGE_REPORT]` detailing which Linear tasks must be manually canceled or regenerated. Prompt the Human Orchestrator to confirm the new Roadmap state."

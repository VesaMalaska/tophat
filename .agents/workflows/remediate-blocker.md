---
description: Surgical JIT context healing for tasks halted by execution agents due to missing schemas or documentation gaps.
---

**Steps:**

1. **Initialize Orchestration:** Invoke `@agent-architect`.
2. **Context Ingestion:** "Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the exact `[BLOCKER_ENCOUNTERED]` comment left by the execution agent to identify the missing schema, constraint, or logic requirement."
3. **Autonomous Discovery:** "Use the `run_command` tool (`ls -1 docs/`) and `view_file` tool to parse the PRD, ERD, or other technical documentation. Locate the specific missing context requested by the developer."
4. **Task Mutability (The Patch):** "If the context is found, use the Linear MCP to update the description of Task `{{args[0]}}`, appending a new section titled `[ARCHITECT_JIT_CONTEXT]` containing the exact missing schemas or rules. If the context does not exist in the documentation, generate the missing schema locally based on the existing architectural constraints and append it."
5. **State Reset:** "Use the Linear MCP to transition Task `{{args[0]}}` from 'Blocked' back to 'Todo'."
6. **Human Gate:** "Output a summary of the injected context. Prompt the Human Orchestrator to review the patch and re-trigger the appropriate execution agent."

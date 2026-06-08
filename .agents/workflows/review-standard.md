---
description: Stateless and UI code review pipeline with automated Linear rejection/approval routing.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-review-standard`.
2. **Instruction:** "Evaluate the active branch associated with Linear Task ID `{{args[0]}}` against the PRD and Acceptance Criteria."
3. **Execution:** "Perform a strict read-only audit. Check for framework syntax enforcement based on the active attached Skills, type safety, and UI degradation. Cross-check against the `[GLOBAL_CONSTRAINTS]`."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: QA' (or 'In Review: Orchestrator' if no QA is required). Use the Linear MCP to post your complete Findings and Matrix as a comment on the ticket."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task `{{args[0]}}` back to 'In Progress'. Use the Linear MCP to post your CRITICAL/MAJOR findings as a comment on the ticket."

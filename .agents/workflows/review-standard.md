---
description: Stateless and UI code review pipeline with automated Linear rejection/approval routing.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-review-standard`.
2. **Instruction:** "Evaluate the active branch associated with Linear Task ID {{args[0]}} against the PRD and Acceptance Criteria."
3. **Execution:** "Perform a strict read-only audit. Check for Svelte 5 syntax enforcement, type safety, and UI degradation. Cross-check against the primary documentation constraints."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Use the Linear MCP to transition Task {{args[0]}} to 'QA' (or 'Done' if no QA is required). Output the approval matrix."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task {{args[0]}} back to 'In Progress'. Post your CRITICAL/MAJOR findings as a comment on the ticket."

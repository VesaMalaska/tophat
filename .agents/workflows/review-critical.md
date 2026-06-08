---
description: Adversarial architecture audit pipeline with automated Linear routing.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-review-critical`.
2. **Instruction:** "Evaluate the active backend/critical branch for Linear Task ID `{{args[0]}}`. Assume an adversarial posture. Look for race conditions, auth bypasses, and state-bleeding."
3. **Execution:** "Perform a deep structural validation matrix check. Ensure the specific security boundaries defined by the attached Backend/Data Skill are impenetrable."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Security'. Use the Linear MCP to post your Adversarial Failure Analysis and Validation Matrix as a comment on the ticket."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task `{{args[0]}}` back to 'In Progress'. Use the Linear MCP to post your Threat Scenario and required changes to the ticket."

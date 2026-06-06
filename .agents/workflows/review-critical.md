---
description: Adversarial architecture audit pipeline with automated Linear routing.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-review-critical`.
2. **Instruction:** "Evaluate the active backend branch for Linear Task ID {{args[0]}}. Assume an adversarial posture. Look for race conditions, auth bypasses, and state-bleeding."
3. **Execution:** "Perform a deep structural validation matrix check. Ensure Row Level Security and server-side route guards are impenetrable."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Use the Linear MCP to transition Task {{args[0]}} to 'In Review: Security'. Output the validation matrix."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task {{args[0]}} back to 'In Progress'. Post your Threat Scenario to the ticket."

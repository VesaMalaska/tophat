---
description: End-to-End Playwright and UI resilience validation.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-qa`.
2. **Instruction:** "Evaluate the user-facing flows for Linear Task ID `{{args[0]}}`."
3. **Execution:** "Utilize the IDE's Live-Trace Debugging or execute Playwright test flows in headless mode via `run_command`. Validate idle, loading, success, and error states. Verify ARIA and accessibility standards."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Ready for PR'. Output the User Journey Validation report."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task `{{args[0]}}` back to 'In Progress'. Post the exact E2E Edge Case failures to the ticket."

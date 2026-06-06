---
description: Triggers the Security Auditor Agent against completed implementations.
---

**Steps:**

1. **Security Audit:** Invoke `@agent-security-auditor`.
2. **Instruction:** "Perform mandatory security validation against the current implementation outputs according to your threat model checklist. Enforce zero-trust architecture, strict access controls, and data sanitization protocols."
3. **Execution:** "Output findings categorized by severity. Provide remediation directives for any CRITICAL or MAJOR flaws. State a final verdict of APPROVED or CHANGES_REQUIRED."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Check the original task routing fields. If QA is required, use Linear MCP to transition Task {{args[0]}} to 'In Review: QA'. If no QA is required, transition to 'Ready for PR'."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task {{args[0]}} back to 'In Progress'. Post remediation steps to the ticket."

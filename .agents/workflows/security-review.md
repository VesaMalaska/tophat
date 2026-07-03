---
description: Triggers the Security Auditor Agent against completed implementations.
---

**Steps:**

1. **Security Audit:** Invoke `@agent-security-auditor`.
2. **Instruction:** "Execute a mandatory threat model and security validation on the active branch for Linear Task ID `{{args[0]}}` strictly against the OWASP Top 10 vulnerabilities, the attached active Skills, and the explicit Linear Task Acceptance Criteria. Assume a pessimistic, zero-trust posture. Use the Linear MCP to check the issue's comment history. If this task was previously in 'Changes Requested', review the previous failure notes. IF the previous rejection was a Security failure, explicitly verify that the specific vulnerabilities have been mitigated. IF the rejection originated from Architecture or QA, perform your baseline security audit without attempting to validate non-security UI/UX fixes."
3. **Execution:** "Output findings categorized by severity. Provide remediation directives for any CRITICAL or MAJOR flaws. State a final verdict of APPROVED or CHANGES_REQUIRED."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Check the original task routing fields. If QA is required, use Linear MCP to transition Task `{{args[0]}}` to 'In Review: QA'. If no QA is required, transition to 'Ready for PR'."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Changes Requested'. Post remediation steps to the ticket."
   - "If `[BLOCKED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Blocked'. Output a `[BLOCKER_ENCOUNTERED]` payload detailing the broken environment or missing testing infrastructure, and instruct the Human Orchestrator to update `Context.md`."
   - **HUD Radar Broadcast (MANDATORY):** Upon transitioning the Linear task, execute `npx tsx .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "senior" --status "[New Linear Status]" --next "[/qa-validate {{args[0]}}, /publish-pr {{args[0]}}, OR /remediate-task {{args[0]}}]" --model "[Recommended Next Model]"` via `run_command` to synchronize the Orchestrator HUD.
5. **Handoff Resolution:** "If `[APPROVED]`, look up the 'QA Required' metadata field on the active Linear Task.
   - If QA is 'yes', use Linear MCP to transition to 'In Review: QA'. Output exactly: `[Next Action: /qa-validate {{args[0]}}]`.
   - If QA is 'no', use Linear MCP to transition to 'Ready for PR'. Output exactly: `[Next Action: /publish-pr {{args[0]}}]`."

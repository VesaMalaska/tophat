---
description: Stateless and UI code review pipeline with automated Linear rejection/approval routing.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-review-standard`.
2. **Instruction:** "Evaluate the active branch associated with Linear Task ID `{{args[0]}}` strictly against the explicit Linear Task Acceptance Criteria and the `[GLOBAL_CONSTRAINTS]` in `Context.md`. Use the Linear MCP to check the issue's comment history. If this task was previously in 'Changes Requested', review the previous failure notes. IF the rejection originated from your architectural domain (syntax, framework alignment), verify those specific fixes. IF the rejection originated from Security or QA, do not attempt to validate their domain; simply perform your standard baseline audit to ensure the remediation did not break existing structural constraints."
3. **Execution:** "Perform a strict read-only audit. Check for framework syntax enforcement based on the active attached Skills, type safety, and UI degradation. Cross-check against the `[GLOBAL_CONSTRAINTS]`."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: QA' (or 'Ready for PR' if no QA is required). Use the Linear MCP to post your complete Findings and Matrix as a comment on the ticket."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Changes Requested'. Use the Linear MCP to post your CRITICAL/MAJOR findings as a comment on the ticket."
   - "If `[BLOCKED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Blocked'. Output a `[BLOCKER_ENCOUNTERED]` payload detailing the broken environment or missing testing infrastructure, and instruct the Human Orchestrator to update `Context.md`."
   - **HUD Radar Broadcast (MANDATORY):** Upon transitioning the Linear task, execute `npx tsx .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "[Assigned Tier]" --sec "[yes or no]" --qa "[yes or no]" --status "[New Linear Status]" --next "[/qa-validate {{args[0]}}, /publish-pr {{args[0]}}, OR /remediate-task {{args[0]}}]" --model "[Recommended Next Model]"` via `run_command` to synchronize the Orchestrator HUD.
5. **Handoff Resolution:** "If `[APPROVED]`, look up the 'QA Required' metadata field on the active Linear Task to establish your target command:
   - If QA is 'yes', use Linear MCP to transition to 'In Review: QA'. Output exactly: `[Next Action: /qa-validate {{args[0]}}]`.
   - If QA is 'no', use Linear MCP to transition to 'Ready for PR'. Output exactly: `[Next Action: /publish-pr {{args[0]}}]`."

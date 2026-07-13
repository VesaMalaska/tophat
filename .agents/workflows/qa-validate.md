---
description: End-to-End Playwright and UI resilience validation.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-qa`.
2. **Instruction:** Evaluate the user-facing flows for the active branch associated with Linear Task ID `{{args[0]}}` strictly against the explicit Linear Task Acceptance Criteria and the active UI/Frontend Skills. Use the Linear MCP to check the issue's comment history. If this task was previously in 'Changes Requested', review the previous failure notes. IF the previous rejection was a QA failure, explicitly verify that those specific Edge Case or A11y violations are resolved. IF the rejection originated from Architecture or Security, perform your standard state resiliency and end-to-end evaluation without attempting to audit backend code or security patches.
3. **Execution:** Utilize the IDE's Live-Trace Debugging or execute Playwright test flows in headless mode via `run_command`. Validate idle, loading, success, and error states. Verify ARIA and accessibility standards.
4. **Post-Flight Automation:**
   - If `[APPROVED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Ready for PR'. Output the User Journey Validation report.
   - If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Changes Requested'. Post the exact E2E Edge Case failures to the ticket.
   - If `[BLOCKED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Blocked'. Output a `[BLOCKER_ENCOUNTERED]` payload detailing the broken environment or missing testing infrastructure, and instruct the Human Orchestrator to update `Context.md`.
   - **HUD Radar Broadcast (MANDATORY):** Upon transitioning the Linear task, execute `npx tsx .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "[Assigned Tier]" --status "[New Linear Status]" --next "[/publish-pr {{args[0]}} OR /remediate-task {{args[0]}}]"` via `run_command` to synchronize the Orchestrator HUD.
5. **Handoff Resolution:** If `[APPROVED]`, output exactly: `[Next Action: /publish-pr {{args[0]}}]`.

---
description: Adversarial architecture audit pipeline with automated Linear routing.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-review-critical`.
2. **Instruction:** "Evaluate the active backend/critical branch associated with Linear Task ID `{{args[0]}}` strictly against the explicit Linear Task Acceptance Criteria, the `[GLOBAL_CONSTRAINTS]` in `Context.md`, and the attached Backend/Data Skills. Assume an adversarial posture. Use the Linear MCP to check the issue's comment history. If this task was previously in 'Changes Requested', review the previous failure notes. IF the rejection originated from your structural/adversarial domain, verify the mitigation. IF the rejection originated from Security or QA, do not attempt to validate their domain; simply perform your baseline architectural audit to ensure the remediation did not introduce new race conditions or state-bleeding."
3. **Execution:** "Perform a deep structural validation matrix check. Ensure the specific security boundaries defined by the attached Backend/Data Skill are impenetrable."
4. **Post-Flight Automation:**
   - "If `[APPROVED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Security'. Use the Linear MCP to post your Adversarial Failure Analysis and Validation Matrix as a comment on the ticket."
   - "If `[CHANGES_REQUIRED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Changes Requested'. Use the Linear MCP to post your Threat Scenario and required changes to the ticket."
   - "If `[BLOCKED]`: Use the Linear MCP to transition Task `{{args[0]}}` to 'Blocked'. Output a `[BLOCKER_ENCOUNTERED]` payload detailing the broken environment or missing testing infrastructure, and instruct the Human Orchestrator to update `Context.md`."
5. **Handoff Resolution:** "If `[APPROVED]`, output exactly: `[Next Action: /security-review {{args[0]}}]`."

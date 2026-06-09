---
description: Generates the final Pull Request after all automated swarm validations pass.
---

**Steps:**

1. **Initialize Task:** Invoke the system shell (no specific LLM agent required; operate as the Antigravity IDE orchestrator).
2. **Instruction:** "Fetch Linear Task ID `{{args[0]}}`. Verify that the task status is set to 'Ready for PR' or that all mandatory downstream audits have been completed."
3. **Execution:** "Use the `run_command` tool to execute: `gh pr create --title '{{args[0]}}' --body 'Automated PR generated and verified by Antigravity Review Swarm.' --base main`"
4. **Post-Flight Automation:**
   - "Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Orchestrator'."
   - "Output the PR URL directly into the chat for final human sign-off."

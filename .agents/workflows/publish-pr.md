---
description: Generates the final Pull Request after fetching metadata and all automated swarm validations pass.
---

**Steps:**

1. **Initialize Task:** Invoke the system shell (no specific LLM agent required; operate as the TopHat orchestrator).
2. **Metadata Extraction:** "Use the Linear MCP to fetch the full title and description of Linear Task ID `{{args[0]}}`."
3. **Instruction:** "Fetch Linear Task ID `{{args[0]}}`. Verify that the task status is set to 'Ready for PR' or that all mandatory downstream audits have been completed."
4. **Execution:** "Use the `run_command` tool to execute the GitHub CLI. Inject the fetched Linear Task Title into the command: `gh pr create --title '{{args[0]}}: [Fetched Title Here]' --body 'Automated PR generated and verified by Antigravity Review Swarm. Resolves {{args[0]}}.' --base main`"
5. **Post-Flight Automation:**
   - "Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Orchestrator'."
   - "Output the PR URL directly into the chat for final human sign-off."

---
description: Generates the final Pull Request, automates Linear task transitions, and physically synchronizes Context.md with the newly realized state.
---

**Steps:**

1. **Initialize Task:** Invoke the system shell (no specific LLM agent required; operate as the TopHat orchestrator).
2. **Metadata Extraction:** Use the Linear MCP to fetch the full title and description of Linear Task ID `{{args[0]}}`.
3. **Instruction:** Fetch Linear Task ID `{{args[0]}}`. Verify that the task status is set to 'Ready for PR' or that all mandatory downstream audits have been completed.
4. **GitHub Execution:** Use the `run_command` tool to execute the GitHub CLI. Inject the fetched Linear Task Title into the command: `gh pr create --title '{{args[0]}}: [Fetched Title Here]' --body 'Automated PR generated and verified by Antigravity Review Swarm. Resolves {{args[0]}}.' --base main`
5. **Linear Automation:** Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Orchestrator'. Post the GitHub PR URL as a comment on the task.
6. **Context Synchronization (Chained):** You must immediately execute the logic of the `/context-sync` workflow. Summarize the completed realization, downstream mandates, and any observed side-effects from this task. Use the `replace_file_content` tool to update the Agent Handoff Notes section in `Context.md`.
7. **Handoff Resolution:** Output the GitHub PR URL to the chat for final human sign-off. Then, output exactly: `[Next Action: /sprint-briefing]`. Do not append a hardcoded model recommendation; dynamically rely on the Global Orchestration Mandate.

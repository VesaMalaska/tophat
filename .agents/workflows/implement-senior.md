---
description: Backend/DB implementation pipeline with automated Git and Linear handoff.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-senior-dev`.
2. **Instruction:** "Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the task requirements. Focus strictly on server-authoritative logic, data mutations, and security boundaries."
3. **Execution:** "Checkout a new branch `feature/{{args[0]}}-backend-logic`. Implement the backend components, API endpoints, and type-safe payloads. Strictly enforce the specific active Backend/Data Skill appended to this task (e.g., ensuring exact compliance with the required database, ORM, or cloud service)."
4. **Post-Flight Automation:** "Once implementation is complete, execute the following sequentially:
   - Run `git add . && git commit -m 'feat(backend): {{args[0]}} implement server authority and logic'`
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Architecture'.
   - Use the Linear MCP to add a comment to Task `{{args[0]}}` containing your formatted Trace Validation Checklist and the final Git commit hash.
   - Output the final status confirmation for the Human Orchestrator."

---
description: Svelte 5 logic implementation pipeline with automated Git and Linear handoff.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-mid-dev`.
2. **Instruction:** "Use the Linear MCP to fetch Task ID {{args[0]}}. Read the task requirements. You are restricted to client-side Svelte 5 Runes and state transformations."
3. **Execution:** "Checkout a new branch `feature/{{args[0]}}-client-logic`. Implement the `$state()`, `$derived()`, and component boundaries. Enforce the Svelte 5 Kit Architecture Skill. Stop and throw an `[ESCALATION_TRIGGER]` if database access is required."
4. **Post-Flight Automation:** "Once implementation is complete, execute the following sequentially:
   - Run `git add . && git commit -m 'feat(client): {{args[0]}} implement svelte runes and state'`
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task {{args[0]}} to 'In Review: Architecture'.
   - Output the Trace Validation Checklist for the Human Orchestrator."

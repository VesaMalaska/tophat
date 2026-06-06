---
description: UI/Tailwind implementation pipeline with automated Git and Linear handoff.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-junior-dev`.
2. **Instruction:** "Use the Linear MCP to fetch Task ID {{args[0]}}. Read the explicit task requirements. Do not overstep into application logic."
3. **Execution:** "Checkout a new branch `feature/{{args[0]}}-static-ui`. Implement the structural markup and Tailwind semantic utility mapping as specified. Ensure strict compliance with the Tailwind Semantic UI Skill."
4. **Post-Flight Automation:** "Once implementation is complete, execute the following sequentially:
   - Run `git add . && git commit -m 'feat(ui): {{args[0]}} implement static components'`
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task {{args[0]}} to 'In Review: Architecture'.
   - Output the Trace Validation Checklist for the Human Orchestrator."

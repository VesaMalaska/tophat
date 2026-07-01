---
description: UI/Tailwind implementation pipeline with automated Git and Linear handoff.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-junior-dev`.
2. **Instruction:** "Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the explicit task requirements. Do not overstep into application logic or state management."
3. **Execution:** "Execute `git fetch origin main`. Then, attempt to execute `git checkout feature/{{args[0]}}-static-ui`. If the shell throws a fatal error indicating the branch does not exist, execute `git checkout -b feature/{{args[0]}}-static-ui origin/main`. Once your isolated branch is established, implement the structural markup and styling mapping as specified. Ensure strict compliance with the active UI/Styling Skill appended to this task (e.g., Tailwind, CSS Modules, or pure HTML/CSS constraints). If you encounter a missing schema, structural ambiguity, or scope violation during execution, immediately follow your `[BLOCKER_ENCOUNTERED]` or `[ESCALATION_TRIGGER]` rule: Transition the task to 'Blocked' via MCP, post a comment, push any WIP commits, and halt the workflow."
4. **Post-Flight Automation:** "Once implementation is complete, execute the following sequentially:
   - Run `git add .`
   - Run `git commit -m 'feat(ui): {{args[0]}} implement static components and styling'`
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Architecture'.
   - Use the Linear MCP to add a comment to Task `{{args[0]}}` containing your formatted Trace Validation Checklist and the final Git commit hash.
5. **Handoff Resolution:** "Output exactly: `[Next Action: /review-standard {{args[0]}}]`."

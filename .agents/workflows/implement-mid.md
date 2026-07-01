---
description: Frontend component logic and client-side reactive state implementation pipeline.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-mid-dev`.
2. **Instruction:** "Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the task requirements. You are restricted to client-side state transformations, component logic, and UI view layers."
3. **Execution:** "Execute `git fetch origin main`. Then, attempt to execute `git checkout feature/{{args[0]}}-client-logic`. If the shell throws a fatal error indicating the branch does not exist, execute `git checkout -b feature/{{args[0]}}-client-logic origin/main`. Once your isolated branch is established, implement the component boundaries and reactive state logic. Strictly enforce the active Frontend/UI Skill appended to this task (e.g., ensuring exact compliance with the required frontend framework and state management paradigms). Stop and throw an `[ESCALATION_TRIGGER]` if server or database access is required. Before writing implementation code, you must write a Vitest suite adhering to the vitest-tdd skill. Use the run_command tool to execute npx vitest run and observe the failures. Only once the tests are written should you implement the logic to turn the tests green. If you encounter a missing schema, structural ambiguity, or scope violation during execution, immediately follow your `[BLOCKER_ENCOUNTERED]` or `[ESCALATION_TRIGGER]` rule: Transition the task to 'Blocked' via MCP, post a comment, push any WIP commits, and halt the workflow."
4. **Post-Flight Automation:** "Once implementation is complete, execute the following sequentially:
   - Run `git add .`
   - Run `git commit -m 'feat(client): {{args[0]}} implement frontend logic and state'`
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Architecture'.
   - Use the Linear MCP to add a comment to Task `{{args[0]}}` containing your formatted Trace Validation Checklist and the final Git commit hash.
5. **Handoff Resolution:** "Output exactly: `[Next Action: /review-standard {{args[0]}}]`."

---
description: Secure data and server-authoritative logic implementation pipeline.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-senior-dev`.
2. **Instruction:** "Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the isolated task requirements. Focus strictly on server-authoritative logic, data mutations, database schemas, and privileged security boundaries."
3. **Execution:** "Execute `git fetch origin main`. Then, attempt to execute `git checkout feature/{{args[0]}}-backend-logic`. If the shell throws a fatal error indicating the branch does not exist, execute `git checkout -b feature/{{args[0]}}-backend-logic origin/main`. Once your isolated branch is established, implement the backend components, API endpoints, and type-safe payloads strictly mapped to the provided task specification. Before writing implementation code, you must write a Vitest suite adhering to the vitest-tdd skill. Use the `run_command` tool to execute npx vitest run and observe the failures. Only once the tests are written should you implement the logic to turn the tests green. If you encounter a missing schema, structural ambiguity, or scope violation during execution, immediately follow your `[BLOCKER_ENCOUNTERED]` or `[ESCALATION_TRIGGER]` rule: Transition the task to 'Blocked' via MCP, post a comment, push any WIP commits, and halt the workflow."
4. **Post-Flight Automation:** "Once implementation is complete, execute the following sequentially:
   - Run `git add .`
   - Run `git commit -m 'feat(backend): {{args[0]}} [brief, specific description of the implemented logic]'` (Ensure you replace the bracketed text with a dynamic summary of your exact code changes. Do NOT use a generic string).
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Architecture'.
   - Use the Linear MCP to add a comment to Task `{{args[0]}}` containing your formatted Trace Validation Checklist and the final Git commit hash.
   - **HUD Radar Broadcast:** Execute `npx tsx .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "senior" --sec "[yes or no]" --qa "[yes or no]" --status "In Review: Architecture" --next "[/review-critical {{args[0]}} OR /review-standard {{args[0]}} based on Topology]" --model "[Recommended Next Model]"` via `run_command` to instantly update the visual Orchestrator HUD.
5. **Handoff Resolution:** "Determine the correct validation pipeline by reading the 'Review Topology' value defined within the `[GLOBAL_CONSTRAINTS]` section of `Context.md`.
   - If the topology is 'Full Critical & Security Path', output exactly: `[Next Action: /review-critical {{args[0]}}]`.
   - If the topology is 'Standard Review Only', output exactly: `[Next Action: /review-standard {{args[0]}}]`."

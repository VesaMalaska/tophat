---
description: UI/Tailwind implementation pipeline with automated Git and Linear handoff.
---

**Tool & Shell Guardrails:**

- If Host OS is **Windows (PowerShell)**: Execution agents are strictly forbidden from using POSIX text utilities (`cat`, `grep`, `awk`, `sed`) via `run_command`. Use native IDE `view_file` for file inspection, and avoid unsupported flag extensions like `-A` on `findstr`.
- If Host OS is **macOS/Linux (Zsh/Bash)**: Standard POSIX command-line tools are permitted for file inspection.

**Steps:**

1. **Initialize Task:** Invoke `@agent-junior-dev`.
2. **Routing preflight:** Fetch the exact taskClassification JSON and run `node .agents/scripts/classify-task.ts` on stdin. Require ROUTING_VALID and devTier `junior`; halt on missing/contradictory/legacy routing. Read the shared clean-code contract below.

   **Instruction:** Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the explicit task requirements. Do not overstep into application logic or state management.
3. **Execution:** Execute `git fetch origin main`. Then, attempt to execute `git checkout feature/{{args[0]}}-static-ui`. If the shell throws a fatal error indicating the branch does not exist, execute `git checkout -b feature/{{args[0]}}-static-ui origin/main`. Once your isolated branch is established, implement the structural markup and styling mapping as specified. Ensure strict compliance with the active UI/Styling Skill appended to this task (e.g., Tailwind, CSS Modules, or pure HTML/CSS constraints). If you encounter a missing schema, structural ambiguity, or scope violation during execution, immediately follow your `[BLOCKER_ENCOUNTERED]` or `[ESCALATION_TRIGGER]` rule: Transition the task to 'Blocked' via MCP, post a comment, push any WIP commits, and halt the workflow.
4. **Post-Flight Automation:** Once implementation is complete, execute the following sequentially:
   - Run `git add .`
   - Run `git commit -m 'feat(ui): {{args[0]}} [brief, specific description of the markup/styling applied]'` (Ensure you replace the bracketed text with a dynamic summary of your exact code changes. Do NOT use a generic string).
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Architecture'.
   - Use the Linear MCP to add a comment to Task `{{args[0]}}` containing your formatted Trace Validation Checklist and the final Git commit hash.
   - **HUD Radar Broadcast:** Execute `node .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "junior" --routing-file "[Exact current task JSON path]" --status "In Review: Architecture" --next "/review-standard {{args[0]}}"` via `run_command` to instantly update the visual Orchestrator HUD.
5. **Handoff Resolution:** Output exactly: `[Next Action: /review-standard {{args[0]}}]`.

## Shared clean-code and evidence contract

Apply `.agents/docs/task-routing-and-qa.md`: smallest coherent change, meaningful names, understandable responsibility/contract boundaries, limited coupling and duplication, behavioral tests, and change locality. Justify a local refactor by the task requirement, correctness issue or concrete maintainability problem. Reject unrelated cleanup/speculative abstraction; TopHat imposes no universal size/complexity metric. Record the implementation session, exact candidate commit, task fingerprint and applied validation for the orchestrator's stage receipt. The developer cannot approve the same implementation through review/QA.

Finalize intended tracked Context/Strategy/HUD state before the final candidate is reviewed and QA-tested. A later commit invalidates that candidate's evidence. HUD updates during implementation remain state display, not approval.

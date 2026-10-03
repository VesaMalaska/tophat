---
description: Secure data and server-authoritative logic implementation pipeline.
---

**Tool & Shell Guardrails:**

- If Host OS is **Windows (PowerShell)**: Execution agents are strictly forbidden from using POSIX text utilities (`cat`, `grep`, `awk`, `sed`) via `run_command`. Use native IDE `view_file` for file inspection, and avoid unsupported flag extensions like `-A` on `findstr`.
- If Host OS is **macOS/Linux (Zsh/Bash)**: Standard POSIX command-line tools are permitted for file inspection.

**Steps:**

1. **Initialize Task:** Invoke `@agent-senior-dev`.
2. **Routing preflight:** Fetch the exact taskClassification JSON and run `node .agents/scripts/classify-task.ts` on stdin. Require ROUTING_VALID and devTier `senior`; halt on missing/contradictory/legacy routing. Read the shared clean-code contract below.

   **Instruction:** Use the Linear MCP to fetch Task ID `{{args[0]}}`. Read the isolated task requirements. Focus strictly on server-authoritative logic, data mutations, database schemas, and privileged security boundaries.
3. **Execution:** Execute `git fetch origin main`. Then, attempt to execute `git checkout feature/{{args[0]}}-backend-logic`. If the shell throws a fatal error indicating the branch does not exist, execute `git checkout -b feature/{{args[0]}}-backend-logic origin/main`. Once your isolated branch is established, implement the backend components, API endpoints, and type-safe payloads strictly mapped to the provided task specification. Before implementation, write focused failing tests under `tdd-workflow` using the project's declared Node-compatible test runner and pnpm script. Select `vitest-tdd` only if the project uses Vitest. Observe the failure, implement the behavior, and verify the passing tests. If you encounter a missing schema, structural ambiguity, or scope violation during execution, immediately follow your `[BLOCKER_ENCOUNTERED]` or `[ESCALATION_TRIGGER]` rule: Transition the task to 'Blocked' via MCP, post a comment, push any WIP commits, and halt the workflow.
4. **Post-Flight Automation:** Once implementation is complete, execute the following sequentially:
   - Run `git add .`
   - Run `git commit -m 'feat(backend): {{args[0]}} [brief, specific description of the implemented logic]'` (Ensure you replace the bracketed text with a dynamic summary of your exact code changes. Do NOT use a generic string).
   - Run `git push -u origin HEAD`
   - Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Architecture'.
   - Use the Linear MCP to add a comment to Task `{{args[0]}}` containing your formatted Trace Validation Checklist and the final Git commit hash.
   - **HUD Radar Broadcast:** Execute `node .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "senior" --routing-file "[Exact current task JSON path]" --status "In Review: Architecture" --next "/review-critical {{args[0]}}"` via `run_command` to instantly update the visual Orchestrator HUD.
5. **Handoff Resolution:** Output exactly: `[Next Action: /review-critical {{args[0]}}]`. Security follows approved critical review. No topology override.

## Shared clean-code and evidence contract

Apply `.agents/docs/task-routing-and-qa.md`: smallest coherent change, meaningful names, understandable responsibility/contract boundaries, limited coupling and duplication, behavioral tests, and change locality. Justify a local refactor by the task requirement, correctness issue or concrete maintainability problem. Reject unrelated cleanup/speculative abstraction; TopHat imposes no universal size/complexity metric. Record the implementation session, exact candidate commit, task fingerprint and applied validation for the orchestrator's stage receipt. The developer cannot approve the same implementation through review/QA.

Finalize intended tracked Context/Strategy/HUD state before the final candidate is reviewed and QA-tested. A later commit invalidates that candidate's evidence. HUD updates during implementation remain state display, not approval.

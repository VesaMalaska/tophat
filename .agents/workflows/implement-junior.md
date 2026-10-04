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
3. **Execution:** Read the explicit host Git policy and `.agents/docs/git-safety.md`. Run `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` before each fetch/create-branch/switch action; require GIT_PREFLIGHT_READY. Inspect exact branch existence before choosing create or resume, use the declared verified base object and verify resulting branch/HEAD. Failed checkout halts without branch creation. Implement the structural markup and styling mapping as specified. Ensure strict compliance with the active UI/Styling Skill appended to this task (e.g., Tailwind, CSS Modules, or pure HTML/CSS constraints). If you encounter a missing schema, structural ambiguity, or scope violation during execution, immediately follow your `[BLOCKER_ENCOUNTERED]` or `[ESCALATION_TRIGGER]` rule: Transition the task to 'Blocked' via MCP, post a comment, preserve current files/index, report the blocker without implicit WIP publication, and halt the workflow.
4. **Candidate handoff:** Finalize intended Context/Strategy/HUD changes before sealing review/QA. Review exact intended file bytes/modes, preflight stage and stage only literal exact paths. Reinspect the complete index and preflight commit; check the command result, commit parents, full delta and clean poststate. Return the exact candidate/session/task fingerprint and validation to the orchestrator for `/review-standard`. No automatic push or WIP commit on failure; separately authorized push/publication uses the shared Git contract and applicable evidence gates. Apply only the authorized Linear handoff after its required outcomes succeed.

5. **Handoff Resolution:** Output exactly: `[Next Action: /review-standard {{args[0]}}]`.

## Shared clean-code and evidence contract

Apply `.agents/docs/task-routing-and-qa.md`: smallest coherent change, meaningful names, understandable responsibility/contract boundaries, limited coupling and duplication, behavioral tests, and change locality. Justify a local refactor by the task requirement, correctness issue or concrete maintainability problem. Reject unrelated cleanup/speculative abstraction; TopHat imposes no universal size/complexity metric. Record the implementation session, exact candidate commit, task fingerprint and applied validation for the orchestrator's stage receipt. The developer cannot approve the same implementation through review/QA.

Finalize intended tracked Context/Strategy/HUD state before the final candidate is reviewed and QA-tested. A later commit invalidates that candidate's evidence. HUD updates during implementation remain state display, not approval.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

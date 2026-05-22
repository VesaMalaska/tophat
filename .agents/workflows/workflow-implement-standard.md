---
description: Standard execution pipeline for standard UI and non-critical stateless logic.
---

**Steps:**
1. **Implementation:** Invoke the assigned dev agent (`@agent-senior-dev`, `@agent-mid-dev`, or `@agent-junior-dev`) with the active Linear task ID. Wait for execution and file writing to complete.
2. **Code Review:** Invoke `@agent-review-standard`. 
   * **Instruction:** "Validate the implementation against the task spec AND the project documentation independently. Output a strict APPROVED or CHANGES_REQUIRED verdict."
   * **Wait for verdict.** If `CHANGES_REQUIRED`, loop back to step 1 and instruct the dev agent to fix the findings.
3. **Conditional Checks:** If the task routing fields mandate Security or QA, the human orchestrator must manually invoke `/workflow-security-review` or `@agent-qa` before proceeding.
4. **Synchronization:** Upon final approval, proceed to `/workflow-context-sync`.
---
description: Mandatory execution pipeline for load-bearing system code (Auth, Payments, RLS logic, SQLite IPC caching).
---

**Steps:**
1. **Implementation:** Invoke `@agent-senior-dev` with the Linear task ID. Wait for execution and file writing to complete.
2. **Adversarial Review:** Invoke `@agent-review-critical`. 
   * **Instruction:** "Assume the implementation contains hidden flaws. Cross-check the spec against the PRD. Validate transaction atomicity and server-side authority."
   * **Wait for `APPROVED` verdict.** (If `CHANGES_REQUIRED`, loop back to step 1).
3. **Security Audit:** Invoke `@agent-security-auditor`.
   * **Instruction:** "Perform Threat Model Assessment. Verify RLS policies, input sanitization, and server-side privilege isolation."
   * **Wait for `APPROVED` verdict.**
4. **QA/E2E Validation:** Invoke `@agent-qa`.
   * **Instruction:** "Validate acceptance criteria across edge cases. Generate robust Playwright E2E tests for this flow."
5. **Synchronization:** Proceed to `/workflow-context-sync`.
---
description: Independent read-only security inspection of the exact classified candidate.
---

1. The orchestrator fetches the taskClassification and current candidate/stage evidence. Run `node .agents/scripts/classify-task.ts` with the exact JSON on stdin; require ROUTING_VALID and that `security` belongs to requiredStages. A missing legacy record, stale authority or wrong route halts. Standard and critical are alternative reviews.
2. Invoke `@agent-security-auditor` with the bounded task/source extracts, applicable skills, exact candidate commit and prior findings. Inspect only relevant code and evidence. Apply the shared understandability/change-locality checklist in `.agents/docs/task-routing-and-qa.md`. Do not change product code, tests, configuration, authority or private state; do not run Git mutation, install dependencies, or implement fixes.
3. Return criterion-linked findings and `APPROVED`, `CHANGES_REQUIRED`, or `BLOCKED`. Re-check prior findings in this role's domain after developer remediation. Do not substitute for another required role's validation or approve your own remediation.
4. The separate orchestrator records the latest stage receipt (sequence, taskFingerprint, inspectedCommit, role/session, verdict, findings) and verifies surviving diffs/observed operations before applying Linear/HUD state. No review agent HUD shell exception is granted.
5. Derive the next stage with `nextStage` from the validated route. Approved critical always leads to `/security-review`; approved standard/security leads to `/qa-validate` if methods are required, otherwise publication readiness. CHANGES_REQUIRED leads to `/remediate-task`; BLOCKED requires human direction. Status labels alone do not authorize publication.

A subsequent code correction requires a new developer commit and a fresh derived review route, then security/QA where required. Actual independence and gate invocation are supervised instructions; no physical IDE prevention is claimed.

Git policy: this workflow authorizes no Git mutation. Any later Git action belongs to a separately authorized execution workflow under the shared Git safety contract; this does not grant command authority to a read-only role.

---
description: Separate assigned-tier developer remediation followed by a fresh derived review route.
---

1. Fetch the exact taskClassification and latest review/security/QA findings. Run `node .agents/scripts/classify-task.ts` on stdin; require ROUTING_VALID. Missing/stale/conflicting task metadata halts for a human-reviewed amendment.
2. Invoke the assigned developer tier on the existing expected feature branch. The reviewer or QA role does not implement the fix. Address the recorded defect within task scope; do not add features, weaken checks, rewrite authority or perform unrelated cleanup.
3. Apply the shared clean-code contract in `.agents/docs/task-routing-and-qa.md`. Use the project's declared relevant tests and runner-neutral TDD where applicable. Preserve failure evidence.
4. Product-code remediation requires a new developer commit. Inspect command outcomes and report the exact SHA/session/task fingerprint to the orchestrator. No destructive recovery is authorized. Shared Git safety is defined in `.agents/docs/git-safety.md`.
5. Finalize intended tracked private-state changes before the final candidate review/QA. The orchestrator records a new implementation receipt and returns to the derived standard or critical review. Critical then requires security. Every QA-required task receives fresh independent QA; old approval cannot carry to the new commit.
6. Environment-only blockers may be resolved through separately authorized environment work, followed by a fresh evidence attempt; do not create an empty product commit merely to imitate remediation. Reviewers can review a developer's fix again but cannot approve their own code changes.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

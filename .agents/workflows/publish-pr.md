---
description: Publish the exact evidenced feature head for human review after a read-only readiness check.
---

1. Fetch the exact taskClassification, expected feature branch, explicit human project base policy, applicable latest stage records, task validation report/log and QA attempt evidence or justified QA_NOT_APPLICABLE record. Do not infer approval from Linear status or assume a host's main branch. This TopHat implementation PR targets development.
2. Run `node .agents/scripts/validate-qa-evidence.ts` with operation publish and the exact closed request from `.agents/docs/task-routing-and-qa.md` on stdin. Require PUBLICATION_READY, approvalAllowed true and the candidate SHA. On DENIED, halt visibly with the issues; do not weaken, skip, repair or rewrite receipts.
3. Immediately before publication, repeat the read-only check. The orchestrator opens the PR for that exact feature head and explicit base, with a reviewable description and evidence. Inspect the command/API outcome and verify the created PR head/base match the checked candidate/policy using the exported `verifyPublishedPR` invariant. Race or failure halts; no destructive recovery is authorized. Shared mutation preflight belongs to Slice 8.
4. The orchestrator may separately post the PR URL and apply the authorized Linear transition. Do not write or commit tracked Context/Strategy/HUD after QA. State synchronization needed for the candidate happens before QA; archival or later state commits are new candidates requiring fresh applicable evidence.
5. Return the PR URL for independent review and separate explicit human merge approval. This workflow creates the PR; it does not authorize or execute a merge.

Helpers validate supplied evidence consistency when invoked. They do not intercept arbitrary GitHub, Git, terminal or agent actions, authenticate reviewers, or prove actual human consent.

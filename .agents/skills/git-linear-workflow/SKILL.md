---
name: git-linear-workflow
description: Checked Git identity, exact staging, bounded task handoff and separately authorized publication.
---

# Git and Linear lifecycle

Use `.agents/docs/git-safety.md`. Before each authorized Git mutation, the execution orchestrator runs `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed JSON request on stdin and requires GIT_PREFLIGHT_READY / ALLOW. The helper is read-only; it does not intercept another command or authenticate approval. Read-only roles acquire no Git mutation authority.

1. Read the exact task, prerequisites and human/project Git policy. Require prerequisite completion and integration into the declared base; an open prerequisite PR is a blocker. Do not infer dependency integration from a branch-name substring or a Linear label. For this TopHat repository use development, with main reserved for release. Host base/remote/branch policy is explicit.
2. Inspect clean attached starting HEAD and branch. Preflight fetch, perform the explicit fetch sequentially, inspect its result and exact fetched base object. Inspect exact local target branch existence before choosing create-branch or switch. Require matching preflight before that action and verify resulting branch/HEAD. Checkout failure is a blocker, never permission to create or overwrite a branch.
3. Implement only task scope. Finalize intended tracked private-state updates before candidate review/QA. Review the complete exact file plan and content/mode digests. Preflight stage, stage only literal exact paths, verify the whole index; preflight commit, inspect its result and verify parents, committed delta and clean resulting state. Use Conventional Commits with the task ID. No index-wide staging or automatic inclusion of unreviewed work.
4. Return exact candidate, validation and implementation receipt to the orchestrator for the derived review/security/QA route. A developer commit is not publication approval. A separately authorized push requires clean exact-head preflight, explicit local/destination refs, checked outcome and remote-ref verification. A PR additionally requires the existing publication evidence gate. Preserve distinct commit, push and PR statuses in the task report.
5. Apply only explicitly authorized Linear comments/transitions after their prerequisites succeed. A failed Git action cannot be described as a pushed candidate. State mirrors are not approval receipts.
6. On blocker/escalation preserve actual files/index/history. Report the failed step and next human decision; do not automatically commit or push WIP, stash, clean, reset, discard, rewrite history or delete a branch. Separate human-authorized prerequisite/remediation work begins with fresh preflight and applicable evidence.

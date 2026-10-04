# Slice 8 evidence — Git safety

Baseline: development `30bfe4051372c97796ce773da3542cbdf083ff8e`, tree `f437c025e5de6724ff52d232eab91331a06608da`. Geogy approved the five brief decisions; Vesku separately authorized implementation. The implementation remains a PR awaiting independent review and separate merge approval.

## Acceptance mapping

- Criterion 21: git-preflight.ts requires exact root/attached HEAD/branch, applicable clean or byte/mode-bound intended state, exact index, supported operations and remote identity. Fixtures execute normal fetch/branch/stage/commit/push, genuine failed fetch/checkout/commit/push and complete merge-conflict reconciliation with checked parents/delta. Hidden submodule drift, skip-worktree/assume-unchanged, partial staging and unclassified files deny. Destructive recovery and broad staging are removed from active mutation instructions.
- Criteria 17, 19: publication retains current Slice 6/7 exact-candidate evidence; candidate-changing Git actions invalidate prior evidence and require the derived independent review/security/QA route. No post-QA private-state commit chain or reviewer remediation exception.
- Criteria 24–28: hook/exclude integration and external-tool manual detachment use the shared profile while preserving original ownership/application validators. Attachment fixtures use explicit synthetic hook requests, classified installed paths and prior metadata. Native hook still denies a genuine failing script before HEAD advances.
- Criteria 20, 29: helper is read-only; sequential mutation/custody are instructed orchestrator responsibilities. Read-only PM/writer/review roles gain no command or Git exception. Boundary registry states races, invoked checks and observed postconditions distinctly.

## Verification

Final `pnpm test:tophat`: 262 passed, zero failed, zero skipped (221 previous + 41 new). The initial full run passed 256 before six final edge fixtures were added. New evidence includes a real 10-second subprocess timeout and output cap, SHA-256 Git objects, linked worktree paths, binary/mode/delete/rename changes, exact conflict/index identity, literal pathspec safety and strict JSON CLI refusal. Working/staged `git diff --check` and standard patch reverse-application verification are required before publication.

The machine-checked git-adoption.json covers every workflow, Git skill, installer and manual detachment. Static instruction tests are adoption evidence, not proof that an agent obeyed them. Source tests and docs describe the exact closed request with operation profiles and external evidence custody.

## Limits

Linux Node 24 and local bare-remote fixtures; no native Windows/macOS, live GitHub failure simulation or integrated release certification. Windows-shaped paths reject ambiguities rather than converting backslashes silently. Git commands are bounded, not an OS/process-tree sandbox. No reliable IDE role/command interception, universal Git wrapper, transaction lock, remote freshness guarantee or authenticated approval identity. Pre/post verification cannot prove absence of unreported reverted activity. No helper fetches or mutates; existing installer alone writes its narrowly authorized hook after internal preflight. A file may satisfy the 32 MiB inventory bound yet exceed the stricter 16 MiB captured blob bound, which denies visibly.

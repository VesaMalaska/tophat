# Shared Git safety contract — Slice 8

Git preflight is a read-only observation required before each authorized mutation. It does not execute the next action, authenticate consent, lock other processes or intercept IDE/terminal/GitHub actions. The execution orchestrator owns sequential checked commands, external evidence custody and postcondition inspection. PM, writer, reviewers, security and QA gain no Git mutation authority. Native pre-commit validation remains explicitly installed, per clone and bypassable; Antigravity PreToolUse remains unverified.

## Request and observation

Run `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with one closed JSON request on stdin. Require exit zero, decision ALLOW and status GIT_PREFLIGHT_READY. All fields are required, including nulls. The helper works before host configuration and from an external source during detachment. Node >=24 is required for these TypeScript tools.

```json
{
  "schemaVersion": 1,
  "operation": "switch",
  "repositoryRoot": "/absolute/host/root",
  "workflow": "task-42-attempt-1",
  "expectedBranch": "development",
  "expectedHead": "1111111111111111111111111111111111111111",
  "expectedIndexFingerprint": "2222222222222222222222222222222222222222222222222222222222222222",
  "intended": [],
  "remote": null,
  "target": {"branch": "feature/task-42", "commit": "3333333333333333333333333333333333333333"},
  "conflict": null,
  "integration": null
}
```

The values above illustrate shape, not valid approvals or existing objects. `expectedBranch` is the branch before the action; `target.branch` is the exact branch afterwards. Human/project policy supplies these names and objects. For TopHat, base is development, main reserved for release. Do not infer host branch conventions from TopHat. Inspect exact branch existence before selecting create-branch or switch. Failure never authorizes the alternate action.

The exported `inspectGitState(root, extraPaths?)` returns the actual root identity, repository object format, attached branch/HEAD, full index entries/digest, NUL-safe status, complete changed-path inventory, exact HEAD/current/index file bytes/modes, active operation markers, merge parents and canonical fingerprint. It is read-only. The separately authorized orchestrator can call it from a Node module and save stdout externally; the preflight report also returns this state. Do not modify fingerprints or fabricate missing observations. There is no CLI arbitrary-command or reader override. GitReader injection exists only for imported test code.

SHA-1 and SHA-256 object formats are validated according to Git, not guessed from input. Canonical SHA-256 request/state/index fingerprints bind typed data. Report timestamps and prose do not define authority. Duplicate JSON keys, unknown/missing fields, unsafe paths, malformed IDs, unsupported/incomplete Git state and failed inspections deny. Skip-worktree and assume-unchanged index flags deny because they can hide drift. Root must be the actual worktree root; unborn/detached HEAD and bare repositories deny. Linked worktrees use Git-resolved metadata.

## Operation profiles

| Operation | Required profile and next action |
|---|---|
| fetch | Clean state; remote and target. Perform explicit fetch of nominated branch, check exit and exact resulting fetched base object. Helper does no network refresh. |
| switch | Clean state; target exists at exact commit. Switch exact branch, verify resulting branch/HEAD and preserved clean state. |
| create-branch | Clean state; target absent and starting commit exists. Create exact branch from verified base object, verify result. Never overwrite. |
| stage | Exact intended changes and current index fingerprint. Ordinary index content may be unchanged HEAD or already exact intended bytes; partial staging denies. Stage only literal reviewed paths and inspect entire index. |
| commit | Exact complete intended staged delta, current index fingerprint, matching worktree, no unexplained untracked/unstaged state. Inspect exit, parents and complete resulting commit delta. |
| push | Clean exact HEAD; remote destination equals exact feature branch. Explicit nonforce local/destination ref; inspect outcome and read exact remote ref. |
| publish-pr | Clean exact HEAD; remote destination declares explicit PR base. Also require fresh existing task/document publication readiness. Verify returned repository/head/base. |
| resolve-conflict | Exact already identified merge-conflict snapshot and explicit human authorization. No fetch, switch, merge initiation or recovery. |
| git-integration | Explicit metadata plan plus exact intended host changes/classified untracked inputs; original index preserved. Retain existing ownership/hook/exclusion checks. |

For operations without intended file changes use `intended: []`. Stage/commit require a nonempty exact plan and `expectedIndexFingerprint`; other profiles may also bind the observed index fingerprint. Unused remote, target, conflict and integration must be null. `target` is mandatory only for fetch/switch/create; `remote` only for fetch/push/publish. `conflict` is allowed only for resolve-conflict and its stage/commit sequence; `integration` only for git-integration.

An intended file is exactly `{path,before,after}`. Each nonnull bytes record is `{sha256,mode}`, where mode is Git regular-file `100644` or `100755`. `before` is the HEAD bytes/mode (null for a new file); `after` is exact approved worktree/staged candidate bytes/mode (null for deletion). A rename declares both endpoints; all changed paths must be explained. Installation may also nominate unchanged or ignored input files so their current bytes are checked. This does not authorize arbitrary ignored-tree scans. A changed byte, mode, index, HEAD or branch invalidates a plan.

Example stage/commit plan field:

```json
"intended": [{
  "path": "docs/usage.md",
  "before": {"sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "mode": "100644"},
  "after": {"sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "mode": "100644"}
}]
```

Paths are canonical relative POSIX file paths. Reject ambiguous backslashes/drive paths, traversal, control characters, symlinks/submodule mutation, case-fold collisions, directories and .git targets. Git index/diff data uses NUL-safe formats. Literal Git pathspec handling plus `--` prevents pathspec expansion; a file literally named `:(glob)example.txt` is a literal file, never a glob permission. Use `git --literal-pathspecs add -- <exact-file> ...` with separately quoted argv, never a shell interpolation of raw paths. Broad staging, automatic commit inclusion and validation-hook bypass are prohibited.

Remote is exactly `{name,fetchUrlSha256,pushUrlSha256,destinationBranch}`. Hash the actual single effective fetch and push URL values returned by Git. Multiple destinations or changed URL identity deny. Store credentials securely outside public evidence; the helper prints no raw remote URL or stderr. It does not contact the remote; a configured or cached ref is not freshness proof. Fetch's target commit is the nominated expected resulting base object. Afterwards resolve the fetched ref and verify it equals that object. Push can be separately authorized before PR creation; failed review still forbids PR publication.

## Conflict exception

Conflict authorization is `{signal:"APPROVED",human,locator,baseline}` where baseline is the exact `inspectGitState` snapshot, with one MERGE_HEAD, the complete unmerged index and incoming staged delta. The resolver edits only conflict paths; unstaged/untracked unrelated baseline work is denied. The initial resolve-conflict preflight must match the snapshot exactly.

After editing, preflight stage uses the same conflict authorization and complete intended merge delta. It permits the original conflict index entries, demands unchanged nonconflict index/files and binds resolved current bytes. Stage only the nominated resolved conflict paths. For commit, use a fresh index fingerprint, zero unmerged entries and the same baseline authorization; all incoming nonconflict entries must remain identical. Inspect both parent identities and full merge delta after commit. Octopus merge, rebase, cherry-pick, revert, sequencer and ambiguous semantic recovery are not this automatic path. Failed checks preserve actual merge state without abort/rollback.

## Hook and exclusion integration

Integration is exactly `{kind:"hook"|"exclude",before,after,signal:"APPROVED",human,locator}`. `before` and `after` use the same nullable bytes/mode records, but bind Git metadata rather than HEAD. Destination comes from `git rev-parse --git-path hooks/pre-commit` or `info/exclude`, not an arbitrary input path. Existing hooksPath is denied for hook integration; shared/manual integration needs separate human work. Existing prior bytes must match immediately before the action. Preflight only binds the declared after-state: the orchestrator/installer must compare actual after-state to it.

The installer takes its exact git-integration request on stdin (or its typed second argument). Missing request denies before writing/chmod. It requires the after digest to equal the versioned native hook and executable mode; it invokes gitPreflight internally immediately before the existing exclusive write/chmod. Existing hook conflicts and configured hooksPath still refuse unchanged. Attachment supplies the actual approved current host files and ignored/classified input paths through this narrow request; it cannot use a generic dirty-state bypass.

Append only the approved local/private exclusion block while preserving host rules. Detachment removes only the exact confirmed TopHat-only hook/block and uses pinned external tooling. No implicit untracking, product deletion or history/index change. Keep the attachment/detachment approved-plan, ownership and preservation validators: preflight does not replace them. Partial application is visible and preserved.

## Sequential actions and postconditions

Before each action re-run the exact preflight against freshly observed state. Execute one explicit action, capture its exit/signal/stdout/stderr, and inspect its postcondition before any next mutation. Orchestrator evidence lives externally. Helpers never record their own receipts. ALLOW is an observation, not a reusable permit. Concurrency can still alter state between check/action; no atomicity or remote lock is claimed.

Use `verifyBranchResult`, `verifyCommitResult` and `verifyRemoteResult` for their stated invariants, or perform the equivalent explicit checks for stage/fetch/integration/API results. A changed candidate requires fresh applicable review/security/QA/document readiness. No Context/HUD commit after seal without a new candidate. Old QA remains historical.

PR creation requires the existing PUBLICATION_READY or explicit DOCUMENTATION_READY gate, repeated with preflight immediately before side effect. Verify exact PR repository, head and base. PR workflow does not merge. For a separately human-approved merge, inspect reviewed head and current base, guard expected head through the API where available, inspect merge result and resulting branch/tree/PR merged status. Base movement requires delta/evidence review. No automatic release to main.

On failure stop, preserve actual files/index/history/operation state, record last successful step and failed action/postcheck, and request the specific human decision. No autonomous retry, branch creation fallback, stash, reset, clean, force push, operation abort, branch deletion, discarded work or history rewrite. Explicit destructive recovery is separate concrete human-directed work, outside this slice's automated path. Unavailable poststate is POSTCONDITION_UNVERIFIED, never success.

## Bounds and evidence limits

Read-only Git commands use 10-second timeout and 16 MiB captured output cap, no shell and optional locks disabled. Request is at most 1 MiB. Inventories cap at 16,384 files, 32 MiB per required file and 128 MiB aggregate. Individual captured blob output is also subject to the stricter 16 MiB command bound. Exceedance denies; no truncated allow. Untracked/mutation paths with non-UTF-8/control-character names deny conservatively. This is not an OS sandbox, process-tree memory isolation, network permission gate, complete hidden-action proof or read sandbox. State fingerprints are consistency evidence, not cryptographic human identity or authenticated execution history.

`git-adoption.json` classifies every workflow plus Git skill, installer and manual detachment. Contract tests catch absent adoption and active unsafe commands. Static instruction coverage does not prove runtime obedience. Linux fixtures and syntactic Windows-path cases do not certify native Windows/macOS behavior; host Git mode behavior and unsupported state must deny visibly.

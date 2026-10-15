# Antigravity hook transport candidate

Status: **COMPATIBILITY_PENDING — cooperative 1.0 candidate; production-adapter live verification and review still required.**

**Current contract: supervised and cooperative.** The Human Orchestrator accepts reliance on agent cooperation and human supervision for TopHat 1.0; the revised contract received architectural approval. The multi-handler approval/acquisition sequence remains rejected. The new single-handler force_ask mapping is an unreserved approval guardrail, not that rejected reservation route. Controlled execution and isolation stay deferred to 2.0/CLI architecture. Historical strict proposals and probe procedures below are audit records, not current qualification instructions.

TopHat is a reusable developer tool. Hook code, fixtures and documentation use generic host names and paths; they must not depend on a maintainer's company, consumer project or local account.

## Bootstrap and selected root

The workspace-local adapter uses Node >=24 directly, with no pnpm/tsx hook bootstrap or dependency installation. This candidate config uses `node ./scripts/antigravity-hook.ts` from the customization directory. A physical diagnostic probe on Antigravity 2.19.1 observed cwd at the workspace customization directory and successful absolute and relative Node/CJS script launches. This verifies the diagnostic launch convention on that installation, not the production TypeScript adapter or every IDE. A doubled resource path supports a resolution-base diagnosis but does not alone establish process cwd.

The module location identifies the installed host. Mounted directories corroborate it regardless of order; a parent-mounted directory may contain that exact installation. Write targets must stay in that host, without symlinks or traversal; a nested installation requires its own adapter. Config and Git operations receive this root instead of hook cwd. Policy evaluators receive original tool arguments. The lock-input projection described below removes only two IDE presentation fields. Static imports do not execute the policy evaluators' CLI entry points.

## Routing and output

The enabled context-io-gate uses one pre-write handler. It validates the installed root and target, evaluates the unchanged protected-write policy, returns any denial, then runs the unchanged framework/configuration check before prompting or acquisition. A policy ask becomes force_ask at the transport boundary. That path is supervised and unreserved: no Git prerequisite, no acquisition and no after-approval handler. Invalid configuration still denies. Non-prompted allowed writes acquire the existing tophat reservation and require an initialized host Git worktree; the adapter never initializes Git.

Post-write evaluates the same protected-write rule from the original native tool arguments. This evaluator is independent of live target/configuration state. An ask identifies the unreserved path and returns `{}` successfully without invoking the backend. It never suppresses LOCK_OWNER_MISMATCH or LOCK_RELEASE_FAILED: ordinary reserved writes still use exact operation-owner release, and real failures remain stderr diagnostics with a nonzero exit. Post payload fidelity remains required. Malformed or contradictory tool identities are not invented or repaired.

The enabled macro-reset-gate distinguishes closed exploration/known read-only validators for non-applicability. Other valid host run_command calls return allow with internal status UNMANAGED_COMMAND. This is explicit absence of automatic macro coverage, not a claim that arbitrary commands are read-only or safe. Shell operators, script bodies, pnpm names and undocumented workflow/environment fields never establish global-pivot ownership. Pre-Git commands do not touch the lock backend. Malformed payloads or invalid selected-host cwd still deny. Post-command returns `{}` for valid unmanaged commands without acquisition/release.

The CLI emits only decision/reason for pre responses and `{}` for post responses; internal evaluator statuses remain available to tests. Existing lock/policy implementations remain unchanged. No owner canonicalization, cross-type exclusion, TTL, Stop cleanup or recovery is added. Missing post events can leave ordinary reservations requiring human inspection; never delete a lock solely by PID or swallow ownership errors.

### IDE presentation fields and reservation identity

A physical diagnostic on 2026-10-15 captured an ordinary native write whose post payload added `toolAction` and `toolSummary` inside `toolCall.args`. The pre handler acquired a reservation; the unchanged backend rejected release with `LOCK_OWNER_MISMATCH`. Removing those two added fields reproduced the exact pre owner hash. The hook process used Node 26.10.0 with the customization directory as cwd. This observation applies to that recorded installation; its current IDE version was not captured in the bundle.

For acquisition and release only, the adapter removes exactly those two top-level argument fields before calling the existing backend. All other arguments, their ordering, tool identity and conversation identity remain intact. Policy checks receive the original input. Unknown fields remain significant; changed content, target, operation flags or identity still prevent release. The backend itself is unchanged. This is a transport projection, not general JSON sorting, owner substitution, stale-lock cleanup or error suppression.

Regression subprocesses exercise metadata addition, changes and removal for all three supported native write tools. A corrected unchanged-production live write and release still require physical verification; the diagnostic recorder is not a production qualification configuration. Previously collected command, denial and supervised-write evidence does not establish this corrected ordinary-write release.

### Human supervision

A supported transport requests human review for approval-required protected-document writes. TopHat 1.0 promises no universal mutation interception, post-approval freshness or automatic reservation coverage for prompted writes. While approval waits, avoid editing the target, changing branch/configuration or permitting another session to mutate related state. If state changes, cancel and propose again. This is instructed workflow discipline, not race prevention.

Terminal commands and other mutation surfaces can bypass native-file guardrails. For workspace initialization and architecture pivots, the human pauses concurrent mutating sessions and coordinates the operation; no automatic global macro lock is claimed. Native Git validation remains a separate commit boundary. Catalog equality remains mandatory; cooperative operation is not permission to disable hooks or accept altered pinned resources.

## Current qualification requirements

The revised candidate needs one disposable production-adapter session on the declared IDE/version: ordinary exploration/unmanaged command execution before Git, a denied native write, a prompted write rejected and then approved without a reservation or release error, and an ordinary reserved native write with exact-owner post release. Record exact installed-resource hashes, original payloads, runtime/cwd and independent target/lock evidence. Diagnostic prompt observations do not substitute for this candidate's execution. Do not broaden file grants or change production-host files for the test.

Subprocess tests verify policy/configuration ordering, every supported prompted-tool shape, unreserved post behavior despite configuration changes, preservation of another call's reservation, ordinary release errors, command non-applicability and catalog tamper rejection. They do not prove cached-grant bypass, human authentication, arbitrary tools, multi-root IDE behavior or interrupted-operation recovery. Qualify additional host claims separately. No further rounds of the rejected handler sequence are required.

## Packaging and verification

The catalog explicitly includes the adapter and this support document, then follows its imports. Strict source/installed equality remains mandatory; a disabled hook, changed adapter or omitted resource is invalid against the reviewed source. Apply only exact reviewed TopHat-owned infrastructure under a new pin, retaining custom host resources and ownership history. This is not permission to initialize a host Git repository, approve a product draft or change host product files.

Automated adapter tests execute real Node subprocesses and existing evaluator calls in disposable hosts, including paths with spaces. They observe policy-before-lock behavior, exact owner preservation, root selection, pre-Git reads, malformed input, post failure and catalog tamper rejection. They are not evidence of physical IDE interception.

Before merge or host cutover, complete the current qualification requirements above and independent implementation review. No positive macro discriminator is required for the explicitly unmanaged command path, but workflow argument transport and existing command prerequisites remain separate checks. Never treat an agent declining to make a call as hook enforcement. Unsupported error/interruption/multi-root cases must not be advertised as qualified.

Concurrency follow-ups are separate: cross-type mutual exclusion, canonical owner identity, interrupted-operation recovery and macro transaction lifetime. No consumer-project acceptance or release is claimed here.

## Disposable live probe

Run `node .agents/tests/antigravity-hook-probe.mjs` from the source checkout. It creates a separate no-Git workspace and external evidence directory, prints their paths and the hooks SHA-256, and retains the exact diagnostic config. Open only that returned workspace in the declared IDE, launched with the intended Node environment. The synthetic diagnostic hooks are not a production installation or a catalog-valid TopHat replacement.

Request actual agent calls for ls, an allow-sentinel.txt write, a deny-sentinel.txt write, a force-ask-sentinel.txt write and `printf TOPHAT_DENY`. Initially reject the approval request. Independently check which actions occurred. Inspect trace.jsonl for exact raw payload, cwd, execPath, Node version, emitted response and post events; an agent choosing not to call a tool is inconclusive. Inputs must be synthetic. Only presence of the legacy environment variable is captured, not its value or the process environment.

Repeat using `node .agents/tests/antigravity-hook-probe.mjs --base <returned-base> --relative`, reload customizations and capture the same observations. The generator only accepts its marked disposable base and retains config history. Repeat with nested target cwd, paths with spaces and multiple workspace mounts. Separate fixtures test cached approval, timeout/crash/bad-output and a Git-backed candidate installation. Keep failed traces. Physical IDE experiments are executed by the Human Orchestrator; implementation-environment subprocesses alone cannot establish interception.

## Historical diagnostic evidence and superseded strict proposals

The remainder preserves observations and rejected/conditional proposals from the earlier strict contract. Statements requiring a post-approval reservation, a positive macro discriminator for all commands, or excluding the integration solely for lack of isolation are historical dispositions superseded by the current cooperative scope. Actual failed test outcomes remain unchanged. Do not follow the old sequence instructions as current next steps.

## Observed diagnostic evidence, 2026-10-07

The Human Orchestrator supplied 18 raw trace records, two exact hook configurations with matching SHA-256 digests, independent sentinel listings and UI outcomes from Antigravity 2.19.1 on Linux with Node 26.10.0. Both absolute and relative launch rounds allowed ls and the control write, denied the sentinel write/command, left the prompted file absent after rejection and created it after approval. No post event was recorded for denied/rejected calls. All six completed pre/post pairs preserved identical toolCall arguments. The legacy condition environment variable was absent throughout. UI evidence included a visible force_ask prompt with persistent approval choices disabled; an applicable cached file grant was not established.

This is evidence for a synthetic diagnostic hook in a single-root disposable no-Git workspace. It is not a production adapter/lock test, multi-root proof, general error/interruption guarantee or approval of the remaining macro selector. Global permission settings were inspected subsequently and tightened; effective project overrides during the original run were not captured. No raw personal paths, conversation IDs, consumer-project references or credential data are reproduced in this source document.

## Focused approval continuation probe

Generate a fresh workspace with `node .agents/tests/antigravity-hook-probe.mjs --relative --prompt-decision ask --observe-next-handler`. The first handler emits ask for approval-sentinel.txt; the following neutral observer only appends a pre-observer trace and returns allow. It never acquires a lock. The combined decision and actual handler scheduling are the subject of the experiment, not an assumed approval boundary.

First run ls as a control. Then request an actual write to approval-sentinel.txt. If a prompt appears, capture trace.jsonl from an independent terminal while it is still pending, reject it and check file absence. Repeat the same target, capture the pending trace again, approve once and check the resulting pre/pre-observer/post sequence. If no prompt appears, record that outcome instead of manufacturing a grant or interpreting it as safe ordering. Repeat in a fresh workspace with `--prompt-decision force_ask --observe-next-handler`. A following handler running while approval is pending would be unsuitable as a post-approval acquisition stage.

For cached-grant comparison use a separate fresh workspace without --observe-next-handler: generate with `--relative --prompt-decision ask`, request approval-sentinel.txt, and if offered grant persistent approval only for that disposable file. Repeat the identical target to observe the ordinary ask behavior. Then regenerate that marked base with `--base <returned-base> --relative --prompt-decision force_ask`, reload hooks while retaining the same grant, and repeat the identical target. Record effective preset, explicit file rule/scope and actual prompts. No existing project/global file permission should be broadened for this test. If the relevant grant cannot be established or persists differently after reload, mark the comparison inconclusive.

Each generated script is retained by SHA-256 and each trace records the diagnostic settings. Observer timing, grant behavior and ordinary ask continuation must be assessed before selecting a repair. Existing policy/backend semantics remain unchanged. The official [hook contract](https://antigravity.google/docs/hooks) distinguishes ask from force_ask; it does not establish a post-approval reservation stage for this candidate.

## Follow-up observations and bounded review amendment

After permission settings were tightened, the Human Orchestrator supplied three cumulative evidence bundles for the same disposable target. The final trace contains 12 records, not three independent sets of 12. All current script/config digests and archived copies match their setup records.

- With ask followed by a neutral allow observer, the write completed without a visible prompt. The observer ran 26 ms after the first handler.
- With the observer removed, the single pre handler emitted ask and the successful post event followed 32 ms later. The Human Orchestrator observed no prompt. The observer is therefore not necessary for this outcome; this does not establish how multiple decisions are combined.
- With the same single-handler hook configuration and the script changed to emit force_ask for the same target, a visible permission request waited for the Human Orchestrator. Rejection left independently captured file contents byte-for-byte unchanged. The pending snapshot equals the final trace; that attempt has only a pre event and no post event.
- The initial ls attempt failed with a sandbox connection reset and still produced a post event containing the error. A subsequent distinct attempt carried BypassSandbox: true and succeeded. This establishes post delivery for that specific failure, not for every error or interruption.

The agent reported list_permissions unavailable, so no effective grant inventory was obtained. A prior applicable explicit grant, project override or preset cause has not been established. These experiments observe ask allowing execution and force_ask rejection preventing it on this installation; they do not prove bypass of a deliberately established cached grant. Pre/post toolCall arguments match for completed attempts; this is still a synthetic CJS transport experiment, not production lock verification.

The repair remains COMPATIBILITY_PENDING. Required review decisions are now narrower: whether mandatory protected-file approval needs a separately authorized transport decision change, and which supported IDE lifecycle can acquire the existing reservation after approval but before execution. If no such lifecycle exists, the integration must explicitly remain unsupported rather than claim lock coverage. Mapping ask to force_ask alone does not solve the missing reservation, and acquiring before a waiting prompt violates the approved ordering constraint. Do not implement either as the fix.

The next physical test should target a specified, supported approval/lock handoff after that review. No concurrency redesign, owner comparison change, reservation recovery, backend policy modification, catalog-equality exception or consumer-host change is included in this amendment. The positive macro discriminator and production/multi-root/interruption checks remain separate unresolved cutover requirements.

## Conditional proposal: approval before a separate acquisition handler

Status: rejected after physical qualification on 2026-10-08; retained as proposal history. The documented hooks array permits multiple pre handlers, but the published IDE hook contract does not specify whether each decision is resolved before the next handler starts. The earlier ask/observer experiment could not answer that question because no approval prompt appeared.

The smallest candidate retains the existing native file tools and lock owner contract. One adapter invocation performs all read-only protected-write and framework checks. Any denial exits before the Git lock backend. A protected-write ask would be translated to force_ask only under an explicitly reviewed mandatory-approval transport rule; the policy evaluator itself stays unchanged. Before acquisition, a second invocation must repeat both read-only checks and reject target/configuration/Git state drift since the first invocation. Only then may it call the unchanged tophat backend with the original native file-tool payload. Post release continues to receive that original tool call. No synthetic owner, approval receipt, execution wrapper or lock backend change is proposed.

Per-handler approval ordering is necessary but insufficient: later handlers or native permission checks may still reject after acquisition. Do not implement or enable this candidate based on array order or successful approval alone. The revised qualification uses node .agents/tests/antigravity-hook-sequence-probe.mjs, which creates a fresh, marked disposable Git repository and copies the unchanged policy/lock modules. Its diagnostic acquisition handler actually repeats both policy checks before the backend and compares target/configuration fingerprints, branch, HEAD, index and Git location with the state captured before the prompt. The target check is additional to the protected-write evaluator, which inspects the proposed payload and does not read existing target contents. These external evidence snapshots are diagnostic state, not production approval receipts or a proposed lock-owner migration.

Acceptance requires all of the following on the declared IDE installation:

- A first-handler deny invokes neither the acquisition handler nor the tool and creates no lock.
- A waiting force_ask prompt invokes neither the acquisition handler nor the tool and creates no lock, including after enough time for the next handler normally to start.
- Rejection invokes neither acquisition nor the tool, leaves the target unchanged and creates no lock.
- Approval with unchanged state repeats both policy checks, acquires before execution and produces the expected post release with unchanged original toolCall identity. Independent evidence must show the actual reservation; handler order alone is insufficient.
- While the first prompt is pending, manually change the target, invalidate the configuration or switch the disposable branch. After approval, the acquisition handler must deny before any backend call or tool execution. Use a fresh repository for each drift case and retain before/pending/after evidence.
- A separate --trailing fixture adds a third pre-handler returning force_ask after acquisition. Approve the first request and reject the third. Capture the real lock while the third prompt waits and after rejection. Acceptance requires the tool not to execute and no orphaned reservation. No post event, cleanup timer, Stop handler, TTL or manual deletion may be manufactured to make this pass.
- The acquisition/trailing handlers must not suppress the first mandatory prompt. Re-entry, missing handlers, unsupported tools or ambiguous observations are failures, not inferred acceptance.

If acquisition runs while approval is pending, runs after rejection, is skipped after approval, ignores drift, suppresses the prompt or leaves an orphan after trailing rejection, reject this candidate. Do not move acquisition before the prompt, invent an after-approval event or expand cleanup/concurrency scope to rescue it. Rejected calls in the existing diagnostic observations produced no post event; the trailing experiment is therefore expected to expose an orphan if acquisition has already occurred, but physical execution of that exact sequence is still unverified.

Passing wait-time freshness checks does not establish an atomic compare-and-write boundary against an uncooperative process changing files after the final check. The existing Git reservation is cooperative, not an OS file lock. This residual check-to-write window and later native permission gates require an explicit review disposition; do not claim the entire TOCTOU problem solved by repeating pure payload checks. If all qualification requirements can be met, review the declared-version compatibility limitation before implementing the production adapter split/decision translation. Revalidate the actual adapter around rejection, approval, conflict and tool failure before cutover. The macro selector and other existing blockers remain unresolved by this proposal.

If no supportable handler ordering can be established, retain the draft's compatibility blocker. A separate approval mechanism or controlled writer would be an architectural proposal outside this mechanical repair, not an implicit scope extension.

## First sequence trial and response-envelope correction

The first physical three-pre-handler trial used source f7d01c698f5d6210ce2f6fea82bae9b7f88e4c09. All eight archived resource hashes matched setup; the fixture runtime and five unchanged policy modules matched that source. The trace contained one pre-policy event with valid protected/framework results, no reservation and a recorded force_ask response. Two independent later snapshots retained the same trace, original target digest and absent lock. The Human Orchestrator observed no prompt; the agent reported the call intercepted/denied by the first pre hook and finished without retrying. Its "Created" UI label is not evidence that the denied write occurred.

This trial did not reach acquisition, drift checking or trailing rejection. It failed to qualify the proposed route, but does not isolate a general IDE scheduling defect. Unlike the earlier working CJS diagnostic, the new fixture included an extra status field on stdout. The documented PreToolUse output lists decision, reason and optional permissionOverrides; status is not listed. Whether the extra field caused this installation to deny has not been established, and the documentation does not specify how unknown fields are handled.

The corrected diagnostic retains full status/check/backend results in trace.output and emits only decision/reason on pre stdout, or an empty object on post stdout. trace.wireOutput records that exact serialized envelope. This is a fixture transport correction, not a change to policy/backend semantics or production adapter hooks. Audit the production adapter's response envelope separately before any cutover.

A fresh --policy-only control configures one pre-policy handler and no acquisition or post-release handler. Request the same single native Strategy.md write, capture evidence while any prompt waits, then reject it. This control must display the forced approval request and retain the original target/no lock after rejection. Never approve this control as evidence of lock coverage: it deliberately has no reservation. If no prompt appears, capture no-prompt evidence and the terminal agent/error report and stop. If it works, qualify the corrected minimal-envelope three-handler sequence in another fresh fixture; retain every drift/trailing requirement above.

Changing the envelope and handler count together in this control does not prove the cause of the failed trial. A successful single-handler control followed by an unsuccessful multi-handler fixture using the same envelope would narrow the remaining integration problem. An IDE-specific denial reason or controlled envelope comparison is needed before attributing the initial failure to the status field.

**Observed rejection-only single-handler control: passed on the declared installation.** The supplied fixture used source 1e5b62f2b050d7b69cf19133dbf922a2da5e1db6 with policyOnly: true. All eight archived resource hashes matched setup; the runtime and existing policy modules matched the reviewed source. One native Strategy.md call recorded pre-policy with minimal decision/reason force_ask output. The Human Orchestrator confirmed a visible approval prompt and rejection. Independent pending/rejected captures retained the original target digest and absent lock; their traces were identical. The fixture had no acquisition or post-release handlers, so this proves neither reservation coverage nor post delivery. Both this call and the earlier recorded sequence call used valid absolute target paths; an omitted prompt placeholder does not explain the first recorded sequence failure.

The single-handler control did not qualify the multi-handler sequence, wait-time drift or trailing rejection. The subsequent corrected sequence trial below rejected the route. No production split/decision change, merge or host cutover follows from this control result.

## Corrected multi-handler trial and route rejection, 2026-10-08

The physical --trailing fixture used source 74ea48a079ec231f1743d1537197c383caea5da2 on Antigravity 2.19.1, Linux and Node 26.10.0. All eight archived resource hashes matched setup; the runtime and five unchanged policy modules matched that source. The pending trace was preserved as a prefix of the final trace, and all four events retained the same original conversation/tool-call identity.

While the visible approval prompt waited, the independent first-pending snapshot already contained pre-policy, pre-acquire and pre-trailing. Both prompt handlers emitted minimal decision/reason force_ask envelopes. The acquisition handler returned LOCK_ACQUIRED, and the independent lock capture confirmed the real reservation existed while the target still had its original digest. The three pre events completed within 174 ms; they were not separated by human approval. This proves that the runner did not await the first human decision before invoking acquisition in this trial; it does not establish parallel execution or a general decision-aggregation rule.

The Human Orchestrator accepted the single visible prompt and observed no second prompt. The requested overwrite completed. The independent final digest matched the requested synthetic content, the trace contained post-release with LOCK_RELEASED and the final lock capture was ABSENT. No pre-handler reentry appeared between approval and tool execution. Successful release after this approved write does not repair acquisition before approval or establish post-approval freshness checking.

The route fails the required approval-before-acquisition boundary and is rejected. Target/configuration/branch drift during approval was not exercised in this trial; the purported second-stage freshness check had already run before the human wait. Trailing rejection was not exercised either. Earlier rejection-only observations had no post event, and the subprocess fixture retains an acquired reservation when post is absent. These establish a serious orphan risk, not physical proof of orphaning for this exact rejected sequence. Do not describe that unperformed trial as confirmed or guaranteed.

There is no verified post-approval, pre-execution handoff in the tested mapping. This rejects the reviewed multi-handler route on the declared installation; it is not proof that every possible IDE capability or future version lacks such a handoff. Existing native Git validation remains a separate boundary and is not a substitute for protected-write approval and reservation coverage.

Maintain COMPATIBILITY_PENDING. Do not implement the production split or decision translation, merge the candidate or cut over a host. Keep the policy evaluators, lock backend, owner comparison, catalog equality and workspace-init orchestration unchanged. Preserve the private evidence without committing raw paths or payloads. Further tests of this rejected sequence are not required to establish its ordering failure.

A controlled writer or explicit orchestrator command requires a separate architectural proposal defining approval, fresh-state validation, reservation, execution and rejection/failure behavior. No such route is approved or implemented here. It must also define how native writes are prevented from bypassing that contract; disabling native interception is not an authorized workaround.

### Controlled-writer review disposition: deferred to CLI architecture

The subsequent advisory review returned DEFER TO CLI ARCHITECTURE. A controlled writer requires a reviewed agent mutation boundary, a trusted human approval channel, legitimate writer reservation ownership and defined interrupted-operation behavior. Same-user terminal separation and instructions to use a writer do not establish these boundaries. No writer investigation or implementation is authorized by this disposition, and no native-tool identity may be synthesized to fit the existing backend.

Record this as a deferred CLI architecture item, not an active TopHat 1.0 repair task. Its eventual design must distinguish ownership identifiers from authentication/authorization; a random or cryptographic identifier alone does not confer write authority. The choice of isolation mechanism, ownership schema and recovery policy remains open for that separate review. No particular container, user boundary, IPC protocol or backend redesign is selected here.

The advisory recommendation is to exclude this Antigravity protected-write integration from TopHat 1.0 supported-host claims. Until a release-scope decision is approved, retain COMPATIBILITY_PENDING and do not claim this installation supported. The review does not establish qualification of other hosts, release readiness, permission to merge mechanical subsets or completion of the separate macro discriminator. PR #13 remains draft and blocked.

The repository's root Roadmap.md is a generic host-derived template with unconfigured authority, not the authoritative TopHat CLI roadmap. Do not populate its active package or sprint fields with this deferred item. A separately approved CLI planning package must carry the item when that architecture work begins.

## Running the revised disposable qualification

**Historical procedure: the corrected physical trial above rejected this route. Do not continue these rounds as current qualification instructions.** The diagnostic fixtures remain available to reproduce observations or test a separately reviewed capability.

Each generator invocation creates a new repository; it does not accept an existing host or delete existing reservations. It prints workspace/evidence paths and an evidence.env path. In an independent terminal, source that exact evidence.env to recover probe_base, probe_workspace and probe_evidence even while the launching terminal is occupied by the IDE. Evidence includes source/runtime hashes, original policy module copies, policy results, state comparisons, raw payload and actual lock contents before/after each event. Keep archives private; sanitize observations before adding them to this repository.

Use write_to_file on the returned workspace's Strategy.md, proposing '# Approved synthetic strategy'. For the initial denial control, request deny-sentinel.svelte containing 'export let value;'. The fixture declares Svelte so the unchanged framework evaluator rejects that payload. Other file targets/tools are outside this closed diagnostic. Stop and preserve evidence if the acquisition stage runs during the first prompt or the prompt is suppressed.

Run prompt rejection and ordinary approval in fresh fixtures. For separate target/configuration/branch drift trials, change the state from the independent terminal while the first prompt waits, then approve. The modified state must be preserved by denial. For the --trailing trial, approve the first prompt, capture the real lock before deciding the third prompt, reject the third and capture the lock again. Stop after any orphan; preserve the repository and record the route as incompatible. Never delete the lock or retry to disguise the failure.

Subprocess qualification tests simulate handler invocations and prove repeated policy checks, freshness denial before acquisition, original backend ownership/release and preservation of an acquired lock when no post event occurs. They do not verify physical IDE scheduling or invent evidence of automatic recovery. Production antigravity-hook.ts and its installed hooks.json remain unchanged while this harness is qualified.

### Single-handler response control before trailing rejection

From the corrected reviewed checkout run:

```sh
node .agents/tests/antigravity-hook-sequence-probe.mjs --policy-only
```

Open its new workspace and source its printed evidence.env in the capture terminal. Use the capture function and single-write instruction below. Wait ten seconds with the prompt pending, capture first-pending, then reject and capture rejected after the agent finishes. If no prompt appears, capture no-prompt and stop. Archive the evidence as described below. This rejection-only control must pass before proceeding to the sequence trial.

### Decisive physical sequence trial: trailing rejection

Run from the reviewed source checkout, using Node >=24:

```sh
node .agents/tests/antigravity-hook-sequence-probe.mjs --trailing
```

Open only the printed workspace in the IDE. Start a fresh agent conversation. In a separate terminal, source the exact printed envFile (replace the example path below), then define this capture function. It reads evidence and never deletes a reservation:

```sh
source /tmp/tophat-sequence-probe-XXXXXX/evidence.env
capture_sequence() {
  cp "$probe_evidence/trace.jsonl" "$probe_evidence/$1.trace.jsonl"
  sha256sum "$probe_workspace/Strategy.md" > "$probe_evidence/$1.target.sha256"
  if [ -f "$probe_workspace/.git/locks/tophat.lock" ]; then
    cp "$probe_workspace/.git/locks/tophat.lock" "$probe_evidence/$1.lock.txt"
  else
    printf 'ABSENT\n' > "$probe_evidence/$1.lock.txt"
  fi
}
```

Give the agent this instruction, substituting the actual printed workspace path:

```text
Use write_to_file exactly once to overwrite <workspace>/Strategy.md with:
# Approved synthetic strategy
Use Overwrite: true. This is a disposable hook qualification workspace.
Do not change hook files or permissions. If permission is rejected or a hook
denies the call, stop without retrying or using another tool to write the file.
```

Leave the first prompt waiting for at least ten seconds, then run `capture_sequence first-pending`. The trace must contain only pre-policy for this call, and first-pending.lock.txt must say ABSENT. If not, stop and record failure. Approve that first prompt once. A third-handler prompt must then appear. While it waits, run `capture_sequence trailing-pending`: the trace must show pre-policy, pre-acquire with repeated checks and LOCK_ACQUIRED, then pre-trailing, with the real reservation present and target unchanged. Reject this second visible prompt. Once the agent has stopped, run `capture_sequence rejected` and inspect the lock, target hashes and any post-release event.

An orphaned lock rejects the route even if the denied write correctly left the target unchanged. Missing/suppressed prompts or acquisition before the first approval also reject it. Preserve the failed fixture; do not clear its lock. Archive evidence after capture:

```sh
tar -czf "$probe_base/sequence-evidence.tar.gz" -C "$probe_base" evidence
```

Supply that archive, declared IDE/Node versions, which prompts appeared and which were approved/rejected. Screenshots help establish UI timing but do not substitute for independent lock/target evidence. Run the remaining fresh-fixture denial, rejection, normal approval and drift cases only if this decisive trial does not already disqualify the route. Passing this one trial alone does not qualify the candidate.

### Fresh-fixture drift trials

For each drift type, generate a new fixture without --trailing and repeat the terminal setup and single-write request. While the first prompt waits, capture first-pending, then perform exactly one of these independent changes:

```sh
# Target drift:
printf '# Changed during approval\n' > "$probe_workspace/Strategy.md"
# Or configuration drift, in a different fresh fixture:
printf '{}\n' > "$probe_workspace/.agents/tophat.config.json"
# Or branch drift, in a different fresh fixture:
git -C "$probe_workspace" switch -c probe-drift
```

Capture changed-pending before approving, then capture after-approval once the agent stops. The second handler must repeat both policy checks and deny before the backend: invalid config reports TOPHAT_CONFIG_INVALID; target/branch drift reports PROBE_STATE_DRIFT. There must be no reservation, no post-release event and no requested overwrite. For configuration/branch trials, also retain the changed configuration or branch output separately. Archive each evidence directory independently.

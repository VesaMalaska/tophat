# Antigravity hook transport candidate

Status: **COMPATIBILITY_PENDING — do not cut over or merge on subprocess evidence alone.**

TopHat is a reusable developer tool. Hook code, fixtures and documentation use generic host names and paths; they must not depend on a maintainer's company, consumer project or local account.

## Bootstrap and selected root

The workspace-local adapter uses Node >=24 directly, with no pnpm/tsx hook bootstrap or dependency installation. This candidate config uses `node ./scripts/antigravity-hook.ts` from the customization directory. A physical diagnostic probe on Antigravity 2.19.1 observed cwd at the workspace customization directory and successful absolute and relative Node/CJS script launches. This verifies the diagnostic launch convention on that installation, not the production TypeScript adapter or every IDE. A doubled resource path supports a resolution-base diagnosis but does not alone establish process cwd.

The module location identifies the installed host. Mounted directories corroborate it regardless of order; a parent-mounted directory may contain that exact installation. Write targets must stay in that host, without symlinks or traversal; a nested installation requires its own adapter. Config and Git operations receive this root instead of hook cwd. Tool arguments are never rewritten. Static imports do not execute the policy evaluators' CLI entry points.

## Routing and output

The context-io-gate adapter includes the existing protected-write and Svelte checks in one pre-write handler. Deny/ask returns before lock acquisition. Their evaluators and the swarm-lock backend remain unchanged; ask has not been upgraded to force_ask. A valid terminal host retains Svelte non-applicability. An allowed write needs the existing initialized-Git lock backend; its original denial/status is preserved with a prerequisite explanation.

The enabled macro-reset-gate uses a closed neutral list: supported exploration tools, plain ls/pwd/version commands, and well-shaped invocations of this installation's read-only documentation/package catalog validators. No host pnpm script is inferred read-only from its name. No prefix-based exemption covers shell operators, substitutions or redirections. This is not a general authorization mechanism for shell writes or Git mutations.

**Macro identity is unverified.** Generic run_command payloads do not establish human slash-workflow intent. Other command calls return MACRO_APPLICABILITY_UNVERIFIED before any global lock call; post-command reports the blocker on stderr and exits nonzero. This draft deliberately cannot replace a working command-hook integration. No invented workflow field/environment variable or all-command pass-through is provided. A positive macro selector and applicable acquire/release delegation require a supported observed transport or a separately reviewed lifecycle proposal before cutover.

Pre responses contain one decision JSON object. Post responses contain `{}`; a failed existing release yields a diagnostic on stderr and nonzero adapter exit. This cannot undo the tool or guarantee the runner halts. Post release preserves the exact original owner comparison, including its argument-order sensitivity. There is no expiry, stale-lock deletion, Stop cleanup, step-identity migration or mutual-exclusion redesign.

A policy prompt acquires no lock. In the physical force_ask diagnostic, approval executed the tool and produced a post event without rerunning the pre handler. The production evaluator emits ask; a subsequent single-handler diagnostic emitted ask and completed the write without a visible prompt or pre-handler reentry. Consequently neither mandatory human approval nor a required post-approval reservation can be assumed from the current ask path; prompt sequencing remains a merge blocker. Missing post identity, timeout and interruption also remain integration blockers; the adapter does not guess or manufacture a matching owner. Native Git pre-commit validation remains a separate installed boundary.

## Packaging and verification

The catalog explicitly includes the adapter and this support document, then follows its imports. Strict source/installed equality remains mandatory; a disabled hook, changed adapter or omitted resource is invalid against the reviewed source. Apply only exact reviewed TopHat-owned infrastructure under a new pin, retaining custom host resources and ownership history. This is not permission to initialize a host Git repository, approve a product draft or change host product files.

Automated adapter tests execute real Node subprocesses and existing evaluator calls in disposable hosts, including paths with spaces. They observe policy-before-lock behavior, exact owner preservation, root selection, pre-Git reads, malformed input, post failure and catalog tamper rejection. They are not evidence of physical IDE interception.

Before merge to development or host cutover, independently capture the declared IDE/version, raw pre/post JSON, actual hook cwd/execPath/Node version, target tool cwd, mounted-root order and sentinel outcomes. Verify an actual deny prevents execution, reject/approve a prompt and inspect whether a required reservation exists before execution, and record cached approval/force_ask behavior without changing production policy. Probe success, tool error, pre-denial, prompt rejection, timeout, crash and missing post events separately. Resolve the macro selector and verify relative script launch; failures remain blockers. Never treat an agent declining to make a call as hook enforcement.

Concurrency follow-ups are separate: cross-type mutual exclusion, canonical owner identity, interrupted-operation recovery and macro transaction lifetime. No consumer-project acceptance or release is claimed here.

## Disposable live probe

Run `node .agents/tests/antigravity-hook-probe.mjs` from the source checkout. It creates a separate no-Git workspace and external evidence directory, prints their paths and the hooks SHA-256, and retains the exact diagnostic config. Open only that returned workspace in the declared IDE, launched with the intended Node environment. The synthetic diagnostic hooks are not a production installation or a catalog-valid TopHat replacement.

Request actual agent calls for ls, an allow-sentinel.txt write, a deny-sentinel.txt write, a force-ask-sentinel.txt write and `printf TOPHAT_DENY`. Initially reject the approval request. Independently check which actions occurred. Inspect trace.jsonl for exact raw payload, cwd, execPath, Node version, emitted response and post events; an agent choosing not to call a tool is inconclusive. Inputs must be synthetic. Only presence of the legacy environment variable is captured, not its value or the process environment.

Repeat using `node .agents/tests/antigravity-hook-probe.mjs --base <returned-base> --relative`, reload customizations and capture the same observations. The generator only accepts its marked disposable base and retains config history. Repeat with nested target cwd, paths with spaces and multiple workspace mounts. Separate fixtures test cached approval, timeout/crash/bad-output and a Git-backed candidate installation. Keep failed traces. Physical IDE experiments are executed by the Human Orchestrator; implementation-environment subprocesses alone cannot establish interception.

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

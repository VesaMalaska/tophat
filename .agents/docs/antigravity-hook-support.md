# Antigravity hook transport candidate

Status: **COMPATIBILITY_PENDING — do not cut over or merge on subprocess evidence alone.**

TopHat is a reusable developer tool. Hook code, fixtures and documentation use generic host names and paths; they must not depend on a maintainer's company, consumer project or local account.

## Bootstrap and selected root

The workspace-local adapter uses Node >=24 directly, with no pnpm/tsx hook bootstrap or dependency installation. This candidate config uses `node ./scripts/antigravity-hook.ts` from the customization directory. The first live probe must use an absolute diagnostic script to observe actual process cwd and executable; the relative launch convention is not yet physically verified. A doubled resource path supports a resolution-base diagnosis but does not alone establish process cwd.

The module location identifies the installed host. Mounted directories corroborate it regardless of order; a parent-mounted directory may contain that exact installation. Write targets must stay in that host, without symlinks or traversal; a nested installation requires its own adapter. Config and Git operations receive this root instead of hook cwd. Tool arguments are never rewritten. Static imports do not execute the policy evaluators' CLI entry points.

## Routing and output

The context-io-gate adapter includes the existing protected-write and Svelte checks in one pre-write handler. Deny/ask returns before lock acquisition. Their evaluators and the swarm-lock backend remain unchanged; ask has not been upgraded to force_ask. A valid terminal host retains Svelte non-applicability. An allowed write needs the existing initialized-Git lock backend; its original denial/status is preserved with a prerequisite explanation.

The enabled macro-reset-gate uses a closed neutral list: supported exploration tools, plain ls/pwd/version commands, and well-shaped invocations of this installation's read-only documentation/package catalog validators. No host pnpm script is inferred read-only from its name. No prefix-based exemption covers shell operators, substitutions or redirections. This is not a general authorization mechanism for shell writes or Git mutations.

**Macro identity is unverified.** Generic run_command payloads do not establish human slash-workflow intent. Other command calls return MACRO_APPLICABILITY_UNVERIFIED before any global lock call; post-command reports the blocker on stderr and exits nonzero. This draft deliberately cannot replace a working command-hook integration. No invented workflow field/environment variable or all-command pass-through is provided. A positive macro selector and applicable acquire/release delegation require a supported observed transport or a separately reviewed lifecycle proposal before cutover.

Pre responses contain one decision JSON object. Post responses contain `{}`; a failed existing release yields a diagnostic on stderr and nonzero adapter exit. This cannot undo the tool or guarantee the runner halts. Post release preserves the exact original owner comparison, including its argument-order sensitivity. There is no expiry, stale-lock deletion, Stop cleanup, step-identity migration or mutual-exclusion redesign.

A policy prompt acquires no lock. Whether human approval re-enters a stage that acquires the required lock before writing is unknown. Missing post identity, prompt continuation, timeout and interruption are integration blockers; the adapter does not guess or manufacture a matching owner. Native Git pre-commit validation remains a separate installed boundary.

## Packaging and verification

The catalog explicitly includes the adapter and this support document, then follows its imports. Strict source/installed equality remains mandatory; a disabled hook, changed adapter or omitted resource is invalid against the reviewed source. Apply only exact reviewed TopHat-owned infrastructure under a new pin, retaining custom host resources and ownership history. This is not permission to initialize a host Git repository, approve a product draft or change host product files.

Automated adapter tests execute real Node subprocesses and existing evaluator calls in disposable hosts, including paths with spaces. They observe policy-before-lock behavior, exact owner preservation, root selection, pre-Git reads, malformed input, post failure and catalog tamper rejection. They are not evidence of physical IDE interception.

Before merge to development or host cutover, independently capture the declared IDE/version, raw pre/post JSON, actual hook cwd/execPath/Node version, target tool cwd, mounted-root order and sentinel outcomes. Verify an actual deny prevents execution, reject/approve a prompt and inspect whether a required reservation exists before execution, and record cached approval/force_ask behavior without changing production policy. Probe success, tool error, pre-denial, prompt rejection, timeout, crash and missing post events separately. Resolve the macro selector and verify relative script launch; failures remain blockers. Never treat an agent declining to make a call as hook enforcement.

Concurrency follow-ups are separate: cross-type mutual exclusion, canonical owner identity, interrupted-operation recovery and macro transaction lifetime. No consumer-project acceptance or release is claimed here.

## Disposable live probe

Run `node .agents/tests/antigravity-hook-probe.mjs` from the source checkout. It creates a separate no-Git workspace and external evidence directory, prints their paths and the hooks SHA-256, and retains the exact diagnostic config. Open only that returned workspace in the declared IDE, launched with the intended Node environment. The synthetic diagnostic hooks are not a production installation or a catalog-valid TopHat replacement.

Request actual agent calls for ls, an allow-sentinel.txt write, a deny-sentinel.txt write, a force-ask-sentinel.txt write and `printf TOPHAT_DENY`. Initially reject the approval request. Independently check which actions occurred. Inspect trace.jsonl for exact raw payload, cwd, execPath, Node version, emitted response and post events; an agent choosing not to call a tool is inconclusive. Inputs must be synthetic. Only presence of the legacy environment variable is captured, not its value or the process environment.

Repeat using `node .agents/tests/antigravity-hook-probe.mjs --base <returned-base> --relative`, reload customizations and capture the same observations. The generator only accepts its marked disposable base and retains config history. Repeat with nested target cwd, paths with spaces and multiple workspace mounts. Separate fixtures test cached approval, timeout/crash/bad-output and a Git-backed candidate installation. Keep failed traces. None of these physical IDE experiments have been performed in the implementation environment.

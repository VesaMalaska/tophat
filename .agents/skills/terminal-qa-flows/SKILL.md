---
name: terminal-qa-flows
description: Validate approved CLI journeys and TUI input, layout, resize and recovery behavior on an exact candidate. Use only with terminal-qa capability and a terminal-flow or terminal-presentation task topic.
---

# Terminal QA flows

Read `.agents/docs/terminal-host-support.md` and `.agents/docs/task-routing-and-qa.md`. Require a validated terminal host, the classified task's exact methods, approved criterion extracts, current candidate, independent QA session and declared evidence outputs. Follow the host's approved package for renderer, PTY harness, launch scripts and implementation policy; do not select an engine or install tooling.

## Execute the selected methods

- **e2e-terminal / exploratory:** Exercise authorized invocation, argument transport, stdin/stdout/stderr, exit status and error/recovery paths. For TUI, use the existing native terminal or declared PTY harness to exercise applicable keys, focus, navigation, state transitions, cancellation and cleanup. Record actual procedures and observations; a captured transcript alone cannot prove screen rendering.
- **visual / responsive:** TUI only. Inspect criterion-relevant cells, overflow, truncation, redraw and resize at actual observed rows/columns. Preserve native captures when required. Do not invent CSS viewports or assume ANSI output establishes native glyph/font correctness.
- **accessibility:** TUI only under this screen-method contract. Evaluate approved keyboard reachability, focus feedback, contrast and alternative output requirements using available tooling/manual procedures. Do not substitute browser DOM assertions or claim an unobserved screen-reader result. CLI accessibility requirements belong to explicitly scoped flow/output checks.
- **human-design:** Require the existing exact-candidate human acceptance record. Pending subjective approval is BLOCKED.

## Capture truthful evidence

Populate the shared QAReport, retaining exact commit/build, task fingerprint, full shared-runner reports, criterion-to-method mappings and artifact digests. Invoke only host-declared `pnpm run <category>` mappings through the shared runner; reusable product tests belong to a developer task. Associate every PASSED terminal method with a declared log, trace, screenshot or report artifact.

Record `environment.terminal` only for terminal hosts, with mode matching the validated config. Identify the observed emulator/version or PTY harness in `terminalIdentity`, then link the observation to artifacts/procedure. The bounded identity validator rejects malformed/placeholder text but cannot authenticate an observation. Record observed TERM, locale, launch, native dependencies, TTY mode and capture limitations; use explicit reasons for unavailable values. TERM alone is not emulator identity.

Keep `environment.viewports` empty with reason `Terminal dimensions are recorded exclusively in environment.terminal.sizes.` Record dimensions exclusively as integer rows/columns in `terminal.sizes`; use null sizeReason when sizes exist, otherwise a concrete reason. Available TUI requires a native terminal or PTY; visual/responsive methods require observed sizes. A CLI run can be non-TTY and omit sizes with a reason.

Missing infrastructure or an unobservable required native result is BLOCKED. Preserve failed/aborted attempts. QA may run declared procedures and write declared artifacts; it cannot fix source/tests/config, install dependencies, mutate Git/Linear/private state, approve its own remediation or invoke downstream commands. Return findings to the assigned tier; every new candidate requires fresh applicable review/security/QA.

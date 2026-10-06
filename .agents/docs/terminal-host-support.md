# Terminal host support

This additive TopHat 1.0 scope amendment implements the human-approved Terminal Support Implementation Brief revision 2 (2026-10-06, decisions D01–D09). It extends generic Node.js/TypeScript/pnpm host support; SparkleWire onboarding, product authority approval, merge and release remain separate decisions. Existing criterion IDs and host shapes are retained. Configuration, task and QA contracts remain schemaVersion 1; older validators deny the new profiles, and old receipts are never automatically upgraded.

## Profiles and classification

Declare `workspace: {kind: "terminal", framework: "none", mode: "cli" | "tui"}`. Mode is required here and forbidden on web/backend/desktop hosts. CLI derives node-process, terminal-io and terminal-qa; TUI additionally derives terminal-ui. No server, browser, Electron, Tailwind or renderer is inferred. Node >=24 remains TopHat's tooling floor; the approved host package may require a higher compatible runtime. No Bun/Python execution dependency is introduced.

| Work | Derived route |
|---|---|
| Static TUI presentation | junior → standard |
| terminal-logic: localized TUI state/input/navigation | mid → critical → security |
| process control, filesystem, credentials, persistence, cross-layer/internal work | senior → critical → security |

Use the explicit `process` work kind for process control on applicable Node execution hosts. `terminal-logic` requires terminal-ui; it cannot hide privileged operations. Mixed work selects the highest tier. CLI algorithms/internal logic retain the senior route. Public commands remain 30; terminal-qa-flows is the eighteenth topical guidance skill, not a new slash command.

The `terminal-flow` topic must agree with the effect and selects e2e-terminal plus exploratory. The `terminal-presentation` topic must agree with static-ui or visual/responsive/accessibility/human-design effects and requires terminal-ui. Presentation-only work does not fabricate a flow. The guidance skill requires terminal-qa plus at least one of these two topics. Existing web/desktop topics, renderer skills and backend skill assumptions cannot govern terminal tasks. Approved host documentation chooses renderer/harness and implementation policies; unconditional security invariants still apply.

## Closed terminal evidence

Use the executable QAReport contract in `.agents/scripts/validate-qa-evidence.ts` and TerminalEnvironment in `.agents/scripts/validate-terminal-environment.ts`. No separate JSON QA schema is introduced. Terminal metadata is required for terminal reports and rejected, including null, for every other report kind. QA and material documentation claims cross-check kind/framework/mode against the actual validated host config.

| Field | Contract |
|---|---|
| mode | cli/tui, equal to host mode |
| terminalIdentity | Trimmed 3–256 Unicode code points; no controls, bracket placeholders or normalized unknown/none/N/A/yes/no/unspecified/unverified/unavailable/null/TBD/TODO placeholders. Link actual observed emulator/version or identified PTY harness to evidence. Format validity cannot prove truth. |
| term, locale | Closed value/reason pairs; observed nonempty string with null reason, or null with concrete nonempty reason |
| runtimeInvocation | Actual launch procedure; no secrets |
| nativeDependencies | Observed native tools/versions or explicit absence; no automatic installation |
| ttyMode | native, pty or non-tty; available TUI forbids non-tty |
| sizes | Sole dimension source, maximum 32 unique closed rows/columns integer pairs, each 1–10000 |
| sizeReason | Null when sizes exist; concrete reason when empty |
| captureLimitations | Actual omissions including native glyph/font/emulator uncertainty |

For terminal reports, `environment.viewports` is exactly `[]`; its reason is exactly `Terminal dimensions are recorded exclusively in environment.terminal.sizes.` Never duplicate sizes as viewport strings. Available TUI visual/responsive evidence needs observed sizes. CLI forbids the screen presentation methods; authorized CLI output/accessibility behavior can use terminal-flow checks. Every passed terminal method needs an artifact. Current-candidate, independent roles, ordered stages, failure history, artifact inventory and publication gates remain unchanged.

## Installation and native evidence boundaries

The static catalog's resource closure includes the new guidance, this contract and the terminal validator through existing attachment inspection. Exact ownership/digests, host model overrides, custom skills, removal planning and product-history preservation remain mandatory. Unsupported or partial installations halt; no runtime registry, installer daemon or automatic rollback is added.

The fixture `.agents/tests/terminal-runtime.test.ts` observes a generic Node process on Linux through util-linux script and GNU stty: Unicode CLI argument/output and non-TTY rejection; actual PTY key input, resize/SIGWINCH, normal/error/SIGINT exits, and restoration of the fixture PTY's original termios state. Time/output limits are fixture-specific and do not certify arbitrary descendant termination or OS sandboxing. It does not exercise OpenTUI or certify native glyph/font behavior, Antigravity hooks, another OS or a real product installation. Missing native tools fail visibly rather than silently skipping. Product-specific native acceptance and live integration remain pending until the separately approved pilot.

The acceptance index adds terminal profile, routing/evidence, native runtime and installation groups while retaining IDs 1–30 and existing live obligations. Synthetic receipts validate contract handling, not actual QA or authenticated identity. Green fixtures do not authorize a release.

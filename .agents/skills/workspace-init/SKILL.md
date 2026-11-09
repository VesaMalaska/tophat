---
name: workspace-init
description: "Use for explicit /workspace-init requests. Validate an existing supported host and approved package before proposing private roadmap and task state."
---

## Invocation and required reads

Use the exact human invocation of `/workspace-init` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source>` before config discovery; run installed-host catalog validation after the legacy/config check permits modern configured execution. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/workspace-init"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-architect.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. **Environment:** The orchestrator runs `node -v`, `pnpm -v`, and `git --version`. Halt on command failure or Node.js below 24. The human supplies actual host configuration/scripts; no framework or dependency installation is inferred.
2. **Legacy config check:** Inspect existing config read-only. A routingMatrix object with absent schemaVersion/workspace/documentation/validation sections produces `LEGACY_WORKSPACE_CONFIG` listing the missing sections and directs `/workspace-attach`. Missing/unconfigured/modern-invalid config remains an ordinary setup/config denial. Never migrate it or write a proposed contract here. Existing-project private-state generation belongs to `/workspace-attach-finalize`.
3. **Documentation authority precondition:** Before planning or task side effects, run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'`. Require exit zero, `APPROVED_VALID`, and `planningAllowed: true`. Halt on DENIED; offer the optional definition path when no approved package exists. Never fall back to `docs/PRD.md`, loose-directory discovery, a cached HUD, or invented authority.
4. **Infrastructure:** Verify the catalog dependency closure, `.agents/rules`, `skills`, scripts, canonical schema, hooks.json, host config and versioned native hook. Verify existing root memory templates. Missing templates cause a restoration request, not autonomous scaffolding. Explicitly install/verify the native hook with `node .agents/scripts/install-git-hook.ts`; existing hooks/core.hooksPath require deliberate integration. No physical IDE interception claim.
5. **Linear:** Perform a read-only authentication/status check. Require the configured Team's case-sensitive statuses and UUIDs: Backlog, Todo, In Progress, Blocked, In Review: Architecture, In Review: Security, In Review: QA, Ready for PR, In Review: Orchestrator, Changes Requested, Done, Canceled, Duplicate. Halt on missing/unauthorized state.
6. **Cognitive handoff:** Invoke `@agent-architect`. Read only the validated package inventory. Check product-level stack/storage/identity/scope facts across the appropriate documents; None or in-memory can be legitimate explicit choices. Missing/contradictory product decisions require human resolution/reapproval. No mandatory TopHat declarations or fixed PRD/ERD set in public prose.
7. **Proposal:** Translate active approved scope into Development Phases and Sprint Chunks. Output proposed Roadmap, bounded Context and Strategy changes with packageId/packageVersion/authorityFingerprint. Each active chunk includes the fenced JSON authorityContext specified in the task-generation workflow. The Architect produces proposals, not file/Git writes.
8. **Private-state human gate:** Obtain explicit human direction for the proposed private-state initialization. The separately authorized orchestrator revalidates the same authority fingerprint immediately before writing only Roadmap.md, Context.md, Strategy.md and HUD.md. Halt if authority changed. Preserve supplied templates and unrelated state. Do not mutate product authority.
9. **Foundational task:** Load `/generate-smoke-test` separately. It must use the same package/task gates and its own proposal/human issue-creation gate; no blanket authorization to create a ticket. Do not invoke `/generate-readme`; its legacy autonomous path is retired; use the explicit derived-document lifecycle.
10. **Handoff:** Summarize validated authority, approved private-state changes, applicable blockers and any explicitly authorized task. Recommend `/sprint-briefing` with its configured model. There is no automatic Git commit, branch creation or PR into main. If human-requested publication is needed, declare the intended host base and intended paths explicitly; shared Git safety applies.

## Cooperative macro coordination

TopHat 1.0 does not acquire an automatic global-pivot reservation from IDE command payloads. Before this workflow, the Human Orchestrator pauses concurrent mutating sessions and confirms the selected host/state. Human coordination is required to prevent concurrent mutations; the hook cannot identify or lock the slash workflow from ordinary run_command calls. Do not fabricate a native payload or assume command execution proves global lock coverage. Existing package, role, task, Git and explicit approval gates remain mandatory.

Approval-required native writes are supervised and unreserved. While a prompt waits, do not mutate the target or relevant workspace state; cancel and propose again if state changes. Ordinary applicable native writes retain their existing reservation contract, but this does not protect an entire macro operation or terminal writes.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

## Terminal applicability

For a validated terminal host, read `.agents/docs/terminal-host-support.md`. Preserve the declared cli/tui mode, closed capability/trait/method mapping and host-approved launch/renderer policy. Do not infer a web server, browser, Electron or styling stack from Node.js. Follow existing actor, authority and exact-candidate boundaries.

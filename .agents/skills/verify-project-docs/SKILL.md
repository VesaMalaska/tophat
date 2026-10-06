---
name: verify-project-docs
description: "Use for explicit /verify-project-docs requests. Verify current product documentation and handoff after all Development Phases have accepted documentation evidence."
---

## Invocation and required reads

Use the exact human invocation of `/verify-project-docs` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/verify-project-docs"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: the separately authorized execution actor; follow the role/session contract in the procedure. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Read the lifecycle contract. Inventory all declared completed phases/tasks and their original accepted receipts/provenance. Require phase-mode acceptance; immediate task records are insufficient. Historical acceptance is not fresh aggregate product QA.
2. On the clean current candidate, run the declared projectCompletionGate through the bounded shared runner. Assess the complete realized product, setup/dependencies/configuration, operations/administration/usage, migration/compatibility, examples, links and handoff. Every dimension receives a result and specific rationale; required dimensions cannot be skipped. Do not impose another project's document set.
3. If corrections are needed, run the same exact human-approved writer plan/capture/postcheck loop as `/sync-derived-docs`. Do not modify authoritative scope, package inventory or product code. Conflicts halt for human resolution.
4. Run current-candidate completion/documentation checks and applicable claim verification, then independent read-only document review with external pre/post capture. Preserve separate external evidence/index custody. Do not execute arbitrary command text from documents or crawl external sites as an invented universal gate.
5. Require DOCUMENTATION_READY from `validate-derived-docs.ts`. Documentation-only publication follows its explicit gate; combined work requires current task evidence. After separate explicit human final acceptance of the exact report/review, operation accept may return PROJECT_DOCUMENTATION_ACCEPTED. A later commit/state change invalidates current readiness; accepted history remains attached to its stated commit.

This workflow does not merge PRs, release to main, certify live multi-framework acceptance, or replace the integrated Slice 9 release gate.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

## Terminal applicability

For a validated terminal host, read `.agents/docs/terminal-host-support.md`. Preserve the declared cli/tui mode, closed capability/trait/method mapping and host-approved launch/renderer policy. Do not infer a web server, browser, Electron or styling stack from Node.js. Follow existing actor, authority and exact-candidate boundaries.

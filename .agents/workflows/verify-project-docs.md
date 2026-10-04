---
description: Verify current product documentation and handoff after all Development Phases have accepted documentation evidence.
---

1. Read the lifecycle contract. Inventory all declared completed phases/tasks and their original accepted receipts/provenance. Require phase-mode acceptance; immediate task records are insufficient. Historical acceptance is not fresh aggregate product QA.
2. On the clean current candidate, run the declared projectCompletionGate through the bounded shared runner. Assess the complete realized product, setup/dependencies/configuration, operations/administration/usage, migration/compatibility, examples, links and handoff. Every dimension receives a result and specific rationale; required dimensions cannot be skipped. Do not impose another project's document set.
3. If corrections are needed, run the same exact human-approved writer plan/capture/postcheck loop as `/sync-derived-docs`. Do not modify authoritative scope, package inventory or product code. Conflicts halt for human resolution.
4. Run current-candidate completion/documentation checks and applicable claim verification, then independent read-only document review with external pre/post capture. Preserve separate external evidence/index custody. Do not execute arbitrary command text from documents or crawl external sites as an invented universal gate.
5. Require DOCUMENTATION_READY from `validate-derived-docs.ts`. Documentation-only publication follows its explicit gate; combined work requires current task evidence. After separate explicit human final acceptance of the exact report/review, operation accept may return PROJECT_DOCUMENTATION_ACCEPTED. A later commit/state change invalidates current readiness; accepted history remains attached to its stated commit.

This workflow does not merge PRs, release to main, certify live multi-framework acceptance, or replace the integrated Slice 9 release gate.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

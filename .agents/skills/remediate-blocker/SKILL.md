---
name: remediate-blocker
description: "Use for explicit /remediate-blocker requests. Surgical JIT context healing for tasks halted by execution agents due to missing schemas or documentation gaps."
---

## Invocation and required reads

Use the exact human invocation of `/remediate-blocker` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Exactly one explicit task locator, preserved verbatim from the human invocation; missing/extra locators halt. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/remediate-blocker"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-architect.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

## Documentation authority precondition

Before package ingestion or any planning/task side effect, run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'`. Require exit zero, APPROVED_VALID and planningAllowed. Halt on DENIED; never use loose docs discovery, root ADRs, cached state or invented source material as authority. Read only the selected validated inventory.

Before proposing, creating or amending a task, run `node .agents/scripts/validate-task-authority.ts` with the exact structured authority payload on stdin. Require AUTHORITY_VALID and exit zero. Include package provenance, stable phase/chunk IDs, active scopeIds, typed references and exact indexed source extracts; explicit applicability reasons are required for empty decision/contract references. Recheck immediately before approved issue creation/amendment; a changed fingerprint or extract requires a revised human-reviewed proposal. Preserve the exact approved raw Markdown in Linear. Logs/code are evidence, not permission to add scope. A missing approved requirement/criterion is a blocker.

**Steps:**

1. **Initialize Orchestration:** Invoke `@agent-architect`.
2. **Context Ingestion:** "Use the Linear MCP to fetch Task ID `<task-locator>`. Read the exact `[BLOCKER_ENCOUNTERED]` comment left by the execution agent to identify the missing schema, constraint, or logic requirement."
3. **Validated Discovery:** Read only the approved package's validated inventory. Locate the specific missing source block and stable reference. If it does not exist, output DOCUMENTATION_AUTHORITY_BLOCKER and halt for human resolution and reapproval. Do not invent schemas from architectural conventions.
4. **Bounded proposal:** Output the exact proposed task context amendment, source references and authority payload. Run both shared authority checks. Obtain explicit human APPROVED before applying the unchanged payload through Linear; revalidate immediately before amendment. The ordinary Architect never writes public product authority.

5. **State Reset:** "Use the Linear MCP to transition Task `<task-locator>` from 'Blocked' back to 'Todo'."
6. **Separate orchestrator HUD handoff:** "An explicitly authorized orchestrator, not the Architect, may execute `node .agents/scripts/update-hud.ts --task "<task-locator>" --title "[Fetched Task Title]" --tier "[Read from task: junior, mid, or senior]" --routing-file "[Exact current task JSON path]" --status "Todo" --next "/implement-[tier] <task-locator>"` via `run_command` to instantly update the visual Orchestrator HUD."
7. **Human Gate:** "Output a summary of the injected context. Prompt the Human Orchestrator to review the patch and re-trigger the appropriate execution agent."

## Slice 6 routing precondition

Every generated/amended task embeds the closed taskClassification record from `.agents/docs/task-routing-and-qa.md`. Run `node .agents/scripts/classify-task.ts` on that exact JSON before proposal and again before approved Linear handoff. Require ROUTING_VALID. Copy only derived route/method fields; a missing record or contradiction halts for reviewed amendment. Preserve the approved source/task payload. A senior smoke task always takes critical review and security; backend smoke does not imply browser QA. Private topology cannot bypass the route.

Immediate documentation necessity is optional closed taskClassification metadata: `immediateDocumentation` with required/reason/rationale. Required true needs safe-operation, continued-development, migration, configuration or compatibility plus rationale; false uses null reason/rationale. Include it before fingerprinting/classification. A required update completes in task-bounded `/sync-derived-docs` before the final task review/QA candidate is sealed, and never accepts its Development Phase. Ordinary tasks/chunks do not synchronize documents.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

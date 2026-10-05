---
name: context-sync
description: "Use for explicit /context-sync requests. Enforces operational handoff state updates for agent memory and generates a visual HUD for the Human Orchestrator."
---

## Invocation and required reads

Use the exact human invocation of `/context-sync` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/context-sync"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: the separately authorized execution actor; follow the role/session contract in the procedure. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

**Steps:**

Lifecycle constraint: this is an authorized state-update workflow, not Development Phase/project documentation acceptance. Perform intended tracked updates before sealing review/QA/document readiness; any later Context/HUD commit creates a new candidate. Do not invoke the read-only writer, PM or reviewer to carry out these writes or external actions. Prefer external receipt custody; no automatic post-review commit chain is authorized.

1. **Data Aggregation:** Read the supplied read-only handoff from the completed role session; do not invoke the last active role to perform writes. The separately authorized execution orchestrator checks current inputs and applies the declared state changes.
2. **Instruction:** Summarize the completed realization, downstream mandates, and any observed side-effects (e.g., schema modifications or newly introduced Svelte 5 reactive scopes).
3. **Context Update (Agent Memory):** The authorized orchestrator updates only the approved Agent Handoff Notes section in Context.md via the replace_file_content tool.
4. **HUD Generation (Human Memory):** The authorized orchestrator presents and applies the exact approved dashboard content to a file named HUD.md at the workspace root. You MUST use this exact formatting to create a highly visual dashboard for the human operator:

   # 🛸 TopHat Orchestrator HUD

   _Last Updated: [Current Timestamp]_

   ### 🎯 Active Target
   - **Task:** [Task ID] - [Title]
   - **Dev Tier:** [junior | mid | senior]

   ### 🚦 Pipeline Status

   _[Use emojis to map the current state: 🟢 Done | 🟡 Pending/Next | ⚪ Not Started]_
   - [ ] Implementation
   - [ ] Standard/Critical Review
   - [ ] Security Audit
   - [ ] QA Validation
   - [ ] PR Generation

   ### 🚀 Immediate Next Action
   - **Command:** `[The exact slash command to run next]`
   - **Model:** `[The EXACT recommended LLM model from the matrix]`

   ### 🚧 Active Blockers
   - [None | Describe any blocker stopping the swarm]

5. **External Sync:** Only under explicit Linear comment authorization, the external orchestrator posts the identical Agent Handoff summary as a comment to the active Linear task to ensure external tracking is maintained.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

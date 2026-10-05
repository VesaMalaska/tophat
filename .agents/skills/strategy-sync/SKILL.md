---
name: strategy-sync
description: "Use for explicit /strategy-sync requests. Read-only PM proposals for Strategy and Context, applied by a separately authorized orchestrator."
---

## Invocation and required reads

Use the exact human invocation of `/strategy-sync` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/strategy-sync"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-pm.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. **Prepare the advisory session:** The execution orchestrator reads `.agents/docs/task-routing-and-qa.md` and the role-session contract, captures the existing PM session baseline, and loads `.agents/rules/agent-pm.md`. The PM executes no shell command, file write, Git, HUD or Linear mutation.
2. **Read and propose:** PM reads current Strategy, Context, permitted Roadmap, latest Architect outputs and authorized Linear state. Return proposed Strategy/Context text, exact affected sections, rationale, source references and unresolved conflicts. Preserve durable authority references, material blockers and unresolved decisions; compression never silently deletes them or changes product scope.
3. **Check the session:** Outside PM, the orchestrator invokes `inspect-role-session.ts` through the existing procedure. Missing capture/check is UNVERIFIED; prohibited PM actions reject the result. A proposal is not permission to execute it.
4. **Human gate:** Present the concrete diff and source inputs. Ask the Human Orchestrator to approve those exact edits. Before application, the separately authorized orchestrator rechecks unchanged source inputs and unchanged approved proposal. Drift stops for renewed review; no inferred PM execution exception.
5. **Apply and report:** The authorized orchestrator applies only approved private-state edits, preserves unrelated content and uses `### 🎯 Active Sprint Chunk:` for Context. Complete intended tracked updates before final review/security/QA sealing. Return changed paths, checks, blockers and permitted next command/model from host routingMatrix; do not invoke it automatically.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

---
name: architecture-pivot
description: "Use for explicit /architecture-pivot requests. Propose private planning reconciliation only after revised product authority is approved and valid."
---

## Invocation and required reads

Use the exact human invocation of `/architecture-pivot` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/architecture-pivot"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: `.agents/rules/agent-architect.md`. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Invoke `@agent-architect`; pause task generation. Run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'` before authority ingestion or roadmap/task side effects. Require APPROVED_VALID and planningAllowed. Draft, changed hashes/metadata or stale approval causes a blocker; the human resolves and reapproves authority first.
2. Read only the selected validated package inventory, current private roadmap and relevant existing task evidence. Do not discover loose PRD/ERD files or treat code/root private ADRs as new scope authority.
3. Output a bounded reconciliation proposal for ACTIVE_SPRINT_CHUNK and UPCOMING_CHUNKS, including stable IDs and updated authorityContext provenance. Preserve REALIZED_CHUNKS history. If product meaning remains contradictory, halt rather than mutate requirements.
4. Read the Linear board and output an obsolete/stale task triage report. This does not cancel, rewrite or create issues; new/amended task payloads require fresh package and task-authority checks and their human gates.
5. After explicit human direction, a separate authorized orchestrator revalidates the proposed authority fingerprint and applies only the named private Roadmap/Context/Strategy/HUD changes. The Architect does not violate its declared file-write boundary.
6. Do not run the disabled `/generate-readme` path or autonomously rewrite public documentation. Derived-document synchronization follows the approved lifecycle. Do not execute Git operations implicitly.
7. Summarize exact changed private paths, package provenance and triage decisions for the human. Recommend the appropriate authorized workflow/model from routingMatrix.

## Cooperative macro coordination

TopHat 1.0 does not acquire an automatic global-pivot reservation from IDE command payloads. Before this workflow, the Human Orchestrator pauses concurrent mutating sessions and confirms the selected host/state. Human coordination is required to prevent concurrent mutations; the hook cannot identify or lock the slash workflow from ordinary run_command calls. Do not fabricate a native payload or assume command execution proves global lock coverage. Existing package, role, task, Git and explicit approval gates remain mandatory.

Approval-required native writes are supervised and unreserved. While a prompt waits, do not mutate the target or relevant workspace state; cancel and propose again if state changes. Ordinary applicable native writes retain their existing reservation contract, but this does not protect an entire macro operation or terminal writes.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

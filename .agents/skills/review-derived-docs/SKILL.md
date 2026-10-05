---
name: review-derived-docs
description: "Use for explicit /review-derived-docs requests. Independent read-only document review bound to the finalized documentation candidate."
---

## Invocation and required reads

Use the exact human invocation of `/review-derived-docs` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>`. Read `.agents/docs/command-catalog.json`, host `.agents/tophat.config.json`, Context and the current entry's mandatory resources. Select model advice only from `routingMatrix["/review-derived-docs"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: the separately authorized execution actor; follow the role/session contract in the procedure. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

The orchestrator captures a clean candidate before review and verifies it afterward, including on rejection/failure. Use the existing independent read-only review responsibility and configured review model; do not create a writer/reviewer execution exception.

Review exact approved source references, realized implementation/accepted task evidence, target operations and claim checks. Complete every checklist item from `reviewChecklist` in `validate-derived-docs.ts`: authority correspondence; realized behavior; coverage; setup/configuration; operations/usage; links/examples/screenshots; superseded guidance; private orchestration leakage; and SVG active content when applicable.

Audit SVG scripts, event handlers, unsafe external references and embedded active/XSS content explicitly. A filename/extension does not prove safety. Public guides cannot depend on private roadmaps, agent handoffs, model routing or Linear state. Do not use a blanket TopHat keyword ban when the host product legitimately documents TopHat.

Review a no-change assessment with equal coverage scrutiny. Material claims cannot pass through a prose-only assertion: examine actual supplied artifacts/procedures and applicable verification. Missing necessary evidence is BLOCKED. Realization/authority conflict is DOCUMENTATION_AUTHORITY_CONFLICT.

Return APPROVED, CHANGES_REQUIRED or BLOCKED with exact candidate identity, checklist and findings. Do not edit documents/product/config/receipts, execute commands or mutate Git/Linear/private state. The orchestrator binds the independent receipt to the final nonrecursive candidate fingerprint after postcheck. Reviewer cannot edit and approve their own correction.

Git policy: this workflow authorizes no Git mutation. Any later Git action belongs to a separately authorized execution workflow under the shared Git safety contract; this does not grant command authority to a read-only role.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

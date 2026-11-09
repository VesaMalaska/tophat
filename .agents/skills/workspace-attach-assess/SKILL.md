---
name: workspace-attach-assess
description: "Use for explicit /workspace-attach-assess requests. Run only the explicitly authorized proposed host baseline and preserve failures honestly."
---

## Invocation and required reads

Use the exact human invocation of `/workspace-attach-assess` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source>`; discovery uses external tooling before installation, so installed-host catalog validation belongs to the final installation postcheck. Read `.agents/docs/command-catalog.json`, existing host routing configuration or explicitly supplied candidate routing inputs, and Context if present and the current entry's mandatory resources. Select model advice only from `routingMatrix["/workspace-attach-assess"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: the separately authorized execution actor; follow the role/session contract in the procedure. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Read the current external discovery proposal and `.agents/docs/workspace-attachment.md`. Present proposalFingerprint/hostSnapshotFingerprint, exact ordered `pnpm run <existing-script-name>` commands, script bodies, environment requirements, expected output roots, timeout and output limit. STOP for explicit human authorization of these commands. Slice/brief approval is not host-script permission.
2. Record the exact authorization with schemaVersion, proposal identity/fingerprint, host snapshot, ordered category/script pairs, human, authorizedAt and evidenceLocator. Preserve the genuine interaction outside the host. Receipt fields prove recorded consistency, not consent identity. Missing/stale authorization denies before execution.
3. From the selected host root invoke `node <TopHat-source>/.agents/scripts/assess-attachment-baseline.ts` with `{ "proposal": <exact proposal>, "authorization": <exact authorization> }` on stdin. The helper requires attached expected branch, clean tracked/index state, classified inputs and no active conflicts/operations; it rechecks discovery and invokes the shared runner with the in-memory candidate contract.
4. The ordered union of declared gates is required. Empty optional gates are distinguished; nonempty commitGate cannot be skipped. Stop on first failure; subsequent categories are NOT_RUN. Mapped unselected categories are NOT_SELECTED. Assessment disables pnpm's automatic pre-run dependency installation/version switching; dependencies/runtime setup must already be supplied. No dependencies, arbitrary commands or invented scoped validation are added.
5. Host scripts are not sandboxed. Timeout bounds the spawned pnpm process and buffer size bounds captured output, not total process-tree memory or surviving descendants. Inspect poststate and outputs on every result, including failure. Record both script and mutation failures, command exit/stderr, pre/post Git state, expected artifacts and unexpected outputs. Never remove output automatically or silently repair scripts/files.
6. BASELINE_REQUIRES_DECISION stops attachment. Present the exact original failures. The human can authorize bounded prerequisite remediation or a legitimate revised validation policy. Preserve its rationale and original evidence outside the host; require rediscovery, new command authorization and a fresh passing assessment. No waiver, broad cleanup, category removal without explicit policy review, or staged-only workaround.
7. Only ATTACHMENT_AWAITING_APPROVAL permits presenting the exact assessed write plan for `/workspace-attach-finalize`. Save immutable assessment/decision history externally. No private-state writes, issue creation, installation or Git mutation follows this workflow.

Git policy: this workflow authorizes no Git mutation. Any later Git action belongs to a separately authorized execution workflow under the shared Git safety contract; this does not grant command authority to a read-only role.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

## Terminal applicability

For a validated terminal host, read `.agents/docs/terminal-host-support.md`. Preserve the declared cli/tui mode, closed capability/trait/method mapping and host-approved launch/renderer policy. Do not infer a web server, browser, Electron or styling stack from Node.js. Follow existing actor, authority and exact-candidate boundaries.

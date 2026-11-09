---
name: workspace-attach
description: "Use for explicit /workspace-attach requests. Read-only discovery and explicit proposed contract for an existing supported host."
---

## Invocation and required reads

Use the exact human invocation of `/workspace-attach` within its established scope. Automatic discovery or mere mention loads guidance only; it does not authorize mutation, stage advancement, model/role changes or downstream execution. Existing later proposal/candidate human gates remain mandatory.

**Inputs:** Explicit selected root, scope, authority/candidate and evidence required by the procedure; do not infer these from cwd or trailing tokens. The Antigravity argument transport is COMPATIBILITY_PENDING until observed on the declared IDE installation. Capture the exact payload; never treat `<task-locator>` as a literal ID or invent a template variable. Stop on unresolved legacy substitutions or ambiguous/missing inputs before task actions.

Before dependent actions, the external orchestrator validates the pinned catalog with `validate-command-catalog.ts --root <pinned-source>`; discovery uses external tooling before installation, so installed-host catalog validation belongs to the final installation postcheck. Read `.agents/docs/command-catalog.json`, existing host routing configuration or explicitly supplied candidate routing inputs, and Context if present and the current entry's mandatory resources. Select model advice only from `routingMatrix["/workspace-attach"]`; a missing mapping blocks, with no guessed default. File reads are tools; perform them before checks/writes that depend on their contents.

Read shared rules `.agents/rules/workflows.md`, `.agents/rules/workspace-context.md` and `.agents/rules/workspace-strategy.md`. Load applicable manual role rules explicitly: the separately authorized execution actor; follow the role/session contract in the procedure. A textual @role mention is not loading evidence. Where several tiers are listed, load only the assigned validated tier. Independent reviews use a separate human-selected session; no developer self-approval. Shared `.agents/docs` contracts are distinct from broad product docs access; keep downstream task extracts bounded.

1. Select the exact host repository root and a pinned TopHat source checkout outside the host. Node >=24, Git and pnpm are required. Read `.agents/docs/workspace-attachment.md`. Do not copy the vault, install packages, import host configs, run scripts, alter exclusions, or write any host file during discovery.
2. Invoke `node <TopHat-source>/.agents/scripts/inspect-workspace-attachment.ts '{}'` from that root. It outputs facts and DISCOVERY_REQUIRES_DECISION, which is not a passing attachment gate. Inspect additional source/test/config files read-only where facts are ambiguous; no source evaluation. Existing code is evidence, not new authoritative requirements.
3. Propose a supported `candidateConfig` through the existing parser, preserving routing and host-owned paths. Resolve Node/TypeScript/pnpm/framework evidence, package/documentation conflicts and mixed ownership with the human. Unsupported/mixed root profiles stop; one repository-root contract and root package scripts only. Do not infer a contract from a legacy PRD.
4. Build the exact closed discovery input described in `.agents/templates/workspace-attachment/README.md`: nominated input/output paths, bounded subprocess limits, full config, exact private write bytes/hashes, ownership, installation and scope. Include every required checker/runner/schema/workflow/skill infrastructure file from the pinned source in the manually reviewed inventory; tooling files are not installed by this helper. Root Context/Strategy/Roadmap/HUD collisions need explicit ownership and backup decisions. Preserve unrelated `.agents` files. No public requirements or host package scripts in the write plan.
5. Require fresh approved package validation using the candidate config. Missing/draft/conflicting authority is a separate prerequisite: use human-authorized documentation preparation/definition in a prepared workspace, followed by rediscovery. Do not write temporary host config or invoke definition finalization implicitly. Product documentation changes are independently reviewed, not attachment side effects.
6. Run discovery with that exact JSON on stdin. DENIED/nonzero or unresolved decisions stop. Only BASELINE_AWAITING_AUTHORIZATION permits recommending `/workspace-attach-assess`. Save proposal/observations outside the host worktree; never pre-create private roadmap/evidence files. Do not create Linear tasks or Git changes.
7. Present facts, proposed scope/capabilities, script bodies/order, baseline prerequisites, proposed ownership/install mode, all conflicts and the exact next human decisions. Slash-command adherence is instructed; no physical IDE interception or real-consent authentication is claimed.

Git policy: this workflow authorizes no Git mutation. Any later Git action belongs to a separately authorized execution workflow under the shared Git safety contract; this does not grant command authority to a read-only role.

## Completion, stop and recovery

Return command/task scope, current authority/candidate where applicable, checks actually performed, verdict/blockers, evidence location, permitted next command and its host-configured model. Unknown checks remain UNVERIFIED. Preserve failed/aborted attempts and actual state; no automatic retry, rollback or Git recovery. Developer defects use assigned-tier `/remediate-task` followed by fresh derived review/security/QA; missing existing authority uses `/remediate-blocker`, while new scope requires human documentation reconciliation. Do not invoke the next command automatically.

## Terminal applicability

For a validated terminal host, read `.agents/docs/terminal-host-support.md`. Preserve the declared cli/tui mode, closed capability/trait/method mapping and host-approved launch/renderer policy. Do not infer a web server, browser, Electron or styling stack from Node.js. Follow existing actor, authority and exact-candidate boundaries.

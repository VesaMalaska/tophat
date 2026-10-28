# TopHat Multi-Agent Workflow

This repository contains a reusable TopHat workflow vault for the Google Antigravity IDE. It supplies agent instructions, templates, and selected tool hooks for a human-orchestrated development process. The 1.0 foundation adds a validated workspace declaration, conditional framework guidance, and a shared executor for host-declared validation.

---

## 1. System Architecture & Philosophy

This workflow abandons the "chat-and-pray" model of standard AI coding. It operates on three core principles:

- **Contextual Starvation:** Execution agents are instructed to use bounded Just-In-Time (JIT) task specifications. TopHat 1.0 does not physically prevent them from reading the roadmap or adjacent code.
- **Hierarchical Orchestration:** The swarm is divided into Strategic, Execution, and Validation tiers. Agents do not brainstorm together; they execute strict handoffs via the `Context.md` state file.
- **Validation evidence:** A native Git `pre-commit` hook, when explicitly installed in a configured host, runs the declared `commitGate`. Other gates run when their workflow invokes the shared executor. The IDE hook registry is unverified in the tested standalone IDE and is not the commit boundary.

---

## 2. The Agentic Hierarchy (The Swarm)

The swarm uses specific roles with instructed scope boundaries and selected hook interception. Model selection follows the routing matrix and human workflow choice.

**Strategic & Management Tier**

- **@agent-architect:** Reads the selected approved package and compiles bounded, traceable task proposals. The separate definition-review responsibility may also inspect its package.
- **@agent-pm:** Your session guide. Reads the active Linear board and Strategy.md to recommend the optimal next task and monitor sprint health.

**Execution Tier**

- **@agent-senior-dev:** Handles server-authoritative logic, data mutations, database schemas, and security boundaries.
- **@agent-mid-dev:** Handles client-side state transformations, component logic, and UI view layers.
- **@agent-junior-dev:** Restricted to structural markup and the host project's selected styling.

**Review & Validation Tier**

- **@agent-review-standard:** Validates stateless UI and frontend code against project specifications.
- **@agent-review-critical:** Adversarially audits load-bearing backend code for race conditions and data leaks.
- **@agent-security-auditor:** Reviews OWASP Top 10 mitigation and approved host access-control constraints.
- **@agent-qa:** Follows the current QA workflow for applicable user-facing tasks. Methods derive from the validated task effects/capabilities; approval requires current exact-commit evidence.

---

## 3. Active Commands & Model Selection

The static command catalog owns identity and contracts; this overview introduces all 30 active commands. Host `routingMatrix` owns model advice. Select models manually; invoking a command does not bypass its prerequisites or later human approvals.

### Default model routing profile

The [vault routing matrix](.agents/tophat.config.json) uses the paid Google AI Pro catalog observed on 28 October 2026. It replaces the former Gemini Pro routes and generic model labels with explicit model/version/effort selections. This table summarizes the defaults; the installed host's `routingMatrix` remains the source of model values.

| Model | Default commands | Purpose |
| --- | ---: | --- |
| Gemini 3.8 Flash Medium | 9 | Sprint briefing, strategy/context updates, junior/mid implementation, PR publication, approved definition/attachment finalization and bounded attachment assessment. |
| Gemini 4 Argon High | 20 | Architecture, project definition and definition review, task planning, senior implementation, remediation, diagnostics, standard/security review, QA and derived documentation. |
| Claude Sonnet 5.5 High | 1 | `/review-critical`: concentrate limited Claude allowance on adversarial review of higher-risk work. |
| Claude Opus 5.5 | None | Explicit escalation for a bounded unresolved architectural problem; no automatic default or duplicate pass. |

Review independence comes from separate role sessions and candidate-bound evidence. Every review, security audit and QA stage uses its own role session, independent of the author/implementation session. Cross-family validation is required at `/review-critical`; the default pairs Gemini implementation with Claude review. Other reviews, including `/project-definition-review`, may use an independent session of the same model or family as the author. That is less model diversity than cross-family review. See the [workflow policy](.agents/rules/workflows.md#model-selection-and-independent-validation) for overrides, remediation and supervised enforcement limits.

The typical model sequence is Flash → Argon for junior implementation and standard review, and Flash/Argon → Sonnet → Argon for mid/senior implementation, critical review and the separate security audit. Required QA follows in its own Argon session. Re-select the model from the host config at every transition; when two stages use the same model, start the independent role session without an unnecessary model swap. The task classifier still owns which stages apply.

`/remediate-task` uses Argon conservatively because it can carry senior-level corrections; classification still determines the permitted developer tier. Definition and attachment finalization use Flash to apply an already reviewed, explicitly approved candidate, without granting authority to invent scope or approval.

Budget against the actual account's **Models & Usage** panel. It may expose a general Gemini/Flash allowance, a Claude/GPT allowance, and a separate Argon weekly limit. Use Flash for routine work to preserve the displayed Argon budget, and reserve Claude for critical review and explicit second opinions. Do not assume shared accounting from older documentation or infer a fixed quota multiplier from API prices, elapsed time or percentages of differently sized pools. Missing mappings or unavailable required models block the stage until the human records an explicit routing change; quota exhaustion does not permit a skipped review or silent fallback.

Existing installations preserve host model overrides during upgrades. Adopting this profile in a host is a deliberate config change: preserve its workspace/documentation/validation declarations and custom routing keys, update the selected routes, check the critical reviewer still differs from the actual implementation family, and validate the installed catalog against the pinned source. Updating this vault does not automatically update an installed host.

### Project definition

- [`/project-define`](.agents/skills/project-define/SKILL.md): Prepare a bounded draft product documentation package from incomplete human input.
- [`/project-definition-review`](.agents/skills/project-definition-review/SKILL.md): Independent read-only semantic review of the exact draft documentation candidate.
- [`/project-definition-finalize`](.agents/skills/project-definition-finalize/SKILL.md): Finalize only a reviewed documentation candidate explicitly approved by the human.

### Workspace setup

- [`/workspace-init`](.agents/skills/workspace-init/SKILL.md): Validate an existing supported host and approved package before proposing private roadmap and task state.
- [`/workspace-attach`](.agents/skills/workspace-attach/SKILL.md): Read-only discovery and explicit proposed contract for an existing supported host.
- [`/workspace-attach-assess`](.agents/skills/workspace-attach-assess/SKILL.md): Run only the explicitly authorized proposed host baseline and preserve failures honestly.
- [`/workspace-attach-finalize`](.agents/skills/workspace-attach-finalize/SKILL.md): Explicit human approval and exact orchestrator application of an assessed attachment plan.

### Planning and state

- [`/sprint-briefing`](.agents/skills/sprint-briefing/SKILL.md): Advisory read-only sprint briefing; no PM execution or state mutation.
- [`/generate-sprint-tasks`](.agents/skills/generate-sprint-tasks/SKILL.md): Lead Architect task compilation targeting the Active Sprint Chunk, with strict context isolation and Just-In-Time (JIT) schema injection.
- [`/generate-smoke-test`](.agents/skills/generate-smoke-test/SKILL.md): Generates the environment-specific CI/CD smoke test ticket in Linear.
- [`/roadmap-sync`](.agents/skills/roadmap-sync/SKILL.md): Propose private chunk advancement from completed work and current approved authority.
- [`/context-sync`](.agents/skills/context-sync/SKILL.md): Enforces operational handoff state updates for agent memory and generates a visual HUD for the Human Orchestrator.
- [`/strategy-sync`](.agents/skills/strategy-sync/SKILL.md): Read-only PM proposals for Strategy and Context, applied by a separately authorized orchestrator.
- [`/architecture-pivot`](.agents/skills/architecture-pivot/SKILL.md): Propose private planning reconciliation only after revised product authority is approved and valid.

### Implementation and recovery

- [`/implement-junior`](.agents/skills/implement-junior/SKILL.md): UI/Tailwind implementation pipeline with automated Git and Linear handoff.
- [`/implement-mid`](.agents/skills/implement-mid/SKILL.md): Frontend component logic and client-side reactive state implementation pipeline.
- [`/implement-senior`](.agents/skills/implement-senior/SKILL.md): Secure data and server-authoritative logic implementation pipeline.
- [`/remediate-task`](.agents/skills/remediate-task/SKILL.md): Separate assigned-tier developer remediation followed by a fresh derived review route.
- [`/remediate-blocker`](.agents/skills/remediate-blocker/SKILL.md): Surgical JIT context healing for tasks halted by execution agents due to missing schemas or documentation gaps.
- [`/triage-bug`](.agents/skills/triage-bug/SKILL.md): Conversational, multi-turn bug diagnostic pipeline. The Lead Architect conducts an analytical root-cause interview with the Human Orchestrator before compiling a Linear bug ticket.
- [`/resolve-conflict`](.agents/skills/resolve-conflict/SKILL.md): Reconcile only an already identified, human-authorized merge conflict for an exact task candidate.

### Review and publication

- [`/review-standard`](.agents/skills/review-standard/SKILL.md): Independent read-only review-standard inspection of the exact classified candidate.
- [`/review-critical`](.agents/skills/review-critical/SKILL.md): Independent read-only review-critical inspection of the exact classified candidate.
- [`/security-review`](.agents/skills/security-review/SKILL.md): Independent read-only security inspection of the exact classified candidate.
- [`/qa-validate`](.agents/skills/qa-validate/SKILL.md): Independent proportionate QA with reproducible exact-commit evidence and role postconditions.
- [`/refactor-audit`](.agents/skills/refactor-audit/SKILL.md): Read-only architectural debt findings; no task creation or execution authority.
- [`/publish-pr`](.agents/skills/publish-pr/SKILL.md): Publish the exact evidenced feature head for human review after a read-only readiness check.

### Derived documentation

- [`/sync-derived-docs`](.agents/skills/sync-derived-docs/SKILL.md): Evaluate and synchronize one Development Phase's derived documents, or one explicitly classified immediate task exception.
- [`/review-derived-docs`](.agents/skills/review-derived-docs/SKILL.md): Independent read-only document review bound to the finalized documentation candidate.
- [`/verify-project-docs`](.agents/skills/verify-project-docs/SKILL.md): Verify current product documentation and handoff after all Development Phases have accepted documentation evidence.

---

## 4. State Management & Memory Boundaries

The swarm's memory is isolated into specific operational files:

- `Roadmap.md`** & **`Strategy.md`** (Long-term Memory):** Private derived sequencing and memory. The Architect proposes changes; named authorized orchestrator steps apply them. PM reads and advises only; separate orchestrator steps apply state.
- `Context.md`** (Short-term Working Memory):** The live operational handoff document. It tracks the active phase and immediate blockers. Updated by authorized orchestrator steps before the candidate QA run; later commits require fresh approval.
- `.agents/`** (The Vault):** The directory containing the active Skills (`.agents/skills/skill-1-name/SKILL.md`), Rules (`.agents/rules/*.md`), command skills (`.agents/skills/<command>/SKILL.md`), and tool interception scripts.

---

## 5. The Execution Lifecycle (The Grind)

The human orchestrator drives the swarm through distinct Workflow Stages. Do not skip steps or automate across workflow boundaries.

### 5.1. Workspace Initialization Stage

These commands are run once at the beginning of a project, or immediately following a full `/architecture-pivot`.

1. `/workspace-init`: Validates the host and selected approved package, then proposes private Roadmap/Context/Strategy initialization for human authorization.
2. If product input is incomplete, use `/project-define`, independent `/project-definition-review`, and exact-candidate human-gated `/project-definition-finalize` before initialization.

Existing projects use `/workspace-attach`, explicitly authorized `/workspace-attach-assess`, and approval-gated `/workspace-attach-finalize`. Discovery writes nothing; assessment runs only declared host scripts and checks all exits for side effects. See [attachment](.agents/docs/workspace-attachment.md) and the [record contract](.agents/templates/workspace-attachment/README.md). Missing/legacy host config is reviewed in memory, never silently migrated.

### 5.2. Task execution and publication

1. `/sprint-briefing` reads existing state/evidence and advises; it performs no command or mutation.
2. `/generate-sprint-tasks` proposes traced tasks with a closed validated classification. Human APPROVED authorizes exact issue creation.
3. Execute the classified developer tier. Junior takes standard review; mid/senior take critical review followed by security. Finalize intended tracked private-state synchronization before final review/QA.
4. Run independent `/qa-validate` only when the classifier requires methods. Record the exact commit/build, criterion evidence and role postconditions. Backend/internal work may record a justified QA skip.
5. `/publish-pr` requires the current stage/validation/QA evidence before opening the exact feature-head PR. Any later commit invalidates QA. Separate human approval authorizes merge.

### 5.3. Handling Blockers & Mid-Flight Pivots (The Emergency Brakes)

The development pipeline advances through human-invoked workflows. The read-only HUD watcher polls documentation readiness to detect nested edits or missed filesystem events. When an execution agent encounters a missing dependency, missing schema, or architectural contradiction, it will throw a `[BLOCKER_ENCOUNTERED]` payload, transition the task to Blocked in Linear, and halt.

Depending on the severity of the missing context, the Human Orchestrator must execute one of two recovery workflows:

#### 5.3.1. The Micro-Patch: `/remediate-blocker [ID]`

Use this when the overall architecture is sound, but a specific blueprint is missing a measurement (e.g., a missing TypeScript interface, an undefined database column, or an unstated business rule).

- **Action:** Run `/remediate-blocker [Linear ID]`.
- **Execution:** The Architect locates the missing context in current approved authority, validates the exact task amendment, and requests human approval before applying it. Missing authority is a blocker; the Architect cannot invent a schema.

#### 5.3.2. The Macro-Reset: `/architecture-pivot`

Use this only when the fundamental architecture has shifted (e.g., swapping from a REST API to GraphQL, or migrating from SQLite to PostgreSQL). This is computationally expensive and alters the master timeline.

- **Action:** Prepare and explicitly reapprove the revised selected documentation package. Then run `/architecture-pivot`; changed hashes or authority metadata block planning until reapproval.
- **Execution:** The Lead Architect halts the swarm, recalculates the entire `Roadmap.md`, and outputs a triage hit-list of active Linear tasks (including tasks with 'Blocked' status) that are now structurally obsolete. You must manually cancel obsolete tasks and run `/generate-sprint-tasks` to fill the gaps.

#### 5.3.3. The Diagnostic Emergency Brake: `/triage-bug`

When an execution agent fails, an E2E Playwright test violently crashes, or an unhandled native OS exception halts the application, **do not attempt to manually edit code or hack a fix locally.** Doing so breaks Contextual Starvation and introduces Git drift.

Instead, pull the diagnostic emergency brake by initiating `/triage-bug`. This transitions the Lead Architect (`@agent-architect`) into a forensic investigator role.

**The Diagnostic Choreography:**

1. **The Interview Loop:** Select the model from host `routingMatrix["/triage-bug"]` and pass the raw error log, stack trace, or behavioral description to `/triage-bug`. The Architect will not immediately guess a solution or write a task. It will analyze the compiled artifacts, check system boundaries (e.g., IPC bridges, ESM/CJS compilation layers), and ask you targeted clarifying questions across multiple conversational turns.
2. **The Synthesis Trigger:** Answer the Architect's questions to narrow down the blast radius. Once you and the Architect have forensically confirmed the root cause, reply with the exact command **`GENERATE BUGFIX`**.
3. **The Authorization Gate:** The Architect will compile a standalone, defensible Linear bug specification with regression criteria for the host's declared test runner. Review the task block and reply **`APPROVED`** to push the ticket to your Linear Todo column.
4. **Execution Handoff:** Once the ticket is on the board, route it to the appropriate Dev Tier (e.g., `/implement-mid [BUG-ID]` or `/implement-senior [BUG-ID]`) to let the swarm self-heal under automated CI/CD enforcement.

---

## 6. Validation and tool guardrails

The native Git hook runs `.agents/scripts/run-validation.ts` before a commit when installed. It verifies the configured categories and host `package.json` scripts before executing `pnpm run <script-name>` in declared order. A missing script, failed command, unreadable config, or tracked-file mutation during validation denies the commit. A passing report identifies the pre-commit snapshot and the existing `HEAD`; it does not claim that a new commit already exists. Git's `--no-verify`, an uninstalled hook, or a different `core.hooksPath` bypasses this local gate.

TopHat 1.0 is a **supervised, cooperative workflow**. Agent instructions, selected IDE guardrails and invoked validators help the human coordinate work; they do not isolate the agent or prevent every mutation. Controlled execution and stronger capability boundaries belong to 2.0/CLI architecture.

`.agents/hooks.json` keeps its direct Node handlers enabled. The adapter derives the installed host from its own module and runs unchanged protected-write/framework policy checks. Approval-required writes use force_ask and are **supervised and unreserved**: no automatic acquisition, post-approval freshness check or release is claimed. The post path skips release based on the original protected-write arguments; genuine ordinary-write ownership/release failures remain visible. Other applicable native writes retain the existing initialized-Git reservation contract.

Ordinary and unmanaged commands proceed without automatic global-pivot coverage; command text is not slash-workflow identity, and terminal writes can bypass native-file guardrails. The human pauses concurrent mutations during `/workspace-init` and `/architecture-pivot`. If state changes while approval waits, cancel and make a fresh proposal. No universal mutation interception, post-approval freshness or automatic reservation coverage is promised for prompted writes.

This revised production adapter is **COMPATIBILITY_PENDING**, not a supported cutover yet. Physical Antigravity 2.19.1 diagnostics established selected deny/prompt behavior, while a multi-handler lock trial failed approval ordering. That route remains rejected. See [hook support](.agents/docs/antigravity-hook-support.md) for the bounded production verification still needed, and [the boundary registry](.agents/BOUNDARIES.md) for the exact limits. Catalog equality, validators and native Git gates are unchanged.

---

## 7. Prerequisites & Setup

### Workspace configuration and framework selection

`.agents/tophat.config.json` is shipped in this vault as an **unconfigured template**: `schemaVersion` and the existing `routingMatrix` are present, but `workspace`, `documentation`, and `validation` are `null`. This vault has no host application or approved project package, so selecting a framework or inventing scripts here would misrepresent it. After copying the vault into a supported Node.js/TypeScript/pnpm project, fill those sections before calling the loader. The loader denies the unconfigured template; it does not infer Svelte.

For example, replace the three `null` fields in a SvelteKit host project with the following structure, using that project's actual documentation paths and `package.json` script names:

```json
{
  "workspace": { "kind": "web", "framework": "sveltekit" },
  "documentation": {
    "package": "docs/project",
    "manifest": "manifest.json",
    "derivedTargets": ["README.md"]
  },
  "validation": {
    "scripts": { "typecheck": "check", "lint": "lint", "unit": "test:unit", "build": "build" },
    "commitGate": ["typecheck", "lint", "unit", "build"],
    "developmentPhaseGate": ["typecheck", "lint", "unit", "build"],
    "projectCompletionGate": ["typecheck", "lint", "unit", "build"]
  }
}
```

These are replacement fields inside the existing config, not another configuration file. This example is illustrative and does not claim that the vault contains `docs/project` or these host scripts.

Set `workspace.kind` and `workspace.framework` to one of: `web` with `svelte`, `sveltekit`, `react`, or `nextjs`; `backend` with `none`; or `desktop` with `svelte`, `react`, or `none`. Terminal hosts additionally support `{ "kind": "terminal", "framework": "none", "mode": "cli" }` or mode `"tui"`; mode is required only for terminal hosts. Capabilities are derived from the validated profile and cannot be declared independently. `documentation.package` is a workspace-relative directory, `documentation.manifest` is a relative file within it, and `documentation.derivedTargets` lists explicit relative files or directories outside private TopHat state. The config loader only validates declarations. The separate documentation validator checks package approval, files, fixed schema, graph, source relationships, hashes and authority fingerprint before planning.

Map any selected validation category to a **package-script name**, not a shell command. Allowed categories are `typecheck`, `lint`, `unit`, `coverage`, `integration`, `build`, `smoke`, `e2e`, and `documentation`. `commitGate` must be nonempty; `developmentPhaseGate` and `projectCompletionGate` must be arrays and may be empty to request an explicit `SKIPPED_NOT_APPLICABLE` report. Selected categories must map to scripts present in the host `package.json`. The project owns the test runner, coverage provider, exclusions, and thresholds. The TopHat repository's own `pnpm test:tophat` uses Node 24's TypeScript type stripping and is separate from host validation; it does not type-check tests.

After configuring the host and its pnpm scripts, run **from its repository root**:

```bash
node .agents/scripts/install-git-hook.ts < /absolute/external/hook-preflight-request.json
```

The installer denies an existing `pre-commit` hook or configured `core.hooksPath` without changing it; integrate the versioned `.agents/git-hooks/pre-commit` manually if your project already manages hooks. Installation writes to that clone's `.git/hooks/`, which Git does not version; repeat it for each clone. Verify with `git config --get core.hooksPath` (no output when unset) and inspect `.git/hooks/pre-commit`. Before treating the gate as active, make a harmless test commit with a deliberately failing declared script in a disposable clone and confirm `HEAD` does not advance. Run optional phase and completion gates explicitly with `node .agents/scripts/run-validation.ts '{"gate":"developmentPhaseGate"}'` or `'{"gate":"projectCompletionGate"}'`.

Slice 2 uses the derived capabilities for framework-sensitive selection. Before a task proposal and handoff, the Architect supplies the proposed `requestedSkills`, `taskTopics`, and `frameworkInstructions` arrays as JSON on stdin to `pnpm exec tsx .agents/scripts/select-task-guidance.ts`. A `SELECTED` result permits those labels; a nonzero `DENIED` result blocks incompatible or undeclared selections. For example, a React project cannot request a Svelte skill; a Tailwind skill requires an explicit `tailwind` task topic. This check validates the proposal, not the truth of arbitrary prose in an external issue. The host must configure the vault before using it. The smoke workflow selects a web, backend, Electron, or terminal CLI/TUI specification from the host profile; QA classification is checked by the Slice 6 task classifier.

To deploy this workflow on a fresh repository, ensure your local environment and project structure meet the following strict requirements:

### 7.1. System Requirements

- **Node.js:** `>= 24.0.0` for TopHat 1.0 and its supported host projects.
- **Package Manager:** `pnpm`
- **Antigravity IDE:** Linear MCP Extension must be installed and authenticated.
- **GitHub CLI:** GitHub CLI must be installed and authenticated for PR creations.

### 7.2. Human Orchestrator Initialization (MANDATORY)

The TopHat swarm does not initialize package managers or install base frameworks. **Before running `/workspace-init`**, the Human Orchestrator must bootstrap the execution stack, configure the vault, and supply an approved valid package.

1. **Initialize the Framework:** Generate your base application scaffolding (e.g., SvelteKit, Vite, Electron).
2. **Verify Hook Runtime:** The IDE runner must inherit Node >=24. Registered hooks use native Node TypeScript execution and require no pnpm/tsx bootstrap. Install host TypeScript or other development dependencies only as required by the host project.
3. **Verify Lockfile:** Ensure `package.json` and `pnpm-lock.yaml` are present at the workspace root.

Install a test runner, browser tooling, and styling framework only when the host project and its task contract require them. Other workflow instructions still use `pnpm exec tsx`; install tsx explicitly if using those entry points. Registered hooks and the TopHat repository's own tests use Node >=24 directly.

### 7.3. Documentation package and private state

Product documentation lives under the configured `docs/<package>/`: README.md, manifest.json (or the configured relative manifest filename), manifest.schema.json and project-specific numbered documents. Private Roadmap.md, Strategy.md, Context.md, HUD.md, root DECISIONS.md and `.agents/` remain separate. Do not put TopHat model assignments, Linear workflows or private execution contracts in public product documents. Do not blanket-ignore `docs/` to hide orchestration.

Copy `.agents/templates/documentation-package/` only as a **draft scaffold**, choose appropriate product documents, and supply the host config before running checks. The vault remains intentionally unconfigured. A single combined authority document is permitted; no fixed document count or project-specific document set is required. Existing packages may need deliberate adaptation to the canonical v1 contract; compatibility must be verified explicitly.

```bash
node .agents/scripts/validate-doc-package.ts '{"mode":"draft"}'
node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'
node .agents/scripts/validate-task-authority.ts < private-task-authority-request.json
node .agents/scripts/finalize-doc-package.ts < private-finalization-request.json
```

The validators are read-only. Draft success is DRAFT_VALID with planningAllowed false; approved success is APPROVED_VALID. Denials are nonzero and identify the failure; hash mismatch reports expected/calculated hashes without repairing files. The finalizer requires matching private review/approval receipts for the exact candidate and atomically writes only the approved manifest. It does not create tasks, initialize a roadmap, commit or publish. See the three [definition workflows](.agents/skills/project-define/SKILL.md) and [task contract](.agents/skills/generate-sprint-tasks/SKILL.md) for exact receipt/request fields.

The published package schema must match `.agents/schemas/doc-manifest.schema.json` structurally; the closed v1 validator rejects weakened schemas, duplicate JSON members, unknown fields, unresolved ownership/dependencies, cycles, invalid status/scope/decision relationships and unsafe paths. Package paths use POSIX `/` separators, must stay below docs, and cannot contain traversal, backslashes, symlink components or case-folded/file-identity collisions. Windows-shaped absolute/drive paths are rejected before native path resolution.

Every source item is declared in the manifest and has one literal anchor line, e.g. `<a id="REQ-001"></a>`. Horizontal whitespace around anchor syntax is accepted; examples in backtick/tilde fences do not count. Source text runs to the next declared anchor or EOF. Tasks reference document-id#item-id, include exact source blocks and match the active chunk's private JSON authorityContext. Only CRLF/LF transport normalization is permitted for extracts. Semantic relevance/completeness still requires review.

Authoritative hashes use exact bytes. The **authority fingerprint** binds manifest metadata, schema and authoritative bytes; it is recorded in the approved manifest and task/roadmap provenance. The **candidate fingerprint** additionally binds entry-guide/derived bytes for definition review and finalization. Ordinary derived-byte edits do not invalidate unchanged authority, but do stale a definition review candidate. Approved authority edits require new package version, fresh independent review and matching explicit human approval. Derived synchronization follows the bounded Slice 7 lifecycle.

Receipts establish recorded consistency; they cannot authenticate a human or prove that a recorded approval genuinely occurred. An already human-approved package can validate without using the optional definition stage. Gate invocation, source selection and exact Linear handoff are instructed behavior; no physical planning/IDE interception or read sandbox is claimed. The local native Git gate retains its Slice 3 installation/bypass limits. The parser bounds JSON nesting at 128 levels and denies deeper input instead of risking uncontrolled recursion.

### 7.4. The Command Center (The HUD)

To survive the cognitive load of manual swarm orchestration, TopHat utilizes a local, terminal-based Heads-Up Display (HUD). This passive radar watches your workflow and gives you real-time visual feedback on the active pipeline state and your next required command.

**How to Boot the HUD:**
To start the HUD run: `node .agents/scripts/watch-hud.ts`. It revalidates authority on each render and every two seconds; filesystem watch failure or temporary missing/locked files produces a blocked diagnostic rather than crashing the terminal.

The documentation state is DRAFT, AWAITING_HUMAN_APPROVAL, APPROVED or INVALIDATED. REVIEW REQUIRED indicates missing/stale/blocked review evidence. When config/manifest cannot establish a lifecycle state, UNAVAILABLE — VALIDATION DENIED is a diagnostic, not an invented transition. A hand-edited approved label cannot override current validation. Unrelated blockers are preserved.

### 7.5. **Linear Team Configuration (Mandatory)**

The TopHat swarm does not have admin privileges to create workflow states in your Linear workspace. For the automated handoffs to function, you **must** manually configure your Linear Team's workflow to include these exact custom statuses (case-sensitive):

**Backlog**

- `Backlog`
  - **description:** Manual holding zone for human-logged technical debt, out-of-band feature requests, or suspended tasks not currently in the Active Sprint Chunk.

**Unstarted**

- `Todo`
  - **description:** JIT-compiled tasks for the Active Sprint Chunk. Verified by Architect and ready for Dev Tier branch checkout.

**Started**

- `In Progress`
  - **description:** Issues currently being actively developed or worked on.
  - **type:** Workspace Default
- `Blocked`
  - **description:** Execution halted due to missing schemas, structural blockers, or pending dependencies. Requires Architect or Human intervention.
- `In Review: Architecture`
  - **description:** Triggered post-implementation.
- `In Review: Security`
  - **description:** Triggered post-critical review.
- `In Review: QA`
  - **description:** Triggered post-standard/security review.
- `Ready for PR`
  - **description:** Triggered when all audits pass.
- `In Review: Orchestrator`
  - **description:** Triggered after PR generation.
- `Changes Requested`
  - **description:** Code failed Review/QA/Security and awaits remediation.

**Completed / Canceled**

- `Done`
  - **description:** Issues that have been successfully completed.
- `Canceled`
  - **description:** Issues that have been abandoned or are no longer relevant.
- `Duplicate`
  - **description:** Issues that replicate an existing item and will not be tracked separately.

_(Note: If these exact strings are not present in your Linear workflow settings, the agents will fail when attempting to transition tasks, halting the automated pipeline)._

### 7.6. Installation and manual detachment

Choose **tracked/shared** or **local/private** explicitly. Shared mode intentionally versions the exact TopHat inventory. Local mode appends only reviewed per-file exclusions to `.git/info/exclude`, preserving host rules. Exclusions cannot hide already-tracked files or ensure a client archive omits them. Never exclude public docs or a mixed `.agents` directory wholesale; review the actual handoff inventory.

[Attachment guidance](.agents/docs/workspace-attachment.md) covers approval, baseline failures and bounded v0.8 migration. [Manual detachment](.agents/docs/workspace-detachment.md) presents exact known private paths and current hashes for human approval, then verifies preservation of product code, docs, scripts, lockfiles and history. The read-only helper never removes files. Existing/shared hooks and redirected hooksPath remain host integrations requiring separate review.

Helpers enforce recorded proposal/snapshot/receipt consistency when invoked. They cannot authenticate consent or physically prevent an agent bypass. Host validation scripts are not sandboxed. Attachment assessment sets per-command time/output limits and disables automatic pnpm setup; those limits do not promise complete descendant termination or a process-memory sandbox. File application and removal are separate explicitly authorized actions, with truthful postcondition verification.

## Routing, QA evidence and advisory roles

Slice 6 uses one closed task classification: junior → standard review; mid/senior → critical review and security. User-facing effects derive compatible QA methods, including static styling/visual/responsive and accessibility changes; justified internal/backend-only work records QA_NOT_APPLICABLE. Independent fields or private topology cannot override the route. Model selection still comes from routingMatrix.

QA records the exact commit/build/environment, controlled test data, criterion matrix, method results and intact artifacts. Publication validates the latest required records and current state; Linear/HUD status alone is not approval. Any later commit, including private-state synchronization, invalidates QA. Finalize intended tracked state before testing; publish-pr no longer writes/commits Context after QA.

PM/Sprint Briefing performs file/MCP reads and advisory output only. It executes no shell, tests, builds, Git, helper or HUD/task mutation. The orchestrator captures and verifies state outside that session and applies human-selected follow-up separately. Review/QA do not fix product code; developers remediate, then independent applicable review/security/QA repeats.

See `.agents/docs/task-routing-and-qa.md` for exact JSON interfaces, evidence custody, failure behavior, inspection limits and examples. These are deterministic checks when invoked plus instructed role boundaries and postcondition detection. No physical Antigravity interception, reviewer authentication, invisible-operation audit or OS sandbox is claimed.

## Derived documentation lifecycle

At every Development Phase boundary, `/sync-derived-docs` evaluates declared host documentation and produces bounded changes or a reviewed explicit no-change outcome. `/verify-project-docs` independently verifies the current final handoff. Ordinary tasks/chunks do not trigger synchronization; fingerprinted immediate necessities are narrow exceptions and never accept the enclosing phase.

The technical writer edits only an exact human-approved plan within validated derived targets. It cannot run commands or change product code/tests/config, authority, package infrastructure or private orchestration. A separately authorized orchestrator captures/verifies the session, runs host-declared checks, persists external evidence and publishes. The independent document reviewer checks correspondence, coverage, links/examples and private leakage, including SVG active content. These are instructed boundaries with deterministic postcondition/readiness checks when invoked, not an OS sandbox or verified Antigravity role hook.

Documentation-only PRs have an explicit candidate-bound review/check/claim-evidence gate from accepted integrated task work. Combined product/documentation PRs retain fresh Slice 6 exact-HEAD QA after documentation commits. Old QA is historical, never refreshed implicitly. Phase/final acceptance and PR merge each require explicit human approval. No post-review private-state commit chain is automatic. See [.agents/docs/derived-documentation.md](.agents/docs/derived-documentation.md) for exact interfaces, limits and custody.

### Git safety

All authorized Git mutations follow [the shared Git contract](.agents/docs/git-safety.md): read-only preflight checks exact branch/HEAD, index and intended bytes, remote policy and conflicts; execution checks each result and postcondition. Stage only exact reviewed files. Conflict reconciliation is limited to an explicitly authorized existing merge. Hook installation now requires the exact git-integration request on stdin, including approved current host state and native hook digest; missing input denies before writes.

These checks run when invoked. They do not intercept arbitrary terminal/IDE/GitHub commands, eliminate races or authenticate consent. Publication retains exact-candidate QA/document evidence and merge requires separate human approval. No automatic destructive recovery or WIP publication. The [adoption inventory](.agents/docs/git-adoption.json) covers active workflow instructions.

### Integrated acceptance and release readiness

TopHat 1.0 acceptance is tracked against all 30 approved criteria in `.agents/docs/acceptance-criteria.json`. Install the isolated runner fixture with `pnpm --dir .agents/tests/fixtures/runner-neutral install --frozen-lockfile`, install guidance fixtures with `pnpm --dir .agents/tests/fixtures/guidance-runtime install --frozen-lockfile`, then run `pnpm run test:tophat`. The fixture proves actual Node/Vitest TDD and host-owned coverage outcomes; framework guidance fixtures do not certify complete applications or native OS support.

See [.agents/docs/acceptance-evidence.md](.agents/docs/acceptance-evidence.md) for the read-only dossier verifier and [.agents/docs/release-readiness.md](.agents/docs/release-readiness.md) for v0.8.0 migration and separate release approvals. A green suite is not a release decision. Live host project initialization, task/route/QA evidence, phase synchronization and final project-documentation acceptance remain required before TopHat 1.0 release readiness.

### Command catalog and packaging

The [static catalog](.agents/docs/command-catalog.json) defines 30 active commands, 18 topical guidance skills and historical retirement metadata. Host `.agents/tophat.config.json` routingMatrix owns model recommendations; choose models manually at role transitions. Use the [manual upgrade and compatibility probe](.agents/docs/command-migration.md) for owned-path conversion and recovery. No active legacy workflow files are shipped.

Run `node .agents/scripts/validate-command-catalog.ts --root <pinned-source>` for vault validation; add `--host-root <host>` to inspect a configured installed copy. Shared dependencies, roles and helpers belong to the reviewed installation inventory. Source checks and Linux compiler/browser fixtures do not establish Antigravity activation, argument transport or interception: compatibility is pending live observations. Merge, real host acceptance and release remain separate approvals.

### Terminal CLI/TUI hosts

Read the [terminal host contract](.agents/docs/terminal-host-support.md) before onboarding. CLI has process/I/O/QA capabilities; TUI adds interactive screen capability. Static TUI layout routes junior, localized input/state routes mid, and process/filesystem/secret/internal work routes senior; mixed work takes the highest tier. The new topical `terminal-qa-flows` skill covers only selected flow/presentation methods. Terminal dimensions live exclusively in typed rows/columns, with no browser viewport projection.

The generic Linux PTY fixtures require existing util-linux `script` and GNU `stty`. They observe input, resize, exit and termios restoration using Node; they do not certify native renderer/glyph behavior, every OS, Antigravity hooks or a real consumer-host installation. Product pilot and release acceptance remain separate.

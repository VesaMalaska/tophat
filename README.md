# TopHat Multi-Agent Workflow

This repository contains a reusable TopHat workflow vault for the Google Antigravity IDE. It supplies agent instructions, templates, and selected tool hooks for a human-orchestrated development process. Its initial 1.0 foundation adds a validated workspace declaration; framework isolation and shared validation are completed in later slices.

---

## 1. System Architecture & Philosophy

This workflow abandons the "chat-and-pray" model of standard AI coding. It operates on three core principles:

- **Contextual Starvation:** Execution agents are instructed to use bounded Just-In-Time (JIT) task specifications. TopHat 1.0 does not physically prevent them from reading the roadmap or adjacent code.
- **Hierarchical Orchestration:** The swarm is divided into Strategic, Execution, and Validation tiers. Agents do not brainstorm together; they execute strict handoffs via the `Context.md` state file.
- **Validation evidence:** Existing hooks intercept selected tool calls, while reviews are workflow instructions. The v0.8.0 commit gate currently runs `pnpm check` and `pnpm lint`, conditionally adds build and smoke commands, and does not run Vitest. Fail-closed behavior and project-declared pnpm execution are later 1.0 work.

---

## 2. The Agentic Hierarchy (The Swarm)

The swarm uses specific roles with instructed scope boundaries and selected hook interception. Model selection follows the routing matrix and human workflow choice.

**Strategic & Management Tier**

- **@agent-architect:** The only agent allowed to read the PRD/ERD. Compiles JIT task batches and dictates architectural boundaries.
- **@agent-pm:** Your session guide. Reads the active Linear board and Strategy.md to recommend the optimal next task and monitor sprint health.

**Execution Tier**

- **@agent-senior-dev:** Handles server-authoritative logic, data mutations, database schemas, and security boundaries.
- **@agent-mid-dev:** Handles client-side state transformations, component logic, and UI view layers.
- **@agent-junior-dev:** Restricted entirely to structural markup (HTML) and styling (Tailwind).

**Review & Validation Tier**

- **@agent-review-standard:** Validates stateless UI and frontend code against project specifications.
- **@agent-review-critical:** Adversarially audits load-bearing backend code for race conditions and data leaks.
- **@agent-security-auditor:** Enforces OWASP Top 10 mitigation and strict Row Level Security (RLS) constraints.
- **@agent-qa:** Executes Playwright E2E tests, verifying edge cases, error states, and accessibility standards.

---

## 3. Workflow Commands & Model Matrix

Do NOT attempt to run implementation as an automated, continuous script. The Human Orchestrator manually orchestrates these commands and swaps the LLM model at each workflow transition.

### Foundational Workflow Stage Commands

- `/workspace-init`: Bootstraps environment, verifies Tech Stack constraints, generates initial Roadmap.md.
  - **Recommended Model:** Claude Opus (Requires zero-shot semantic mapping of entire PRD).
- `/architecture-pivot`: Halts swarm, recalculates master timeline, triages obsolete Linear tasks.
  - **Recommended Model:** Claude Opus (Requires high adversarial precision to prevent data loss).
- `/generate-readme`: Invokes Architect to execute multi-document semantic synthesis across specs and ERDs to generate the master README.md template.
  - **Recommended Model:** Gemini Pro High (Required for advanced cross-referencing and rigid template adherence).

### Standard Automation Workflows

- `/sprint-briefing`: Invokes `@agent-pm` to output the sprint briefing.
  - **Recommended Model:** Gemini Flash High (Optimized for fast state-checking).
- `/generate-sprint-tasks`: Invokes `@agent-architect` to JIT-compile the active sprint chunk.
  - **Recommended Model:** Gemini Pro High (Optimized for massive context window / directory RAG).
- `/roadmap-sync`: Synchronizes master timeline based on completed chunks.
  - **Recommended Model:** Gemini Pro High (Requires deep context alignment).
- `/context-sync` & `/strategy-sync`: Summarizes decisions and compresses state memory.
  - **Recommended Model:** Gemini Flash Medium (Optimized for token compression).
- `/triage-bug [Log/Description]`: Invokes `@agent-architect` for a multi-turn diagnostic interview to forensically isolate root causes before generating a Linear bug ticket.
  - **Recommended Model:** Claude Sonnet (Optimized for deep conversational reasoning, diagnostic inquiry, and strict phase gating).

### Implementation & Remediation Commands

- `/implement-senior [ID]`: Invokes `@agent-senior-dev` to execute backend, database, or security tasks.
  - **Recommended Model:** Gemini Pro High (Optimized for deep reasoning and severe constraint adherence).
- `/implement-mid [ID]`: Invokes `@agent-mid-dev` to execute reactive frontend logic and client state transformations.
  - **Recommended Model:** Gemini Flash High (Optimized for rapid instruction following and sub-second TDD cycles).
- `/implement-junior [ID]`: Invokes `@agent-junior-dev` to execute raw structural layouts and Tailwind styling passes.
  - **Recommended Model:** Gemini Flash Low (Optimized for high-speed, low-cost deterministic layout compilation).
- `/remediate-blocker [ID]`: Architect autonomously extracts missing schema context for a blocked task.
  - **Recommended Model:** Gemini Pro High (Directory RAG across docs/).
- `/remediate-task [ID]`: Surgical Dev Tier fixes based on rejection comments.
  - **Recommended Model:** Gemini Pro High (Requires cross-referencing PRD with audit failures).

### Validation & Pipeline Commands

- `/review-standard [ID]`: Validates stateless UI and frontend code against project specifications.
  - **Recommended Model:** Claude Sonnet (Cross-model validation against Gemini implementations).
- `/review-critical [ID]`: Adversarially audits load-bearing backend code for race conditions.
  - **Recommended Model:** Claude Sonnet (Cross-model validation against Gemini implementations).
- `/security-review [ID]`: Enforces OWASP Top 10 mitigation and strict RLS constraints.
  - **Recommended Model:** Claude Sonnet (Adversarial security posture).
- `/qa-validate [ID]`: Evaluates edge cases, Playwright resilience, and UI degradation.
  - **Recommended Model:** Gemini Pro Low (Requires Vision-enabled UI analysis).
- `/publish-pr [ID]`: Generates final PR and merges approved work.
  - **Recommended Model:** Gemini Flash Medium (Lightweight API/CLI execution).

---

## 4. State Management & Memory Boundaries

The swarm's memory is isolated into specific operational files:

- `Roadmap.md`** & **`Strategy.md`** (Long-term Memory):** The master application sequencing. Read/Write access is strictly locked to the Architect and PM agents.
- `Context.md`** (Short-term Working Memory):** The live operational handoff document. It tracks the active phase and immediate blockers. Updated by agents after every completed task.
- `.agents/`** (The Vault):** The directory containing the active Skills (`.agents/skills/skill-1-name/SKILL.md`), Rules (`.agents/rules/*.md`), Workflows (`.agents/workflows/*.md`), and tool interception scripts.

---

## 5. The Execution Lifecycle (The Grind)

The human orchestrator drives the swarm through distinct Workflow Stages. Do not skip steps or automate across workflow boundaries.

### 5.1. Workspace Initialization Stage

These commands are run once at the beginning of a project, or immediately following a full `/architecture-pivot`.

1. `/workspace-init`: Bootstraps the environment, verifies all dependencies and mandatory PRD declarations, and generates the master `Roadmap.md`.
2. `/generate-readme`: The Architect synthesizes the core specs to build the client-facing README, and simultaneously injects the crucial `Host Project Snapshot` into `Context.md` for downstream agent reference.

### 5.2. Daily Workflow Stages

This is the core iterative loop for chewing through the backlog. It begins with session prep and splits into two distinct execution routes depending on the task's Dev Tier and routing constraints.

**A. Session Prep (Run at the start of a sprint chunk or daily session)**

1. `/generate-sprint-tasks`: The Architect JIT-compiles a batch of Linear-ready tasks for the active sprint chunk (Requires a human "APPROVED" phase-2 commit).
2. `/sprint-briefing`: The PM Agent briefs you on sprint health and assigns the optimal Task ID to begin.

**B. The Standard Route (UI, Layouts, Client State)**
For tasks routed to `@agent-junior-dev` or `@agent-mid-dev`.

1. `/implement-[tier] [ID]`: Dev Agent checks out branch, writes Vitest specs, implements code, commits, and pushes.
2. `/review-standard [ID]`: Routes the branch through standard syntax and framework validation.
3. `/context-sync`: Updates `Context.md` with the newly realized state.
4. `/publish-pr [ID]`: Generates the final pull request.

**C. The Critical Route (Backend, Database, Auth, High-Risk)**
For tasks routed to `@agent-senior-dev`. This is an adversarial, multi-agent validation pipeline.

1. `/implement-senior [ID]`: Senior Dev Agent executes secure data or server-authoritative implementation.
2. `/review-critical [ID]`: Triggers an adversarial concurrency and state-bleeding audit.
3. `/security-review [ID]`: The Security Auditor enforces OWASP Top 10 mitigation and strict RLS constraints.
4. `/qa-validate [ID]`: Evaluates user-facing flows, edge cases, Playwright resilience, and error-state degradation.
5. `/context-sync`: Updates `Context.md` with the newly realized state.
6. `/publish-pr [ID]`: Generates the final pull request after all automated audits pass.

_(Note: If a task fails ANY review stage, invoke `/remediate-task [ID]` to surgically fix the specific lines flagged by the respective agent. Upon completing all deliverables in the current chunk, run `/roadmap-sync` to advance the master timeline)._

### 5.3. Handling Blockers & Mid-Flight Pivots (The Emergency Brakes)

The TopHat swarm is intentionally deterministic and does not waste tokens polling your file system for background changes. When an execution agent encounters a missing dependency, missing schema, or architectural contradiction, it will throw a `[BLOCKER_ENCOUNTERED]` payload, transition the task to Blocked in Linear, and halt.

Depending on the severity of the missing context, the Human Orchestrator must execute one of two recovery workflows:

#### 5.3.1. The Micro-Patch: `/remediate-blocker [ID]`

Use this when the overall architecture is sound, but a specific blueprint is missing a measurement (e.g., a missing TypeScript interface, an undefined database column, or an unstated business rule).

- **Action:** Run `/remediate-blocker [Linear ID]`.
- **Execution:** The Lead Architect fetches the blocked ticket, reads the developer's error, parses the `docs/` folder for the missing context, and injects the schema directly into the Linear task description. It then returns the ticket to Todo for immediate execution.

#### 5.3.2. The Macro-Reset: `/architecture-pivot`

Use this only when the fundamental architecture has shifted (e.g., swapping from a REST API to GraphQL, or migrating from SQLite to PostgreSQL). This is computationally expensive and alters the master timeline.

- **Action:** First, manually mutate `docs/PRD.md` or `docs/ERD.md` with the new core requirements. Then, run `/architecture-pivot`.
- **Execution:** The Lead Architect halts the swarm, recalculates the entire `Roadmap.md`, and outputs a triage hit-list of active Linear tasks (including tasks with 'Blocked' status) that are now structurally obsolete. You must manually cancel obsolete tasks and run `/generate-sprint-tasks` to fill the gaps.

#### 5.3.3. The Diagnostic Emergency Brake: `/triage-bug`

When an execution agent fails, an E2E Playwright test violently crashes, or an unhandled native OS exception halts the application, **do not attempt to manually edit code or hack a fix locally.** Doing so breaks Contextual Starvation and introduces Git drift.

Instead, pull the diagnostic emergency brake by initiating `/triage-bug`. This transitions the Lead Architect (`@agent-architect`) into a forensic investigator role.

**The Diagnostic Choreography:**

1. **The Interview Loop:** Route the chat to **Claude Sonnet** and pass the raw error log, stack trace, or behavioral description to `/triage-bug`. The Architect will not immediately guess a solution or write a task. It will analyze the compiled artifacts, check system boundaries (e.g., IPC bridges, ESM/CJS compilation layers), and ask you targeted clarifying questions across multiple conversational turns.
2. **The Synthesis Trigger:** Answer the Architect's questions to narrow down the blast radius. Once you and the Architect have forensically confirmed the root cause, reply with the exact command **`GENERATE BUGFIX`**.
3. **The Authorization Gate:** The Architect will compile a standalone, highly defensive Linear bug specification complete with mandatory Vitest regression criteria. Review the task block and reply **`APPROVED`** to push the ticket to your Linear Todo column.
4. **Execution Handoff:** Once the ticket is on the board, route it to the appropriate Dev Tier (e.g., `/implement-mid [BUG-ID]` or `/implement-senior [BUG-ID]`) to let the swarm self-heal under automated CI/CD enforcement.

---

## 6. Active Tool Guardrails (`hooks.json`)

The IDE registers these tool hooks. Their current error handling is not yet uniformly fail-closed; see [the boundary registry](.agents/BOUNDARIES.md):

- `context-io-gate`**:** Uses a lock file to coordinate writes to `Context.md` when its hook receives supported input and the filesystem operation succeeds.
- `static-analysis-gate`**:** Intercepts supported `git commit` tool calls and conditionally runs hard-coded checks. It does not run Vitest or guarantee fail-closed behavior in every error path. Slice 3 replaces this with project-declared validation.
- `protect-strategy-memory`**:** Intercepts selected writes to strategic memory files; its error paths still need the Slice 3 fail-closed refinement.

---

## 7. Prerequisites & Setup

### Slice 1 workspace configuration

`.agents/tophat.config.json` is shipped in this vault as an **unconfigured template**: `schemaVersion` and the existing `routingMatrix` are present, but `workspace`, `documentation`, and `validation` are `null`. This vault has no host application or approved project package, so selecting a framework or inventing scripts here would misrepresent it. After copying the vault into a supported Node.js/TypeScript/pnpm project, fill those sections before calling the loader. The loader denies the unconfigured template; it does not infer Svelte.

Set `workspace.kind` and `workspace.framework` to one of: `web` with `svelte`, `sveltekit`, `react`, or `nextjs`; `backend` with `none`; or `desktop` with `svelte`, `react`, or `none`. Capabilities are derived from this pair and cannot be declared independently. `documentation.package` is a workspace-relative directory, `documentation.manifest` is a relative file within it, and `documentation.derivedTargets` lists explicit relative files or directories outside private TopHat state. Structural validation here does not approve or verify the package; that is Slice 4.

Map any selected validation category to a **package-script name**, not a shell command. Allowed categories are `typecheck`, `lint`, `unit`, `coverage`, `integration`, `build`, `smoke`, `e2e`, and `documentation`; declare nonempty `commitGate`, `developmentPhaseGate`, and `projectCompletionGate` arrays in execution order. Slice 1 validates the declarations but does not run the scripts. The TopHat repository's own `pnpm test:tophat` command runs the loader tests with Node's TypeScript stripping; it is separate from host-project validation.

To deploy this workflow on a fresh repository, ensure your local environment and project structure meet the following strict requirements:

### 7.1. System Requirements

- **Node.js:** `>= 22.0.0`
- **Package Manager:** `pnpm`
- **Antigravity IDE:** Linear MCP Extension must be installed and authenticated.
- **GitHub CLI:** GitHub CLI must be installed and authenticated for PR creations.

### 7.2. Human Orchestrator Initialization (MANDATORY)

The TopHat swarm does not initialize package managers or install base frameworks. **Before running `/workspace-init`**, the Human Orchestrator must manually bootstrap the execution stack.

1. **Initialize the Framework:** Generate your base application scaffolding (e.g., SvelteKit, Vite, Electron).
2. **Install Core Tooling:** You must install the dependencies required by the Antigravity `hooks.json` interception scripts. Run the following command:
   ```bash
   pnpm add -D typescript vitest @playwright/test tsx
   ```
3. **Verify Lockfile:** Ensure `package.json` and `pnpm-lock.yaml` are present at the workspace root.

### 7.3. Workspace Scaffolding

Once workspace initialization is complete, ensure your root directory contains the Antigravity .agents/ vault and the docs/ directory.

_"Multi-agent Development Workflow" structure:_

```
├── .agents/
│   ├── rules/                (*.md files)
│   ├── skills/
│   │   ├── skill-1-name/
│   │   │   └── SKILL.md
│   │   ├── skill-2-name/
│   │   │   └── SKILL.md
│   │   └── skill-3-name/
│   │   │   └── SKILL.md
│   ├── workflows/            (*.md files)
│   ├── scripts/              (ts scripts triggered from hooks.json)
│   └── hooks.json
├── docs/
│   ├── PRD.md                (Must contain the TopHat Mandatory Declarations block)
│   ├── ERD.md                (Database schemas and relationships)
│   └── Roadmap.md            (Empty boilerplate containing [ACTIVE_SPRINT_CHUNK] tags)
├── Context.md                (Empty boilerplate initialized with [GLOBAL_CONSTRAINTS] header)
├── Strategy.md               (Empty boilerplate initialized with phase headers)
├── HUD.md                    (Empty boilerplate containing needed structure)
└── DECISIONS.md              (Updated and Read by Human Orchestrator to log ADRs)

```

### 7.4. The Command Center (The HUD)

To survive the cognitive load of manual swarm orchestration, TopHat utilizes a local, terminal-based Heads-Up Display (HUD). This passive radar watches your workflow and gives you real-time visual feedback on the active pipeline state and your next required command.

**How to Boot the HUD:**
To start the HUD run the watcher script: `npx tsx .agents/scripts/watch-hud.ts`.

Every time an agent finishes a task and you trigger `/context-sync`, the HUD will instantly refresh with your next marching orders.

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

### 7.6. `.gitignore` Recommendations (Optional Privacy)

If you wish to keep the existence of this multi-agent workflow hidden from public repositories or client deliverables, you can add the swarm mechanics to your `.gitignore`.

_Architect's Warning: Gitignoring these files will lock your swarm's execution state to your current physical machine. If you clone the repo elsewhere, the automated workflow will not function until the files are manually restored._

```
# TopHat Multi-Agent Workflow Files
.agents/
Context.md
Strategy.md
docs/
DECISIONS.md

```

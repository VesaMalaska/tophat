# Antigravity Multi-Agent Workflow

This repository utilizes a highly deterministic, AI-Driven Development (AIDD) multi-agent swarm native to the Google Antigravity IDE. This workflow is designed to execute complex, scalable software architecture by strictly isolating agent context, enforcing Test-Driven Development (TDD), and automating the git/PR lifecycle via Linear.

---

## 1. System Architecture & Philosophy

This workflow abandons the "chat-and-pray" model of standard AI coding. It operates on three core principles:

- **Contextual Starvation:** Execution agents (Developers) are intentionally "blind." They cannot read the master roadmap or adjacent feature code. They are given highly targeted, Just-In-Time (JIT) task specifications containing only the exact schemas required to complete their current file targets.
- **Hierarchical Orchestration:** The swarm is divided into Strategic, Execution, and Validation tiers. Agents do not brainstorm together; they execute strict handoffs via the `Context.md` state file.
- **Deterministic Validation:** Code is not merged based on agent confidence. It is gated by strict tool-use interception (`hooks.json`) that enforces Vitest/Lint passes and mandatory adversarial security reviews.

---

## 2. The Agentic Hierarchy (The Swarm)

The swarm is divided into specific roles with impenetrable scope boundaries:

**Strategic & Management Tier**

- `@agent-architect`** (Claude Opus):** The only agent allowed to read the PRD/ERD. Compiles JIT task batches and dictates architectural boundaries.
- `@agent-pm`**:** Your session guide. Reads the active Linear board and `Strategy.md` to recommend the optimal next task and monitor sprint health.

**Execution Tier**

- `@agent-senior-dev`** (Gemini Pro High):** Handles server-authoritative logic, data mutations, database schemas, and security boundaries.
- `@agent-mid-dev`** (Gemini Pro Low):** Handles client-side state transformations, component logic, and UI view layers.
- `@agent-junior-dev`** (Gemini Flash):** Restricted entirely to structural markup (HTML) and styling (Tailwind).

**Review & Validation Tier**

- `@agent-review-standard`** (Claude Sonnet):** Validates stateless UI and frontend code against project specifications.
- `@agent-review-critical`** (Claude Opus):** Adversarially audits load-bearing backend code for race conditions and data leaks.
- `@agent-security-auditor`**:** Enforces OWASP Top 10 mitigation and strict Row Level Security (RLS) constraints.
- `@agent-qa`**:** Executes Playwright E2E tests, verifying edge cases, error states, and accessibility standards.

---

## 3. State Management & Memory Boundaries

The swarm's memory is isolated into specific operational files:

- `docs/Roadmap.md`** & **`Strategy.md`** (Long-term Memory):** The master application sequencing. Read/Write access is strictly locked to the Architect and PM agents.
- `Context.md`** (Short-term Working Memory):** The live operational handoff document. It tracks the active phase and immediate blockers. Updated by agents after every completed task.
- `.agents/`** (The Vault):** The directory containing the active Skills (`.agents/skills/skill-1-name/SKILL.md`), Rules (`.agents/rules/*.md`), Workflows (`.agents/workflows/*.md`), and tool interception scripts.

---

## 4. The Daily Execution Loop (The Grind)

Once the workspace is initialized, the human orchestrator drives the swarm through this deterministic loop:

1. `/workspace-init`: Bootstraps the environment and verifies all dependencies and mandatory PRD declarations.
2. `/generate-sprint-tasks`: The Architect JIT-compiles a batch of Linear-ready tasks for the active sprint chunk (Requires a human "APPROVED" phase-2 commit).
3. `/session-start`: The PM Agent briefs you on sprint health and assigns the optimal Task ID to begin.
4. `/implement-[tier] [ID]`: The assigned Dev Agent checks out a branch, writes tests, implements the code, commits, pushes, and updates Linear.
5. `/review-[tier] [ID]`: Routes the branch through the designated code review and security pipelines.
6. `/context-sync`: Updates `Context.md` with the newly realized state.
7. `/publish-pr [ID]`: Generates the final pull request after all automated audits pass.

_(Note: If a task fails review, invoke _`/remediate-task [ID]`_ to surgically fix the specific lines flagged by the Review Agent)._

### **Handling Mid-Flight Pivots (The Emergency Brake)**

The Antigravity swarm is intentionally deterministic and does not waste tokens polling your file system for background changes. If you manually alter the core specifications (`docs/PRD.md` or `docs/ERD.md`) mid-sprint, the Execution agents will remain completely blind to the changes.

To safely pivot the architecture without desyncing the swarm, you must execute the following sequence:

1. **Mutate the Core:** Update `docs/PRD.md` or `docs/ERD.md` with your new requirements (e.g., swapping from REST to GraphQL).
2. **Halt & Reconcile:** Run the `/architecture-pivot` command.
3. **Triage:** The Architect will ingest the new specs, update the master `Roadmap.md`, and output a hit-list of active Linear tasks that are now structurally obsolete.
4. **Execute & Replace:** Manually cancel the obsolete tasks in Linear, then run `/generate-sprint-tasks` to fill the gap with new, architecturally sound tasks.

---

## 5. Active Tool Guardrails (`hooks.json`)

To prevent agent hallucination and race conditions, the IDE's tool-calling capabilities are intercepted by strict system scripts:

- `context-io-gate`**:** Uses `lockfile-create` to prevent multiple agents from writing to `Context.md` simultaneously.
- `static-analysis-gate`**:** Intercepts `git commit` commands. Forces a `pnpm vitest run` and `pnpm lint` pass. If tests fail, the agent is blocked from committing and forced to fix the code.
- `protect-strategy-memory`**:** Blocks execution agents from accidentally modifying or deleting the `[ACTIVE_SPRINT_CHUNK]` in your memory files.

---

## 6. Prerequisites & Setup

To deploy this workflow on a fresh repository, ensure your local environment and project structure meet the following strict requirements:

### System Requirements

- **Node.js:** `>= 22.0.0`
- **Package Manager:** `pnpm`
- **Antigravity IDE:** Linear MCP Extension must be installed and authenticated.

### Workspace Scaffolding

Before running `/workspace-init`, your root directory must contain the following structure:

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
│   ├── scripts/              (hooks.ts scripts)
│   └── hooks.json
├── docs/
│   ├── PRD.md                (Must contain the Antigravity Mandatory Declarations block)
│   ├── ERD.md                (Database schemas and relationships)
│   └── Roadmap.md            (Empty boilerplate containing [ACTIVE_SPRINT_CHUNK] tags)
├── Context.md                (Empty boilerplate initialized with [GLOBAL_CONSTRAINTS] header)
├── Strategy.md               (Empty boilerplate initialized with phase headers)
└── DECISIONS.md              (Updated and Read by Human Orchestrator to log ADRs)

```

### **Linear Team Configuration (Mandatory)**

The Antigravity swarm does not have admin privileges to create workflow states in your Linear workspace. For the automated handoffs to function, you **must** manually configure your Linear Team's workflow to include these exact custom statuses (case-sensitive):

**Unstarted**

- `Todo`

**Started**

- `In Progress`
- `In Review: Architecture` _(Triggered post-implementation)_
- `In Review: Security` _(Triggered post-critical review)_
- `In Review: QA` _(Triggered post-standard/security review)_
- `Ready for PR` _(Triggered when all audits pass)_
- `In Review: Orchestrator` _(Triggered after PR generation)_

**Completed / Canceled**

- `Done`
- `Canceled`
- `Duplicate`

_(Note: If these exact strings are not present in your Linear workflow settings, the agents will fail when attempting to transition tasks, halting the automated pipeline)._

### `.gitignore` Recommendations (Optional Privacy)

If you wish to keep the existence of this multi-agent workflow hidden from public repositories or client deliverables, you can add the swarm mechanics to your `.gitignore`.

_Architect's Warning: Gitignoring these files will lock your swarm's execution state to your current physical machine. If you clone the repo elsewhere, the automated workflow will not function until the files are manually restored._

```
# Antigravity Multi-Agent Workflow Files
.agents/
Context.md
Strategy.md
docs/
DECISIONS.md

```

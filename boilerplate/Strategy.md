# Strategic Workspace Memory & Sprint Orchestration

_This document is the exclusive domain of `@agent-pm` and `@agent-architect`. Execution agents are explicitly forbidden from reading or mutating this file._

## 🏛️ 1. Architectural Source of Truth

- **Primary Documentation:** The immutable PRD, ERD, and core Architecture Specifications reside exclusively in the `docs/` directory.
- **Operational Rules:** The Lead Architect must parse the `docs/` directory to define the `[GLOBAL_CONSTRAINTS]` injected into `Context.md` before generating Linear tasks.

## 🧩 2. Authorized Skill Matrix

_List the Antigravity Skills authorized for use in this repository. The Lead Architect will assign these to specific Linear tasks to dictate the execution framework._

- **Frontend/UI:** [e.g., `svelte5-kit-architecture`, `tailwind-semantic-ui`]
- **Backend/Data:** [e.g., `supabase-rls, supabase-auth, firebase-firestore, firebase-auth`]
- **DevOps/Native:** [e.g., `electron-ipc`]

## 📜 3. Architectural Decision Records (ADRs)

_Document critical, irreversible system decisions here to maintain strategic memory across sessions._

- **[Date] - [Decision Title]:** [Brief rationale]

---

## 📈 4. Active Sprint Health & Velocity

_Updated continuously by `@agent-pm` via the `/strategy-sync` workflow._

- **Current Phase:** [e.g., Phase 1 - Foundation & Auth]
- **Overall Trajectory:** [Brief PM assessment of velocity, blockers, and backlog health]

## 🎯 5. Domain Sequencing (Epics)

_The high-level roadmap. When an Epic is complete, the PM moves it to 'Realized'._

### 🟡 Active Epics

1. **[Epic Name]:** [Brief description of the current major milestone]
   - _Blocking Dependencies:_ [None / Pending external API keys, etc.]

### ⚪ Upcoming Epics (Backlog)

1. **[Epic Name]:** [Brief description]

### 🟢 Realized Epics (Historical)

- _None yet._

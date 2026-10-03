# Strategic Workspace Memory & Sprint Orchestration

_This document is the exclusive domain of `@agent-pm` and `@agent-architect`. Execution agents are explicitly forbidden from reading or mutating this file._

## 🏛️ 1. Architectural Source of Truth

- **Primary Documentation:** The selected approved documentation package under docs/<package> owns product requirements, decisions, contracts and acceptance criteria. Private ADRs below reference it; they cannot override it.
- **Operational Rules:** The Lead Architect must validate the selected package and read its declared inventory to define the `[GLOBAL_CONSTRAINTS]` injected into `Context.md` before generating Linear tasks.

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

- **Current Development Phase:** [e.g., Development Phase 1 - Foundation & Auth]
- **Overall Trajectory:** [Brief PM assessment of velocity, blockers, and backlog health]

## 🎯 5. Development Phase Sequencing

_The high-level roadmap. When a Development Phase is complete, the PM moves it to 'Realized'._

### 🟡 Active Development Phases

1. **[Development Phase Name]:** [Brief description of the current major milestone]
   - _Blocking Dependencies:_ [None / Pending external API keys, etc.]

### ⚪ Upcoming Development Phases (Backlog)

1. **[Development Phase Name]:** [Brief description]

### 🟢 Realized Development Phases (Historical)

- _None yet._

## Documentation authority evidence (derived)

- Package ID / Version / Authority Fingerprint: [UNAVAILABLE until validated]
- Last validation / blockers: [Require current shared validator result]
- Approval state is never established by editing this private mirror.

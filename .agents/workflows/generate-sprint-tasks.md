---
description: Lead Architect task compilation targeting the Active Sprint Chunk, with strict context isolation and Just-In-Time (JIT) schema injection.
---

**Steps:**

1. **Initialize Architecture:** Invoke `@agent-architect`.
2. **Chunk Isolation Directive:** "Read `docs/Roadmap.md` and isolate the exact scope of the `[ACTIVE_SPRINT_CHUNK]`. You are strictly forbidden from generating tasks for any feature, database table, or UI component outside the boundaries of this specific chunk."
3. **JIT Context Extraction:** "Read `docs/README.md` to index available technical documents, then parse the PRD, ERD, and Architecture files. Extract ONLY the specific data models, API contracts, or component hierarchies relevant to the active chunk. You must embed these exact schemas and constraints directly into the generated Linear task descriptions so downstream Developer agents have perfect, isolated context."
4. **Constraint & Skill Injection:** "Compile atomic, deterministic Linear-ready task specifications. Strictly enforce the boundaries defined in the `[GLOBAL_CONSTRAINTS]` block of `Context.md`. Every generated task MUST explicitly mandate adherence to the relevant active Antigravity Skills (e.g., dictating `svelte5-kit-architecture` for frontend, or `supabase-multitenant-data` for backend)."
5. **Strict Acceptance Criteria:** "Format the Acceptance Criteria for every task to pair seamlessly with downstream validation. You must explicitly demand the handling of at least 3 edge cases per feature (mapping to the `vitest-tdd` and `playwright-qa-flows` skills)."
6. **Execution:** "Output the proposed Task Blocks, ADR Summary (if architectural decisions were made), and the Strategy Update block."
7. **Human Gate:** "Pause execution. Prompt the Human Orchestrator to validate routing fields (Dev Tier, Review Tier, Security, QA). Output: 'Please review the proposed tasks. Reply with [APPROVED] to authorize ticket creation to the Linear board and update Strategy.md.'"

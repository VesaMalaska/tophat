---
description: Lead Architect task compilation and strict downstream routing assignment.
---

**Steps:**

1. **Initialize Architecture:** Invoke `@agent-architect`.
2. **Instruction:** "Parse `Strategy.md`. Read `docs/README.md`to index the available documents, then parse the primary technical project documents located in the`docs/` directory. Compile atomic, deterministic Linear-ready task specifications."
3. **Constraint Injection:** "Strictly enforce the architectural boundaries defined in the `[GLOBAL_CONSTRAINTS]` block of `Context.md`. Ensure that every generated task explicitly mandates adherence to the relevant active Antigravity Skills appended to the project (e.g., frontend tasks must strictly dictate the active frontend skill, data layer tasks must enforce the active backend/security skill)."
4. **Execution:** "Output the Task Blocks, ADR Summary, and the Strategy Update block."
5. **Human Gate:** Validate routing fields (Dev Tier, Review Tier, Security, QA) and commit to Linear before updating `Strategy.md`.

---
description: Lead Architect task compilation and strict downstream routing assignment.
---

**Steps:**

1. **Initialize Architecture:** Invoke `@agent-architect`.
2. **Instruction:** "Parse `Strategy.md`, the primary PRD, and ERD. Compile atomic, deterministic Linear-ready task specifications."
3. **Constraint Injection:** "Ensure all data layer tasks enforce Supabase multitenant RLS isolation. Ensure all frontend logic strictly dictates Svelte 5 Runes. Ensure all desktop utility tasks respect Electron IPC context bridge boundaries."
4. **Execution:** "Output the Task Blocks, ADR Summary, and the Strategy Update block."
5. **Human Gate:** Validate routing fields (Dev Tier, Review Tier, Security, QA) and commit to Linear before updating `Strategy.md`.

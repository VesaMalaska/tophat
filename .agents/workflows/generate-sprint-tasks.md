---
description: Lead Architect task compilation targeting the Active Sprint Chunk, with strict context isolation and Just-In-Time (JIT) schema injection.
---

**Steps:**

1. **Initialize Architecture:** Invoke `@agent-architect`.
2. **Chunk Isolation Directive:** "Read `docs/Roadmap.md` and isolate the exact scope of the `[ACTIVE_SPRINT_CHUNK]`. You are strictly forbidden from generating tasks for any feature, database table, or UI component outside the boundaries of this specific chunk."
3. **JIT Context Extraction:** "Use the `run_command` tool to execute `ls -1 docs/` (or equivalent) to dynamically discover all available technical documents. Parse the PRD, ERD, and any other files discovered in the directory. Extract ONLY the specific data models, API contracts, or component hierarchies relevant to the active chunk. You must embed these exact schemas and constraints directly into the generated Linear task descriptions so downstream Developer agents have perfect, isolated context."
4. **Constraint & Skill Injection:** "Compile atomic, deterministic Linear-ready task specifications. Strictly enforce the boundaries defined in the `[GLOBAL_CONSTRAINTS]` block of `Context.md`. Every generated task MUST explicitly mandate adherence to the relevant active Antigravity Skills (e.g., dictating `svelte5-kit-architecture` for frontend, or `supabase-multitenant-data` for backend)."
5. **Strict Acceptance Criteria:** "Format the Acceptance Criteria for every task to pair seamlessly with downstream validation. You must explicitly demand the handling of at least 3 edge cases per feature. You must explicitly map these acceptance criteria to the active validation Skills authorized in the workspace (e.g., the specific TDD or QA skills provided in your context)."
6. **Execution:** "Output the proposed Task Blocks, ADR Summary, and Strategy Update block. CRITICAL: You MUST format EACH task block EXACTLY using the following structure. Do not invent your own formatting, do not skip sections, and do not summarize. Use 4-space indentation for any code blocks inside the Embedded JIT Schema:

   **-- LINEAR METADATA --**
   - **Title:** [Epic] - [Feature]
   - **Priority:** [Critical | High | Medium | Low]
   - **Dev Tier:** [junior | mid | senior]
   - **Review Tier:** [standard | critical]
   - **Security:** [yes | no]
   - **QA:** [yes | no]
   - **Required Skills Labels:** [e.g., electron-sqlite-ipc, vitest-tdd]
   - **ADR Flag:** [Yes | No]

   **-- LINEAR DESCRIPTION (MARKDOWN) --**
   **Description**
   [1-2 sentences defining the core objective of this specific task. Zero Agile fluff. Focus on the system architecture.]

   **Sprint Chunk**
   [Name of the Active Sprint Chunk]

   **Embedded JIT Schema & Context**
   [Extract and inject the EXACT schemas, TypeScript interfaces, file paths, or database tables from the docs/ folder required for this task. The developer relies entirely on this block.]

   **Implementation Requirements**
   - [Specific file to create/modify] -> [Exact function/logic to implement]

   **Mandatory Skill Adherence**
   - [Skill Name] — [Brief reason for inclusion]

   **Validation Mapping**
   - [Validation Type, e.g., TDD: vitest-tdd] — [What exactly needs to be tested to prove the logic works]

   **Acceptance Criteria**
   - [ ] [Testable outcome 1]
   - [ ] Edge Case 1: [Specific edge case to handle]
   - [ ] Edge Case 2: [Specific edge case to handle]
   - [ ] Edge Case 3: [Specific edge case to handle]
         "

7. **Human Gate:** "Pause execution. As the ABSOLUTE FINAL LINE of your output, after the Strategy Update block, you MUST append this exact closing call-to-action on its own line: '🛑 **ACTION REQUIRED:** Please review the proposed task blocks and routing fields above. Reply with the exact phrase **APPROVED** to authorize ticket creation to Linear and update Strategy.md.'"

8. **Linear State Enforcement (Post-Approval):** "Upon receiving the 'APPROVED' signal, execute Phase 2 as defined in your core identity constraints. Invoke the Linear MCP to create the issues, strictly enforcing your MCP Payload Lock for the description and priority, and verify the 'Todo' status transition. Also verify the Linear issue has a Priority set according to the task requirements, if not then set it correctly."

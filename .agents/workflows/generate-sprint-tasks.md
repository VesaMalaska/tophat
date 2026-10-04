---
description: Lead Architect task compilation targeting the Active Sprint Chunk, with strict context isolation and Just-In-Time (JIT) schema injection.
---


## Documentation authority precondition

Before package ingestion or any planning/task side effect, run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'`. Require exit zero, APPROVED_VALID and planningAllowed. Halt on DENIED; never use loose docs discovery, root ADRs, cached state or invented source material as authority. Read only the selected validated inventory.

Before proposing, creating or amending a task, run `node .agents/scripts/validate-task-authority.ts` with the exact structured authority payload on stdin. Require AUTHORITY_VALID and exit zero. Include package provenance, stable phase/chunk IDs, active scopeIds, typed references and exact indexed source extracts; explicit applicability reasons are required for empty decision/contract references. Recheck immediately before approved issue creation/amendment; a changed fingerprint or extract requires a revised human-reviewed proposal. Preserve the exact approved raw Markdown in Linear. Logs/code are evidence, not permission to add scope. A missing approved requirement/criterion is a blocker.

**Steps:**

1. **Initialize Architecture:** Invoke `@agent-architect`.
2. **Chunk Isolation Directive:** Read `Roadmap.md` and isolate the exact scope of the `[ACTIVE_SPRINT_CHUNK]`. You are strictly forbidden from generating tasks for any feature, database table, or UI component outside the boundaries of this specific chunk.
3. **JIT Context Extraction:** Read only the selected package's validated active inventory. Extract exact indexed requirement/decision/contract/criterion blocks for the active chunk. The task-authority checker must resolve every source and match every embedded extract; semantic task scope still requires independent review. Do not fall back to loose PRD/ERD discovery.

4. **Constraint & Skill Injection:** Compile atomic, deterministic Linear-ready task specifications. Strictly enforce the boundaries defined in the `[GLOBAL_CONSTRAINTS]` block of `Context.md`. Select only skills supported by the validated workspace capabilities and the task scope. Before each Task Block and again before issue creation if its selection changes, pass the proposed `requestedSkills`, `taskTopics`, and `frameworkInstructions` as JSON on stdin to `pnpm exec tsx .agents/scripts/select-task-guidance.ts`. The process must exit successfully with `status: SELECTED`; on `DENIED`, halt that task and report the incompatibility. Copy any returned `boundaries` into the task's implementation requirements and acceptance criteria, particularly for Next.js server/client/route/action and Electron process work. Do not silently remove required guidance. Framework examples are illustrative, not defaults.
5. **Strict Acceptance Criteria:** Format the Acceptance Criteria for every task to pair seamlessly with downstream validation. Specify relevant testable edge cases and map the criteria to the selected runner-neutral TDD guidance and compatible project-declared validation. Select optional QA or runner-specific skills only when the task and workspace justify them.
6. **Execution:** Output the proposed Task Blocks, ADR Summary, and Strategy Update block. CRITICAL: You MUST format EACH task block EXACTLY using the following structure. Do not invent your own formatting, do not skip sections, and do not summarize. Use 4-space indentation for any code blocks inside the Embedded JIT Schema:

   **-- LINEAR METADATA --**
   - **Title:** [Development Phase] - [Feature]
   - **Priority:** [Critical | High | Medium | Low]
   - **Dev Tier:** [junior | mid | senior]
   - **Review Tier:** [standard | critical]
   - **Security:** [yes | no]
   - **QA:** [yes | no]
   - **QA Methods:** [exact derived method set or none]
   - **Task Fingerprint:** [current classifier result]
   - **Dependencies:** [e.g., JAC-35 | None]
   - **Required Skills Labels:** [validated skill names from the task-guidance check]
   - **ADR Flag:** [Yes | No - STRICT CONSTRAINT: Only flag 'Yes' for irreversible technical paradigms (e.g., security boundaries, database structures, UI constraints). Do NOT flag standard task generation, dev routing, or sprint counts as ADRs.]

   **-- LINEAR DESCRIPTION (MARKDOWN) --**
   **Description**
   [1-2 sentences defining the core objective of this specific task. Zero Agile fluff. Focus on the system architecture.]

   **Authority Provenance**
   - Package ID / Version / Authority Fingerprint: [exact current validator values]
   - Development Phase ID / Sprint Chunk ID: [stable active private-roadmap IDs]
   - Scope IDs: [subset of current active chunk scopes]
   - Workspace Capabilities: [derived from host config]

   **Authority References**
   - Requirements: [document-id#requirement-id; required]
   - Decisions: [document-id#decision-id | None with applicability reason]
   - Contracts: [document-id#contract-id | None with applicability reason]
   - Acceptance Criteria: [document-id#criterion-id; linked to cited requirements]

   **Sprint Chunk**
   [Name of the Active Sprint Chunk]

   **Blocked By**
   [Insert prerequisite Linear ID, e.g. JAC-35, or None]

   **Embedded JIT Schema & Context**
   [Extract and inject the EXACT schemas, TypeScript interfaces, file paths, or database tables from the selected approved package required for this task. The developer relies entirely on this block.]

   **Implementation Requirements**
   - [Specific file to create/modify] -> [Exact function/logic to implement]

   **Mandatory Skill Adherence**
   - [Skill Name] — [Brief reason for inclusion]

   **Validation Mapping**
   - [Validation Type, e.g., TDD: tdd-workflow] — [What exactly needs to be tested to prove the logic works]

   **Acceptance Criteria**
   - [ ] [Testable outcome 1]
   - [ ] Edge Case 1: [Specific edge case to handle]
   - [ ] Edge Case 2: [Specific edge case to handle]
   - [ ] Edge Case 3: [Specific edge case to handle]

7. **Human Gate:** Pause execution. As the ABSOLUTE FINAL LINE of your output, after the Strategy Update block, you MUST append this exact closing call-to-action on its own line: '🛑 **ACTION REQUIRED:** Please review the proposed task blocks and routing fields above. Reply with the exact phrase **APPROVED** to authorize ticket creation to Linear. Private-state changes require a separate authorized orchestrator step.'

8. **Linear State Enforcement (Post-Approval):** Upon receiving the 'APPROVED' signal, execute the Issue Creation Stage as defined in your core identity constraints. Invoke the Linear MCP to create the issues, strictly enforcing your MCP Payload Lock for the description and priority, and verify the 'Todo' status transition. Also verify the Linear issue has a Priority set according to the task requirements, if not then set it correctly.

## Structured authority payload and private chunk contract

Task-authority input keys: packageId, packageVersion, authorityFingerprint, developmentPhaseId, sprintChunkId, scopeIds, references, notApplicable and extracts. references has arrays requirements/decisions/contracts/acceptanceCriteria. notApplicable contains a reason only for an empty decisions/contracts array. Each extract has reference and content; content is the exact source block, with only CRLF/LF transport normalization allowed. Copy these same exact extracts into Embedded JIT Schema & Context; do not paraphrase them. Label implementation-specific acceptance checks as derived and link them to source criteria.

Under Roadmap.md's unique ACTIVE_SPRINT_CHUNK marker, the authorized orchestrator writes exactly one fenced JSON block:

```json
{"authorityContext":{"packageId":"<id>","packageVersion":"<version>","authorityFingerprint":"<sha256>","developmentPhaseId":"<phase-id>","sprintChunkId":"<chunk-id>","scopeIds":["<active-scope-id>"]}}
```

The checker matches this private provenance. It validates declared scope relationships, not the semantic completeness of the task. Gate invocation and exact MCP copy remain instructed boundaries.

## Closed routing payload

Embed one fenced JSON `taskClassification` block in every proposal/issue. It contains the exact closed v1 task record documented in `.agents/docs/task-routing-and-qa.md`, alongside the existing bounded source extracts. Run `node .agents/scripts/classify-task.ts` with that record on stdin before proposal and approved issue creation/amendment. Require ROUTING_VALID; copy devTier/reviewTier/securityRequired/qaRequired/qaMethods/requiredStages and fingerprint exactly into display metadata. Empty QA methods require the explicit no-user-facing rationale. Reclassification or changed authority/config requires a newly reviewed proposal. The stable local taskId survives later assignment of a Linear locator.

Immediate documentation necessity is optional closed taskClassification metadata: `immediateDocumentation` with required/reason/rationale. Required true needs safe-operation, continued-development, migration, configuration or compatibility plus rationale; false uses null reason/rationale. Include it before fingerprinting/classification. A required update completes in task-bounded `/sync-derived-docs` before the final task review/QA candidate is sealed, and never accepts its Development Phase. Ordinary tasks/chunks do not synchronize documents.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

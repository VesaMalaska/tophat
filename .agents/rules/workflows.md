---
trigger: always_on
---

# TopHat Workflow Engine Specifications

## 🛑 GLOBAL ORCHESTRATION MANDATE

Whenever you suggest a subsequent slash command or assign a downstream task to another agent, you MUST explicitly state the Recommended LLM Model required to execute that command, referencing the mappings defined below.
_Format Output:_ `[Next Action: /command-name] -> [Recommended Model: Model Name]`

## TopHat Workflow Commands for Orchestrating the Engine Flow

### Phase 0: Foundational Commands

- `/workspace-init`: Bootstraps environment, verifies Tech Stack constraints, generates initial `Roadmap.md`.
  - **Recommended Model:** Claude Opus (Requires zero-shot semantic mapping of entire PRD).
- `/architecture-pivot`: Halts swarm, recalculates master timeline, triages obsolete Linear tasks.
  - **Recommended Model:** Claude Opus (Requires high adversarial precision to prevent data loss).
- `/generate-readme`: Invokes `@agent-architect` to execute multi-document semantic synthesis across specs and ERDs to generate the master `README.md` template.
  - **Recommended Model**: Gemini Pro High (Required for advanced cross-referencing and rigid template adherence).

### Standard Automation Workflows

- `/sprint-briefing`: Invokes `@agent-pm` to output the sprint briefing.
  - **Recommended Model:** Gemini Flash High (Optimized for fast state-checking).
- `/generate-sprint-tasks`: Invokes `@agent-architect` to JIT-compile the active sprint chunk.
  - **Recommended Model:** Gemini Pro High (Optimized for massive context window / directory RAG).
- `/roadmap-sync`: Synchronizes master timeline based on completed chunks.
  - **Recommended Model:** Gemini Pro High (Requires deep context alignment).
- `/context-sync` & `/strategy-sync`: Summarizes decisions and compresses state memory.
  - **Recommended Model:** Gemini Flash Medium (Optimized for token compression).

### Implementation & Remediation Commands

- `/implement-senior [ID]`: Invokes `@agent-senior-dev` to execute backend, database, or security tasks.
  - **Recommended Model:** Gemini Pro High (Optimized for deep reasoning and severe constraint adherence).
- `/implement-mid [ID]`: Invokes `@agent-mid-dev` to execute reactive frontend logic and client state transformations.
  - **Recommended Model:** Gemini Flash High (Optimized for rapid instruction following and sub-second TDD cycles).
- `/implement-junior [ID]`: Invokes `@agent-junior-dev` to execute raw structural layouts and Tailwind styling passes.
  - **Recommended Model:** Gemini Flash Low (Optimized for high-speed, low-cost deterministic layout compilation).
- `/remediate-blocker [ID]`: Architect autonomously extracts missing schema context for a blocked task.
  - **Recommended Model:** Gemini Pro High (Directory RAG across `docs/`).
- `/remediate-task [ID]`: Surgical Dev Tier fixes based on rejection comments.
  - **Recommended Model:** Gemini Pro High (Requires cross-referencing PRD with audit failures).
- `/triage-bug [Error Description / Log]`: Invokes `@agent-architect` for a multi-turn analytical diagnostic interview to isolate root causes before generating a Linear bug ticket.
  - **Recommended Model:** Claude Sonnet (Optimized for deep conversational reasoning, diagnostic inquiry, and strict phase gating).

### Validation & Pipeline Commands

- `/review-standard [ID]`: Validates stateless UI and frontend code against project specifications.
  - **Recommended Model:** Gemini Pro High (Optimized for deep trace validation and high-throughput acceptance criteria checking).
- `/review-critical [ID]`: Adversarially audits load-bearing backend code for race conditions.
  - **Recommended Model:** Claude Sonnet (Cross-model validation against Gemini implementations).
- `/security-review [ID]`: Enforces OWASP Top 10 mitigation and strict RLS constraints.
  - **Recommended Model:** Claude Sonnet (Adversarial security posture).
- `/qa-validate [ID]`: Evaluates edge cases, Playwright resilience, and UI degradation.
  - **Recommended Model:** Gemini Pro Low (Requires Vision-enabled UI analysis).
- `/publish-pr [ID]`: Generates final PR and merges approved work.
  - **Recommended Model:** Gemini Flash Medium (Lightweight API/CLI execution).

## 🛑 Manual Implementation Sequences

Do NOT attempt to run implementation as an automated workflow. The Human Orchestrator must manually swap the LLM model at each phase transition to enforce Heterogeneous Model Validation.

### Standard Implementation Sequence:

1. **[Human - Model: Gemini Flash/Pro]**: `/implement-junior [ID]` | `/implement-mid [ID]` Use MCP to fetch Linear Task [ID]. Execute and push branch. (Auto-moves to `In Review: Architecture`)
2. **[Human - Model: Claude Sonnet]**: `/review-standard [ID]` Review the active branch against the spec. (Auto-moves to `Ready for PR`)
3. **[Human - Model: Gemini Pro]**: `/context-sync` Update the handoff state.

### Critical Implementation Sequence:

1. **[Human - Model: Gemini Pro High]**: `/implement-senior [ID]` Use MCP to fetch Linear Task [ID]. Execute and push branch. (Auto-moves to `In Review: Architecture`)
2. **[Human - Model: Claude Sonnet]**: `/review-critical [ID]` Adversarially review the active branch. (Auto-moves to `In Review: Security`)
3. **[Human - Model: Claude Sonnet]**: `/security-review [ID]` Execute threat model. (Auto-moves to `In Review: QA` or `Ready for PR`)
4. **[Human - Model: Gemini Pro High]**: `/qa-validate [ID]` (if UI involved). Validate Playwright flows. (Auto-moves to `Ready for PR`)
5. **[Human - Model: Gemini Pro]**: `/context-sync` Update the handoff state.

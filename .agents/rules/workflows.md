---
trigger: always_on
---

# TopHat Workflow Engine Specifications

## 🛑 GLOBAL ORCHESTRATION MANDATE

Whenever you suggest a subsequent slash command or assign a downstream task to another agent, you MUST explicitly state the Recommended LLM Model required to execute that command, referencing the mappings defined below.
_Format Output:_ `[Next Action: /command-name]`

## TopHat Workflow Commands for Orchestrating the Engine Flow

### Foundational Workflow Stage Commands

- `/workspace-init`: Bootstraps environment, verifies Tech Stack constraints, generates initial `Roadmap.md`.
- `/architecture-pivot`: Halts swarm, recalculates master timeline, triages obsolete Linear tasks.
- `/generate-readme`: Invokes `@agent-architect` to execute multi-document semantic synthesis across specs and ERDs to generate the master `README.md` template.

### Standard Automation Workflows

- `/sprint-briefing`: Invokes `@agent-pm` to output the sprint briefing.
- `/generate-sprint-tasks`: Invokes `@agent-architect` to JIT-compile the active sprint chunk.
- `/roadmap-sync`: Synchronizes master timeline based on completed chunks.
- `/context-sync` & `/strategy-sync`: Summarizes decisions and compresses state memory.

### Implementation & Remediation Commands

- `/implement-senior [ID]`: Invokes `@agent-senior-dev` to execute backend, database, or security tasks.
- `/implement-mid [ID]`: Invokes `@agent-mid-dev` to execute reactive frontend logic and client state transformations.
- `/implement-junior [ID]`: Invokes `@agent-junior-dev` to execute raw structural layouts and Tailwind styling passes.
- `/remediate-blocker [ID]`: Architect autonomously extracts missing schema context for a blocked task.
- `/remediate-task [ID]`: Surgical Dev Tier fixes based on rejection comments.
- `/triage-bug [Error Description / Log]`: Invokes `@agent-architect` for a multi-turn analytical diagnostic interview to isolate root causes before generating a Linear bug ticket.

### Validation & Pipeline Commands

- `/review-standard [ID]`: Validates stateless UI and frontend code against project specifications.
- `/review-critical [ID]`: Adversarially audits load-bearing backend code for race conditions.
- `/security-review [ID]`: Enforces OWASP Top 10 mitigation and strict RLS constraints.
- `/qa-validate [ID]`: Evaluates edge cases, Playwright resilience, and UI degradation.
- `/publish-pr [ID]`: Generates final PR and merges approved work.

## 🛑 Manual Implementation Sequences

Do NOT attempt to run implementation as an automated workflow. The Human Orchestrator must manually swap the LLM model at each workflow transition to enforce Heterogeneous Model Validation.

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

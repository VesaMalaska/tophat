---
trigger: always_on
---

# Antigravity Workflow Engine Specifications

## Standard Automation Workflows

These workflows are fully automated and executed via slash commands:

- `/session-start`: Invokes `@agent-pm` to read `Strategy.md`, `Context.md`, and Linear, outputting the sprint briefing.
- `/new-task`: Invokes `@agent-architect` to generate task blocks. (Requires Human Phase 2 Commit to Linear).
- `/security-review`: Invokes `@agent-security-auditor` to perform mandatory threat modeling.
- `/context-sync`: Invokes the last active agent to summarize decisions and update `Context.md`.
- `/strategy-sync`: Invokes `@agent-pm` to compress and update `Strategy.md`.

### Implementation & Validation Commands

These commands bridge the gap between the Linear specification and the IDE execution, requiring you to provide the explicit Task ID:

- `/implement-junior [ID]`: Triggers `@agent-junior-dev` to check out a branch and execute static UI tasks.
- `/implement-mid [ID]`: Triggers `@agent-mid-dev` to check out a branch and execute Svelte 5 frontend logic.
- `/implement-senior [ID]`: Triggers `@agent-senior-dev` to check out a branch and execute backend/DB tasks.
- `/review-standard [ID]`: Triggers `@agent-review-standard` to validate the active branch against spec.
- `/review-critical [ID]`: Triggers `@agent-review-critical` for deep adversarial architecture audits.
- `/qa-validate [ID]`: Triggers `@agent-qa` to evaluate edge cases, Playwright resilience, and UI degradation.

## 🛑 Manual Implementation Sequences

Do NOT attempt to run implementation as an automated workflow. The Human Orchestrator must manually swap the LLM model at each phase transition.

### Standard Implementation Sequence:

1. **[Human - Model: Gemini Flash/Pro]**: `/implement-junior [ID]` | `/implement-mid [ID]` Use MCP to fetch Linear Task [ID]. Execute and push branch. (Auto-moves to `In Review: Architecture`)
2. **[Human - Model: Claude Sonnet]**: `/review-standard [ID]` Review the active branch against the spec. (Auto-moves to `Ready for PR`)
3. **[Human - Model: Gemini Pro]**: `/context-sync` Update the handoff state.

### Critical Implementation Sequence:

1. **[Human - Model: Gemini Pro High]**: `/implement-senior [ID]` Use MCP to fetch Linear Task [ID]. Execute and push branch. (Auto-moves to `In Review: Architecture`)
2. **[Human - Model: Claude Opus]**: `/review-critical [ID]` Adversarially review the active branch. (Auto-moves to `In Review: Security`)
3. **[Human - Model: Claude Sonnet]**: `/security-review [ID]` Execute threat model. (Auto-moves to `In Review: QA` or `Ready for PR`)
4. **[Human - Model: Gemini Pro High]**: `/qa-validate [ID]` (if UI involved). Validate Playwright flows. (Auto-moves to `Ready for PR`)
5. **[Human - Model: Gemini Pro]**: `/context-sync` Update the handoff state.

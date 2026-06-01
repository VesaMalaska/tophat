---
trigger: always_on
---

# Antigravity Workflow Engine Specifications

## Standard Automation Workflows

These workflows are fully automated and executed via slash commands:

- `/workflow-session-start`: Invokes `@agent-pm` to read `Strategy.md`, `Context.md`, and Linear, outputting the sprint briefing.
- `/workflow-new-task`: Invokes `@agent-architect` to generate task blocks. (Requires Human Phase 2 Commit to Linear).
- `/workflow-security-review`: Invokes `@agent-security-auditor` to perform mandatory threat modeling.
- `/workflow-context-sync`: Invokes the last active agent to summarize decisions and update `Context.md`.
- `/workflow-strategy-sync`: Invokes `@agent-pm` to compress and update `Strategy.md`.

## 🛑 Manual Implementation Sequences (Path B)

Do NOT attempt to run implementation as an automated workflow. The Human Orchestrator must manually swap the LLM model at each phase transition.

### Standard Implementation Sequence:

1. **[Human - Model: Gemini Pro/Flash]**: `@agent-[tier]-dev` Use MCP to fetch Linear Task [ID]. Execute and push branch.
2. **[Human - Model: Claude 3.5 Sonnet]**: `@agent-review-standard` Review the active branch against the spec.
3. **[Human - Model: Gemini Pro]**: `/workflow-context-sync` Update the handoff state.

### Critical Implementation Sequence:

1. **[Human - Model: Gemini Pro High]**: `@agent-senior-dev` Use MCP to fetch Linear Task [ID]. Execute and push branch.
2. **[Human - Model: Claude 3 Opus]**: `@agent-review-critical` Adversarially review the active branch.
3. **[Human - Model: Claude 3.5 Sonnet]**: `/workflow-security-review`
4. **[Human - Model: Gemini Pro High]**: `@agent-qa` (if UI involved)
5. **[Human - Model: Gemini Pro]**: `/workflow-context-sync` Update the handoff state.

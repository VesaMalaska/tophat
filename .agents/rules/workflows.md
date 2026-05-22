---
trigger: always_on
---

# Antigravity Workflow Engine Specifications

## /workflow-session-start
1. Invoke `@agent-pm`: "Read Strategy.md, Context.md, and Linear. Output the standard session-start briefing."

## /workflow-new-task
1. Invoke `@agent-architect`: "Read Strategy.md and project documentation. Generate task blocks with Dev, Review, Security, and QA routing fields. Output Strategy Update block."
2. **[Human Orchestrator Gate]:** Review task specs. If approved, commit to Linear and update `Strategy.md`.

## /workflow-implement-standard
1. **[Human Action]:** Invoke the assigned dev agent (`@agent-senior-dev`, `@agent-mid-dev`, or `@agent-junior-dev`) with the Linear task spec.
2. Upon completion, invoke `@agent-review-standard`.
3. If review == `CHANGES_REQUIRED`, dev agent loops to fix.
4. If review == `APPROVED`, human orchestrator runs conditional Security/QA checks based on task routing fields.

## /workflow-implement-critical
1. **[Human Action]:** Invoke `@agent-senior-dev` with the critical Linear task spec.
2. Upon completion, invoke `@agent-review-critical` for adversarial validation.
3. If review == `APPROVED`, human orchestrator MUST invoke `@agent-security-auditor` and `@agent-qa`.

## /workflow-security-review
1. Invoke `@agent-security-auditor`: "Perform mandatory security validation against the current implementation outputs according to your threat model checklist."

## /workflow-context-sync
1. Invoke the last active agent: "Summarize implementation/decisions. Update `Context.md` handoff notes and post the summary to the active Linear task."

## /workflow-strategy-sync
1. Invoke `@agent-pm`: "Read the latest Lead Architect outputs and the current project state. Crate a unified, compressed update to `Strategy.md`. Do not append; rewrite the Live State to prevent token bloat."
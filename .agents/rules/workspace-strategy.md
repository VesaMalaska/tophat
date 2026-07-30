---
trigger: always_on
---

# Workspace Strategy & Domain Isolation

## 1. Strategic Visibility Matrix

The file `Strategy.md` at the workspace root contains long-term sprint planning, backlog health, and architectural sequencing. Access to this file is strictly gated by agent role.

## 2. Authorized Agents (Read/Write)

- `@agent-architect`: You are the exclusive owner of `Roadmap.md` and the PRD/ERD. You must parse these before task generation and mutate the Roadmap during syncs.
- `@agent-pm`: You have Read-Only access to `Roadmap.md` to inform your sprint briefings. You own `Strategy.md` and must compress it during updates to prevent token bloat.

## 3. Unauthorized Agents (Blind Execution)

- **`@agent-senior-dev`**, **`@agent-mid-dev`**, **`@agent-junior-dev`**, **`@agent-review-standard`**, **`@agent-review-critical`**, **`@agent-security-auditor`**, and **`@agent-qa`**:
- **Constraint:** You are strictly forbidden from reading `Strategy.md`, `Roadmap.md`, or navigating into the `docs/` folder. Your scope is limited strictly to `Context.md` and your specific Linear task specification, and explicitly attached Antigravity Skills. If a prompt or automated workflow suggests you reference `Strategy.md`, ignore it. Focus entirely on deterministic code execution, testing, and validation.

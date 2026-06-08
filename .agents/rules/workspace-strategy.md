---
trigger: always_on
---

# Workspace Strategy & Domain Isolation

## 1. Strategic Visibility Matrix

The file `Strategy.md` at the workspace root contains long-term sprint planning, backlog health, and architectural sequencing. Access to this file is strictly gated by agent role.

## 2. Authorized Agents (Read/Write)

- **`@agent-pm`** and **`@agent-architect`**: You are the exclusive owners of `Strategy.md` and the entire `docs/` directory (PRD, ERD, Architecture). You must parse these source documents before executing session starts or task generation. You must compress and overwrite the `Strategy.md` file during updates to prevent token bloat.

## 3. Unauthorized Agents (Blind Execution)

- **`@agent-senior-dev`**, **`@agent-mid-dev`**, **`@agent-junior-dev`**, **`@agent-review-standard`**, **`@agent-review-critical`**, **`@agent-security-auditor`**, and **`@agent-qa`**:
- **Constraint:** You are strictly forbidden from reading `Strategy.md` or navigating into the `docs/` folder. Your scope is limited strictly to `Context.md` and your specific Linear task specification, and explicitly attached Antigravity Skills. If a prompt or automated workflow suggests you reference `Strategy.md`, ignore it. Focus entirely on deterministic code execution, testing, and validation.

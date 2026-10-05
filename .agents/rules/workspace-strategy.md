---
trigger: always_on
---

# Workspace Strategy & Domain Isolation

## 1. Strategic Visibility Matrix

The file `Strategy.md` at the workspace root contains long-term sprint planning, backlog health, and architectural sequencing. Access to this file is strictly gated by agent role.

## 2. Advisory access and authorized application

- `@agent-architect`: You translate the approved selected package into private Roadmap proposals. You do not own or autonomously write product authority; named authorized orchestrator steps apply private changes after their human gates.
- `@agent-pm`: You have Read-Only access to `Roadmap.md` to inform your sprint briefings. You have read-only advisory access to Strategy and Context. Return proposals preserving authority references and unresolved decisions; a separately authorized orchestrator applies exact human-approved edits after current-input and role-session checks.

## 3. Unauthorized Agents (Blind Execution)

- **`@agent-senior-dev`**, **`@agent-mid-dev`**, **`@agent-junior-dev`**, **`@agent-review-standard`**, **`@agent-review-critical`**, **`@agent-security-auditor`**, and **`@agent-qa`**:
- **Constraint:** You are strictly forbidden from reading `Strategy.md`, `Roadmap.md`, or navigating into the `docs/` folder. Your scope is limited strictly to `Context.md` and your specific Linear task specification, and explicitly attached Antigravity Skills. If a prompt or automated workflow suggests you reference `Strategy.md`, ignore it. Focus entirely on deterministic code execution, testing, and validation.

## Product authority versus private operational memory

The selected docs/<package> manifest owns product inventory, active scope and authority relationships. Strategy/Context/Roadmap/root DECISIONS are private derived memory, never competing requirements. If they conflict with approved authority, halt for human resolution. The separate human-invoked Project Definition review responsibility may read its full package; ordinary execution/code-review agents keep their bounded task context. No physical read sandbox is claimed.

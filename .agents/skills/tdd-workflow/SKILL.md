---
name: tdd-workflow
description: Runner-neutral red-green-refactor behavior for Node.js and TypeScript tasks.
---

# TDD workflow

Use when a task has testable behavior. Start with a focused failing test against its acceptance contract, implement the smallest change, and refactor while keeping the relevant tests green. Record the observed failure and passing result.

Use the project-declared runner and pnpm scripts. `vitest-tdd` may supplement this skill only when the host actually uses Vitest. UI or end-to-end tools are selected from task scope, not from this skill.

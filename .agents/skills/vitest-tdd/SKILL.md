---
name: vitest-tdd
description: Enforces strict Test-Driven Development (TDD) using Vitest. Must be executed prior to writing implementation logic.
---

# Vitest TDD & Edge Case Validation Skill

When assigned a logic implementation task, you MUST execute a strict Test-Driven Development loop. Writing implementation code before writing tests is a critical failure.

## 1. Test-First Mandate

- Before modifying any implementation files (`.ts`, `.svelte`), you must first create the corresponding `.test.ts` or `.spec.ts` file.
- You must write tests that map directly to the Acceptance Criteria in the task specification.

## 2. The 3-Edge-Case Minimum

- Alongside the happy path, you must define at least three (3) distinct edge cases for the assigned logic.
- Examples of edge cases: Null/undefined inputs, out-of-bounds array indexing, concurrent state mutations, or network latency simulations.

## 3. The Execution Loop

- Step A (Red): Write the tests. Run `npx vitest run [filename]`. Expect it to fail.
- Step B (Green): Write the minimum implementation code required to pass the test. Run `npx vitest run [filename]`.
- Step C (Refactor): Clean up the code while ensuring the tests remain green.

## 4. Artifact Handoff

- You must include the passing Vitest terminal output in your final Implementation Plan payload so the Review Agent can verify your test coverage.

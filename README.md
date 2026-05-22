# Multi-Agent Development Workflow

This repository contains a comprehensive configuration for orchestrating a multi-agent AI development workflow. It establishes a structured environment where distinct AI agents with specialized roles collaborate, guided by strict operational rules, state-tracking documents, and file system hooks.

## Overview

The core of this workflow resides in the `.agents/` directory, which defines:
- **Agent Personas/Roles:** Specialized prompts and responsibilities for different agents (e.g., PM, Architect, Devs, Reviewers, QA).
- **Workflows:** Formalized pipelines for task routing, implementation, review, and handoff.
- **Rules:** Strict protocols for context synchronization and domain isolation to prevent cross-agent amnesia and token bloat.
- **Skills:** Domain-specific knowledge packages to enforce coding standards (e.g., Svelte 5, Tailwind, Supabase, Electron).
- **Hooks:** Pre- and Post-tool execution gates to ensure safety, formatting, and file system locks.

## Agent Roles

The workflow divides responsibilities among specialized agents located in `.agents/rules/`:

### Management & Planning
- **`@agent-pm`**: Owns strategy and session initiation. Reads `Strategy.md` and `Context.md`.
- **`@agent-architect`**: Breaks down strategy into concrete tasks and routes them to the appropriate developers.

### Development
- **`@agent-senior-dev`**: Handles critical task implementation.
- **`@agent-mid-dev` & `@agent-junior-dev`**: Handle standard task implementation based on routing.

### Quality & Security
- **`@agent-review-standard`**: Performs standard code review on non-critical tasks.
- **`@agent-review-critical`**: Performs adversarial validation on load-bearing system code.
- **`@agent-security-auditor`**: Conducts mandatory security validations against threat models.
- **`@agent-qa`**: Validates multi-step user flows and end-to-end (E2E) testing.

## Workflows

The repository defines strict pipelines in `.agents/workflows/`:
1. **`/workflow-session-start`**: Initializes a session with strategic orientation and risk assessment.
2. **`/workflow-new-task`**: Triggers the Architect to compile task blocks and route them.
3. **`/workflow-implement-standard`**: Execution pipeline for standard dev tasks, including implementation and standard review.
4. **`/workflow-implement-critical`**: Mandatory execution pipeline for load-bearing code (e.g., Auth, Payments). Requires critical review, security audit, and QA.
5. **`/workflow-security-review`**: Triggers the Security Auditor to perform validation.
6. **`/workflow-context-sync`**: Updates the `Context.md` handoff document to prevent context loss between agents.
7. **`/workflow-strategy-sync`**: Compresses and updates `Strategy.md` to prevent token bloat.

## State Management Documents

The workflow relies on two primary state documents (expected at the root of the workspace):

- **`Strategy.md`**: The long-term strategic plan, backlog, and architectural sequence. **Access is strictly gated**—only `@agent-pm` and `@agent-architect` are authorized to read/write this file.
- **`Context.md`**: The live operational handoff document detailing the current phase, completed steps, and blockers. **All agents must read this before execution** to align their internal state.

## Hooks & Gates

Defined in `.agents/hooks.json`, these gates intercept tool usage to enforce project integrity:
- **`context-io-gate`**: Implements file system locking (`.git/locks/antigravity.lock`) to prevent race conditions during file edits.
- **`static-analysis-gate`**: Runs static analysis post-file edits.
- **`protect-strategy-memory`**: Enforces strict domain isolation for `Strategy.md`.
- **`enforce-svelte-runes`**: Validates Svelte 5 syntax correctness.

## Skills

The `.agents/skills/` directory equips agents with specific technical directives:
- `electron-sqlite-ipc`: Standards for Electron IPC bridging and fast SQLite caching.
- `owasp-top-10`: Security validation against common vulnerabilities.
- `playwright-qa-flows`: E2E testing directives.
- `supabase-multitenant-data`: Row Level Security (RLS) and PostgreSQL data isolation.
- `svelte5-kit-architecture`: SvelteKit server-authoritative data loading and Svelte 5 Runes.
- `tailwind-semantic-ui`: Utility-class styling and semantic markup rules.

## Getting Started

To utilize this workflow:
1. Ensure your AI environment supports `@agent` mentions and custom workflows.
2. Run `/workflow-session-start` to initialize your project state.
3. Follow the generated instructions to populate `Strategy.md` and `Context.md`.
4. Trigger `/workflow-new-task` to begin development.

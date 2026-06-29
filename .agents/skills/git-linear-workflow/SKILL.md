---
name: git-linear-workflow
description: Enforces strict Git branching, commit conventions, and Linear task state transitions. Use this at the start and end of every implementation task.
---

# Git & Linear Workflow Skill

When assigned a Linear task for implementation, you must strictly follow this operational lifecycle. Do not skip steps or defer them to the human orchestrator.

## 1. Task Initialization (Before coding)

- **Linear Status:** Use the Linear MCP to transition the assigned task status from `Todo` to `In Progress`.
- **Git Sync & Branching (CRITICAL):** You must synchronize with the remote source of truth to prevent Git Drift. Execute this exact sequence using the `run_command` tool:
  1.  **Fetch:** Execute `git fetch origin main`.
  2.  **Checkout/Recover:** Attempt to execute `git checkout [type]/[linear-issue-id]-[short-description]`.
  3.  **Branch Creation:** If step 2 throws an error (e.g., pathspec did not match), execute `git checkout -b [type]/[linear-issue-id]-[short-description] origin/main` to cleanly branch from the remote.
      - **Types:** `feature/`, `bugfix/`, `chore/`, `refactor/`
      - **Example:** `feature/ENG-142-electron-sqlite-init`

## 2. Implementation & Committing (During coding)

- Follow Git Best Practices. Group logical changes together.
- **Commit Messages:** Use Conventional Commits formatting.
  - **Format:** `[type]([optional scope]): [Linear-ID] [description]`
  - **Example:** `feat(ipc): ENG-142 setup context bridge for sqlite queries`
- Ensure code is compiling and saving before committing.

## 3. Task Completion (After coding)

- **Git Push:** Use `run_command` to push your branch to the remote repository.
  - _Command:_ `git push -u origin [branch-name]`
- **Linear Status:** Use the Linear MCP to transition the task status from `In Progress` to `In Review`.
- **Handoff:** Only after the push and status update are successful should you yield to the human. **You must output this exact string to prompt the human orchestrator:**
  > "**Implementation Complete & Pushed.** Human Orchestrator: Please switch the IDE model to `Claude Sonnet` (or Opus for Critical tasks) and invoke the corresponding Code Review Agent."

## 4. Unhappy Path (Blockers)

If you encounter a hard blocker (missing schema, scope violation) during Phase 2 (Implementation):

- **Linear Status:** Use the Linear MCP to transition the task to 'Blocked'.
- **Git State:** If you have written partial code, commit it with `chore(wip): [Linear-ID] partial implementation prior to blocker` and push to origin. If no code was written, you may abandon the branch.
- **Communication:** Add a detailed comment to the Linear issue explaining the technical blocker so the Human Orchestrator or Lead Architect can resolve it asynchronously.

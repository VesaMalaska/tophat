---
description: Resolves git merge conflicts on an active feature branch and verifies with the host's declared checks.
---

**Steps:**

1. **Initialize Task:** Invoke `@agent-senior-dev`.
2. **Context Ingestion:** Use the Linear MCP to fetch Task ID `{{args[0]}}`. Identify the active feature branch (e.g., `feature/{{args[0]}}-...`).
3. **Branch Sync & Pull:** Use the `run_command` tool to execute the following sequentially:
   - `git checkout feature/{{args[0]}}-*`
   - `git fetch origin main`
   - `git merge origin/main`
4. **Conflict Discovery:** If merge conflicts occur:
   - Run `git status` and `git diff --name-only --diff-filter=U` to isolate all conflicted files.
   - Read the conflict files using the `view_file` tool.
5. **Surgical Reconciliation:**
   - Analyze both sides of the conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`).
   - Preserve the functional contracts of both the incoming `main` changes and the current task implementation.
   - Remove all git conflict markers and write the resolved files using the `replace_file_content` tool.
6. **Validation Gate (Mandatory):**
   - Run the host project's declared unit, typecheck, and lint scripts when applicable. Do not assume Vitest or fixed script names. The shared gate executor arrives in Slice 3.
7. **Post-Flight Automation:**
   - Run `git add .`
   - Run `git commit -m 'chore(git): resolve merge conflicts with main for {{args[0]}}'`
   - Run `git push origin HEAD`
8. **HUD Radar Broadcast:**
   - Execute `npx tsx .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "Conflict Resolution" --tier "senior" --status "In Review: Architecture" --next "/review-critical {{args[0]}}"` via `run_command`.

---
description: Surgical remediation pipeline for tasks rejected by Review, Security, or QA.
---

**Steps:**

1.  **Initialize Orchestration:** Invoke the system shell to read the Linear Task ID `{{args[0]}}` metadata and identify the assigned Dev Tier (junior, mid, or senior).
2.  **Route to Agent:** Dynamically invoke the corresponding execution agent (`@agent-junior-dev`, `@agent-mid-dev`, or `@agent-senior-dev`).
3.  **Instruction:** "Use the Linear MCP to fetch Task ID `{{args[0]}}`. This task is currently in 'Changes Requested'. Read the most recent rejection comments left by the Review, Security, or QA agents. DO NOT rewrite the entire implementation. Isolate the specific files and lines flagged in the failure analysis."
4.  **Execution:** "Ensure you are on the existing feature branch. Execute surgical fixes to resolve the reported findings. Do not introduce new features.
    - If you are `@agent-mid-dev` or `@agent-senior-dev`: You MUST re-run Vitest (via the vitest-tdd skill) to ensure your logic changes have not broken existing architectural constraints.
    - If you are `@agent-junior-dev`: Do not attempt to run Vitest. Instead, statically verify your structural markup and ensure your fixes strictly align with the `tailwind-semantic-ui` constraints."
5.  **Post-Flight Automation:**
    - Run `git add .`
    - Run `git commit -m 'fix: {{args[0]}} address review feedback'`
    - Run `git push origin HEAD`
    - Use the Linear MCP to transition Task `{{args[0]}}` to 'In Review: Architecture'.
    - Use the Linear MCP to add a comment detailing exactly how the critical/major findings were resolved.
    - HUD Radar Broadcast: Execute `npx tsx .agents/scripts/update-hud.ts --task "{{args[0]}}" --title "[Fetched Task Title]" --tier "[Identify your assigned tier: junior, mid, or senior]" --sec "[yes or no]" --qa "[yes or no]" --status "In Review: Architecture" --next "[/review-critical {{args[0]}} OR /review-standard {{args[0]}} based on target constraints]" --model "Claude Sonnet"` via `run_command` to instantly update the visual Orchestrator HUD.

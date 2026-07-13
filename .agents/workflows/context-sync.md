---
description: Enforces operational handoff state updates for agent memory and generates a visual HUD for the Human Orchestrator.
---

**Steps:**

1. **Data Aggregation:** Invoke the last active agent in the current implementation trajectory.
2. **Instruction:** Summarize the completed realization, downstream mandates, and any observed side-effects (e.g., schema modifications or newly introduced Svelte 5 reactive scopes).
3. **Context Update (Agent Memory):** Update the Agent Handoff Notes section in Context.md via the replace_file_content tool.
4. **HUD Generation (Human Memory):** Use the write_to_file tool to entirely overwrite a file named HUD.md at the workspace root. You MUST use this exact formatting to create a highly visual dashboard for the human operator:

   # 🛸 TopHat Orchestrator HUD

   _Last Updated: [Current Timestamp]_

   ### 🎯 Active Target
   - **Task:** [Task ID] - [Title]
   - **Dev Tier:** [junior | mid | senior]

   ### 🚦 Pipeline Status

   _[Use emojis to map the current state: 🟢 Done | 🟡 Pending/Next | ⚪ Not Started]_
   - [ ] Implementation
   - [ ] Standard/Critical Review
   - [ ] Security Audit
   - [ ] QA Validation
   - [ ] PR Generation

   ### 🚀 Immediate Next Action
   - **Command:** `[The exact slash command to run next]`
   - **Model:** `[The EXACT recommended LLM model from the matrix]`

   ### 🚧 Active Blockers
   - [None | Describe any blocker stopping the swarm]

5. **External Sync:** Post the identical Agent Handoff summary as a comment to the active Linear task to ensure external tracking is maintained.

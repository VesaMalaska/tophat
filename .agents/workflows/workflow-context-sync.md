---
description: Enforces operational handoff state updates to prevent cross-agent amnesia.
---

**Steps:**
1. **Data Aggregation:** Invoke the last active agent in the current implementation trajectory.
2. **Instruction:** "Summarize the completed realization, downstream mandates, and any observed side-effects (e.g., schema modifications or newly introduced Svelte 5 reactive scopes)."
3. **Execution:** "Update the Agent Handoff Notes section in `Context.md` via the `replace_file_content` tool. Post the identical summary as a comment to the active Linear task."
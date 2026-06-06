---
description: Prompts the PM Agent to refresh Strategy.md after a Lead Architect session.
---

**Steps:**
1. **Strategic Aggregation:** Invoke `@agent-pm`.
2. **Instruction:** "Read the latest Lead Architect outputs and the current project state from Context.md and Linear."
3. **Execution:** "Create a unified, compressed update to `Strategy.md`. Do not simply append data; rewrite the Live State to prevent token bloat while preserving the Strategic Exchange History."
4. **Human Gate:** Review the PM Agent's proposed `Strategy.md` changes before approving the file write.
---
description: Strategic sprint orientation, risk assessment, contextual routing, Linear connection validation, and visual HUD synchronization.
---

**Steps:**

1. **Initialize State:** Invoke `@agent-pm`.
2. **Pre-Flight Authentication:** Attempt a lightweight read operation using the Linear MCP (e.g., fetch the current user profile or active workspace status). If this fails, halt execution and output a `[LINEAR_AUTH_FAILED]` blocker alert requiring human intervention.
3. **Instruction:** If authentication is successful, read `Strategy.md`, `docs/Roadmap.md`, `Context.md`, and the active Linear board via your MCP tool. Do not confabulate missing state. Cross-reference the active chunks to ensure timeline alignment.
4. **Execution (Briefing):** Generate the standard sprint briefing detailing Sprint Health, the Roadmap Horizon, Recently Completed tasks, the Recommended Next Action (with Dev Tier), and any immediate architectural blockers.
5. **HUD Radar Broadcast (Authorized Execution):** You are explicitly authorized to use the `run_command` tool for this specific step. Take the "Recommended Next Action" you just generated and pipe it into the HUD. Execute the following command, dynamically replacing the bracketed values: `npx tsx .agents/scripts/update-hud.ts --task "[Recommended Task ID]" --title "[Recommended Task Title]" --tier "[Recommended Dev Tier]" --status "Todo" --next "[Recommended Command, e.g., /implement-mid JAC-33]"`
6. **Human Gate:** Output the briefing. The Human Orchestrator will review your recommendation and the refreshed HUD before proceeding to task implementation.

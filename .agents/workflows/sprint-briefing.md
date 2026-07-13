---
description: Strategic sprint orientation, risk assessment, contextual routing, and Linear connection validation.
---

**Steps:**

1. **Initialize State:** Invoke `@agent-pm`.
2. **Pre-Flight Authentication:** Attempt a lightweight read operation using the Linear MCP (e.g., fetch the current user profile or active workspace status). If this fails, halt execution and output a `[LINEAR_AUTH_FAILED]` blocker alert requiring human intervention.
3. **Instruction:** If authentication is successful, read `Strategy.md`, `docs/Roadmap.md`, `Context.md`, and the active Linear board via your MCP tool. Do not confabulate missing state. Cross-reference the active chunks to ensure timeline alignment.
4. **Execution:** Generate the standard sprint briefing detailing Sprint Health, the Roadmap Horizon, Recently Completed tasks, the Recommended Next Action (with Dev Tier), and any immediate architectural blockers.
5. **Human Gate:** Review the PM's recommendation before proceeding to task generation or implementation.

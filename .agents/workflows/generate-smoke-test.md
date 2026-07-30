---
description: Generates the environment-specific CI/CD smoke test ticket in Linear.
---

**Steps:**

1.  **Initialize State:** Invoke `@agent-architect`.
2.  **Context Ingestion:** Read Declaration 1 (Execution Stack) from `docs/PRD.md`.
3.  **Systemic Smoke Test Autonomy:** Deduce the required foundational runtime validation for this specific stack (e.g., if Electron, it needs a native binary boot check; if Next.js, it needs a localhost port binding check).
4.  **Execution (Linear MCP):** You are explicitly authorized to use the Linear MCP to autonomously create this issue without a human approval phase. Create a high-priority Linear task instructing `@agent-senior-dev` to implement this environment-specific Playwright smoke test at `tests/e2e/smoke.test.ts`. Assign Dev Tier: `senior`, Review Tier: `critical`. Verify it lands in the 'Todo' column.
5.  **Completion:** Output a confirmation summary of the ticket creation.

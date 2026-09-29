---
description: Generates the environment-specific CI/CD smoke test ticket in Linear.
---

**Steps:**

1.  **Initialize State:** Invoke `@agent-architect`.
2.  **Context Ingestion:** Load the validated workspace declaration and read the project's approved execution-stack documentation. Do not infer a browser from the presence of Node.js.
3.  **Systemic Smoke Test Selection:** Select from the derived workspace profile: web requires a suitable browser-facing boot/route check; `backend + none` requires a service boot, health, or API check without Playwright; Electron requires a desktop boot and relevant IPC check while retaining main/preload/renderer boundaries. Choose a path and tool supported by the host project rather than a fixed test filename. Use `select-task-guidance.ts` to validate all proposed skills and framework instructions before handoff.
4.  **Execution (Linear MCP):** Create a high-priority task for the selected smoke specification under the existing human authorization for this workflow. Assign Dev Tier: `senior`; choose the existing review route from task risk rather than assuming `critical` for all environments. Verify it lands in the 'Todo' column. The project-declared validation runner and QA method selection are implemented in later slices.
5.  **Completion:** Output a confirmation summary of the ticket creation.

---
name: react-architecture
description: React component and state boundaries for workspaces with the derived react capability.
---

# React architecture

Use only when the validated workspace derives `react`. In a Next.js workspace, pair this skill with `nextjs-architecture` for framework-specific server boundaries.

- Keep component ownership and data flow explicit. Prefer local state and derived rendering; use effects for synchronization with external systems rather than recalculating render state.
- Keep event handlers and state transitions testable. Avoid duplicating server-owned state in unrelated components.
- Preserve accessible names, keyboard behavior, focus management, and semantic elements for interactive UI.
- Use the host project's declared test runner and scripts. Test observable behavior and important state transitions without assuming Vitest or browser automation is installed.
- Follow the project's own styling choice. Tailwind is selected only when explicitly declared for the task or project.

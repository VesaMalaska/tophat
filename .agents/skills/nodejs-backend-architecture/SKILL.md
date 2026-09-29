---
name: nodejs-backend-architecture
description: Node.js API and service boundaries for node-server tasks without assumed browser tooling.
---

# Node.js backend architecture

Use for a backend task when the validated workspace derives `node-server`. This includes `backend + none` and applicable server tasks in SvelteKit or Next.js.

- Keep transport, domain behavior, and persistence responsibilities distinguishable. Validate input at the boundary and enforce authorization before accessing protected state.
- Keep secrets, credentials, and privileged operations in the server runtime. Define error contracts without leaking internal details.
- Make boot, health, shutdown, and dependency behavior explicit where relevant. Use controlled fixtures for stateful tests.
- Use declared pnpm validation scripts and the project's Node-compatible test runner. A backend-only task does not require a browser, UI states, or Playwright.

---
name: sqlite-high-performance
description: Enforces high-throughput local SQLite configuration, caching strategies, and strict transactional integrity. This skill is aimed for projects that are built on Vite or Rolldown and require high-performance local SQLite interactions.
---

# SQLite Performance & Data Integrity Skill

When interacting with a local SQLite database, enforce these performance configurations and execution rules:

## 1. Write-Ahead Logging (WAL) Configuration

- Upon initialization, the connection MUST execute `PRAGMA journal_mode = WAL;` to enable concurrent reads and faster writes.
- Set `PRAGMA synchronous = NORMAL;` to balance OS crash resilience with maximum write speed.

## 2. Transactional Integrity

- Bulk insertions, updates, or deletions MUST be wrapped in an explicit database transaction (`db.transaction(...)`). Executing mass mutations individually will lock the database and crash the I/O thread.

## 3. Query Optimization

- Utilize Prepared Statements for all repeated queries to bypass the query planner overhead and implicitly prevent SQL injection attacks.
- Return exact, minimized column projections (e.g., `SELECT id, name`) rather than generic wildcards (`SELECT *`) to reduce serialization latency across the IPC bridge.

## 4. Build & Bundling Constraints (Vite / Rolldown)

- **Strict Externalization:** When modifying build configurations (like `vite.config.ts`), native C++ dependencies such as `better-sqlite3` MUST be explicitly added to the `server.deps.external` and `build.rollupOptions.external` arrays. Do not allow the bundler to inline native C++ bindings into the ESM output.
- **Test Environment Isolation:** When configuring Vitest for SQLite, you must preserve existing frontend testing configurations. Ensure `resolve.conditions: ['browser']` is strictly maintained for UI framework component tests, while keeping `better-sqlite3` externalized.

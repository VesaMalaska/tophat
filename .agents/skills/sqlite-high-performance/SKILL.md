---
name: sqlite-high-performance
description: Enforces high-throughput local SQLite configuration, caching strategies, and strict transactional integrity. This skill is aimed for projects that are built on Vite or Rolldown and require high-performance local SQLite interactions.
---

# SQLite Performance & Data Integrity Skill

When interacting with a local SQLite database, follow approved host durability, concurrency and bundler policy. The examples below are conditional implementation choices; parameterized queries and authorized mutations remain safety bounds:

## 1. Write-Ahead Logging (WAL) Configuration

- Upon initialization, when approved for the host, the connection may execute `PRAGMA journal_mode = WAL;` to enable concurrent reads and faster writes.
- Use the approved synchronous setting. `PRAGMA synchronous = NORMAL;` is a performance/durability tradeoff, not a universal requirement.

## 2. Transactional Integrity

- Bulk insertions, updates, or deletions MUST be wrapped in an explicit database transaction (`db.transaction(...)`). Executing mass mutations individually can cause excess contention; choose transaction boundaries from the approved atomicity requirements.

## 3. Query Optimization

- Utilize Prepared Statements for all repeated queries to bypass the query planner overhead and implicitly prevent SQL injection attacks.
- Return exact, minimized column projections (e.g., `SELECT id, name`) rather than generic wildcards (`SELECT *`) to reduce serialization latency across the IPC bridge.

## 4. Build & Bundling Constraints (Vite / Rolldown)

- **Strict Externalization:** When modifying build configurations (like `vite.config.ts`), native C++ dependencies such as `better-sqlite3` must use the installed bundler's supported native-dependency externalization settings approved by the host. Do not allow the bundler to inline native C++ bindings into the ESM output.
- **Test Environment Isolation:** When configuring Vitest for SQLite, you must preserve existing frontend testing configurations. Preserve the approved UI resolution conditions and native dependency isolation; do not inject version-specific settings blindly.

## Approved host policy and security bounds

Implementation choices follow the approved host package supplied through authorized task extracts; this does not expand ordinary execution roles into full product docs browsing. Shared `.agents/docs` safety contracts remain mandatory resources. Validation at trust boundaries, authorization, secret protection, safe IPC and declared isolation remain security invariants. If approved host choices conflict with these bounds, halt for human resolution rather than silently waive them.

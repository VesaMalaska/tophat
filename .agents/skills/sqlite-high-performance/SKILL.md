---
name: sqlite-high-performance
description: Enforces high-throughput local SQLite configuration, caching strategies, and strict transactional integrity.
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

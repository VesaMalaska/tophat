---
name: electron-sqlite-ipc
description: Standards for Electron IPC bridging and high-speed SQLite caching. Use for desktop application tasks requiring local file system access.
---

# Electron & SQLite IPC Skill

When building native desktop utilities, enforce performance and security boundaries:

## 1. IPC Communication (Context Bridge)

- Never enable `nodeIntegration` in the renderer process.
- Expose a strictly typed API to the renderer via `contextBridge.exposeInMainWorld`.
- Validate all IPC payloads in the main process before executing SQLite queries or file system operations.

## 2. High-Speed SQLite Caching

- Use aggressive caching strategies for large directory reads.
- Execute bulk inserts using transactions to maintain UX responsiveness.
- Offload heavy image processing or tagging loops to worker threads to avoid blocking the main process.

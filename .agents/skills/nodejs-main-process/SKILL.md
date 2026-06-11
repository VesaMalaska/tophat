---
name: nodejs-main-process
description: Standards for heavy Node.js Main Process execution, background worker pools, and OS-level integrations.
---

# Node.js Main Process Architecture Skill

When executing native logic in the Node.js backend environment, enforce the following performance standards:

## 1. Non-Blocking Architecture

- **CRITICAL:** The primary Event Loop (Main Thread) must never be blocked by synchronous heavy computations (e.g., cryptography, large file parsing, or image manipulation).
- Offload intense CPU-bound operations to Node.js `worker_threads` or Electron's `utilityProcess`.

## 2. File System Operations

- Utilize asynchronous file system methods (e.g., `fs.promises.readFile`) exclusively. Never use synchronous equivalents (`fs.readFileSync`) outside of absolute initialization sequencing.
- Implement streaming (`fs.createReadStream`) when handling large files to prevent V8 memory limits/OOM crashes.

## 3. Graceful Process Lifecycle

- Ensure all spawned processes, file descriptors, and worker threads are explicitly terminated and cleaned up on application exit or window closure to prevent memory leaks and orphaned OS processes.

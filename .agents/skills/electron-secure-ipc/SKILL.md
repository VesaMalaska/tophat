---
name: electron-secure-ipc
description: Enforces secure Electron Main/Renderer process bridging, context isolation, and typed IPC communication.
---

# Electron Secure IPC Skill

When building the native window and communication layers, enforce the following security and architecture boundaries:

## 1. Secure Process Initialization

- `contextIsolation` MUST be set to `true`.
- `nodeIntegration` MUST be set to `false` in all renderer processes.
- Never disable web security parameters (`webSecurity: true`) in the `BrowserWindow` config.

## 2. Context Bridge Implementation

- Expose a strictly typed API to the renderer via `contextBridge.exposeInMainWorld('api', { ... })`.
- Never pass raw DOM objects, native Node buffers, or non-serializable objects across the IPC boundary.

## 3. Type-Safe Channels

- Implement explicit TypeScript interfaces for all IPC payload arguments and return types. Use exact channel name mapping (e.g., `ipcMain.handle('domain:action', handler)`).

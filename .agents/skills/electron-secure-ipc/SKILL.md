---
name: electron-secure-ipc
description: Enforces secure Electron Main/Renderer process bridging, context isolation, and typed IPC communication.
---

# Electron Secure IPC Skill

When building the native window and communication layers, enforce the following security and architecture boundaries:

## 1. Secure Process Initialization

- contextIsolation MUST be set to true.
- nodeIntegration MUST be set to false in all renderer processes.
- Never disable web security parameters (webSecurity: true) in the BrowserWindow config.

## 2. The Strict IPC Contract Chain (Mandatory Artifact)

When modifying or creating IPC bridges, you are manipulating a brittle 7-part chain. You MUST verify and explicitly map every single link in this chain in your final output.

**Required Output Format:**
Inside your "Trace Validation Checklist" payload, you MUST include the following map for every IPC pathway you touch:

- Renderer API: [e.g., MediaGrid.svelte calling window.api...]
- ↓
- Preload: [e.g., contextBridge mapping]
- ↓
- Channel: [e.g., 'media:delete']
- ↓
- Handler: [e.g., ipcMain.handle listener]
- ↓
- Service: [e.g., SQLite execution block]
- ↓
- Result: [e.g., Promise<void>]
- ↓
- Renderer State: [describe the actual declared renderer state update, if any]

If you cannot definitively fill out all 7 steps of this map, your implementation is broken. Do not commit.

## 3. Context Bridge & Type Safety

- Expose a strictly typed API to the renderer via `contextBridge.exposeInMainWorld`.
- Implement explicit TypeScript interfaces for all IPC payload arguments and return types. Use exact channel name mapping.

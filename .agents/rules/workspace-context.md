---
trigger: always_on
---

# Global Context Synchronization

## 1. Operational handoff state
The file `Context.md` located at the workspace root is the live operational handoff document. It is derived operational memory, not product authority. It contains the current Workflow Stage, completed implementation steps, and immediate blocker states.

## 2. Mandatory Pre-Flight Protocol
Before dependent checks, writes or external actions, you MUST:
1. Silently read `Context.md` using the `view_file` tool.
2. Align your internal execution plan with the `Agent Handoff Notes` section.
3. If `Context.md` contradicts your task specification, halt execution and output a blocker report. Do not attempt to resolve state conflicts autonomously.

## 3. Post-Flight Protocol
Implementation, review and QA return accurate handoff text and findings. Read-only roles do not update tracked state. A separately authorized orchestrator may apply private-state edits via `/context-sync` before final review/security/QA sealing. No compulsory post-review write or commit is authorized; later commits require fresh applicable exact-HEAD evidence. Persist receipts externally; Context/HUD mirrors are not approval receipts.
Cached documentation labels never authorize planning. Read-only package/task validators supply current approval and integrity; conflicting Context authority references cause a blocker, not a public requirements rewrite. Orchestrator state updates remain separate authorized actions.

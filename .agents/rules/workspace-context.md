---
trigger: always_on
---

# Global Context Synchronization

## 1. The Single Source of Truth
The file `Context.md` located at the workspace root is the live operational handoff document. It contains the current phase, completed implementation steps, and immediate blocker states.

## 2. Mandatory Pre-Flight Protocol
Before initiating any tool use or answering any prompt, you MUST:
1. Silently read `Context.md` using the `view_file` tool.
2. Align your internal execution plan with the `Agent Handoff Notes` section.
3. If `Context.md` contradicts your task specification, halt execution and output a blocker report. Do not attempt to resolve state conflicts autonomously.

## 3. Post-Flight Protocol
If your task involves implementation, review, or QA, you are responsible for updating `Context.md` upon completion via `/workflow-context-sync`. Never exit a successful trajectory without ensuring the next agent in the hierarchy has an accurate handoff state.
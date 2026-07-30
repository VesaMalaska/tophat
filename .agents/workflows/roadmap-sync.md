---
description: Synchronizes the Master Roadmap based on completed chunks and updates the PM's Strategy memory.
---

**Steps:**

1.  **Initialize Architect:** Invoke `@agent-architect`.
2.  **Contextual Ingestion:** Read `Context.md` (specifically the Agent Handoff Notes) and the active Linear board via the MCP extension to evaluate the completion status of the current `[ACTIVE_SPRINT_CHUNK]`.
3.  **Roadmap Mutation:** If all deliverables for the current chunk are realized, use the replace_file_content tool to move the current chunk to `[REALIZED_CHUNKS]` in `Roadmap.md`. Elevate the next logical sequence from `[UPCOMING_CHUNKS]` into the `[ACTIVE_SPRINT_CHUNK]` slot.
4.  **Strategy Cascade:** Once the Roadmap is updated, overwrite the 'Active Sprint Chunk' section in `Strategy.md` with the newly elevated chunk to ensure `@agent-pm` remains perfectly aligned with the Architect's timeline.
5.  **Completion:** Output a summary of the Roadmap shift, highlighting the new active chunk and its deliverables, for the Human Orchestrator's review.

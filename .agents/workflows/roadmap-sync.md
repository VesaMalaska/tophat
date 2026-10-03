---
description: Propose private chunk advancement from completed work and current approved authority.
---

1. Invoke `@agent-architect`. Run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'` before private planning advancement; require APPROVED_VALID and planningAllowed. Halt on any denial or mismatch with current roadmap authorityFingerprint.
2. Read Context, Roadmap and completed task/Linear evidence. Verify the current active chunk's deliverables against its source references. Code realization and private ADRs do not redefine product authority.
3. Output the proposed move to REALIZED_CHUNKS and the next ACTIVE_SPRINT_CHUNK with stable Development Phase/Sprint Chunk IDs, declared scopeIds and current fenced JSON authorityContext. Do not change approved product files or generate future tasks.
4. Require explicit human direction before mutation. A separate authorized orchestrator revalidates unchanged authority and applies only the named Roadmap/Strategy/Context/HUD changes. The Architect remains a proposal author; PM is not granted execution authority.
5. Ordinary Sprint Chunk advancement does not synchronize documents. At a Development Phase boundary, halt advancement until `/sync-derived-docs` has a current validated DOCUMENTATION_ACCEPTED receipt and explicit human acceptance. An immediate-task receipt cannot accept the phase. Only the separate authorized orchestrator may mark the phase completed; a HUD/Linear label alone is insufficient. After all phases, `/verify-project-docs` and final human acceptance are still required. Accepted receipts are commit-bound history, not current readiness after later changes. No implicit Git operations.

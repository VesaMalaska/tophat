---
description: Propose private planning reconciliation only after revised product authority is approved and valid.
---

1. Invoke `@agent-architect`; pause task generation. Run `node .agents/scripts/validate-doc-package.ts '{"mode":"approved"}'` before authority ingestion or roadmap/task side effects. Require APPROVED_VALID and planningAllowed. Draft, changed hashes/metadata or stale approval causes a blocker; the human resolves and reapproves authority first.
2. Read only the selected validated package inventory, current private roadmap and relevant existing task evidence. Do not discover loose PRD/ERD files or treat code/root private ADRs as new scope authority.
3. Output a bounded reconciliation proposal for ACTIVE_SPRINT_CHUNK and UPCOMING_CHUNKS, including stable IDs and updated authorityContext provenance. Preserve REALIZED_CHUNKS history. If product meaning remains contradictory, halt rather than mutate requirements.
4. Read the Linear board and output an obsolete/stale task triage report. This does not cancel, rewrite or create issues; new/amended task payloads require fresh package and task-authority checks and their human gates.
5. After explicit human direction, a separate authorized orchestrator revalidates the proposed authority fingerprint and applies only the named private Roadmap/Context/Strategy/HUD changes. The Architect does not violate its declared file-write boundary.
6. Do not run the disabled `/generate-readme` path or autonomously rewrite public documentation. Derived-document synchronization is Slice 7. Do not execute Git operations implicitly.
7. Summarize exact changed private paths, package provenance and triage decisions for the human. Recommend the appropriate authorized workflow/model from routingMatrix.

---
description: Independent read-only semantic review of the exact draft documentation candidate.
---

1. Read `.agents/rules/project-definition.md`. Use a separate human-selected reviewer session. This document-review responsibility may read the complete selected package and definition evidence; ordinary downstream code-review agents still use bounded task context.
2. Run `node .agents/scripts/validate-doc-package.ts '{"mode":"draft"}'`. Halt on DENIED. Record the candidateFingerprint and package version; read only that package and the complete declared uncertainty/input inventory.
3. Review contradictions, scope boundaries, unsupported assumptions, acceptance criteria, authority ownership, traceability, public/private coherence and every material unknown. Existing code is evidence, not authority. Do not amend files or approve your own remediation.
4. Output a structured review receipt for an authorized orchestrator to save at `.agents/project-definition/<packageId>/review.json`. Required fields: `packageId`, `packageVersion`, `candidateFingerprint`, `reviewer`, `role: independent-review`, exact UTC ISO `reviewedAt`, `evidenceLocator`, `priorApprovedVersion` (string or null), `verdict` (`READY_FOR_HUMAN_APPROVAL|CHANGES_REQUIRED|BLOCKED`), `findings` and `uncertainties`.
5. Every finding has `id`, boolean `material`, boolean `resolved`, and nonempty `disposition`. Every uncertainty additionally has `classification: confirmed|proposed|assumed|unresolved|out-of-scope` and a declared `scope`. Include every declared material question. Unresolved material entries require CHANGES_REQUIRED/BLOCKED. Nonmaterial findings need dispositions. A receipt does not prove the review's completeness or identity.
6. Only READY_FOR_HUMAN_APPROVAL for the identical candidate permits the orchestrator to mark the manifest `awaiting-human-approval`. Changing approvalStatus alone does not change either fingerprint. Any substantive edit/version change requires another independent review. The reviewer outputs evidence but writes nothing.
7. Present the exact scope/version/fingerprint and resolved findings to the human. Stop. Recommend `/project-definition-finalize` with its configured model; neither this review nor a READY verdict is human approval.

Git policy: this workflow authorizes no Git mutation. Any later Git action belongs to a separately authorized execution workflow under the shared Git safety contract; this does not grant command authority to a read-only role.

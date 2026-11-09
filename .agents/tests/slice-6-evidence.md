# Slice 6 implementation evidence

Baseline: `development` commit `47330d837fe7f1af584ba0cc02dd71de0e3ef2d2`, tree `ae7766d94ba9ac79c0590882e682526781542601` (merged Slice 5).

Implementation branch: `feature/1.0-slice-6-routing-qa-role-boundaries`.

`pnpm test:tophat`: 190 passed, zero failed, zero skipped. `git diff --check`: passed.

| Definition criteria | Implemented mechanism and evidence |
| --- | --- |
| 8–10: deterministic routing and independent review | `classify-task.ts`; routing and workflow contract fixtures cover fixed tier routes, critical/security requirements, mixed work, forbidden overrides, and independent reviewer/developer sessions. |
| 16: project-owned clean code policy | Shared validation runner retains host-declared scripts; developer/reviewer instructions require semantic review. Five reviewed examples document semantic expectations without imposing TopHat complexity or line-count metrics. |
| 17–19: QA applicability, evidence, and freshness | `validate-qa-evidence.ts`; fixtures cover derived method unions, criterion coverage, artifact digests, duplicate/unknown fields, failed scripts, verdict consistency, attempt order, exact-HEAD invalidation, remediation, and publication/PR identity checks. |
| 20: honest role boundaries | `inspect-role-session.ts`; fixtures detect tracked/index/private-state changes and reported prohibited operations. Instructions distinguish a callable validator from physical host interception. |
| 29: advisory PM | PM instructions prohibit commands and mutation; external pre/post fixtures cover dirty inputs, existing failed validation, unchanged sessions, and forbidden operations. |

The suite runs on Linux/Node 24. Windows-shaped path fixtures do not constitute Windows runtime certification. Web/backend reports are synthetic contract examples; no live browser or Electron acceptance session is claimed.

Helpers inspect supplied evidence and current filesystem/Git state when invoked. Receipts do not authenticate human identity or independently prove that a declared UI journey occurred. Session snapshots cannot detect an unreported transient action restored before inspection. Antigravity physical role interception remains unverified. Publication instructions call the gate; this slice does not introduce a server-enforced GitHub publication policy.

Evidence custody is handled by the authorized orchestrator. Receipts are separate from sealed artifact inventories to avoid recursive hashes. Later tracked-state commits invalidate approval. Slice 7 derived-document generation and Slice 8 shared Git-mutation preflight remain excluded.

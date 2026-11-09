# TopHat 1.0 integrated acceptance

Slice 9 assembles evidence for the 30 approved Definition criteria. The vault remains an unconfigured template. A green fixture suite is not live host project acceptance or release authorization.

## Reproduce the focused suite

Use Node >=24 and pnpm. Install only the isolated runner fixture's locked dependencies, then run the complete harness:

```bash
pnpm --dir .agents/tests/fixtures/runner-neutral install --frozen-lockfile
pnpm test:tophat
```

No host installation or dependency setup occurs inside `runValidation`. The harness creates disposable Git hosts and executes actual pnpm scripts for Node and Vitest. It proves red/green and actual V8 coverage threshold outcomes. The fixture owns its 40% passing and 100% deliberately failing branch policies; these are examples, not TopHat defaults. Node and Vitest use different branch counting conventions.

The runner clears the internal `NODE_TEST_CONTEXT` marker before launching an independent host command. The regression fixture first exposed an inherited worker context suppressing nested Node tests; a deliberately incorrect implementation must fail before its correction passes. Other project environment variables retain their existing behavior.

## Static criterion index

`.agents/docs/acceptance-criteria.json` contains exactly IDs 1–30, the approved requirement text, exact file/test names, required evidence kinds, and live host project obligations. Its 18 groups include the approved additive terminal amendment; existing IDs and live obligations remain unchanged. No runtime verdict is stored in the index. The checker rejects unknown/duplicate JSON keys, unresolved tests and weakened evidence-kind obligations. Test-name resolution is a static instruction check, not proof of execution.

The five evidence kinds are `mechanism`, `configuration-fixture`, `command-execution`, `semantic-review`, and `live-integration`. Artifact provenance is `observed`, `synthetic`, or `configuration`. Command, semantic and live artifacts require the recorded provenance `observed`. That declaration is not authenticated: the positive unit-test dossier explicitly simulates it and never establishes real people or live host project acceptance.

## Explicit verifier interface

```bash
node .agents/scripts/validate-acceptance-evidence.ts \
  --root /absolute/tophat-checkout \
  --candidate FULL_TOPHAT_COMMIT \
  --index /absolute/tophat-checkout/.agents/docs/acceptance-criteria.json \
  --evidence-root /absolute/private-evidence \
  --dossier /absolute/private-evidence/dossier.json \
  --host-root /absolute/approved-host-checkout \
  --host-candidate FULL_HOST_COMMIT
```

All seven flags are required once actual identities are known; no current-directory, branch or newest-file inference occurs. Missing CLI arguments or internal Git/subprocess failures exit 2. Incomplete/invalid records exit 1. Only consistent complete evidence exits 0 with `EVIDENCE_COMPLETE`. None of these results authorizes merge, release preparation, tagging or publication.

## Closed v1 dossier

Top-level fields are `schemaVersion`, `identity`, `indexSha256`, `runtime`, `attempts`, `currentAttempt`, `artifacts`, `criteria`, `hostProject`, `review`, and `limitations`. Unknown fields and duplicate keys deny. Timestamps use canonical UTC ISO strings with milliseconds; hashes are lowercase SHA-256 and commits are full object IDs.

| Record | Exact fields and meaning |
| --- | --- |
| `identity` | `root`, `commit`, `tree`, `branch`, `remoteUrlSha256`; root and configured origin URL digest identify the inspected clean attached checkout |
| `runtime` | `node`, `pnpm`, `os`; versions/environment recorded by the orchestrator |
| `attempts[]` | `sequence`, `runId`, `candidate`, `startedAt`, `completedAt`, `status`, `suite`; contiguous chronological sequence, unique run IDs, no older-green fallback |
| `suite` | `command`, `exitStatus`, `passed`, `failed`, `skipped`, `artifactId`, `logArtifactId`; command exactly `pnpm test:tophat`; summary JSON and streamed raw log counts must agree |
| `artifacts[]` | `id`, `path`, `sha256`, `kind`, `provenance`, `result`, `rationale`; exact unique relative paths and IDs; result `PASSED`, `FAILED`, or `SKIPPED_NOT_APPLICABLE` |
| `criteria[]` | `id`, `status`, `rationale`, `evidenceIds`; ordered IDs 1–30, status `PASSED`, `FAILED`, `BLOCKED`, or `PENDING`; all required evidence kinds must pass before a criterion passes |
| `review` | `verdict`, `artifactId`, `locator`, `findings`; verdict `APPROVED`, `CHANGES_REQUIRED`, or `BLOCKED`; unresolved findings block readiness |
| `limitations` | Explicit unique strings describing tested environments and limits |

The summary JSON artifact has exactly `command`, `exitStatus`, `passed`, `failed`, and `skipped`; the raw log retains the actual complete harness output. Node TAP (`#`) and spec (`ℹ`) result summaries are supported, with no ambiguous duplicate summaries. The independent review artifact contains exactly `candidate`, `indexSha256`, `verdict`, `locator`, and `findings` matching the selected candidate/review. A stale review cannot approve the next candidate.

`currentAttempt` must select the last supplied attempt at the expected TopHat commit. A latest failed/blocked run prevents readiness. Preserve prior failures and raw output; do not rewrite an attempt to fit. A required criterion cannot be waived as not applicable. Optional script-category skips remain visible in the underlying host validation reports and cannot satisfy a mandatory evidence requirement.

### Host-project integration record

`hostProject` is null while live work is pending. It cannot coexist with passed live criteria. A full record contains exactly `identity`, `baselineCommit`, `scope`, `authorityFingerprint`, `configFingerprint`, `packageValidatedAt`, `planningStartedAt`, `roadmapSha256`, `initializationArtifactId`, `tasks`, `phaseArtifactId`, and `completionArtifactId`.

- `identity` has the same checkout fields above and must match the supplied host project candidate. The baseline must be its ancestor. The active host selects any supported workspace profile through its validated configuration, with a valid approved package and current config/authority fingerprints.
- `scope` contains `packageId`, `activeScopes`, `completionDeclaration`, and `approvalLocator`. Package/scopes must equal approved public authority. Human scope approval and actual completeness are reviewed obligations, not inferred from a receipt.
- `initializationArtifactId` identifies a live artifact with exactly `packageValidatedAt`, `planningStartedAt`, `authorityFingerprint`, and `roadmapSha256`. These values must match the dossier, validation must precede planning, and roadmap bytes must match the final checkout. This is a consistency check on reported ordering, not an authenticated execution history.
- `tasks` contains artifact IDs. Each task artifact has exactly `task`, `testedCommit`, `stages`, and `qa`. Existing classification/authority and stage validators inspect historical source/config and derive the route. QA, when required, must pass the existing historical QA validator with preserved artifacts. The tested commit must be integrated into the final host candidate.
- `phaseArtifactId` and `completionArtifactId` contain the existing `validate-derived-docs.ts` request format. Their statuses must be `DOCUMENTATION_ACCEPTED` and `PROJECT_DOCUMENTATION_ACCEPTED`, respectively. Immediate sync cannot substitute for phase acceptance. Representative tasks must belong to both records, and final documentation must bind to the supplied final host candidate.

A representative task or completed Development Phase cannot establish project completion. Use a genuinely approved host project scope and its actual completion gate. Incomplete scope keeps release readiness pending; a fixture cannot replace the live obligation.

## Integrity and custody

Generate the final external dossier after the final tracked candidate commit. Bind its index digest, commits/trees and artifact hashes explicitly. A tracked summary names the earlier run it describes; it cannot claim to test its own containing commit. Candidate changes require fresh verification and a new dossier. Historical task evidence follows existing Slice 7 rules and cannot become a current HEAD QA approval.

JSON files are bounded to 4 MiB, inventories to 512 artifacts, individual artifacts to 32 MiB, and their aggregate to 128 MiB. Hashing uses fixed 64 KiB chunks and checks actual sizes. Reject traversal, Windows/absolute escapes, case-folded parent collisions, symlinks, nonregular files and digest changes. `.env*` and named private-key files are excluded. This path check does not detect secrets embedded in arbitrary text.

Before artifact collection, the orchestrator excludes environment/credential files and avoids dumping process environment or API tokens. Review logs for secrets and private client information. Keep original raw records privately; public review copies must be redacted before hashing and have distinct paths/digests. Do not replace a raw artifact beneath an existing QA/document receipt with redacted bytes. If the live validators require private originals, run them against authorized private custody and share a sanitized review dossier/summary separately; the latter does not inherit the original's byte identity.

The verifier reads local files and invokes existing read-only validators/Git readers. It executes no host test scripts, performs no fetch/install, and writes no host files or Git metadata. It does not authenticate actors, prove actual execution or complete attempt history, establish a process sandbox, or eliminate races. Report `EVIDENCE_COMPLETE` as consistency of supplied evidence only. Genuine independent review, complete custody and explicit human decisions remain necessary.

An aborted nonpassing attempt may retain a raw error log without a complete test summary. Record its actual nonzero/null exit and only the counts reported (zero for missing counters); it stays failed/blocked. This preserves failure history without manufacturing a passing summary. Any reported counters must match. Passing attempts always require a complete raw summary and zero failed/skipped results.

## Repository independence

TopHat publishes generic host-project contracts and synthetic fixtures only. Consumer-project identities, document packages, live execution logs and test-project selection belong in external acceptance custody. No client product is a runtime dependency or a named requirement in this repository. Framework implementation review and its separately approved development merge can precede live host testing; release validation remains pending until independently reviewed integration evidence exists.

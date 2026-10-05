# Slice 6 task routing and QA contract

This is private TopHat orchestration documentation. It describes checks when invoked; no physical agent permissions, authenticated reviewer identity, complete history proof, or OS sandbox is claimed. Node.js ≥24 and the installed host config/approved package are required. The reusable vault itself remains unconfigured.

## Task classification

`node .agents/scripts/classify-task.ts` reads one JSON object on stdin and prints ROUTING_VALID or DENIED. Use the exact `TaskClassification`, `Routing`, `AcceptanceCheck` and `StageRecord` types exported in that script. No arbitrary fields are accepted. A generated issue embeds the same JSON in its taskClassification fenced block plus the exact Slice 4 extracts; display fields are projections. A stable local taskId may precede the Linear locator.

Required task fields: schemaVersion (1), taskId, authority (the existing TaskAuthorityRequest), guidance (requestedSkills/taskTopics/frameworkInstructions), workKinds, userEffects, noUserFacingReason (string for no-user-facing-change, otherwise null), validationCategories, acceptanceChecks. Optional declaredRouting must exactly match all six derived fields: devTier, reviewTier, securityRequired, qaRequired, qaMethods, requiredStages.

Acceptance checks contain id, sourceCriterion, text and qaApplicable, plus applicabilityReason only when qaApplicable is false. Source criteria resolve through the approved authority payload. A task fingerprint hashes the canonical normalized task (excluding display projection) and current validated config. Reordered trait sets normalize; changed authority, checks, config or classification requires fresh evidence and a reviewed task amendment.

| Work | Route |
|---|---|
| Static markup/styling only | junior → standard |
| Client logic | mid → critical → security |
| Server/API/database/auth/payment/permission/filesystem/Electron privileged/IPC/cross-layer/internal work | senior → critical → security |

Mixed work takes the highest tier. Review topology does not override the mapping; a legacy Standard Review Only policy halts pending human amendment. Traits must be complete and semantically correct: the checker proves consistency, not an LLM's interpretation of prose.

| Effect | Methods |
|---|---|
| web-flow | e2e-web, exploratory |
| desktop-flow | e2e-desktop, exploratory |
| visual/responsive or static UI | visual, responsive |
| accessibility | accessibility |
| human-design | human-design |
| no-user-facing-change, with rationale | QA_NOT_APPLICABLE |

Union methods in the listed classifier order. Flow guidance topics must match effects. Browser/desktop/UI capabilities must match; backend browser QA and no-renderer visual inspection deny. Existing declared infrastructure is required; do not install tooling or write product tests during QA. Missing infrastructure is BLOCKED. Subjective design needs recorded exact-candidate human acceptance.

## Stage and remediation records

StageRecord contains stage, contiguous sequence, taskFingerprint, inspectedCommit, role, sessionId, verdict, findings (blocking finding strings). The permitted receipt stages are implementation, review-standard or review-critical, and security when critical. The QAReport serves as the QA-stage record; do not create a conflicting parallel QA receipt. Role for implementation is developer-junior/mid/senior, matching the classifier; review/security roles match their stage names.

The latest supplied record for every applicable stage must approve the same current commit/fingerprint in route order. A later failure cannot be skipped. Failed code review leads to a new developer commit and a fresh derived review/security route; QA-required remediation needs independent fresh QA. The implementing session cannot review or QA its own correction. The same independent reviewer may review a developer's remediation again. BLOCKED requires human direction. Environment-only prerequisite resolution does not require an empty product commit.

## Role capture and verification

`node .agents/scripts/inspect-role-session.ts` reads a closed stdin request. For capture, fields are schemaVersion, operation (capture), role (qa/pm), sessionId, expectedBranch, inputPaths, outputPaths, artifactRoot (null or explicitly chosen absolute external directory). For verify, include those fields plus before (the original RoleCapture) and observedOperations. RoleCapture/RoleVerification types are exported by the script.

QA requires attached expected branch, no active Git operation, clean tracked/index state, and explicitly classified untracked inputs. Declare exact pre-existing evidence input files; no blanket private-state exception. QA outputs cannot overlap tracked/protected inputs. Within `.agents`, only task/attempt artifact subtrees are writable. External artifacts use a dedicated non-symlink directory outside the host and its ancestors. PM has no writable outputs and may capture an existing dirty/failed workspace as advisory evidence.

The orchestrator captures before the role session and verifies outside it afterward, including after test failure/abort. PM itself never executes helpers or shell/Git/test/build/install/HUD/Linear writes. QA can run selected checks and create declared artifacts, but cannot fix product source/tests/config/authority/private live state or mutate Git/Linear. Controlled application test-data interactions belong to declared journeys; `external-state-mutation` identifies administrative/orchestration mutation.

ObservedOperation has category (read/command/file-write/git-mutation/external-state-mutation), detail and authorized boolean; file-write additionally requires path relative to the selected host/artifact root. A reported write outside declared evidence paths denies even if restored. Unknown fields/categories deny. An empty operation list cannot prove invisible operations never happened.

Surviving state changes or observed forbidden operations produce ROLE_BOUNDARY_VIOLATION. An unavailable or tampered capture/postcondition is POSTCONDITION_UNVERIFIED. No automatic rollback or recovery occurs. Hashes protect recorded consistency, not the authenticity of a manually supplied snapshot.

## Evidence types and custody

The exact QAReport, CriterionEvidence, Artifact and AttemptIndex types are exported in validate-qa-evidence.ts; the routing fixture constructs complete synthetic examples. Each nested group is closed. Results for applicable methods/criteria are PASSED/FAILED/BLOCKED. NOT_APPLICABLE is available only with an explicit criterion rationale. A command not reached after a failed runner is NOT_RUN; it is visible and never considered passed.

QAReport fields:

- schemaVersion; identity (taskId/attemptId/sequence/taskFingerprint/expectedBranch/testedCommit).
- environment (workspaceKind/framework/nodeVersion/pnpmVersion/os/applicationVersion/buildCommit/buildEvidence/target/configuration/roles/controlledData/resetProcedure/externalDependencies/states/statesReason/viewports/viewportsReason/available). No secrets; missing states/viewports need reasons; build provenance must refer to the tested commit.
- methodResults: method/result/procedure/artifactIds/humanAcceptance. Human acceptance is null or the exact signal/fingerprint/commit/human/evidenceLocator record.
- criteria: one row for every cited source criterion and stable derived check, with sourceCriterion/qaApplicable/applicabilityReason/methods/procedure/expected/observed/result/commandIds/artifactIds/regression. Every required method maps to at least one applicable criterion.
- commands: id/category/script/artifactId/result/validation. The validation is the captured full shared-runner JSON report; the referenced log/report file must parse to that same object. The validator does not execute evidence text.
- artifacts: id/path/kind/sha256. Paths are relative to the selected artifact root or declared host output roots. Inventory is complete; altered/missing/unsafe/unclassified files deny. A screenshot digest proves bytes, not behavior.
- findings: severity/message; preflight/postflight fingerprints; reviewer (role qa/sessionId/independentOf); startedAt/completedAt; verdict (APPROVED/CHANGES_REQUIRED/BLOCKED).

UTC timestamps use exact millisecond ISO format; start ≤ completion. Artifact IDs/paths, criterion IDs and command IDs are unique. Artifact kinds are log/screenshot/trace/report. Required methods, criteria, runner categories and current stage records cannot be omitted. Every command carries the complete runner report for the ordered commitGate plus unique task extras. Failed outcomes preserve logs/stderr and explicit NOT_RUN categories.

AttemptIndex contains schemaVersion, taskId, currentAttempt, entries. Each entry has contiguous sequence, attemptId, reportSha256 (canonical report SHA-256), and the complete closed report. Current points to the final entry, timestamps are ordered, and digests match. A newer recorded failure/block prohibits fallback to an older approval. History completeness and actual reviewer/human identity remain supervised boundaries.

**Custody:** The orchestrator persists captures/stage receipts/report/index outside the QA role session. The simplest setup keeps custody files in a separate private external directory, distinct from the designated artifact directory; this avoids modifying the tested host or an already sealed artifact inventory. A tracked/shared host can use this live private custody too, then deliberately archive later. Any archive/private-state commit creates a new candidate requiring fresh approval if publication is pending.

If evidence is kept inside the host, use individually declared private input files and task/attempt artifact roots. Keep a sealed QA artifact subtree unchanged, and do not create receipt/index files in protected state after capture. A new untracked custody file outside the declared artifact outputs invalidates the old capture; use external custody or establish a fresh candidate/session. Do not silently exempt all `.agents` or rewrite info/exclude. Helpers never persist receipts or create directories.

This layout distinction is necessary: the report cannot include its own bytes in its artifact hash inventory. The validator checks the supplied report/index and artifacts; the custodian separately preserves their identity and history. Do not describe a supplied receipt as authenticated execution proof.

## QA checks and publication

Run existing selected validation with `node .agents/scripts/run-validation.ts '[exact JSON gate request]' --qa`. It uses installed config and ordered mappings, suppresses automatic pnpm setup, bounds time to 600,000 ms and output to 1 MiB per stream. Save the full JSON output as the command log artifact. The inherited runner includes the first 4,000 characters of captured stdout/stderr per result; it does not claim a complete raw stream archive. Preserve additional needed logs as separately declared artifacts. Host scripts are not sandboxed; total memory or descendant termination is not guaranteed. Normal runner and pre-commit semantics are preserved.

Evidence validation request fields: schemaVersion, operation validate, task, report, before, after, attemptIndex, stageRecords. It returns separate evidenceValid and approvalAllowed. A valid failure report is EVIDENCE_VALID with approvalAllowed false; malformed input is DENIED. Method/criterion failure means CHANGES_REQUIRED; unavailable environment or broken role postcondition means BLOCKED. Genuine missing evidence also denies. Pending human-design acceptance is BLOCKED, never inferred.

Publication request fields: schemaVersion, operation publish, task, expectedBranch, expectedBase, stageRecords, validation, validationArtifact (`{path,sha256}`), qa, session (`{before,observedOperations}`). QA is the report/before/after/attemptIndex object when required; otherwise `{status:"QA_NOT_APPLICABLE",taskFingerprint,reason}`. The validationArtifact is a declared current output containing exactly the supplied runner JSON.

Require PUBLICATION_READY before any PR action. Current HEAD/branch/clean protected state must match the candidate; every later commit invalidates QA, including state/documentation-only commits. Same HEAD with dirty/staged inputs also denies. Finalize intended Context/Strategy/HUD commits before review/QA. publish-pr creates an exact-head PR for the human-declared base, verifies returned head/base using the exported verifyPublishedPR invariant, and does not automatically commit state or merge. Recheck immediately before the side effect; races halt without destructive repair. Shared Git mutation safety follows `.agents/docs/git-safety.md`.

HUD uses --routing-file for a validated current task record. Legacy --sec/--qa flags deny; no route means UNVERIFIED. Its indicators are reported status, not validation evidence or publication permission.

## Bounds and limits

Use 1 MiB JSON records, 256 history entries, inherited 16,384 tracked-file / 128 MiB tracked-input / 32 MiB file / 4,096 output-file / depth-32 inspection limits, and 10-second Git calls. Unsupported symlink/submodule/case-collision/path inputs and incomplete/oversized evidence halt. Ignored paths outside declared inspection are not monitored. File limits are operational bounds, not arbitrary code-quality thresholds.

Clean-code review evaluates meaningful names, responsibility/contract boundaries, limited unnecessary coupling/duplication, behavioral tests, smallest coherent change and change locality. A local refactor needs a concrete task/correctness/maintainability reason; no unrelated cleanup/speculative abstraction or universal line/file/function/complexity metric is imposed.

Fixtures test deterministic behavior and reviewed instruction examples. Synthetic reports do not claim actual web/Electron QA. Native fixtures run on Linux/Node 24; Windows-shaped paths do not prove Windows execution. Actual UI acceptance belongs to the later integrated acceptance slice.

## Command packaging integration

Consult [command migration](command-migration.md) and the pinned command catalog. Fresh installation requires the full catalog resource closure; upgrade/detachment uses exact confirmed ownership/digests, preserves host routing overrides/custom skills and historical receipts, and stops visibly on partial application. No broad directory removal or automatic rollback. Handoff writes precede final candidate sealing. Map actual applicable criterion IDs to behavior and meaningful evidence, and map every changed behavior back to approved scope; independent review judges relevance.

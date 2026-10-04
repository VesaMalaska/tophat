# Derived documentation lifecycle contract — Slice 7

Node.js ≥24 and a configured supported host are required. The vault remains unconfigured. Use the exported closed types in `inspect-derived-doc-session.ts` and `validate-derived-docs.ts`; they are the executable interface, with synthetic fixtures in `tests/fixtures/derived-docs.ts`. Both helpers read stdin JSON and print JSON, write no files, persist no receipts and execute no report commands. Duplicate JSON keys, unknown fields and incomplete evidence deny.

## Triggers and responsibilities

Normal Development Phase closure: accepted/integrated task work → declared phase validation → impact assessment → exact human-authorized writer plan/capture/postcondition if changed → candidate commit by the orchestrator → applicable final checks/claim verification → independent document review with externally supervised pre/post seal → current document readiness → explicit human phase acceptance. Ordinary task/Sprint Chunk advancement does not run this loop.

Tasks may include optional `immediateDocumentation: {required, reason, rationale}`. For required true, reason is safe-operation/continued-development/migration/configuration/compatibility and rationale is nonempty. For false, reason/rationale are null. Absence preserves existing task fingerprints and means no immediate trigger. Any present declaration is fingerprinted. Immediate mode accepts only that task's document obligation; it cannot accept its Development Phase or project.

Project completion inventories accepted phase history and current task membership, then verifies the complete current handoff with the project gate and the same bounded correction/review process. No universal user-guide/document set is imposed. Core final coverage dimensions are exported as `completionDimensions`; all have specific results/rationales. Missing necessary instructions block even if no document filename was prescribed.

Architect proposes, writer edits only exact approved targets, existing independent reviewer reads/finds, and the separately authorized orchestrator executes checks/Git and persists receipts. PM has no execution role. Human consent/actual reviewer identity, full membership/history completeness and semantic accuracy remain supervised facts.

## Target ownership and writer session

The config's `documentation.derivedTargets` is the only allowlist. Trailing `/` means descendants; another target is one exact file. Parent paths cannot override protected descendants. Absolute/drive/UNC/traversal/ambiguous separator/case-collision/symlink/submodule/nonregular/overlapping paths deny. Case comparison includes absolute targets and existing/planned path components conservatively across platforms.

Protect product source/tests/runtime/build config, package manifests/locks, `.git`, `.agents`, Strategy/Roadmap/Context/HUD/DECISIONS, authoritative documents including inactive ones, and package entry guide/manifest/schema. Existing package-derived documents may change bytes without changing authority. New package inventory or source authority requires separate definition amendment/reapproval, never writer edits. Outside-package configured README/guides need no manifest entry.

Supported output extensions: md/txt/rst/adoc/png/jpg/jpeg/webp/svg. Executable/config formats, executable modes and symlinks deny. SVG may carry active content: independent review explicitly audits scripts, event handlers, unsafe external references and XSS risks. Helpers do not implement an XML parser or prove content safety from extensions.

`inspect-derived-doc-session.ts` operations:

- capture: `{schemaVersion:1,operation:"capture",session:DocSessionDeclaration}`.
- post: `{schemaVersion:1,operation:"post",before:DocCapture,observedOperations:[...]}`.

Declaration contains schemaVersion/sessionId/expectedBranch/inputPaths/plan/authorization. Every DocWrite contains path/operation(create/replace/delete)/oldSha256/newSha256/reason/references. A rename is individually authorized delete plus create. Authorization contains signal APPROVED, canonical planFingerprint, human and locator. Digests are SHA-256 of exact bytes, including binary assets; absent endpoints are null. Show the exact plan before asking for its human approval.

Prepare the complete proposed new content as read-only proposal output first. The orchestrator preserves an external draft, calculates its exact bytes/digest and shows the concrete content plus plan for approval. Give the writer those exact approved bytes; the writer does not have to infer text from a hash. Any editorial revision after that approval requires a revised plan/new approval before host writes. Neither drafting output nor receipt persistence grants the writer external file/command permissions.

Capture/post run outside the writer role. Writer runs no commands/helpers/checks/Git/HUD/Linear; only read and approved file-write operations are permitted. Post checks full tracked/untracked changes and target inventory, ignored private state, index/HEAD/branch/history/hook/ignore state, exact operations and bytes. Missing/unavailable/oversized capture denies. The result can reject surviving or reported forbidden actions, but cannot intercept them or detect every unreported restored transient action. A failed result leaves actual files intact: no auto reset/rollback/delete/stash.

## Candidate, checks and evidence custody

`DocCandidate` contains identity/membership/tasks/phases/assessment/writer/baselineValidation/finalValidation/claims/completion/seal. Identity specifies mode phase/immediate/project-completion, stable id/phaseId, attempt/sequence, expectedBranch/expectedBase, baselineCommit/candidateCommit, authority/config fingerprints and exact UTC timestamps. PhaseId is null only for project completion. Membership is the exact complete task ID set; missing accepted prerequisites block.

TaskCompletion carries original classification, testedCommit/integratedCommit/stages/validation/qa/acceptance. Local commit ancestry and original Git config/Roadmap/package inputs are required. Historical classification does not weaken the live active-chunk validator or task publication gate. Historical QA preserves its original artifacts and checks recorded consistency against its original tested commit, never declares approval of the current head. Missing commit objects/evidence require human-directed reconciliation. A changed config/authority is not silently tolerated.

Assessment has explicit CHANGES_PROPOSED or NO_DOCUMENTATION_CHANGE_REQUIRED, rationale, active references, conflicts and exact plan. No-change has no writer post, still requires review, claims/coverage assessment and checks. Empty target lists can support justified no-change; required changes with no target block.

Use `documentGateRequest(root, gate, extras)` to append unique categories absent from the gate. The shared runner itself rejects duplicate selections: do not send a category twice. Baseline selects phase/completion gate, or immediate commit gate plus task extras. Final checks repeat that gate at the final candidate and append documentation if mapped. Run the existing CLI with its bounded execution flag `--qa` (this flag selects execution limits/setup suppression; it is not role identity), or call the shared internal options. No second executor or dependency installation is introduced.

CheckRecord has request/report/artifact. Passing nonempty checks preserve a byte-digested external JSON log exactly matching the supplied shared-runner report. Empty optional gates retain SKIPPED_NOT_APPLICABLE/null testedCommit/null evidenceKind, with artifact null; the enclosing candidate supplies identity. No documentation mapping is visibly DOCUMENTATION_CHECK_NOT_DECLARED in the summary, not an invented passing check. Declared missing/failing checks block, preserve stderr and require human-bounded remediation. Coverage thresholds stay host-owned.

Claim records identify source criterion, editorial/executable/screenshot/user-facing kind, procedure, expected/observed, methods, result/rationale and evidence. Editorial review can pass without separate artifact or justify nonapplicability. Material claims need artifact-backed existing verification or fresh compatible method evidence. No commands from document prose are automatically executed; the orchestrator controls procedures. Missing environment/tools is BLOCKED, no writer product tests/fixes. Ordinary editorial changes do not automatically repeat full product QA.

Fresh method-based claims reuse the closed QAReport/environment/method/artifact and read-only session contract. Subject fingerprint is canonical SHA-256 of `{commit:candidateCommit,id:claim.id,source:claim.sourceCriterion,methods:claim.methods,expected:claim.expected}`. Report taskId equals claim ID; criteria contain the source criterion; methods exactly match; current candidate/build/branch/session/artifacts must match. Writer cannot QA own claim. Human-design needs exact-candidate recorded human acceptance. Claim commands are empty; declared commands/logs belong to CheckRecords. Capability-incompatible methods deny. Synthetic reports prove contract behavior, not actual browser execution.

The independent document review session is externally captured using the existing read-only QA capture/post primitives; this is a snapshot permission profile, not a claim that document review performed product QA. Candidate `seal` holds its before/after. Current readiness rechecks protected state including ignored private files. Reviewer sessionId must equal the seal's captured session and differ from the writer/developer sessions. Never create receipt files inside that protected host after sealing it.

Live captures/stages/candidate/review/acceptance/index and check logs use separate private external custody/artifact directories. Orchestrator preserves history; helpers never write them. Keep receipts out of their own artifact inventories. Canonical candidate fingerprint excludes downstream review/acceptance/index. Review binds candidate; human acceptance binds candidate plus review digest; attempt record binds the complete receipt. No recursive hashes or implicit human authentication.

## Review, readiness, acceptance and publication

DocReview contains role independent-document-review, sessionId, candidateFingerprint/commit, reviewedAt, verdict/findings and every exported reviewChecklist row. Core rows cannot be skipped. SVG audit can be inapplicable only with no changed SVG. Check actual authority/realization/coverage, setup/config, operation/use, links/examples/screenshots, superseded guidance and private leakage. The host's legitimate TopHat product terminology is allowed; no universal keyword ban claims prose purity.

DocAcceptance contains exact APPROVED/human/locator/candidateFingerprint/reviewSha256/acceptedAt. Timestamp order matters. The same independent reviewer can review later writer remediation, but cannot edit and approve their own fix. Product fixes are separately routed developer work. Authority conflicts use the approved definition amendment workflow.

`validate-derived-docs.ts` input is `{schemaVersion:1,operation:"readiness"|"accept",receipt:{candidate,review,acceptance},attemptIndex:{id,currentAttempt,entries}}`. Entry fields are sequence/attemptId/record/sha256. Record fields are id/attemptId/candidateCommit/completedAt/verdict/receipt; a failed attempt may have receipt null. Sequence is contiguous and latest supplied attempt wins. The current APPROVED row contains exactly the supplied receipt. Missing/failing/forged/stale input returns DENIED with issues; it never supplies a fallback approval.

Readiness returns DOCUMENTATION_READY only on a clean current candidate and complete passing evidence. Accept additionally checks human acceptance and returns DOCUMENTATION_ACCEPTED (phase), IMMEDIATE_DOCUMENTATION_ACCEPTED (task only), or PROJECT_DOCUMENTATION_ACCEPTED. No-change is an assessment outcome, not readiness/acceptance by itself.

Documentation-only publication is explicitly selected from accepted integrated task work, with an exact baseline-to-candidate diff limited to the authorized document operations. It has its own independent review/checks/claim evidence. Recheck just before publishing and verify returned head/base using `verifyDocumentPR`. Combined product/documentation PRs still use the Slice 6 task gate with fresh exact-HEAD evidence after every documentation commit. Historical QA is never refreshed by this document path. PR publication does not authorize merge.

Later commits, dirty/staged state, authority/config/byte/receipt changes and newer failures invalidate readiness. Intended tracked state changes precede sealing, or belong to deliberately new candidates. Accepted records remain historical at their explicit commit, not current readiness for a later phase. No automatic post-review Context/HUD commit chain. Shared generalized Git preflight remains Slice 8.

HUD may read one explicitly selected external request via TOPHAT_DOC_EVIDENCE; it displays pending when absent, current validated readiness/acceptance when valid, or denied/unavailable when stale. Reported historical candidate identity is labelled as such, never mistaken for current readiness. Rendering does not persist receipts or approve anything.

Operational limits inherit 1 MiB JSON records, 256 attempt entries, 16,384 tracked files/128 MiB input/32 MiB file/4,096 output files/depth 32 and bounded Git/check execution. Incomplete/unsupported inspection denies. Ignored paths outside declared inventories are not fully monitored; no process/memory/OS sandbox or Antigravity physical role hook is claimed. Linux plus Windows-shaped fixtures is not native Windows certification. Live integrated acceptance remains Slice 9.

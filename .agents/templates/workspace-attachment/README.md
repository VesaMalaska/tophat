# Closed attachment record contract (v1)

These are drafting references, not live evidence or approval. Helpers accept JSON on stdin (or one JSON argument), reject duplicate members/unknown request fields, write structured JSON only and exit nonzero on denial. All fingerprints are lowercase SHA-256 over recursively key-sorted JSON; arrays retain order. Never fill receipts from inferred consent.

## Discovery input

First invoke inspection with `{}` for facts. A full request requires exactly:

- proposalId: stable identifier; sourceCommit: pinned 40-character TopHat commit;
- candidateConfig: complete existing TopHat v1 declaration, no independently supplied capabilities;
- inputPaths: exact relevant relative files, including script/config inputs; outputPaths: declared disposable roots (cannot overlap inputs/private/public package);
- timeoutMs: 1..600000; maxBufferBytes: 1024..1048576;
- prerequisites, sideEffects, blockers, humanDecisions: arrays of nonempty descriptions; resolve blockers/decisions before assessment;
- installation: `{mode: "tracked/shared"|"local/private", exclusions: [exact private file paths], hookDisposition: "install"|"verify"|"manual-integration", hookContent: <exact versioned native hook bytes>}`. Manual/shared integrations are reported but default readiness denies them until a separately approved host solution exists;
- ownership: `[{path, classification: "TOPHAT_OWNED_PRIVATE"|"HOST_OWNED"|"SHARED"|"UNKNOWN", evidence, tracked: boolean, initialSha256: string|null}]`;
- writePlan: `[{path, operation: "create"|"replace", priorSha256: string|null, content: exact UTF-8 text, sha256: SHA-256 of content}]`. Every write needs exact private ownership. Required config/root state and native-hook source must be present. Include every checker/schema/workflow/skill infrastructure file required by the host, reviewed from the pinned source; no helper copies them;
- developmentBoundary: `{scopeIds: [active approved IDs], developmentPhaseId, sprintChunkId}`.

Context/Strategy/HUD are private derived proposals. Roadmap must have one `[ACTIVE_SPRINT_CHUNK]` heading and one fenced JSON `{authorityContext:{packageId,packageVersion,authorityFingerprint,scopeIds,developmentPhaseId,sprintChunkId}}` beneath it. This must match approved documentation and the declared boundary.

The generated closed proposal additionally contains facts/snapshot, hostSnapshotFingerprint, documentation verdict, exact baseline category/script bodies, fixed evidencePaths, createdAt and proposalFingerprint. Fingerprinting excludes only createdAt and the generated proposalFingerprint. The five evidence input files are fixed copies of proposal, authorization, assessment, approval and ownership; completion.json is the sixth derived verification report. Evidence is copied only after finalization approval. Self-digest loops are excluded, not arbitrary write permissions.

## Authorization, assessment and approval

Authorization has exactly `{schemaVersion:1, proposalId, proposalFingerprint, hostSnapshotFingerprint, scripts:[{category,script}], human, authorizedAt, evidenceLocator}`. All scripts match the generated ordered baseline; authorization follows proposal creation. Assessment request: `{proposal,authorization}`.

Assessment includes schemaVersion/proposal identity, authorizationSha256, testedCommit, runtime, preSnapshot/postSnapshot, runner, results, unselected categories, artifacts before/after, issues, status, completedAt and assessmentFingerprint. Every selected category must pass on unchanged protected state. Failure is never waived.

Final approval has exactly `{schemaVersion:1,proposalId,proposalFingerprint,assessmentFingerprint,hostSnapshotFingerprint,authorityFingerprint,candidateFingerprint,installationMode,signal:"APPROVED",human,approvedAt,evidenceLocator}` and follows assessment. Readiness/application-verification requests have `{mode:"ready"|"verify",proposal,authorization,assessment,approval}`.

Verification writes no file. The authorized orchestrator saves its exact ATTACHED or ATTACHMENT_INVALIDATED report at completion.json. Generated completion is historical evidence, not permission for stale requirements or an OS-enforced agent boundary.

## Detachment

Plan request: `{mode:"plan",request:{ownership,expectedBranch,removePaths,confirmedCurrentHashes:{<path>:<current digest>},preservePaths,hook:{remove:boolean,confirmedSha256:string|null},exclusionBlock:string|null}}`.

Ownership is the saved closed record `{schemaVersion:1,proposalId,sourceCommit,entries,evidencePaths}`. Current hashes are freshly human-confirmed; initial hashes do not authorize removal of changed state. Include intentionally retained shared material in the preservation review. The helper outputs DETACHMENT_AWAITING_APPROVAL and an exact plan with planFingerprint.

Separate approval: `{planFingerprint,signal:"APPROVED",human,approvedAt,evidenceLocator}` after plan creation. Human/orchestrator performs only exact manual removals; verification request is `{mode:"verify",request:{plan,approval}}`. The helper never deletes a file or applies exclusions.

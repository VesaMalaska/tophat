# Command packaging, manual upgrade and compatibility

The catalog `.agents/docs/command-catalog.json` owns 30 active command identities and one retired identity. The 17 topical guidance skills remain distinct. Host `routingMatrix` owns actual model advice; missing active mappings block command use. Custom host routing keys/overrides are preserved. `/generate-readme` has no discoverable entry: explicitly select `/project-define`, `/sync-derived-docs` or `/verify-project-docs` at the appropriate documentation boundary.

## Read-only checks

```
node <pinned-source>/.agents/scripts/validate-command-catalog.ts --root <pinned-source>
node <pinned-source>/.agents/scripts/validate-command-catalog.ts --root <pinned-source> --host-root <selected-host>
```

Source mode checks the unconfigured vault. Host mode additionally loads validated host configuration and verifies all active model mappings and exact installed resources against the pinned source. Flags are explicit; no cwd inference, selected-command fallback, daemon, evaluated metadata or command dispatcher exists. JSON exits: 0 valid, 1 invalid/incomplete, 2 invalid invocation/internal failure. Catalog/dependency validity is not workflow obedience, authenticated consent, live IDE compatibility or host acceptance.

Before dependent actions, the orchestrator checks the catalog and the role loads its current entry, required resources and permitted host state. Shared `.agents/docs` contracts do not expand ordinary roles into broad product docs discovery. Roles remain separate; a mention does not load a role. Read-only roles return text; an authorized orchestrator owns external checks, custody and exact approved state application. Tracked updates precede final candidate sealing; later commits invalidate applicable evidence.

## Owner-aware manual upgrade

1. Select the exact host/root and old confirmed installed ownership inventory, preserve original receipt/history externally, and pin the reviewed new TopHat commit/tree. Inspect current bytes, customized resources, routing overrides, native hook and exclusion ownership without mutation.
2. Present a concrete table for every old workflow removal and new/changed resource: path, operation, prior/new SHA-256, mode, owner and preservation reason. Derive the new installation closure with `catalogResources(pinnedSource)` plus the existing requiredInfrastructure and approved host configuration/private-state plans. All 31 owned legacy workflow files must leave active discovery, including the retired entry; Git history is the historical source. Do not create a .bak procedural copy.
3. Preserve custom model values and unrelated keys. Add a missing `/triage-bug` mapping through the reviewed host config plan; report the obsolete `/generate-readme` key without treating removal as automatic permission. Shared, modified or unknown ownership blocks overwriting/removal until the human approves explicit reconciliation. Fresh attachment receipts cannot impersonate upgrade consent.
4. Obtain the human's APPROVED for those exact files/metadata. The separately authorized orchestrator rechecks sources/digests/ownership immediately before each sequential application. Remove only confirmed owned unchanged workflow files, never a whole directory. Existing native hooks remain when unchanged. Hook/exclude changes retain their explicit git-integration preflight; file/history changes retain the shared Git contract. If an API cannot express a mutation safely, stop for a narrow reviewed extension.
5. Reinspect exact bytes, modes, installed catalog/dependency completeness, host configuration, unrelated-file preservation and actual discovery refresh. Record a new confirmed installation ownership inventory separately from historical receipts. Manual detachment uses that confirmed inventory and preserves custom skills/host files.
6. An interruption or failed postcheck leaves installation INVALID/INCOMPLETE. Preserve actual partial state and failed evidence. Inspect remaining paths and present a fresh bounded resolution; no broad deletion, automatic retry, atomic transaction claim or rollback engine.

Fresh attachment requires the same pinned dependency closure; copying SKILL.md alone is incomplete. An upgrade instruction is not an installer or a grant to modify a real client host.

## Disposable Antigravity probe — COMPATIBILITY_PENDING

No live Antigravity installation is available in the implementation environment. Skill-directory metadata, catalog, subprocess fixtures and native Git tests establish only their observed mechanisms. Argument transport, activation, role loading and IDE hook interception remain pending. This candidate is suitable for draft review, not a supported cutover or release claim. Do not assume a legacy template substitution works in skills.

Use a disposable local repository and generic fake `PROBE-123`, with no real Linear connection/client task, global skill installation or external publication. Record IDE/extension/CLI version, OS/shell, Node/pnpm/Git versions, candidate commit/tree, installed paths and raw traces externally. Sentinel proposals/findings are harmless outputs; production gates remain intact. Record documented vendor behavior separately from observations and unknowns.

| Probe | Interaction | Required trace |
| --- | --- | --- |
| Discovery | Refresh the disposable project | All 30 command and 17 guidance entries register; retired entry absent; observe any name/collision behavior |
| Exact arguments | Invoke `/implement-mid PROBE-123`, then missing ID and two IDs | Exact payload equals PROBE-123, without truncation/escaping/literal template; negative cases stop before task actions |
| Reads | Remove one mandatory resource in a disposable copy | Catalog/config/entry/applicable role and contracts read before dependent checks/actions; missing resource stops |
| Advisory | Request strategy proposal and refactor findings with fake state | No role shell/write/HUD/Git/Linear mutation; external capture/inspection remains separate |
| Approval | Supply unapproved proposal, then alter approved candidate | No application before exact approval; changed proposal/source/candidate stops |
| Mention | Discuss publication without invoking it | No push, PR, role/model swap or stage advancement |
| Independence | Open human-selected independent review session | Applicable rule actually loaded, distinct session, no developer self-approval |
| Recovery | Fail a declared check, start fresh session | Failure preserved; current candidate/latest evidence inspected; correct remediation advice |
| Paths/collision | Test alternate cwd and harmless workflow/skill/custom collision | Explicit source/host select the right installation; observed collisions resolved before cutover |
| Hooks | Hash hooks.json before/after; observe supported hook calls | Registry bytes unchanged; actual tool name/args/decisions captured; unsuccessful interception stays unverified |
| Commit gate | Explicitly install native hook only in disposable fixture | Failing declared script rejects commit; passing case permits it; actual HEAD and outcomes verified |

Capture representative inputs including quoted text, Unicode, whitespace and extra tokens where the entry supports inert diagnostic text. Compare exact raw bytes, not a normalized rendering. Missing/changed inputs do not authorize guessed actions. A failure stops the dependent cutover decision; preserve evidence and propose the smallest fix or limitation. Do not silently change hooks to an unobserved vendor protocol.

## Evidence and recovery

Every applicable actual criterion ID maps to behavior and meaningful tests or justified visual/manual/semantic evidence; every changed behavior maps back to approved scope. A valid hash/extract with a vacuous test remains a finding. Reviewers inspect relevance independently without implementing fixes. Developer defects route to assigned-tier `/remediate-task`; missing approved context to `/remediate-blocker`; new scope to human documentation reconciliation.

Locks use the Git common directory, including linked worktrees, with exclusive creation and exact payload-owner release. An aborted call leaves its lock for human owner inspection; no PID-only stale-lock removal. This is not universal serialization or IDE interception. Existing exact-HEAD, attachment, detachment, documentation, QA and release approval contracts remain intact. Implementation review, observed compatibility, real host acceptance, merge and release are distinct decisions.

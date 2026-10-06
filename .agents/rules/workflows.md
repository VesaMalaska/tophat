---
trigger: always_on
---

# TopHat Command Procedures

## 🛑 GLOBAL ORCHESTRATION MANDATE

Whenever you suggest a subsequent slash command or assign a downstream task to another agent, you MUST explicitly state the Recommended LLM Model required to execute that command, reading the selected active command's model key from host `.agents/tophat.config.json` routingMatrix. Missing mapping blocks advice/execution; never guess a fallback. Model values do not grant role permissions.
_Format Output:_ `[Next Action: /command-name]`

## Active command overview

The static command catalog owns identity and contracts; this overview introduces all 30 active commands. Host `routingMatrix` owns model advice. Select models manually; invoking a command does not bypass its prerequisites or later human approvals.

### Project definition

- `/project-define`: Prepare a bounded draft product documentation package from incomplete human input.
- `/project-definition-review`: Independent read-only semantic review of the exact draft documentation candidate.
- `/project-definition-finalize`: Finalize only a reviewed documentation candidate explicitly approved by the human.

### Workspace setup

- `/workspace-init`: Validate an existing supported host and approved package before proposing private roadmap and task state.
- `/workspace-attach`: Read-only discovery and explicit proposed contract for an existing supported host.
- `/workspace-attach-assess`: Run only the explicitly authorized proposed host baseline and preserve failures honestly.
- `/workspace-attach-finalize`: Explicit human approval and exact orchestrator application of an assessed attachment plan.

### Planning and state

- `/sprint-briefing`: Advisory read-only sprint briefing; no PM execution or state mutation.
- `/generate-sprint-tasks`: Lead Architect task compilation targeting the Active Sprint Chunk, with strict context isolation and Just-In-Time (JIT) schema injection.
- `/generate-smoke-test`: Generates the environment-specific CI/CD smoke test ticket in Linear.
- `/roadmap-sync`: Propose private chunk advancement from completed work and current approved authority.
- `/context-sync`: Enforces operational handoff state updates for agent memory and generates a visual HUD for the Human Orchestrator.
- `/strategy-sync`: Read-only PM proposals for Strategy and Context, applied by a separately authorized orchestrator.
- `/architecture-pivot`: Propose private planning reconciliation only after revised product authority is approved and valid.

### Implementation and recovery

- `/implement-junior`: UI/Tailwind implementation pipeline with automated Git and Linear handoff.
- `/implement-mid`: Frontend component logic and client-side reactive state implementation pipeline.
- `/implement-senior`: Secure data and server-authoritative logic implementation pipeline.
- `/remediate-task`: Separate assigned-tier developer remediation followed by a fresh derived review route.
- `/remediate-blocker`: Surgical JIT context healing for tasks halted by execution agents due to missing schemas or documentation gaps.
- `/triage-bug`: Conversational, multi-turn bug diagnostic pipeline. The Lead Architect conducts an analytical root-cause interview with the Human Orchestrator before compiling a Linear bug ticket.
- `/resolve-conflict`: Reconcile only an already identified, human-authorized merge conflict for an exact task candidate.

### Review and publication

- `/review-standard`: Independent read-only review-standard inspection of the exact classified candidate.
- `/review-critical`: Independent read-only review-critical inspection of the exact classified candidate.
- `/security-review`: Independent read-only security inspection of the exact classified candidate.
- `/qa-validate`: Independent proportionate QA with reproducible exact-commit evidence and role postconditions.
- `/refactor-audit`: Read-only architectural debt findings; no task creation or execution authority.
- `/publish-pr`: Publish the exact evidenced feature head for human review after a read-only readiness check.

### Derived documentation

- `/sync-derived-docs`: Evaluate and synchronize one Development Phase's derived documents, or one explicitly classified immediate task exception.
- `/review-derived-docs`: Independent read-only document review bound to the finalized documentation candidate.
- `/verify-project-docs`: Verify current product documentation and handoff after all Development Phases have accepted documentation evidence.

## 🛑 Manual Implementation Sequences

Do NOT attempt to run implementation as an automated workflow. The Human Orchestrator must manually swap the LLM model at each workflow transition to enforce Heterogeneous Model Validation.

### Standard Implementation Sequence:

1. **[Human - Model: from routingMatrix]**: `/implement-junior [ID]` Use MCP to fetch Linear Task [ID]. Prepare and verify the exact candidate; push is separately authorized and checked. (Auto-moves to `In Review: Architecture`)
2. **[Human - Model: from routingMatrix]**: `/review-standard [ID]` Review the active branch against the spec. (Next: classified QA when required, otherwise evidence-checked readiness)
3. Finalize intended tracked private-state updates before candidate review/QA; independent QA, when required, precedes evidence-checked publication.

### Critical Implementation Sequence:

1. **[Human - Model: from routingMatrix]**: `/implement-mid [ID]` | `/implement-senior [ID]` Use MCP to fetch Linear Task [ID]. Prepare and verify the exact candidate; push is separately authorized and checked. (Auto-moves to `In Review: Architecture`)
2. **[Human - Model: from routingMatrix]**: `/review-critical [ID]` Adversarially review the active branch. (Auto-moves to `In Review: Security`)
3. **[Human - Model: from routingMatrix]**: `/security-review [ID]` Execute threat model. (Auto-moves to `In Review: QA` or `Ready for PR`)
4. **[Human - Model: from routingMatrix]**: `/qa-validate [ID]` only when the classifier requires methods. Validate the exact candidate using those compatible methods; no universal Playwright route.
5. `/publish-pr [ID]` checks the current required stage/validation/QA records; no post-QA private-state commit chain.

## Routing and role evidence

Use `.agents/docs/task-routing-and-qa.md` and `classify-task.ts`: junior → standard; mid/senior → critical + security. QA methods derive from observable effects. No topology/boolean bypass exists. Review/QA return read-only findings; the separate orchestrator persists records and applies external state. PM executes no command or mutation. Readiness checks and postconditions are deterministic when invoked; semantic completeness, actual independence and agent adherence remain instructed/supervised. Every later commit invalidates exact-head QA.

## Derived document commands

- `/sync-derived-docs`: Phase boundary or fingerprinted immediate necessity; exact approved writer plan and externally verified session.
- `/review-derived-docs`: Existing independent read-only reviewer and complete document checklist.
- `/verify-project-docs`: Current project-completion/handoff verification after accepted phase history.

Ordinary chunks do not trigger sync. Writer and reviewer execute no commands or Git/Linear/private-state writes. Separate orchestrator owns checks/custody/publication; acceptance and merge require explicit human approval. Documentation-only PRs use their explicit readiness gate; combined task PRs keep fresh Slice 6 exact-HEAD evidence.

All Git mutation paths use the closed git-preflight.ts contract in `.agents/docs/git-safety.md`. Publication retains current task/document gates; merge needs separate explicit human approval.

## Consumer-project independence

TopHat code, schemas, CLI flags, fixtures, rules and public documentation use generic host-project contracts. Do not introduce consumer-product names, repository identities, client document packages or live client logs into this vault. Keep selection and evidence from actual acceptance projects in external custody. Host public product documentation must stand on its own without explaining private framework orchestration. Framework implementation review/merge and subsequent live host acceptance are separate activities; release validation requires the latter.

## Static command catalog

Read `.agents/docs/command-catalog.json` before selecting an entry and load its declared role/resources. The catalog owns identity, retirement, input contract and Git classification; `.agents/tophat.config.json` routingMatrix owns model values. No table here overrides the catalog or host. Semantic discovery supplies guidance only; command actions require explicit invocation plus the existing later approvals. Mandatory reads precede dependent actions, and read-only roles never run the external catalog/session checker themselves. Setup discovery uses pinned external tooling before host installation.

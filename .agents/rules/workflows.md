---
trigger: always_on
---

# TopHat Workflow Engine Specifications

## 🛑 GLOBAL ORCHESTRATION MANDATE

Whenever you suggest a subsequent slash command or assign a downstream task to another agent, you MUST explicitly state the Recommended LLM Model required to execute that command, reading the selected active command's model key from host `.agents/tophat.config.json` routingMatrix. Missing mapping blocks advice/execution; never guess a fallback. Model values do not grant role permissions.
_Format Output:_ `[Next Action: /command-name]`

## TopHat Workflow Commands for Orchestrating the Engine Flow

### Foundational Workflow Stage Commands

- `/project-define`: Optional bounded draft preparation from incomplete input.
- `/project-definition-review`: Separate read-only review; no automatic approval.
- `/project-definition-finalize`: Exact-candidate human approval and manifest-only finalization.

- `/workspace-init`: Bootstraps environment, verifies Tech Stack constraints, generates initial `Roadmap.md`.
- `/architecture-pivot`: Halts swarm, recalculates master timeline, triages obsolete Linear tasks.
- `/generate-readme`: Retired autonomous rewrite; redirect requires an explicit derived-document boundary.

### Standard Automation Workflows

- `/sprint-briefing`: Invokes `@agent-pm` to output the sprint briefing.
- `/generate-sprint-tasks`: Invokes `@agent-architect` to JIT-compile the active sprint chunk.
- `/roadmap-sync`: Synchronizes master timeline based on completed chunks.
- `/context-sync` & `/strategy-sync`: Summarizes decisions and compresses state memory.

### Implementation & Remediation Commands

- `/implement-senior [ID]`: Invokes `@agent-senior-dev` to execute backend, database, or security tasks.
- `/implement-mid [ID]`: Invokes `@agent-mid-dev` to execute compatible frontend logic and client state transformations.
- `/implement-junior [ID]`: Invokes `@agent-junior-dev` to execute static layouts and project-declared styling passes.
- `/remediate-blocker [ID]`: Architect proposes authority-bound extraction of missing schema context for a blocked task.
- `/remediate-task [ID]`: Surgical Dev Tier fixes based on rejection comments.
- `/triage-bug [Error Description / Log]`: Invokes `@agent-architect` for a multi-turn analytical diagnostic interview to isolate root causes before generating a Linear bug ticket.

### Validation & Pipeline Commands

- `/review-standard [ID]`: Validates stateless UI and frontend code against project specifications.
- `/review-critical [ID]`: Adversarially audits load-bearing backend code for race conditions.
- `/security-review [ID]`: Enforces OWASP Top 10 mitigation and approved access-control constraints.
- `/qa-validate [ID]`: Executes the derived compatible QA profile and records exact-commit evidence.
- `/publish-pr [ID]`: Checks exact-candidate evidence and creates the PR; merge requires separate explicit human approval.

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

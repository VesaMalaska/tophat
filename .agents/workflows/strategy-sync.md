---
description: Read-only PM proposals for Strategy and Context, applied by a separately authorized orchestrator.
---

1. **Prepare the advisory session:** The execution orchestrator reads `.agents/docs/task-routing-and-qa.md` and the role-session contract, captures the existing PM session baseline, and loads `.agents/rules/agent-pm.md`. The PM executes no shell command, file write, Git, HUD or Linear mutation.
2. **Read and propose:** PM reads current Strategy, Context, permitted Roadmap, latest Architect outputs and authorized Linear state. Return proposed Strategy/Context text, exact affected sections, rationale, source references and unresolved conflicts. Preserve durable authority references, material blockers and unresolved decisions; compression never silently deletes them or changes product scope.
3. **Check the session:** Outside PM, the orchestrator invokes `inspect-role-session.ts` through the existing procedure. Missing capture/check is UNVERIFIED; prohibited PM actions reject the result. A proposal is not permission to execute it.
4. **Human gate:** Present the concrete diff and source inputs. Ask the Human Orchestrator to approve those exact edits. Before application, the separately authorized orchestrator rechecks unchanged source inputs and unchanged approved proposal. Drift stops for renewed review; no inferred PM execution exception.
5. **Apply and report:** The authorized orchestrator applies only approved private-state edits, preserves unrelated content and uses `### 🎯 Active Sprint Chunk:` for Context. Complete intended tracked updates before final review/security/QA sealing. Return changed paths, checks, blockers and permitted next command/model from host routingMatrix; do not invoke it automatically.

## Git mutation boundary

Before every separately authorized Git action, the execution orchestrator invokes `node <pinned-TopHat-source>/.agents/scripts/git-preflight.ts` with the exact closed operation request on stdin; require GIT_PREFLIGHT_READY / ALLOW. Follow `.agents/docs/git-safety.md`: explicit branch/HEAD/base/remote, applicable clean or exact intended state, sequential checked results and operation-specific postchecks. This delegation does not grant Git authority to a read-only role or introduce implicit publication. Failure preserves actual state and halts; no automatic recovery. Candidate-changing commits require fresh applicable review/QA/document evidence.

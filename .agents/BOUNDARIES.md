# TopHat boundary registry — through Slice 2

This registry distinguishes current mechanisms from instructions and planned work. A registered hook is not automatically a reliable fail-closed control.

| Boundary | Current classification | Evidence and limit |
|---|---|---|
| Workspace contract parsing and capability derivation | Deterministic when `loadTophatConfig` is called | The loader denies malformed or unsupported declarations and returns frozen data. The vault template is intentionally unconfigured. Other scripts are not wired to this loader until their owning slices. |
| Existing hook decisions and context locks | Conditional physical interception | Registered scripts intercept supported tool payloads, but v0.8.0 error paths may return allow. Fail-closed corrections belong to Slice 3. |
| Svelte syntax guard | Conditional pre-write check for supported hook calls | Static registration remains global, but the script loads validated host config; Svelte profiles enforce, valid non-Svelte profiles explicitly skip, and invalid input/config denies. Coverage depends on the IDE invoking this registered hook for the supported write tools. |
| Framework skill compatibility | Deterministic when the guidance command is invoked; task handoff is instructed | `select-task-guidance.ts` checks proposed skill labels and framework instructions against derived capabilities and task topics. Architect/task-generation instructions require it before proposal and issue creation. The host does not physically prevent an agent from ignoring those instructions or writing contradictory free-form prose. |
| Smoke profile | Deterministic profile output, instructed task content | Selection reports web/backend/desktop from validated config. The smoke workflow describes compatible checks; execution and full QA classification remain later work. |
| Validation script execution, optional skips, coverage | Pending | The loader validates names and gate mappings but does not execute host scripts. Slice 3 supplies the runner and reports. |
| Documentation package approval and integrity | Pending | A safe relative package path is not proof that a package exists or is approved. Slice 4 validates content and authority. |
| Agent context restrictions and role write boundaries | Instructed | No physical read sandbox is claimed. PM and writer mutation gates depend on verified host workflow identity in later slices. |
| Git mutation safety | Instructed | Existing Git workflows contain instructions and commands; a shared physical preflight is Slice 8. |
| Workflow postcondition checks | Detection where actually performed | A diff or state audit can reject a result after a mutation; it does not prevent that mutation. Later slices must record both separately. |

The work hierarchy is **Development Phase → Sprint Chunk → Task**. A **Workflow Stage** identifies operational progress, such as session start, implementation, review, or QA. The Architect's Proposal Stage and Issue Creation Stage are operational stages, not roadmap segments.

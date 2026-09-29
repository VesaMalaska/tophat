# TopHat boundary registry — Slice 1

This registry distinguishes current mechanisms from instructions and planned work. A registered hook is not automatically a reliable fail-closed control.

| Boundary | Current classification | Evidence and limit |
|---|---|---|
| Workspace contract parsing and capability derivation | Deterministic when `loadTophatConfig` is called | The loader denies malformed or unsupported declarations and returns frozen data. The vault template is intentionally unconfigured. Other scripts are not wired to this loader until their owning slices. |
| Existing hook decisions and context locks | Conditional physical interception | Registered scripts intercept supported tool payloads, but v0.8.0 error paths may return allow. Fail-closed corrections belong to Slice 3. |
| Framework-specific skill selection and Svelte scope | Instructed/current legacy behavior | The global Svelte registration and universal assumptions remain until Slice 2. Capability derivation alone does not isolate guidance. |
| Validation script execution, optional skips, coverage | Pending | The loader validates names and gate mappings but does not execute host scripts. Slice 3 supplies the runner and reports. |
| Documentation package approval and integrity | Pending | A safe relative package path is not proof that a package exists or is approved. Slice 4 validates content and authority. |
| Agent context restrictions and role write boundaries | Instructed | No physical read sandbox is claimed. PM and writer mutation gates depend on verified host workflow identity in later slices. |
| Git mutation safety | Instructed | Existing Git workflows contain instructions and commands; a shared physical preflight is Slice 8. |
| Workflow postcondition checks | Detection where actually performed | A diff or state audit can reject a result after a mutation; it does not prevent that mutation. Later slices must record both separately. |

The work hierarchy is **Development Phase → Sprint Chunk → Task**. A **Workflow Stage** identifies operational progress, such as session start, implementation, review, or QA. The Architect's Proposal Stage and Issue Creation Stage are operational stages, not roadmap segments.

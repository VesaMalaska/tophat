# Synthetic web QA report projection — not live approval

Task: task-1; fingerprint and tested commit: use the actual validated JSON record, never this example. Route: mid → critical → security → QA. Selected methods: e2e-web, exploratory. Environment: controlled synthetic user/input, explicit reset, exact candidate build; no actual browser run claimed here.

| Criterion | Method/procedure | Expected / observed | Evidence | Result |
|---|---|---|---|---|
| product#AC-001 | Declared user journey, success/error/recovery | Recorded expected behavior / recorded observation | Exact command log and declared trace IDs | Fill from actual run |
| check-1 → product#AC-001 | Immediate neighboring-flow regression | Expected retained behavior / observation | Declared artifact IDs | Fill from actual run |

Record runtime/framework/OS, target/build evidence, controlled roles/data/reset, applicable states/viewports, findings, complete method results and pre/post fingerprints in the closed QAReport. Missing infrastructure or pending human acceptance is BLOCKED. A failure goes to a developer, never a QA fix. Final verdict is computed from the recorded evidence; this sample grants no permission.

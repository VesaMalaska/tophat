# Reviewed understandability fixtures

These are semantic review examples, not an executable code-quality oracle. Tests verify that all active roles receive the same contract. No size or complexity metric determines these verdicts.

| Case | Example change | Review outcome and reason |
|---|---|---|
| Focused behavior | Add a typed retry decision at the existing upload boundary and test success/failure/recovery | Accept when it satisfies the source criterion and preserves surrounding contracts |
| Speculative abstraction | Replace the retry boundary with a generic transport/plugin registry for future unspecified providers | Request changes: extra responsibilities and context are unrelated to the bounded requirement |
| Unrelated cleanup | Rename adjacent auth modules and restyle unrelated components while fixing upload retry | Request changes: unrelated diff obscures the required behavior and increases regression scope |
| Duplicated rule | Copy the same privileged retry decision into UI, transport and persistence modules | Request changes: competing ownership of one decision; place it at its existing responsibility boundary |
| Justified local refactor | Extract a shared typed retry decision within the affected upload module because existing duplicate branches produced inconsistent recovery | Accept when the concrete correctness reason, local scope and behavioral tests are recorded |

A larger focused function is not rejected solely for its length. Excessive decomposition is not automatically cleaner. Project-owned lint/static checks remain applicable independently.

# Runner-neutral acceptance fixture

This isolated host example uses the same `sum` acceptance behavior with Vitest and Node's built-in test runner. Run `pnpm install` within this directory, then `pnpm run unit:vitest` and `pnpm run unit:node`. To observe red first, temporarily change `return a + b` to `return a - b` in `sum.js`, run both scripts and observe failure, then restore the addition and observe both pass.

During Slice 3 verification on Node 24.19.0 and pnpm 11.25.0, Vitest 5.0.3 and Node's test runner each failed with `-1 !== 5` in the red phase, then each passed after correction. In a temporary Git host configured with `validation.scripts.unit` first as `unit:vitest` and then as `unit:node`, the same `run-validation.ts` commit gate returned `PASSED` for both without modifying the executor.

## Slice 9 reproducible coverage

Install locked fixture dependencies with `pnpm install --frozen-lockfile` in this directory. `coverage:node:pass` and `coverage:vitest:pass` generate actual coverage and pass the fixture's 40% branch policy. The matching `:fail` scripts intentionally require 100% and fail because the nonpositive branch is not exercised. These are host-owned demonstration policies, not universal TopHat thresholds. Node reports 66.67% branches and Vitest V8 reports 50% for this fixture; counting conventions differ.

The root `runner-coverage.test.ts` suite creates disposable hosts, runs both providers through the unchanged shared category interface, and reproduces real red/green unit tests. It does not mutate this source fixture or require a coverage-specific hook. Install dependencies before the root harness; missing Vitest dependencies fail visibly rather than silently skip. The root shared runner now removes inherited NODE_TEST_CONTEXT so independently launched Node tests cannot be mistaken for the caller's test workers.

# Runner-neutral acceptance fixture

This isolated host example uses the same `sum` acceptance behavior with Vitest and Node's built-in test runner. Run `pnpm install` within this directory, then `pnpm run unit:vitest` and `pnpm run unit:node`. To observe red first, temporarily change `return a + b` to `return a - b` in `sum.js`, run both scripts and observe failure, then restore the addition and observe both pass.

During Slice 3 verification on Node 24.19.0 and pnpm 11.25.0, Vitest 5.0.3 and Node's test runner each failed with `-1 !== 5` in the red phase, then each passed after correction. In a temporary Git host configured with `validation.scripts.unit` first as `unit:vitest` and then as `unit:node`, the same `run-validation.ts` commit gate returned `PASSED` for both without modifying the executor.

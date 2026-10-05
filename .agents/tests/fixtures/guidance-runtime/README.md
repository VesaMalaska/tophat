# Test-owned guidance runtime

Node >=24, Svelte 5.57.1, Playwright Test 1.61.1 and portable Chromium 153.0.0 are pinned by the lockfile. Install with `pnpm --dir .agents/tests/fixtures/guidance-runtime install --frozen-lockfile`. These dependencies belong exclusively to TopHat tests; QA must never install them into a consumer host.

The Svelte compiler transforms the example typed page props and a shared .svelte.ts rune module; a client render effect observes the state update and server rendering observes supplied page data. This is not a full SvelteKit application/typecheck certification. The browser fixture tests relevant UI readiness while requests remain active and a required result is delayed. The bundled headless Chromium fixture targets this Linux CI environment; it does not certify native desktop or other OS installations.

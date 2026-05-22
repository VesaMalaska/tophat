---
name: svelte5-kit-architecture
description: Enforces Svelte 5 Runes syntax and SvelteKit server-authoritative data loading. Use for all frontend logic, component creation, and API route definitions.
---
### Svelte 5 & SvelteKit Architecture Skill

When implementing frontend components or server routes, enforce the following paradigms:

#### 1. Svelte 5 Runes (Reactivity)
* Use `$state()`, `$derived()`, and `$effect()` exclusively for reactivity. Do not use legacy Svelte 4 `export let` or reactive statements (`$:`) under any circumstances.
* Destructure props using `$props()`. 
* Keep `$effect()` blocks minimal to prevent infinite render loops.

#### 2. Server-Authoritative Data Loading
* All database interactions, third-party API calls, and secret resolutions must occur in `+page.server.ts` or `+server.ts` files. 
* Never expose environment variables to the client bundle unless prefixed with `PUBLIC_`.
* Use SvelteKit Form Actions for all data mutations. Do not use client-side `fetch` for form submissions unless explicitly requested for optimistic UI updates.

#### 3. Type Safety
* Export explicit `PageServerLoad` and `Action` types for all server files.
* Ensure data passed to `+page.svelte` is properly typed via `export let data: PageData;` (or the Runes equivalent).

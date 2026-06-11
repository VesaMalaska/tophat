---
name: svelte5-runes-architecture
description: Enforces Svelte 5 Runes syntax for pure frontend component logic, state management, and UI reactivity.
---

# Svelte 5 Runes Architecture Skill

When implementing frontend components, strictly enforce the following paradigms:

## 1. Universal Svelte 5 Runes

- Use `$state()`, `$derived()`, and `$effect()` exclusively for local component state and computed values.
- Destructure component properties explicitly using `let { myProp, anotherProp } = $props();`.
- **CRITICAL:** Do NOT use legacy Svelte 4 syntax (`export let`, reactive statements `$:`, or `onMount` where an effect suffices). The pipeline will reject these patterns.

## 2. State Encapsulation

- For complex state shared across components, extract `$state()` into standard `.ts` or `.js` modules (Svelte 5 universal reactivity) rather than relying on legacy Svelte stores (`writable`, `readable`) unless interfacing with third-party legacy libraries.

## 3. Side-Effect Hygiene

- Keep `$effect()` blocks minimal and scoped strictly to DOM manipulation or external API synchronization. Never use `$effect()` to derive state from other state; use `$derived()` instead to prevent infinite render loops.

---
name: tailwind-desktop-ui
description: Enforces semantic markup and utility-class styling constraints tailored for dense desktop environments.
---

# Tailwind Desktop UI Skill

When building view layers for desktop targets, adhere to these structural constraints:

## 1. Desktop-First Density & Interaction

- Prioritize high-density data layouts over mobile-first tap targets.
- Utilize custom scrollbar utilities (e.g., `scrollbar-thin`, `scrollbar-hide`) or OS-native scrollbar masking to maintain desktop aesthetics.
- Rely on CSS interactions (`hover:`, `focus:`, `active:`) and hardware-accelerated transitions.

## 2. Semantic Structure

- Rely exclusively on native HTML5 semantic tags (`<nav>`, `<main>`, `<aside>`, `<dialog>`). Do not use generic `<div>` wrappers for interactive elements unless building custom accessible components with full ARIA implementations.

## 3. Strict Utility Composition

- Follow approved host styling policy and permitted CSS exceptions. Use Tailwind utilities where declared; accessibility and safe rendering remain required.

## Approved host policy and security bounds

Implementation choices follow the approved host package supplied through authorized task extracts; this does not expand ordinary execution roles into full product docs browsing. Shared `.agents/docs` safety contracts remain mandatory resources. Validation at trust boundaries, authorization, secret protection, safe IPC and declared isolation remain security invariants. If approved host choices conflict with these bounds, halt for human resolution rather than silently waive them.

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

- Utilize Tailwind utility classes exclusively. Ban the creation of custom CSS files or `<style>` blocks within components unless strictly required for complex `@keyframes` or third-party canvas layer overrides.

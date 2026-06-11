---
name: tailwind-semantic-ui
description: Enforces semantic markup and utility-class styling constraints. Use for all visual interface tasks.
---

# Tailwind Semantic UI Skill

When building view layers, adhere to these structural constraints:

## 1. Markup Semantics

- Rely on native HTML5 semantic tags (`<article>`, `<nav>`, `<aside>`).
- Ensure all interactive elements (buttons, links) have appropriate ARIA labels if no text is visible.

## 2. Tailwind Implementation

- Utilize utility classes exclusively; ban the creation of custom CSS classes unless handling complex 2.5D parallax or specific mesh-weighting animations.
- Maintain responsive design hierarchies using `sm:`, `md:`, and `lg:` prefixes reliably.

## 3. Text & Localization

- Before adding text to the UI, explicitly check the Localization setting in the `[GLOBAL_CONSTRAINTS]` of `Context.md`.
- **If set to i18n Required:** Do not hardcode localized display text. Wrap user-facing strings in appropriate i18n placeholders.
- **If set to Hardcoded UI Authorized:** You may write hardcoded UI copy directly into the markup.

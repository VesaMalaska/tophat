---
name: playwright-qa-flows-desktop
description: Directives for end-to-end testing of native desktop interfaces. Use when validating multi-step user flows or generating E2E test scripts.
---

# Playwright QA & E2E Validation Skill

When validating UI implementations or writing Playwright test suites, construct robust, non-brittle tests:

## 1. Selector Resilience (A11y First)

- Target elements exclusively via accessibility attributes (`getByRole`, `getByLabel`, `getByAltText`, `getByPlaceholder`) as the primary method. This mimics real user interaction.
- Avoid relying on CSS utility classes or raw DOM paths. Use `data-testid` strictly as a fallback if no semantic attribute exists.

## 2. Asynchronous State Validation (Offline Architecture)

- **CRITICAL:** This is an offline application. Do NOT use `waitForLoadState('networkidle')` or await HTTP responses.
- Await UI resolution via specific DOM mutations, element visibility (`await expect(locator).toBeVisible()`), or explicitly await IPC bridge callbacks if exposed to the test environment.
- Never use hardcoded `page.waitForTimeout()` delays. Rely entirely on Playwright's auto-waiting mechanisms.

## 3. Flow Validation & Unhappy Paths

- Validate the "Happy Path" through the UI components.
- You must explicitly trigger and test Error Boundaries (e.g., submitting invalid data, simulating an IPC failure) to verify the UI displays the correct error states and gracefully recovers.

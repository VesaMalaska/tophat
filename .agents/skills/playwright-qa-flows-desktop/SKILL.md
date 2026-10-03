---
name: playwright-qa-flows-desktop
description: Directives for end-to-end testing of native desktop interfaces. Use when validating multi-step user flows or generating E2E test scripts.
---

# Playwright QA & E2E Validation Skill

When validating UI implementations or writing Playwright test suites, construct robust, non-brittle tests:

## 1. Electron Environment Scaffolding (CRITICAL)

- You are testing a compiled native binary, NOT a web application. Standard `({ page })` fixtures and `page.goto()` commands will fail.
- All Playwright test files must use the `_electron` module to boot the application and extract the first window. You must use this exact bootstrapping pattern:

```typescript
import { test, expect, _electron as electron } from "@playwright/test";
import type { ElectronApplication } from "@playwright/test";

let electronApp: ElectronApplication;

test.beforeAll(async () => {
  // Boot the Electron app from the current directory
  electronApp = await electron.launch({ args: ["."] });
});

test.afterAll(async () => {
  await electronApp.close();
});

test("example test", async () => {
  // Extract the active window to use as the page object
  const window = await electronApp.firstWindow();
  // Execute locators against 'window'
});
```

## 2. Selector Resilience (A11y First)

- Target elements exclusively via accessibility attributes (`getByRole`, `getByLabel`, `getByAltText`, `getByPlaceholder`) as the primary method. This mimics real user interaction.
- Avoid relying on CSS utility classes or raw DOM paths. Use `data-testid` strictly as a fallback if no semantic attribute exists.

## 3. Asynchronous State Validation (Offline Architecture)

- **CRITICAL:** This is an offline application. Do NOT use `waitForLoadState('networkidle')` or await HTTP responses.
- Await UI resolution via specific DOM mutations, element visibility (`await expect(locator).toBeVisible()`), or explicitly await IPC bridge callbacks if exposed to the test environment.
- Never use hardcoded `page.waitForTimeout()` delays. Rely entirely on Playwright's auto-waiting mechanisms.

## 4. Flow Validation & Unhappy Paths

- Validate the "Happy Path" through the UI components.
- You must explicitly trigger and test Error Boundaries (e.g., submitting invalid data, simulating an IPC failure) to verify the UI displays the correct error states and gracefully recovers.

## Slice 6 applicability and evidence

Apply this skill only when the validated task selects the corresponding web/desktop E2E method and compatible capability. QA uses existing declared test infrastructure; missing tooling is BLOCKED and does not authorize installation or source/test edits. New reusable tests belong to a separate developer task/remediation. Record exact tested commit/build, controlled data/roles, applicable states, procedures, results and artifact digests using the shared QAReport. Only the declared methods run; no universal UI QA is inferred from Node.js. Preserve main/preload/renderer/IPC boundaries in Electron; renderer framework guidance remains separate.

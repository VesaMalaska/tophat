---
name: playwright-qa-flows-web
description: Directives for end-to-end testing of web applications and SaaS platforms. Use when validating multi-step user flows across a network boundary.
---

# Playwright Web QA Validation Skill

When validating web UI implementations, construct robust, network-aware tests:

## 1. Selector Resilience (A11y First)

- Target elements exclusively via accessibility attributes (`getByRole`, `getByLabel`, `getByText`). This mimics real user interaction and ignores CSS churn.

## 2. Network & Latency Resilience

- **CRITICAL:** Never use hardcoded `page.waitForTimeout()`.
- Explicitly await network boundaries before asserting state changes. Use `await page.waitForLoadState('networkidle')` for full page navigations.
- For asynchronous data fetching (e.g., submitting a form, loading a list), explicitly await the API response: `await Promise.all([ page.waitForResponse('**/api/target-route'), page.getByRole('button', { name: 'Submit' }).click() ]);`

## 3. Unhappy Paths & API Mocking

- You must test how the UI handles network failures. Use `page.route()` to intercept and mock 500 Internal Server Errors or 401 Unauthorized responses to verify the UI displays the correct error boundary or redirects to login.

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
- After navigation, assert the criterion-relevant observable UI state with web-first assertions, such as `await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()`. Ongoing background requests must not prevent a ready UI from passing; delayed required UI must not pass early.
- For asynchronous data fetching (e.g., submitting a form, loading a list), await a relevant API response only when the criterion requires that boundary, then assert the resulting UI: `await Promise.all([ page.waitForResponse('**/api/target-route'), page.getByRole('button', { name: 'Submit' }).click() ]);`

## 3. Unhappy Paths & API Mocking

- You must test how the UI handles network failures. Use `page.route()` to intercept and mock 500 Internal Server Errors or 401 Unauthorized responses to verify the UI displays the correct error boundary or redirects to login.

## Slice 6 applicability and evidence

Apply this skill only when the validated task selects the corresponding web/desktop E2E method and compatible capability. QA uses existing declared test infrastructure; missing tooling is BLOCKED and does not authorize installation or source/test edits. New reusable tests belong to a separate developer task/remediation. Record exact tested commit/build, controlled data/roles, applicable states, procedures, results and artifact digests using the shared QAReport. Only the declared methods run; no universal UI QA is inferred from Node.js. Preserve main/preload/renderer/IPC boundaries in Electron; renderer framework guidance remains separate.

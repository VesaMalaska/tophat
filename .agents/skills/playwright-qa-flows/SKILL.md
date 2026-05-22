---
name: playwright-qa-flows
description: Directives for end-to-end testing and validation. Use when validating multi-step user flows or generating E2E test scripts.
---
### Playwright QA Validation Skill

When validating implementations, construct robust, non-brittle tests:

#### 1. Selector Resilience
* Target elements via accessibility attributes (`getByRole`, `getByLabel`, `getByAltText`) as the primary method.
* Avoid relying on CSS classes or raw DOM paths. Use `data-testid` only as a fallback.

#### 2. Flow Validation
* Ensure tests explicitly await network idle states or specific DOM mutations rather than using hardcoded timeouts.
* Validate happy paths, and explicitly test error boundary rendering (e.g., submitting invalid data to trigger and verify error messages).

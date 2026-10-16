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

## 4. MOBILE-001 — Primary Mobile Quality and Minimum Usability

**Policy (what must hold):** For applicable responsive web UI tasks, **390 CSS px** is the primary mobile visual-design and review target; **320 CSS px** is the minimum supported functional-usability width. The layout must adapt across 320–390 CSS px without functional regression. These are *viewport widths in CSS pixels*, not device hardware pixels, fixed design dimensions, or mandated CSS breakpoints.

- **390 px quality target:** evaluate typography, spacing, composition, layout and interactions against the project's approved mobile design/acceptance criteria. A screenshot is evidence for review, not an automatic visual approval.
- **320 px usability floor:** all essential content, navigation, controls, forms, dialogs and primary actions must remain accessible and operable; text must remain readable; interactive elements must not overlap in ways that impair use. Essential journeys must be completable.
- **Allowed 320 px compromises:** reduced spacing, rearranged components and simplified or omitted *decorative* elements. Never hide required content or functionality to achieve a passing layout.
- **No unintended page-level horizontal scrolling** at either target or intermediate widths. A deliberately scrollable component (such as an explicitly designed data grid) may scroll inside its own bounded container if its content and controls remain usable; do not confuse it with document-level overflow.
- **Intermediate widths:** inspect or exercise relevant transitions within 321–389 px if layout behavior or acceptance criteria make them material. Do not infer continuity merely because the two endpoints pass.
- **Applicability:** this policy applies when the classified task and approved criteria call for mobile/responsive *web* UI QA on a compatible browser-capable host. It does not create an unconditional mobile, visual, accessibility or E2E QA requirement, nor does it apply to terminal hosts or desktop-only Electron surfaces. When not applicable, record the existing explicit applicability rationale rather than invent a new QA status or method.

**Execution (how to gather evidence):** When MOBILE-001 is applicable, use the task-selected existing `responsive`, `visual`, `e2e-web` or other declared QA methods; **do not add methods beyond the validated task classification**. Within those methods:

1. Set the browser viewport to **390 px wide** and **320 px wide**, using the project's declared test configuration and a recorded viewport height. Check the actual rendered UI, not device labels alone.
2. At both widths, check document-level horizontal overflow and inspect clipping, overlap, visible controls and text. Treat overflow detection as a useful heuristic, **not** proof of usability; inspect bounded scroll regions separately.
3. Exercise the task's declared essential mobile user journeys at both widths whenever the selected methods include E2E interaction; otherwise mark unexecuted interaction coverage clearly rather than claiming it passed. Include navigation, form completion, primary actions and modal handling **where applicable**.
4. Capture viewport-labelled screenshots at both widths using existing permitted infrastructure where the selected method provides screenshot capture. At 390 px, compare with approved visual references where supplied; at 320 px, evaluate layout integrity and usability rather than pixel-perfect similarity. Report subjective design acceptance as pending until an authorized human provides the required signal.
5. Inspect intermediate widths or breakpoint transitions when material; record what was inspected. An optional additional width (e.g. **360 px**) is a sampling aid, not a new mandatory global test target.
6. Record observed and expected results, tested routes/states and procedures for the selected criteria. Distinguish **functional blockers**, **visual defects**, and **accepted 320 px decorative compromises**. An accepted compromise must be justified against approved criteria; do not silently waive a failure.

**Evidence and failure discipline:** Record exact tested commit/build, actual viewport **width and height**, controlled data/roles, routes and flows tested, outcomes, screenshot/trace/log artifact IDs and digests in the **existing QAReport** fields. Use the existing `environment.viewports`, `methodResults`, `criteria`, `commands`, `artifacts` and `findings` structures; no parallel schema or new verdict values. Missing applicable tooling, inaccessible required journeys, or absent required visual-human approval cannot be called PASSED. Never claim screenshots, `scrollWidth` checks or green automation alone establish complete usability.

## Slice 6 applicability and evidence

Apply this skill only when the validated task selects a corresponding web QA method (such as e2e-web, responsive or visual) and the host has a compatible browser capability. Desktop E2E is governed by its own selected skill; this web skill does not extend browser-only requirements to desktop or terminal hosts. QA uses existing declared test infrastructure; missing tooling is BLOCKED and does not authorize installation or source/test edits. New reusable tests belong to a separate developer task/remediation. Record exact tested commit/build, controlled data/roles, applicable states, procedures, results and artifact digests using the shared QAReport. Only the declared methods run; no universal UI QA is inferred from Node.js. Preserve main/preload/renderer/IPC boundaries in Electron; renderer framework guidance remains separate.

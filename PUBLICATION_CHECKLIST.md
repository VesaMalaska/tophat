# Public-release audit checklist (November 2026)

This document tracks **portfolio/public-source readiness**, not a validated TopHat 1.0 product release.

## Confirmed
- [x] Source of the proposed publication is the active `development` line, not the outdated `main` branch.
- [x] MIT license added.
- [x] README explicitly identifies the system as experimental and describes the limits of automated enforcement.
- [x] Existing acceptance documentation distinguishes fixture tests from live host integration.

## Blocking checks before changing repository visibility
- [ ] Run secret scanning (for example Gitleaks) on **all reachable commits, branches and tags**; inspect and rotate/remediate any exposed credentials before publication.
- [ ] Review tracked files, documentation, fixtures and commit/PR/issue history for personal, customer, internal workspace or proprietary content.
- [ ] Run `pnpm --dir .agents/tests/fixtures/runner-neutral install --frozen-lockfile` and `pnpm test:tophat` with Node >=24; record full results and any failed checks.
- [ ] Verify latest target branch commit and independent human review, including applicable README, license, installation safety and upstream attribution.
- [ ] Decide whether to merge reviewed `development` into `main`, then verify the actual resulting commit. No automatic merge.
- [ ] Confirm visibility change separately. **Do not switch to public automatically.**

## Known limits
- TopHat is an unconfigured workflow vault, not an npm app or standalone CLI.
- Fixture tests do not establish live host project acceptance or real IDE hook enforcement.
- Model catalog and product integration dependencies can change; actual host validation is required.
- MIT permissions cover code owned by the publisher; third-party borrowed text/assets, if any, must be separately reviewed for licensing.

Do not mark the repository publish-ready on the basis of this checklist alone.

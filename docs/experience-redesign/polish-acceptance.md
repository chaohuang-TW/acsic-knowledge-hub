# Experience Final Polish acceptance

This lightweight repository record complements the downloadable evidence artifact. It does not replace raw tests, claim an award, or imply a real participant study.

## Exact release identity

- Repository: `chaohuang-TW/acsic-knowledge-hub` (public).
- Baseline: `6c009fcf4e2c8cca0902e64c2de7323b39727819`.
- Branch: `experience-final-polish`.
- Single PR title: `fix: refine mobile experience and complete usability evidence`.
- Candidate/release SHA: recorded by the exact checkout in each ZIP's `manifest.json`; the merged PR records the squash release SHA. This avoids committing an impossible self-referential SHA.
- Public site: <https://chaohuang-tw.github.io/acsic-knowledge-hub/>.

The final PR release record must include exact-head CI, main CI, completed Pages deployment, deployment-head SHA, live asset comparison and English/Traditional-Chinese core operations. A successful candidate CI, a triggered deployment or HTTP200 alone is not release acceptance.

## Evidence delivery

The existing repository CI creates `ACSIC-Experience-Polish-Evidence.zip` using sequential baseline/candidate production builds on one runner. The actual artifact retains the ZIP, SHA256 sidecar and `package-result.json`; the complete raw matrix is a separate artifact in the same run. No bulky screenshots or videos are committed to source.

- [CI runs and downloadable artifacts](https://github.com/chaohuang-TW/acsic-knowledge-hub/actions/workflows/ci.yml).
- Artifact name: `ACSIC-Experience-Polish-Evidence`.
- Retention: 14 days from upload. Use the exact expiration displayed by GitHub and save the download before it expires. This is not permanent storage.
- GitHub may require normal sign-in to download an Actions artifact. Extract its wrapper, then verify the named evidence ZIP against the inner-ZIP SHA256 sidecar. The artifact wrapper's digest is a different hash.
- If the artifact is absent, expired or the packaging job failed, evidence delivery is incomplete. Local temporary files alone are not a delivered attachment.

## Measurement and test boundaries

- Same-machine, same-throttling fresh before/after Lighthouse: three cold mobile and three cold desktop runs for each revision, individual reports and medians retained. Targets: mobile≥90, desktop≥95, LCP≤2.5s, CLS≤0.1.
- Initial JavaScript gzip must not exceed the fresh baseline by 5%; optional Three.js remains separately loaded and absent from non-map pages.
- Format check is read-only. Lint, TypeScript, unit/data-governance checks, production build, coverage-document consistency and secret scan use repository scripts.
- Chromium desktop and mobile run the full suite. WebKit runs core smoke paths. Firefox core smoke runs in Linux CI; local macOS launch limitations are not reported as passes.
- axe uses WCAG2A/2AA rule tags, with incomplete results retained. Manual controls, focus, contrast and applicable WCAG2.2 target exceptions remain separate review work. No full-site WCAG certification is claimed.
- Widths 320/390/430/768/1440 and approximate root-font 200% are covered by regression/audit scenarios. This is not native browser text zoom or a physical phone.
- Test results are recorded only after execution. The ZIP's structured reports and the exact PR release record are authoritative for counts, failures, skips, final performance and live verification.

## Human acceptance

- Bilingual facilitator guide, six participant tasks and anonymous blank CSV: [delivered source kit](usability-test-plan.md); also included in the evidence ZIP.
- Real first-time participants: **pending / 待執行**. No human observations or outcomes are invented.
- Recruitment/contact/recording/PII upload: not performed.
- Physical iPhone Safari and native text zoom: **not tested / 未實測**.

## Local verification record

- Repository `pnpm check`: passed, including 202 unit/data-governance tests, coverage documentation, read-only format check, lint, TypeScript, production build and secret scan.
- One complete local E2E run: 165 cases, 156 passed and 9 failed because old selectors still pointed at intentionally removed duplicate text/actions. No application regression was inferred from those selector failures. After updating them to the retained return action and actual selected/overview state, all 11 affected regression cases passed. The exact-head CI full-suite JSON remains the final authoritative browser result.
- Fresh local baseline Lighthouse medians: mobile 100 / LCP 1299.30ms; desktop 95 / LCP 1175.64ms; CLS 0. A pre-contrast-fix candidate measurement had desktop 93 and did not meet the 95 gate. It is not reported as a pass. Final CI collects both revisions sequentially on one runner and must meet all gates before merge.
- After the confirmed contrast fix, the final frozen production build's six cold local runs had medians mobile 100 / LCP 1281.83ms and desktop 96 / LCP 1125.40ms, CLS 0. Initial JavaScript gzip changed from 126551 to 126399 bytes (−0.12%). The earlier 93 result is retained separately, not relabeled; these are lab measurements, not field INP or a claim that a typography fix caused a performance gain.
- The final 144-state axe matrix has zero violations and zero page overflow/errors; incomplete findings remain for manual review. All 52 final capture cases pass with protected-file equality.
- Fresh captures and checksum verification cover 52 route/language/viewport cases and 14 protected data/mascot files. The final artifact records current successful/failed results, not this document's intent.
- A first final axe matrix exposed metric-text contrast at 200% root-font approximation. The three affected text styles were fixed; final scans are required rather than suppressing the finding.

## Release gate and stop

Engineering acceptance requires resolved verified high-priority issues, two separate final walkthroughs without new P0/P1, protected-data/mascot equality, passing relevant test/build/security checks, no material performance/accessibility regression, an obtainable evidence ZIP, completed CI/Pages and exact live asset verification. Real-human acceptance remains pending independently.

Remaining P2 tradeoffs and alternatives are in [polish review](polish-review.md). Do not silently start another redesign or data-research phase after this release.

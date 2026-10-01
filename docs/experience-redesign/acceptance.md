# Experience rebuild acceptance

Status: **local release-candidate acceptance passed**. Exact-head CI and production release evidence are recorded in [PR #26](https://github.com/chaohuang-TW/acsic-knowledge-hub/pull/26) after execution. A merged PR alone is not deployment evidence.

## Completed implementation

- Living Atlas homepage combines direct institution lookup with a real geographic workspace and one governed 20/14/1 statistic group.
- Directory search, economy grouping, secondary-filter disclosure and session restoration support a direct path to canonical institution profiles and official websites.
- Profiles prioritize identity, mandate, services and latest verified metrics. Data preserves raw values, readable values, currency, units, periods, source locators and historical exports. Compare keeps two-to-four institution controls and an explicitly scrollable mobile table.
- English and Traditional Chinese hash routes, remembered language choice, deep-link identity, unknown routes and failed lazy-page loads have explicit behavior.
- Tokens, shared foundation and scoped feature styles replace the old theme override layer. The geographic SVG is complete by default; optional desktop Three.js loads separately. Reduced motion and renderer failures retain a complete standard explorer.

## Verified local gates

- `pnpm check`: coverage document check, read-only format check, lint, TypeScript, 198 unit/data tests, production build and secret scan passed.
- Chromium desktop/mobile full suites and WebKit core suite: **131/131 passed**, using the final production build after the last contrast changes. This covers all-width bilingual standard-map reflow, voluntary 3D-to-SVG switching, skip navigation without hash corruption, 320 CSS px and a 200% root-text-size approximation.
- Firefox was installed and attempted locally. macOS launch failed with `sandbox_extension_issue_file_to_process` and a SWGL framebuffer error; this is **not** a Firefox compatibility pass. The Firefox smoke suite remains enabled in CI without skipping or weakening assertions.
- Initial application bundle: 412,535 raw bytes / 126,551 gzip-estimate bytes / 126,851 measured network bytes. Optional 3D bundle: 930.76 kB raw / 250.57 kB gzip (Vite estimates), separate from the initial path. No non-map route requested Three.js.
- The final capture matrix contains 52 bilingual route/viewport cases and 104 first-screen/full-page PNGs, with no console warnings/errors, page errors, failed requests or HTTP responses of 400 or higher.
- All 14 protected research-data files and the original mascot match the base checksums. No private core repository, main homepage, redirect repository, CNAME or account setting was modified.

## Accessibility and visitor acceptance

The final strict axe run sampled 18 routes at 320, 390, 430, 768, 1024, 1440 and 1920 CSS px, plus a 200% root-text-size approximation: **144/144 states**, zero axe violations, horizontal overflow, page/request errors or sampled focus issues. Sixteen incomplete contrast checks involve the homepage SVG label plates and decorative arrows; manual color/background checks and visible focus checks are recorded in the review log.

Primary lookup controls measure about 46px high. The audit still records 463 repeated secondary targets below 44px across the matrix; small map chips have a larger native-selector alternative on mobile, and inline/footer links remain a P2 target-size tradeoff. This is not a claim that every control is 44px or that automated checks certify WCAG.

Two separated final visitor tours found no new P0/P1 issue. They verified lookup/profile/back-context, member/observer distinctions, consecutive economy selection, language memory, unknown routes, ACGF 2024/2025 and raw units/sources, comparison limits and actual keyboard table scrolling, and safe 3D/SVG switching. An old cached release-candidate tab exercised localized lazy-load recovery: reload preserved its query and loaded the current asset version. CUA did not capture a download event; actual file downloads and their contents were verified by Playwright.

Known P2 follow-ups: legacy noncanonical `#/institutions?q=...` normalization, lengthy mobile Directory listings, repeated but readable Data metadata, and smaller secondary targets. P0/P1: zero unresolved in the completed local reviews.

## Fixed-condition cold performance

Lighthouse 13.5 uses cold caches, DevTools 150ms latency, 1,638.4Kbps download, 750Kbps upload and 4x CPU slowdown for both 390×844 mobile and 1440×1000 desktop. No concurrent audit/build ran during these measurements. Headless GPU-disabled runs exercise the complete SVG explorer, not an artificial empty-map placeholder.

| Profile / cold run | Performance |  LCP ms | CLS | TBT ms |
| ------------------ | ----------: | ------: | --: | -----: |
| Mobile 1           |         100 | 1133.35 |   0 |      0 |
| Mobile 2           |         100 | 1126.50 |   0 |      0 |
| Mobile 3           |         100 | 1148.22 |   0 |      0 |
| Mobile median      |         100 | 1133.35 |   0 |      0 |
| Desktop 1          |          95 | 1144.98 |   0 |      0 |
| Desktop 2          |          96 | 1117.78 |   0 |      0 |
| Desktop 3          |          95 | 1130.35 |   0 |      0 |
| Desktop median     |          95 | 1130.35 |   0 |      0 |

All three runs per profile completed. Median Mobile >=90, Desktop >=95, LCP <=2500ms and CLS <=0.1 gates passed. Separate unthrottled browser checks measured the SVG map's first usable state at median 64.80ms mobile / 62.40ms desktop; these custom timings are not the throttled Lighthouse LCP or field INP. Every audited non-map route requested zero Three.js chunks.

## Remote release sequence

[PR #26](https://github.com/chaohuang-TW/acsic-knowledge-hub/pull/26) is the single release record. It must remain draft until exact-head PR CI succeeds. The authorized sequence is then ready-for-review, SHA-guarded squash merge, main CI, the existing Pages workflow at that main SHA, online asset-hash matching and bilingual core-task verification. The PR body is updated with actual workflow URLs, main SHA and final deployment result only after they are read back. No direct or forced main push is used.

## Limits on claims

Automated checks and root-font-size testing do not establish complete WCAG 2.2 AA conformance, native browser text zoom, physical iPhone Safari behavior or field Core Web Vitals/INP. Design references inform information hierarchy and interaction, not award certification. The work must remain draft if any required gate is incomplete.

Screenshots, traces and raw Lighthouse/axe outputs remain in local or CI artifact storage; see the capture inventory and review log for their scope. No bulky generated media or local user path is committed.

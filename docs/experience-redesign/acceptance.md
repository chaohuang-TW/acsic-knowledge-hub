# Experience rebuild acceptance

Status: **release candidate; not yet released**. The production site is not a substitute for the local release-candidate evidence.

## Completed implementation

- Living Atlas homepage combines direct institution lookup with a real geographic workspace and one governed 20/14/1 statistic group.
- Directory search, economy grouping, secondary-filter disclosure and session restoration support a direct path to canonical institution profiles and official websites.
- Profiles prioritize identity, mandate, services and latest verified metrics. Data preserves raw values, readable values, currency, units, periods, source locators and historical exports. Compare keeps two-to-four institution controls and an explicitly scrollable mobile table.
- English and Traditional Chinese hash routes, remembered language choice, deep-link identity, unknown routes and failed lazy-page loads have explicit behavior.
- Tokens, shared foundation and scoped feature styles replace the old theme override layer. The geographic SVG is complete by default; optional desktop Three.js loads separately. Reduced motion and renderer failures retain a complete standard explorer.

## Verified local gates

- `pnpm check`: coverage document check, read-only format check, lint, TypeScript, 198 unit/data tests, production build and secret scan passed.
- Chromium desktop/mobile full suites and WebKit core suite: **128/128 passed**, using the final production build. The last pass also covers voluntary 3D-to-SVG switching, skip navigation without hash corruption, 320 CSS px and a 200% root-text-size approximation.
- Firefox was installed and attempted locally. macOS launch failed with `sandbox_extension_issue_file_to_process` and a SWGL framebuffer error; this is **not** a Firefox compatibility pass. The Firefox smoke suite remains enabled in CI without skipping or weakening assertions.
- Initial application bundle: 412.54 kB raw / 126.55 kB gzip (Vite estimates). Optional 3D bundle: 930.76 kB raw / 250.57 kB gzip. Browser transfer and cold-load results are recorded separately after final measurement.
- Research data and original mascot must match `protected-checksums.json` before publication. No private core repository, main homepage, redirect repository, CNAME or account setting is in scope.

## Pending release gates

- Final bilingual accessibility matrix and manual review of exceptions.
- Three mobile and three desktop cold Lighthouse runs, including thresholds, individual results, medians, map-ready time and non-map Three.js requests.
- Two separated visitor-only final tours with no new P0/P1 issues.
- Pull-request CI at the exact head SHA, squash merge, main CI, Pages SHA/assets and live bilingual task verification.

## Limits on claims

Automated checks and root-font-size testing do not establish complete WCAG 2.2 AA conformance, native browser text zoom, physical iPhone Safari behavior or field Core Web Vitals/INP. Design references inform information hierarchy and interaction, not award certification. The work must remain draft if any required gate is incomplete.

Screenshots, traces and raw Lighthouse/axe outputs remain in local or CI artifact storage; see the capture inventory and review log for their scope. No bulky generated media or local user path is committed.

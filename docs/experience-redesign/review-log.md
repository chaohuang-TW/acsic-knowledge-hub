# Experience review log

## Round 1: production baseline and design direction

Inspected the production homepage in a real browser, then captured all core English and Traditional Chinese routes at desktop and mobile sizes. The baseline report records 52 route/viewport captures, 104 screenshots, resource timings and console diagnostics. The screenshots were visually inspected, not treated as an automatic quality pass.

Observed issues:

1. **P1: unreadable snapshot metrics.** The Taiwan desktop snapshot had nested grid layouts that compressed official values into vertical digit columns. Metric sections need a full-width inner reading layout.
2. **P1: mobile wayfinding consumes the first screen.** Disclaimer, brand, language and navigation occupy about a third of the mobile viewport before content begins. Compact but explicit unofficial status and a two-row header are required.
3. **P1: lookup is not immediate.** The homepage has no direct search, and the map sits below the oversized hero. Add a first-screen query path and place the geographic workspace beside it.
4. **P2: repeated visual and informational chrome.** Overview counts are repeated, pages use oversized rounded shells, and display typography overwhelms operational controls. Use a single home statistic group, structural rules and scoped feature layouts.
5. **P1: renderer capability mismatch.** Detection accepts WebGL1 although the installed Three.js renderer requires WebGL2. WebGL1-only devices must use the complete standard explorer.

### Concept review

Three real responsive HTML concepts were viewed in the browser. Living Atlas keeps lookup and geographic context in the same working area. Research Index puts a large dark masthead before the map and has weaker first-screen balance. Network Notebook uses a journey sidebar that costs width on desktop and adds a step on mobile. **Living Atlas is selected.**

Prototype corrections carried into implementation: avoid clipped Papua New Guinea labels, keep the lookup button on one line, do not rotate a working map, and ensure the mobile economy selector precedes the map rather than depending on tiny map labels.

## Round 2: full-site integration review

Reviewed the production build in a real browser and inspected desktop/mobile captures of the homepage, directory, profiles and research tools.

1. **P1: geographic workspace too narrow.** The empty overview aside compressed the map. Overview now uses a full-width map; its heading is compact, labels have leader lines and the long Papua New Guinea label remains inside the viewBox.
2. **P1: locale switch reset working context.** The page error boundary remounted on locale change, collapsing sources and download controls. Its key now changes only with the page/institution, preserving filters and open disclosures while translating the same record.
3. **P1: standard explorer lost its selector after selection.** The economy selector now remains available in both overview and focus states, supporting immediate consecutive changes without a return step.
4. **P2: research headings and metadata compete with controls.** Research/profile titles have been reduced, and comparison names and economy labels have separate typographic rows. The Chinese homepage headline uses deliberate phrase boundaries.
5. **P1 under verification: 200% text overflow.** A 320px desktop-emulated directory overflow was reproduced by a behavioral test. This is tracked as a release gate, not hidden with page-wide overflow clipping.

The initial full behavioral run reported 103/130 passes. Ten failures were unavailable WebKit/Firefox executables (subsequently installed); the remaining failures identified the above state issues or selectors that needed to target the new SVG/control hierarchy. Existing data, export and navigation assertions are retained.

## Next review stages

- Full-site production-build review and representative visitor tasks.
- Mobile, keyboard, contrast, reduced-motion, performance and failure-mode review.
- Visitor-only acceptance review.
- Two separate final tours with no new P0/P1 issues.

No final tour or release gate is marked complete until its evidence is recorded below.

## Round 3: comparison, accessibility and release-gate follow-up

This round records the latest review evidence and implementation follow-ups. It is
not a final acceptance record; the last two visitor tours and the final 128-test
run remain incomplete.

1. **P2: comparison and systems information discovery.** The comparison layout
   previously allowed labels to run together on desktop and made the mobile table's
   horizontal affordance hard to discover. The current implementation splits the
   labels into rows, keeps the first comparison column sticky, and adds a mobile
   scrolling cue. Systems source labels now distinguish same-named entries with
   the official original source title.
2. **P1 under verification: mobile accessibility.** The second accessibility
   review sampled 72 mobile states and reported 26 axe violations, including
   invalid `role=list`/button semantics and secondary-text contrast ratios of
   4.37 and 3.62. The reported fixes replace the invalid group semantics, update
   the color treatment, expose the visible brand tagline, and declare the mascot
   dimensions (`250×465`). A new accessibility run is still required; this log
   does not mark accessibility as passed.
3. **P1 under verification: 200% text and 320px width.** The new E2E check
   reproduced a 533px navigation overflow. The reported changes move the overflow
   to a 344px heading/body issue and address it with `overflow-wrap:anywhere`,
   `min-width:0` on the brand span, and footer/badge wrapping. Final verification
   is pending and no overflow pass is claimed here.
4. **P2 under verification: desktop performance.** An early desktop Lighthouse
   result was 94 against the 95 target. Lazy-loading the snapshot module and
   deriving homepage membership stats outside the main path reduced the measured
   main gzip from 150.85KB to 126.51KB. A fresh Lighthouse measurement is still
   required.
5. **E2E evidence is retained without weakening coverage.** The second 134-test
   run recorded 122 passed, 11 failed and 1 interrupted. Six Firefox launches
   were blocked by the macOS `sandbox_extension_issue`/SwiftGL environment, not
   converted into skips. A subsequent 128-test run excluded that local Firefox
   launch limitation and recorded 126 passed with 2 overflow failures. The final
   128-test run is still in progress; CI continues to include Firefox and WebKit.

The remaining failures and accessibility/performance evidence must remain visible
until a fresh run verifies the fixes. The two final visitor tours are not
pre-marked complete.

# Experience Final Polish review

This is a scoped preservation review, not a new design direction, award evaluation or human usability study. The Living Atlas palette, typography, real-geography map, original mascot and existing research contracts remain in place.

## Baseline and reproduced issues

Baseline: `6c009fcf4e2c8cca0902e64c2de7323b39727819`, re-read from public main at the start of this round. Before captures and fresh protected-file hashes were generated from that exact production build. No open pull request was present at the baseline check.

- At 390px in both languages, the homepage repeated the hero's exploration introduction and map disclaimer. The economy selector was visually ahead of the map but later in DOM order.
- ACGF's profile header contained two same-purpose directory returns. The first measured 32px high; the official website was not the only action in its action row.
- Directory summaries were visually clamped to three lines and about 13.44px. Economy names and group micro-labels repeated. Main card actions measured about 40px high.
- Data repeated the same record's displayed value and period across its heading, reading block and metadata. The original values, definitions and source locators must still be available.
- `#/institutions?q=KODIT` produced a 404 rather than the canonical bilingual directory.
- Selected-economy cards used an internal scroll region. Full element rectangles could extend past the clipped region; this was not automatically classified as a real pointer collision. The small selected list now follows normal page flow.

## Implemented changes

- One concise explorer H2, one visible map-purpose caption, no repeated exploration paragraph; economy controls precede the map in DOM and visual order.
- One directory return in the profile header, one primary official-site action. The map return remains distinct. Existing session-storage query/filter/scroll restoration is preserved across profiles, language changes and reloads.
- Frequent navigation, economy, profile, official-site, comparison removal and research-tool controls receive visible 44px minimum targets. No invisible overlay target or globally enlarged footer was added.
- All 21 directory identities and actions remain visible by default. Full original summaries are accessible through native disclosures, with no data rewrite or name truncation.
- Each Data record presents one value/unit, one reporting period and explicit currency, followed by its original definition, own official source and interpretation limits. Raw values, source page/table, original period label, data year and publication year remain in provenance.
- Exact known legacy page paths normalize with `replaceState`, preserving their query and remembered/browser language. Institution detail paths are not misclassified; redirect-like query values cannot cause external navigation.
- A filtered Data empty state explains that no verified records match and offers a reset. It does not invent records.
- At 320px, comparison exports wrap into visible rows instead of hiding most of the JSON button inside a horizontally clipped toolbar.
- The enlarged-text audit exposed low contrast in ACGF metric periods, units and qualifications. These use the existing ink token; qualifications use 16px body text. Research wording and values are unchanged.

## Review groups

1. Home/profile: source and visible 390px before/after review, heading/DOM order, one return, official-site prominence and deep links.
2. Controls/Directory/Data: developer/agent review of actual control rectangles, native checkbox-label targets, full summaries, per-record metadata and raw provenance.
3. Cross-page first-visitor paths: separate English and Traditional-Chinese engineering walkthroughs, plus automated navigation/export/browser regressions. These are not first-time human participants.

The Traditional-Chinese final tour began with Taiwan on the homepage and covered ACGF, a searched directory, cross-language profile reload and return context, five latest ACGF indicators and the two-year history, comparison 2→3→2, 320px exports, an English report export, and standard-mode Taiwan/Japan/Korea. Download content is established by E2E file assertions, not inferred from clicking a button. The separate English tour starts from the legacy KODIT lookup.

The English final tour independently covered legacy KODIT normalization, the preserved Korea filter, full summary, official-site new tab and return; SVG/standard Taiwan/Japan/Korea; ACGF latest/history/provenance; comparison add/remove/export and five report templates. At 1440px it verified the voluntary separately loaded 3D canvas, return to SVG/standard and ACGF identity across language changes/reloads. No new P0/P1 remained in either final engineering tour. Chrome/desktop/mobile emulation is not physical-device or real-human acceptance.

## Target methodology and retained items

The downloadable evidence reports distinct component/purpose families and component/purpose/page-state entries separately from raw observations. Repeated language/viewport instances are not separate defects. It records selectors, actual and visible boxes, nearby spacing, frequency/impact, alternatives and before/after handling.

The local representative matrix (320/390/1440px, both languages) observed 48 component/purpose families before and 49 after, with a new summary disclosure. Families with any observed target below the 44px project goal reduced from 20 to 4; 16 whole families improved, covering 37 state entries. The 3244/3366 raw repeated observations are not defect counts. Every sampled first-priority control reaches 44px. This is a scoped matrix, not a census or conformance claim for every link on the site; exact-head CI repeats it for the release.

44 × 44 CSS px is the project goal for frequent standalone controls. [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) has a 24px minimum with applicable spacing/equivalent/inline/user-agent/essential exceptions; [SC 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) is the enhanced 44px criterion. A bounding box alone does not prove a solid SVG hit area or complete conformance.

Retained P2 considerations:

- Geographic SVG hotspots may be smaller than the project goal, especially around closely spaced economies. Impact: less precise touch selection; frequency: optional spatial exploration. Equivalent native economy selection and large institution-card controls remain available. Preserve geographic position; do not inflate overlapping invisible targets.
- Secondary footer and in-prose research links retain proportionate typography. Impact: less comfortable direct touch than primary actions; frequency: occasional methodology reading. Spacing/inline context and keyboard focus require manual review; priority alone is not a WCAG exception. No blanket accessibility certification is claimed.
- Automated SVG contrast checks can remain incomplete. Inspect labels/plates/focus manually; incomplete is not a pass. Real assistive technology, physical iPhone Safari and native text-only zoom are unverified, not fabricated successes.
- Explicit QA standard mode retains a developer-oriented reason mentioning QA. Impact: wording clarity only; frequency: manual fallback preview; navigation and equivalent selectors work. Retained as an existing P2 rather than expanding this polish into a new copy pass.

## Governance and scope

Fresh before/after checksums cover all `src/data` files and the original Meng-Ge WebP. Membership, official names/URLs, Level 2/3 values, periods, currencies, dictionary, source dates and events are protected. Only the public Knowledge Hub worktree is edited; no private core, main homepage, redirect repository, domain or public-scope setting is modified.

See [acceptance](polish-acceptance.md), [human test kit](usability-test-plan.md) and the exact release PR for measured results and release verification.

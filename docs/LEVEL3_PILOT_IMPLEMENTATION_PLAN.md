# ACSIC Level 3 Verified Data Pilot v1 — Implementation Plan

## Baseline

- Repository: `chaohuang-TW/acsic-knowledge-hub`
- Baseline branch: `main`
- Baseline commit: `c9686d469734df91b95e80553e3ae3a582c9ef39`
- Working branch: `level3-verified-pilot-v1`
- Production Level 3 records at baseline: `0`

## Pilot scope

The production pilot is limited to:

- Japan Finance Corporation (`jfc-jp`)
- Agricultural Credit Guarantee Fund (`acgf-tw`)
- Taiwan Small & Medium Enterprise Credit Guarantee Fund (`tsmeg-tw`)

The frozen pilot indicator set contains:

1. `new_guarantee_volume`
2. `outstanding_guarantee_balance`
3. `number_of_guarantees`
4. `beneficiary_enterprises`
5. `guarantee_coverage_ratio`
6. `partner_financial_institutions`
7. `capital_or_fund_size`

All production records bind to ACSIC Comparative Indicator Dictionary version
`1.0`.

## Source strategy

Research uses public first-party material only: official annual reports,
operational-performance tables, audited financial statements, official
statistics, and official scheme documents. Every published record must retain
the official reported label, value, precision, unit, currency, population and
period. PDF evidence must include a printed page or PDF page index and a table
or section locator.

Search snippets, news coverage, commercial databases, private repositories,
mail, internal reports and unpublished figures are excluded. Missing or
incompatible evidence is represented by a governed readiness or verification
status rather than a fabricated zero.

## Review gates

Every production record must pass:

- research verification;
- schema validation;
- source-registry and page-locator validation;
- period and currency validation;
- comparability review;
- second-pass institution-boundary review; and
- a manual-review gate.

Only `verified` and `verified_with_limitation` records count as obtained
official Level 3 data. Records requiring manual review are excluded from
comparison. Reported values remain primary; normalized values never overwrite
them.

## Delivery sequence

1. Freeze Dictionary v1.0 and establish all 21 institution-by-indicator
   readiness decisions.
2. Add strictly verified production records and their complete provenance.
3. Add the bilingual pilot route, provenance viewer, comparison guards,
   generated reports and automated validation.
4. Run the full local quality gate, publish through a pull request, squash
   merge, and validate GitHub Pages in English, Traditional Chinese, desktop
   and mobile views.

## Rollback plan

The work is isolated on `level3-verified-pilot-v1` and will be merged through a
pull request without force-push. Before merge, rollback is closing the pull
request. After merge, rollback is a normal revert of the squash commit. Source
documents and reported values are immutable evidence; corrective changes use a
new commit and retain the applicable indicator definition version.

## Out of scope

- Production values for KOTEC, CGC Malaysia or any other institution
- Expansion beyond the seven pilot indicators
- Membership, Level 2 standard, reference-set or research-priority changes
- Currency conversion, USD values, rankings or performance scorecards
- Institution-wide coverage ratios synthesized from scheme-specific rates
- Brand, repository, Pages URL, CNAME, analytics, backend or authentication
- Private `acgf-strategy-os`, the personal main site, or the legacy redirect
  repository

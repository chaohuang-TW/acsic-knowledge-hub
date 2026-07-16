# Data Quality Calibration Plan

## Starting state

- Baseline: remote `main` commit `77918451a4192ae2fd053527168e3a19e9be95eb`.
- Membership: 20 formal members, ACGF as the sole observer, 14 countries or economies.
- Baseline coverage: Level 1 21 complete; Level 2 15 complete and 6 partial under the former record-selected denominator; Level 3 0.
- Baseline source reporting: 42 institution-source reference relationships. Deduplicating the two shared rosters and 21 institution profiles yields 23 unique source URLs, but the application did not expose this distinction.
- Baseline bilingual coverage: not measurable because production data mixed localized interface labels with English-only arrays and strings; no governed-content validator existed.
- Known issues: incomplete fields omitted from denominators, unstructured non-applicability, duplicated roster counting, profile-page evidence reused too broadly, untranslated governed content, template claims, access-only confidence and development-state controls in production.

Execution is divided into Phase A (standard and contracts), Phase B (evidence and bilingual calibration), and Phase C (interface, documents, tests and deployment).

Rollback uses the PR boundary: do not merge if CI or live preview validation fails. After merge, revert the calibration merge commit through a normal reviewed PR; never force-push or rewrite unrelated history.

## Scope and invariants

This calibration keeps the fixed ACSIC boundary of 20 formal members plus ACGF as the sole observer. It does not add speculative institutions, Level 3 statistics, private material or non-official substitutes.

## Work sequence

1. Freeze the membership boundary and pre-calibration baseline.
2. Replace record-selected completeness with one versioned Level 2 standard.
3. Separate unique sources, institution-source references and field evidence.
4. Recalculate completeness and confidence from evidence, including access and staleness warnings.
5. Complete bilingual governance for every user-visible data value.
6. Replace internal codes in cards, details, filters, reports and exports with readable labels.
7. Generate coverage documents from production data and enforce them in CI.
8. Validate routes, language memory, filters, comparison, downloads, reports and mobile layout before publication.

## Acceptance gates

- `src/data/level2-standard.json` is the only Level 2 field matrix.
- Every verified applicable field has field-level evidence tied to the source registry.
- Missing and formally non-applicable fields are distinct.
- A complete record has no missing applicable fields, at least three Tier 1 sources, at least three source types, and no critical access or staleness warning.
- English and Traditional Chinese coverage is measured from production content, not a manual claim.
- Level 3 remains unavailable until comparable definitions, units, periods and sources exist.

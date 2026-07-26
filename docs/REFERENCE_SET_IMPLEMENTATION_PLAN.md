# Reference Set Implementation Plan

## Baseline

- Baseline commit: `85cf12a7f5ccc4b4cfe6abbc62eb46e8b0b15e86`
- Baseline coverage: 20 formal members, 1 observer, 14 countries/economies, 21 Level 1 complete.
- Baseline strict Level 2: 1 complete, 19 partial, 1 insufficient.
- Baseline sources and evidence: 33 unique official sources and 203 field-evidence objects.

## Selection and research plan

The reference set is JFC, ACGF, KOTEC, DCGF, JFG, SLECIC and SMEC. It spans policy finance, agricultural guarantee, technology finance guarantee, dual deposit/credit guarantee, federation, export credit insurance/guarantee and SME development roles. Research uses only publicly accessible first-party institutional, statutory, government, annual-report and governance sources.

The implementation adds governed reference-set metadata, a four-factor Research Priority Score, a bilingual comparative indicator dictionary, an empty Level 3 production contract and pilot-readiness assessments.

## Non-goals

- No membership, brand, repository or URL change.
- No reduction of Level 2 requirements or artificial `not applicable` decisions.
- No performance ranking and no claim that unlike definitions are directly comparable.
- No bulk Level 3 values, private data, internal material, private-repository sync or CNAME.

## Rollback

Revert the feature commit or close the feature PR before merge. After merge, use a normal revert PR. Do not force-push or rewrite unrelated history.

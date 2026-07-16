# ACSIC Knowledge Hub

**ACSIC Member Institutions Knowledge Hub**<br>
**亞洲地區信用補充機構聯盟會員知識平台**

Connecting Asia’s Credit Guarantee Knowledge<br>
串聯亞洲信用保證機構、制度與實務知識

An independent bilingual public-data research platform for ACSIC member institutions.<br>
以 ACSIC 會員機構為範圍的獨立雙語公開資料研究平台。

> This is not an official ACSIC website. 本網站不是 ACSIC 官方網站。

## Languages and routes

- English: `/#/en/`
- Traditional Chinese: `/#/zh-TW/`
- English is the international default. A Traditional Chinese browser preference is detected on first visit.
- The language selector stores the last explicit choice in browser local storage.
- No machine-translation service or external translation API is required at runtime.

## Information architecture

- ACSIC Overview
- Member Institutions
- Credit Guarantee Systems
- Knowledge & Practices
- Events & Resources

Comparison, reports, source governance and downloads remain available as research tools. Empty future sections use explicit bilingual states and do not contain invented institutions or systems.

## Multilingual data contract

Institution records are centralized in `src/data/institutions.json`. The contract preserves:

- `name.officialEnglish`: official English name, verbatim
- `name.zh-TW`: official or research Traditional Chinese name
- `name.zhTWTranslationStatus`: `official`, `research_translation`, or `pending`
- `name.aliases`: identity-resolution aliases that never create duplicate institutions
- `summary.en` and `summary.zh-TW`
- `sourceReferences[].originalLanguage`
- `fieldEvidence`: source IDs for each populated Level 2 fact
- role-aware `level2ApplicableFields`, `level2VerifiedFields`, `missingFields` and `notApplicableFields`

## Current production coverage

- Formal members: 20
- Observer: 1 (ACGF)
- Countries / economies: 14
- Institutions: 21
- Level 1: 21/21
- Level 2 complete: 7; partial: 14
- Level 3: no metric is published unless its definition, unit, date and source are complete

See [Member Coverage](docs/ACSIC_MEMBER_COVERAGE.md), [Membership Methodology](docs/ACSIC_MEMBERSHIP_METHODOLOGY.md) and [Institution Type Methodology](docs/INSTITUTION_TYPE_METHODOLOGY.md).

The latest transport-level checks are recorded in [Official URL Validation](docs/SOURCE_URL_VALIDATION.md).

See [Translation Guide](docs/TRANSLATION_GUIDE.md) and [Source Methodology](docs/SOURCE_METHODOLOGY.md).

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test:e2e
```

Repository: `https://github.com/chaohuang-TW/acsic-knowledge-hub`

Current public URL: `https://chaohuang-tw.github.io/acsic-knowledge-hub/`

The repository was renamed from `acgf-strategy-os-demo` on 2026-07-16. See [Repository Migration Report](docs/REPOSITORY_MIGRATION_REPORT.md) for migration and old-URL handling details.

## Research boundaries

- Publicly accessible official sources only.
- No private repository, internal document, personal data or case data is used.
- Unknown fields remain `null`, empty or explicitly pending.
- Institution mandates and data dates differ; comparisons do not rank systems.
- `noindex` and `robots.txt` discourage indexing but are not access controls.

<!-- GENERATED:COVERAGE:START -->

## Current governed coverage

- Formal members: 20; observers: 1; countries/economies: 14; institutions: 21.
- Level 1 complete: 21; strict Level 2 complete: 1; partial: 19; insufficient: 1; reliable Level 3 metrics: 0.
- Source references: 52; unique official sources: 33; field-level evidence objects: 203.
- User-visible governed content bilingual coverage: 100%; official native-language names: 11/21.

<!-- GENERATED:COVERAGE:END -->

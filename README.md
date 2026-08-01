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
- Reference Institutions
- Comparative Indicator Framework

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

## Coverage methodology

The governed coverage block below is generated from production data. Membership, Level 1,
strict Level 2, Level 3, source, evidence, bilingual-content and native-name statistics must
not be maintained manually elsewhere in this README.

See [Member Coverage](docs/ACSIC_MEMBER_COVERAGE.md), [Membership Methodology](docs/ACSIC_MEMBERSHIP_METHODOLOGY.md) and [Institution Type Methodology](docs/INSTITUTION_TYPE_METHODOLOGY.md).

The latest transport-level checks are recorded in [Official URL Validation](docs/SOURCE_URL_VALIDATION.md).

See [Translation Guide](docs/TRANSLATION_GUIDE.md) and [Source Methodology](docs/SOURCE_METHODOLOGY.md).

The current research release is documented in [Reference Institutions](docs/REFERENCE_INSTITUTIONS.md), [Comparative Indicator Methodology](docs/COMPARATIVE_INDICATOR_METHODOLOGY.md), [Research Priority Methodology](docs/RESEARCH_PRIORITY_METHODOLOGY.md), [Level 3 Data Contract](docs/LEVEL3_DATA_CONTRACT.md) and the [Level 3 Pilot Data Report](docs/LEVEL3_PILOT_DATA_REPORT.md).

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
- Level 1 complete: 21; strict Level 2 complete: 4; partial: 16; insufficient: 1; verified Level 3 pilot records: 16.
- Source references: 76; unique official sources: 58; field-level evidence objects: 224.
- User-visible governed content bilingual coverage: 100%; official native-language names: 11/21.

<!-- GENERATED:COVERAGE:END -->

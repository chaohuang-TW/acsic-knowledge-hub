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

- `name.en`: official English name, verbatim
- `name.zh-TW`: official or research Traditional Chinese name
- `summary.en` and `summary.zh-TW`
- `nameTranslationStatus`: `official`, `research_translation`, or `pending`
- `sourceReferences[].originalLanguage`
- verification status, source dates, evidence, analysis and pending research as separate fields

See [Translation Guide](docs/TRANSLATION_GUIDE.md) and [Source Methodology](docs/SOURCE_METHODOLOGY.md).

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test:e2e
```

The current GitHub Pages base remains `/acgf-strategy-os-demo/` while repository renaming is evaluated. See [Repository Rename Assessment](docs/REPOSITORY_RENAME_ASSESSMENT.md).

Current public URL: `https://chaohuang-tw.github.io/acgf-strategy-os-demo/`

## Research boundaries

- Publicly accessible official sources only.
- No private repository, internal document, personal data or case data is used.
- Unknown fields remain `null`, empty or explicitly pending.
- Institution mandates and data dates differ; comparisons do not rank systems.
- `noindex` and `robots.txt` discourage indexing but are not access controls.

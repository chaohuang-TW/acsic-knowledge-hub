# Bilingual Content Standard

## Covered production content

All user-visible governed content must be available in English and Traditional Chinese: institution summaries, roles, legal and governance descriptions, targets, functions, type-specific fields, missing-data labels, evidence summaries, confidence rationales, claims, filters, empty and error states, comparison fields, reports, sources and disclaimers.

Official English institution names remain verbatim. Native-language names are shown only when an institution's own accessible official source supports them; otherwise the status is `pending`. Traditional Chinese names retain `official`, `research_translation` or `pending` status.

## Translation controls

- Curated translations are stored in the data layer, never scattered in components.
- The site has no runtime dependency on machine translation or an external translation API.
- Dates, units, legal citations, official source titles and URLs are not altered by translation.
- A missing translation is a test failure; copying English into Chinese is not considered bilingual completion.
- Verified fact, analysis and pending research remain separate in both languages.

The measured governed-content coverage is generated from production data and is currently 100%. This percentage does not claim that every official source has been translated; source originals remain in their original language.

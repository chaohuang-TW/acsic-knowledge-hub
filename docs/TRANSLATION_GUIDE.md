# Translation Guide

## Purpose

This guide governs English and Traditional Chinese content in ACSIC Knowledge Hub. The platform does not require a machine-translation service or external translation API.

## Name rules

1. Preserve every official English institution name verbatim in `name.en`.
2. Use an institution-published Traditional Chinese name when available and mark `nameTranslationStatus` as `official`.
3. When the platform provides a careful Traditional Chinese rendering, mark it `research_translation`.
4. If no reliable rendering is ready, keep the official English name visible, set the Chinese value to an explicit pending label and mark `pending`.
5. Do not translate abbreviations, legal instrument titles or program names unless an official translation exists.

## Terminology

| English term           | Traditional Chinese preferred term | Guidance                                                                             |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| credit supplementation | 信用補充                           | Use for the broader institutional concept and the formal Chinese rendering of ACSIC. |
| credit guarantee       | 信用保證                           | Use for guarantees that support access to finance.                                   |
| guarantee institution  | 保證機構                           | Use as a generic institutional category, not as a legal classification.              |
| member institution     | 會員機構                           | Use for an institution supported by official membership evidence.                    |
| observer               | 觀察員 / Observer                  | Retain `Observer` in structured status; Chinese prose may use 觀察員.                |
| risk sharing           | 風險分擔                           | Describe the documented allocation of guarantee risk. Do not infer percentages.      |
| guarantee coverage     | 保證範圍 / 保證成數                | Use 保證成數 only for a documented percentage.                                       |
| guarantee fee          | 保證費                             | Retain currency, unit, effective date and source when a rate is recorded.            |
| green finance          | 綠色金融                           | Use only when the official source explicitly defines a green finance measure.        |
| financial inclusion    | 普惠金融                           | Add the original English term when local official terminology is uncertain.          |

## Source language

Every `SourceReference` records `originalLanguage` using a clear BCP 47 language tag when possible, for example `en`, `zh-TW`, `ko` or `ja`. Interface language does not change the source title or quoted institution name.

## Writing rules

- Translate interface labels and research summaries, not the underlying official record.
- Keep verified fact, analysis and pending research visibly separate in both languages.
- Dates, units, legal citations and URLs must not change during translation.
- Avoid wording that implies ACSIC endorsement or official status.
- If the two language versions diverge, correct the evidence first, then update both versions together.

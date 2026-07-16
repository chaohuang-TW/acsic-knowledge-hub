# Translation Guide

## Purpose

This guide governs English and Traditional Chinese content in ACSIC Knowledge Hub. The platform does not require a machine-translation service or external translation API.

## Name rules

1. Preserve every official English institution name verbatim in `name.officialEnglish`.
2. Use an institution-published Traditional Chinese name when available and mark `name.zhTWTranslationStatus` as `official`.
3. When the platform provides a careful Traditional Chinese rendering, mark it `research_translation`.
4. If no reliable rendering is ready, keep the official English name visible, set the Chinese value to an explicit pending label and mark `pending`.
5. Do not translate abbreviations, legal instrument titles or program names unless an official translation exists.

## Terminology

| English term                       | Traditional Chinese preferred term | Guidance                                                                             |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| credit supplementation             | 信用補充                           | Use for the broader institutional concept and the formal Chinese rendering of ACSIC. |
| credit guarantee                   | 信用保證                           | Use for guarantees that support access to finance.                                   |
| guarantee institution              | 保證機構                           | Use as a generic institutional category, not as a legal classification.              |
| member institution                 | 會員機構                           | Use for an institution supported by official membership evidence.                    |
| observer                           | 觀察員 / Observer                  | Retain `Observer` in structured status; Chinese prose may use 觀察員.                |
| risk sharing                       | 風險分擔                           | Describe the documented allocation of guarantee risk. Do not infer percentages.      |
| guarantee coverage                 | 保證範圍 / 保證成數                | Use 保證成數 only for a documented percentage.                                       |
| guarantee fee                      | 保證費                             | Retain currency, unit, effective date and source when a rate is recorded.            |
| green finance                      | 綠色金融                           | Use only when the official source explicitly defines a green finance measure.        |
| financial inclusion                | 普惠金融                           | Add the original English term when local official terminology is uncertain.          |
| credit insurance                   | 信用保險                           | Keep distinct from credit guarantee.                                                 |
| guarantee corporation              | 信用保證公司                       | A research label unless the institution publishes an official Chinese name.          |
| guarantee fund                     | 信用保證基金                       | Do not infer legal form from the English word `Fund` alone.                          |
| guarantee federation               | 信用保證聯合會                     | Use for coordinating federations, not direct guarantee providers.                    |
| guarantee association              | 信用保證協會                       | Use for member associations.                                                         |
| policy-based financial institution | 政策金融機構                       | Preserve the official English description in evidence.                               |
| guarantee ceiling                  | 保證上限                           | Requires programme, unit, date and source.                                           |
| technology appraisal               | 技術評價                           | Keep distinct from credit assessment.                                                |
| export credit insurance            | 出口信用保險                       | Use for export payment-risk insurance.                                               |
| agricultural credit guarantee      | 農業信用保證                       | Use for agriculture-specific guarantee mandates.                                     |

## Source language

Every `SourceReference` records `originalLanguage` using a clear BCP 47 language tag when possible, for example `en`, `zh-TW`, `ko` or `ja`. Interface language does not change the source title or quoted institution name.

## Writing rules

- Translate interface labels and research summaries, not the underlying official record.
- Keep verified fact, analysis and pending research visibly separate in both languages.
- Dates, units, legal citations and URLs must not change during translation.
- Avoid wording that implies ACSIC endorsement or official status.
- If the two language versions diverge, correct the evidence first, then update both versions together.

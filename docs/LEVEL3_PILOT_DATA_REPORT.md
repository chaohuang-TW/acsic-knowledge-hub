# ACSIC Level 3 Verified Data Pilot — Data Report

## Current v1.1 addition — 2026-09-21

The frozen v1.1 dictionary adds the institution-specific `guaranteed_loan_volume`
indicator for ACGF. The current pilot now has 18 verified production records
across eight indicator IDs; the two records below are additive and do not
replace the v1.0 historical records.

| Institution | Indicator              | Official reported value | Original unit             | Period | Official source and locator                                                                                                    | Normalized reference   |
| ----------- | ---------------------- | ----------------------: | ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| ACGF        | Guaranteed Loan Volume |              25,245,745 | 新臺幣千元 / TWD thousand | CY2024 | [信用保證業務－保證績效](https://www.acgf.org.tw/Page/PageEditor/I6YASZTJ3SLERIRHG52SZEOYWU), table row `貸款金額`, 113 column | 25,245.745 TWD million |
| ACGF        | Guaranteed Loan Volume |              23,928,298 | 新臺幣千元 / TWD thousand | CY2025 | Same official page, table row `貸款金額`, 114 column; accompanying 114-year narrative calls it `保證貸款金額`                  | 23,928.298 TWD million |

The source states that monetary values are in New Taiwan dollars thousand. Its
separate 2025 `保證金額` row is 18,480,910 and remains the existing
`new_guarantee_volume` record; it is not overwritten or treated as loan volume.
For 2024, the exact table field label is `貸款金額`; the source does not print
an explicit publication date, so the registry keeps that date null. The
supplied 2025 annual-report URL returned 404 and is not used as evidence.

## Original v1.0 baseline scope

- Institutions: JFC, ACGF and TSMEG only
- Indicators: seven
- Dictionary: ACSIC Comparative Indicator Dictionary v1.0
- Production records: 12
- Verification outcomes across all 21 readiness decisions: 6 verified, 6
  verified with limitation, 3 definition mismatches, 3 scheme-specific, 2 not
  disclosed and 1 requiring manual review

## Original v1.0 record results

| Institution | Indicator                      | Status                   | Official reported value | Original unit / currency     | Period                      | Official source                   | Page / section                         | Normalization                              | Comparability  |
| ----------- | ------------------------------ | ------------------------ | ----------------------: | ---------------------------- | --------------------------- | --------------------------------- | -------------------------------------- | ------------------------------------------ | -------------- |
| JFC         | New Guarantee Volume           | verified_with_limitation |                 8,309.6 | billion yen / JPY            | FY2024                      | JFC 2025 Operational Performances | printed p. 79; PDF index 12            | definition mapping; 8,309,600 JPY million  | reference only |
| JFC         | Outstanding Guarantee Balance  | verified_with_limitation |                34,525.9 | billion yen / JPY            | 2025-03-31                  | JFC 2025 Operational Performances | printed p. 79; PDF index 12            | definition mapping; 34,525,900 JPY million | reference only |
| ACGF        | New Guarantee Volume           | verified                 |              19,407,404 | TWD thousand / TWD           | CY2024                      | 2024 ACGF Annual Report           | printed p. 23; PDF index 25; table 5-1 | unit conversion; 19,407.404 TWD million    | reference only |
| ACGF        | Outstanding Guarantee Balance  | verified                 |              63,380,511 | TWD thousand / TWD           | 2024-12-31                  | 2024 ACGF Annual Report           | printed p. 23; PDF index 25; table 5-1 | unit conversion; 63,380.511 TWD million    | reference only |
| ACGF        | Number of Guarantees           | verified                 |                  19,638 | cases                        | CY2024                      | 2024 ACGF Annual Report           | printed p. 23; PDF index 25; table 5-1 | direct                                     | reference only |
| ACGF        | Capital / Fund Size            | verified_with_limitation |              10,818,942 | TWD thousand / TWD           | to 2024-12-31               | 2024 ACGF Annual Report           | printed p. 7; PDF index 9              | unit conversion; contributed capital       | not comparable |
| TSMEG       | New Guarantee Volume           | verified                 |               1,487,527 | TWD million / TWD            | CY2025                      | TSMEG Performance                 | 114年 > 承保 > 金額                    | direct                                     | reference only |
| TSMEG       | Outstanding Guarantee Balance  | verified                 |            1,485,949.10 | TWD million / TWD            | 2025-12-31                  | TSMEG 2025 Annual Report          | printed p. 6; PDF index 7              | direct                                     | reference only |
| TSMEG       | Number of Guarantees           | verified                 |                 371,159 | cases                        | CY2025                      | TSMEG Performance                 | 114年 > 承保 > 件數                    | direct                                     | reference only |
| TSMEG       | Beneficiary Enterprises        | verified_with_limitation |                 276,260 | reported enterprise accounts | CY2025                      | TSMEG 2025 Annual Report          | preface; PDF index 2                   | definition mapping                         | not comparable |
| TSMEG       | Partner Financial Institutions | verified_with_limitation |           official list | named institutions           | 2025-12-31                  | TSMEG 2025 Annual Report          | printed pp. 8–9; PDF indexes 9–10      | derived count: 41                          | not comparable |
| TSMEG       | Capital / Fund Size            | verified_with_limitation |                1,777.09 | TWD hundred million / TWD    | establishment to 2025-12-31 | TSMEG 2025 Annual Report          | printed p. 3; PDF index 4              | unit conversion; contributed capital       | not comparable |

## Original v1.0 missing results

- JFC: insurance-acceptance count is not disclosed; direct-loan borrower counts
  are definition mismatches; partner-financial-institution and
  credit-insurance-capital concepts are incompatible with the pilot definition.
- ACGF: no deduplicated annual beneficiary population was found. The partner
  list groups all farmers' and fishers' association credit departments and
  therefore requires manual review before a total can be published.
- All three institutions: coverage is scheme-specific. No institution-wide
  synthetic percentage is published.

## Original v1.0 cross-institution findings

The provenance chain succeeds, but no pilot monetary chart is valid: JFC uses
JPY and an FY credit-insurance recognition basis, ACGF uses CY2024 TWD, and
TSMEG uses CY2025 TWD. Capital concepts and beneficiary populations also differ.
The records therefore support source-traceable research on disclosure practice,
not performance comparison or ranking.

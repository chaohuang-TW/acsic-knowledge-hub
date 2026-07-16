# Data Quality Audit

Audit date: 2026-07-16. Membership scope: unchanged at 20 formal members, one observer and 14 countries or economies.

## Before and after

Before calibration, each record supplied its own `level2ApplicableFields`; completion was the number of verified selected fields divided by that record-selected list. Profile-page access also drove confidence directly. After calibration, all records inherit 12 common fields plus their centralized role matrix, with exclusions allowed only through governed non-applicability records. Complete status also requires field evidence, source depth and no critical warning.

| Measure                        |                  Before calibration | After calibration |
| ------------------------------ | ----------------------------------: | ----------------: |
| Level 1 complete               |                                  21 |                21 |
| Level 2 complete               |                                  15 |                 1 |
| Level 2 partial                |                                   6 |                19 |
| Level 2 insufficient           |                       not separated |                 1 |
| Reliable Level 3 metrics       |                                   0 |                 0 |
| Unique official sources        |             not separately reported |                33 |
| Institution-source references  |              conflated with sources |                52 |
| Field-evidence objects         |             not separately reported |               203 |
| Governed bilingual coverage    | not measured from production values |              100% |
| Official native-language names |            not conservatively gated |          11 of 21 |

## Per-institution recalculation

| Institution   | Before   | After        | After coverage | Missing applicable fields |
| ------------- | -------- | ------------ | -------------: | ------------------------: |
| CGCC          | complete | partial      |            56% |                         8 |
| CGTMSE        | partial  | partial      |            50% |                         9 |
| ASIPPINDO     | partial  | partial      |            53% |                         8 |
| ASKRINDO      | partial  | insufficient |            11% |                        16 |
| JFC           | complete | complete     |           100% |                         0 |
| JFG           | complete | partial      |            76% |                         4 |
| KODIT         | complete | partial      |            50% |                         9 |
| KOREG         | partial  | partial      |            41% |                        10 |
| KOTEC         | complete | partial      |            75% |                         4 |
| OJSCGF        | complete | partial      |            44% |                        10 |
| CGC           | complete | partial      |            44% |                        10 |
| CGFM          | partial  | partial      |            39% |                        11 |
| DCGF          | complete | partial      |            75% |                         4 |
| SMEC          | complete | partial      |            75% |                         4 |
| CGCPNG        | complete | partial      |            44% |                        10 |
| PHILGUARANTEE | complete | partial      |            56% |                         8 |
| CBSL          | partial  | partial      |            63% |                         6 |
| SLECIC        | complete | partial      |            75% |                         4 |
| TSMEG         | complete | partial      |            44% |                        10 |
| TCG           | complete | partial      |            50% |                         9 |
| ACGF          | complete | partial      |            75% |                         4 |

## Institution disposition

- **JFC** remains complete. Additional Japanese profile, governance and official publication evidence closes all common and policy-finance fields and satisfies source-depth gates.
- **ASKRINDO** changes from partial to insufficient because its critical official company-profile path is temporarily unavailable; the native name is now pending instead of indirectly asserted.
- **CGCC, JFG, KODIT, KOTEC, OJSCGF, CGC, DCGF, SMEC, CGCPNG, PHILGUARANTEE, SLECIC, TSMEG, TCG and ACGF** are downgraded from complete to partial because the prior record-selected denominator omitted one or more applicable common or role fields and/or lacked the minimum source-depth gate.
- **CGCC, CGTMSE, ASIPPINDO, JFG, KODIT, KOREG, KOTEC, OJSCGF, CGC, CGFM, DCGF, SMEC, CGCPNG, PHILGUARANTEE, CBSL, SLECIC, TSMEG, TCG and ACGF** are partial under the shared denominator. Their populated facts remain, but at least one applicable governance, funding, geographic, publication, delivery or role-specific field lacks direct official evidence.

No record was upgraded from partial to complete. JFC retains complete status rather than being upgraded: new official Japanese profile, governance and publication evidence supports its previously missing supervision, capital, publication and scope fields. KOTEC, PHILGUARANTEE and DCGF gained official law or native-language evidence, but remain partial because unresolved applicable fields stay in the denominator.

## Key corrections

- The previous per-record denominator was replaced by a versioned common and role-specific standard.
- Shared roster sources were deduplicated; reference and evidence counts are now separate.
- JFC and JFG native names now include their official Japanese legal forms.
- KODIT, KOTEC and DCGF native names point to native-language official pages.
- Internal role, field, source and evidence codes are no longer exposed in human-facing views or reports.
- Confidence now responds to source depth, diversity, staleness and access failure.

## Unresolved gaps

Most gaps concern governance structure, funding or capital basis, geographic scope, official publications, guarantee delivery, participating finance providers and risk-sharing descriptions. CGFM has the most missing applicable fields (11); KOREG, OJSCGF, CGC, CGCPNG and TSMEG each have 10. ASKRINDO's profile is temporarily unavailable and ASIPPINDO's history page carries the sole staleness warning. These conditions remain visible instead of being replaced with non-official mirrors. Level 3 metrics—coverage ratios, fees, ceilings, guarantee volumes, beneficiary counts and comparable performance measures—remain out of scope until definitions, units, dates and cross-institution comparability are documented.

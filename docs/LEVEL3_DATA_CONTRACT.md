# Level 3 Data Contract

The Level 3 production contract preserves a traceable chain from an official
publication to a governed Knowledge Hub indicator. Its primary object is the
reported layer. Normalization is additive and may never overwrite the official
label, value, precision, unit, currency, population or period.

## Identity and dictionary binding

Every record has a stable `recordId`, `institutionId`, `indicatorId` and
`indicatorDefinitionVersion`. Pilot v1 records bind to ACSIC Comparative
Indicator Dictionary version `1.0`; a later dictionary definition is never
silently applied to historical records.

## Reported layer

`reported` contains the exact official label, numeric value or official list,
unit, original currency, period label, population and bilingual definition.
The original source language remains in the source registry. A null reported
value is permitted only for a governed derivation from an official list.

## Normalized layer

`normalized` records the Knowledge Hub indicator, value, unit, currency,
method, bilingual notes and one status:

- `direct`
- `unit_conversion`
- `counted_from_official_list`
- `definition_mapping`
- `not_normalized`

Unit conversion preserves the reported precision and original layer. Pilot v1
does not convert currencies: every `convertedValue` is `null`.

## Period and scheme

`period` distinguishes fiscal year, calendar year, point-in-time and cumulative
records. Flow indicators require `periodStart` and `periodEnd`; stock indicators
require `asOfDate`; cumulative values require an explicit starting point.

`scheme` prevents a programme-specific value from becoming an institution-wide
statistic. Coverage ratios additionally require scheme, rate range, numerator,
denominator, borrower, loan and effective-date metadata before a numeric record
can be published.

## Source and provenance

`source` binds each record to a registered official source, page or section,
table or figure, optional zero-based PDF page index, publication date and
verification date. PDF records must include a usable page locator.

Derived records also store `isDerived`, method, input source IDs, calculation
and calculation date. Pilot v1 permits one derived partner-institution count;
its official list and exclusion rule remain visible.

## Comparability and verification

`comparability` records a status, level and bilingual issues. A value marked
`reference_only` or `not_comparable` cannot become a ranking or unqualified
chart. Different currencies, periods, recognition bases, counting units,
capital concepts, flows and stocks are guarded separately.

Production verification statuses are:

- `verified`
- `verified_with_limitation`
- `scheme_specific`
- `definition_mismatch`
- `not_disclosed`
- `not_applicable`
- `source_unavailable`
- `requires_manual_review`

Only the first two count as obtained official Level 3 data. Every production
record also passes the research, schema, source and comparability gates. Records
with `manualReviewRequired: true` remain visible as pending and are excluded
from comparison.

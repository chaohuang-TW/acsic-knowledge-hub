# Indicator Versioning Policy

The frozen pilot dictionary is **ACSIC Comparative Indicator Dictionary v1.0**.
Every Level 3 record stores `indicatorDefinitionVersion`.

## Semantic versioning

- Patch (`1.0.1`): typo, formatting or translation correction that does not
  change the population, recognition basis, period, unit, numerator,
  denominator, aggregation or comparison result.
- Minor (`1.1`): backward-compatible metadata or guidance addition. Existing
  records remain valid under their stored version; they are not relabelled.
- Major (`2.0`): any definition-breaking change, including population,
  recognition basis, time basis, capital concept, formula, allowed aggregation
  or comparability rule.

Renaming the two previously unversioned draft IDs to
`beneficiary_enterprises` and `capital_or_fund_size` occurs before the v1.0
freeze and is not a migration of production data; the baseline contained zero
production values.

## Historical records

Historical records retain the version under which they were verified.
Migration requires a new reviewed record or an explicit migration object that
preserves the old value, definition, source and decision. Silent version
replacement is prohibited.

## Comparison compatibility

Records are comparable only when their indicator definition versions are
declared compatible and their value concept, period, unit, currency,
recognition basis and population also pass review. A patch is compatible by
default. Minor versions require a documented compatibility decision. Major
versions are incompatible by default.

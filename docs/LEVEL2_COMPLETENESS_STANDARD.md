# Strict Level 2 Completeness Standard

Version: `2026-07-16-v1`. The executable field matrix is `src/data/level2-standard.json`; this document explains it and does not redefine it.

## Common fields

Every institution is assessed against 12 common fields: establishment year, legal basis, ownership or legal status, supervision or oversight, mandate, service targets, major functions, governance type, funding or capital basis, geographic scope, official publications and ACSIC role notes.

Role-specific fields are added from the institution's governed role category. The matrix covers direct guarantee corporations and funds, associations and federations, policy-finance institutions, technology-finance guarantee institutions, dual deposit-and-credit guarantee funds, central banks, SME development agencies, export credit insurers and guarantors, and agricultural guarantee funds.

## Denominator and states

`completion = verified applicable fields / applicable required fields`.

- A missing applicable field remains in the denominator.
- A field is excluded only by a structured `notApplicableFields` record with a bilingual reason, methodology or official-source basis, source IDs and review date.
- `complete` requires zero missing applicable fields, at least three Tier 1 sources, at least three source types, and no critical unavailable or stale source.
- `insufficient` applies when no more than one required field is verified or a critical profile source is unavailable.
- All other assessed records are `partial`; unassessed records would be `not_assessed`.

Confidence is separate from completeness. Its score combines evidence coverage, Tier 1 depth and source diversity, with deductions for stale or unavailable critical sources. A high-confidence record must also be complete.

## Why the prior result changed

The prior 15 complete / 6 partial result used record-level applicable-field selections and did not require source-depth gates. The strict recalculation uses a common denominator plus role fields, so unsupported governance, funding, publications and scope fields remain visible. It produces 1 complete, 19 partial and 1 insufficient record without changing the membership roster.

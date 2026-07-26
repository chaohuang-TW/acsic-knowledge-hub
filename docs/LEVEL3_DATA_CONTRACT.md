# Level 3 Data Contract

`Level3IndicatorRecord` is the future production contract. It preserves:

- institution and indicator IDs;
- original value, unit, currency and reported currency;
- optional converted value, exchange rate, rate date and conversion source;
- reporting-period type, fiscal year, start/end dates and as-of date;
- publication and source-verification dates;
- the definition used, source ID and page/section;
- verification status and bilingual comparability assessment.

Original-currency values are authoritative. A converted value must never replace them and requires an exchange-rate source and date. Calendar year, fiscal year, year-to-date, point-in-time and cumulative periods remain distinct.

`productionLevel3Values` is intentionally empty. Test fixtures must not enter production data.

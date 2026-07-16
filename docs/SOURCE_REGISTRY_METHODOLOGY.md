# Source Registry Methodology

## Three separate counts

1. **Unique official source**: one deduplicated record in `src/data/sources.json`, identified by `sourceId`.
2. **Source reference**: one institution-to-source relationship stored as a source ID on an institution. A shared ACSIC roster is one source but may be referenced by many institutions.
3. **Field evidence**: one assertion-to-source link with a field name, title, page or section, bilingual evidence summary and verification date.

These counts must never be presented as interchangeable. Current production data contains 33 unique official sources, 52 institution-source references and 203 field-evidence objects.

## Registry requirements

Every source stores title, publisher, standardized source type, tier, original and resolved HTTPS URL, original language, publication or document date when known, access date, page or section, access state, staleness warning, primary-source flag and bilingual notes.

Supported source types are official membership roster, institution profile, governance document, and law or regulation. Search results are discovery aids only. A temporarily unavailable official page remains in the registry with a warning and cannot serve as sole high-confidence evidence.

User interfaces and human-readable exports show source titles, sections, dates and links. Internal source and evidence IDs remain available only in structured JSON and the repository data contract.

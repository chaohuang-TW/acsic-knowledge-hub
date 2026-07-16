# Institution Type Methodology

ACSIC members are not modelled as identical guarantee funds. `institutionRoleCategory` describes the official legal and operational role supported by source evidence.

| Category                                 | Role-aware research fields                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Credit guarantee corporation/fund        | delivery model, participating financial institutions, borrowers, guarantee categories, funding and risk sharing              |
| Guarantee association/federation         | member composition, coordination, representation, shared services and training                                               |
| Policy finance institution               | policy-finance role, credit-insurance role, business units and relationship with private finance                             |
| Technology finance guarantee institution | guarantee role, technology appraisal, investment and transfer services                                                       |
| Deposit and credit guarantee fund        | deposit guarantee and credit guarantee roles kept distinct                                                                   |
| Central bank                             | central-bank mandate and scheme-specific credit/refinance role; no assumption that the whole bank is a guarantee corporation |
| SME development agency                   | development, formalisation, training and financial-access role; guarantee ratios are not imposed                             |
| Export credit insurer and guarantor      | export insurance, bank guarantees, exporter support and legal mandate                                                        |
| Agricultural credit guarantee fund       | agriculture-specific mandate, eligible sectors, partner finance and policy role                                              |

The common denominator and every role matrix are versioned in `src/data/level2-standard.json`. A record cannot choose a smaller field set. `notApplicableFields` excludes a field only when it records a bilingual reason, basis, supporting sources and review date; otherwise an unverified applicable field remains missing. Cross-role comparison shows a comparability warning and cannot be used to rank institutional performance.

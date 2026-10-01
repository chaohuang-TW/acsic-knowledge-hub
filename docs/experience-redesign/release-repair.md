# Scoped release repair

This is the explicitly authorized small follow-up to PR #27, not another redesign or research phase.

- Base: `34fce0fa89a360049a5825dfe4ba7177d522f407` (merged PR #27).
- Branch: `experience-release-repair`.
- Original visual/evidence baseline remains `6c009fcf4e2c8cca0902e64c2de7323b39727819` so before/after evidence does not silently change its reference.
- The main CI performance failures are retained as failed measurements. They are not relabeled or replaced by repeated unchanged retries.

## Changes

Only the network explorer is code-split. The homepage title, search, navigation and membership counts remain immediately available. Counts still come from the canonical institution records. An unanimated, bilingual loading status reserves the existing map aspect ratio; the complete SVG explorer remains the default after loading. The existing page-load error recovery and optional 3D boundary remain in place.

Shareable evidence no longer needs Git author/committer metadata or source diffs. Playwright capture is disabled at its source, recognized incidental metadata is removed defensively from copies, and a security scan must pass before an evidence ZIP or safe diagnostic copy is uploaded. Assertions, aggregate results, source identities and commit SHA fields are preserved. Existing historical artifacts are not deleted or presented as newly sanitized evidence.

## Unchanged boundaries

- Mobile score ≥90; desktop score ≥95; LCP ≤2.5s; CLS ≤0.1; three cold runs per profile under the same fixed throttling.
- No indicator definition, value, year, unit, official source, institution, membership status, mascot or data contract is changed.
- No new runtime dependency, machine-translation service, tracking service, Pages workflow, domain, repository visibility or external storage destination is introduced.
- The private core repository and personal main website are out of scope and untouched.
- Real first-time participants, physical iPhone Safari and native browser text zoom remain pending, not engineering passes.

## Release evidence

Fresh local comparison against the follow-up base, measured sequentially with three cold runs per profile:

| Metric                               |  Base `34fce0f` | Repair production build |
| ------------------------------------ | --------------: | ----------------------: |
| Mobile median score / LCP            | 100 / 1223.59ms |          100 / 979.46ms |
| Desktop median score / LCP           |  94 / 1233.06ms |           97 / 950.38ms |
| Mobile / desktop median CLS          |           0 / 0 |              0 / 0.0002 |
| Complete initially requested JS gzip |        126399 B |                126347 B |

The critical entry itself falls from 126399 B to 97713 B gzip; the deferred explorer adds 28634 B, so total requested JavaScript is essentially unchanged. This is a first-paint dependency improvement, not a claim that the full explorer requires less code. Local measurements identify an uncommitted production build; exact-head CI remains authoritative for the committed release. All eight new blocked-chunk bilingual/viewport browser cases passed locally.

The follow-up PR records the exact candidate SHA, complete CI result, measured before/after performance, artifact download/digest/expiration, merged release SHA, main CI, completed Pages deployment and bilingual production read-back. The downloadable main artifact's manifest identifies its exact source checkout; a candidate artifact is not a substitute for deployed-main verification.

The final release must verify every deployed build asset against the main artifact's hashes and actually exercise both language versions, institution lookup and return, Taiwan/Japan/Korea selection, historical data and downloads. Neither a successful HTTP response nor candidate CI alone establishes production acceptance.

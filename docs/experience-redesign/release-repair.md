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

The first PR head passed all 209 unit and 180 Linux browser cases, but its safe trace upload correctly failed closed. Real trace preflight exposed extensionless text attachments, compressed-image false positives and screenshot-resource identifiers that resemble addresses. The repair distinguishes valid text from unchanged binary bytes and preserves recognized Playwright source/screenshot references. Actual read-back of 48 traces verified 1428 members, 1089 byte-identical binary resources, 171 structured members and 1086 retained SHA references; failed test observations were not converted into passes.

A frozen local rerun passed all 175 Chromium/mobile/WebKit cases with zero skips or flaky cases. The existing ten language/viewport target groups now use separate language test cases instead of sharing one 30-second budget; all widths, route flows, dimensions and assertions are unchanged, as are per-case timeouts. Local macOS Firefox cannot launch in this environment; the final exact-head Linux CI must execute those seven cases, too.

The [follow-up PR #28](https://github.com/chaohuang-TW/acsic-knowledge-hub/pull/28) records the exact candidate SHA, complete CI result, measured before/after performance, artifact download/digest/expiration, merged release SHA, main CI, completed Pages deployment and bilingual production read-back. The downloadable main artifact's manifest identifies its exact source checkout; a candidate artifact is not a substitute for deployed-main verification.

The next exact-head run passed 210 unit and 182 Linux browser cases and measured mobile 100 / desktop 97, but correctly failed its accessibility gate: the deferred loading canvas overflowed by 4px at the 768px breakpoint in both languages. Its inherited 29rem minimum height expanded the aspect-ratio box beyond its container. A skeleton-only width/min-height rule fixes that state without clipping content or changing the real explorer. Blocked-chunk cases now include 768px and assert both document and body bounds while loading; the 144-case accessibility matrix and its overflow gate remain unchanged.

The repaired frozen local build passed all 179 Chromium/mobile/WebKit cases (zero skips, unexpected or flaky cases). Its old 150ms accessibility scan reported zero findings, but raw read-back later proved 112 samples only scanned a page-loading shell and 16 home samples still contained the explorer skeleton. This is retained as insufficient coverage, not a full-route accessibility pass.

The next exact-head CI passed all 210 unit and 186 Linux browser cases (zero skips/flaky cases) and the performance gate, but revealed real profile metadata contrast ratios of 3.63/3.85 in 14 non-enlarged samples. The four affected text groups now use the existing opaque institution-muted token. Audits use bounded real-heading/explorer readiness instead of assuming a fixed delay means a page is rendered, and fail closed on unavailable content or axe errors. Both builds use the same current audit tool and record their build SHA. The same 144 routes/viewports, contrast threshold and overflow checks remain; loading-state geometry remains covered by deliberately blocked-chunk tests. Earlier zero-findings scans are not relabeled as complete passes.

The final frozen local rendered-content matrix verified 144/144 ready routes, zero axe violations, zero horizontal overflow and zero page errors. `pnpm check` passed 215 unit/governance tests, including five readiness regressions. The full 179 Chromium/mobile/WebKit run passed with zero skips/flaky cases; its 12 deliberately held/released explorer cases also confirm that complete-page readiness rejects a loading explorer and accepts its real rendered content. Final exact-head Linux CI, main artifact and production verification remain authoritative for release completion.

The final release must verify every deployed build asset against the main artifact's hashes and actually exercise both language versions, institution lookup and return, Taiwan/Japan/Korea selection, historical data and downloads. Neither a successful HTTP response nor candidate CI alone establishes production acceptance.

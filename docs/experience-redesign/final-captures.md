# ACSIC Knowledge Hub production-build review

- Captured: 2026-10-01T02:41:08.132Z
- Base checkout commit: `98a0cb0b134d14215c5173d06654cceaa5b73f7f` (working-tree presentation is captured before release)
- Base URL: http://127.0.0.1:4176/acsic-knowledge-hub/
- Screenshots and raw observations are retained in the external experience-audit artifact bundle.
- Viewports: desktop 1440×1000; mobile 390×844

This is an observed browser capture for the Award-Caliber Experience Rebuild. It records rendering and interaction behaviour; it is not by itself a release-quality claim.

## Coverage matrix

| Locale | Viewport | Case               | Hash after capture                         | First-screen screenshot                                         | Full-page screenshot                                         |
| ------ | -------- | ------------------ | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------ |
| en     | desktop  | home               | `#/en/`                                    | `screenshots/en-home-desktop-first-screen.png`                  | `screenshots/en-home-desktop-full-page.png`                  |
| en     | desktop  | selectedTaiwan     | `#/en/`                                    | `screenshots/en-selectedTaiwan-desktop-first-screen.png`        | `screenshots/en-selectedTaiwan-desktop-full-page.png`        |
| en     | desktop  | map                | `#/en/`                                    | `screenshots/en-map-desktop-first-screen.png`                   | `screenshots/en-map-desktop-full-page.png`                   |
| en     | desktop  | directory          | `#/en/members`                             | `screenshots/en-directory-desktop-first-screen.png`             | `screenshots/en-directory-desktop-full-page.png`             |
| en     | desktop  | acgf               | `#/en/institutions/acgf-tw`                | `screenshots/en-acgf-desktop-first-screen.png`                  | `screenshots/en-acgf-desktop-full-page.png`                  |
| en     | desktop  | sparseKOTEC        | `#/en/institutions/kotec-kr`               | `screenshots/en-sparseKOTEC-desktop-first-screen.png`           | `screenshots/en-sparseKOTEC-desktop-full-page.png`           |
| en     | desktop  | compare            | `#/en/compare`                             | `screenshots/en-compare-desktop-first-screen.png`               | `screenshots/en-compare-desktop-full-page.png`               |
| en     | desktop  | data               | `#/en/data-pilot`                          | `screenshots/en-data-desktop-first-screen.png`                  | `screenshots/en-data-desktop-full-page.png`                  |
| en     | desktop  | systems            | `#/en/systems`                             | `screenshots/en-systems-desktop-first-screen.png`               | `screenshots/en-systems-desktop-full-page.png`               |
| en     | desktop  | resources          | `#/en/resources`                           | `screenshots/en-resources-desktop-first-screen.png`             | `screenshots/en-resources-desktop-full-page.png`             |
| en     | desktop  | unknownInstitution | `#/en/institutions/unknown-governed-id`    | `screenshots/en-unknownInstitution-desktop-first-screen.png`    | `screenshots/en-unknownInstitution-desktop-full-page.png`    |
| en     | desktop  | unknownRoute       | `#/en/not-a-real-route`                    | `screenshots/en-unknownRoute-desktop-first-screen.png`          | `screenshots/en-unknownRoute-desktop-full-page.png`          |
| en     | desktop  | standardExplorer   | `#/en/`                                    | `screenshots/en-standardExplorer-desktop-first-screen.png`      | `screenshots/en-standardExplorer-desktop-full-page.png`      |
| zh-TW  | desktop  | home               | `#/zh-TW/`                                 | `screenshots/zh-TW-home-desktop-first-screen.png`               | `screenshots/zh-TW-home-desktop-full-page.png`               |
| zh-TW  | desktop  | selectedTaiwan     | `#/zh-TW/`                                 | `screenshots/zh-TW-selectedTaiwan-desktop-first-screen.png`     | `screenshots/zh-TW-selectedTaiwan-desktop-full-page.png`     |
| zh-TW  | desktop  | map                | `#/zh-TW/`                                 | `screenshots/zh-TW-map-desktop-first-screen.png`                | `screenshots/zh-TW-map-desktop-full-page.png`                |
| zh-TW  | desktop  | directory          | `#/zh-TW/members`                          | `screenshots/zh-TW-directory-desktop-first-screen.png`          | `screenshots/zh-TW-directory-desktop-full-page.png`          |
| zh-TW  | desktop  | acgf               | `#/zh-TW/institutions/acgf-tw`             | `screenshots/zh-TW-acgf-desktop-first-screen.png`               | `screenshots/zh-TW-acgf-desktop-full-page.png`               |
| zh-TW  | desktop  | sparseKOTEC        | `#/zh-TW/institutions/kotec-kr`            | `screenshots/zh-TW-sparseKOTEC-desktop-first-screen.png`        | `screenshots/zh-TW-sparseKOTEC-desktop-full-page.png`        |
| zh-TW  | desktop  | compare            | `#/zh-TW/compare`                          | `screenshots/zh-TW-compare-desktop-first-screen.png`            | `screenshots/zh-TW-compare-desktop-full-page.png`            |
| zh-TW  | desktop  | data               | `#/zh-TW/data-pilot`                       | `screenshots/zh-TW-data-desktop-first-screen.png`               | `screenshots/zh-TW-data-desktop-full-page.png`               |
| zh-TW  | desktop  | systems            | `#/zh-TW/systems`                          | `screenshots/zh-TW-systems-desktop-first-screen.png`            | `screenshots/zh-TW-systems-desktop-full-page.png`            |
| zh-TW  | desktop  | resources          | `#/zh-TW/resources`                        | `screenshots/zh-TW-resources-desktop-first-screen.png`          | `screenshots/zh-TW-resources-desktop-full-page.png`          |
| zh-TW  | desktop  | unknownInstitution | `#/zh-TW/institutions/unknown-governed-id` | `screenshots/zh-TW-unknownInstitution-desktop-first-screen.png` | `screenshots/zh-TW-unknownInstitution-desktop-full-page.png` |
| zh-TW  | desktop  | unknownRoute       | `#/zh-TW/not-a-real-route`                 | `screenshots/zh-TW-unknownRoute-desktop-first-screen.png`       | `screenshots/zh-TW-unknownRoute-desktop-full-page.png`       |
| zh-TW  | desktop  | standardExplorer   | `#/zh-TW/`                                 | `screenshots/zh-TW-standardExplorer-desktop-first-screen.png`   | `screenshots/zh-TW-standardExplorer-desktop-full-page.png`   |
| en     | mobile   | home               | `#/en/`                                    | `screenshots/en-home-mobile-first-screen.png`                   | `screenshots/en-home-mobile-full-page.png`                   |
| en     | mobile   | selectedTaiwan     | `#/en/`                                    | `screenshots/en-selectedTaiwan-mobile-first-screen.png`         | `screenshots/en-selectedTaiwan-mobile-full-page.png`         |
| en     | mobile   | map                | `#/en/`                                    | `screenshots/en-map-mobile-first-screen.png`                    | `screenshots/en-map-mobile-full-page.png`                    |
| en     | mobile   | directory          | `#/en/members`                             | `screenshots/en-directory-mobile-first-screen.png`              | `screenshots/en-directory-mobile-full-page.png`              |
| en     | mobile   | acgf               | `#/en/institutions/acgf-tw`                | `screenshots/en-acgf-mobile-first-screen.png`                   | `screenshots/en-acgf-mobile-full-page.png`                   |
| en     | mobile   | sparseKOTEC        | `#/en/institutions/kotec-kr`               | `screenshots/en-sparseKOTEC-mobile-first-screen.png`            | `screenshots/en-sparseKOTEC-mobile-full-page.png`            |
| en     | mobile   | compare            | `#/en/compare`                             | `screenshots/en-compare-mobile-first-screen.png`                | `screenshots/en-compare-mobile-full-page.png`                |
| en     | mobile   | data               | `#/en/data-pilot`                          | `screenshots/en-data-mobile-first-screen.png`                   | `screenshots/en-data-mobile-full-page.png`                   |
| en     | mobile   | systems            | `#/en/systems`                             | `screenshots/en-systems-mobile-first-screen.png`                | `screenshots/en-systems-mobile-full-page.png`                |
| en     | mobile   | resources          | `#/en/resources`                           | `screenshots/en-resources-mobile-first-screen.png`              | `screenshots/en-resources-mobile-full-page.png`              |
| en     | mobile   | unknownInstitution | `#/en/institutions/unknown-governed-id`    | `screenshots/en-unknownInstitution-mobile-first-screen.png`     | `screenshots/en-unknownInstitution-mobile-full-page.png`     |
| en     | mobile   | unknownRoute       | `#/en/not-a-real-route`                    | `screenshots/en-unknownRoute-mobile-first-screen.png`           | `screenshots/en-unknownRoute-mobile-full-page.png`           |
| en     | mobile   | standardExplorer   | `#/en/`                                    | `screenshots/en-standardExplorer-mobile-first-screen.png`       | `screenshots/en-standardExplorer-mobile-full-page.png`       |
| zh-TW  | mobile   | home               | `#/zh-TW/`                                 | `screenshots/zh-TW-home-mobile-first-screen.png`                | `screenshots/zh-TW-home-mobile-full-page.png`                |
| zh-TW  | mobile   | selectedTaiwan     | `#/zh-TW/`                                 | `screenshots/zh-TW-selectedTaiwan-mobile-first-screen.png`      | `screenshots/zh-TW-selectedTaiwan-mobile-full-page.png`      |
| zh-TW  | mobile   | map                | `#/zh-TW/`                                 | `screenshots/zh-TW-map-mobile-first-screen.png`                 | `screenshots/zh-TW-map-mobile-full-page.png`                 |
| zh-TW  | mobile   | directory          | `#/zh-TW/members`                          | `screenshots/zh-TW-directory-mobile-first-screen.png`           | `screenshots/zh-TW-directory-mobile-full-page.png`           |
| zh-TW  | mobile   | acgf               | `#/zh-TW/institutions/acgf-tw`             | `screenshots/zh-TW-acgf-mobile-first-screen.png`                | `screenshots/zh-TW-acgf-mobile-full-page.png`                |
| zh-TW  | mobile   | sparseKOTEC        | `#/zh-TW/institutions/kotec-kr`            | `screenshots/zh-TW-sparseKOTEC-mobile-first-screen.png`         | `screenshots/zh-TW-sparseKOTEC-mobile-full-page.png`         |
| zh-TW  | mobile   | compare            | `#/zh-TW/compare`                          | `screenshots/zh-TW-compare-mobile-first-screen.png`             | `screenshots/zh-TW-compare-mobile-full-page.png`             |
| zh-TW  | mobile   | data               | `#/zh-TW/data-pilot`                       | `screenshots/zh-TW-data-mobile-first-screen.png`                | `screenshots/zh-TW-data-mobile-full-page.png`                |
| zh-TW  | mobile   | systems            | `#/zh-TW/systems`                          | `screenshots/zh-TW-systems-mobile-first-screen.png`             | `screenshots/zh-TW-systems-mobile-full-page.png`             |
| zh-TW  | mobile   | resources          | `#/zh-TW/resources`                        | `screenshots/zh-TW-resources-mobile-first-screen.png`           | `screenshots/zh-TW-resources-mobile-full-page.png`           |
| zh-TW  | mobile   | unknownInstitution | `#/zh-TW/institutions/unknown-governed-id` | `screenshots/zh-TW-unknownInstitution-mobile-first-screen.png`  | `screenshots/zh-TW-unknownInstitution-mobile-full-page.png`  |
| zh-TW  | mobile   | unknownRoute       | `#/zh-TW/not-a-real-route`                 | `screenshots/zh-TW-unknownRoute-mobile-first-screen.png`        | `screenshots/zh-TW-unknownRoute-mobile-full-page.png`        |
| zh-TW  | mobile   | standardExplorer   | `#/zh-TW/`                                 | `screenshots/zh-TW-standardExplorer-mobile-first-screen.png`    | `screenshots/zh-TW-standardExplorer-mobile-full-page.png`    |

## Observed issues

- No console warnings/errors, page errors, failed requests or HTTP responses ≥ 400 were observed.

## Interactions recorded

| Result                           | Interaction             | Status |
| -------------------------------- | ----------------------- | ------ |
| en/desktop/home                  | navigate                | ok     |
| en/desktop/home                  | screenshot:first-screen | ok     |
| en/desktop/home                  | screenshot:full-page    | ok     |
| en/desktop/selectedTaiwan        | navigate                | ok     |
| en/desktop/selectedTaiwan        | selectTaiwan            | ok     |
| en/desktop/selectedTaiwan        | screenshot:first-screen | ok     |
| en/desktop/selectedTaiwan        | screenshot:full-page    | ok     |
| en/desktop/map                   | navigate                | ok     |
| en/desktop/map                   | focusMap                | ok     |
| en/desktop/map                   | screenshot:first-screen | ok     |
| en/desktop/map                   | screenshot:full-page    | ok     |
| en/desktop/directory             | navigate                | ok     |
| en/desktop/directory             | screenshot:first-screen | ok     |
| en/desktop/directory             | screenshot:full-page    | ok     |
| en/desktop/acgf                  | navigate                | ok     |
| en/desktop/acgf                  | screenshot:first-screen | ok     |
| en/desktop/acgf                  | screenshot:full-page    | ok     |
| en/desktop/sparseKOTEC           | navigate                | ok     |
| en/desktop/sparseKOTEC           | screenshot:first-screen | ok     |
| en/desktop/sparseKOTEC           | screenshot:full-page    | ok     |
| en/desktop/compare               | navigate                | ok     |
| en/desktop/compare               | screenshot:first-screen | ok     |
| en/desktop/compare               | screenshot:full-page    | ok     |
| en/desktop/data                  | navigate                | ok     |
| en/desktop/data                  | screenshot:first-screen | ok     |
| en/desktop/data                  | screenshot:full-page    | ok     |
| en/desktop/systems               | navigate                | ok     |
| en/desktop/systems               | screenshot:first-screen | ok     |
| en/desktop/systems               | screenshot:full-page    | ok     |
| en/desktop/resources             | navigate                | ok     |
| en/desktop/resources             | screenshot:first-screen | ok     |
| en/desktop/resources             | screenshot:full-page    | ok     |
| en/desktop/unknownInstitution    | navigate                | ok     |
| en/desktop/unknownInstitution    | screenshot:first-screen | ok     |
| en/desktop/unknownInstitution    | screenshot:full-page    | ok     |
| en/desktop/unknownRoute          | navigate                | ok     |
| en/desktop/unknownRoute          | screenshot:first-screen | ok     |
| en/desktop/unknownRoute          | screenshot:full-page    | ok     |
| en/desktop/standardExplorer      | navigate                | ok     |
| en/desktop/standardExplorer      | screenshot:first-screen | ok     |
| en/desktop/standardExplorer      | screenshot:full-page    | ok     |
| zh-TW/desktop/home               | navigate                | ok     |
| zh-TW/desktop/home               | screenshot:first-screen | ok     |
| zh-TW/desktop/home               | screenshot:full-page    | ok     |
| zh-TW/desktop/selectedTaiwan     | navigate                | ok     |
| zh-TW/desktop/selectedTaiwan     | selectTaiwan            | ok     |
| zh-TW/desktop/selectedTaiwan     | screenshot:first-screen | ok     |
| zh-TW/desktop/selectedTaiwan     | screenshot:full-page    | ok     |
| zh-TW/desktop/map                | navigate                | ok     |
| zh-TW/desktop/map                | focusMap                | ok     |
| zh-TW/desktop/map                | screenshot:first-screen | ok     |
| zh-TW/desktop/map                | screenshot:full-page    | ok     |
| zh-TW/desktop/directory          | navigate                | ok     |
| zh-TW/desktop/directory          | screenshot:first-screen | ok     |
| zh-TW/desktop/directory          | screenshot:full-page    | ok     |
| zh-TW/desktop/acgf               | navigate                | ok     |
| zh-TW/desktop/acgf               | screenshot:first-screen | ok     |
| zh-TW/desktop/acgf               | screenshot:full-page    | ok     |
| zh-TW/desktop/sparseKOTEC        | navigate                | ok     |
| zh-TW/desktop/sparseKOTEC        | screenshot:first-screen | ok     |
| zh-TW/desktop/sparseKOTEC        | screenshot:full-page    | ok     |
| zh-TW/desktop/compare            | navigate                | ok     |
| zh-TW/desktop/compare            | screenshot:first-screen | ok     |
| zh-TW/desktop/compare            | screenshot:full-page    | ok     |
| zh-TW/desktop/data               | navigate                | ok     |
| zh-TW/desktop/data               | screenshot:first-screen | ok     |
| zh-TW/desktop/data               | screenshot:full-page    | ok     |
| zh-TW/desktop/systems            | navigate                | ok     |
| zh-TW/desktop/systems            | screenshot:first-screen | ok     |
| zh-TW/desktop/systems            | screenshot:full-page    | ok     |
| zh-TW/desktop/resources          | navigate                | ok     |
| zh-TW/desktop/resources          | screenshot:first-screen | ok     |
| zh-TW/desktop/resources          | screenshot:full-page    | ok     |
| zh-TW/desktop/unknownInstitution | navigate                | ok     |
| zh-TW/desktop/unknownInstitution | screenshot:first-screen | ok     |
| zh-TW/desktop/unknownInstitution | screenshot:full-page    | ok     |
| zh-TW/desktop/unknownRoute       | navigate                | ok     |
| zh-TW/desktop/unknownRoute       | screenshot:first-screen | ok     |
| zh-TW/desktop/unknownRoute       | screenshot:full-page    | ok     |
| zh-TW/desktop/standardExplorer   | navigate                | ok     |
| zh-TW/desktop/standardExplorer   | screenshot:first-screen | ok     |
| zh-TW/desktop/standardExplorer   | screenshot:full-page    | ok     |
| en/mobile/home                   | navigate                | ok     |
| en/mobile/home                   | screenshot:first-screen | ok     |
| en/mobile/home                   | screenshot:full-page    | ok     |
| en/mobile/selectedTaiwan         | navigate                | ok     |
| en/mobile/selectedTaiwan         | selectTaiwan            | ok     |
| en/mobile/selectedTaiwan         | screenshot:first-screen | ok     |
| en/mobile/selectedTaiwan         | screenshot:full-page    | ok     |
| en/mobile/map                    | navigate                | ok     |
| en/mobile/map                    | focusMap                | ok     |
| en/mobile/map                    | screenshot:first-screen | ok     |
| en/mobile/map                    | screenshot:full-page    | ok     |
| en/mobile/directory              | navigate                | ok     |
| en/mobile/directory              | screenshot:first-screen | ok     |
| en/mobile/directory              | screenshot:full-page    | ok     |
| en/mobile/acgf                   | navigate                | ok     |
| en/mobile/acgf                   | screenshot:first-screen | ok     |
| en/mobile/acgf                   | screenshot:full-page    | ok     |
| en/mobile/sparseKOTEC            | navigate                | ok     |
| en/mobile/sparseKOTEC            | screenshot:first-screen | ok     |
| en/mobile/sparseKOTEC            | screenshot:full-page    | ok     |
| en/mobile/compare                | navigate                | ok     |
| en/mobile/compare                | screenshot:first-screen | ok     |
| en/mobile/compare                | screenshot:full-page    | ok     |
| en/mobile/data                   | navigate                | ok     |
| en/mobile/data                   | screenshot:first-screen | ok     |
| en/mobile/data                   | screenshot:full-page    | ok     |
| en/mobile/systems                | navigate                | ok     |
| en/mobile/systems                | screenshot:first-screen | ok     |
| en/mobile/systems                | screenshot:full-page    | ok     |
| en/mobile/resources              | navigate                | ok     |
| en/mobile/resources              | screenshot:first-screen | ok     |
| en/mobile/resources              | screenshot:full-page    | ok     |
| en/mobile/unknownInstitution     | navigate                | ok     |
| en/mobile/unknownInstitution     | screenshot:first-screen | ok     |
| en/mobile/unknownInstitution     | screenshot:full-page    | ok     |
| en/mobile/unknownRoute           | navigate                | ok     |
| en/mobile/unknownRoute           | screenshot:first-screen | ok     |
| en/mobile/unknownRoute           | screenshot:full-page    | ok     |
| en/mobile/standardExplorer       | navigate                | ok     |
| en/mobile/standardExplorer       | screenshot:first-screen | ok     |
| en/mobile/standardExplorer       | screenshot:full-page    | ok     |
| zh-TW/mobile/home                | navigate                | ok     |
| zh-TW/mobile/home                | screenshot:first-screen | ok     |
| zh-TW/mobile/home                | screenshot:full-page    | ok     |
| zh-TW/mobile/selectedTaiwan      | navigate                | ok     |
| zh-TW/mobile/selectedTaiwan      | selectTaiwan            | ok     |
| zh-TW/mobile/selectedTaiwan      | screenshot:first-screen | ok     |
| zh-TW/mobile/selectedTaiwan      | screenshot:full-page    | ok     |
| zh-TW/mobile/map                 | navigate                | ok     |
| zh-TW/mobile/map                 | focusMap                | ok     |
| zh-TW/mobile/map                 | screenshot:first-screen | ok     |
| zh-TW/mobile/map                 | screenshot:full-page    | ok     |
| zh-TW/mobile/directory           | navigate                | ok     |
| zh-TW/mobile/directory           | screenshot:first-screen | ok     |
| zh-TW/mobile/directory           | screenshot:full-page    | ok     |
| zh-TW/mobile/acgf                | navigate                | ok     |
| zh-TW/mobile/acgf                | screenshot:first-screen | ok     |
| zh-TW/mobile/acgf                | screenshot:full-page    | ok     |
| zh-TW/mobile/sparseKOTEC         | navigate                | ok     |
| zh-TW/mobile/sparseKOTEC         | screenshot:first-screen | ok     |
| zh-TW/mobile/sparseKOTEC         | screenshot:full-page    | ok     |
| zh-TW/mobile/compare             | navigate                | ok     |
| zh-TW/mobile/compare             | screenshot:first-screen | ok     |
| zh-TW/mobile/compare             | screenshot:full-page    | ok     |
| zh-TW/mobile/data                | navigate                | ok     |
| zh-TW/mobile/data                | screenshot:first-screen | ok     |
| zh-TW/mobile/data                | screenshot:full-page    | ok     |
| zh-TW/mobile/systems             | navigate                | ok     |
| zh-TW/mobile/systems             | screenshot:first-screen | ok     |
| zh-TW/mobile/systems             | screenshot:full-page    | ok     |
| zh-TW/mobile/resources           | navigate                | ok     |
| zh-TW/mobile/resources           | screenshot:first-screen | ok     |
| zh-TW/mobile/resources           | screenshot:full-page    | ok     |
| zh-TW/mobile/unknownInstitution  | navigate                | ok     |
| zh-TW/mobile/unknownInstitution  | screenshot:first-screen | ok     |
| zh-TW/mobile/unknownInstitution  | screenshot:full-page    | ok     |
| zh-TW/mobile/unknownRoute        | navigate                | ok     |
| zh-TW/mobile/unknownRoute        | screenshot:first-screen | ok     |
| zh-TW/mobile/unknownRoute        | screenshot:full-page    | ok     |
| zh-TW/mobile/standardExplorer    | navigate                | ok     |
| zh-TW/mobile/standardExplorer    | screenshot:first-screen | ok     |
| zh-TW/mobile/standardExplorer    | screenshot:full-page    | ok     |

## Slowest observed resources

| Result                       | Initiator | Duration (ms) | Resource                                                                           |
| ---------------------------- | --------- | ------------: | ---------------------------------------------------------------------------------- |
| en/mobile/compare            | script    |            41 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |
| en/mobile/acgf               | script    |            37 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/indicators-CHkZ1MFg.js            |
| en/mobile/acgf               | script    |            37 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/systemEvidence-BI_UK5IY.js        |
| en/mobile/acgf               | link      |            36 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/institutions-C46a92sW.css         |
| en/mobile/acgf               | script    |            36 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/InstitutionSnapshot-D9ptIpfl.js   |
| zh-TW/desktop/selectedTaiwan | script    |            35 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |
| en/mobile/acgf               | script    |            35 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/InstitutionDetailPage-pZw_E4n6.js |
| en/mobile/acgf               | script    |            34 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/core-bmp1JV-J.js                  |
| en/mobile/acgf               | script    |            31 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/metric-format-CL9GBDTe.js         |
| zh-TW/desktop/directory      | script    |            23 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |
| en/mobile/directory          | script    |            20 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |
| zh-TW/desktop/sparseKOTEC    | script    |            20 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |
| en/mobile/acgf               | script    |            19 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |
| zh-TW/desktop/resources      | script    |            17 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |
| en/desktop/home              | script    |            15 | http://127.0.0.1:4176/acsic-knowledge-hub/assets/index-sXOFnJX7.js                 |

## Protected checksums

See [protected-checksums.json](./protected-checksums.json), covering all files under `src/data` and the supplied Meng-Ge WebP asset. 15 files are protected.

## Reproduction

```sh
node scripts/experience-audit.mjs --base-url http://127.0.0.1:4176/acsic-knowledge-hub/
```

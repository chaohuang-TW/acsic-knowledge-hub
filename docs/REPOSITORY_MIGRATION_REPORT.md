# Repository Migration Report

## Status

Migration is paused before the repository rename. The connected GitHub App can read and write repository contents and reports `admin` permission, but its available actions do not include repository rename or repository settings update. Per the migration requirements, no alternative repository was created and no path setting was changed while the old repository remains live.

## Pre-migration state

| Item                     | Verified state                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| Migration date           | 2026-07-16                                                                     |
| Old repository           | `chaohuang-TW/acgf-strategy-os-demo`                                           |
| Target repository        | `chaohuang-TW/acsic-knowledge-hub`                                             |
| Old Pages URL            | `https://chaohuang-tw.github.io/acgf-strategy-os-demo/`                        |
| Target Pages URL         | `https://chaohuang-tw.github.io/acsic-knowledge-hub/`                          |
| Visibility               | Public                                                                         |
| Default branch           | `main`                                                                         |
| Remote latest commit     | `a4e3f88f146755d5b45b0270ff1b4fb4f76ba46c`                                     |
| Local reference commit   | `595b70d`                                                                      |
| Local worktree           | Clean before this report was added                                             |
| Current Vite base        | `/acgf-strategy-os-demo/`                                                      |
| CNAME                    | Absent                                                                         |
| Pages source             | GitHub Actions through `.github/workflows/deploy-pages.yml`                    |
| Target-name availability | `chaohuang-TW/acsic-knowledge-hub` returned GitHub API 404 and was not present |

The local and remote commit SHAs differ because the previous release was published through the GitHub connector, but the deployed content was read back and verified from the remote repository.

## Last successful deployment evidence

- CI run 7 completed successfully: `https://github.com/chaohuang-TW/acgf-strategy-os-demo/actions/runs/29465138609`
- Deploy Pages run 7 completed successfully: `https://github.com/chaohuang-TW/acgf-strategy-os-demo/actions/runs/29465186500`
- English route opened successfully at `https://chaohuang-tw.github.io/acgf-strategy-os-demo/#/en/`.
- Traditional Chinese route opened successfully at `https://chaohuang-tw.github.io/acgf-strategy-os-demo/#/zh-TW/`.

## Connector capability result

The repository metadata reports `admin`, `maintain`, `push`, `pull` and `triage` permissions. However, the installed GitHub connector exposes no callable action for:

- renaming a repository;
- updating repository description, website or topics;
- changing GitHub Pages repository settings.

The content and Git-data actions must not be used to simulate a repository rename. Browser or local credential workarounds were intentionally not used.

## Single required manual action

Open `https://github.com/chaohuang-TW/acgf-strategy-os-demo/settings`, change **Repository name** from `acgf-strategy-os-demo` to `acsic-knowledge-hub`, and confirm **Rename**.

Do not create a new repository. After the rename is complete, return to this task so the connector can re-read `chaohuang-TW/acsic-knowledge-hub` and continue the prepared migration.

## Prepared path-change matrix

After the manual rename is confirmed, update the following in one migration commit:

| Location                               | Required change                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                       | Set `base` to `/acsic-knowledge-hub/`.                                                                                       |
| `playwright.config.ts`                 | Replace both local preview URLs with `/acsic-knowledge-hub/`.                                                                |
| `public/404.html`                      | Replace the old base with `/acsic-knowledge-hub/`.                                                                           |
| `README.md`                            | Make the renamed repository and new Pages URL current; move the old URL to migration history.                                |
| `AGENTS.md`                            | Confirm no operational reference treats the old repository as current.                                                       |
| `docs/ARCHITECTURE.md`                 | Record the new Pages base.                                                                                                   |
| `docs/REPOSITORY_RENAME_ASSESSMENT.md` | Mark the rename decision and execution complete.                                                                             |
| `docs/COMPLETION_REPORT.md`            | Record the new production URL and deployment result.                                                                         |
| `docs/PUBLICATION_CHECKLIST.md`        | Add and complete new-path, old-path and no-CNAME checks.                                                                     |
| Tests                                  | Assert the new Vite base, new preview URL, no current old path, bilingual routes, downloads, 404, noindex and static assets. |
| Local git remote                       | Set `origin` to `https://github.com/chaohuang-TW/acsic-knowledge-hub.git`.                                                   |
| Repository About                       | Set the requested description, website and topics after the rename.                                                          |

The GitHub Actions workflow logic does not hard-code the repository name. It should remain functionally unchanged, but both CI and Deploy Pages must be re-run and verified after the base update.

## Planned validation sequence

1. `pnpm format`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm build`
6. `pnpm test:e2e` for desktop and mobile
7. `pnpm secret:scan`
8. Confirm `dist` contains `/acsic-knowledge-hub/` and not the old asset base
9. Publish to renamed `main` without force push
10. Confirm CI and Deploy Pages success
11. Open the new English and Traditional Chinese routes
12. Verify search, comparison, reports, downloads, static assets, refresh and 404 behavior
13. Check the old Pages URL before deciding whether a redirect repository is needed

## Old URL handling

Before the rename, the old URL is healthy and serves the current bilingual platform. Its post-rename behavior has not been tested because the rename has not occurred. No redirect repository has been created, and this report does not claim that GitHub will redirect the old Pages URL.

If the old Pages URL does not redirect after the new site is healthy, create a separate lightweight public repository named `acgf-strategy-os-demo` only after confirming the old name is released. It must contain only a bilingual move notice, new-site link, JavaScript redirect, meta refresh and `noindex, nofollow`. It must not copy research data or establish synchronization.

## Known limitations

- Repository rename and Repository About settings cannot be executed by the installed connector action surface.
- Old Pages URL behavior cannot be measured until after the manual rename.
- No production path file was modified before the rename, so the existing site remains operational.

## Recovery

If the renamed Pages deployment fails:

1. Keep the source repository and history intact.
2. Fix `/acsic-knowledge-hub/` path configuration first and rerun CI.
3. Do not deploy to the Pages root and do not modify the personal homepage.
4. If rollback is required, rename the repository back to `acgf-strategy-os-demo`, restore `/acgf-strategy-os-demo/` in Vite, Playwright and `public/404.html`, restore the old documentation URLs, and redeploy through GitHub Actions.

## Protected repositories

No operation in this pre-migration phase touched `chaohuang-TW/acgf-strategy-os` or `chaohuang-TW/chaohuang-tw.github.io`.

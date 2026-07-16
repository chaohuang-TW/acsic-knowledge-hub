# Repository Migration Report

## Status

Repository rename completed on 2026-07-16 through the authenticated GitHub Settings interface. GitHub and the connected GitHub App both read the repository as `chaohuang-TW/acsic-knowledge-hub`; visibility remains Public, the default branch remains `main`, and repository history was preserved. The production path migration changes the Pages base to `/acsic-knowledge-hub/` without a CNAME or personal-site root deployment.

## Pre-migration state

| Item                       | Verified state                                                                 |
| -------------------------- | ------------------------------------------------------------------------------ |
| Migration date             | 2026-07-16                                                                     |
| Old repository             | `chaohuang-TW/acgf-strategy-os-demo`                                           |
| Target repository          | `chaohuang-TW/acsic-knowledge-hub`                                             |
| Old Pages URL              | `https://chaohuang-tw.github.io/acgf-strategy-os-demo/`                        |
| Target Pages URL           | `https://chaohuang-tw.github.io/acsic-knowledge-hub/`                          |
| Visibility                 | Public                                                                         |
| Default branch             | `main`                                                                         |
| Rename-time remote commit  | `d4f743e520eed3389c285718e66d3b749c50d124`                                     |
| Local pre-migration commit | `4136eca`                                                                      |
| Local worktree             | Clean before this report was added                                             |
| Pre-migration Vite base    | `/acgf-strategy-os-demo/`                                                      |
| Migrated Vite base         | `/acsic-knowledge-hub/`                                                        |
| CNAME                      | Absent                                                                         |
| Pages source               | GitHub Actions through `.github/workflows/deploy-pages.yml`                    |
| Target-name availability   | `chaohuang-TW/acsic-knowledge-hub` returned GitHub API 404 and was not present |

The local and remote commit SHAs differ because releases are published through the GitHub connector instead of the unavailable local HTTPS credential path. Published content is read back from the remote repository after each release.

## Last successful deployment evidence

- CI run 7 completed successfully: `https://github.com/chaohuang-TW/acgf-strategy-os-demo/actions/runs/29465138609`
- Deploy Pages run 7 completed successfully: `https://github.com/chaohuang-TW/acgf-strategy-os-demo/actions/runs/29465186500`
- English route opened successfully at `https://chaohuang-tw.github.io/acgf-strategy-os-demo/#/en/`.
- Traditional Chinese route opened successfully at `https://chaohuang-tw.github.io/acgf-strategy-os-demo/#/zh-TW/`.

## Rename execution

The repository metadata reports `admin`, `maintain`, `push`, `pull` and `triage` permissions. The installed GitHub connector did not expose repository rename or repository settings actions, so the explicit user-authorized rename was completed in the authenticated GitHub Settings interface. The post-rename readback confirmed:

- repository full name: `chaohuang-TW/acsic-knowledge-hub`;
- visibility: Public;
- default branch: `main`;
- rename-time latest commit: `d4f743e520eed3389c285718e66d3b749c50d124`;
- existing repository ID and history preserved.

No new repository was created to simulate the rename, no force push was used, and no unrelated history was overwritten.

## Prepared path-change matrix

The following changes are included in the post-rename migration release:

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

- Repository About settings are outside the installed connector action surface and require authenticated GitHub UI changes if they need adjustment.
- GitHub repository redirects and GitHub Pages project-path behavior are separate; the old Pages URL must be measured after the new deployment rather than assumed to redirect.

## Recovery

If the renamed Pages deployment fails:

1. Keep the source repository and history intact.
2. Fix `/acsic-knowledge-hub/` path configuration first and rerun CI.
3. Do not deploy to the Pages root and do not modify the personal homepage.
4. If rollback is required, rename the repository back to `acgf-strategy-os-demo`, restore `/acgf-strategy-os-demo/` in Vite, Playwright and `public/404.html`, restore the old documentation URLs, and redeploy through GitHub Actions.

## Protected repositories

No operation in this pre-migration phase touched `chaohuang-TW/acgf-strategy-os` or `chaohuang-TW/chaohuang-tw.github.io`.

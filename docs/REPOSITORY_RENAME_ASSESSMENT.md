# Repository Rename Assessment

## 2026-07-16 execution status

The target name is available and the current repository is Public on `main`. The connected GitHub App reports repository admin permission, but the installed connector action surface has no repository rename or repository settings mutation. Migration is paused before changing the Pages base so the live old-path site remains healthy. See `docs/REPOSITORY_MIGRATION_REPORT.md` for the verified state, single manual rename action and prepared migration matrix.

## Proposed change

Rename `chaohuang-TW/acgf-strategy-os-demo` to `chaohuang-TW/acsic-knowledge-hub` after the bilingual release is stable.

## Impact

| Area              | Impact                                                                                  | Required action                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| GitHub repository | GitHub normally redirects repository web and Git URLs after a rename                    | Verify the redirect and update local `origin` URLs.                                                            |
| GitHub Pages      | The project-site path changes from `/acgf-strategy-os-demo/` to `/acsic-knowledge-hub/` | Change Vite `base`, Playwright `baseURL`, Pages checks and documentation in the same migration commit.         |
| Old public URL    | A Pages path redirect is not guaranteed to behave like the repository redirect          | Preserve a transition notice or redirect artifact at the old path before the rename if continuity is required. |
| Actions           | Workflow logic can remain, but the first deployment after the rename must be monitored  | Verify build, artifact upload and Pages deployment.                                                            |
| External links    | Existing bookmarks and citations may point to the old Pages path                        | Announce the new URL and audit all repository documentation.                                                   |

## Decision for this release

Do not rename the repository in the same change that introduces the bilingual routing contract. Keeping the current repository and Pages base isolates routing defects from URL migration risk and preserves the working public site during validation.

## Recommended migration sequence

1. Publish and verify both `/#/en/` and `/#/zh-TW/` on the current Pages URL.
2. Create a dedicated rename migration commit that updates Vite, Playwright, README and deployment checks together.
3. Rename the repository in GitHub settings.
4. Update the local remote and deploy from the renamed repository.
5. Verify the new URL and document the old URL behavior before announcing completion.

No private repository or personal homepage is involved in this migration.

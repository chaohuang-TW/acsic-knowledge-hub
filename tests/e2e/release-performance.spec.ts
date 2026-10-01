import { expect, test, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Expected counts come from the same governed registry, not a second set of
// homepage constants. This test does not modify or substitute production data.
const canonicalInstitutions = JSON.parse(
  readFileSync(new URL('../../src/data/institutions.json', import.meta.url), 'utf8'),
) as { id: string; countryCode: string; status: string; abbr: string }[];
const canonicalCounts = [
  canonicalInstitutions.filter((record) => record.status === 'member').length,
  new Set(canonicalInstitutions.map((record) => record.countryCode)).size,
  canonicalInstitutions.filter((record) => record.status === 'observer').length,
].map(String);

const explorerChunk = /\/assets\/NetworkExplorer-[^/]+\.js(?:\?.*)?$/;
const threeChunk = /\/assets\/(?:NetworkScene-|three[.-]|react-three[.-]|drei[.-]|fiber[.-])/i;

async function documentBox(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  });
}

for (const locale of ['en', 'zh-TW'] as const) {
  for (const width of [390, 768, 1440]) {
    test(`${locale} ${width}px primary entry points work while the explorer chunk is held`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const requestedChunks: string[] = [];
      let interceptedExplorerRequests = 0;
      let releaseExplorer!: () => void;
      const explorerGate = new Promise<void>((resolve) => {
        releaseExplorer = resolve;
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('request', (request) => {
        if (/\.js(?:\?|$)/.test(request.url())) requestedChunks.push(request.url());
      });
      await page.route(explorerChunk, async (route) => {
        interceptedExplorerRequests += 1;
        await explorerGate;
        await route.continue();
      });

      try {
        // Do not wait for networkidle: this request is deliberately outstanding.
        await page.goto(`./#/${locale}/`, { waitUntil: 'domcontentloaded' });
        await expect.poll(() => interceptedExplorerRequests).toBe(1);
        const hero = page.locator('.atlas-home-copy');
        const search = page.getByRole('searchbox', {
          name: locale === 'en' ? 'Find an institution' : '查找機構',
          exact: true,
        });
        const navigation = page.getByRole('navigation', {
          name: locale === 'en' ? 'Primary navigation' : '主要導覽',
          exact: true,
        });
        const loading = page.locator('.network-explorer-skeleton');

        await expect(
          page.getByRole('heading', {
            level: 1,
            name:
              locale === 'en' ? "Explore Asia's Credit Guarantee Network" : '探索亞洲信用保證網絡',
            exact: true,
          }),
        ).toBeVisible();
        await expect(search).toBeVisible();
        await expect(navigation).toBeVisible();
        await expect(navigation.getByRole('link')).toHaveCount(5);
        await expect(page.locator('.network-hero-counts dd')).toHaveText(canonicalCounts);
        await expect(loading).toBeVisible();
        await expect(loading).toHaveAttribute('aria-busy', 'true');
        await expect(loading.getByRole('status')).toHaveText(
          locale === 'en' ? 'Loading network explorer' : '正在載入網絡探索器',
        );
        await expect(page.locator('.network-map-svg')).toHaveCount(0);
        expect(requestedChunks.filter((url) => threeChunk.test(url))).toEqual([]);

        const loadingLayout = await page.evaluate(() => ({
          viewport: innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(loadingLayout.document).toBeLessThanOrEqual(loadingLayout.viewport);
        expect(loadingLayout.body).toBeLessThanOrEqual(loadingLayout.viewport);

        const reservedMap = await loading.locator('.network-skeleton-canvas').boundingBox();
        expect(reservedMap).not.toBeNull();
        expect(reservedMap!.width).toBeGreaterThan(0);
        expect(reservedMap!.height / reservedMap!.width).toBeCloseTo(
          width === 390 ? 0.76 : 0.62,
          2,
        );

        // Search is actually usable before the map code arrives, not merely
        // painted as an inert form. The outstanding import survives hash routes.
        await search.fill('TSMEG');
        await expect(search).toHaveValue('TSMEG');
        await search.press('Enter');
        await expect(page).toHaveURL(new RegExp(`#/${locale}/members\\?q=TSMEG$`));
        await expect(page.locator('.directory-card')).toHaveCount(1);
        await expect(page.locator('.directory-card[data-institution-id="tsmeg-tw"]')).toBeVisible();
        await page.locator('.site-header .brand').click();
        await expect(page).toHaveURL(new RegExp(`#/${locale}/$`));
        await expect(loading).toBeVisible();

        // Primary navigation also works independently of the atlas chunk.
        await navigation.locator(`a[href="#/${locale}/members"]`).click();
        await expect(page).toHaveURL(new RegExp(`#/${locale}/members$`));
        await expect(page.locator('.directory-card')).toHaveCount(canonicalInstitutions.length);
        await page.locator('.site-header .brand').click();
        await expect(loading).toBeVisible();
        await expect(page.locator('.network-hero-counts dd')).toHaveText(canonicalCounts);
        expect(interceptedExplorerRequests).toBe(1);
        expect(requestedChunks.filter((url) => threeChunk.test(url))).toEqual([]);
        const heroBeforeRelease = await documentBox(hero);

        releaseExplorer();
        const stage = page.getByTestId('asia-map-stage');
        await expect(stage.locator('.network-map-svg')).toBeVisible();
        await expect(loading).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        await expect(stage).toHaveAttribute('data-selected-economy', '');
        const loadedMap = await stage.boundingBox();
        expect(loadedMap).not.toBeNull();
        expect(loadedMap!.width).toBeCloseTo(reservedMap!.width, 0);
        expect(loadedMap!.height).toBeCloseTo(reservedMap!.height, 0);
        const heroAfterRelease = await documentBox(hero);
        for (const coordinate of ['x', 'y', 'width', 'height'] as const) {
          expect(heroAfterRelease[coordinate]).toBeCloseTo(heroBeforeRelease[coordinate], 0);
        }

        const economySelector = page.getByRole('combobox', {
          name: locale === 'en' ? 'Choose an economy' : '選擇國家／經濟體',
          exact: true,
        });
        if (await economySelector.isVisible()) {
          await expect(economySelector.locator('option')).toHaveCount(
            Number(canonicalCounts[1]) + 1,
          );
          await economySelector.selectOption('TW');
        } else {
          await page
            .locator('.network-destination-controls')
            .getByRole('button', { name: locale === 'en' ? 'Taiwan' : '臺灣', exact: true })
            .click();
        }
        await expect(stage).toHaveAttribute('data-selected-economy', 'TW');
        const taiwanInstitutions = canonicalInstitutions.filter(
          (record) => record.countryCode === 'TW',
        );
        for (const institution of taiwanInstitutions) {
          const card = page.locator(
            `.institution-snapshot-card[data-institution-id="${institution.id}"]`,
          );
          await expect(card).toBeVisible();
          await expect(card).toContainText(institution.abbr);
          await expect(
            card.getByRole('link', {
              name: locale === 'en' ? 'View full profile' : '查看完整機構檔案',
              exact: true,
            }),
          ).toHaveAttribute('href', `#/${locale}/institutions/${institution.id}`);
        }

        // No 3D button was requested in this flow. Loading the normal SVG atlas
        // and institution evidence must not fetch the Three.js scene bundle.
        await expect(stage.locator('canvas')).toHaveCount(0);
        expect(requestedChunks.filter((url) => threeChunk.test(url))).toEqual([]);
        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);
      } finally {
        releaseExplorer();
        await page.unrouteAll({ behavior: 'wait' });
      }
    });
  }
}

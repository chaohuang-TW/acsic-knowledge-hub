import { expect, test, type Page } from '@playwright/test';

test.use({ trace: 'on' });

type Target = { label: string; width: number; height: number; x: number; y: number };

async function highFrequencyTargets(page: Page, selector: string): Promise<Target[]> {
  return page.locator(selector).evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const element = node as HTMLElement;
      const style = getComputedStyle(element);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        element.getClientRects().length === 0 ||
        element.closest('[hidden]')
      ) {
        return [];
      }
      // The checkbox is small, but its associated label is the real pointer
      // target. Do not create a test-only size or count only the glyph.
      const clickable =
        element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)
          ? element.labels?.[0] || element
          : element;
      const rect = clickable.getBoundingClientRect();
      let left = rect.left;
      let right = rect.right;
      let top = rect.top;
      let bottom = rect.bottom;
      for (
        let parent = clickable.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        const overflow = getComputedStyle(parent);
        const boundary = parent.getBoundingClientRect();
        if (['auto', 'scroll', 'hidden', 'clip'].includes(overflow.overflowX)) {
          left = Math.max(left, boundary.left);
          right = Math.min(right, boundary.right);
        }
        if (['auto', 'scroll', 'hidden', 'clip'].includes(overflow.overflowY)) {
          top = Math.max(top, boundary.top);
          bottom = Math.min(bottom, boundary.bottom);
        }
      }
      return [
        {
          label: element.getAttribute('aria-label') || element.textContent?.trim() || element.id,
          width: Math.max(0, right - left),
          height: Math.max(0, bottom - top),
          x: left,
          y: top,
        },
      ];
    }),
  );
}

function expectTargetsUsable(targets: Target[]) {
  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) {
    expect(target.width, `${target.label}: pointer width`).toBeGreaterThanOrEqual(43.9);
    expect(target.height, `${target.label}: pointer height`).toBeGreaterThanOrEqual(43.9);
  }
  for (let index = 0; index < targets.length; index += 1) {
    const first = targets[index]!;
    for (const second of targets.slice(index + 1)) {
      const overlapX =
        Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x);
      const overlapY =
        Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y);
      expect(overlapX > 0.5 && overlapY > 0.5, `${first.label} overlaps ${second.label}`).toBe(
        false,
      );
    }
  }
}

// Keep every viewport/assertion, but isolate languages so the complete matrix
// does not share a single 30-second test budget across forty route changes.
for (const locale of ['en', 'zh-TW']) {
  test(`${locale} frequent lookup, directory, profile and download targets are large and separate`, async ({
    page,
  }) => {
    for (const width of [320, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`./?networkFallback=1#/${locale}/`);
      await expect(page.locator('.home-lookup')).toBeVisible();
      expectTargetsUsable(
        await highFrequencyTargets(
          page,
          '.home-lookup input, .home-lookup button, .home-shortcuts a',
        ),
      );
      const economySelect = page.locator('.network-standard-mobile-select select');
      await expect(economySelect).toBeVisible();
      expectTargetsUsable(
        await highFrequencyTargets(page, '.network-standard-mobile-select select'),
      );
      await economySelect.selectOption('TW');
      await expect(page.locator('.institution-snapshot-card')).toHaveCount(2);
      expectTargetsUsable(
        await highFrequencyTargets(
          page,
          '.institution-snapshot-actions button, .institution-snapshot-actions a, .institution-snapshot-disclosure > summary, .network-standard-back',
        ),
      );

      await page.goto(`./#/${locale}/members?q=KODIT`);
      await expect(page.locator('.directory-card')).toHaveCount(1);
      expectTargetsUsable(
        await highFrequencyTargets(
          page,
          '.directory-primary-filters input, .directory-primary-filters select, .directory-card__actions a, .directory-filter__clear',
        ),
      );
      await page.locator('.directory-card__actions a[href*="/institutions/"]').click();
      await expect(page.locator('.institution-profile-hero')).toBeVisible();
      expectTargetsUsable(
        await highFrequencyTargets(
          page,
          '.institution-profile-hero a[href*="/members"], .institution-profile-actions a[target="_blank"]',
        ),
      );

      await page.goto(`./#/${locale}/data-pilot`);
      await expect(page.locator('.pilot-toolbar')).toBeVisible();
      const summary = page.locator('.data-pilot-page .download-details > summary');
      await summary.click();
      expectTargetsUsable(
        await highFrequencyTargets(
          page,
          '.pilot-toolbar select, .data-pilot-page .download-details > summary, .data-pilot-page .download-details button',
        ),
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}

test('SVG selection keeps snapshot disclosures clear of return controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./#/en/');
  const fallback = page.locator('.network-explorer-fallback');
  if (await fallback.count()) {
    await page.getByRole('button', { name: 'Use map preview', exact: true }).click();
  }
  await expect(page.locator('.network-destination-controls')).toBeVisible();
  await page
    .locator('.network-destination-controls')
    .getByRole('button', { name: 'Taiwan', exact: true })
    .click();
  await expect(page.locator('.institution-snapshot-card')).toHaveCount(2);
  expectTargetsUsable(
    await highFrequencyTargets(
      page,
      '.institution-snapshot-actions button, .institution-snapshot-actions a, .institution-snapshot-disclosure > summary, .network-back, .network-explore-all',
    ),
  );
});

test('comparison add/remove labels and export targets meet the frequent task goal', async ({
  page,
}) => {
  for (const locale of ['en', 'zh-TW']) {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`./#/${locale}/compare`);
      await expect(page.locator('.selection-chip')).toHaveCount(2);
      expectTargetsUsable(
        await highFrequencyTargets(
          page,
          '.selector-item input, .selection-chip button, .export-buttons button',
        ),
      );
      const third = page.locator('.selector-item input').nth(2);
      await third.check();
      await expect(page.locator('.selection-chip')).toHaveCount(3);
      const remove = page.locator('.selection-chip button').last();
      await remove.focus();
      await expect(remove).toBeFocused();
      await remove.press('Enter');
      await expect(page.locator('.selection-chip')).toHaveCount(2);
      await page.goto(`./#/${locale}/reports`);
      await expect(page.locator('.report-preview button')).toBeEnabled();
      expectTargetsUsable(
        await highFrequencyTargets(page, '.report-record-option input, .report-preview button'),
      );
    }
  }
});

test('320px and approximate doubled root text keep frequent controls operable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('./?networkFallback=1#/zh-TW/');
  // This is explicitly an approximation, not native browser text-only zoom.
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const selector = page.getByRole('combobox', { name: '選擇國家／經濟體' });
  await selector.selectOption('JP');
  await expect(page.locator('.institution-snapshot-card')).toHaveCount(2);
  expectTargetsUsable(
    await highFrequencyTargets(
      page,
      '.home-lookup input, .home-lookup button, .network-standard-mobile-select select, .institution-snapshot-actions button, .institution-snapshot-actions a',
    ),
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await selector.selectOption('TW');
  await page.locator('[data-institution-id="acgf-tw"] a[href*="/institutions/"]').click();
  await expect(page.locator('.institution-profile-identifiers')).toContainText('ACGF');
  expectTargetsUsable(
    await highFrequencyTargets(
      page,
      '.institution-profile-hero a[href*="/members"], .institution-profile-actions a[target="_blank"]',
    ),
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

import { expect, test } from '@playwright/test';

test.use({ trace: 'on' });

test('skip navigation moves focus without replacing a hash route', async ({ page }) => {
  await page.goto('./#/en/members');
  const skip = page.getByRole('link', { name: 'Skip to main content', exact: true });
  await skip.focus();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#\/en\/members$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(
    page.getByRole('heading', { name: 'ACSIC Institutions', exact: true }),
  ).toBeVisible();
});

test('direct lookup reaches a profile and preserves the directory context', async ({ page }) => {
  await page.goto('./#/en/');
  const lookup = page.getByRole('searchbox', { name: 'Find an institution' });
  await lookup.fill('KODIT');
  await lookup.press('Enter');
  await expect(page).toHaveURL(/#\/en\/members\?q=KODIT$/);
  await expect(page.locator('.directory-card')).toHaveCount(1);
  await expect(page.getByRole('searchbox', { name: 'Search institutions' })).toHaveValue('KODIT');
  const record = page.locator('.directory-card[data-institution-id="kodit-kr"]');
  await record.getByRole('link', { name: 'View profile', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Korea Credit Guarantee Fund');
  await expect(page.locator('.institution-profile-actions a[target="_blank"]')).toHaveAttribute(
    'href',
    /^https:\/\//,
  );
  await page.getByRole('link', { name: 'Back to all institutions', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Search institutions' })).toHaveValue('KODIT');
  await expect(page.locator('.directory-card')).toHaveCount(1);
});

test('standard atlas exposes all economies, observer status and immediate selection', async ({
  page,
}) => {
  await page.goto('./?networkFallback=1#/en/');
  await expect(page.locator('.network-explorer-fallback')).toBeVisible();
  await expect(page.locator('.network-map-svg')).toBeVisible();
  const selector = page.getByRole('combobox', { name: 'Choose an economy' });
  await expect(selector.locator('option')).toHaveCount(15);
  await selector.selectOption('TW');
  await expect(page.locator('[data-institution-id="tsmeg-tw"]')).toContainText('Member');
  await expect(page.locator('[data-institution-id="acgf-tw"]')).toContainText('Observer');
  for (const [economy, abbreviation] of [
    ['JP', 'JFC'],
    ['KR', 'KOTEC'],
    ['PG', 'CGCPNG'],
  ] as const) {
    await selector.selectOption(economy);
    await expect(
      page.locator('.institution-snapshot-card').filter({ hasText: abbreviation }),
    ).toBeVisible();
  }
  await selector.selectOption('TW');
  await selector.selectOption('JP');
  await selector.selectOption('KR');
  await expect(page.locator('.institution-snapshot-card')).toHaveCount(3);
  await expect(page.locator('[data-institution-id="tsmeg-tw"]')).toHaveCount(0);
  await selector.selectOption('');
  await expect(page.locator('.institution-snapshot-card')).toHaveCount(0);
});

test('language switching retains institution identity and reload choice', async ({ page }) => {
  await page.goto('./#/en/institutions/acgf-tw');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('combobox', { name: 'Language' }).selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/institutions\/acgf-tw$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('財團法人農業信用保證基金');
  await page.reload();
  await expect(page.getByRole('combobox', { name: '語言' })).toHaveValue('zh-TW');
  await expect(page.locator('.institution-profile-identifiers')).toContainText('ACGF');
});

test('standard map reflows at every required width in both languages', async ({ page }) => {
  for (const locale of ['en', 'zh-TW']) {
    for (const width of [320, 390, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`./?networkFallback=1#/${locale}/`);
      await expect(page.locator('.network-map-svg')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
});

test('mobile and zoomed error states remain actionable without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of ['en/', 'zh-TW/members', 'en/institutions/unknown', 'en/not-a-page']) {
    await page.goto(`./?networkFallback=1#/${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not in the atlas');
  await page.getByRole('link', { name: 'Find institutions', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Search institutions' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search institutions' }).fill('nonexistent-record');
  await expect(page.locator('.directory-empty')).toBeVisible();
  await page.locator('.directory-empty').getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.directory-card')).toHaveCount(21);
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('keyboard lookup and standard economy selection do not require dragging', async ({ page }) => {
  await page.goto('./?networkFallback=1#/en/');
  const lookup = page.getByRole('searchbox', { name: 'Find an institution' });
  await lookup.focus();
  await lookup.press('K');
  await lookup.press('O');
  await lookup.press('D');
  await lookup.press('I');
  await lookup.press('T');
  await lookup.press('Enter');
  await expect(page.locator('.directory-card')).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Search institutions' }).press('Tab');
  await expect(page.locator(':focus-visible')).toHaveCount(1);
  await page.goto('./?networkFallback=1#/en/');
  const marker = page.locator('.network-map-marker[data-economy-id="TW"]');
  await marker.focus();
  await marker.press('Enter');
  await expect(page.locator('[data-institution-id="acgf-tw"]')).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('desktop destinations update the selected region and institution cards', async ({ page }) => {
  await page.goto('./#/en/');
  const destinations = page.locator('.network-destination-controls button');
  await expect(destinations).toHaveCount(3);
  await expect(destinations.filter({ hasText: 'Taiwan' })).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('TSMEG', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('ACGF', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Japan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Japan', exact: true })).toBeVisible();
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('JFC', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('JFG', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('TSMEG', { exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Republic of Korea', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Republic of Korea', exact: true })).toBeVisible();
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('KODIT', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('KOREG', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.network-overlay, .network-panel').getByText('KOTEC', { exact: true }),
  ).toBeVisible();
});

test('institution actions use governed profile and official website links', async ({ page }) => {
  await page.goto('./#/en/');
  const tsmeg = page.locator('.network-institution-card').filter({ hasText: 'TSMEG' });
  await expect(tsmeg.getByRole('link', { name: 'View profile' })).toHaveAttribute(
    'href',
    '#/en/institutions/tsmeg-tw',
  );
  await expect(tsmeg.locator('a[target="_blank"]')).toHaveAttribute('href', /^https?:\/\//);
  await expect(
    page.locator('.network-institution-card').filter({ hasText: 'ACGF' }).getByText('Observer'),
  ).toBeVisible();
});

test('mobile remains scrollable and destination controls fit without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/en/');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.network-canvas-frame')).toBeVisible();
  await expect(page.locator('.network-destination-controls button')).toHaveCount(3);
  await page.getByRole('button', { name: 'Japan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Japan', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore all institutions' })).toBeVisible();
});

test('reduced motion keeps region switching functional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/en/');
  await page.getByRole('button', { name: 'Republic of Korea', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Republic of Korea', exact: true })).toBeVisible();
  await expect(page.getByText('KOTEC', { exact: true })).toBeVisible();
});

test('DOM fallback exposes all three destinations and seven institutions', async ({ page }) => {
  await page.goto('./?networkFallback=1#/en/');
  await expect(page.locator('.network-explorer-fallback')).toBeVisible();
  await expect(page.getByText('Interactive 3D view is unavailable on this device.')).toBeVisible();
  await expect(page.locator('.fallback-region')).toHaveCount(3);
  await expect(page.locator('.network-institution-card')).toHaveCount(7);
  await expect(page.getByText('KODIT', { exact: true })).toBeVisible();
  await expect(page.getByText('ACGF', { exact: true })).toBeVisible();
  await expect(
    page.locator('.network-institution-card').filter({ hasText: 'KODIT' }).getByRole('link', {
      name: 'View profile',
    }),
  ).toHaveAttribute('href', '#/en/institutions/kodit-kr');
  await expect(
    page
      .locator('.network-institution-card')
      .filter({ hasText: 'KODIT' })
      .locator('a[target="_blank"]'),
  ).toHaveAttribute('href', /^https?:\/\//);
});

test('Traditional Chinese destinations use localized region names', async ({ page }) => {
  await page.goto('./?networkFallback=1#/zh-TW/');
  await expect(page.locator('.fallback-region').filter({ hasText: '臺灣' })).toBeVisible();
  await expect(page.locator('.fallback-region').filter({ hasText: '日本' })).toBeVisible();
  await expect(page.locator('.fallback-region').filter({ hasText: '韓國' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '臺灣', exact: true })).toBeVisible();
});

test('institution profile links are shareable and unknown IDs stay explicit', async ({ page }) => {
  await page.goto('./#/en/institutions/tsmeg-tw');
  await expect(
    page.getByRole('heading', {
      name: 'Small and Medium Enterprise Credit Guarantee Fund of Taiwan',
    }),
  ).toBeVisible();
  await expect(page.getByText('TSMEG', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('TSMEG', { exact: true })).toBeVisible();
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/institutions\/tsmeg-tw$/);
  await expect(page.getByRole('heading', { name: '財團法人中小企業信用保證基金' })).toBeVisible();
  await page.goto('./#/en/institutions/not-a-real-institution');
  await expect(page.getByRole('heading', { name: 'Institution not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to all institutions' })).toHaveAttribute(
    'href',
    '#/en/members',
  );
  await page.goto('./#/en/institutions/acgf-tw');
  await expect(page.locator('.institution-detail-identity')).toContainText('Observer');
});

test('fallback card selection is coupled to accessible card state', async ({ page }) => {
  await page.goto('./?networkFallback=1#/en/');
  const card = page.locator('.network-institution-card').filter({ hasText: 'TSMEG' }).first();
  await expect(card.getByRole('button', { name: 'Select institution' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await card.getByRole('button', { name: 'Select institution' }).click();
  await expect(card).toHaveClass(/is-selected/);
  await expect(card.getByRole('button', { name: 'Selected' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(card.getByRole('link', { name: 'View profile' })).toHaveAttribute(
    'href',
    '#/en/institutions/tsmeg-tw',
  );
});

test('network explorer remains usable at the 320px boundary', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./?networkFallback=1#/en/');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 320);
  await expect(page.locator('.network-fallback-mascot')).toBeVisible();
});

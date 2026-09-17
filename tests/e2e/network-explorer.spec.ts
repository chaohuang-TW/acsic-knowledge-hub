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
    '#/en/members',
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
});

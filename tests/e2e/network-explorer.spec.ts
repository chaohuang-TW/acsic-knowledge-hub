import { expect, test } from '@playwright/test';

test('overview exposes all governed economies and dynamic network counts', async ({ page }) => {
  await page.goto('./#/en/');
  await expect(page.locator('.network-destination-controls button')).toHaveCount(15);
  await expect(page.getByRole('button', { name: 'Asia overview', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByText('Choose an economy to explore its ACSIC institutions.'),
  ).toBeVisible();
  await expect(page.locator('.network-overview-counts')).toContainText('20');
  await expect(page.locator('.network-overview-counts')).toContainText('14');
  await expect(page.locator('.network-overview-counts')).toContainText('1');
  await expect(page.locator('.network-panel .network-institution-card')).toHaveCount(0);
});

test('prototype economies retain their governed institutions', async ({ page }) => {
  await page.goto('./#/en/');
  await page.getByRole('button', { name: 'Taiwan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Taiwan', exact: true })).toBeVisible();
  await expect(page.locator('.network-panel').getByText('TSMEG', { exact: true })).toBeVisible();
  await expect(page.locator('.network-panel').getByText('ACGF', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Japan', exact: true }).click();
  await expect(page.getByText('JFC', { exact: true })).toBeVisible();
  await expect(page.getByText('JFG', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Republic of Korea', exact: true }).click();
  await expect(page.getByText('KODIT', { exact: true })).toBeVisible();
  await expect(page.getByText('KOREG', { exact: true })).toBeVisible();
  await expect(page.getByText('KOTEC', { exact: true })).toBeVisible();
});

test('additional governed economies reveal their complete institution groups', async ({ page }) => {
  await page.goto('./#/en/');
  const fixtures = [
    ['Cambodia', ['CGCC']],
    ['India', ['CGTMSE']],
    ['Indonesia', ['ASIPPINDO', 'ASKRINDO']],
    ['Papua New Guinea', ['SMEC', 'CGCPNG']],
    ['Sri Lanka', ['CBSL', 'SLECIC']],
  ] as const;
  for (const [economy, abbreviations] of fixtures) {
    await page.getByRole('button', { name: economy, exact: true }).click();
    await expect(page.getByRole('heading', { name: economy, exact: true })).toBeVisible();
    for (const abbreviation of abbreviations)
      await expect(
        page.locator('.network-panel').getByText(abbreviation, { exact: true }),
      ).toBeVisible();
  }
});

test('institution actions use governed profile and official website links', async ({ page }) => {
  await page.goto('./#/en/');
  await page.getByRole('button', { name: 'Taiwan', exact: true }).click();
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

test('institution selection and return-to-overview stay synchronized', async ({ page }) => {
  await page.goto('./#/en/');
  await page.getByRole('button', { name: 'Japan', exact: true }).click();
  const jfc = page.locator('.network-institution-card').filter({ hasText: 'JFC' });
  await jfc.getByRole('button', { name: 'Select institution' }).click();
  await expect(jfc).toHaveClass(/is-selected/);
  await expect(jfc.getByRole('button', { name: 'Selected' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Back to Asia overview', exact: true }).click();
  await expect(
    page.getByText('Choose an economy to explore its ACSIC institutions.'),
  ).toBeVisible();
  await expect(page.locator('.network-panel .network-institution-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Asia overview', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('mobile economy selector remains usable at 390px and 320px', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./#/en/');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
    await page.getByRole('button', { name: 'Cambodia', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Cambodia', exact: true })).toBeVisible();
    await expect(page.getByText('CGCC', { exact: true })).toBeVisible();
  }
});

test('reduced motion supports nearby and distant selections without an animation dependency', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/en/');
  await page.getByRole('button', { name: 'Japan', exact: true }).click();
  await expect(page.getByText('JFC', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Papua New Guinea', exact: true }).click();
  await expect(page.getByText('CGCPNG', { exact: true })).toBeVisible();
});

test('DOM fallback keeps all economy navigation and selected institution coverage', async ({
  page,
}) => {
  await page.goto('./?networkFallback=1#/en/');
  await expect(page.locator('.network-explorer-fallback')).toBeVisible();
  await expect(page.getByText('Interactive 3D view is unavailable on this device.')).toBeVisible();
  await expect(page.locator('.fallback-region')).toHaveCount(15);
  await expect(page.getByText('CGCC', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cambodia', exact: true }).click();
  await expect(page.getByText('CGCC', { exact: true })).toBeVisible();
  await expect(page.locator('.network-institution-card')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'View profile' })).toHaveAttribute(
    'href',
    '#/en/institutions/cgcc-kh',
  );
  await page.getByRole('button', { name: 'Asia overview', exact: true }).click();
  await expect(
    page.getByText('Choose an economy to explore its ACSIC institutions.'),
  ).toBeVisible();
});

test('Traditional Chinese economy labels and actions stay governed', async ({ page }) => {
  await page.goto('./?networkFallback=1#/zh-TW/');
  await expect(page.getByRole('button', { name: '亞洲總覽', exact: true })).toBeVisible();
  await expect(page.locator('.fallback-region').filter({ hasText: '臺灣' })).toBeVisible();
  await expect(page.locator('.fallback-region').filter({ hasText: '印度' })).toBeVisible();
  await page.getByRole('button', { name: '臺灣', exact: true }).click();
  await expect(page.getByRole('heading', { name: '臺灣', exact: true })).toBeVisible();
  await expect(page.locator('.network-overlay').getByText('觀察員', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '查看機構檔案' }).first()).toHaveAttribute(
    'href',
    '#/zh-TW/institutions/tsmeg-tw',
  );
  await expect(page.getByRole('link', { name: /官方網站/ }).first()).toHaveAttribute(
    'target',
    '_blank',
  );
});

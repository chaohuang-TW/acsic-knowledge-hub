import { expect, test, type Page } from '@playwright/test';

async function chooseEconomy(page: Page, id: string, en: string, zh: string, locale = 'en') {
  if ((page.viewportSize()?.width ?? 1280) <= 767) {
    await page
      .getByRole('combobox', {
        name: locale === 'en' ? 'Choose an economy' : '選擇國家／經濟體',
      })
      .selectOption(id);
  } else {
    await page.getByRole('button', { name: locale === 'en' ? en : zh, exact: true }).click();
  }
}

test('English snapshots explain Taiwan institutions and link through to profile and official sites', async ({
  page,
}) => {
  await page.goto('./#/en/');
  await chooseEconomy(page, 'TW', 'Taiwan', '臺灣');

  const tsmeg = page.locator('.institution-snapshot-card[data-institution-id="tsmeg-tw"]');
  const acgf = page.locator('.institution-snapshot-card[data-institution-id="acgf-tw"]');
  await expect(tsmeg).toBeVisible();
  await expect(tsmeg.getByText('Direct guarantee', { exact: true })).toBeVisible();
  await expect(tsmeg.locator('.institution-metric')).toHaveCount(3);
  await expect(tsmeg.locator('.institution-official-metrics')).toContainText('CY2025');
  await expect(tsmeg.locator('a[target="_blank"]')).toHaveAttribute('href', /^https:\/\//);
  await expect(acgf).toBeVisible();
  await expect(acgf.getByText('Observer', { exact: true })).toBeVisible();
  await expect(acgf.locator('.institution-official-metrics')).toContainText('18,480,910');
  await expect(
    acgf.locator('.institution-metric strong').filter({ hasText: '23,928,298' }),
  ).toHaveCount(0);
  await expect(
    acgf.locator('.institution-metric-label').filter({ hasText: 'Guaranteed Loan' }),
  ).toHaveCount(0);
  await expect(acgf.getByRole('link', { name: 'View full profile' })).toHaveAttribute(
    'href',
    '#/en/institutions/acgf-tw',
  );

  await acgf.getByRole('link', { name: 'View full profile' }).click();
  await expect(page).toHaveURL(/#\/en\/institutions\/acgf-tw$/);
  await expect(page.locator('.institution-profile-hero')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Agricultural Credit Guarantee Fund' }),
  ).toBeVisible();
  await expect(page.locator('.institution-official-metrics')).toContainText('18,480,910');
  const volume = page.locator('.institution-metric').filter({ hasText: 'New Guarantee Volume' });
  await volume.locator('.institution-metric-provenance summary').click();
  await expect(volume.locator('.institution-metric-provenance')).toContainText('114 年');
  await expect(volume.locator('.institution-metric-provenance a[target="_blank"]')).toHaveAttribute(
    'href',
    /^https:\/\//,
  );
});

test('Japan and Korea cards keep their existing metric and evidence boundaries', async ({
  page,
}) => {
  await page.goto('./#/en/');
  await chooseEconomy(page, 'JP', 'Japan', '日本');
  await expect(page.locator('[data-institution-id="jfc-jp"]')).toBeVisible();
  await expect(page.locator('[data-institution-id="jfg-jp"]')).toBeVisible();
  const jfc = page.locator('.institution-snapshot-card[data-institution-id="jfc-jp"]');
  await expect(jfc.locator('.institution-metric')).toHaveCount(2);
  await expect(jfc).toContainText('Credit insurance coverage');
  await expect(jfc).toContainText('of the subrogated amount');
  await expect(jfc).not.toContainText('Guarantee Coverage Ratio');

  await chooseEconomy(page, 'KR', 'Republic of Korea', '韓國');
  for (const id of ['kodit-kr', 'koreg-kr', 'kotec-kr']) {
    await expect(
      page.locator(`.institution-snapshot-card[data-institution-id="${id}"]`),
    ).toBeVisible();
  }
  const koreg = page.locator('.institution-snapshot-card[data-institution-id="koreg-kr"]');
  await expect(koreg.locator('.institution-official-metrics')).toHaveCount(0);
  const kotec = page.locator('.institution-snapshot-card[data-institution-id="kotec-kr"]');
  await expect(kotec).toContainText('AIRATE technology appraisal');
  await expect(kotec).toContainText('AI-assisted');
  await expect(kotec).not.toContainText(/AI automatically approves|automated approval/i);
});

test('Traditional Chinese has the same snapshot behavior and canonical profile links', async ({
  page,
}) => {
  await page.goto('./#/zh-TW/');
  await chooseEconomy(page, 'TW', 'Taiwan', '臺灣', 'zh-TW');
  const acgf = page.locator('.institution-snapshot-card[data-institution-id="acgf-tw"]');
  await expect(acgf.getByText('觀察員', { exact: true })).toBeVisible();
  await expect(acgf.getByRole('link', { name: '查看完整機構檔案' })).toHaveAttribute(
    'href',
    '#/zh-TW/institutions/acgf-tw',
  );
  await expect(acgf.locator('.institution-official-metrics')).toContainText('新臺幣千元');

  await acgf.getByRole('link', { name: '查看完整機構檔案' }).click();
  await expect(page).toHaveURL(/#\/zh-TW\/institutions\/acgf-tw$/);
  await expect(
    page.getByRole('heading', { name: '財團法人農業信用保證基金', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '制度與方案證據' })).toBeVisible();
});

test('fallback uses the same institution snapshot content and links', async ({ page }) => {
  await page.goto('./?networkFallback=1#/en/');
  await expect(page.locator('.network-explorer-fallback')).toBeVisible();
  await chooseEconomy(page, 'TW', 'Taiwan', '臺灣');
  const card = page.locator('.institution-snapshot-card[data-institution-id="acgf-tw"]');
  await expect(card.getByText('Observer', { exact: true })).toBeVisible();
  await expect(card.locator('.institution-official-metrics')).toContainText('18,480,910');
  await expect(card.getByRole('link', { name: 'View full profile' })).toHaveAttribute(
    'href',
    '#/en/institutions/acgf-tw',
  );
});

test('snapshot and profile remain readable at 390px and 320px widths', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./?networkFallback=1#/zh-TW/');
    await chooseEconomy(page, 'JP', 'Japan', '日本', 'zh-TW');
    const jfc = page.locator('.institution-snapshot-card[data-institution-id="jfc-jp"]');
    await expect(jfc).toBeVisible();
    await expect(jfc.locator('.institution-metric')).toHaveCount(2);
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
    await expect(jfc.getByRole('link', { name: '查看完整機構檔案' })).toBeVisible();
    await jfc.getByRole('link', { name: '查看完整機構檔案' }).click();
    await expect(page.locator('.institution-profile-hero')).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
  }
});

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
  const snapshotLoanVolume = acgf.locator('.institution-metric').nth(0);
  const snapshotGuaranteeVolume = acgf.locator('.institution-metric').nth(1);
  await expect(snapshotLoanVolume.locator('strong')).toHaveText('TWD 23.928');
  await expect(snapshotLoanVolume.locator('.institution-metric-unit')).toHaveText('billion');
  await expect(snapshotGuaranteeVolume.locator('strong')).toHaveText('TWD 18.481');
  await expect(snapshotGuaranteeVolume.locator('.institution-metric-unit')).toHaveText('billion');
  await expect(acgf.locator('.institution-metric-label').nth(0)).toHaveText(
    'Guaranteed Loan Volume',
  );
  await expect(acgf.locator('.institution-metric-label').nth(1)).toHaveText('New Guarantee Volume');
  await expect(acgf.locator('.institution-official-metrics')).not.toContainText(
    'Guarantee Coverage Ratio',
  );
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
  const metrics = page.locator('.institution-official-metrics');
  const loanVolume = metrics
    .locator('.institution-metric-label')
    .filter({ hasText: /^Guaranteed Loan Volume$/ })
    .locator('..');
  const guaranteeVolume = metrics
    .locator('.institution-metric-label')
    .filter({ hasText: /^New Guarantee Volume$/ })
    .locator('..');
  await expect(loanVolume.locator('strong')).toHaveText('TWD 23.928');
  await expect(loanVolume.locator('.institution-metric-unit')).toHaveText('billion');
  await expect(guaranteeVolume.locator('strong')).toHaveText('TWD 18.481');
  await expect(guaranteeVolume.locator('.institution-metric-unit')).toHaveText('billion');
  await loanVolume.locator('.institution-metric-provenance summary').click();
  await expect(loanVolume.locator('.institution-metric-provenance')).toContainText(
    '23,928,298 新臺幣千元',
  );
  await expect(
    loanVolume.locator('.institution-metric-provenance a[target="_blank"]'),
  ).toHaveAttribute('href', 'https://www.acgf.org.tw/Page/PageEditor/I6YASZTJ3SLERIRHG52SZEOYWU');
  await guaranteeVolume.locator('.institution-metric-provenance summary').click();
  await expect(guaranteeVolume.locator('.institution-metric-provenance')).toContainText(
    '18,480,910 新臺幣千元',
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
  await expect(acgf.locator('.institution-metric-label').nth(0)).toHaveText('保證貸款金額');
  await expect(acgf.locator('.institution-metric').nth(0).locator('strong')).toHaveText(
    '約新臺幣 239.283',
  );
  await expect(
    acgf.locator('.institution-metric').nth(0).locator('.institution-metric-unit'),
  ).toHaveText('億元');

  await acgf.getByRole('link', { name: '查看完整機構檔案' }).click();
  await expect(page).toHaveURL(/#\/zh-TW\/institutions\/acgf-tw$/);
  await expect(
    page.getByRole('heading', { name: '財團法人農業信用保證基金', exact: true }),
  ).toBeVisible();
  const profileMetrics = page.locator('.institution-metric');
  await expect(
    profileMetrics
      .locator('.institution-metric-label')
      .filter({ hasText: /^當期新增保證金額$/ })
      .locator('..')
      .locator('strong'),
  ).toHaveText('約新臺幣 184.809');
  await expect(
    profileMetrics
      .locator('.institution-metric-label')
      .filter({ hasText: /^保證貸款金額$/ })
      .locator('..')
      .locator('strong'),
  ).toHaveText('約新臺幣 239.283');
  await expect(page.getByRole('heading', { name: '制度與方案證據' })).toBeVisible();
});

test('fallback uses the same institution snapshot content and links', async ({ page }) => {
  await page.goto('./?networkFallback=1#/en/');
  await expect(page.locator('.network-explorer-fallback')).toBeVisible();
  await chooseEconomy(page, 'TW', 'Taiwan', '臺灣');
  const card = page.locator('.institution-snapshot-card[data-institution-id="acgf-tw"]');
  await expect(card.getByText('Observer', { exact: true })).toBeVisible();
  await expect(card.locator('.institution-metric').nth(0).locator('strong')).toHaveText(
    'TWD 23.928',
  );
  await expect(card.locator('.institution-metric-label').nth(0)).toHaveText(
    'Guaranteed Loan Volume',
  );
  await expect(card.getByRole('link', { name: 'View full profile' })).toHaveAttribute(
    'href',
    '#/en/institutions/acgf-tw',
  );
});

test('snapshot and profile remain readable at 390px and 320px widths', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./?networkFallback=1#/zh-TW/');
    await chooseEconomy(page, 'TW', 'Taiwan', '臺灣', 'zh-TW');
    const acgf = page.locator('.institution-snapshot-card[data-institution-id="acgf-tw"]');
    await expect(acgf).toBeVisible();
    await expect(acgf.getByText('觀察員', { exact: true })).toBeVisible();
    await expect(acgf.locator('.institution-metric')).toHaveCount(3);
    await expect(acgf.locator('.institution-metric-label').nth(0)).toHaveText('保證貸款金額');
    await expect(acgf.locator('.institution-metric-label').nth(1)).toHaveText('當期新增保證金額');
    await expect(acgf.locator('.institution-metric').nth(0).locator('strong')).toHaveText(
      '約新臺幣 239.283',
    );
    await expect(
      acgf.locator('.institution-metric').nth(0).locator('.institution-metric-unit'),
    ).toHaveText('億元');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
    await expect(acgf.getByRole('link', { name: '查看完整機構檔案' })).toBeVisible();
    await acgf.getByRole('link', { name: '查看完整機構檔案' }).click();
    await expect(page.locator('.institution-profile-hero')).toBeVisible();
    await expect(
      page
        .locator('.institution-metric-label')
        .filter({ hasText: /^保證貸款金額$/ })
        .locator('..')
        .locator('strong'),
    ).toHaveText('約新臺幣 239.283');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
  }
});

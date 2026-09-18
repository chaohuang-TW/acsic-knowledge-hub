import { expect, test, type Page } from '@playwright/test';

async function chooseEconomy(page: Page, optionValue: string, buttonLabel: string) {
  const mobile = (page.viewportSize()?.width ?? 1280) <= 767;
  if (mobile) {
    const selector = page.getByRole('combobox', { name: 'Choose an economy' });
    await selector.waitFor({ state: 'visible' });
    await selector.selectOption(optionValue);
  } else {
    await page.getByRole('button', { name: buttonLabel, exact: true }).click();
  }
}

async function returnToOverview(page: Page) {
  const mobile = (page.viewportSize()?.width ?? 1280) <= 767;
  if (mobile) {
    const selector = page.getByRole('combobox', { name: 'Choose an economy' });
    await selector.waitFor({ state: 'visible' });
    await selector.selectOption('');
  } else {
    await page.getByRole('button', { name: 'Back to Asia overview', exact: true }).click();
  }
}

test('supported Chromium keeps the normal 3D explorer path', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The blocking WebGL smoke is defined for Chromium.');
  await page.goto('./#/en/');
  await expect(page.locator('.network-explorer-fallback')).toHaveCount(0);
  await expect(page.locator('.network-canvas canvas')).toBeVisible();
  await chooseEconomy(page, 'JP', 'Japan');
  await expect(page.getByText('JFC', { exact: true })).toBeVisible();
});

test('overview exposes all governed economies and dynamic network counts', async ({ page }) => {
  await page.goto('./#/en/');
  await expect(page.locator('.network-destination-controls button')).toHaveCount(15);
  if (await page.locator('.network-mobile-economy-control').isVisible()) {
    const selector = page.getByRole('combobox', { name: 'Choose an economy' });
    await expect(selector.locator('option')).toHaveCount(15);
    await expect(selector).toHaveValue('');
    await expect(page.locator('.network-panel-overview')).toBeHidden();
  } else {
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
  }
  await expect(page.locator('.network-panel .network-institution-card')).toHaveCount(0);
});

test('prototype economies retain their governed institutions', async ({ page }) => {
  await page.goto('./#/en/');
  await chooseEconomy(page, 'TW', 'Taiwan');
  await expect(page.getByRole('heading', { name: 'Taiwan', exact: true })).toBeVisible();
  await expect(page.locator('.network-panel').getByText('TSMEG', { exact: true })).toBeVisible();
  await expect(page.locator('.network-panel').getByText('ACGF', { exact: true })).toBeVisible();
  await chooseEconomy(page, 'JP', 'Japan');
  await expect(page.getByText('JFC', { exact: true })).toBeVisible();
  await expect(page.getByText('JFG', { exact: true })).toBeVisible();
  await chooseEconomy(page, 'KR', 'Republic of Korea');
  await expect(page.getByText('KODIT', { exact: true })).toBeVisible();
  await expect(page.getByText('KOREG', { exact: true })).toBeVisible();
  await expect(page.getByText('KOTEC', { exact: true })).toBeVisible();
});

test('additional governed economies reveal their complete institution groups', async ({ page }) => {
  await page.goto('./#/en/');
  const fixtures = [
    ['KH', 'Cambodia', ['CGCC']],
    ['IN', 'India', ['CGTMSE']],
    ['ID', 'Indonesia', ['ASIPPINDO', 'ASKRINDO']],
    ['PG', 'Papua New Guinea', ['SMEC', 'CGCPNG']],
    ['LK', 'Sri Lanka', ['CBSL', 'SLECIC']],
  ] as const;
  for (const [economyId, economy, abbreviations] of fixtures) {
    await chooseEconomy(page, economyId, economy);
    await expect(page.getByRole('heading', { name: economy, exact: true })).toBeVisible();
    for (const abbreviation of abbreviations)
      await expect(
        page.locator('.network-panel').getByText(abbreviation, { exact: true }),
      ).toBeVisible();
  }
});

test('institution actions use governed profile and official website links', async ({ page }) => {
  await page.goto('./#/en/');
  await chooseEconomy(page, 'TW', 'Taiwan');
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
  await chooseEconomy(page, 'JP', 'Japan');
  const jfc = page.locator('.network-institution-card').filter({ hasText: 'JFC' });
  await jfc.getByRole('button', { name: 'Select institution' }).click();
  await expect(jfc).toHaveClass(/is-selected/);
  await expect(jfc.getByRole('button', { name: 'Selected' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await returnToOverview(page);
  await expect(page.locator('.network-panel .network-institution-card')).toHaveCount(0);
  if (await page.locator('.network-mobile-economy-control').isVisible()) {
    await expect(page.getByRole('combobox', { name: 'Choose an economy' })).toHaveValue('');
  } else {
    await expect(
      page.getByText('Choose an economy to explore its ACSIC institutions.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Asia overview', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
});

test('mobile economy selector remains usable at 390px and 320px', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./#/en/');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
    await expect(page.locator('.network-destination-controls')).toBeHidden();
    await expect(page.locator('.network-mobile-economy-control')).toBeVisible();
    await expect(page.locator('.network-panel-overview')).toBeHidden();
    const selector = page.getByRole('combobox', { name: 'Choose an economy' });
    await expect(selector.locator('option')).toHaveCount(15);
    await selector.selectOption('KH');
    await expect(page.getByRole('heading', { name: 'Cambodia', exact: true })).toBeVisible();
    await expect(page.getByText('CGCC', { exact: true })).toBeVisible();
  }
});

test('reduced motion supports nearby and distant selections without an animation dependency', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/en/');
  await chooseEconomy(page, 'JP', 'Japan');
  await expect(page.getByText('JFC', { exact: true })).toBeVisible();
  await chooseEconomy(page, 'PG', 'Papua New Guinea');
  await expect(page.getByText('CGCPNG', { exact: true })).toBeVisible();
});

test('DOM fallback keeps all economy navigation and selected institution coverage', async ({
  page,
}) => {
  await page.goto('./?networkFallback=1#/en/');
  await expect(page.locator('.network-explorer-fallback')).toBeVisible();
  await expect(page.getByText('Standard explorer mode', { exact: true })).toBeVisible();
  await expect(page.locator('.network-standard-economy')).toHaveCount(14);
  await expect(page.getByText('CGCC', { exact: true })).toHaveCount(0);
  if (await page.locator('.network-standard-mobile-select').isVisible()) {
    await page.getByRole('combobox', { name: 'Choose an economy' }).selectOption('KH');
  } else {
    await page.getByRole('button', { name: 'Cambodia', exact: true }).click();
  }
  await expect(page.getByText('CGCC', { exact: true })).toBeVisible();
  await expect(page.locator('.network-institution-card')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Select institution' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'View profile' })).toHaveAttribute(
    'href',
    '#/en/institutions/cgcc-kh',
  );
  await page.getByRole('button', { name: /Back to Asia overview/ }).click();
  await expect(
    page.getByText('Choose an economy to explore its ACSIC institutions.'),
  ).toBeVisible();
});

test('Traditional Chinese economy labels and actions stay governed', async ({ page }) => {
  await page.goto('./?networkFallback=1#/zh-TW/');
  await expect(page.getByText('目前使用一般探索模式', { exact: true })).toBeVisible();
  if (await page.locator('.network-standard-mobile-select').isVisible()) {
    await page.getByRole('combobox', { name: '選擇國家／經濟體' }).selectOption('TW');
  } else {
    await expect(
      page.locator('.network-standard-economy').filter({ hasText: '臺灣' }),
    ).toBeVisible();
    await expect(
      page.locator('.network-standard-economy').filter({ hasText: '印度' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '臺灣', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: '臺灣', exact: true })).toBeVisible();
  await expect(
    page.locator('.network-standard-selected').getByText('觀察員', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '查看機構檔案' }).first()).toHaveAttribute(
    'href',
    '#/zh-TW/institutions/tsmeg-tw',
  );
  await expect(page.getByRole('link', { name: /官方網站/ }).first()).toHaveAttribute(
    'target',
    '_blank',
  );
});

test('context loss switches to standard explorer with an explicit reason', async ({ page }) => {
  await page.goto('./#/en/');
  const canvas = page.locator('.network-canvas canvas');
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(250);
  await canvas.dispatchEvent('webglcontextlost');
  await expect(page.locator('.network-explorer-fallback')).toBeVisible();
  await expect(page.locator('.network-explorer-fallback')).toHaveAttribute(
    'data-fallback-reason',
    'context-lost',
  );
  await expect(
    page.getByText('The 3D view was interrupted. The standard explorer is available below.'),
  ).toBeVisible();
});

test('mobile standard explorer uses a compact selector without horizontal overflow', async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`./?networkFallback=1&qaWidth=${width}#/en/`);
    await expect(page.locator('.network-standard-mobile-select')).toBeVisible();
    await expect(page.locator('.network-standard-economy-grid')).toBeHidden();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole('combobox', { name: 'Choose an economy' }).selectOption('JP');
    await expect(page.getByRole('heading', { name: 'Japan', exact: true })).toBeVisible();
    await expect(page.getByText('JFC', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View profile' }).first()).toBeVisible();
  }
});

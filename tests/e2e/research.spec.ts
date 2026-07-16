import { expect, test } from '@playwright/test';

test('international default uses English and preserves the independent disclaimer', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page).toHaveURL(/acsic-knowledge-hub\/#\/en\/$/);
  await expect(
    page.getByRole('heading', { name: 'Credit guarantee knowledge, connected across Asia' }),
  ).toBeVisible();
  await expect(page.getByText('Independent, unofficial platform')).toBeVisible();
  await expect(page.getByText('20', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('33', { exact: true }).first()).toBeVisible();
});

test('English and Traditional Chinese routes, switch and preference memory work', async ({
  page,
}) => {
  await page.goto('./#/en/members');
  await expect(
    page.getByRole('heading', { name: 'Member Institutions', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/members$/);
  await expect(page.getByRole('heading', { name: '會員機構', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('acsic-knowledge-hub-locale'))).toBe(
    'zh-TW',
  );
  await page.goto('./');
  await expect(page).toHaveURL(/#\/zh-TW\/$/);
});

test('production member page has no development-state controls', async ({ page }) => {
  await page.goto('./#/en/members');
  await expect(page.getByText('21 institution records')).toBeVisible();
  await expect(page.getByText('Interface state preview')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Empty', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Error', exact: true })).toHaveCount(0);
});

test('search and all member filter classes use readable bilingual labels', async ({ page }) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search').fill('ACGF');
  await expect(page.locator('.institution-list article')).toHaveCount(1);
  await expect(page.getByText('ACSIC Observer')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Countries / Economies').selectOption('KR');
  await expect(page.locator('.institution-list article')).toHaveCount(3);
  await page
    .getByLabel('Institution type')
    .selectOption('technology_finance_guarantee_institution');
  await expect(page.locator('.institution-list article')).toHaveCount(1);
  await expect(page.locator('.institution-list')).not.toContainText(
    'technology_finance_guarantee_institution',
  );
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Strict Level 2 status').selectOption('insufficient');
  await expect(page.locator('.institution-list article')).toHaveCount(1);
  await expect(page.getByText('PT. Asuransi Kredit Indonesia').first()).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('ACSIC status').selectOption('observer');
  await expect(page.locator('.institution-list article')).toHaveCount(1);
});

test('no-results state remains available without production preview controls', async ({ page }) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search').fill('not-a-real-institution');
  await expect(page.getByRole('heading', { name: 'No matching results' })).toBeVisible();
  await expect(page.getByText('Missing records are never generated.')).toBeVisible();
});

test('detail view is readable, linked and preserves filter and record when language changes', async ({
  page,
}) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search').fill('JFG');
  await page.getByRole('button', { name: 'View profile' }).click();
  const detail = page.locator('.detail-panel');
  await expect(
    detail.getByRole('heading', {
      name: 'Japan Federation of Credit Guarantee Corporations',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    detail.getByText('一般社団法人 全国信用保証協会連合会 (ja)', { exact: true }),
  ).toBeVisible();
  await expect(
    detail.getByRole('heading', { name: 'Documented non-applicable fields' }),
  ).toBeVisible();
  await expect(detail.locator('a[href^="https://www.zenshinhoren.or.jp/"]').first()).toBeVisible();
  await expect(detail.getByRole('link', { name: 'Open source' }).first()).toHaveAttribute(
    'href',
    /^https:/,
  );
  await expect(detail).not.toContainText('jfg-jp-profile');
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/members$/);
  await expect(page.getByLabel('關鍵字搜尋')).toHaveValue('JFG');
  await expect(detail.getByRole('heading', { name: '日本全國信用保證協會聯合會' })).toBeVisible();
  await expect(detail.getByRole('heading', { name: '正式記錄的不適用欄位' })).toBeVisible();
});

test('ASKRINDO exposes low confidence and critical source warning', async ({ page }) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search').fill('ASKRINDO');
  await page.getByRole('button', { name: 'View profile' }).click();
  const detail = page.locator('.detail-panel');
  await expect(detail.getByText('Pending official-source confirmation')).toBeVisible();
  await expect(detail.getByText('Low ·')).toBeVisible();
  await expect(detail.getByText(/Source warning:/)).toBeVisible();
  await expect(detail.locator('.warning')).toContainText('Temporarily unavailable');
});

test('all 21 institution details can be opened and closed', async ({ page }) => {
  await page.goto('./#/en/members');
  const buttons = page.getByRole('button', { name: 'View profile' });
  await expect(buttons).toHaveCount(21);
  for (let index = 0; index < 21; index += 1) {
    await buttons.nth(index).click();
    await expect(page.locator('.detail-panel')).toBeVisible();
    await expect(
      page.locator('.detail-panel').getByRole('heading', { name: 'Field-level evidence' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close profile' }).click();
  }
});

test('source registry statistics, metadata and filters are functional', async ({ page }) => {
  await page.goto('./#/en/sources');
  await expect(page.getByText('52', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('33', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Annual or integrated reports')).toBeVisible();
  await expect(page.getByText('Scheme or programme documents')).toBeVisible();
  await page.getByLabel('Institution', { exact: true }).selectOption('askrindo-id');
  await expect(page.locator('.institution-list article')).toHaveCount(2);
  await page.getByLabel('Access status').selectOption('temporarily_unavailable');
  await expect(page.locator('.institution-list article')).toHaveCount(1);
  await expect(page.getByText('Temporarily unavailable').last()).toBeVisible();
  await page.getByLabel('Institution', { exact: true }).selectOption('all');
  await page.getByLabel('Access status').selectOption('all');
  await page.getByLabel('Document type').selectOption('official_law_or_regulation');
  await expect(page.locator('.institution-list article')).toHaveCount(3);
  await expect(page.locator('.institution-list')).not.toContainText('official_law_or_regulation');
});

test('cross-role comparison shows warning and readable strict fields', async ({ page }) => {
  await page.goto('./#/en/compare');
  await expect(page.getByRole('heading', { name: 'Comparability warning' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Strict Level 2 status' })).toBeVisible();
  await expect(
    page.getByRole('rowheader', { name: 'Documented non-applicable fields' }),
  ).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Confidence and rationale' })).toBeVisible();
  await expect(page.locator('table')).not.toContainText('credit_guarantee_corporation');
});

test('comparison exports Markdown, CSV and JSON in both languages', async ({ page }) => {
  await page.goto('./#/en/compare');
  for (const locale of ['en', 'zh-TW'] as const) {
    await page.getByLabel('Export language').selectOption(locale);
    for (const [label, extension] of [
      ['Export Markdown', 'md'],
      ['Export CSV', 'csv'],
      ['Export JSON', 'json'],
    ] as const) {
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: label }).click();
      expect((await pending).suggestedFilename()).toBe(
        `acsic-knowledge-hub-comparison-${locale}.${extension}`,
      );
    }
  }
});

test('all five report types preview and export in English and Traditional Chinese', async ({
  page,
}) => {
  await page.goto('./#/en/reports');
  for (const locale of ['en', 'zh-TW'] as const) {
    await page.getByLabel('Report language').selectOption(locale);
    for (const type of [
      'executive',
      'country',
      'comparison',
      'meeting-qa',
      'presentation',
    ] as const) {
      await page.getByLabel('Report type').selectOption(type);
      const preview = page.locator('.report-preview pre');
      await expect(preview).toContainText(locale === 'en' ? '## Official sources' : '## 官方來源');
      await expect(preview).not.toContainText('-profile');
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export Markdown' }).click();
      expect((await pending).suggestedFilename()).toBe(`acsic-knowledge-hub-${type}-${locale}.md`);
    }
  }
});

test('mobile member filters, language selector, cards and details remain usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/zh-TW/members');
  await expect(page.getByRole('navigation', { name: '主要導覽' })).toBeVisible();
  await expect(page.getByLabel('語言')).toBeVisible();
  await page.getByLabel('關鍵字搜尋').fill('JFC');
  await expect(page.locator('.institution-list article')).toHaveCount(1);
  await page.getByRole('button', { name: '檢視機構檔案' }).click();
  await expect(page.locator('.detail-panel')).toBeVisible();
  await expect(
    page.locator('.detail-panel').getByText('株式会社日本政策金融公庫 (ja)', { exact: true }),
  ).toBeVisible();
});

test('hash refresh and Pages subpath preserve a deep bilingual route', async ({ page }) => {
  await page.goto('./#/zh-TW/sources');
  await page.reload();
  await expect(page).toHaveURL(/acsic-knowledge-hub\/#\/zh-TW\/sources$/);
  await expect(page.getByRole('heading', { name: '官方來源' })).toBeVisible();
});

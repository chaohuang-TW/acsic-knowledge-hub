import { expect, test } from '@playwright/test';

test('international default uses English and preserves the independent disclaimer', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page).toHaveURL(/acsic-knowledge-hub\/#\/en\/$/);
  await expect(
    page.getByRole('heading', { name: 'Explore Asia’s credit guarantee systems' }),
  ).toBeVisible();
  await expect(page.getByText('Independent, unofficial platform')).toBeVisible();
  await expect(page.getByText('20', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ACSIC Network' })).toBeVisible();
  await expect(page.getByText('Across Asia')).toBeVisible();
  await expect(page.getByText('Cambodia, India, Indonesia, Japan')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore all institutions →' })).toHaveAttribute(
    'href',
    '#/en/members',
  );
  await expect(page.locator('main')).not.toContainText(
    'Official sources become traceable knowledge through structured review and comparison.',
  );
  await expect(page.getByRole('heading', { name: 'ACSIC at a glance' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link'),
  ).toHaveCount(5);
  await expect(
    page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name: 'Reference Institutions' }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name: 'Comparative Framework' }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name: 'Verified Data Pilot' }),
  ).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Level 2 Complete');
  await expect(page.locator('main')).not.toContainText('Source references');
});

test('Traditional Chinese homepage renders the dynamic ACSIC network overview', async ({
  page,
}) => {
  await page.goto('./#/zh-TW/');
  await expect(page.getByRole('heading', { name: 'ACSIC 聯盟概況' })).toBeVisible();
  await expect(page.getByText('橫跨亞洲')).toBeVisible();
  await expect(page.locator('.network-countries p')).toContainText('柬埔寨');
  await expect(page.locator('.network-countries p')).toContainText('日本');
  await expect(page.getByRole('link', { name: '探索全部會員機構 →' })).toHaveAttribute(
    'href',
    '#/zh-TW/members',
  );
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

test('ACSIC overview answers first-visit questions with current membership facts', async ({
  page,
}) => {
  await page.goto('./#/en/overview');
  await expect(page.getByRole('heading', { name: 'What is ACSIC?' })).toBeVisible();
  await expect(page.getByText('20', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('14', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('21', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Official source', exact: true })).toHaveAttribute(
    'href',
    'https://www.smeg.org.tw/en/basic/?node=10104',
  );
  await expect(page.locator('main')).not.toContainText(
    'complete membership list will be validated next',
  );
});

test('production member page has no development-state controls', async ({ page }) => {
  await page.goto('./#/en/members');
  await expect(page.getByText('21 institution records')).toBeVisible();
  await expect(page.getByText('Interface state preview')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Empty', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Error', exact: true })).toHaveCount(0);
  await expect(page.locator('.institution-list article').first()).not.toContainText(
    'Strict Level 2 status',
  );
  await expect(page.locator('.institution-list article').first()).not.toContainText('Confidence');
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
  const research = detail.locator('.research-details');
  await expect(research).not.toHaveAttribute('open', '');
  await research.locator('summary').click();
  await expect(
    research.getByRole('heading', { name: 'Documented non-applicable fields' }),
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
  await detail.locator('.research-details summary').click();
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
    await expect(page.locator('.detail-panel .research-details')).not.toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Close profile' }).click();
  }
});

test('source registry statistics, metadata and filters are functional', async ({ page }) => {
  await page.goto('./#/en/sources');
  await expect(page.getByText('70', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('51', { exact: true }).first()).toBeVisible();
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
  await expect(page.locator('.institution-list article')).toHaveCount(5);
  await expect(page.locator('.institution-list')).not.toContainText('official_law_or_regulation');
});

test('systems publish only source-supported public system knowledge in both languages', async ({
  page,
}) => {
  await page.goto('./#/en/systems');
  await expect(
    page.getByRole('heading', { name: 'Taiwan: lender-led guarantee pathways' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Indirect guarantee' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Batch guarantee' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Japan: differentiated institutional roles' }),
  ).toBeVisible();
  await expect(page.getByText('51 credit guarantee corporations')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Republic of Korea: technology appraisal in guarantee review',
    }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AIRATE technology appraisal' })).toBeVisible();
  await expect(page.locator('main')).not.toContainText('70%');
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/systems$/);
  await expect(page.getByRole('heading', { name: '信用保證制度' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '間接保證' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AIRATE 技術評價' })).toBeVisible();
});

test('resources retain an official-verification gate for ACSIC event records', async ({ page }) => {
  await page.goto('./#/en/resources');
  await expect(page.getByRole('heading', { name: 'ACSIC event archive - planned' })).toBeVisible();
  await expect(
    page.getByText('Event materials are listed only after official provenance'),
  ).toBeVisible();
  await expect(page.locator('main')).not.toContainText('2027');
});

test('cross-role comparison shows warning and user-first comparison fields', async ({ page }) => {
  await page.goto('./#/en/compare');
  await expect(page.getByRole('heading', { name: 'Comparability warning' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Country / Economy' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Mandate' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Funding / capital basis' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Strict Level 2 status' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Sources for this comparison' })).toBeVisible();
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

test('reference set page exposes seven evidence-led cases in English', async ({ page }) => {
  await page.goto('./#/en/reference');
  await expect(page.getByRole('heading', { name: 'Reference Institutions' })).toBeVisible();
  await expect(page.locator('.reference-card')).toHaveCount(7);
  await expect(page.getByText('Research boundary')).toBeVisible();
  await expect(page.locator('main')).toContainText('not a ranking of institutional performance');
});

test('reference and framework routes switch to Traditional Chinese', async ({ page }) => {
  await page.goto('./#/en/reference');
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/reference$/);
  await expect(page.getByRole('heading', { name: '標竿研究機構' })).toBeVisible();
  await page.goto('./#/zh-TW/framework');
  await expect(page.getByRole('heading', { name: '比較指標框架' })).toBeVisible();
  await expect(page.locator('main')).toContainText('不作績效排名');
});

test('comparative framework renders 21 definitions and five readiness rows', async ({ page }) => {
  await page.goto('./#/en/framework');
  await expect(page.getByText('21', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.indicator-group details')).toHaveCount(21);
  await expect(page.locator('tbody tr')).toHaveCount(5);
  await page.locator('.indicator-group details').first().locator('summary').click();
  await expect(page.locator('.indicator-detail').first()).toBeVisible();
});

test('new research pages remain usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/zh-TW/reference');
  await expect(page.locator('.reference-card')).toHaveCount(7);
  await expect(page.getByLabel('語言')).toBeVisible();
  await page.goto('./#/zh-TW/framework');
  await expect(page.locator('.indicator-group details')).toHaveCount(21);
  await expect(page.locator('.table-scroll')).toBeVisible();
});

test('English data route publishes 12 records and keeps readiness behind methodology', async ({
  page,
}) => {
  await page.goto('./#/en/data-pilot');
  await expect(page.getByRole('heading', { name: 'Verified Data' })).toBeVisible();
  await expect(page.locator('.pilot-record-card')).toHaveCount(12);
  await expect(page.locator('.readiness-section')).not.toHaveAttribute('open', '');
  await page.locator('.readiness-section summary').click();
  await expect(page.locator('.readiness-section tbody tr')).toHaveCount(21);
  await expect(page.getByText('Verified with limitation').first()).toBeVisible();
  await expect(page.getByText('No chart is displayed')).toBeVisible();
});

test('Traditional Chinese pilot route, filters and bilingual statuses work', async ({ page }) => {
  await page.goto('./#/zh-TW/data-pilot');
  await expect(page.getByRole('heading', { name: '已查證官方數據' })).toBeVisible();
  const primaryPeriods = page.locator(
    '.pilot-record-card > .record-title, .pilot-record-card > .pilot-record-grid:not(.methodology-grid)',
  );
  const primaryPeriodText = (await primaryPeriods.allTextContents()).join(' ');
  expect(primaryPeriodText).not.toContain('113 年');
  expect(primaryPeriodText).not.toContain('114 年');
  expect(primaryPeriodText).not.toContain('民國');
  await expect(page.getByText('2024 年', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('2025 年', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('截至 2025 年 12 月 31 日', { exact: true })).toHaveCount(2);
  await expect(page.getByText('1974–2025', { exact: true })).toBeVisible();
  await page.locator('.pilot-toolbar').getByLabel('機構', { exact: true }).selectOption('jfc-jp');
  await expect(page.locator('.pilot-record-card')).toHaveCount(2);
  await expect(page.getByText('已查證但有限制').first()).toBeVisible();
  await page.locator('.readiness-section summary').click();
  await expect(page.getByText('特定方案適用').first()).toBeVisible();
  await expect(page.locator('main')).not.toContainText('new_guarantee_volume');
});

test('provenance viewer links each displayed value to its official source and page', async ({
  page,
}) => {
  await page.goto('./#/en/data-pilot');
  await page.locator('.download-details summary').click();
  const card = page.locator('.pilot-record-card').first();
  await card.getByText('View source & methodology').click();
  const provenance = card.locator('.provenance-viewer');
  await expect(provenance.getByText('Official source', { exact: true }).last()).toBeVisible();
  await expect(provenance.getByText('Page / table', { exact: true })).toBeVisible();
  await expect(card.getByText('Definition mapping', { exact: true })).toBeVisible();
  await expect(card.getByText('Normalization', { exact: true })).toBeVisible();
  await expect(card.getByText('Knowledge Hub indicator', { exact: true })).toBeVisible();
  await expect(card.getByRole('link', { name: 'Open official source' })).toHaveAttribute(
    'href',
    /^https:/,
  );
});

test('provenance preserves original ROC labels and source locators separately from normalized periods', async ({
  page,
}) => {
  await page.goto('./#/zh-TW/data-pilot');
  const tsmecCumulative = page.locator('.pilot-record-card').filter({ hasText: '1974–2025' });
  await tsmecCumulative.getByText('查看來源與資料處理').click();
  await expect(tsmecCumulative.getByText('官方原始期間標示', { exact: true })).toBeVisible();
  await expect(tsmecCumulative.getByText('自 63 年設立至 114 年底', { exact: true })).toBeVisible();
  await expect(tsmecCumulative).toContainText('1974–2025');
  const performanceRecord = page.locator('.pilot-record-card').filter({ hasText: '1,487,527' });
  await performanceRecord.getByText('查看來源與資料處理').click();
  await expect(
    performanceRecord.getByText('保證績效 > 114年 > 承保 > 金額', { exact: true }),
  ).toBeVisible();
});

test('pilot JSON and readiness CSV export in both languages', async ({ page }) => {
  await page.goto('./#/en/data-pilot');
  await page.locator('.download-details summary').click();
  let pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export pilot JSON' }).click();
  expect((await pending).suggestedFilename()).toBe('acsic-level3-pilot-v1-en.json');
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export pilot CSV' }).click();
  expect((await pending).suggestedFilename()).toBe('acsic-level3-pilot-v1-en.csv');
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export readiness CSV' }).click();
  expect((await pending).suggestedFilename()).toBe('acsic-level3-readiness-v1-en.csv');

  await page.getByLabel('Language').selectOption('zh-TW');
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出試辦 JSON' }).click();
  expect((await pending).suggestedFilename()).toBe('acsic-level3-pilot-v1-zh-TW.json');
});

test('pilot remains usable at 390px without page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/zh-TW/data-pilot');
  await expect(page.locator('.pilot-record-card')).toHaveCount(12);
  await expect(page.locator('.pilot-toolbar select').first()).toHaveCSS('min-width', '0px');
  await expect(page.locator('.download-details')).not.toHaveAttribute('open', '');
  await page.locator('.pilot-record-card').first().getByText('查看來源與資料處理').click();
  await expect(page.getByText('Knowledge Hub 指標', { exact: true }).first()).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
});

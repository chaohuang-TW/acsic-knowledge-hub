import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

async function chooseHomepageEconomy(
  page: Page,
  optionValue: string,
  desktopLabel: string,
  selectLabel: string,
) {
  const mobile = (page.viewportSize()?.width ?? 1280) <= 767;
  if (mobile) {
    const selector = page.getByRole('combobox', { name: selectLabel });
    await selector.waitFor({ state: 'visible' });
    await selector.selectOption(optionValue);
  } else {
    await page.getByRole('button', { name: desktopLabel, exact: true }).click();
  }
}

test('international default uses English and preserves the independent disclaimer', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page).toHaveURL(/acsic-knowledge-hub\/#\/en\/$/);
  await expect(
    page.getByRole('heading', { name: "Explore Asia's Credit Guarantee Network" }),
  ).toBeVisible();
  await expect(page.getByText('Independent, unofficial platform')).toBeVisible();
  await expect(page.getByText('20', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ACSIC Network Explorer' })).toBeVisible();
  if (await page.locator('.network-mobile-economy-control').isVisible()) {
    const selector = page.getByRole('combobox', { name: 'Choose an economy' });
    await expect(selector.locator('option')).toHaveCount(15);
    await expect(selector).toHaveValue('');
  } else {
    await expect(page.getByRole('button', { name: 'Taiwan' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Japan' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Republic of Korea' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Asia overview', exact: true })).toBeVisible();
    await expect(
      page.getByText('Choose an economy to explore its ACSIC institutions.'),
    ).toBeVisible();
  }
  await chooseHomepageEconomy(page, 'TW', 'Taiwan', 'Choose an economy');
  await expect(page.getByRole('heading', { name: 'Taiwan', exact: true })).toBeVisible();
  await expect(page.getByText('TSMEG', { exact: true })).toBeVisible();
  await expect(page.getByText('ACGF', { exact: true })).toBeVisible();
  await expect(page.getByText('Observer', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore all institutions' })).toHaveAttribute(
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

test('Traditional Chinese homepage renders the interactive ACSIC network explorer', async ({
  page,
}) => {
  await page.goto('./#/zh-TW/');
  await expect(page.getByRole('heading', { name: '探索亞洲信用保證網絡' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ACSIC 網絡探索器' })).toBeVisible();
  if (await page.locator('.network-mobile-economy-control').isVisible()) {
    const selector = page.getByRole('combobox', { name: '選擇國家／經濟體' });
    await expect(selector.locator('option')).toHaveCount(15);
    await expect(selector).toHaveValue('');
  } else {
    await expect(page.getByRole('button', { name: '臺灣' })).toBeVisible();
    await expect(page.getByRole('button', { name: '日本' })).toBeVisible();
    await expect(page.getByRole('button', { name: '韓國' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '亞洲總覽', exact: true })).toBeVisible();
    await expect(page.getByText('選擇一個國家／經濟體，探索當地 ACSIC 機構。')).toBeVisible();
  }
  await chooseHomepageEconomy(page, 'TW', '臺灣', '選擇國家／經濟體');
  await expect(page.getByRole('heading', { name: '臺灣', exact: true })).toBeVisible();
  await expect(page.getByText('觀察員', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: '查看全部會員機構' })).toHaveAttribute(
    'href',
    '#/zh-TW/members',
  );
});

test('English and Traditional Chinese routes, switch and preference memory work', async ({
  page,
}) => {
  await page.goto('./#/en/members');
  await expect(
    page.getByRole('heading', { name: 'ACSIC Institutions', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/members$/);
  await expect(page.getByRole('heading', { name: 'ACSIC 會員機構', exact: true })).toBeVisible();
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
  await expect(page.getByText('21 institutions')).toBeVisible();
  await expect(page.getByText('Interface state preview')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Empty', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Error', exact: true })).toHaveCount(0);
  await expect(page.locator('.directory-card').first()).not.toContainText('Strict Level 2 status');
  await expect(page.locator('.directory-card').first()).not.toContainText('Confidence');
});

test('search and all member filter classes use readable bilingual labels', async ({ page }) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search institutions').fill('ACGF');
  await expect(page.locator('.directory-card')).toHaveCount(1);
  await expect(page.locator('.directory-card .membership-badge--observer')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Economy').selectOption('KR');
  await expect(page.locator('.directory-card')).toHaveCount(3);
  await page
    .getByLabel('Institution type')
    .selectOption('technology_finance_guarantee_institution');
  await expect(page.locator('.directory-card')).toHaveCount(1);
  await expect(page.locator('.directory-card')).not.toContainText(
    'technology_finance_guarantee_institution',
  );
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Membership').selectOption('observer');
  await expect(page.locator('.directory-card')).toHaveCount(1);
});

test('no-results state remains available without production preview controls', async ({ page }) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search institutions').fill('not-a-real-institution');
  await expect(
    page.getByRole('heading', { name: 'No institutions match these filters.' }),
  ).toBeVisible();
});

test('detail view is readable, linked and preserves filter and record when language changes', async ({
  page,
}) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search institutions').fill('JFG');
  await page.getByRole('link', { name: 'View profile' }).click();
  await expect(page).toHaveURL(/#\/en\/institutions\/jfg-jp$/);
  const detail = page.locator('.institution-detail-page');
  await expect(
    detail.getByRole('heading', {
      name: 'Japan Federation of Credit Guarantee Corporations',
      exact: true,
    }),
  ).toBeVisible();
  const research = detail.locator('.research-details');
  await expect(research).not.toHaveAttribute('open', '');
  await research.locator('summary').click();
  await expect(
    research.getByText('一般社団法人 全国信用保証協会連合会 (ja)', { exact: true }),
  ).toBeVisible();
  await expect(
    research.getByRole('heading', { name: 'Documented non-applicable fields' }),
  ).toBeVisible();
  await expect(detail.locator('a[href^="https://www.zenshinhoren.or.jp/"]').first()).toBeVisible();
  await expect(detail.getByRole('link', { name: 'Open official source' }).first()).toHaveAttribute(
    'href',
    /^https:/,
  );
  await expect(detail).not.toContainText('jfg-jp-profile');
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/institutions\/jfg-jp$/);
  await expect(page.getByRole('heading', { name: '日本全國信用保證協會聯合會' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '正式記錄的不適用欄位' })).toBeVisible();
});

test('ASKRINDO exposes low confidence and critical source warning', async ({ page }) => {
  await page.goto('./#/en/institutions/askrindo-id');
  const detail = page.locator('.institution-detail-page');
  await detail.locator('.research-details summary').click();
  await expect(detail.getByText('Pending official-source confirmation')).toBeVisible();
  await expect(detail.getByText('Low ·')).toBeVisible();
  await expect(detail.getByText(/Source warning:/)).toBeVisible();
  await expect(detail.locator('.warning')).toContainText('Temporarily unavailable');
});

test('all 21 institution details can be opened and closed', async ({ page }) => {
  await page.goto('./#/en/members');
  const cards = page.locator('.directory-card');
  await expect(cards).toHaveCount(21);
  const ids = await cards.evaluateAll((items) =>
    items.map((item) => item.getAttribute('data-institution-id')).filter(Boolean),
  );
  for (const id of ids) {
    await page.goto(`./#/en/institutions/${id}`);
    await expect(page.locator('.institution-detail-page h1')).toBeVisible();
    await expect(page.locator('.institution-research-details')).not.toHaveAttribute('open', '');
  }
});

test('source registry statistics, metadata and filters are functional', async ({ page }) => {
  await page.goto('./#/en/sources');
  await expect(page.getByText('76', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('59', { exact: true }).first()).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'Direct guarantee', exact: true })).toBeVisible();
  await expect(page.getByText('commitment letter')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Japan: differentiated institutional roles' }),
  ).toBeVisible();
  await expect(page.getByText('51 credit guarantee corporations')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Credit insurance coverage' })).toBeVisible();
  await expect(page.getByText('70%, 80% or 90% of the subrogated amount')).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Guarantee Coverage Ratio');
  await expect(page.getByRole('heading', { name: 'Direct application model' })).toBeVisible();
  await expect(page.getByText('KODIT branch or online')).toBeVisible();
  await expect(page.getByText('70%–85%')).toBeVisible();
  await expect(page.getByText('90%–100%')).toBeVisible();
  await expect(page.getByText('0.5%–3.0%')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'P-CBO guarantee' })).toBeVisible();
  await expect(page.getByText('capital market')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Republic of Korea: technology appraisal in guarantee review',
    }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AIRATE technology appraisal' })).toBeVisible();
  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/systems$/);
  await expect(page.getByRole('heading', { name: '信用保證制度' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '間接保證' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '信用保險填補比例' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'P-CBO 保證' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AIRATE 技術評價' })).toBeVisible();
});

test('resources publish only ACSIC events with verified official sources', async ({ page }) => {
  await page.goto('./#/en/resources');
  await expect(page.getByRole('heading', { name: 'ACSIC Events' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Global Symposium & 38th ACSIC Conference 2026' }),
  ).toBeVisible();
  await expect(page.getByText('23–24 April 2026')).toBeVisible();
  await expect(page.getByText('The Taj Mahal Palace, Mumbai, India')).toBeVisible();
  await expect(
    page.getByText('Credit Guarantee Fund Trust for Micro and Small Enterprises', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.event-card a[href="https://globalacsic2026.in/"]')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '37th ACSIC Conference 2025' })).toBeVisible();
  await expect(page.getByText('10–14 November 2025')).toBeVisible();
  await expect(page.getByText('Grand Hyatt Taipei, Taiwan')).toBeVisible();
  await expect(
    page.getByText('Small and Medium Enterprise Credit Guarantee Fund of Taiwan', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="https://www.smeg.org.tw/basic/?mode=detail&node=4734"]'),
  ).toHaveCount(1);
  await expect(page.locator('main')).not.toContainText('event archive - planned');
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
  await page.getByLabel('搜尋機構').fill('JFC');
  await expect(page.locator('.directory-card')).toHaveCount(1);
  await expect(page.locator('.directory-card h3')).toContainText('日本政策金融公庫');
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
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

test('comparative framework renders 22 definitions and five readiness rows', async ({ page }) => {
  await page.goto('./#/en/framework');
  await expect(page.getByText('22', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.indicator-group details')).toHaveCount(22);
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
  await expect(page.locator('.indicator-group details')).toHaveCount(22);
  await expect(page.locator('.table-scroll')).toBeVisible();
});

test('English data route publishes current records and keeps readiness behind methodology', async ({
  page,
}) => {
  await page.goto('./#/en/data-pilot');
  await expect(page.getByRole('heading', { name: 'Verified Data' })).toBeVisible();
  await expect(page.getByText('18', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.pilot-record-card')).toHaveCount(13);
  await expect(page.locator('.historical-series')).toBeVisible();
  await page.locator('.historical-series summary').click();
  await expect(page.locator('.historical-series tbody tr')).toHaveCount(10);
  await expect(page.locator('.historical-series')).toContainText('2025');
  await expect(page.locator('.historical-series')).toContainText('2024');
  await expect(page.locator('.readiness-section')).not.toHaveAttribute('open', '');
  await page.locator('.readiness-section summary').click();
  await expect(page.locator('.readiness-section tbody tr')).toHaveCount(22);
  await expect(page.getByText('Verified with limitation').first()).toBeVisible();
  await expect(page.getByText('No chart is displayed')).toBeVisible();
});

test('Guaranteed Loan Volume has bilingual filters, exact provenance and a two-year history', async ({
  page,
}) => {
  const sourceUrl = 'https://www.acgf.org.tw/Page/PageEditor/I6YASZTJ3SLERIRHG52SZEOYWU';
  await page.goto('./#/en/data-pilot');
  await page.getByLabel('Indicator', { exact: true }).selectOption('guaranteed_loan_volume');
  const englishCard = page.locator('.pilot-record-card');
  await expect(englishCard).toHaveCount(1);
  await expect(englishCard).toContainText('Guaranteed Loan Volume');
  await expect(englishCard).toContainText('2025');
  await expect(englishCard).toContainText('TWD 23.928 billion');
  await englishCard.getByText('View source & methodology').click();
  await expect(englishCard).toContainText('23,928,298 新臺幣千元');
  await expect(englishCard).toContainText('年度營運績效');
  await expect(englishCard.getByRole('link', { name: 'Open official source' })).toHaveAttribute(
    'href',
    sourceUrl,
  );
  await englishCard.locator('.provenance-viewer summary').click();

  await page.getByLabel('Language').selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/data-pilot$/);
  await page.getByLabel('指標', { exact: true }).selectOption('guaranteed_loan_volume');
  const chineseCard = page.locator('.pilot-record-card');
  await expect(chineseCard).toHaveCount(1);
  await expect(chineseCard).toContainText('保證貸款金額');
  await expect(chineseCard).toContainText('2025 年');
  await expect(chineseCard).toContainText('約新臺幣 239.283 億元');
  const provenance = chineseCard.locator('.provenance-viewer');
  await provenance.locator('summary').click();
  await expect(provenance).toHaveJSProperty('open', true);
  await expect(chineseCard).toContainText('23,928,298 新臺幣千元');
  await expect(provenance.locator('a.button')).toHaveAttribute('href', sourceUrl);

  await page.getByLabel('指標', { exact: true }).selectOption('all');
  await page.locator('.historical-series summary').click();
  const history = page.locator('.historical-series tbody tr').filter({ hasText: '保證貸款金額' });
  await expect(history).toHaveCount(2);
  await expect(history.nth(0)).toContainText('2025');
  await expect(history.nth(0)).toContainText('約新臺幣 239.283 億元');
  await expect(history.nth(1)).toContainText('2024');
  await expect(history.nth(1)).toContainText('約新臺幣 252.457 億元');
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
  await expect(
    page.locator('.pilot-record-card').filter({ hasText: '2025 年' }).first(),
  ).toBeVisible();
  await expect(page.getByText('截至 2025 年 12 月 31 日', { exact: true })).toHaveCount(4);
  await expect(page.getByText('1974–2025', { exact: true })).toBeVisible();
  await page.locator('.historical-series summary').click();
  await expect(page.locator('.historical-series tbody tr')).toHaveCount(10);
  await expect(page.locator('.historical-series')).toContainText('2024 年');
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
  const jsonDownload = await pending;
  expect(jsonDownload.suggestedFilename()).toBe('acsic-level3-pilot-v1-en.json');
  const jsonPath = await jsonDownload.path();
  if (!jsonPath) throw new Error('JSON download was not saved');
  const jsonExport = JSON.parse(await readFile(jsonPath, 'utf8')) as {
    records: Array<{
      indicatorId: string;
      indicatorLabels: { en: string; 'zh-TW': string } | null;
      reported: { value: number; unit: string };
      source: { sourceId: string };
      period: { calendarYear: number | null };
    }>;
  };
  expect(jsonExport.records).toHaveLength(18);
  const exportedLoanRecords = jsonExport.records.filter(
    (record) => record.indicatorId === 'guaranteed_loan_volume',
  );
  expect(exportedLoanRecords.map((record) => record.period.calendarYear)).toEqual([2024, 2025]);
  expect(exportedLoanRecords.map((record) => record.reported.value)).toEqual([25245745, 23928298]);
  expect(exportedLoanRecords[0]?.indicatorLabels).toEqual({
    en: 'Guaranteed Loan Volume',
    'zh-TW': '保證貸款金額',
  });
  expect(exportedLoanRecords.every((record) => record.reported.unit === '新臺幣千元')).toBe(true);
  expect(
    exportedLoanRecords.every((record) => record.source.sourceId === 'acgf-guarantee-performance'),
  ).toBe(true);
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export pilot CSV' }).click();
  const csvDownload = await pending;
  expect(csvDownload.suggestedFilename()).toBe('acsic-level3-pilot-v1-en.csv');
  const csvPath = await csvDownload.path();
  if (!csvPath) throw new Error('CSV download was not saved');
  const csvExport = await readFile(csvPath, 'utf8');
  expect(csvExport).toContain('"Indicator ID"');
  expect(csvExport).toContain('"Indicator (English)"');
  expect(csvExport).toContain('"Indicator (zh-TW)"');
  expect(csvExport).toContain('"Source ID"');
  expect(csvExport).toContain('"guaranteed_loan_volume"');
  expect(csvExport).toContain('"Guaranteed Loan Volume"');
  expect(csvExport).toContain('"保證貸款金額"');
  expect(csvExport).toContain('"23,928,298"');
  expect(csvExport).toContain('"acgf-guarantee-performance"');
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export readiness CSV' }).click();
  expect((await pending).suggestedFilename()).toBe('acsic-level3-readiness-v1-en.csv');

  await page.getByLabel('Language').selectOption('zh-TW');
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出試辦 JSON' }).click();
  const chineseJsonDownload = await pending;
  expect(chineseJsonDownload.suggestedFilename()).toBe('acsic-level3-pilot-v1-zh-TW.json');
  const chineseJsonPath = await chineseJsonDownload.path();
  if (!chineseJsonPath) throw new Error('Traditional Chinese JSON download was not saved');
  const chineseJson = JSON.parse(await readFile(chineseJsonPath, 'utf8')) as {
    exportedLocale: string;
    records: Array<{ indicatorId: string; reported: { value: number } }>;
  };
  expect(chineseJson.exportedLocale).toBe('zh-TW');
  expect(
    chineseJson.records.some(
      (record) =>
        record.indicatorId === 'guaranteed_loan_volume' && record.reported.value === 23928298,
    ),
  ).toBe(true);
});

test('pilot remains usable at 390px without page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/zh-TW/data-pilot');
  await expect(page.locator('.pilot-record-card')).toHaveCount(13);
  await expect(page.locator('.pilot-toolbar select').first()).toHaveCSS('min-width', '0px');
  await expect(page.locator('.download-details')).not.toHaveAttribute('open', '');
  await page.locator('.pilot-record-card').first().getByText('查看來源與資料處理').click();
  await expect(page.getByText('Knowledge Hub 指標', { exact: true }).first()).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
});

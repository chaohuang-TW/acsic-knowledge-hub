import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { LocalizedText, SourceReference } from '../../src/types';
import type { Level3IndicatorRecord } from '../../src/types/indicators';
import { formatDisplayPeriod } from '../../src/utils/period';

const rawInstitutions = JSON.parse(
  readFileSync(new URL('../../src/data/institutions.json', import.meta.url), 'utf8'),
) as {
  id: string;
  officialEnglish: string;
  zhTw: string;
  status: string;
  mandate: LocalizedText;
}[];
const institutions = rawInstitutions.map((record) => ({
  id: record.id,
  name: { en: record.officialEnglish, 'zh-TW': record.zhTw },
  summary: record.mandate,
  acsicMembershipStatus: record.status,
}));
const sourceRegistry = JSON.parse(
  readFileSync(new URL('../../src/data/sources.json', import.meta.url), 'utf8'),
) as SourceReference[];
const productionLevel3Values = JSON.parse(
  readFileSync(new URL('../../src/data/level3-pilot.json', import.meta.url), 'utf8'),
) as Level3IndicatorRecord[];

async function expectTouchTarget(control: Locator) {
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
}

async function expectNoOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} directory keeps every full name and original summary accessible`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`./#/${locale}/members`);
    const cards = page.locator('.directory-card');
    await expect(cards).toHaveCount(institutions.length);
    await expect(page.locator('.economy-group')).toHaveCount(14);
    await expect(page.locator('.directory-card__economy')).toHaveCount(0);
    await expect(page.locator('.economy-group__eyebrow')).toHaveCount(0);

    for (const institution of institutions) {
      const card = page.locator(`.directory-card[data-institution-id="${institution.id}"]`);
      await expect(
        card.getByRole('heading', { name: institution.name[locale], exact: true }),
      ).toBeVisible();
      await expect(card.locator('.directory-card__summary')).toHaveText(
        institution.summary[locale],
      );
      await expect(card.locator('.membership-badge')).toHaveAttribute(
        'data-membership',
        institution.acsicMembershipStatus,
      );
      await expect(card.getByRole('link').first()).toHaveAttribute(
        'href',
        `#/${locale}/institutions/${institution.id}`,
      );
    }

    const longSummary = page.locator('.directory-card[data-institution-id="cbsl-lk"]');
    const disclosure = longSummary.locator('details');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expectTouchTarget(disclosure.locator('summary'));
    await disclosure.locator('summary').click();
    await expect(longSummary.locator('.directory-card__summary')).toBeVisible();
    await expect(longSummary.locator('.directory-card__summary')).toHaveCSS('font-size', '16px');
    await expect(longSummary.locator('.directory-card__summary')).toHaveCSS(
      '-webkit-line-clamp',
      'none',
    );
    await expectNoOverflow(page);
  });
}

test('directory high-frequency controls are sized without overlapping action links', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/en/members');
  await expectTouchTarget(page.getByRole('searchbox', { name: 'Search institutions' }));
  await expectTouchTarget(page.getByRole('combobox', { name: 'Economy', exact: true }));
  await page.getByRole('searchbox', { name: 'Search institutions' }).fill('KODIT');
  await expect(page.locator('.directory-card')).toHaveCount(1);
  const card = page.locator('.directory-card');
  const profile = card.getByRole('link', { name: 'View profile', exact: true });
  const official = card.getByRole('link', { name: 'Official website ↗', exact: true });
  await expectTouchTarget(profile);
  await expectTouchTarget(official);
  const profileBox = (await profile.boundingBox())!;
  const officialBox = (await official.boundingBox())!;
  expect(officialBox.y - (profileBox.y + profileBox.height)).toBeGreaterThanOrEqual(7);
  await expectTouchTarget(page.getByRole('button', { name: 'Clear filters', exact: true }));
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.locator('.directory-card')).toHaveCount(institutions.length);
});

test('data filters retain each record period, currency, limitations and own source', async ({
  page,
}) => {
  await page.goto('./#/en/data-pilot');
  await page
    .getByRole('combobox', { name: 'Indicator', exact: true })
    .selectOption('new_guarantee_volume');
  await expect(page.locator('.pilot-record-card')).toHaveCount(3);
  const expectedRecords = productionLevel3Values.filter(
    (record) =>
      record.indicatorId === 'new_guarantee_volume' &&
      record.recordId !== 'acgf-cy2024-guarantee-amount',
  );
  for (const record of expectedRecords) {
    const card = page.locator(`[data-record-id="${record.recordId}"]`);
    const reading = card.locator('.record-reading');
    await expect(reading.locator('dt')).toHaveText([
      'Value',
      'Reporting period',
      'Original currency',
    ]);
    await expect(reading.locator('dd').nth(1)).toHaveText(formatDisplayPeriod(record.period, 'en'));
    await expect(reading.locator('dd').nth(2)).toHaveText(record.reported.currency!);
    const source = sourceRegistry.find((item) => item.sourceId === record.source.sourceId)!;
    await expect(card.locator('.record-source a')).toHaveAttribute('href', source.url);
    await expect(card.locator('.record-definition')).toHaveText(record.reported.definition.en);
    await expect(card.locator('.record-limitations')).toContainText(
      record.comparability.issues.en.join(' '),
    );
  }
  const jfc = page.locator('[data-record-id="jfc-fy2024-insurance-acceptance"]');
  await expect(jfc.locator('.record-reading')).toContainText('FY2024');
  await expect(jfc.locator('.record-reading')).toContainText('JPY');
  await expect(jfc.locator('.record-definition')).toContainText('Insurance acceptances');
  await page.getByRole('combobox', { name: 'Institution', exact: true }).selectOption('acgf-tw');
  const acgf = page.locator('[data-record-id="acgf-cy2025-guarantee-amount"]');
  await expect(page.locator('.pilot-record-card')).toHaveCount(1);
  await expect(acgf.locator('.record-reading')).not.toContainText('FY2024');
  await expect(acgf.locator('.record-reading')).not.toContainText('JPY');
  await expect(acgf.locator('.record-reading')).toContainText('TWD 18.481 billion');
  await expect(acgf.locator('.record-reading dd').filter({ hasText: '18.481' })).toHaveCount(1);
  await acgf.locator('.provenance-viewer summary').click();
  await expect(acgf.locator('.provenance-viewer')).toContainText('18,480,910 新臺幣千元');
  await expect(
    acgf
      .locator('.methodology-grid > div')
      .filter({ has: page.getByText('Data year', { exact: true }) })
      .locator('dd'),
  ).toHaveText('2025');
  await expect(
    acgf
      .locator('.methodology-grid > div')
      .filter({ has: page.getByText('Publication year', { exact: true }) })
      .locator('dd'),
  ).toHaveText('2026');
});

test('data loan and guarantee amounts remain distinct after a language switch', async ({
  page,
}) => {
  await page.goto('./#/en/data-pilot');
  await page.getByRole('combobox', { name: 'Institution', exact: true }).selectOption('acgf-tw');
  await page
    .getByRole('combobox', { name: 'Indicator', exact: true })
    .selectOption('guaranteed_loan_volume');
  const loan = page.locator('[data-record-id="acgf-cy2025-guaranteed-loan-volume"]');
  await expect(
    loan.getByRole('heading', { name: 'Guaranteed Loan Volume', exact: true }),
  ).toBeVisible();
  await expect(loan.locator('.record-reading')).toContainText('TWD 23.928 billion');
  await expect(loan.locator('.record-limitations')).toContainText(
    'distinct from guarantee obligation amount',
  );
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('zh-TW');
  await expect(page).toHaveURL(/#\/zh-TW\/data-pilot$/);
  await expect(loan.getByRole('heading', { name: '保證貸款金額', exact: true })).toBeVisible();
  await expect(loan.locator('.record-reading')).toContainText('約新臺幣 239.283 億元');
  await expect(loan.locator('.record-limitations')).toContainText(
    '此貸款本金指標與保證責任金額不同。',
  );
  await page
    .getByRole('combobox', { name: '指標', exact: true })
    .selectOption('new_guarantee_volume');
  const guarantee = page.locator('[data-record-id="acgf-cy2025-guarantee-amount"]');
  await expect(
    guarantee.getByRole('heading', { name: '當期新增保證金額', exact: true }),
  ).toBeVisible();
  await expect(guarantee.locator('.record-reading')).toContainText('約新臺幣 184.809 億元');
  await expect(loan).toHaveCount(0);
  await page.locator('.historical-series summary').click();
  await expect(page.locator('.historical-series tbody tr')).toHaveCount(10);
  await expect(page.locator('.historical-series')).toContainText('2024');
  await expect(page.locator('.historical-series')).toContainText('2025');
});

test('empty data filter results explain the state and clear both filters in either language', async ({
  page,
}) => {
  for (const locale of ['en', 'zh-TW']) {
    const institutionLabel = locale === 'en' ? 'Institution' : '機構';
    const indicatorLabel = locale === 'en' ? 'Indicator' : '指標';
    await page.goto(`./#/${locale}/data-pilot`);
    await page
      .getByRole('combobox', { name: institutionLabel, exact: true })
      .selectOption('jfc-jp');
    await page
      .getByRole('combobox', { name: indicatorLabel, exact: true })
      .selectOption('guaranteed_loan_volume');
    const empty = page.locator('.pilot-records').getByRole('status');
    await expect(empty).toHaveCount(1);
    await expect(empty.getByRole('heading')).toHaveText(
      locale === 'en'
        ? 'No verified records match these filters.'
        : '沒有符合目前篩選條件的已查證資料。',
    );
    await expect(page.locator('.pilot-record-card')).toHaveCount(0);
    await empty
      .getByRole('button', { name: locale === 'en' ? 'Clear filters' : '清除篩選', exact: true })
      .click();
    await expect(page.getByRole('combobox', { name: institutionLabel, exact: true })).toHaveValue(
      'all',
    );
    await expect(page.getByRole('combobox', { name: indicatorLabel, exact: true })).toHaveValue(
      'all',
    );
    await expect(page.locator('.pilot-record-card')).toHaveCount(13);
    await expect(empty).toHaveCount(0);
  }
});

test('directory and data remain readable at 320px with root-font 200% approximation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of ['members', 'data-pilot']) {
    await page.goto(`./#/zh-TW/${route}`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await expectNoOverflow(page);
    if (route === 'members') {
      await page.getByRole('searchbox', { name: '搜尋機構' }).fill('ACGF');
      const card = page.locator('.directory-card');
      await expect(card).toHaveCount(1);
      await card.locator('summary').click();
      await expect(card.locator('.directory-card__summary')).toBeVisible();
      await expect(card.getByRole('link', { name: '查看機構檔案', exact: true })).toBeVisible();
    } else {
      await page.getByRole('combobox', { name: '機構', exact: true }).selectOption('acgf-tw');
      await page
        .getByRole('combobox', { name: '指標', exact: true })
        .selectOption('guaranteed_loan_volume');
      await page.locator('.provenance-viewer summary').click();
      await expect(page.locator('.provenance-viewer')).toContainText('23,928,298 新臺幣千元');
    }
    await expectNoOverflow(page);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
    });
  }
});

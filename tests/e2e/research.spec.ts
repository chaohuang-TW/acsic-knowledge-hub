import { expect, test } from '@playwright/test';

test('international default opens the English route and shows an unofficial statement', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('./');
  await expect(page).toHaveURL(/acsic-knowledge-hub\/#\/en\/$/);
  await expect(
    page.getByRole('heading', { name: 'Credit guarantee knowledge, connected across Asia' }),
  ).toBeVisible();
  await expect(page.getByText('Independent, unofficial platform')).toBeVisible();
  await expect(page.getByText('ACSIC Knowledge Hub').first()).toBeVisible();
});

test('English and Traditional Chinese routes, switching and preference memory work', async ({
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

test('the five future information architecture pages are bilingual and contain no invented filler', async ({
  page,
}) => {
  await page.goto('./#/en/');
  for (const [link, heading] of [
    ['ACSIC Overview', 'ACSIC Overview'],
    ['Member Institutions', 'Member Institutions'],
    ['Credit Guarantee Systems', 'Credit Guarantee Systems'],
    ['Knowledge & Practices', 'Knowledge & Practices'],
    ['Events & Resources', 'Events & Resources'],
  ]) {
    await page.getByRole('link', { name: link, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await page.goto('./#/zh-TW/systems');
  await expect(page.getByRole('heading', { name: '制度檔案準備中' })).toBeVisible();
});

test('member search, empty and error states and source-language details are bilingual', async ({
  page,
}) => {
  await page.goto('./#/en/members');
  await page.getByLabel('Search').fill('ACGF');
  await expect(page.getByText('1 official institution records')).toBeVisible();
  await page.getByLabel('Search').fill('not-a-real-institution');
  await expect(page.getByRole('heading', { name: 'No matching results' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).last().click();
  await page.getByRole('button', { name: 'Empty' }).click();
  await expect(page.getByRole('heading', { name: 'No public records' })).toBeVisible();
  await page.getByRole('button', { name: 'Error' }).click();
  await expect(page.getByRole('alert')).toContainText('Public data could not be loaded');
  await page.getByRole('button', { name: 'Return to data' }).click();
  await page.getByRole('button', { name: 'View profile' }).first().click();
  await expect(page.getByRole('heading', { name: 'Official sources' })).toBeVisible();
  await expect(page.getByText('Original language').first()).toBeVisible();
});

test('comparison exports English and Traditional Chinese branded filenames', async ({ page }) => {
  await page.goto('./#/en/compare');
  for (const [label, extension] of [
    ['Export Markdown', 'md'],
    ['Export CSV', 'csv'],
    ['Export JSON', 'json'],
  ]) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: label }).click();
    expect((await pending).suggestedFilename()).toBe(
      `acsic-knowledge-hub-comparison-en.${extension}`,
    );
  }
  await page.getByLabel('Export language').selectOption('zh-TW');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Markdown' }).click();
  expect((await pending).suggestedFilename()).toBe('acsic-knowledge-hub-comparison-zh-TW.md');
});

test('reports can export both languages without an external translation service', async ({
  page,
}) => {
  await page.goto('./#/en/reports');
  await expect(page.locator('.report-preview pre')).toContainText('## Official sources');
  await page.getByLabel('Report language').selectOption('zh-TW');
  await expect(page.locator('.report-preview pre')).toContainText('## 官方來源');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Markdown' }).click();
  expect((await pending).suggestedFilename()).toBe('acsic-knowledge-hub-executive-zh-TW.md');
});

test('mobile navigation, language selector and member cards remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/zh-TW/members');
  await expect(page.getByRole('navigation', { name: '主要導覽' })).toBeVisible();
  await expect(page.getByLabel('語言')).toBeVisible();
  await expect(page.getByRole('button', { name: '檢視機構檔案' }).first()).toBeVisible();
});

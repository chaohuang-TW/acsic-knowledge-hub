import { expect, test } from '@playwright/test';

test('首頁以子路徑載入並持續顯示非官方與 DEMO 提示', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveURL(/acgf-strategy-os-demo\/$/);
  await expect(
    page.getByRole('heading', { name: '把制度資料變成可查證的知識工作流程' }),
  ).toBeVisible();
  await expect(page.getByText('本網站為個人 AI 知識管理與介面設計實驗').first()).toBeVisible();
  await expect(page.getByText('DEMO 示範資料').first()).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('img[src*="knowledge-flow.png"]')).toBeVisible();
});

test('八個頁面可導覽，重新整理後保留目前頁面', async ({ page }) => {
  await page.goto('./');
  const destinations = [
    ['系統概念', '系統概念'],
    ['示範資料庫', '示範機構資料庫'],
    ['跨機構比較', '跨機構比較'],
    ['報告範本', '報告範本展示'],
    ['資料治理', '資料治理方法'],
    ['關於本實驗', '關於本實驗'],
    ['免責聲明', '免責聲明'],
  ];
  for (const [link, heading] of destinations) {
    await page.getByRole('link', { name: link, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await page.reload();
  await expect(page.getByRole('heading', { name: '免責聲明', exact: true })).toBeVisible();
});

test('機構頁支援搜尋、無結果、空資料、錯誤與詳細來源狀態', async ({ page }) => {
  await page.goto('./#/institutions');
  const search = page.getByLabel('關鍵字搜尋');
  await search.fill('東嶼');
  await expect(page.getByText('顯示 1 筆 DEMO 示範資料')).toBeVisible();
  await search.fill('不存在的機構');
  await expect(page.getByRole('heading', { name: '沒有符合條件的結果' })).toBeVisible();
  await page.locator('.state-message').getByRole('button', { name: '清除篩選' }).click();
  await page.getByRole('button', { name: '空資料' }).click();
  await expect(page.getByRole('heading', { name: '目前沒有示範資料' })).toBeVisible();
  await page.getByRole('button', { name: '載入錯誤' }).click();
  await expect(page.getByRole('alert')).toContainText('示範資料載入失敗');
  await page.getByRole('button', { name: '返回正常資料' }).click();
  await page.getByRole('button', { name: '檢視詳細資料' }).first().click();
  await expect(page.getByRole('heading', { name: '示範來源' })).toBeVisible();
  await expect(page.getByText('https://east-isle-research.invalid/charter')).toBeVisible();
});

test('比較頁限制二至四筆並可匯出三種格式', async ({ page }) => {
  await page.goto('./#/compare');
  await expect(page.getByRole('heading', { name: 'DEMO 比較表' })).toBeVisible();
  for (const [name, filename] of [
    ['匯出 Markdown', 'demo-comparison.md'],
    ['匯出 CSV', 'demo-comparison.csv'],
    ['匯出 JSON', 'demo-comparison.json'],
  ]) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(filename);
  }
  await page.getByLabel('東嶼國農業信用保證局').uncheck();
  await expect(page.getByRole('heading', { name: '請至少選擇兩筆資料' })).toBeVisible();
});

test('五種報告範本皆可預覽並下載', async ({ page }) => {
  await page.goto('./#/reports');
  const select = page.getByLabel('報告類型');
  for (const option of ['executive', 'country', 'comparison', 'meeting-qa', 'presentation']) {
    await select.selectOption(option);
    await expect(page.locator('.report-preview pre')).toContainText('# DEMO');
  }
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出 Markdown' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('demo-presentation.md');
});

test('鍵盤可抵達略過連結與主要導覽', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳至主要內容' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: '主要導覽' })).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('首頁以 Pages 子路徑載入並顯示非官方研究聲明', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveURL(/acgf-strategy-os-demo\/$/);
  await expect(
    page.getByRole('heading', { name: '把公開制度資料變成可查證的知識工作流程' }),
  ).toBeVisible();
  await expect(page.getByText('本網站為個人研究與 AI 知識管理實驗').first()).toBeVisible();
  await expect(page.getByText('官方公開資料研究版').first()).toBeVisible();
  await expect(page.locator('img[src*="knowledge-flow.png"]')).toBeVisible();
});

test('九個頁面可導覽且重新整理保留 Hash 路由', async ({ page }) => {
  await page.goto('./');
  const destinations = [
    ['系統概念', '系統概念'],
    ['公開資料研究庫', '公開資料研究庫'],
    ['跨機構比較', '跨機構比較'],
    ['報告範本', '報告範本'],
    ['資料來源', '資料來源'],
    ['資料治理', '資料治理方法'],
    ['關於本研究', '關於本研究'],
    ['免責聲明', '免責聲明'],
  ];
  for (const [link, heading] of destinations) {
    await page.getByRole('link', { name: link, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await page.reload();
  await expect(page.getByRole('heading', { name: '免責聲明', exact: true })).toBeVisible();
});

test('研究庫支援搜尋、狀態與官方來源詳細資料', async ({ page }) => {
  await page.goto('./#/institutions');
  await page.getByLabel('關鍵字搜尋').fill('ACGF');
  await expect(page.getByText('顯示 1 筆官方公開資料紀錄')).toBeVisible();
  await page.getByLabel('關鍵字搜尋').fill('不存在的機構');
  await expect(page.getByRole('heading', { name: '沒有符合條件的結果' })).toBeVisible();
  await page.locator('.state-message').getByRole('button', { name: '清除篩選' }).click();
  await page.getByRole('button', { name: '空資料' }).click();
  await expect(page.getByRole('heading', { name: '目前沒有公開資料' })).toBeVisible();
  await page.getByRole('button', { name: '載入錯誤' }).click();
  await expect(page.getByRole('alert')).toContainText('公開資料載入失敗');
  await page.getByRole('button', { name: '返回正常資料' }).click();
  await page.getByRole('button', { name: '檢視詳細資料' }).first().click();
  await expect(page.getByRole('heading', { name: '官方來源' })).toBeVisible();
  await expect(
    page.getByText('https://www.acgf.org.tw/Page/PageEditor/E3IMAXWR5PUUPJ6B7M4CHQPSWE'),
  ).toBeVisible();
});

test('比較限制二至四筆並下載三種格式', async ({ page }) => {
  await page.goto('./#/compare');
  await expect(page.getByRole('heading', { name: '公開資料比較表' })).toBeVisible();
  for (const [name, filename] of [
    ['匯出 Markdown', 'institution-comparison.md'],
    ['匯出 CSV', 'institution-comparison.csv'],
    ['匯出 JSON', 'institution-comparison.json'],
  ]) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name }).click();
    expect((await pending).suggestedFilename()).toBe(filename);
  }
  await page.getByLabel(/財團法人農業信用保證基金/).uncheck();
  await expect(page.getByRole('heading', { name: '請至少選擇兩筆資料' })).toBeVisible();
});

test('五種報告可預覽及下載', async ({ page }) => {
  await page.goto('./#/reports');
  const select = page.getByLabel('報告類型');
  for (const option of ['executive', 'country', 'comparison', 'meeting-qa', 'presentation']) {
    await select.selectOption(option);
    await expect(page.locator('.report-preview pre')).toContainText('## 官方來源');
  }
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出 Markdown' }).click();
  expect((await pending).suggestedFilename()).toBe('research-presentation.md');
});

test('資料來源頁可依國家與文件類型篩選並開啟官方連結', async ({ page }) => {
  await page.goto('./#/sources');
  await expect(page.getByText('顯示 18 筆官方來源')).toBeVisible();
  await page.getByLabel('國家').selectOption('日本');
  await expect(page.getByText('顯示 4 筆官方來源')).toBeVisible();
  await page.getByLabel('文件類型').selectOption('official_index');
  await expect(page.getByText('顯示 2 筆官方來源')).toBeVisible();
  await expect(page.getByRole('link', { name: '開啟官方來源' }).first()).toHaveAttribute(
    'href',
    /^https:\/\//,
  );
});

test('手機版主要內容、導覽與資料卡可使用', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/institutions');
  await expect(page.getByRole('navigation', { name: '主要導覽' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '公開資料研究庫' })).toBeVisible();
  await expect(page.getByRole('button', { name: '檢視詳細資料' }).first()).toBeVisible();
});

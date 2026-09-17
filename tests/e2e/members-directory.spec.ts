import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test.describe('ACSIC Members Directory', () => {
  test('shows the complete governed boundary grouped by economy', async ({ page }) => {
    await page.goto('./#/en/members');
    await expect(
      page.getByRole('heading', { name: 'ACSIC Institutions', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Explore all ACSIC member institutions and the platform's current observer record by economy, institutional role and mandate.",
      ),
    ).toBeVisible();
    await expect(page.locator('.directory-stats dd')).toHaveText(['20', '14', '1']);
    await expect(page.locator('.directory-card')).toHaveCount(21);
    await expect(page.locator('.economy-group')).toHaveCount(14);
    await expect(page.locator('[data-membership="observer"]')).toHaveCount(1);
    await expect(page.locator('.directory-card').first()).not.toContainText('Level 2');
    await expect(page.locator('.directory-card').first()).not.toContainText('Confidence');
    await expect(
      page.locator('.directory-card').first().getByRole('link', { name: 'View profile' }),
    ).toHaveAttribute('href', /^#\/en\/institutions\//);
  });

  test('combines search and all filters and clears without reload', async ({ page }) => {
    await page.goto('./#/en/members');
    await page.getByLabel('Search institutions').fill('KODIT');
    await expect(page.locator('.directory-card')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'Korea Credit Guarantee Fund', exact: true }),
    ).toBeVisible();
    await page.locator('.directory-filters').getByRole('button', { name: 'Clear filters' }).click();
    await page.getByLabel('Economy').selectOption('TW');
    await page.getByLabel('Membership').selectOption('member');
    await expect(page.locator('.directory-card')).toHaveCount(1);
    await expect(page.locator('.directory-card')).toContainText('TSMEG');
    await expect(page.locator('.directory-card')).not.toContainText('ACGF');
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeEnabled();
    await page.locator('.directory-filters').getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('.directory-card')).toHaveCount(21);
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeDisabled();
    await page.getByLabel('Search institutions').fill('zzzz-no-institution');
    await expect(
      page.getByRole('heading', { name: 'No institutions match these filters.' }),
    ).toBeVisible();
    await page.locator('.directory-filters').getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('.directory-card')).toHaveCount(21);
  });

  test('provides deep profile and official website actions', async ({ page }) => {
    await page.goto('./#/en/members');
    const kodit = page.locator('[data-institution-id="kodit-kr"]');
    await expect(kodit.getByRole('link', { name: 'View profile' })).toHaveAttribute(
      'href',
      '#/en/institutions/kodit-kr',
    );
    const website = kodit.getByRole('link', { name: 'Official website ↗' });
    await expect(website).toHaveAttribute('href', /^https:\/\//);
    await expect(website).toHaveAttribute('target', '_blank');
    await expect(website).toHaveAttribute('rel', 'noreferrer');
    await kodit.getByRole('link', { name: 'View profile' }).click();
    await expect(page).toHaveURL(/#\/en\/institutions\/kodit-kr$/);
    await expect(page.getByRole('heading', { name: 'Korea Credit Guarantee Fund' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to all institutions' }).click();
    await expect(page).toHaveURL(/#\/en\/members$/);
    await expect(page.locator('.directory-card')).toHaveCount(21);
  });

  test('keeps the directory bilingual', async ({ page }) => {
    await page.goto('./#/zh-TW/members');
    await expect(page.getByRole('heading', { name: 'ACSIC 會員機構', exact: true })).toBeVisible();
    await expect(page.getByLabel('搜尋機構')).toBeVisible();
    await expect(page.getByLabel('國家／經濟體')).toBeVisible();
    await expect(page.getByLabel('機構類型')).toBeVisible();
    await expect(page.getByLabel('會員身分')).toBeVisible();
    await expect(page.getByRole('heading', { name: '臺灣', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: '日本', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: '韓國', exact: true })).toBeVisible();
    await expect(page.getByText('正式會員', { exact: true }).first()).toBeVisible();
    await expect(page.locator('.directory-card .membership-badge--observer')).toHaveCount(1);
    await expect(page.getByRole('link', { name: '查看機構檔案' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '官方網站 ↗' }).first()).toBeVisible();
    await page.getByLabel('搜尋機構').fill('信用保證基金');
    expect(await page.locator('.directory-card').count()).toBeGreaterThan(0);
  });

  test('is usable at 390px and 320px without overflow', async ({ page }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('./#/en/members');
      await expect(page.getByLabel('Search institutions')).toBeVisible();
      await expect(page.locator('.directory-card')).toHaveCount(21);
      await expectNoHorizontalOverflow(page);
      await page.getByLabel('Search institutions').fill('Republic of Korea');
      await expect(page.locator('.directory-card')).toHaveCount(3);
      await expectNoHorizontalOverflow(page);
      await page.getByLabel('Search institutions').fill('');
    }
  });
});

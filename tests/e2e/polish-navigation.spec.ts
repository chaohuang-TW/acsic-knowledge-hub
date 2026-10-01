import { expect, test } from '@playwright/test';

test.use({ trace: 'on' });

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} mobile home has one introduction and DOM-aligned economy selection`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`./#/${locale}/`);
    await expect(page.locator('.atlas-home-copy h1')).toHaveCount(1);
    await expect(page.locator('.atlas-home-copy > p')).toHaveCount(1);
    await expect(page.locator('.network-explorer-heading p')).toHaveCount(0);
    await expect(page.locator('.network-overview-panel p')).toHaveCount(0);
    await expect(page.locator('.network-schematic-note')).toHaveCount(1);
    const selector = page.getByRole('combobox', {
      name: locale === 'en' ? 'Choose an economy' : '選擇國家／經濟體',
      exact: true,
    });
    await expect(selector).toBeVisible();
    const ordering = await selector.evaluate((element) => {
      const map = document.querySelector('[data-testid="asia-map-stage"]')!;
      return {
        domBefore: Boolean(element.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING),
        visualBefore: element.getBoundingClientRect().bottom <= map.getBoundingClientRect().top,
      };
    });
    expect(ordering).toEqual({ domBefore: true, visualBefore: true });
  });

  test(`${locale} profile has one directory return, official action and restored context`, async ({
    page,
  }) => {
    await page.goto(`./#/${locale}/members?q=KODIT`);
    const card = page.locator('.directory-card[data-institution-id="kodit-kr"]');
    await expect(card).toBeVisible();
    await card
      .getByRole('link', { name: locale === 'en' ? 'View profile' : '查看機構檔案', exact: true })
      .click();
    const hero = page.locator('.institution-profile-hero');
    await expect(hero.locator(`a[href="#/${locale}/members"]`)).toHaveCount(1);
    await expect(hero.locator('.institution-profile-actions .button')).toHaveCount(1);
    await expect(hero.locator('.institution-profile-actions a')).toHaveAttribute(
      'href',
      /^https:\/\//,
    );
    const other = locale === 'en' ? 'zh-TW' : 'en';
    await page
      .getByRole('combobox', { name: locale === 'en' ? 'Language' : '語言', exact: true })
      .selectOption(other);
    await expect(page).toHaveURL(new RegExp(`#/${other}/institutions/kodit-kr$`));
    await page.reload();
    await page.locator('.institution-back-link').click();
    await expect(page.getByRole('searchbox')).toHaveValue('KODIT');
    await expect(page.locator('.directory-card')).toHaveCount(1);
  });
}

test('legacy institution directory query normalizes once, preserves language and browser history', async ({
  page,
}) => {
  await page.goto('./#/zh-TW/');
  await page.getByRole('combobox', { name: '語言', exact: true }).selectOption('en');
  await page.evaluate(() => {
    window.location.hash = '/institutions?q=KODIT&membership=member';
  });
  await expect(page).toHaveURL(/#\/en\/members\?q=KODIT&membership=member$/);
  await expect(page.getByRole('searchbox')).toHaveValue('KODIT');
  await expect(page.locator('.directory-card')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('KODIT');
  await page.goBack();
  await expect(page).toHaveURL(/#\/en\/$/);
});

test('legacy normalization does not swallow details or redirect parameters', async ({ page }) => {
  await page.goto('./#/institutions/kodit-kr?q=KODIT');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not in the atlas');
  await page.goto('./#/institutions?q=KODIT&next=https%3A%2F%2Fexample.invalid');
  await expect(page).toHaveURL(/#\/en\/members\?/);
  await expect(page.locator('.directory-card')).toHaveCount(1);
  expect(new URL(page.url()).hostname).toBe('127.0.0.1');
});

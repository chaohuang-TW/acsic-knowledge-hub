import { expect, test } from '@playwright/test';

test('bilingual presentation fits all required breakpoints without changing routes', async ({
  page,
}) => {
  for (const width of [1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ['en', 'zh-TW']) {
      for (const route of ['', 'members', 'institutions/kodit-kr']) {
        await page.goto(`#/${locale}/${route}`);
        await expect(page.locator('h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
  }
});

test('theme keeps readable text, visible keyboard focus and reduced-motion feedback', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('#/en/members');
  const palette = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const luminance = (hex: string) => {
      const c = hex.trim().replace('#', '');
      const rgb = [0, 2, 4]
        .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const ratio = (a: string, b: string) => {
      const x = luminance(style.getPropertyValue(a));
      const y = luminance(style.getPropertyValue(b));
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    return {
      body: ratio('--text', '--porcelain'),
      muted: ratio('--muted', '--surface'),
      button: ratio('--accent-strong', '--surface'),
    };
  });
  expect(palette.body).toBeGreaterThanOrEqual(4.5);
  expect(palette.muted).toBeGreaterThanOrEqual(4.5);
  expect(palette.button).toBeGreaterThanOrEqual(4.5);
  await page.keyboard.press('Tab');
  expect(await page.locator(':focus-visible').count()).toBeGreaterThan(0);
  const search = page.getByRole('searchbox', { name: 'Search institutions' });
  await search.fill('KODIT');
  await expect(page.locator('.directory-card')).toHaveCount(1);
  expect(
    await page.locator('.directory-card').evaluate((e) => getComputedStyle(e).transitionDuration),
  ).toBe('0s');
});

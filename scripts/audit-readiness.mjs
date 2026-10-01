// Audit rendered route content, never a Suspense shell. Loading-state usability
// has its own deliberately blocked-chunk browser regression cases.
export async function waitForAuditReady(page, route, timeoutMs = 15_000) {
  const headingSelector = route.startsWith('acgf-')
    ? '.institution-profile-hero h1'
    : '#main-content h1';
  const heading = page.locator(headingSelector).first();
  await heading.waitFor({ state: 'visible', timeout: timeoutMs });
  await page.locator('.page-loading').waitFor({ state: 'hidden', timeout: timeoutMs });
  if (route.startsWith('home-')) {
    await page
      .locator('.network-standard-shell, [data-testid="asia-map-stage"]')
      .first()
      .waitFor({ state: 'visible', timeout: timeoutMs });
    await page
      .locator('.network-explorer-skeleton')
      .waitFor({ state: 'hidden', timeout: timeoutMs });
  }
  const mainHeading = await heading.innerText();
  if (['This page could not be loaded', '此頁面暫時無法載入'].includes(mainHeading))
    throw new Error('The requested audit route failed to load');
  return { status: 'ready', mainHeading };
}

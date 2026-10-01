import { describe, expect, it } from 'vitest';
// @ts-expect-error QA-only JavaScript helper has no application type contract.
import { waitForAuditReady } from '../scripts/audit-readiness.mjs';

function observedPage(failOn?: string, headingText = 'Rendered route heading') {
  const waits: { selector: string; state: string; timeout: number }[] = [];
  const locator = (selector: string) => ({
    first: () => locator(selector),
    waitFor: async (options: { state: string; timeout: number }) => {
      waits.push({ selector, ...options });
      if (selector === failOn) throw new Error('Requested content is still loading');
    },
    innerText: async () => headingText,
  });
  return { page: { locator }, waits };
}

describe('audit route readiness', () => {
  it('waits for actual route heading and excludes the page loading shell', async () => {
    const { page, waits } = observedPage();
    await expect(waitForAuditReady(page, 'members-en')).resolves.toEqual({
      status: 'ready',
      mainHeading: 'Rendered route heading',
    });
    expect(waits).toEqual([
      { selector: '#main-content h1', state: 'visible', timeout: 15000 },
      { selector: '.page-loading', state: 'hidden', timeout: 15000 },
    ]);
  });

  it('requires the real profile rather than an error or loading heading', async () => {
    const { page, waits } = observedPage();
    await waitForAuditReady(page, 'acgf-zh-TW');
    expect(waits[0]?.selector).toBe('.institution-profile-hero h1');
  });

  it('requires a usable explorer and no skeleton on home', async () => {
    const { page, waits } = observedPage();
    await waitForAuditReady(page, 'home-en', 2000);
    expect(waits.slice(-2)).toEqual([
      {
        selector: '.network-standard-shell, [data-testid="asia-map-stage"]',
        state: 'visible',
        timeout: 2000,
      },
      { selector: '.network-explorer-skeleton', state: 'hidden', timeout: 2000 },
    ]);
  });

  it('fails closed when requested content never becomes available', async () => {
    const { page } = observedPage('.institution-profile-hero h1');
    await expect(waitForAuditReady(page, 'acgf-en', 100)).rejects.toThrow('still loading');
  });

  it('does not accept a page-load error as the requested route', async () => {
    const { page } = observedPage(undefined, 'This page could not be loaded');
    await expect(waitForAuditReady(page, 'data-en')).rejects.toThrow('failed to load');
  });
});

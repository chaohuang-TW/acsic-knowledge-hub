import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '../src/pages/HomePage';
import NetworkExplorer from '../src/features/network-explorer/NetworkExplorer';
import { InstitutionDetailPage } from '../src/features/institutions/InstitutionDetailPage';
import { LocaleContext } from '../src/i18n';
import type { Locale } from '../src/types';

describe('polished reading structure', () => {
  for (const locale of ['en', 'zh-TW'] as const) {
    const wrap = (content: React.ReactNode) => (
      <LocaleContext.Provider value={{ locale: locale as Locale, setLocale: () => {} }}>
        {content}
      </LocaleContext.Provider>
    );

    it(`${locale} home has one H1, concise explorer and selector before map`, () => {
      const html = renderToStaticMarkup(wrap(<HomePage />));
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('role="search"');
      // The explorer is now code-split; retain its complete reading-order
      // assertions by rendering the real component, not an empty placeholder.
      const explorer = renderToStaticMarkup(wrap(<NetworkExplorer locale={locale} />));
      expect(html).not.toContain('Choose an economy to explore its ACSIC institutions across');
      expect(html).not.toContain('選擇一個國家／經濟體，探索亞洲各地');
      expect(explorer.indexOf('network-mobile-economy-control')).toBeGreaterThan(-1);
      expect(explorer.indexOf('network-mobile-economy-control')).toBeLessThan(
        explorer.indexOf('data-testid="asia-map-stage"'),
      );
      expect(explorer.match(/class="network-schematic-note"/g)).toHaveLength(1);
    });

    it(`${locale} profile keeps exactly one directory return and official website`, () => {
      const html = renderToStaticMarkup(wrap(<InstitutionDetailPage institutionId="acgf-tw" />));
      expect(html.match(new RegExp(`href="#/${locale}/members"`, 'g'))).toHaveLength(1);
      expect(html).toContain('href="https://www.acgf.org.tw/"');
      expect(html).toContain(`href="#/${locale}/"`);
      expect(html).toContain(locale === 'en' ? 'Observer' : '觀察員');
    });
  }
});

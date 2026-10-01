import type { ReactNode } from 'react';
import { useLocale } from '../i18n';
import { routePath, type PageId } from '../routing';

const navigation: Array<[PageId, keyof ReturnType<typeof useLocale>['t']['nav']]> = [
  ['members', 'members'],
  ['systems', 'systems'],
  ['compare', 'compare'],
  ['data-pilot', 'dataPilot'],
  ['resources', 'resources'],
];

export function ResearchBadge() {
  const { t } = useLocale();
  return <span className="demo-badge">{t.researchBadge}</span>;
}

export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <p>{intro}</p>
    </header>
  );
}

export function Layout({ page, children }: { page: PageId; children: ReactNode }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById('main-content');
          main?.focus();
          main?.scrollIntoView({ block: 'start' });
        }}
      >
        {t.skip}
      </a>
      <div className="disclaimer-strip" role="note">
        <strong>{t.unofficial}</strong>
        <a href={`#${routePath(locale, 'disclaimer')}`}>
          {locale === 'en' ? 'Not an official ACSIC website' : '非 ACSIC 官方網站'}
        </a>
      </div>
      <header className="site-header">
        <a
          className="brand"
          href={`#${routePath(locale, 'home')}`}
          aria-label={`${t.brand} ${locale === 'en' ? 'Connecting Asia’s Credit Guarantee Knowledge' : '串聯亞洲信用保證知識'} ${t.fullName}`}
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" focusable="false">
              <path d="M8 29V11l12 6 12-6v18l-12 6zM20 17v18M8 11l12-6 12 6" />
            </svg>
          </span>
          <span>
            <strong>{t.brand}</strong>
            <small>
              {locale === 'en'
                ? 'Connecting Asia’s Credit Guarantee Knowledge'
                : '串聯亞洲信用保證知識'}
            </small>
          </span>
        </a>
        <nav aria-label={locale === 'en' ? 'Primary navigation' : '主要導覽'}>
          {navigation.map(([target, key]) => (
            <a
              key={target}
              href={`#${routePath(locale, target)}`}
              aria-current={page === target ? 'page' : undefined}
            >
              {t.nav[key]}
            </a>
          ))}
        </nav>
        <label className="language-picker">
          <span>{t.language}</span>
          <select
            aria-label={t.language}
            value={locale}
            onChange={(event) => setLocale(event.target.value as 'en' | 'zh-TW')}
          >
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </label>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div>
          <strong>{t.fullName}</strong>
          <p>{t.disclaimer}</p>
        </div>
        <div className="footer-links">
          <strong>{locale === 'en' ? 'Research & Methodology' : '研究與方法'}</strong>
          <a href={`#${routePath(locale, 'sources')}`}>
            {locale === 'en' ? 'Official sources' : '官方來源'}
          </a>
          <a href={`#${routePath(locale, 'reference')}`}>
            {locale === 'en' ? 'Reference institutions' : '標竿研究機構'}
          </a>
          <a href={`#${routePath(locale, 'framework')}`}>
            {locale === 'en' ? 'Comparative framework' : '比較指標框架'}
          </a>
          <a href={`#${routePath(locale, 'governance')}`}>
            {locale === 'en' ? 'Data governance' : '資料治理'}
          </a>
          <a href={`#${routePath(locale, 'about')}`}>{locale === 'en' ? 'About' : '關於平台'}</a>
          <a href={`#${routePath(locale, 'overview')}`}>
            {locale === 'en' ? 'ACSIC overview' : 'ACSIC 概覽'}
          </a>
          <a href={`#${routePath(locale, 'reports')}`}>
            {locale === 'en' ? 'Report templates' : '報告範本'}
          </a>
          <a href={`#${routePath(locale, 'disclaimer')}`}>
            {locale === 'en' ? 'Disclaimer' : '免責聲明'}
          </a>
          <p>{t.footerData}</p>
          <p>{t.footerMissing}</p>
        </div>
      </footer>
    </>
  );
}

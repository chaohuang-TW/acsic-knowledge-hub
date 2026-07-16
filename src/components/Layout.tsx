import type { ReactNode } from 'react';
import { useLocale } from '../i18n';
import { routePath, type PageId } from '../routing';

const navigation: Array<[PageId, keyof ReturnType<typeof useLocale>['t']['nav']]> = [
  ['overview', 'overview'],
  ['members', 'members'],
  ['systems', 'systems'],
  ['practices', 'practices'],
  ['resources', 'resources'],
];

export function ResearchBadge() {
  const { t } = useLocale();
  return <span className="demo-badge">{t.researchBadge}</span>;
}

export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="page-header">
      <ResearchBadge />
      <h1>{title}</h1>
      <p>{intro}</p>
    </header>
  );
}

export function Layout({ page, children }: { page: PageId; children: ReactNode }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <div className="disclaimer-strip" role="note">
        <strong>{t.unofficial}</strong>
        <span>{t.disclaimer}</span>
      </div>
      <header className="site-header">
        <a
          className="brand"
          href={`#${routePath(locale, 'home')}`}
          aria-label={`${t.brand} ${t.fullName}`}
        >
          <span className="brand-mark" aria-hidden="true">
            AK
          </span>
          <span>
            <strong>{t.brand}</strong>
            <small>{t.fullName}</small>
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
          <a href={`#${routePath(locale, 'governance')}`}>
            {locale === 'en' ? 'Data governance' : '資料治理'}
          </a>
          <a href={`#${routePath(locale, 'about')}`}>{locale === 'en' ? 'About' : '關於平台'}</a>
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

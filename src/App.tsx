import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import { browserLocale, copy, localeStorageKey, LocaleContext } from './i18n';
import { institutionPath, routePath, type PageId } from './routing';
import type { Locale } from './types';

const ComparisonPage = lazy(() =>
  import('./features/comparison/ComparisonPage').then((module) => ({
    default: module.ComparisonPage,
  })),
);
const InstitutionsPage = lazy(() =>
  import('./features/institutions/InstitutionsPage').then((module) => ({
    default: module.InstitutionsPage,
  })),
);
const InstitutionDetailPage = lazy(() =>
  import('./features/institutions/InstitutionDetailPage').then((module) => ({
    default: module.InstitutionDetailPage,
  })),
);
const ReportsPage = lazy(() =>
  import('./features/reports/ReportsPage').then((module) => ({ default: module.ReportsPage })),
);
const DataPilotPage = lazy(() =>
  import('./features/data-pilot/DataPilotPage').then((module) => ({
    default: module.DataPilotPage,
  })),
);
const AboutPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.AboutPage })),
);
const DisclaimerPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.DisclaimerPage })),
);
const GovernancePage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.GovernancePage })),
);
const KnowledgePracticesPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.KnowledgePracticesPage })),
);
const OverviewPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.OverviewPage })),
);
const ResourcesPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.ResourcesPage })),
);
const ReferenceInstitutionsPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.ReferenceInstitutionsPage })),
);
const ComparativeFrameworkPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.ComparativeFrameworkPage })),
);
const SourcesPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.SourcesPage })),
);
const SystemsPage = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.SystemsPage })),
);

const pages: PageId[] = [
  'home',
  'overview',
  'members',
  'systems',
  'reference',
  'framework',
  'data-pilot',
  'practices',
  'resources',
  'compare',
  'reports',
  'sources',
  'governance',
  'about',
  'disclaimer',
];

const legacyPages: Record<string, PageId> = {
  '/': 'home',
  '/concept': 'overview',
  '/institutions': 'members',
  '/compare': 'compare',
  '/reports': 'reports',
  '/sources': 'sources',
  '/governance': 'governance',
  '/about': 'about',
  '/disclaimer': 'disclaimer',
};

type AppRoute = {
  locale: Locale;
  page: PageId;
  canonical: boolean;
  institutionId?: string;
  query?: string;
};

function routeState(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const match = hash.match(/^\/(en|zh-TW)\/(.*)$/);
  if (match) {
    const path = match[2].split('?')[0].replace(/\/$/, '') || 'home';
    const institutionMatch = path.match(/^institutions\/([^/]+)\/?$/);
    if (institutionMatch) {
      return {
        locale: match[1] as Locale,
        page: 'institution',
        institutionId: decodeInstitutionId(institutionMatch[1]),
        canonical: true,
      };
    }
    const page = path as PageId;
    if (pages.includes(page)) return { locale: match[1] as Locale, page, canonical: true };
    return { locale: match[1] as Locale, page: 'not-found', canonical: true };
  }
  const queryIndex = hash.indexOf('?');
  const legacyPath = (queryIndex < 0 ? hash : hash.slice(0, queryIndex)).replace(/\/$/, '') || '/';
  if (legacyPages[legacyPath])
    return {
      locale: browserLocale(),
      page: legacyPages[legacyPath],
      canonical: false,
      query: queryIndex < 0 ? '' : hash.slice(queryIndex),
    };
  return { locale: browserLocale(), page: 'not-found', canonical: true };
}

function decodeInstitutionId(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function App() {
  const [state, setState] = useState(routeState);

  useEffect(() => {
    if (!state.canonical)
      window.history.replaceState(
        null,
        '',
        `#${routePath(state.locale, state.page)}${state.query ?? ''}`,
      );
  }, [state]);

  useEffect(() => {
    const onHashChange = () => {
      const next = routeState();
      setState(next);
      document.getElementById('main-content')?.focus();
      if (next.page !== 'members') window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const t = copy[state.locale];
    document.documentElement.lang = state.locale === 'zh-TW' ? 'zh-Hant-TW' : 'en';
    document.title = `${t.brand} | ${t.subtitle}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.positioning);
  }, [state.locale]);

  const setLocale = (locale: Locale) => {
    window.localStorage.setItem(localeStorageKey, locale);
    const query = window.location.hash.split('?')[1];
    window.location.hash =
      state.page === 'institution' && state.institutionId
        ? institutionPath(locale, state.institutionId)
        : state.page === 'not-found'
          ? window.location.hash.replace(/^#\/(en|zh-TW)\//, `/${locale}/`)
          : `${routePath(locale, state.page)}${query ? `?${query}` : ''}`;
  };

  return (
    <LocaleContext.Provider value={{ locale: state.locale, setLocale }}>
      <Layout page={state.page}>
        <PageLoadBoundary key={`${state.page}-${state.institutionId ?? ''}`} locale={state.locale}>
          <Suspense
            fallback={
              <div className="section-shell page-loading" role="status">
                {state.locale === 'en' ? 'Loading this page…' : '正在載入頁面…'}
              </div>
            }
          >
            {state.page === 'home' && <HomePage />}
            {state.page === 'overview' && <OverviewPage />}
            {state.page === 'members' && <InstitutionsPage />}
            {state.page === 'institution' && state.institutionId && (
              <InstitutionDetailPage institutionId={state.institutionId} />
            )}
            {state.page === 'systems' && <SystemsPage />}
            {state.page === 'reference' && <ReferenceInstitutionsPage />}
            {state.page === 'framework' && <ComparativeFrameworkPage />}
            {state.page === 'data-pilot' && <DataPilotPage />}
            {state.page === 'practices' && <KnowledgePracticesPage />}
            {state.page === 'resources' && <ResourcesPage />}
            {state.page === 'compare' && <ComparisonPage />}
            {state.page === 'reports' && <ReportsPage />}
            {state.page === 'sources' && <SourcesPage />}
            {state.page === 'governance' && <GovernancePage />}
            {state.page === 'about' && <AboutPage />}
            {state.page === 'disclaimer' && <DisclaimerPage />}
            {state.page === 'not-found' && (
              <section className="section-shell page-section narrow-page">
                <span className="eyebrow">404</span>
                <h1>
                  {state.locale === 'en' ? 'This page is not in the atlas' : '此頁面不在知識平台中'}
                </h1>
                <p>
                  {state.locale === 'en'
                    ? 'The address may have changed. Find an institution or return to the atlas.'
                    : '網址可能已變更。你可以查找機構，或返回首頁探索。'}
                </p>
                <div className="button-row">
                  <a className="button primary" href={`#${routePath(state.locale, 'members')}`}>
                    {state.locale === 'en' ? 'Find institutions' : '查找會員機構'}
                  </a>
                  <a className="button secondary" href={`#${routePath(state.locale, 'home')}`}>
                    {state.locale === 'en' ? 'Return home' : '返回首頁'}
                  </a>
                </div>
              </section>
            )}
          </Suspense>
        </PageLoadBoundary>
      </Layout>
    </LocaleContext.Provider>
  );
}

class PageLoadBoundary extends Component<
  { locale: Locale; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const english = this.props.locale === 'en';
    return (
      <section className="section-shell page-section narrow-page" role="alert">
        <span className="eyebrow">ACSIC Knowledge Hub</span>
        <h1>{english ? 'This page could not be loaded' : '此頁面暫時無法載入'}</h1>
        <p>
          {english
            ? 'The site may have been updated, or the connection interrupted. Reload to get the current version. Your address is preserved.'
            : '網站可能已更新，或連線暫時中斷。重新載入可取得目前版本；你的頁面網址會保留。'}
        </p>
        <button className="button primary" type="button" onClick={() => window.location.reload()}>
          {english ? 'Reload page' : '重新載入頁面'}
        </button>
      </section>
    );
  }
}

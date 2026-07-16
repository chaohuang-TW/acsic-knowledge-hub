import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { ComparisonPage } from './features/comparison/ComparisonPage';
import { InstitutionsPage } from './features/institutions/InstitutionsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { browserLocale, copy, localeStorageKey, LocaleContext } from './i18n';
import { routePath, type PageId } from './routing';
import {
  AboutPage,
  DisclaimerPage,
  GovernancePage,
  HomePage,
  KnowledgePracticesPage,
  OverviewPage,
  ResourcesPage,
  SourcesPage,
  SystemsPage,
} from './pages/StaticPages';
import type { Locale } from './types';

const pages: PageId[] = [
  'home',
  'overview',
  'members',
  'systems',
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

function routeState(): { locale: Locale; page: PageId; canonical: boolean } {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const match = hash.match(/^\/(en|zh-TW)\/(.*)$/);
  if (match) {
    const page = (match[2] || 'home') as PageId;
    if (pages.includes(page)) return { locale: match[1] as Locale, page, canonical: true };
  }
  return { locale: browserLocale(), page: legacyPages[hash] ?? 'home', canonical: false };
}

export default function App() {
  const [state, setState] = useState(routeState);

  useEffect(() => {
    if (!state.canonical)
      window.history.replaceState(null, '', `#${routePath(state.locale, state.page)}`);
  }, [state]);

  useEffect(() => {
    const onHashChange = () => {
      const next = routeState();
      setState(next);
      document.getElementById('main-content')?.focus();
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
    window.location.hash = routePath(locale, state.page);
  };

  return (
    <LocaleContext.Provider value={{ locale: state.locale, setLocale }}>
      <Layout page={state.page}>
        {state.page === 'home' && <HomePage />}
        {state.page === 'overview' && <OverviewPage />}
        {state.page === 'members' && <InstitutionsPage />}
        {state.page === 'systems' && <SystemsPage />}
        {state.page === 'practices' && <KnowledgePracticesPage />}
        {state.page === 'resources' && <ResourcesPage />}
        {state.page === 'compare' && <ComparisonPage />}
        {state.page === 'reports' && <ReportsPage />}
        {state.page === 'sources' && <SourcesPage />}
        {state.page === 'governance' && <GovernancePage />}
        {state.page === 'about' && <AboutPage />}
        {state.page === 'disclaimer' && <DisclaimerPage />}
      </Layout>
    </LocaleContext.Provider>
  );
}

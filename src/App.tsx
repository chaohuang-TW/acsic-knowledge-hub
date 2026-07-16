import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { ComparisonPage } from './features/comparison/ComparisonPage';
import { InstitutionsPage } from './features/institutions/InstitutionsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import {
  AboutPage,
  ConceptPage,
  DisclaimerPage,
  GovernancePage,
  HomePage,
  SourcesPage,
} from './pages/StaticPages';

const routes = [
  '/',
  '/concept',
  '/institutions',
  '/compare',
  '/reports',
  '/sources',
  '/governance',
  '/about',
  '/disclaimer',
] as const;

type Route = (typeof routes)[number];

function currentRoute(): Route {
  const value = window.location.hash.replace(/^#/, '') || '/';
  return routes.includes(value as Route) ? (value as Route) : '/';
}

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(currentRoute());
      document.getElementById('main-content')?.focus();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <Layout route={route}>
      {route === '/' && <HomePage />}
      {route === '/concept' && <ConceptPage />}
      {route === '/institutions' && <InstitutionsPage />}
      {route === '/compare' && <ComparisonPage />}
      {route === '/reports' && <ReportsPage />}
      {route === '/sources' && <SourcesPage />}
      {route === '/governance' && <GovernancePage />}
      {route === '/about' && <AboutPage />}
      {route === '/disclaimer' && <DisclaimerPage />}
    </Layout>
  );
}

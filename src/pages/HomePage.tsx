import { lazy, Suspense, useState, type FormEvent } from 'react';
import { getMembershipStats } from '../features/institutions/directoryUtils';
import { useLocale } from '../i18n';
import { routePath } from '../routing';
import { NetworkExplorerSkeleton } from '../features/network-explorer/NetworkExplorerSkeleton';
import '../features/network-explorer/network.css';
import './home.css';

// Keep the title, search and canonical membership counts on the first-paint
// path; load the SVG explorer without blocking those primary entry points.
const NetworkExplorer = lazy(() => import('../features/network-explorer/NetworkExplorer'));

const copy = {
  en: {
    kicker: 'An atlas of institutions and evidence',
    title: "Explore Asia's Credit Guarantee Network",
    intro: 'Find ACSIC institutions, understand their systems, and follow the official evidence.',
    search: 'Find an institution',
    placeholder: 'Name, acronym or economy',
    find: 'Find',
    all: 'Explore institutions',
    compare: 'Compare institutions',
    stats: ['Formal Members', 'Countries / Economies', 'Observer'],
    index: 'From institution to evidence',
    paths: [
      [
        'Institutions',
        'Know who does what',
        'Mandates, services and official profiles across the network.',
      ],
      [
        'Systems',
        'Understand the framework',
        'Read documented practices with a direct path to official sources.',
      ],
      [
        'Data',
        'Read the evidence',
        'Reported values, time periods and definitions, kept together.',
      ],
    ],
    about: 'About ACSIC and this independent platform',
  },
  'zh-TW': {
    kicker: '串聯機構、制度與官方證據',
    title: '探索亞洲信用保證網絡',
    intro: '查找 ACSIC 機構，理解制度，循官方來源閱讀資料。',
    search: '查找機構',
    placeholder: '機構名稱、縮寫或國家／經濟體',
    find: '查找',
    all: '探索會員機構',
    compare: '比較制度',
    stats: ['正式會員', '國家／經濟體', '觀察員'],
    index: '從認識機構到閱讀證據',
    paths: [
      ['會員機構', '了解各機構的任務', '探索網絡中的機構任務、服務對象與官方檔案。'],
      ['信用保證制度', '理解制度架構', '閱讀有來源支持的實務，直接連結官方資料。'],
      ['官方數據', '循證據閱讀', '將數值、期間與定義放在一起，保留研究脈絡。'],
    ],
    about: '認識 ACSIC 與本獨立平台',
  },
} as const;

export default function HomePage() {
  const { locale } = useLocale();
  const c = copy[locale];
  const membershipStats = getMembershipStats();
  const [query, setQuery] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    window.location.hash = `${routePath(locale, 'members')}?q=${encodeURIComponent(query.trim())}`;
  };
  return (
    <>
      <section className="atlas-home section-shell" aria-labelledby="home-title">
        <div className="atlas-home-copy hero-copy">
          <span className="eyebrow">{c.kicker}</span>
          <h1 id="home-title" aria-label={c.title}>
            {locale === 'zh-TW' ? (
              <>
                <span>探索亞洲</span>
                <span>信用保證網絡</span>
              </>
            ) : (
              c.title
            )}
          </h1>
          <p>{c.intro}</p>
          <form className="home-lookup" role="search" onSubmit={submit}>
            <label htmlFor="home-search">{c.search}</label>
            <div>
              <input
                id="home-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={c.placeholder}
              />
              <button className="button primary" type="submit">
                {c.find}
                <span aria-hidden="true"> →</span>
              </button>
            </div>
          </form>
          <div className="home-shortcuts">
            <a href={`#${routePath(locale, 'members')}`}>
              {c.all} <span aria-hidden="true">→</span>
            </a>
            <a href={`#${routePath(locale, 'compare')}`}>
              {c.compare} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <dl
            className="network-hero-counts"
            aria-label={locale === 'en' ? 'ACSIC network scope' : 'ACSIC 網絡範圍'}
          >
            {[membershipStats.members, membershipStats.economies, membershipStats.observers].map(
              (value, index) => (
                <div key={c.stats[index]}>
                  <dd>{value}</dd>
                  <dt>{c.stats[index]}</dt>
                </div>
              ),
            )}
          </dl>
        </div>
        <Suspense fallback={<NetworkExplorerSkeleton locale={locale} />}>
          <NetworkExplorer locale={locale} />
        </Suspense>
      </section>
      <section className="home-research-index section-shell" aria-labelledby="home-index-title">
        <header>
          <span className="eyebrow">ACSIC Knowledge Hub</span>
          <h2 id="home-index-title">{c.index}</h2>
        </header>
        <div className="home-index-links">
          {c.paths.map(([label, title, description], index) => (
            <a
              href={`#${routePath(locale, (['members', 'systems', 'data-pilot'] as const)[index])}`}
              key={label}
            >
              <span className="eyebrow">
                0{index + 1} / {label}
              </span>
              <h3>
                {title}
                <span aria-hidden="true"> ↗</span>
              </h3>
              <p>{description}</p>
            </a>
          ))}
        </div>
        <a className="text-link" href={`#${routePath(locale, 'overview')}`}>
          {c.about} <span aria-hidden="true">→</span>
        </a>
      </section>
    </>
  );
}

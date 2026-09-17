import { useMemo, useState } from 'react';
import { useLocale } from '../../i18n';
import { institutions } from '../../data/institutions';
import type { AcsicMembershipStatus, InstitutionRoleCategory } from '../../types';
import { InstitutionCard } from './InstitutionCard';
import { InstitutionFilters } from './InstitutionFilters';
import {
  filterInstitutions,
  getEconomies,
  getInstitutionTypes,
  getMembershipStats,
  groupInstitutionsByEconomy,
  hasActiveDirectoryFilters,
  type DirectoryFilters,
} from './directoryUtils';

const copy = {
  en: {
    title: 'ACSIC Institutions',
    intro:
      "Explore all ACSIC member institutions and the platform's current observer record by economy, institutional role and mandate.",
    members: 'Members',
    economies: 'Economies',
    observer: 'Observer',
    result: 'institution',
    results: 'institutions',
    groupCount: 'institutions',
    noResults: 'No institutions match these filters.',
    clear: 'Clear filters',
  },
  'zh-TW': {
    title: 'ACSIC 會員機構',
    intro: '依國家／經濟體、機構類型與任務，探索 ACSIC 正式會員及目前收錄的觀察員。',
    members: '家正式會員',
    economies: '個國家／經濟體',
    observer: '家觀察員',
    result: '家機構',
    results: '家機構',
    groupCount: '家機構',
    noResults: '沒有符合目前篩選條件的機構。',
    clear: '清除篩選',
  },
} as const;

function countLabel(count: number, locale: 'en' | 'zh-TW', c: { result: string; results: string }) {
  if (locale === 'zh-TW') return `${count}${copy['zh-TW'].result}`;
  return `${count} ${count === 1 ? c.result : c.results}`;
}

export function InstitutionDirectory() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [filters, setFilters] = useState<DirectoryFilters>({
    query: '',
    economy: 'all',
    type: 'all',
    membership: 'all',
  });
  const economies = useMemo(() => getEconomies(), []);
  const types = useMemo(() => getInstitutionTypes(), []);
  const stats = useMemo(() => getMembershipStats(), []);
  const filtered = useMemo(() => filterInstitutions(institutions, filters), [filters]);
  const groups = useMemo(() => groupInstitutionsByEconomy(filtered), [filtered]);
  const active = hasActiveDirectoryFilters(filters);
  const update = <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const clear = () => setFilters({ query: '', economy: 'all', type: 'all', membership: 'all' });

  return (
    <section className="section-shell page-section directory-page">
      <header className="page-header">
        <p className="directory-kicker">ACSIC Knowledge Hub</p>
        <h1>{c.title}</h1>
        <p>{c.intro}</p>
      </header>
      <dl
        className="directory-stats"
        aria-label={locale === 'en' ? 'Directory statistics' : '目錄統計'}
      >
        <div>
          <dt>{locale === 'en' ? c.members : '正式會員'}</dt>
          <dd>{stats.members}</dd>
        </div>
        <div>
          <dt>{locale === 'en' ? c.economies : '國家／經濟體'}</dt>
          <dd>{stats.economies}</dd>
        </div>
        <div>
          <dt>{locale === 'en' ? c.observer : '觀察員'}</dt>
          <dd>{stats.observers}</dd>
        </div>
      </dl>
      <InstitutionFilters
        locale={locale}
        filters={filters}
        economies={economies}
        types={types}
        onQueryChange={(value) => update('query', value)}
        onEconomyChange={(value) => update('economy', value)}
        onTypeChange={(value: InstitutionRoleCategory | 'all') => update('type', value)}
        onMembershipChange={(value: AcsicMembershipStatus | 'all') => update('membership', value)}
        onClear={clear}
        clearDisabled={!active}
      />
      <p className="directory-result-count" aria-live="polite">
        {countLabel(filtered.length, locale, c)}
      </p>
      {filtered.length === 0 ? (
        <div className="state-message directory-empty">
          <h2>{c.noResults}</h2>
          <button className="button secondary" type="button" onClick={clear}>
            {c.clear}
          </button>
        </div>
      ) : (
        <div className="directory-groups">
          {groups.map((group) => (
            <section
              className="economy-group"
              key={group.id}
              aria-labelledby={`economy-${group.id}`}
            >
              <header className="economy-group__header">
                <div>
                  <p className="economy-group__eyebrow">
                    {locale === 'en' ? 'Economy' : '國家／經濟體'}
                  </p>
                  <h2 id={`economy-${group.id}`}>{group.label[locale]}</h2>
                </div>
                <span className="economy-group__count">
                  {countLabel(group.institutions.length, locale, c)}
                </span>
              </header>
              <div className="directory-card-grid">
                {group.institutions.map((record) => (
                  <InstitutionCard key={record.id} record={record} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="directory-total" aria-hidden="true">
        {stats.institutions}{' '}
        {locale === 'en' ? 'governed institution records' : '筆受治理的機構紀錄'}
      </p>
    </section>
  );
}

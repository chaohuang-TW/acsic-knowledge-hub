import { institutionPath } from '../../routing';
import type { Institution, Locale } from '../../types';
import { getMembershipStats } from '../institutions/directoryUtils';
import {
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkRegions,
} from './networkSceneData';

type Props = {
  locale: Locale;
  selectedRegion: string | null;
  onSelectRegion: (regionId: string) => void;
  onReturnToOverview: () => void;
  selectedInstitutionId: string | null;
  onSelectInstitution: (institutionId: string) => void;
};

const copy = {
  en: {
    title: 'ACSIC Asia Explorer',
    unavailable:
      'Interactive 3D view is unavailable on this device. You can still explore every economy below.',
    schematic: 'Schematic ACSIC network visualization - not to scale.',
    overview: 'Asia overview',
    prompt: 'Choose an economy to explore its ACSIC institutions.',
    member: 'Member',
    observer: 'Observer',
    profile: 'View profile',
    select: 'Select institution',
    selected: 'Selected',
    website: 'Official website ↗',
    back: 'Back to Asia overview',
    institutions: 'institutions',
    members: 'Members',
    economies: 'Economies',
  },
  'zh-TW': {
    title: 'ACSIC 亞洲探索器',
    unavailable: '此裝置無法使用 3D 互動檢視，仍可透過下方內容探索全部國家／經濟體。',
    schematic: 'ACSIC 網絡示意圖，非依比例繪製。',
    overview: '亞洲總覽',
    prompt: '選擇一個國家／經濟體，探索當地 ACSIC 機構。',
    member: '正式會員',
    observer: '觀察員',
    profile: '查看機構檔案',
    select: '選取機構',
    selected: '已選取',
    website: '官方網站 ↗',
    back: '返回亞洲總覽',
    institutions: '家機構',
    members: '正式會員',
    economies: '國家／經濟體',
  },
} as const;

export function NetworkExplorerFallback({
  locale,
  selectedRegion,
  onSelectRegion,
  onReturnToOverview,
  selectedInstitutionId,
  onSelectInstitution,
}: Props) {
  const c = copy[locale];
  const selected = getRegion(selectedRegion);
  const stats = getMembershipStats();
  const selectedCounts = selected ? getRegionMembershipCounts(selected) : null;
  return (
    <section className="network-explorer network-explorer-fallback" aria-labelledby="network-title">
      <div className="network-fallback-visual" role="img" aria-label={c.schematic}>
        <div className="fallback-network-lines" aria-hidden="true" />
        <img
          className="network-fallback-mascot"
          src={`${import.meta.env.BASE_URL}assets/mascot/meng-ge-guide.webp`}
          alt={locale === 'en' ? 'Meng-Ge mascot guide' : '萌哥導覽員吉祥物'}
        />
        <div className="fallback-region-list" role="group" aria-label={c.title}>
          <button
            aria-label={c.overview}
            className={!selectedRegion ? 'fallback-region is-selected' : 'fallback-region'}
            type="button"
            onClick={onReturnToOverview}
            aria-pressed={!selectedRegion}
          >
            <span>{c.overview}</span>
            <small>
              {stats.economies} {c.economies}
            </small>
          </button>
          {networkRegions.map((region) => {
            const counts = getRegionMembershipCounts(region);
            return (
              <button
                aria-label={region.label[locale]}
                className={
                  region.id === selectedRegion ? 'fallback-region is-selected' : 'fallback-region'
                }
                type="button"
                key={region.id}
                onClick={() => onSelectRegion(region.id)}
                aria-pressed={region.id === selectedRegion}
              >
                <span>{region.label[locale]}</span>
                <small>
                  {counts.members + counts.observers} {c.institutions}
                </small>
              </button>
            );
          })}
        </div>
      </div>
      <div className="network-overlay">
        <p className="network-fallback-note">{c.unavailable}</p>
        <p className="network-schematic-note">{c.schematic}</p>
        <h2 id="network-title">{selected?.label[locale] ?? c.overview}</h2>
        {selected && selectedCounts ? (
          <>
            <p className="network-fallback-note">
              {selectedCounts.members} {c.members}
              {selectedCounts.observers ? ` · ${selectedCounts.observers} ${c.observer}` : ''}
            </p>
            <div className="institution-card-grid">
              {getRegionInstitutions(selected).map((institution) => (
                <InstitutionCard
                  key={institution.id}
                  institution={institution}
                  locale={locale}
                  copy={c}
                  selected={institution.id === selectedInstitutionId}
                  onSelect={() => onSelectInstitution(institution.id)}
                />
              ))}
            </div>
            <button
              className="button secondary network-back"
              type="button"
              onClick={onReturnToOverview}
            >
              {c.back}
            </button>
          </>
        ) : (
          <div className="network-overview-panel">
            <p>{c.prompt}</p>
            <div className="network-overview-counts">
              <span>
                <strong>{stats.members}</strong> {c.members}
              </span>
              <span>
                <strong>{stats.economies}</strong> {c.economies}
              </span>
              <span>
                <strong>{stats.observers}</strong> {c.observer}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InstitutionCard({
  institution,
  locale,
  copy,
  selected,
  onSelect,
}: {
  institution: Institution;
  locale: Locale;
  copy: {
    member: string;
    observer: string;
    profile: string;
    website: string;
    select: string;
    selected: string;
  };
  selected: boolean;
  onSelect: () => void;
}) {
  const status = institution.acsicMembershipStatus === 'observer' ? copy.observer : copy.member;
  return (
    <article
      className={selected ? 'network-institution-card is-selected' : 'network-institution-card'}
    >
      <div className="network-card-heading">
        <span
          className={
            institution.acsicMembershipStatus === 'observer'
              ? 'network-badge observer'
              : 'network-badge'
          }
        >
          {status}
        </span>
        <span className="network-abbreviation">{institution.institutionAbbreviation}</span>
      </div>
      <h3>{institution.name[locale]}</h3>
      <p>{institution.summary[locale]}</p>
      <div className="network-card-actions">
        <button
          type="button"
          className="button secondary network-card-select"
          aria-pressed={selected}
          onClick={onSelect}
        >
          {selected ? copy.selected : copy.select}
        </button>
        <a className="button secondary" href={`#${institutionPath(locale, institution.id)}`}>
          {copy.profile}
        </a>
        <a href={institution.officialWebsite} target="_blank" rel="noreferrer">
          {copy.website}
        </a>
      </div>
    </article>
  );
}

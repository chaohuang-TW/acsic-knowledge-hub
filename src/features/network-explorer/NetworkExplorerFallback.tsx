import { institutions } from '../../data/institutions';
import { institutionPath } from '../../routing';
import type { Locale } from '../../types';
import {
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkRegions,
  type NetworkRegion,
} from './networkSceneData';

type Props = {
  locale: Locale;
  selectedRegion: NetworkRegion['id'];
  onSelectRegion: (regionId: NetworkRegion['id']) => void;
  selectedInstitutionId: string | null;
  onSelectInstitution: (institutionId: string) => void;
};

const copy = {
  en: {
    title: 'ACSIC Network Explorer',
    unavailable:
      'Interactive 3D view is unavailable on this device. You can still explore all institutions below.',
    schematic: 'Schematic ACSIC network visualization - not to scale.',
    member: 'Member',
    observer: 'Observer',
    profile: 'View profile',
    select: 'Select institution',
    selected: 'Selected',
    website: 'Official website ↗',
    institutions: 'institutions',
  },
  'zh-TW': {
    title: 'ACSIC 網絡探索器',
    unavailable: '此裝置無法使用 3D 互動檢視，仍可透過下方內容探索所有機構。',
    schematic: 'ACSIC 網絡示意圖，非依比例繪製。',
    member: '正式會員',
    observer: '觀察員',
    profile: '查看機構檔案',
    select: '選取機構',
    selected: '已選取',
    website: '官方網站 ↗',
    institutions: '家機構',
  },
} as const;

export function NetworkExplorerFallback({
  locale,
  selectedRegion,
  onSelectRegion,
  selectedInstitutionId,
  onSelectInstitution,
}: Props) {
  const c = copy[locale];
  const selected = getRegion(selectedRegion);
  return (
    <section className="network-explorer network-explorer-fallback" aria-labelledby="network-title">
      <div className="network-fallback-visual" role="img" aria-label={c.schematic}>
        <div className="fallback-network-lines" aria-hidden="true" />
        <img
          className="network-fallback-mascot"
          src={`${import.meta.env.BASE_URL}assets/mascot/meng-ge-guide.webp`}
          alt={locale === 'en' ? 'Meng-Ge mascot guide' : '萌哥導覽員吉祥物'}
        />
        <div className="fallback-region-list">
          {networkRegions.map((region) => {
            const counts = getRegionMembershipCounts(region);
            return (
              <button
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
        <h2 id="network-title">{selected.label[locale]}</h2>
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
      </div>
      <div
        className="network-fallback-all"
        aria-label={locale === 'en' ? 'All prototype institutions' : '全部示範機構'}
      >
        {networkRegions.flatMap((region) =>
          region.id === selected.id
            ? []
            : getRegionInstitutions(region).map((institution) => (
                <InstitutionCard
                  key={institution.id}
                  institution={institution}
                  locale={locale}
                  copy={c}
                  selected={institution.id === selectedInstitutionId}
                  onSelect={() => onSelectInstitution(institution.id)}
                  compact
                />
              )),
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
  compact = false,
}: {
  institution: (typeof institutions)[number];
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
  compact?: boolean;
}) {
  const status = institution.acsicMembershipStatus === 'observer' ? copy.observer : copy.member;
  return (
    <article
      className={`${compact ? 'network-institution-card is-compact' : 'network-institution-card'}${selected ? ' is-selected' : ''}`}
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

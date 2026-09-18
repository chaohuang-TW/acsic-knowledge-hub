import { institutionPath } from '../../routing';
import type { Institution, Locale } from '../../types';
import { getMembershipStats } from '../institutions/directoryUtils';
import {
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkRegions,
} from './networkSceneData';
import type { NetworkFallbackReason } from './webgl';

type Props = {
  locale: Locale;
  selectedRegion: string | null;
  onSelectRegion: (regionId: string) => void;
  onReturnToOverview: () => void;
  reason: NetworkFallbackReason;
};

const copy = {
  en: {
    title: 'ACSIC Asia Explorer',
    standardMode: 'Standard explorer mode',
    standardDetail: (economies: number, institutions: number) =>
      `All ${economies} economies and ${institutions} ACSIC institutions remain available.`,
    capabilityUnavailable:
      '3D interaction is unavailable on this device. You can still use the standard explorer.',
    sceneError: 'The 3D explorer could not be loaded. The standard explorer is available below.',
    contextLost: 'The 3D view was interrupted. The standard explorer is available below.',
    manualTest: 'Manual standard-explorer mode is active for QA.',
    prompt: 'Choose an economy to explore its ACSIC institutions.',
    member: 'Member',
    observer: 'Observer',
    members: 'Members',
    economies: 'Economies',
    institutions: 'institutions',
    profile: 'View profile',
    website: 'Official website ↗',
    back: 'Back to Asia overview',
    economySelector: 'Choose an economy',
    schematic: 'Schematic ACSIC network visualization - not to scale.',
    noInstitutionData: 'No institution records are available for this economy yet.',
    selectedStatus: (name: string, members: number, observers: number) =>
      observers
        ? `${name} selected. ${members} ACSIC member institutions and ${observers} observer.`
        : `${name} selected. ${members} ACSIC member institutions.`,
  },
  'zh-TW': {
    title: 'ACSIC 亞洲探索器',
    standardMode: '目前使用一般探索模式',
    standardDetail: (economies: number, institutions: number) =>
      `仍可完整瀏覽 ${economies} 個國家／經濟體及 ${institutions} 家 ACSIC 機構。`,
    capabilityUnavailable: '此裝置目前不支援 3D 互動檢視，仍可使用一般探索模式。',
    sceneError: '3D 互動檢視目前無法載入，已切換為一般瀏覽模式。',
    contextLost: '3D 互動檢視已中斷，已切換為一般瀏覽模式。',
    manualTest: '目前為 QA 用的一般探索模式。',
    prompt: '選擇一個國家／經濟體，探索當地 ACSIC 機構。',
    member: '正式會員',
    observer: '觀察員',
    members: '正式會員',
    economies: '國家／經濟體',
    institutions: '家機構',
    profile: '查看機構檔案',
    website: '官方網站 ↗',
    back: '返回亞洲總覽',
    economySelector: '選擇國家／經濟體',
    schematic: 'ACSIC 網絡示意圖，非依比例繪製。',
    noInstitutionData: '目前尚無此國家／經濟體的機構資料。',
    selectedStatus: (name: string, members: number, observers: number) =>
      observers
        ? `${name} 已選取。${members} 家 ACSIC 正式會員及 ${observers} 家觀察員。`
        : `${name} 已選取。${members} 家 ACSIC 正式會員。`,
  },
} as const;

export function NetworkExplorerFallback({
  locale,
  selectedRegion,
  onSelectRegion,
  onReturnToOverview,
  reason,
}: Props) {
  const c = copy[locale];
  const selected = getRegion(selectedRegion);
  const stats = getMembershipStats();
  const selectedCounts = selected ? getRegionMembershipCounts(selected) : null;
  const statusDetail =
    reason === 'scene-error'
      ? c.sceneError
      : reason === 'context-lost'
        ? c.contextLost
        : reason === 'manual-test'
          ? c.manualTest
          : c.capabilityUnavailable;

  return (
    <section
      className="network-explorer network-explorer-fallback"
      aria-labelledby="network-title"
      data-fallback-reason={reason}
    >
      <div className="network-standard-shell">
        <header className="network-standard-header">
          <div>
            <p className="network-standard-status">{c.standardMode}</p>
            <h2 id="network-title">{c.title}</h2>
            <p className="network-standard-detail">{statusDetail}</p>
            <p className="network-standard-detail">
              {c.standardDetail(stats.economies, stats.institutions)}
            </p>
          </div>
          <img
            className="network-fallback-mascot"
            src={`${import.meta.env.BASE_URL}assets/mascot/meng-ge-guide.webp`}
            alt={locale === 'en' ? 'Meng-Ge mascot guide' : '萌哥導覽員吉祥物'}
          />
        </header>

        {!selected ? (
          <div className="network-standard-overview">
            <div className="network-standard-section-heading">
              <div>
                <h3>{c.economySelector}</h3>
                <p>{c.prompt}</p>
              </div>
              <div
                className="network-overview-counts"
                aria-label={c.standardDetail(stats.economies, stats.institutions)}
              >
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
            <label className="network-standard-mobile-select">
              <span>{c.economySelector}</span>
              <select
                aria-label={c.economySelector}
                value=""
                onChange={(event) => event.target.value && onSelectRegion(event.target.value)}
              >
                <option value="">{c.economySelector}</option>
                {networkRegions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label[locale]} ({region.institutionIds.length})
                  </option>
                ))}
              </select>
            </label>
            <div
              className="network-standard-economy-grid"
              role="list"
              aria-label={c.economySelector}
            >
              {networkRegions.map((region) => (
                <button
                  type="button"
                  key={region.id}
                  aria-label={region.label[locale]}
                  className="network-standard-economy"
                  onClick={() => onSelectRegion(region.id)}
                >
                  <span>{region.label[locale]}</span>
                  <small>
                    {region.institutionIds.length} {c.institutions}
                  </small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="network-standard-selected">
            <div className="network-standard-section-heading network-standard-selected-heading">
              <div>
                <button
                  className="network-standard-back"
                  type="button"
                  onClick={onReturnToOverview}
                >
                  ← {c.back}
                </button>
                <h3>{selected.label[locale]}</h3>
                <p aria-live="polite">
                  {selectedCounts
                    ? c.selectedStatus(
                        selected.label[locale],
                        selectedCounts.members,
                        selectedCounts.observers,
                      )
                    : c.noInstitutionData}
                </p>
              </div>
              <div
                className="network-overview-counts"
                aria-label={c.selectedStatus(
                  selected.label[locale],
                  selectedCounts?.members ?? 0,
                  selectedCounts?.observers ?? 0,
                )}
              >
                <span>
                  <strong>{selectedCounts?.members ?? 0}</strong> {c.members}
                </span>
                {selectedCounts?.observers ? (
                  <span>
                    <strong>{selectedCounts.observers}</strong> {c.observer}
                  </span>
                ) : null}
              </div>
            </div>
            {selectedCounts && getRegionInstitutions(selected).length ? (
              <div className="institution-card-grid network-standard-institutions">
                {getRegionInstitutions(selected).map((institution) => (
                  <InstitutionCard
                    key={institution.id}
                    institution={institution}
                    locale={locale}
                    copy={c}
                  />
                ))}
              </div>
            ) : (
              <p className="network-standard-empty">{c.noInstitutionData}</p>
            )}
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
}: {
  institution: Institution;
  locale: Locale;
  copy: {
    member: string;
    observer: string;
    profile: string;
    website: string;
  };
}) {
  const status = institution.acsicMembershipStatus === 'observer' ? copy.observer : copy.member;
  return (
    <article className="network-institution-card">
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
      <h4>{institution.name[locale]}</h4>
      <p>{institution.summary[locale]}</p>
      <div className="network-card-actions">
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

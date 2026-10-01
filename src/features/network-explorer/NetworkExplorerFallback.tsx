import type { Locale } from '../../types';
import { getMembershipStats } from '../institutions/directoryUtils';
import { DeferredInstitutionSnapshot as InstitutionSnapshotCard } from './DeferredInstitutionSnapshot';
import {
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkRegions,
} from './networkSceneData';
import { AtlasSvg } from './AtlasSvg';
import type { NetworkFallbackReason } from './webgl';

type Props = {
  locale: Locale;
  selectedRegion: string | null;
  selectedInstitutionId: string | null;
  onSelectRegion: (regionId: string) => void;
  onSelectInstitution: (institutionId: string) => void;
  onReturnToOverview: () => void;
  onUseMapPreview: () => void;
  reason: NetworkFallbackReason;
};

const copy = {
  en: {
    title: 'ACSIC Asia Explorer',
    standardMode: 'Standard explorer mode',
    standardDetail: (economies: number, institutions: number) =>
      `All ${economies} economies and ${institutions} ACSIC institutions remain available.`,
    capabilityUnavailable:
      '3D interaction is unavailable on this device. The map preview and standard explorer remain available.',
    sceneError:
      'The 3D explorer could not be loaded. The map preview and standard explorer remain available.',
    contextLost:
      'The 3D view was interrupted. The map preview and standard explorer remain available.',
    manualTest: 'Manual standard-explorer mode is active for QA.',
    prompt: 'Choose an economy to explore its ACSIC institutions.',
    members: 'Members',
    observer: 'Observer',
    economies: 'Economies',
    institutions: 'institutions',
    back: 'Back to Asia overview',
    economySelector: 'Choose an economy',
    schematic: 'Simplified Asia map for visual exploration only.',
    noInstitutionData: 'No institution records are available for this economy yet.',
    mapPreview: 'Use map preview',
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
    capabilityUnavailable: '此裝置目前不支援 3D 互動檢視，仍可使用地圖預覽與一般探索模式。',
    sceneError: '3D 互動檢視目前無法載入，仍可使用地圖預覽與一般瀏覽模式。',
    contextLost: '3D 互動檢視已中斷，仍可使用地圖預覽與一般瀏覽模式。',
    manualTest: '目前為 QA 用的一般探索模式。',
    prompt: '選擇一個國家／經濟體，探索當地 ACSIC 機構。',
    members: '正式會員',
    observer: '觀察員',
    economies: '國家／經濟體',
    institutions: '家機構',
    back: '返回亞洲總覽',
    economySelector: '選擇國家／經濟體',
    schematic: '亞洲地圖為視覺化簡化示意。',
    noInstitutionData: '目前尚無此國家／經濟體的機構資料。',
    mapPreview: '使用地圖預覽',
    selectedStatus: (name: string, members: number, observers: number) =>
      observers
        ? `${name} 已選取。${members} 家 ACSIC 正式會員及 ${observers} 家觀察員。`
        : `${name} 已選取。${members} 家 ACSIC 正式會員。`,
  },
} as const;

function reasonDetail(reason: NetworkFallbackReason, c: (typeof copy)[Locale]): string {
  if (reason === 'scene-error') return c.sceneError;
  if (reason === 'context-lost') return c.contextLost;
  if (reason === 'manual-test') return c.manualTest;
  return c.capabilityUnavailable;
}

export function NetworkExplorerFallback({
  locale,
  selectedRegion,
  selectedInstitutionId,
  onSelectRegion,
  onSelectInstitution,
  onReturnToOverview,
  onUseMapPreview,
  reason,
}: Props) {
  const c = copy[locale];
  const selected = getRegion(selectedRegion);
  const stats = getMembershipStats();
  const selectedCounts = selected ? getRegionMembershipCounts(selected) : null;
  const statusDetail = reasonDetail(reason, c);

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
            width="250"
            height="465"
            src={`${import.meta.env.BASE_URL}assets/mascot/meng-ge-guide.webp`}
            alt={locale === 'en' ? 'Meng-Ge mascot guide' : '萌哥導覽員吉祥物'}
          />
        </header>

        <div
          className="network-standard-map"
          data-testid="asia-map-stage"
          data-selected-economy={selectedRegion ?? ''}
          role="group"
          aria-label={c.schematic}
        >
          <AtlasSvg
            locale={locale}
            selectedRegion={selectedRegion}
            selectedInstitutionId={selectedInstitutionId}
            onSelectRegion={onSelectRegion}
            onSelectInstitution={onSelectInstitution}
            ariaLabel={c.schematic}
            mascotAlt={locale === 'en' ? 'Meng-Ge guide' : '萌哥導覽員'}
          />
        </div>

        <label className="network-standard-mobile-select">
          <span>{c.economySelector}</span>
          <select
            aria-label={c.economySelector}
            value={selectedRegion ?? ''}
            onChange={(event) =>
              event.target.value ? onSelectRegion(event.target.value) : onReturnToOverview()
            }
          >
            <option value="">{c.economySelector}</option>
            {networkRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.label[locale]} ({region.institutionIds.length})
              </option>
            ))}
          </select>
        </label>
        {!selected ? (
          <div className="network-standard-overview">
            <div className="network-standard-section-heading">
              <div>
                <h3>{c.economySelector}</h3>
                <p>{c.prompt}</p>
              </div>
            </div>
            <div
              className="network-standard-economy-grid"
              role="group"
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
                  <small aria-hidden="true">
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
                  <InstitutionSnapshotCard
                    key={institution.id}
                    institution={institution}
                    locale={locale}
                    headingLevel={4}
                    compact
                    selected={institution.id === selectedInstitutionId}
                    onSelect={() => onSelectInstitution(institution.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="network-standard-empty">{c.noInstitutionData}</p>
            )}
          </div>
        )}

        <div className="network-standard-actions">
          {selected ? (
            <button
              className="button secondary network-standard-back"
              type="button"
              onClick={onReturnToOverview}
            >
              {c.back}
            </button>
          ) : null}
          <button
            className="button secondary network-standard-toggle"
            type="button"
            onClick={onUseMapPreview}
          >
            {c.mapPreview}
          </button>
        </div>
      </div>
    </section>
  );
}

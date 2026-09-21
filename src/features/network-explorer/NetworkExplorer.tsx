import { Component, type ReactNode, useCallback, useEffect, useState } from 'react';
import type { Locale } from '../../types';
import { getMembershipStats } from '../institutions/directoryUtils';
import { InstitutionSnapshotCard } from '../institutions/InstitutionSnapshot';
import { institutionExperienceCopy } from '../institutions/institutionExperience';
import { NetworkExplorerFallback } from './NetworkExplorerFallback';
import { NetworkScene } from './NetworkScene';
import { getWebGLCapability, reportNetworkDiagnostic, type NetworkFallbackReason } from './webgl';
import {
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkRegions,
  type NetworkRegion,
} from './networkSceneData';

type Props = { locale: Locale };

const copy = {
  en: {
    eyebrow: 'Interactive 3D network explorer',
    title: 'ACSIC Network Explorer',
    description: 'Choose an economy to explore its ACSIC institutions across the region.',
    overview: 'Asia overview',
    overviewPrompt: 'Choose an economy to explore its ACSIC institutions.',
    economySelector: 'Choose an economy',
    schematic: 'Simplified Asia map for visual exploration only.',
    selected: 'Economy focus',
    member: 'Member',
    observer: 'Observer',
    members: 'Members',
    economies: 'Economies',
    profile: 'View profile',
    website: 'Official website ↗',
    exploreAll: 'Explore all institutions',
    back: 'Back to Asia overview',
    select: 'Select institution',
    selectedInstitution: 'Selected',
    networkStatus: (name: string, members: number, observers: number) =>
      observers
        ? `${name} selected. ${members} ACSIC member institutions and ${observers} observer.`
        : `${name} selected. ${members} ACSIC member institutions.`,
    overviewStatus: (members: number, economies: number, observers: number) =>
      `ACSIC Asia overview. ${members} members across ${economies} economies and ${observers} observer.`,
  },
  'zh-TW': {
    eyebrow: '互動式 3D 網絡探索器',
    title: 'ACSIC 網絡探索器',
    description: '選擇一個國家／經濟體，探索亞洲各地的 ACSIC 機構。',
    overview: '亞洲總覽',
    overviewPrompt: '選擇一個國家／經濟體，探索當地 ACSIC 機構。',
    economySelector: '選擇國家／經濟體',
    schematic: '亞洲地圖為視覺化簡化示意。',
    selected: '經濟體聚焦',
    member: '正式會員',
    observer: '觀察員',
    members: '正式會員',
    economies: '國家／經濟體',
    profile: '查看機構檔案',
    website: '官方網站 ↗',
    exploreAll: '查看全部會員機構',
    back: '返回亞洲總覽',
    select: '選取機構',
    selectedInstitution: '已選取',
    networkStatus: (name: string, members: number, observers: number) =>
      observers
        ? `${name} 已選取。${members} 家 ACSIC 正式會員及 ${observers} 家觀察員。`
        : `${name} 已選取。${members} 家 ACSIC 正式會員。`,
    overviewStatus: (members: number, economies: number, observers: number) =>
      `ACSIC 亞洲總覽。${economies} 個國家／經濟體共有 ${members} 家正式會員及 ${observers} 家觀察員。`,
  },
} as const;

export default function NetworkExplorer({ locale }: Props) {
  const c = copy[locale];
  const [selectedRegion, setSelectedRegion] = useState<NetworkRegion['id'] | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<NetworkFallbackReason | null>(null);
  const selected = getRegion(selectedRegion);
  const stats = getMembershipStats();
  const counts = selected ? getRegionMembershipCounts(selected) : null;

  const handleSceneIssue = useCallback((reason: NetworkFallbackReason) => {
    reportNetworkDiagnostic(reason);
    setFallbackReason(reason);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    const capability = getWebGLCapability();
    if (!capability.available) {
      const reason: NetworkFallbackReason =
        capability.reason === 'manual-test' ? 'manual-test' : 'capability-unavailable';
      reportNetworkDiagnostic(reason, undefined, {
        capabilityMode: capability.mode,
        capabilityReason: capability.reason,
      });
      setFallbackReason(reason);
    }
    return () => media.removeEventListener?.('change', update);
  }, []);

  const selectRegion = (regionId: NetworkRegion['id']) => {
    setSelectedRegion(regionId);
    setSelectedInstitution(null);
  };
  const returnToOverview = () => {
    setSelectedRegion(null);
    setSelectedInstitution(null);
  };
  const regionStatus =
    selected && counts
      ? c.networkStatus(selected.label[locale], counts.members, counts.observers)
      : c.overviewStatus(stats.members, stats.economies, stats.observers);
  const selectedInstitutionRecord = selected
    ? getRegionInstitutions(selected).find((institution) => institution.id === selectedInstitution)
    : undefined;
  const liveAnnouncement = selectedInstitutionRecord
    ? institutionExperienceCopy[locale].selectedAnnouncement.replace(
        '{name}',
        selectedInstitutionRecord.name[locale],
      )
    : regionStatus;

  if (fallbackReason) {
    return (
      <NetworkExplorerFallback
        locale={locale}
        selectedRegion={selectedRegion}
        onSelectRegion={selectRegion}
        onReturnToOverview={returnToOverview}
        reason={fallbackReason}
      />
    );
  }

  return (
    <NetworkErrorBoundary
      locale={locale}
      selectedRegion={selectedRegion}
      onSelectRegion={selectRegion}
      onReturnToOverview={returnToOverview}
      selectedInstitutionId={selectedInstitution}
      onSelectInstitution={setSelectedInstitution}
    >
      <section className="network-explorer" aria-labelledby="network-explorer-title">
        <div className="network-explorer-heading">
          <div>
            <span className="eyebrow">{c.eyebrow}</span>
            <h2 id="network-explorer-title">{c.title}</h2>
            <p>{c.description}</p>
          </div>
          <p className="network-schematic-note">{c.schematic}</p>
        </div>
        <div className="network-explorer-layout">
          <div className="network-stage">
            <div
              className="network-canvas-frame asia-map-frame"
              data-testid="asia-map-stage"
              data-selected-economy={selectedRegion ?? ''}
              role="img"
              aria-label={c.schematic}
              aria-describedby="network-canvas-description"
            >
              <NetworkScene
                locale={locale}
                selectedRegion={selectedRegion}
                reducedMotion={reducedMotion}
                onSelectRegion={selectRegion}
                onSelectInstitution={setSelectedInstitution}
                selectedInstitutionId={selectedInstitution}
                onSceneIssue={handleSceneIssue}
              />
            </div>
            <p className="visually-hidden" id="network-canvas-description">
              {c.schematic}
            </p>
            <EconomyControls
              locale={locale}
              selectedRegion={selectedRegion}
              onSelectRegion={selectRegion}
              onReturnToOverview={returnToOverview}
              overviewLabel={c.overview}
              selectLabel={c.economySelector}
            />
          </div>
          <aside
            className={selected ? 'network-panel' : 'network-panel network-panel-overview'}
            aria-labelledby="network-region-title"
          >
            <p className="network-live" aria-live="polite">
              {liveAnnouncement}
            </p>
            {selected && counts ? (
              <>
                <div className="network-panel-heading">
                  <div>
                    <span className="eyebrow">{c.selected}</span>
                    <h2 id="network-region-title">{selected.label[locale]}</h2>
                  </div>
                  <span className="network-count">
                    {counts.members} {c.members}
                    {counts.observers ? ` · ${counts.observers} ${c.observer}` : ''}
                  </span>
                </div>
                <div className="institution-card-grid">
                  {getRegionInstitutions(selected).map((institution) => (
                    <InstitutionSnapshotCard
                      key={institution.id}
                      institution={institution}
                      locale={locale}
                      selected={institution.id === selectedInstitution}
                      onSelect={() => setSelectedInstitution(institution.id)}
                    />
                  ))}
                </div>
                <button
                  className="button secondary network-back"
                  type="button"
                  onClick={returnToOverview}
                >
                  {c.back}
                </button>
                <a className="button secondary network-explore-all" href={`#/${locale}/members`}>
                  {c.exploreAll}
                </a>
              </>
            ) : (
              <div className="network-overview-panel">
                <span className="eyebrow">{c.overview}</span>
                <h2 id="network-region-title">{c.overview}</h2>
                <p>{c.overviewPrompt}</p>
                <div
                  className="network-overview-counts"
                  aria-label={c.overviewStatus(stats.members, stats.economies, stats.observers)}
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
            )}
          </aside>
        </div>
      </section>
    </NetworkErrorBoundary>
  );
}

function EconomyControls({
  locale,
  selectedRegion,
  onSelectRegion,
  onReturnToOverview,
  overviewLabel,
  selectLabel,
}: {
  locale: Locale;
  selectedRegion: string | null;
  onSelectRegion: (id: string) => void;
  onReturnToOverview: () => void;
  overviewLabel: string;
  selectLabel: string;
}) {
  return (
    <>
      <div className="network-destination-controls" role="group" aria-label={overviewLabel}>
        <button
          type="button"
          className={!selectedRegion ? 'is-selected' : ''}
          aria-pressed={!selectedRegion}
          onClick={onReturnToOverview}
        >
          {overviewLabel}
        </button>
        {networkRegions.map((region) => (
          <button
            type="button"
            key={region.id}
            className={region.id === selectedRegion ? 'is-selected' : ''}
            aria-pressed={region.id === selectedRegion}
            onClick={() => onSelectRegion(region.id)}
          >
            {region.label[locale]}
          </button>
        ))}
      </div>
      <label className="network-mobile-economy-control">
        <span>{selectLabel}</span>
        <select
          aria-label={selectLabel}
          value={selectedRegion ?? ''}
          onChange={(event) =>
            event.target.value ? onSelectRegion(event.target.value) : onReturnToOverview()
          }
        >
          <option value="">{overviewLabel}</option>
          {networkRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.label[locale]}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

class NetworkErrorBoundary extends Component<
  {
    children: ReactNode;
    locale: Locale;
    selectedRegion: NetworkRegion['id'] | null;
    onSelectRegion: (regionId: NetworkRegion['id']) => void;
    onReturnToOverview: () => void;
    selectedInstitutionId: string | null;
    onSelectInstitution: (institutionId: string) => void;
  },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown): void {
    reportNetworkDiagnostic('scene-error', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <NetworkExplorerFallback
          locale={this.props.locale}
          selectedRegion={this.props.selectedRegion}
          onSelectRegion={this.props.onSelectRegion}
          onReturnToOverview={this.props.onReturnToOverview}
          reason="scene-error"
        />
      );
    }
    return this.props.children;
  }
}

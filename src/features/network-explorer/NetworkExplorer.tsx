import { Component, type ReactNode, useEffect, useMemo, useState } from 'react';
import type { Locale } from '../../types';
import { NetworkExplorerFallback } from './NetworkExplorerFallback';
import { NetworkScene } from './NetworkScene';
import { isWebGLAvailable } from './webgl';
import {
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkRegions,
  type NetworkRegion,
} from './networkSceneData';

type Props = {
  locale: Locale;
};

const copy = {
  en: {
    eyebrow: 'Interactive 3D network explorer',
    title: 'ACSIC Network Explorer',
    description:
      'Follow a guided path across three prototype destinations and meet the institutions represented in this public knowledge hub.',
    schematic: 'Schematic ACSIC network visualization - not to scale.',
    selected: 'selected',
    member: 'Member',
    observer: 'Observer',
    profile: 'View profile',
    website: 'Official website ↗',
    exploreAll: 'Explore all institutions',
    networkStatus: (name: string, members: number, observers: number) =>
      observers
        ? name +
          ' selected. ' +
          members +
          ' ACSIC member institutions and ' +
          observers +
          ' observer.'
        : name + ' selected. ' + members + ' ACSIC member institutions.',
  },
  'zh-TW': {
    eyebrow: '互動式 3D 網絡探索器',
    title: 'ACSIC 網絡探索器',
    description: '沿著三個示範目的地探索公開知識平台中的 ACSIC 機構。',
    schematic: 'ACSIC 網絡示意圖，非依比例繪製。',
    selected: '目前選取',
    member: '正式會員',
    observer: '觀察員',
    profile: '查看機構檔案',
    website: '官方網站 ↗',
    exploreAll: '查看全部會員機構',
    networkStatus: (name: string, members: number, observers: number) =>
      observers
        ? name + ' 已選取。' + members + ' 家 ACSIC 正式會員及 ' + observers + ' 家觀察員。'
        : name + ' 已選取。' + members + ' 家 ACSIC 正式會員。',
  },
} as const;

export default function NetworkExplorer({ locale }: Props) {
  const c = copy[locale];
  const [selectedRegion, setSelectedRegion] = useState<NetworkRegion['id']>('taiwan');
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fallback, setFallback] = useState(false);
  const selected = getRegion(selectedRegion);
  const counts = getRegionMembershipCounts(selected);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    setFallback(!isWebGLAvailable());
    return () => media.removeEventListener?.('change', update);
  }, []);

  const selectRegion = (regionId: NetworkRegion['id']) => {
    setSelectedRegion(regionId);
    setSelectedInstitution(null);
  };

  const selectedInstitutionId = useMemo(() => selectedInstitution, [selectedInstitution]);
  const regionStatus = c.networkStatus(selected.label[locale], counts.members, counts.observers);

  if (fallback) {
    return (
      <NetworkExplorerFallback
        locale={locale}
        selectedRegion={selectedRegion}
        onSelectRegion={selectRegion}
      />
    );
  }

  return (
    <NetworkErrorBoundary
      locale={locale}
      selectedRegion={selectedRegion}
      onSelectRegion={selectRegion}
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
              className="network-canvas-frame"
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
              />
            </div>
            <p className="visually-hidden" id="network-canvas-description">
              {c.schematic}
            </p>
            <div className="network-destination-controls" role="group" aria-label={c.title}>
              {networkRegions.map((region) => (
                <button
                  type="button"
                  key={region.id}
                  className={region.id === selectedRegion ? 'is-selected' : ''}
                  aria-pressed={region.id === selectedRegion}
                  onClick={() => selectRegion(region.id)}
                >
                  {region.label[locale]}
                </button>
              ))}
            </div>
          </div>
          <aside className="network-panel" aria-labelledby="network-region-title">
            <p className="network-live" aria-live="polite">
              {regionStatus}
            </p>
            <div className="network-panel-heading">
              <div>
                <span className="eyebrow">{c.selected}</span>
                <h2 id="network-region-title">{selected.label[locale]}</h2>
              </div>
              <span className="network-count">
                {counts.members}
                {locale === 'en' ? ' Member' : ' 會員'}
                {counts.observers ? ' · ' + counts.observers + ' ' + c.observer : ''}
              </span>
            </div>
            <div className="institution-card-grid">
              {getRegionInstitutions(selected).map((institution) => (
                <InstitutionCard
                  key={institution.id}
                  institution={institution}
                  locale={locale}
                  copy={c}
                  selected={institution.id === selectedInstitutionId}
                  onSelect={() => setSelectedInstitution(institution.id)}
                />
              ))}
            </div>
            <a className="button secondary network-explore-all" href={'#/' + locale + '/members'}>
              {c.exploreAll}
            </a>
          </aside>
        </div>
      </section>
    </NetworkErrorBoundary>
  );
}

function InstitutionCard({
  institution,
  locale,
  copy,
  selected,
  onSelect,
}: {
  institution: ReturnType<typeof getRegionInstitutions>[number];
  locale: Locale;
  copy: {
    member: string;
    observer: string;
    profile: string;
    website: string;
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
        <a className="button secondary" href={'#/' + locale + '/members'} onClick={onSelect}>
          {copy.profile}
        </a>
        <a href={institution.officialWebsite} target="_blank" rel="noreferrer">
          {copy.website}
        </a>
      </div>
    </article>
  );
}

class NetworkErrorBoundary extends Component<
  {
    children: ReactNode;
    locale: Locale;
    selectedRegion: NetworkRegion['id'];
    onSelectRegion: (regionId: NetworkRegion['id']) => void;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(): void {
    // Keep the production surface readable while preserving the error in development tools.
  }

  render() {
    if (this.state.hasError) {
      return (
        <NetworkExplorerFallback
          locale={this.props.locale}
          selectedRegion={this.props.selectedRegion}
          onSelectRegion={this.props.onSelectRegion}
        />
      );
    }
    return this.props.children;
  }
}

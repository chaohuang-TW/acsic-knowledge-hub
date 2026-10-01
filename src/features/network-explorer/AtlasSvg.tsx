import type { KeyboardEvent } from 'react';
import type { Locale } from '../../types';
import { mascotSpriteUrl } from './mascot';
import {
  asiaLandContours,
  MAP_SVG_VIEWBOX,
  projectMapSvgPoint,
  projectMapSvgWorldPoint,
} from './asiaMapGeometry';
import {
  getInstitutionNodeOffsets,
  getRegionInstitutions,
  networkRegions,
  type NetworkRegion,
} from './networkSceneData';

type Props = {
  locale: Locale;
  selectedRegion: NetworkRegion['id'] | null;
  selectedInstitutionId: string | null;
  onSelectRegion: (regionId: NetworkRegion['id']) => void;
  onSelectInstitution: (institutionId: string) => void;
  ariaLabel: string;
  mascotAlt: string;
};

/** Small label offsets keep the dense North-East Asia cluster readable. */
const LABEL_OFFSETS: Record<string, [number, number]> = {
  KH: [-24, -24],
  IN: [-50, -4],
  ID: [-26, 28],
  JP: [26, -29],
  KR: [-62, -22],
  KG: [-44, -22],
  MY: [-12, 30],
  MN: [22, -25],
  NP: [-48, -20],
  PG: [22, 28],
  PH: [27, 20],
  LK: [19, 24],
  TW: [29, 27],
  TH: [-18, -25],
};

function contourPath(contour: readonly [number, number][]) {
  return contour
    .map(([longitude, latitude], index) => {
      const [x, y] = projectMapSvgPoint(longitude, latitude);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function onKeyboardActivate(event: KeyboardEvent<SVGGElement>, activate: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    activate();
  }
}

export function AtlasSvg({
  locale,
  selectedRegion,
  selectedInstitutionId,
  onSelectRegion,
  onSelectInstitution,
  ariaLabel,
  mascotAlt,
}: Props) {
  const activeRegion = networkRegions.find((region) => region.id === selectedRegion) ?? null;
  const activeInstitutions = activeRegion ? getRegionInstitutions(activeRegion) : [];
  const markerAction = locale === 'en' ? 'Explore' : '探索';
  const institutionAction = locale === 'en' ? 'Select institution' : '選取機構';
  const mascotWorld = activeRegion?.mascotTarget ?? [5.8, 0.18, 0.9];
  const [mascotWorldX, mascotWorldY] = projectMapSvgWorldPoint(mascotWorld[0], mascotWorld[2]);
  const mascotX = Math.min(Math.max(mascotWorldX, 76), MAP_SVG_VIEWBOX.width - 76);
  const mascotY = Math.min(Math.max(mascotWorldY, 90), MAP_SVG_VIEWBOX.height - 84);

  return (
    <div className="network-map-svg-wrap" data-map-renderer="svg">
      <svg
        className="network-map-svg"
        viewBox={`0 0 ${MAP_SVG_VIEWBOX.width} ${MAP_SVG_VIEWBOX.height}`}
        role="group"
        aria-label={ariaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="network-land-fill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--network-land-start, #dcebe2)" />
            <stop offset="1" stopColor="var(--network-land-end, #c4ddd1)" />
          </linearGradient>
          <filter id="network-map-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#244f48" floodOpacity="0.12" />
          </filter>
        </defs>
        <rect
          className="network-map-water"
          x="0"
          y="0"
          width={MAP_SVG_VIEWBOX.width}
          height={MAP_SVG_VIEWBOX.height}
          rx="36"
        />
        <g className="network-map-coastline" aria-hidden="true">
          {asiaLandContours.map((contour, index) => (
            <path
              key={`coast-${index}`}
              d={`${contourPath(contour)} Z`}
              fill="url(#network-land-fill)"
              filter={index < 5 ? 'url(#network-map-shadow)' : undefined}
            />
          ))}
        </g>
        <path
          className="network-map-graticule"
          d="M120 72 C345 36 672 38 884 103 M77 260 C346 224 680 226 935 267 M66 441 C321 399 674 408 934 455"
          fill="none"
          aria-hidden="true"
        />
        <g className="network-map-institution-nodes" aria-hidden={!activeRegion}>
          {activeRegion
            ? activeInstitutions.map((institution, index) => {
                const offset = getInstitutionNodeOffsets(activeInstitutions.length)[index];
                const [x, y] = projectMapSvgWorldPoint(
                  activeRegion.position[0] + offset[0] * 0.58,
                  activeRegion.position[2] + offset[2] * 0.58,
                );
                const selected = institution.id === selectedInstitutionId;
                return (
                  <g
                    key={institution.id}
                    className={`network-map-institution-node${selected ? ' is-selected' : ''}`}
                    transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    aria-label={`${institutionAction}: ${institution.institutionAbbreviation}, ${institution.name[locale]}`}
                    onClick={() => onSelectInstitution(institution.id)}
                    onKeyDown={(event) =>
                      onKeyboardActivate(event, () => onSelectInstitution(institution.id))
                    }
                  >
                    <circle className="network-map-hit-area" r="28" aria-hidden="true" />
                    <circle r={selected ? 15 : 11} />
                    <text y="4" textAnchor="middle">
                      {institution.institutionAbbreviation}
                    </text>
                  </g>
                );
              })
            : null}
        </g>
        <g className="network-map-markers">
          {networkRegions.map((region) => {
            const [x, y] = projectMapSvgWorldPoint(region.position[0], region.position[2]);
            const [offsetX, offsetY] = LABEL_OFFSETS[region.id] ?? [20, -20];
            const isSelected = region.id === selectedRegion;
            const labelWidth = Math.max(
              66,
              region.label[locale].length * (locale === 'en' ? 9 : 17) + 20,
            );
            const labelX = Math.min(
              Math.max(x + offsetX, labelWidth / 2 + 12),
              MAP_SVG_VIEWBOX.width - labelWidth / 2 - 12,
            );
            const labelY = Math.min(Math.max(y + offsetY, 22), MAP_SVG_VIEWBOX.height - 22);
            return (
              <g
                key={region.id}
                className={`network-map-marker${isSelected ? ' is-selected' : ''}`}
                data-economy-id={region.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${markerAction} ${region.label[locale]}`}
                onClick={() => onSelectRegion(region.id)}
                onKeyDown={(event) => onKeyboardActivate(event, () => onSelectRegion(region.id))}
              >
                <line className="network-map-leader" x1={x} y1={y} x2={labelX} y2={labelY} />
                <circle className="network-map-hit-area" cx={x} cy={y} r="28" aria-hidden="true" />
                <circle
                  className="network-map-marker-ring"
                  cx={x}
                  cy={y}
                  r={isSelected ? 19 : 15}
                />
                <circle className="network-map-marker-dot" cx={x} cy={y} r={isSelected ? 8 : 6} />
                <rect
                  className="network-map-label-plate"
                  x={labelX - labelWidth / 2}
                  y={labelY - 17}
                  width={labelWidth}
                  height="30"
                  rx="15"
                />
                <text className="network-map-label" x={labelX} y={labelY + 3} textAnchor="middle">
                  {region.label[locale]}
                </text>
              </g>
            );
          })}
        </g>
        <g
          className="network-map-mascot-group"
          transform={`translate(${mascotX.toFixed(2)} ${mascotY.toFixed(2)})`}
          aria-hidden="true"
        >
          <image
            className="network-map-mascot"
            href={mascotSpriteUrl}
            x="-47"
            y="-140"
            width="94"
            height="140"
            preserveAspectRatio="xMidYMax meet"
          />
          <ellipse className="network-map-mascot-shadow" cx="0" cy="-3" rx="32" ry="7" />
        </g>
      </svg>
      <p className="network-map-guide-note" aria-hidden="true">
        {mascotAlt}
      </p>
    </div>
  );
}

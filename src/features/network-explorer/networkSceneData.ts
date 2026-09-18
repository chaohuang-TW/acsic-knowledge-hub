import { institutions } from '../../data/institutions';
import { getEconomies, getMembershipStats } from '../institutions/directoryUtils';

export type Vec3 = [number, number, number];

export type EconomySceneLayout = {
  economyId: string;
  countryCode: string;
  position: Vec3;
  mascotTarget: Vec3;
  cameraTarget: Vec3;
};

export type NetworkRegion = EconomySceneLayout & {
  id: string;
  label: { en: string; 'zh-TW': string };
  institutionIds: string[];
};

/** Presentation-only coordinates. Economy names and institution membership remain governed data. */
const sceneLayouts: EconomySceneLayout[] = [
  {
    economyId: 'KH',
    countryCode: 'KH',
    position: [-4.5, 0.16, -2.7],
    mascotTarget: [-4.5, 0.48, -2],
    cameraTarget: [-4.2, 0.2, -2.4],
  },
  {
    economyId: 'IN',
    countryCode: 'IN',
    position: [-1.5, 0.16, -2.7],
    mascotTarget: [-1.5, 0.48, -2],
    cameraTarget: [-1.2, 0.2, -2.4],
  },
  {
    economyId: 'ID',
    countryCode: 'ID',
    position: [1.5, 0.16, -2.7],
    mascotTarget: [1.5, 0.48, -2],
    cameraTarget: [1.2, 0.2, -2.4],
  },
  {
    economyId: 'JP',
    countryCode: 'JP',
    position: [4.5, 0.16, -2.7],
    mascotTarget: [4.5, 0.48, -2],
    cameraTarget: [4.2, 0.2, -2.4],
  },
  {
    economyId: 'KR',
    countryCode: 'KR',
    position: [-4.5, 0.16, -0.9],
    mascotTarget: [-4.5, 0.48, -0.2],
    cameraTarget: [-4.2, 0.2, -0.6],
  },
  {
    economyId: 'KG',
    countryCode: 'KG',
    position: [-1.5, 0.16, -0.9],
    mascotTarget: [-1.5, 0.48, -0.2],
    cameraTarget: [-1.2, 0.2, -0.6],
  },
  {
    economyId: 'MY',
    countryCode: 'MY',
    position: [1.5, 0.16, -0.9],
    mascotTarget: [1.5, 0.48, -0.2],
    cameraTarget: [1.2, 0.2, -0.6],
  },
  {
    economyId: 'MN',
    countryCode: 'MN',
    position: [4.5, 0.16, -0.9],
    mascotTarget: [4.5, 0.48, -0.2],
    cameraTarget: [4.2, 0.2, -0.6],
  },
  {
    economyId: 'NP',
    countryCode: 'NP',
    position: [-4.5, 0.16, 0.9],
    mascotTarget: [-4.5, 0.48, 1.6],
    cameraTarget: [-4.2, 0.2, 1.2],
  },
  {
    economyId: 'PG',
    countryCode: 'PG',
    position: [-1.5, 0.16, 0.9],
    mascotTarget: [-1.5, 0.48, 1.6],
    cameraTarget: [-1.2, 0.2, 1.2],
  },
  {
    economyId: 'PH',
    countryCode: 'PH',
    position: [1.5, 0.16, 0.9],
    mascotTarget: [1.5, 0.48, 1.6],
    cameraTarget: [1.2, 0.2, 1.2],
  },
  {
    economyId: 'LK',
    countryCode: 'LK',
    position: [4.5, 0.16, 0.9],
    mascotTarget: [4.5, 0.48, 1.6],
    cameraTarget: [4.2, 0.2, 1.2],
  },
  {
    economyId: 'TW',
    countryCode: 'TW',
    position: [-1.5, 0.16, 2.8],
    mascotTarget: [-1.5, 0.48, 3.5],
    cameraTarget: [-1.2, 0.2, 3.1],
  },
  {
    economyId: 'TH',
    countryCode: 'TH',
    position: [1.5, 0.16, 2.8],
    mascotTarget: [1.5, 0.48, 3.5],
    cameraTarget: [1.2, 0.2, 3.1],
  },
];

const economyLabels = new Map(getEconomies().map((economy) => [economy.id, economy.label]));
const governedEconomyIds = new Set(getEconomies().map((economy) => economy.id));

export const networkRegions: NetworkRegion[] = sceneLayouts.map((layout) => {
  const label = economyLabels.get(layout.economyId);
  if (!label) throw new Error(`Missing governed economy label for ${layout.economyId}`);
  return {
    ...layout,
    id: layout.economyId,
    label,
    institutionIds: institutions
      .filter((institution) => institution.countryCode === layout.economyId)
      .map((institution) => institution.id),
  };
});

export const networkInstitutionIds = networkRegions.flatMap((region) => region.institutionIds);
export const networkEconomyLayouts = sceneLayouts;

export function getRegion(regionId: string | null | undefined) {
  return networkRegions.find((region) => region.id === regionId) ?? null;
}

export function getRegionInstitutions(region: NetworkRegion) {
  return region.institutionIds
    .map((id) => institutions.find((institution) => institution.id === id))
    .filter(
      (institution): institution is (typeof institutions)[number] => institution !== undefined,
    );
}

export function getRegionMembershipCounts(region: NetworkRegion) {
  const records = getRegionInstitutions(region);
  return {
    members: records.filter((record) => record.acsicMembershipStatus === 'member').length,
    observers: records.filter((record) => record.acsicMembershipStatus === 'observer').length,
  };
}

export function getInstitutionNodeOffsets(count: number): Vec3[] {
  if (count <= 0) return [];
  if (count === 1) return [[0, 0, 0.38]];
  const radius = count > 5 ? 0.95 : 0.74;
  const spread = Math.min(Math.PI * 0.85, 0.42 * (count - 1));
  return Array.from({ length: count }, (_, index) => {
    const angle = -spread / 2 + (spread * index) / (count - 1);
    return [Math.sin(angle) * radius, 0, Math.cos(angle) * radius * 0.62 + 0.16] as Vec3;
  });
}

export function getExplorerCoverage() {
  const stats = getMembershipStats();
  const explorerIds = new Set(networkInstitutionIds);
  const governedIds = new Set(institutions.map((institution) => institution.id));
  return {
    economies: governedEconomyIds.size,
    sceneEconomies: networkRegions.length,
    institutions: stats.institutions,
    explorerInstitutions: explorerIds.size,
    members: stats.members,
    observers: stats.observers,
    missingEconomies: getEconomies()
      .filter((economy) => !networkRegions.some((region) => region.id === economy.id))
      .map((economy) => economy.id),
    extraEconomies: networkRegions
      .filter((region) => !governedEconomyIds.has(region.id))
      .map((region) => region.id),
    missingInstitutions: [...governedIds].filter((id) => !explorerIds.has(id)),
    extraInstitutions: [...explorerIds].filter((id) => !governedIds.has(id)),
  };
}

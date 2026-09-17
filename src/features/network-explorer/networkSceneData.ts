import { institutions } from '../../data/institutions';

export type Vec3 = [number, number, number];

export type NetworkRegion = {
  id: 'taiwan' | 'japan' | 'korea';
  countryCode: string;
  label: Record<'en' | 'zh-TW', string>;
  institutionIds: string[];
  position: Vec3;
  mascotTarget: Vec3;
  cameraTarget: Vec3;
};

export const networkRegions: NetworkRegion[] = [
  {
    id: 'taiwan',
    countryCode: 'TW',
    label: { en: 'Taiwan', 'zh-TW': '臺灣' },
    institutionIds: ['tsmeg-tw', 'acgf-tw'],
    position: [-1.85, 0.16, 0.25],
    mascotTarget: [-1.85, 0.48, 0.82],
    cameraTarget: [-1.25, 0.2, 0.25],
  },
  {
    id: 'japan',
    countryCode: 'JP',
    label: { en: 'Japan', 'zh-TW': '日本' },
    institutionIds: ['jfc-jp', 'jfg-jp'],
    position: [1.65, 0.2, -0.75],
    mascotTarget: [1.65, 0.48, -0.16],
    cameraTarget: [1.2, 0.2, -0.55],
  },
  {
    id: 'korea',
    countryCode: 'KR',
    label: { en: 'Republic of Korea', 'zh-TW': '韓國' },
    institutionIds: ['kodit-kr', 'koreg-kr', 'kotec-kr'],
    position: [0.35, 0.19, 1.65],
    mascotTarget: [0.35, 0.48, 2.22],
    cameraTarget: [0.15, 0.2, 1.45],
  },
];

export const networkInstitutionIds = networkRegions.flatMap((region) => region.institutionIds);

export function getRegion(regionId: NetworkRegion['id']) {
  return networkRegions.find((region) => region.id === regionId) ?? networkRegions[0];
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

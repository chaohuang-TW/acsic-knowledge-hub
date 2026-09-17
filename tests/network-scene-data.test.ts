import { describe, expect, it } from 'vitest';
import { institutions } from '../src/data/institutions';
import {
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkInstitutionIds,
  networkRegions,
} from '../src/features/network-explorer/networkSceneData';

describe('ACSIC network explorer scene contract', () => {
  it('publishes exactly the three prototype regions', () => {
    expect(networkRegions.map((region) => region.id)).toEqual(['taiwan', 'japan', 'korea']);
  });

  it('uses the governed Traditional Chinese region labels', () => {
    expect(networkRegions.map((region) => region.label['zh-TW'])).toEqual(['臺灣', '日本', '韓國']);
  });

  it('keeps the governed destination institution IDs', () => {
    expect(getRegion('taiwan').institutionIds).toEqual(['tsmeg-tw', 'acgf-tw']);
    expect(getRegion('japan').institutionIds).toEqual(['jfc-jp', 'jfg-jp']);
    expect(getRegion('korea').institutionIds).toEqual(['kodit-kr', 'koreg-kr', 'kotec-kr']);
  });

  it('resolves every scene ID to one production institution without duplicates', () => {
    expect(new Set(networkInstitutionIds).size).toBe(7);
    expect(
      networkInstitutionIds.every((id) =>
        institutions.some((institution) => institution.id === id),
      ),
    ).toBe(true);
    expect(new Set(networkInstitutionIds).size).toBe(networkInstitutionIds.length);
  });

  it('derives region member and observer counts from production status', () => {
    expect(getRegionMembershipCounts(getRegion('taiwan'))).toEqual({ members: 1, observers: 1 });
    expect(getRegionMembershipCounts(getRegion('japan'))).toEqual({ members: 2, observers: 0 });
    expect(getRegionMembershipCounts(getRegion('korea'))).toEqual({ members: 3, observers: 0 });
  });

  it('uses production institution websites and names for every node', () => {
    networkRegions.forEach((region) =>
      getRegionInstitutions(region).forEach((institution) => {
        expect(institution.officialWebsite).toMatch(/^https?:\/\//);
        expect(institution.name.en).toBeTruthy();
        expect(institution.institutionAbbreviation).toBeTruthy();
      }),
    );
  });
});

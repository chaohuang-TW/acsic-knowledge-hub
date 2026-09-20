import { describe, expect, it } from 'vitest';
import { institutions } from '../src/data/institutions';
import { getEconomies, getMembershipStats } from '../src/features/institutions/directoryUtils';
import {
  getExplorerCoverage,
  getInstitutionNodeOffsets,
  getRegion,
  getRegionInstitutions,
  getRegionMembershipCounts,
  networkEconomyLayouts,
  networkInstitutionIds,
  networkRegions,
} from '../src/features/network-explorer/networkSceneData';

describe('ACSIC full network explorer scene contract', () => {
  it('covers every governed economy with exactly one presentation layout', () => {
    const governed = getEconomies().map((economy) => economy.id);
    expect(governed).toHaveLength(14);
    expect(networkEconomyLayouts).toHaveLength(14);
    expect(networkRegions).toHaveLength(14);
    expect(new Set(networkEconomyLayouts.map((layout) => layout.economyId)).size).toBe(14);
    expect(new Set(networkEconomyLayouts.map((layout) => layout.countryCode)).size).toBe(14);
    expect(networkRegions.map((region) => region.id).sort()).toEqual([...governed].sort());
  });

  it('derives all institution IDs from governed production records', () => {
    const coverage = getExplorerCoverage();
    const stats = getMembershipStats();
    expect(stats.institutions).toBe(21);
    expect(stats.members).toBe(20);
    expect(stats.observers).toBe(1);
    expect(coverage.explorerInstitutions).toBe(21);
    expect(coverage.missingEconomies).toEqual([]);
    expect(coverage.extraEconomies).toEqual([]);
    expect(coverage.missingInstitutions).toEqual([]);
    expect(coverage.extraInstitutions).toEqual([]);
    expect(new Set(networkInstitutionIds).size).toBe(21);
  });

  it('assigns each governed institution to exactly one economy', () => {
    const occurrences = new Map<string, number>();
    networkRegions.forEach((region) =>
      region.institutionIds.forEach((id) => occurrences.set(id, (occurrences.get(id) ?? 0) + 1)),
    );
    expect(occurrences.size).toBe(institutions.length);
    expect([...occurrences.values()].every((count) => count === 1)).toBe(true);
  });

  it('keeps the prototype economy groupings and observer status', () => {
    expect(getRegion('TW')?.institutionIds).toEqual(['tsmeg-tw', 'acgf-tw']);
    expect(getRegion('JP')?.institutionIds).toEqual(['jfc-jp', 'jfg-jp']);
    expect(getRegion('KR')?.institutionIds).toEqual(['kodit-kr', 'koreg-kr', 'kotec-kr']);
    expect(getRegionMembershipCounts(getRegion('TW')!)).toEqual({ members: 1, observers: 1 });
    expect(getRegionMembershipCounts(getRegion('JP')!)).toEqual({ members: 2, observers: 0 });
  });

  it('provides finite unique scene coordinates and targets', () => {
    const positions = networkEconomyLayouts.map((layout) => layout.position.join(','));
    expect(new Set(positions).size).toBe(positions.length);
    networkEconomyLayouts.forEach((layout) =>
      [layout.position, layout.mascotTarget, layout.cameraTarget].forEach((point) =>
        point.forEach((value) => expect(Number.isFinite(value)).toBe(true)),
      ),
    );
  });

  it('keeps geographically meaningful north/south and east/west relationships', () => {
    const p = (id: string) => getRegion(id)!.position;
    expect(p('JP')[0]).toBeGreaterThan(p('KR')[0]);
    expect(p('KR')[2]).toBeLessThan(p('TW')[2]);
    expect(p('MN')[2]).toBeLessThan(p('KR')[2]);
    expect(p('KG')[0]).toBeLessThan(p('MN')[0]);
    expect(p('IN')[0]).toBeLessThan(p('TH')[0]);
    expect(p('LK')[2]).toBeGreaterThan(p('IN')[2]);
    expect(p('NP')[2]).toBeLessThan(p('IN')[2]);
    expect(p('MY')[2]).toBeGreaterThan(p('TH')[2]);
    expect(p('KH')[0]).toBeGreaterThan(p('TH')[0]);
    expect(p('ID')[2]).toBeGreaterThan(p('MY')[2]);
    expect(p('PH')[0]).toBeGreaterThan(p('KH')[0]);
    expect(p('PG')[0]).toBeGreaterThan(p('ID')[0]);
    expect(p('PG')[2]).toBeGreaterThan(p('PH')[2]);
  });

  it.each([1, 2, 3, 4, 5, 6])(
    'supports a non-overlapping institution cluster of %i nodes',
    (count) => {
      const offsets = getInstitutionNodeOffsets(count);
      expect(offsets).toHaveLength(count);
      expect(new Set(offsets.map((offset) => offset.join(','))).size).toBe(count);
      offsets.flat().forEach((value) => expect(Number.isFinite(value)).toBe(true));
    },
  );

  it('uses production names and official websites for every rendered node', () => {
    networkRegions.forEach((region) =>
      getRegionInstitutions(region).forEach((institution) => {
        expect(institution.officialWebsite).toMatch(/^https?:\/\//);
        expect(institution.name.en).toBeTruthy();
        expect(institution.institutionAbbreviation).toBeTruthy();
      }),
    );
  });
});

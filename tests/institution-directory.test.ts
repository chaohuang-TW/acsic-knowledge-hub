import { describe, expect, it } from 'vitest';
import { institutions } from '../src/data/institutions';
import {
  filterInstitutions,
  getEconomies,
  getMembershipStats,
  groupInstitutionsByEconomy,
} from '../src/features/institutions/directoryUtils';

describe('ACSIC institution directory helpers', () => {
  it('derives the governed membership boundary', () => {
    expect(institutions).toHaveLength(21);
    expect(getMembershipStats()).toEqual({
      institutions: 21,
      members: 20,
      observers: 1,
      economies: 14,
    });
    expect(
      institutions
        .filter((record) => record.acsicMembershipStatus === 'observer')
        .map((record) => record.institutionAbbreviation),
    ).toEqual(['ACGF']);
  });

  it('derives fourteen economy labels from production records', () => {
    const economies = getEconomies();
    expect(economies).toHaveLength(14);
    expect(economies.find((economy) => economy.id === 'TW')?.label).toEqual({
      en: 'Taiwan',
      'zh-TW': '臺灣',
    });
    expect(economies.find((economy) => economy.id === 'KR')?.label).toEqual({
      en: 'Republic of Korea',
      'zh-TW': '韓國',
    });
  });

  it('matches abbreviation, official names, native names, economy and summaries', () => {
    expect(
      filterInstitutions(institutions, {
        query: 'KODIT',
        economy: 'all',
        type: 'all',
        membership: 'all',
      }).map((record) => record.id),
    ).toEqual(['kodit-kr']);
    expect(
      filterInstitutions(institutions, {
        query: 'Credit Guarantee Fund',
        economy: 'all',
        type: 'all',
        membership: 'all',
      }).length,
    ).toBeGreaterThan(1);
    expect(
      filterInstitutions(institutions, {
        query: '信用保證基金',
        economy: 'all',
        type: 'all',
        membership: 'all',
      }).map((record) => record.id),
    ).toContain('acgf-tw');
    expect(
      filterInstitutions(institutions, {
        query: '株式会社',
        economy: 'all',
        type: 'all',
        membership: 'all',
      }).map((record) => record.id),
    ).toContain('jfc-jp');
    expect(
      filterInstitutions(institutions, {
        query: 'Japan',
        economy: 'all',
        type: 'all',
        membership: 'all',
      }),
    ).toHaveLength(2);
  });

  it('combines economy, type, membership and query filters', () => {
    expect(
      filterInstitutions(institutions, {
        query: '',
        economy: 'TW',
        type: 'all',
        membership: 'all',
      }).map((record) => record.institutionAbbreviation),
    ).toEqual(['TSMEG', 'ACGF']);
    expect(
      filterInstitutions(institutions, {
        query: '',
        economy: 'all',
        type: 'all',
        membership: 'observer',
      }).map((record) => record.institutionAbbreviation),
    ).toEqual(['ACGF']);
    expect(
      filterInstitutions(institutions, {
        query: '',
        economy: 'JP',
        type: 'all',
        membership: 'all',
      }).map((record) => record.institutionAbbreviation),
    ).toEqual(['JFC', 'JFG']);
    expect(
      filterInstitutions(institutions, {
        query: '',
        economy: 'KR',
        type: 'all',
        membership: 'all',
      }).map((record) => record.institutionAbbreviation),
    ).toEqual(['KODIT', 'KOREG', 'KOTEC']);
    expect(
      filterInstitutions(institutions, {
        query: '',
        economy: 'TW',
        type: 'all',
        membership: 'member',
      }).map((record) => record.institutionAbbreviation),
    ).toEqual(['TSMEG']);
  });

  it('groups every filtered record exactly once', () => {
    const groups = groupInstitutionsByEconomy(institutions);
    expect(groups).toHaveLength(14);
    expect(groups.flatMap((group) => group.institutions)).toHaveLength(21);
    expect(
      new Set(groups.flatMap((group) => group.institutions.map((record) => record.id))).size,
    ).toBe(21);
    expect(
      groups
        .find((group) => group.id === 'TW')
        ?.institutions.map((record) => record.institutionAbbreviation),
    ).toEqual(['TSMEG', 'ACGF']);
  });
});

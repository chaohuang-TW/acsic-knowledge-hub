import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { institutions, membershipStats } from '../src/data/institutions';
import type { InstitutionFilters, ReportType } from '../src/types';
import {
  COMPARISON_LIMITATION,
  COMPARISON_LIMITATION_EN,
  DISCLAIMER,
  DISCLAIMER_EN,
  comparisonCsv,
  comparisonJson,
  comparisonMarkdown,
  defaultFilters,
  filterInstitutions,
  generateReport,
} from '../src/utils/core';

const filters = (overrides: Partial<InstitutionFilters>): InstitutionFilters => ({
  ...defaultFilters,
  ...overrides,
});

describe('ACSIC 2026 membership master roster', () => {
  it('contains exactly 20 formal members, one observer and 21 unique records', () => {
    expect(institutions).toHaveLength(21);
    expect(new Set(institutions.map((record) => record.id)).size).toBe(21);
    expect(institutions.filter((record) => record.acsicMembershipStatus === 'member')).toHaveLength(
      20,
    );
    const observers = institutions.filter((record) => record.acsicMembershipStatus === 'observer');
    expect(observers).toHaveLength(1);
    expect(observers[0]?.id).toBe('acgf-tw');
    expect(membershipStats).toMatchObject({
      formalMembers: 20,
      observers: 1,
      countriesEconomies: 14,
      institutionsCovered: 21,
      level1Complete: 21,
    });
  });

  it('uses exactly the authoritative 14 country or economy codes for formal members', () => {
    const actual = [
      ...new Set(
        institutions
          .filter((record) => record.acsicMembershipStatus === 'member')
          .map((record) => record.countryCode),
      ),
    ].sort();
    expect(actual).toEqual([
      'ID',
      'IN',
      'JP',
      'KG',
      'KH',
      'KR',
      'LK',
      'MN',
      'MY',
      'NP',
      'PG',
      'PH',
      'TH',
      'TW',
    ]);
  });

  it('keeps all required IDs and abbreviations without duplicate aliases', () => {
    const expected: Record<string, string> = {
      'cgcc-kh': 'CGCC',
      'cgtmse-in': 'CGTMSE',
      'asippindo-id': 'ASIPPINDO',
      'askrindo-id': 'ASKRINDO',
      'jfc-jp': 'JFC',
      'jfg-jp': 'JFG',
      'kodit-kr': 'KODIT',
      'koreg-kr': 'KOREG',
      'kotec-kr': 'KOTEC',
      'ojscgf-kg': 'OJSCGF',
      'cgc-my': 'CGC',
      'cgfm-mn': 'CGFM',
      'dcgf-np': 'DCGF',
      'smec-pg': 'SMEC',
      'cgcpng-pg': 'CGCPNG',
      'philguarantee-ph': 'PHILGUARANTEE',
      'cbsl-lk': 'CBSL',
      'slecic-lk': 'SLECIC',
      'tsmeg-tw': 'TSMEG',
      'tcg-th': 'TCG',
      'acgf-tw': 'ACGF',
    };
    expect(
      Object.fromEntries(institutions.map((record) => [record.id, record.institutionAbbreviation])),
    ).toEqual(expected);
    expect(
      institutions.filter((record) => record.name.aliases.includes('CGC Malaysia')),
    ).toHaveLength(1);
    expect(
      institutions.find((record) => record.id === 'smec-pg')?.institutionRoleCategory,
    ).not.toBe(institutions.find((record) => record.id === 'cgcpng-pg')?.institutionRoleCategory);
  });
});

describe('Level 1, Level 2 and source governance', () => {
  it('completes Level 1 for all 21 records with bilingual names and official websites', () => {
    for (const record of institutions) {
      expect(record.level1Completion).toBe(100);
      expect(record.name.officialEnglish.length).toBeGreaterThan(3);
      expect(record.name['zh-TW'].length).toBeGreaterThan(1);
      expect(['official', 'research_translation', 'pending']).toContain(
        record.name.zhTWTranslationStatus,
      );
      expect(new URL(record.officialWebsite).protocol).toBe('https:');
      expect(record.institutionRoleCategory).toBeTruthy();
      expect(record.membershipVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(record.institutionVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('gives every record membership evidence and its own official source', () => {
    for (const record of institutions) {
      expect(record.sourceReferences.some((source) => source.sourceType.includes('roster'))).toBe(
        true,
      );
      expect(
        record.sourceReferences.some(
          (source) => source.sourceType === 'official_institution_webpage',
        ),
      ).toBe(true);
      for (const source of record.sourceReferences) {
        expect(source.isPrimarySource).toBe(true);
        expect(source.originalLanguage).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
        expect(source.accessedDate).toBe('2026-07-16');
        expect(source.finalResolvedUrl).toMatch(/^https:\/\//);
      }
    }
  });

  it('calculates type-aware Level 2 completion and excludes not-applicable fields', () => {
    for (const record of institutions) {
      expect(record.level2Completion).toBe(
        Math.round(
          (record.level2VerifiedFields.length / record.level2ApplicableFields.length) * 100,
        ),
      );
      expect(record.missingFields.some((field) => record.notApplicableFields.includes(field))).toBe(
        false,
      );
      for (const field of record.level2VerifiedFields)
        expect(record.fieldEvidence[field]).toBeTruthy();
    }
  });

  it('requires full provenance for any future Level 3 metric', () => {
    for (const metric of institutions.flatMap((record) => record.level3Metrics)) {
      for (const key of [
        'value',
        'unit',
        'definition',
        'asOfDate',
        'sourceId',
        'pageOrSection',
        'verificationStatus',
      ]) {
        expect(metric[key]).not.toBeUndefined();
      }
    }
  });

  it('blocks known roster-link errors and deprecated roster use', () => {
    expect(institutions.find((record) => record.id === 'philguarantee-ph')?.officialWebsite).toBe(
      'https://www.philguarantee.gov.ph/',
    );
    expect(institutions.find((record) => record.id === 'acgf-tw')?.officialWebsite).toBe(
      'https://www.acgf.org.tw/',
    );
    const production = JSON.stringify(institutions);
    expect(production).not.toContain('node=31');
    expect(production).not.toContain('東嶼國');
    expect(institutions.filter((record) => record.id.startsWith('jfg-'))).toHaveLength(1);
  });
});

describe('search, comparison and bilingual exports', () => {
  it('searches official names, Traditional Chinese and aliases', () => {
    expect(
      filterInstitutions(institutions, filters({ query: 'Agricultural Credit' })),
    ).toHaveLength(1);
    expect(filterInstitutions(institutions, filters({ query: '農業信用' }))).toHaveLength(1);
    expect(
      filterInstitutions(institutions, filters({ query: 'CGCMB' })).map((record) => record.id),
    ).toEqual(['cgc-my']);
  });

  it('exports governed fields, dates, sources, limitations and disclaimers', () => {
    const selected = [institutions[4]!, institutions[16]!];
    for (const output of [comparisonMarkdown(selected, 'en'), comparisonCsv(selected, 'en')]) {
      expect(output).toContain('Official sources');
      expect(output).toContain('Field-level evidence');
      expect(output).toContain(DISCLAIMER_EN);
      expect(output).toContain(COMPARISON_LIMITATION_EN);
    }
    for (const output of [
      comparisonMarkdown(selected, 'zh-TW'),
      comparisonCsv(selected, 'zh-TW'),
    ]) {
      expect(output).toContain('官方來源');
      expect(output).toContain('欄位級來源');
      expect(output).toContain(DISCLAIMER);
      expect(output).toContain(COMPARISON_LIMITATION);
    }
    expect(JSON.parse(comparisonJson(selected, 'en')).institutions).toHaveLength(2);
  });

  const reportTypes: ReportType[] = [
    'executive',
    'country',
    'comparison',
    'meeting-qa',
    'presentation',
  ];
  it.each(reportTypes)('%s report supports both languages', (type) => {
    const selected = institutions.slice(0, 2);
    expect(generateReport(type, selected, new Date('2026-07-16'), 'en')).toContain(
      '## Official sources',
    );
    expect(generateReport(type, selected, new Date('2026-07-16'), 'zh-TW')).toContain(
      '## 官方來源',
    );
  });
});

describe('deployment and security boundaries', () => {
  it('retains the ACSIC brand, noindex and renamed Pages base', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('ACSIC Knowledge Hub');
    expect(html).toContain('noindex, nofollow, noarchive');
    for (const path of ['vite.config.ts', 'public/404.html', 'playwright.config.ts']) {
      const content = readFileSync(path, 'utf8');
      expect(content).toContain('/acsic-knowledge-hub/');
      expect(content).not.toContain('/acgf-strategy-os-demo/');
    }
  });
});

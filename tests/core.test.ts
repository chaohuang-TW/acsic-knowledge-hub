import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { institutions } from '../src/data/institutions';
import type { Institution, InstitutionFilters, ReportType } from '../src/types';
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
const forbiddenNames = ['東嶼國', '北辰', '海岳', '雲原'];

describe('multilingual public-data contract', () => {
  it('retains nine real profiles and treats ACGF only as an Observer record', () => {
    expect(institutions).toHaveLength(9);
    expect(institutions.find((record) => record.id === 'tw-acgf')?.acsicMembershipStatus).toBe(
      'Observer',
    );
    expect(institutions.filter((record) => record.acsicMembershipStatus === 'Member')).toHaveLength(
      8,
    );
  });

  it('preserves official English names and bilingual structured fields', () => {
    for (const record of institutions) {
      expect(record.name.en).toBe(record.institutionNameEn);
      expect(record.name.en.length).toBeGreaterThan(3);
      expect(record.name['zh-TW'].length).toBeGreaterThan(1);
      expect(record.summary.en.length).toBeGreaterThan(20);
      expect(record.summary['zh-TW'].length).toBeGreaterThan(10);
      expect(['official', 'research_translation', 'pending']).toContain(
        record.nameTranslationStatus,
      );
      expect(record.type.en.length).toBeGreaterThan(3);
      expect(record.type['zh-TW']).toBe(record.institutionType);
    }
  });

  it('records an original language for every official source', () => {
    for (const record of institutions) {
      expect(new URL(record.officialWebsite).protocol).toBe('https:');
      expect(record.sourceReferences.length).toBeGreaterThanOrEqual(2);
      for (const source of record.sourceReferences) {
        expect(source.official).toBe(true);
        expect(source.originalLanguage).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
        expect(new URL(source.url).protocol).toBe('https:');
        expect(source.accessedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('contains no fictional legacy names in production data or exports', () => {
    const content =
      JSON.stringify(institutions) +
      comparisonMarkdown(institutions.slice(0, 2), 'en') +
      generateReport('executive', institutions.slice(0, 1), new Date('2026-07-16'), 'zh-TW');
    for (const value of forbiddenNames) expect(content).not.toContain(value);
  });

  it('keeps nullable research fields instead of inventing missing facts', () => {
    for (const record of institutions)
      for (const key of [
        'legalBasis',
        'guaranteeCoverage',
        'riskSharingModel',
        'fundingSources',
        'youthFarmerMeasures',
      ] satisfies Array<keyof Institution>)
        expect(Object.hasOwn(record, key)).toBe(true);
  });
});

describe('search and filters', () => {
  it('searches English, Traditional Chinese and abbreviations', () => {
    expect(
      filterInstitutions(institutions, filters({ query: 'Agricultural Credit' })),
    ).toHaveLength(1);
    expect(filterInstitutions(institutions, filters({ query: '農業信用' }))).toHaveLength(1);
    expect(filterInstitutions(institutions, filters({ query: 'CGCC' }))).toHaveLength(1);
  });
  it('combines country, type, tag and verification filters', () =>
    expect(
      filterInstitutions(
        institutions,
        filters({
          country: '柬埔寨',
          type: '國營信用保證機構',
          tag: '農業',
          verification: 'verified',
        }),
      ).map((record) => record.id),
    ).toEqual(['kh-cgcc']));
});

describe('bilingual comparison and reports', () => {
  const selected = institutions.slice(0, 2);
  it('exports English and Traditional Chinese with sources and disclaimers', () => {
    const english = [comparisonMarkdown(selected, 'en'), comparisonCsv(selected, 'en')];
    const chinese = [comparisonMarkdown(selected, 'zh-TW'), comparisonCsv(selected, 'zh-TW')];
    for (const output of english) {
      expect(output).toContain('Official sources');
      expect(output).toContain(DISCLAIMER_EN);
      expect(output).toContain(COMPARISON_LIMITATION_EN);
    }
    for (const output of chinese) {
      expect(output).toContain('官方來源');
      expect(output).toContain(DISCLAIMER);
      expect(output).toContain(COMPARISON_LIMITATION);
    }
    expect(JSON.parse(comparisonJson(selected, 'en')).language).toBe('en');
    expect(JSON.parse(comparisonJson(selected, 'zh-TW')).language).toBe('zh-TW');
  });

  const reportTypes: ReportType[] = [
    'executive',
    'country',
    'comparison',
    'meeting-qa',
    'presentation',
  ];
  it.each(reportTypes)('%s report supports both languages', (type) => {
    const en = generateReport(type, selected, new Date('2026-07-16'), 'en');
    const zh = generateReport(type, selected, new Date('2026-07-16'), 'zh-TW');
    expect(en).toContain('## Official sources');
    expect(en).toContain('## Pending research');
    expect(zh).toContain('## 官方來源');
    expect(zh).toContain('## 待查證事項');
  });

  it('metadata uses the ACSIC Knowledge Hub brand and keeps noindex', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('ACSIC Knowledge Hub');
    expect(html).toContain('noindex, nofollow, noarchive');
    expect(html).not.toContain('ACGF Strategy OS');
  });
});

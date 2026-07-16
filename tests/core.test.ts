import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { institutions } from '../src/data/institutions';
import type { Institution, InstitutionFilters, ReportType } from '../src/types';
import {
  COMPARISON_LIMITATION,
  DISCLAIMER,
  RESEARCH_LABEL,
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
// TEST_ONLY：只用於確保舊版名稱不會回到生產資料或輸出。
const forbiddenNames = ['東嶼國', '北辰', '海岳', '雲原'];

describe('官方公開資料治理', () => {
  it('具有九筆指定真實機構，且 ACSIC 身分正確', () => {
    expect(institutions).toHaveLength(9);
    expect(institutions.find((r) => r.id === 'tw-acgf')?.acsicMembershipStatus).toBe('Observer');
    expect(institutions.filter((r) => r.acsicMembershipStatus === 'Member')).toHaveLength(8);
  });

  it('每筆資料都有官方網站、來源、查閱日期及查證欄位', () => {
    for (const record of institutions) {
      expect(new URL(record.officialWebsite).protocol).toBe('https:');
      expect(record.sourceReferences.length).toBeGreaterThanOrEqual(2);
      expect(record.sourceReferences.every((source) => source.official)).toBe(true);
      expect(
        record.sourceReferences.every((source) => new URL(source.url).protocol === 'https:'),
      ).toBe(true);
      expect(
        record.sourceReferences.every((source) => /^\d{4}-\d{2}-\d{2}$/.test(source.accessedDate)),
      ).toBe(true);
      expect(['verified', 'partially_verified', 'pending_verification']).toContain(
        record.verificationStatus,
      );
      expect(['high', 'medium', 'low']).toContain(record.confidenceLevel);
    }
  });

  it('已查證紀錄有官方來源與已查證事實', () => {
    for (const record of institutions.filter((r) => r.verificationStatus === 'verified')) {
      expect(record.sourceReferences.length).toBeGreaterThan(0);
      expect(record.verifiedFacts.length).toBeGreaterThan(0);
    }
  });

  it('生產資料與主要輸出不含禁止的舊名稱或公開展示標籤', () => {
    const content =
      JSON.stringify(institutions) +
      comparisonMarkdown(institutions.slice(0, 2)) +
      generateReport('executive', institutions.slice(0, 1));
    for (const value of [...forbiddenNames, 'DEMO 示範資料']) expect(content).not.toContain(value);
    expect(RESEARCH_LABEL).toBe('官方公開資料研究版');
  });

  it('所有機構欄位完整，未揭露資料保留 null 或空陣列', () => {
    for (const record of institutions) {
      for (const key of [
        'legalBasis',
        'guaranteeCoverage',
        'riskSharingModel',
        'fundingSources',
        'youthFarmerMeasures',
      ] satisfies Array<keyof Institution>) {
        expect(Object.hasOwn(record, key)).toBe(true);
      }
    }
  });

  it('資料集不保存缺少資料日期契約的動態數值物件', () => {
    const dynamicKeys = [
      'guaranteeRate',
      'guaranteeLimit',
      'guaranteeFee',
      'beneficiaryCount',
      'guaranteeAmount',
    ];
    for (const record of institutions)
      for (const key of dynamicKeys) expect(Object.hasOwn(record, key)).toBe(false);
  });
});

describe('搜尋、篩選與排序', () => {
  it('可搜尋中文、英文與簡稱', () => {
    expect(filterInstitutions(institutions, filters({ query: '農業信用' }))).toHaveLength(1);
    expect(filterInstitutions(institutions, filters({ query: 'CGCC' }))).toHaveLength(1);
    expect(filterInstitutions(institutions, filters({ query: 'Japan' }))).toHaveLength(2);
  });
  it('可組合國家、類型、標籤與查證狀態', () => {
    expect(
      filterInstitutions(
        institutions,
        filters({
          country: '柬埔寨',
          type: '國營信用保證機構',
          tag: '農業',
          verification: 'verified',
        }),
      ).map((r) => r.id),
    ).toEqual(['kh-cgcc']);
  });
  it('無結果時回傳空陣列', () =>
    expect(filterInstitutions(institutions, filters({ query: '不存在的機構' }))).toEqual([]));
});

describe('比較匯出與報告', () => {
  const selected = institutions.slice(0, 2);
  it('三種比較格式都有來源、日期、免責聲明及限制', () => {
    for (const output of [comparisonMarkdown(selected), comparisonCsv(selected)]) {
      expect(output).toContain('官方來源');
      expect(output).toContain('2026-07-16');
      expect(output).toContain(DISCLAIMER);
      expect(output).toContain(COMPARISON_LIMITATION);
    }
    const json = JSON.parse(comparisonJson(selected)) as {
      disclaimer: string;
      comparisonLimitation: string;
      institutions: Institution[];
    };
    expect(json.disclaimer).toBe(DISCLAIMER);
    expect(json.comparisonLimitation).toBe(COMPARISON_LIMITATION);
    expect(json.institutions).toHaveLength(2);
  });

  const reportTypes: ReportType[] = [
    'executive',
    'country',
    'comparison',
    'meeting-qa',
    'presentation',
  ];
  it.each(reportTypes)('%s 報告分開事實、推論、待查證與來源', (type) => {
    const output = generateReport(type, selected, new Date('2026-07-16'));
    for (const heading of [
      '產製日期：2026-07-16',
      '資料最後查證日期',
      '## 官方來源',
      '## 已查證事實',
      '## 分析／推論',
      '## 待查證事項',
      '## 比較限制',
      '## 免責聲明',
    ])
      expect(output).toContain(heading);
  });

  it('入口文件保留 noindex', () =>
    expect(readFileSync('index.html', 'utf8')).toContain('noindex, nofollow, noarchive'));
});

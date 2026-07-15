import { describe, expect, it } from 'vitest';
import { institutions } from '../src/data/institutions';
import type { Institution, InstitutionFilters, ReportType } from '../src/types';
import {
  comparisonCsv,
  comparisonJson,
  comparisonMarkdown,
  defaultFilters,
  DEMO_NOTICE,
  DISCLAIMER,
  filterInstitutions,
  generateReport,
} from '../src/utils/core';

function filters(overrides: Partial<InstitutionFilters>): InstitutionFilters {
  return { ...defaultFilters, ...overrides };
}

describe('公開 DEMO 資料治理', () => {
  it('所有資料都明確標示為 DEMO，且使用虛構來源網域', () => {
    expect(institutions).toHaveLength(4);
    expect(institutions.every((record) => record.demo)).toBe(true);
    expect(
      institutions.every((record) =>
        record.sources.every((source) => new URL(source.url).hostname.endsWith('.invalid')),
      ),
    ).toBe(true);
  });

  it('每筆資料都保留事實、推論、待查證事項與來源', () => {
    for (const record of institutions) {
      expect(record.facts.length).toBeGreaterThan(0);
      expect(record.inferences.length).toBeGreaterThan(0);
      expect(record.pending.length).toBeGreaterThan(0);
      expect(record.sources.length).toBeGreaterThan(0);
    }
  });

  it('全站免責聲明與 DEMO 標示完整', () => {
    expect(DEMO_NOTICE).toContain('DEMO');
    expect(DISCLAIMER).toContain('並非任何政府機關');
    expect(DISCLAIMER).toContain('不構成政策、金融或法律建議');
  });
});

describe('搜尋、篩選與排序', () => {
  it('可依機構名稱關鍵字搜尋', () => {
    expect(filterInstitutions(institutions, filters({ query: '東嶼' }))).toHaveLength(1);
  });

  it('可依國家、類型、標籤與查證狀態組合篩選', () => {
    const result = filterInstitutions(
      institutions,
      filters({
        country: '海岳共和國',
        type: '綠色融資保證機構',
        tag: '農業',
        verification: '示範已檢核',
      }),
    );
    expect(result.map((record) => record.id)).toEqual(['sea-mount-green-finance']);
  });

  it('可依農業與青年農民措施篩選', () => {
    expect(filterInstitutions(institutions, filters({ agriculture: '無' }))).toHaveLength(1);
    expect(filterInstitutions(institutions, filters({ youth: '有' }))).toHaveLength(3);
  });

  it('無符合條件時回傳空陣列，不自動補資料', () => {
    expect(filterInstitutions(institutions, filters({ query: '不存在的機構' }))).toEqual([]);
  });

  it('支援最近、較早與名稱排序', () => {
    expect(filterInstitutions(institutions, filters({ sort: 'newest' }))[0]?.updatedAt).toBe(
      '2026-07-12',
    );
    expect(filterInstitutions(institutions, filters({ sort: 'oldest' }))[0]?.updatedAt).toBe(
      '2026-05-19',
    );
    expect(filterInstitutions(institutions, filters({ sort: 'name' }))).toHaveLength(4);
  });
});

describe('比較匯出', () => {
  const selected = institutions.slice(0, 2);

  it('Markdown 包含比較欄位、DEMO 與免責聲明', () => {
    const output = comparisonMarkdown(selected);
    expect(output).toContain('# DEMO 跨機構比較');
    expect(output).toContain('服務對象');
    expect(output).toContain(DISCLAIMER);
  });

  it('CSV 包含 DEMO、免責聲明與兩筆機構', () => {
    const output = comparisonCsv(selected);
    expect(output).toContain('DEMO 跨機構比較');
    expect(output).toContain('非官方聲明');
    expect(output).toContain(selected[1]!.institutionName);
  });

  it('JSON 可解析且保留 DEMO、免責聲明與資料', () => {
    const output = JSON.parse(comparisonJson(selected)) as {
      label: string;
      disclaimer: string;
      institutions: Institution[];
    };
    expect(output.label).toBe(DEMO_NOTICE);
    expect(output.disclaimer).toBe(DISCLAIMER);
    expect(output.institutions).toHaveLength(2);
  });
});

describe('報告範本', () => {
  const reportTypes: ReportType[] = [
    'executive',
    'country',
    'comparison',
    'meeting-qa',
    'presentation',
  ];

  it.each(reportTypes)('%s 範本保留必要治理欄位', (type) => {
    const output = generateReport(type, institutions.slice(0, 2), new Date('2026-07-15'));
    expect(output).toContain('# DEMO');
    expect(output).toContain('產製日期：2026-07-15');
    expect(output).toContain('資料最後更新日期：2026-07-12');
    expect(output).toContain('## 已查證事實（示範）');
    expect(output).toContain('## 分析推論（示範）');
    expect(output).toContain('## 待查證事項');
    expect(output).toContain('## 示範來源');
    expect(output).toContain(DISCLAIMER);
  });

  it('沒有資料時明確顯示待查證，不自動補值', () => {
    const output = generateReport('executive', [], new Date('2026-07-15'));
    expect(output).toContain('資料最後更新日期：待查證');
    expect(output).toContain('- 待查證');
    expect(output).toContain('- 無，不自動補填。');
  });
});

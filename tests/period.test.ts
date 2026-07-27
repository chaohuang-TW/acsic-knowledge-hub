import { describe, expect, it } from 'vitest';
import { productionLevel3Values } from '../src/data/indicators';
import { sourceRegistry } from '../src/data/institutions';
import { formatDisplayPeriod, rocYearToGregorian } from '../src/utils/period';

const record = (recordId: string) =>
  productionLevel3Values.find((item) => item.recordId === recordId)!;

describe('Gregorian display periods', () => {
  it('uses calendar years for ACGF without exposing the ROC label as the primary period', () => {
    const acgf = record('acgf-cy2024-guarantee-amount');
    expect(formatDisplayPeriod(acgf.period, 'zh-TW')).toBe('2024 年');
    expect(formatDisplayPeriod(acgf.period, 'en')).toBe('CY2024');
    expect(acgf.reported.originalPeriodLabel).toBe('113 年');
    expect(acgf.reported.population).toBe('2024 年度承保保證案件');
    expect(acgf.reported.originalPopulation).toBe('113 年度承保保證案件');
  });

  it('keeps JFC as a fiscal year and formats point-in-time dates in each locale', () => {
    expect(formatDisplayPeriod(record('jfc-fy2024-insurance-acceptance').period, 'en')).toBe(
      'FY2024',
    );
    expect(formatDisplayPeriod(record('tsmeg-2025-guarantee-balance').period, 'zh-TW')).toBe(
      '截至 2025 年 12 月 31 日',
    );
    expect(formatDisplayPeriod(record('tsmeg-2025-guarantee-balance').period, 'en')).toBe(
      'As of 31 Dec 2025',
    );
  });

  it('uses Gregorian endpoints for cumulative periods', () => {
    expect(formatDisplayPeriod(record('tsmeg-2025-cumulative-contributions').period, 'zh-TW')).toBe(
      '1974–2025',
    );
  });

  it('keeps ROC original labels traceable and consistent with structured Gregorian years', () => {
    expect(rocYearToGregorian(113)).toBe(2024);
    expect(rocYearToGregorian(114)).toBe(2025);
    expect(rocYearToGregorian(63)).toBe(1974);
    productionLevel3Values.forEach((item) => {
      const original = item.reported.originalPeriodLabel;
      if (!original) return;
      const rocYears = [...original.matchAll(/(?:^|\D)(\d{2,3})\s*年/g)].map((match) =>
        Number(match[1]),
      );
      if (!rocYears.length) return;
      const structuredYears = [
        item.period.calendarYear,
        item.period.periodStart ? Number(item.period.periodStart.slice(0, 4)) : null,
        item.period.periodEnd ? Number(item.period.periodEnd.slice(0, 4)) : null,
        item.period.asOfDate ? Number(item.period.asOfDate.slice(0, 4)) : null,
      ].filter((year): year is number => year !== null);
      rocYears.forEach((year) => expect(structuredYears).toContain(rocYearToGregorian(year)));
    });
  });

  it('does not invent publication dates when the official document metadata only supports a year', () => {
    expect(
      sourceRegistry.find((source) => source.sourceId === 'acgf-annual-report-2024'),
    ).toMatchObject({
      publicationDate: null,
      documentDate: '2024',
    });
    expect(
      sourceRegistry.find((source) => source.sourceId === 'jfc-operational-performance-2025'),
    ).toMatchObject({ publicationDate: null, documentDate: '2025' });
  });
});

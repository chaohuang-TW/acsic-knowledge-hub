import { describe, expect, it } from 'vitest';
import { institutions } from '../src/data/institutions';
import { productionLevel3Values } from '../src/data/indicators';
import {
  buildInstitutionSnapshot,
  formatMetricPeriod,
  formatMetricUnit,
  formatMetricValue,
  institutionExperienceCopy,
  latestVerifiedMetrics,
} from '../src/features/institutions/institutionExperience';
import type { Level3IndicatorRecord } from '../src/types/indicators';

function institution(id: string) {
  const record = institutions.find((item) => item.id === id);
  if (!record) throw new Error(`Missing institution ${id}`);
  return record;
}

function metric(
  institutionId: string,
  indicatorId: string,
  metrics = latestVerifiedMetrics(institutionId, 'en', 5),
) {
  const result = metrics.find((item) => item.indicatorId === indicatorId);
  if (!result) throw new Error(`Missing metric ${institutionId}:${indicatorId}`);
  return result;
}

describe('institution experience view-model', () => {
  it('projects a bilingual identity and keeps ACGF identified as an observer', () => {
    const acgfEn = buildInstitutionSnapshot(institution('acgf-tw'), 'en');
    const acgfZh = buildInstitutionSnapshot(institution('acgf-tw'), 'zh-TW');

    expect(acgfEn.identity.membershipStatus).toBe('observer');
    expect(acgfEn.identity.membershipLabel).toBe(institutionExperienceCopy.en.observer);
    expect(acgfZh.identity.membershipLabel).toBe('觀察員');
    expect(acgfEn.roleSummary).toBe(institution('acgf-tw').summary.en);
    expect(acgfZh.identity.name).toBe(institution('acgf-tw').name['zh-TW']);
    expect(acgfEn.profilePath).toBe('/en/institutions/acgf-tw');
    expect(acgfZh.identity.profilePath).toBe('/zh-TW/institutions/acgf-tw');
  });

  it('selects the latest ACGF value per indicator while preserving the reported scale', () => {
    const metrics = latestVerifiedMetrics('acgf-tw', 'en', 5);
    const volume = metric('acgf-tw', 'new_guarantee_volume', metrics);
    const loanVolume = metric('acgf-tw', 'guaranteed_loan_volume', metrics);

    expect(metrics).toHaveLength(5);
    expect(volume.exactValue).toBe(18480910);
    expect(volume.formattedValue).toBe('TWD 18.481');
    expect(volume.unit).toBe('billion');
    expect(volume.originalUnit).toBe('新臺幣千元');
    expect(volume.reportedValue.value).toBe(18480910);
    expect(volume.record.normalized.value).toBe(18480.91);
    expect(volume.periodLabel).toBe('CY2025');
    expect(volume.originalPeriodLabel).toBe('114 年');
    expect(volume.sourceId).toBe('acgf-annual-report-2025');
    expect(loanVolume.exactValue).toBe(23928298);
    expect(loanVolume.formattedValue).toBe('TWD 23.928');
    expect(loanVolume.unit).toBe('billion');
    expect(loanVolume.record.source.sourceId).toBe('acgf-guarantee-performance');
    expect(loanVolume.label).toBe('Guaranteed Loan Volume');
  });

  it('uses shared indicator presentation priority without institution-specific ordering', () => {
    expect(latestVerifiedMetrics('acgf-tw', 'en', 5).map((item) => item.indicatorId)).toEqual([
      'guaranteed_loan_volume',
      'new_guarantee_volume',
      'number_of_guarantees',
      'outstanding_guarantee_balance',
      'capital_or_fund_size',
    ]);
  });

  it('limits card metrics to three and supports up to five on profiles', () => {
    const card = buildInstitutionSnapshot(institution('tsmeg-tw'), 'en');
    const profile = buildInstitutionSnapshot(institution('tsmeg-tw'), 'en', 5);

    expect(card.latestMetrics).toHaveLength(3);
    expect(profile.latestMetrics).toHaveLength(5);
    expect(profile.latestMetrics.map((item) => item.indicatorId)).toContain(
      'beneficiary_enterprises',
    );
    expect(profile.latestMetrics.map((item) => item.indicatorId)).toContain('capital_or_fund_size');
    expect(profile.latestMetrics.every((item) => item.recordId && item.record)).toBe(true);
  });

  it('keeps separate schemes and period types as separate series', () => {
    const tsmegVolume = productionLevel3Values.find(
      (item) => item.recordId === 'tsmeg-cy2025-guarantee-amount',
    );
    if (!tsmegVolume) throw new Error('Missing TSMEG volume record');
    const schemeVariant: Level3IndicatorRecord = {
      ...structuredClone(tsmegVolume),
      recordId: 'tsmeg-second-scheme-amount',
      scheme: {
        schemeSpecific: true,
        schemeId: 'second-official-scheme',
        schemeName: { en: 'Second Scheme', 'zh-TW': '第二方案' },
      },
    };
    const fiscalVariant: Level3IndicatorRecord = {
      ...structuredClone(tsmegVolume),
      recordId: 'tsmeg-fiscal-year-amount',
      period: {
        ...tsmegVolume.period,
        reportingPeriodType: 'fiscal_year',
        fiscalYear: 'FY2025',
        calendarYear: null,
      },
    };
    const metrics = latestVerifiedMetrics('tsmeg-tw', 'en', 5, [
      tsmegVolume,
      schemeVariant,
      fiscalVariant,
    ]);

    expect(metrics.filter((item) => item.indicatorId === 'new_guarantee_volume')).toHaveLength(3);
    expect(metrics.map((item) => item.recordId)).toEqual(
      expect.arrayContaining([
        'tsmeg-cy2025-guarantee-amount',
        'tsmeg-second-scheme-amount',
        'tsmeg-fiscal-year-amount',
      ]),
    );
  });

  it('uses a prior verified year when the latest value for one indicator is absent', () => {
    const without2025Cases = productionLevel3Values.filter(
      (item) => item.recordId !== 'acgf-cy2025-guarantee-cases',
    );
    const metrics = latestVerifiedMetrics('acgf-tw', 'en', 5, without2025Cases);
    const cases = metric('acgf-tw', 'number_of_guarantees', metrics);
    const volume = metric('acgf-tw', 'new_guarantee_volume', metrics);

    expect(cases.recordId).toBe('acgf-cy2024-guarantee-cases');
    expect(cases.periodLabel).toBe('CY2024');
    expect(volume.recordId).toBe('acgf-cy2025-guarantee-amount');
  });

  it('omits records with incomplete verification gates, sources, periods, or reported values', () => {
    const source = productionLevel3Values.find(
      (item) => item.recordId === 'acgf-cy2025-guarantee-cases',
    );
    if (!source) throw new Error('Missing ACGF cases record');
    const records: Level3IndicatorRecord[] = [
      {
        ...structuredClone(source),
        recordId: 'gate-failed',
        gates: { ...source.gates, sourceValidated: false },
      },
      {
        ...structuredClone(source),
        recordId: 'manual-review-pending',
        manualReviewStatus: 'pending',
      },
      {
        ...structuredClone(source),
        recordId: 'no-reported-value',
        reported: { ...source.reported, value: null },
      },
      {
        ...structuredClone(source),
        recordId: 'no-period',
        period: { ...source.period, periodEnd: null, periodStart: null, calendarYear: null },
      },
      {
        ...structuredClone(source),
        recordId: 'unknown-source',
        source: { ...source.source, sourceId: 'missing-source' },
      },
    ];

    expect(latestVerifiedMetrics('acgf-tw', 'en', 5, records)).toEqual([]);
  });

  it('shows only evidence-backed system highlights', () => {
    const tsmeg = buildInstitutionSnapshot(institution('tsmeg-tw'), 'en', 5);
    const jfc = buildInstitutionSnapshot(institution('jfc-jp'), 'en', 5);
    const kotec = buildInstitutionSnapshot(institution('kotec-kr'), 'en', 5);

    expect(tsmeg.systemHighlights.length).toBeGreaterThan(0);
    expect(tsmeg.systemHighlights.length).toBeLessThanOrEqual(3);
    expect(
      tsmeg.systemHighlights.every((item) => item.sourceIds.length > 0 && item.sources.length > 0),
    ).toBe(true);
    expect(
      jfc.systemHighlights.some((item) => item.label === 'CGC–JFC credit insurance flow'),
    ).toBe(true);
    const jfcInsuranceCoverage = jfc.systemHighlights.find(
      (item) => item.label === 'Credit insurance coverage',
    );
    expect(jfcInsuranceCoverage?.value).toContain('70%, 80% or 90% of the subrogated amount');
    expect(jfcInsuranceCoverage?.value).toContain('credit-insurance relationship');
    expect(jfcInsuranceCoverage?.value).not.toContain('Guarantee Coverage Ratio');
    expect(kotec.systemHighlights.some((item) => item.label === 'Individual approach')).toBe(true);
    const kotecAirate = kotec.systemHighlights.find(
      (item) => item.label === 'AIRATE technology appraisal',
    );
    expect(kotecAirate?.value).toContain('structured expert appraisal');
    expect(kotecAirate?.value).toContain('AI-assisted');
    expect(
      kotec.systemHighlights.some((item) => /automatic approval|auto-approv/i.test(item.value)),
    ).toBe(false);
    expect(buildInstitutionSnapshot(institution('jfg-jp'), 'en').systemHighlights).toHaveLength(1);
  });

  it('keeps supported-loan volume distinct and does not derive a guarantee-coverage ratio', () => {
    const metrics = latestVerifiedMetrics('acgf-tw', 'en', 5);

    expect(metrics.map((item) => item.indicatorId)).toContain('guaranteed_loan_volume');
    expect(metrics.map((item) => item.indicatorId)).not.toContain('guarantee_coverage_ratio');
    expect(metrics.some((item) => item.label === 'Guarantee Coverage Ratio')).toBe(false);
    expect(metric('acgf-tw', 'guaranteed_loan_volume', metrics).exactValue).toBe(23928298);
    expect(metric('acgf-tw', 'new_guarantee_volume', metrics).exactValue).toBe(18480910);
  });

  it('preserves JFC insurance acceptance as the reported amount and its scheme context', () => {
    const jfcVolume = metric('jfc-jp', 'new_guarantee_volume');

    expect(jfcVolume.exactValue).toBe(8309.6);
    expect(jfcVolume.formattedValue).toBe('8,309.6');
    expect(jfcVolume.unit).toBe('billion yen');
    expect(jfcVolume.schemeName).toBe('Small Business Credit Insurance');
    expect(jfcVolume.qualification).toMatch(/credit-insurance acceptance/i);
    expect(jfcVolume.reportedValue.label).toMatch(/insurance acceptance/i);
    expect(jfcVolume.record.normalized.value).toBe(8309600);
  });

  it('localizes labels, periods, and number formatting without changing units or amounts', () => {
    const record = productionLevel3Values.find(
      (item) => item.recordId === 'tsmeg-2025-guarantee-balance',
    );
    if (!record) throw new Error('Missing TSMEG balance record');

    expect(institutionExperienceCopy.en.systemHighlights).toBe('System highlights');
    expect(institutionExperienceCopy['zh-TW'].systemHighlights).toBe('制度重點');
    expect(formatMetricPeriod(record, 'en')).toBe('As of 31 Dec 2025');
    expect(formatMetricPeriod(record, 'zh-TW')).toBe('截至2025年12月31日');
    expect(formatMetricValue(1485949.1, 'en')).toBe('1,485,949.1');
    expect(formatMetricValue(1485949.1, 'zh-TW')).toBe('1,485,949.1');
    expect(formatMetricUnit('新臺幣百萬元', 'en')).toBe('million TWD');
    expect(formatMetricUnit('新臺幣百萬元', 'zh-TW')).toBe('新臺幣百萬元');
    expect(metric('tsmeg-tw', 'outstanding_guarantee_balance').originalUnit).toBe('新臺幣百萬元');
    const loanVolume = metric(
      'acgf-tw',
      'guaranteed_loan_volume',
      latestVerifiedMetrics('acgf-tw', 'zh-TW', 5),
    );
    expect(loanVolume.label).toBe('保證貸款金額');
    expect(loanVolume.formattedValue).toBe('約新臺幣 239.283');
    expect(loanVolume.unit).toBe('億元');
  });
});

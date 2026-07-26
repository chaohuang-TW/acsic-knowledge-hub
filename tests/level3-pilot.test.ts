import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { coverageStats } from '../src/data/coverage';
import {
  indicatorDictionary,
  indicatorDictionaryVersion,
  indicatorReadiness,
  pilotIndicatorIds,
  productionLevel3Values,
} from '../src/data/indicators';
import { institutions, sourceRegistry } from '../src/data/institutions';
import { referenceSetDefinitions } from '../src/data/reference-set';
import { researchPriorityDisclaimer } from '../src/data/research-priority';

const allowedInstitutions = ['jfc-jp', 'acgf-tw', 'tsmeg-tw'];
const productionInstitutionIds: string[] = productionLevel3Values.map((item) => item.institutionId);
const moneyIndicators = [
  'new_guarantee_volume',
  'outstanding_guarantee_balance',
  'capital_or_fund_size',
];
const normalizationStatuses = [
  'direct',
  'unit_conversion',
  'counted_from_official_list',
  'definition_mapping',
  'not_normalized',
];

describe('Level 3 production boundary', () => {
  it('contains only the three approved pilot institutions', () =>
    expect([...new Set(productionLevel3Values.map((item) => item.institutionId))].sort()).toEqual(
      allowedInstitutions.sort(),
    ));
  it('excludes KOTEC', () => expect(productionInstitutionIds).not.toContain('kotec-kr'));
  it('excludes CGC Malaysia', () => expect(productionInstitutionIds).not.toContain('cgc-my'));
  it('excludes every other institution', () =>
    productionLevel3Values.forEach((item) =>
      expect(allowedInstitutions).toContain(item.institutionId),
    ));
  it('uses only the seven approved indicators', () =>
    productionLevel3Values.forEach((item) =>
      expect(pilotIndicatorIds).toContain(item.indicatorId),
    ));
});

describe('indicator versioning', () => {
  it('stores a definition version on every production record', () =>
    productionLevel3Values.forEach((item) => expect(item.indicatorDefinitionVersion).toBeTruthy()));
  it('binds every record to the frozen dictionary version', () =>
    productionLevel3Values.forEach((item) =>
      expect(item.indicatorDefinitionVersion).toBe(indicatorDictionaryVersion),
    ));
  it('rejects unknown dictionary versions', () =>
    expect(productionLevel3Values.some((item) => item.indicatorDefinitionVersion !== '1.0')).toBe(
      false,
    ));
});

describe('reported and normalized layers', () => {
  it('preserves a reported layer on every record', () =>
    productionLevel3Values.forEach((item) => expect(item.reported).toBeTruthy()));
  it('keeps reported and normalized layers separate', () =>
    productionLevel3Values.forEach((item) => expect(item.reported).not.toBe(item.normalized)));
  it('uses a governed normalization status', () =>
    productionLevel3Values.forEach((item) =>
      expect(normalizationStatuses).toContain(item.normalized.status),
    ));
  it('preserves every official unit', () =>
    productionLevel3Values.forEach((item) => expect(item.reported.unit.trim()).not.toBe('')));
  it('preserves original currency for monetary values', () =>
    productionLevel3Values
      .filter((item) => moneyIndicators.includes(item.indicatorId))
      .forEach((item) => expect(['JPY', 'TWD']).toContain(item.reported.currency)));
  it('never creates a converted currency value', () =>
    productionLevel3Values.forEach((item) => expect(item.convertedValue).toBeNull()));
});

describe('period rules', () => {
  it('gives every flow record start and end dates', () =>
    productionLevel3Values
      .filter((item) => ['calendar_year', 'fiscal_year'].includes(item.period.reportingPeriodType))
      .forEach((item) => {
        expect(item.period.periodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(item.period.periodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }));
  it('gives every outstanding balance an as-of date', () =>
    productionLevel3Values
      .filter((item) => item.indicatorId === 'outstanding_guarantee_balance')
      .forEach((item) => expect(item.period.asOfDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)));
  it('does not relabel the JFC fiscal year as a calendar year', () =>
    productionLevel3Values
      .filter((item) => item.institutionId === 'jfc-jp')
      .forEach((item) => expect(item.period.calendarYear).toBeNull()));
  it('marks cumulative capital periods explicitly', () =>
    productionLevel3Values
      .filter((item) => item.period.reportingPeriodType === 'cumulative_since_establishment')
      .forEach((item) => {
        expect(item.period.periodStart).toBeTruthy();
        expect(item.period.asOfDate).toBeTruthy();
      }));
});

describe('official source requirements', () => {
  it('gives every verified record a source ID', () =>
    productionLevel3Values.forEach((item) => expect(item.source.sourceId).toBeTruthy()));
  it('gives every PDF record a page locator', () =>
    productionLevel3Values
      .filter((item) => item.source.pdfPageIndex !== null)
      .forEach((item) => expect(item.source.pageOrSection.toLowerCase()).toMatch(/page|p\./)));
  it('resolves every source ID in the registry', () =>
    productionLevel3Values.forEach((item) =>
      expect(sourceRegistry.some((source) => source.sourceId === item.source.sourceId)).toBe(true),
    ));
  it('uses only official primary sources', () =>
    productionLevel3Values.forEach((item) =>
      expect(
        sourceRegistry.find((source) => source.sourceId === item.source.sourceId)?.isPrimarySource,
      ).toBe(true),
    ));
  it('uses only Tier 1 or Tier 2 sources', () =>
    productionLevel3Values.forEach((item) =>
      expect(
        sourceRegistry.find((source) => source.sourceId === item.source.sourceId)?.tier,
      ).toMatch(/^tier_[12]$/),
    ));
  it('stores original language for every pilot source', () =>
    productionLevel3Values.forEach((item) =>
      expect(
        sourceRegistry.find((source) => source.sourceId === item.source.sourceId)?.originalLanguage,
      ).toBeTruthy(),
    ));
});

describe('comparability guards', () => {
  it('keeps definition mismatches out of production', () =>
    indicatorReadiness
      .filter((item) => item.verificationOutcome === 'definition_mismatch')
      .forEach((item) =>
        expect(
          productionLevel3Values.some(
            (record) =>
              record.institutionId === item.institutionId &&
              record.indicatorId === item.indicatorId,
          ),
        ).toBe(false),
      ));
  it('keeps not-disclosed values out of production', () =>
    indicatorReadiness
      .filter((item) => item.verificationOutcome === 'not_disclosed')
      .forEach((item) =>
        expect(
          productionLevel3Values.some(
            (record) =>
              record.institutionId === item.institutionId &&
              record.indicatorId === item.indicatorId,
          ),
        ).toBe(false),
      ));
  it('does not publish scheme-specific coverage as an institution value', () =>
    expect(
      productionLevel3Values.some((item) => item.indicatorId === 'guarantee_coverage_ratio'),
    ).toBe(false));
  it('does not treat unlike currencies as unqualified comparisons', () =>
    productionLevel3Values
      .filter((item) => item.reported.currency !== null)
      .forEach((item) => expect(item.comparability.status).not.toBe('comparable_with_conditions')));
  it('records period mismatch warnings', () =>
    productionLevel3Values
      .filter((item) => ['new_guarantee_volume', 'number_of_guarantees'].includes(item.indicatorId))
      .forEach((item) =>
        expect(item.comparability.issues.en.join(' ').toLowerCase()).toMatch(/fy|cy|period/),
      ));
  it('never compares a flow with a stock in one record', () =>
    productionLevel3Values.forEach((item) =>
      expect(
        item.indicatorId === 'new_guarantee_volume' &&
          item.normalized.indicatorId === 'outstanding_guarantee_balance',
      ).toBe(false),
    ));
});

describe('institution-specific research boundaries', () => {
  it('does not map a JFC direct-loan amount to guarantee volume', () =>
    productionLevel3Values
      .filter((item) => item.institutionId === 'jfc-jp')
      .forEach((item) => expect(item.reported.population).toMatch(/Credit Insurance/)));
  it('does not use the ACGF guaranteed-loan amount as guarantee amount', () =>
    expect(
      productionLevel3Values.find((item) => item.recordId === 'acgf-cy2024-guarantee-amount')
        ?.reported.value,
    ).toBe(19407404));
  it('does not average TSMEG scheme coverage rates', () =>
    expect(
      productionLevel3Values.some(
        (item) =>
          item.institutionId === 'tsmeg-tw' && item.indicatorId === 'guarantee_coverage_ratio',
      ),
    ).toBe(false));
});

describe('readiness model', () => {
  it('contains all 21 unique institution-indicator decisions', () => {
    expect(indicatorReadiness).toHaveLength(21);
    expect(
      new Set(indicatorReadiness.map((item) => `${item.institutionId}:${item.indicatorId}`)).size,
    ).toBe(21);
  });
  it('does not require 21 numeric production values', () =>
    expect(productionLevel3Values.length).toBeLessThan(indicatorReadiness.length));
  it('never turns a non-ready outcome into zero', () =>
    indicatorReadiness
      .filter((item) => !item.productionEligible)
      .forEach((item) =>
        expect(
          productionLevel3Values.some(
            (record) =>
              record.institutionId === item.institutionId &&
              record.indicatorId === item.indicatorId &&
              record.reported.value === 0,
          ),
        ).toBe(false),
      ));
  it('records one manual-review outcome without publishing it', () =>
    expect(
      indicatorReadiness.filter((item) => item.verificationOutcome === 'requires_manual_review'),
    ).toHaveLength(1));
});

describe('existing governance remains unchanged', () => {
  it('keeps 20 formal members', () => expect(coverageStats.formalMembers).toBe(20));
  it('keeps one observer', () => expect(coverageStats.observers).toBe(1));
  it('keeps ACGF as the observer', () =>
    expect(
      institutions
        .filter((item) => item.acsicMembershipStatus === 'observer')
        .map((item) => item.id),
    ).toEqual(['acgf-tw']));
  it('keeps 14 countries and economies', () => expect(coverageStats.countriesEconomies).toBe(14));
  it('keeps all 21 Level 1 profiles complete', () => expect(coverageStats.level1Complete).toBe(21));
  it('preserves strict Level 2 counts', () => {
    expect(coverageStats.level2Complete).toBe(4);
    expect(coverageStats.level2Partial).toBe(16);
    expect(coverageStats.level2Insufficient).toBe(1);
  });
  it('keeps seven reference institutions', () => expect(referenceSetDefinitions).toHaveLength(7));
  it('keeps all dictionary entries bilingual', () =>
    indicatorDictionary.forEach((item) => {
      expect(item.name.en).toBeTruthy();
      expect(item.name['zh-TW']).toBeTruthy();
    }));
  it('keeps research priority explicitly non-ranking', () => {
    expect(researchPriorityDisclaimer.en.toLowerCase()).toContain('not institutional performance');
    expect(researchPriorityDisclaimer['zh-TW']).toContain('不代表機構績效');
  });
});

describe('security and deployment invariants', () => {
  it('retains noindex metadata', () =>
    expect(readFileSync(new URL('../index.html', import.meta.url), 'utf8')).toContain(
      'noindex, nofollow, noarchive',
    ));
  it('retains robots disallow', () =>
    expect(readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8')).toContain(
      'Disallow: /',
    ));
  it('retains the independent disclaimer in both languages', () => {
    const i18n = readFileSync(new URL('../src/i18n.tsx', import.meta.url), 'utf8');
    expect(i18n).toContain('not an official website of ACSIC');
    expect(i18n).toContain('不是 ACSIC');
  });
  it('keeps the Pages base path unchanged', () =>
    expect(readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')).toContain(
      "base: '/acsic-knowledge-hub/'",
    ));
  it('does not create a CNAME', () =>
    expect(existsSync(new URL('../public/CNAME', import.meta.url))).toBe(false));
  it('keeps every production gate closed to pending manual review', () =>
    productionLevel3Values.forEach((item) => {
      expect(item.gates.manualReviewRequired).toBe(false);
      expect(item.manualReviewStatus).not.toBe('pending');
    }));
  it('contains no performance-ranking field', () =>
    productionLevel3Values.forEach((item) =>
      expect(JSON.stringify(item).toLowerCase()).not.toContain('score'),
    ));
  it('keeps every pilot source publicly addressable over HTTPS', () =>
    productionLevel3Values.forEach((item) =>
      expect(
        sourceRegistry.find((source) => source.sourceId === item.source.sourceId)?.url,
      ).toMatch(/^https:\/\//),
    ));
});

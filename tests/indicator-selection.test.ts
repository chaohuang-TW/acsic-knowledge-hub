import { describe, expect, it } from 'vitest';
import { productionLevel3Values } from '../src/data/indicators';
import { latestCompleteCalendarYear } from '../src/utils/indicatorSelection';

const acgfRecords = productionLevel3Values.filter((record) => record.institutionId === 'acgf-tw');
const acgfIndicatorIds = [
  'guaranteed_loan_volume',
  'new_guarantee_volume',
  'number_of_guarantees',
  'outstanding_guarantee_balance',
  'capital_or_fund_size',
] as const;

describe('latest complete calendar year selection', () => {
  it('selects the latest year containing every requested, verified indicator', () => {
    expect(latestCompleteCalendarYear(productionLevel3Values, 'acgf-tw', acgfIndicatorIds)).toBe(
      2025,
    );
  });

  it('falls back to the prior year when a latest-year indicator is missing', () => {
    const withoutLatestNewGuaranteeVolume = acgfRecords.filter(
      (record) =>
        record.period.calendarYear !== 2025 || record.indicatorId !== 'new_guarantee_volume',
    );

    expect(
      latestCompleteCalendarYear(withoutLatestNewGuaranteeVolume, 'acgf-tw', acgfIndicatorIds),
    ).toBe(2024);
  });

  it('does not treat a present but unverified latest-year indicator as complete', () => {
    const withUnverifiedLatestIndicator = acgfRecords.map((record) =>
      record.period.calendarYear === 2025 && record.indicatorId === 'new_guarantee_volume'
        ? {
            ...record,
            gates: { ...record.gates, sourceValidated: false },
          }
        : record,
    );

    expect(
      latestCompleteCalendarYear(withUnverifiedLatestIndicator, 'acgf-tw', acgfIndicatorIds),
    ).toBe(2024);
  });

  it('returns null when no year contains all requested indicators', () => {
    expect(
      latestCompleteCalendarYear(acgfRecords, 'acgf-tw', [
        ...acgfIndicatorIds,
        'beneficiary_enterprises',
      ]),
    ).toBeNull();
    expect(latestCompleteCalendarYear(acgfRecords, 'acgf-tw', [])).toBeNull();
  });
});

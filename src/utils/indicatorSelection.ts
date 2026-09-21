import type { Level3IndicatorRecord } from '../types/indicators';

const isVerifiedValue = (record: Level3IndicatorRecord) =>
  (record.verificationStatus === 'verified' ||
    record.verificationStatus === 'verified_with_limitation') &&
  record.reported.value !== null &&
  record.gates.researchVerified &&
  record.gates.schemaValidated &&
  record.gates.sourceValidated &&
  record.gates.comparabilityReviewed &&
  (!record.gates.manualReviewRequired || record.manualReviewStatus === 'completed') &&
  record.manualReviewStatus !== 'pending';

export function latestCompleteCalendarYear(
  records: readonly Level3IndicatorRecord[],
  institutionId: string,
  indicatorIds: readonly string[],
): number | null {
  if (indicatorIds.length === 0) return null;

  const institutionRecords = records.filter(
    (record) => record.institutionId === institutionId && isVerifiedValue(record),
  );
  const candidateYears = [
    ...new Set(institutionRecords.map((record) => record.period.calendarYear)),
  ]
    .filter((year): year is number => year !== null && Number.isInteger(year))
    .sort((left, right) => right - left);

  return (
    candidateYears.find((year) =>
      indicatorIds.every((indicatorId) =>
        institutionRecords.some(
          (record) => record.period.calendarYear === year && record.indicatorId === indicatorId,
        ),
      ),
    ) ?? null
  );
}

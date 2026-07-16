import { institutions, sourceRegistry } from './institutions';
import type { LocalizedText, SourceType } from '../types';

function hasBoth(value: LocalizedText | null): boolean {
  return Boolean(value?.en.trim() && value['zh-TW'].trim());
}

const bilingualValues = institutions
  .flatMap((record) => [
    record.mandate,
    record.legalBasis,
    record.ownershipOrLegalStatus,
    record.supervisingOrOversightAuthority,
    record.governanceType,
    record.fundingOrCapitalBasis,
    record.geographicScope,
    record.acsicRoleNotes,
    record.nextResearchPriority,
    record.confidenceRationale,
    ...record.serviceTargets,
    ...record.majorFunctions,
    ...record.officialPublications,
    ...record.pendingItems,
    ...record.notApplicableFields.map((item) => item.reason),
    ...Object.values(record.typeSpecificProfile).flatMap((value) =>
      Array.isArray(value) ? value : value ? [value] : [],
    ),
    ...record.verifiedFacts.map((claim) => claim.statement),
  ])
  .filter((value): value is LocalizedText => value !== null);

const sourceTypes = sourceRegistry.reduce<Partial<Record<SourceType, number>>>((counts, source) => {
  counts[source.sourceType] = (counts[source.sourceType] ?? 0) + 1;
  return counts;
}, {});

export const coverageStats = {
  formalMembers: institutions.filter((record) => record.acsicMembershipStatus === 'member').length,
  observers: institutions.filter((record) => record.acsicMembershipStatus === 'observer').length,
  countriesEconomies: new Set(
    institutions
      .filter((record) => record.acsicMembershipStatus === 'member')
      .map((record) => record.countryCode),
  ).size,
  institutions: institutions.length,
  level1Complete: institutions.filter((record) => record.level1Completion === 100).length,
  level2Complete: institutions.filter((record) => record.level2Status === 'complete').length,
  level2Partial: institutions.filter((record) => record.level2Status === 'partial').length,
  level2Insufficient: institutions.filter((record) => record.level2Status === 'insufficient')
    .length,
  level2NotAssessed: institutions.filter((record) => record.level2Status === 'not_assessed').length,
  level3Reliable: institutions.filter((record) => record.level3Metrics.length > 0).length,
  sourceReferences: institutions.reduce((count, record) => count + record.sourceIds.length, 0),
  uniqueOfficialSources: sourceRegistry.length,
  sourceTypes,
  fieldEvidenceCount: institutions.reduce(
    (count, record) =>
      count +
      Object.values(record.fieldEvidence).reduce((sum, evidence) => sum + evidence.length, 0),
    0,
  ),
  bilingualFieldCount: bilingualValues.filter(hasBoth).length,
  bilingualFieldTotal: bilingualValues.length,
  bilingualCoveragePercent: bilingualValues.length
    ? Math.round((bilingualValues.filter(hasBoth).length / bilingualValues.length) * 100)
    : 100,
  nativeNamesOfficial: institutions.filter((record) => record.name.nativeName.status === 'official')
    .length,
  nativeNamesPending: institutions.filter((record) => record.name.nativeName.status === 'pending')
    .length,
  officialChineseNames: institutions.filter(
    (record) => record.name.zhTWTranslationStatus === 'official',
  ).length,
  researchTranslationChineseNames: institutions.filter(
    (record) => record.name.zhTWTranslationStatus === 'research_translation',
  ).length,
  confidenceHigh: institutions.filter((record) => record.confidenceLevel === 'high').length,
  confidenceMedium: institutions.filter((record) => record.confidenceLevel === 'medium').length,
  confidenceLow: institutions.filter((record) => record.confidenceLevel === 'low').length,
  staleSources: sourceRegistry.filter((source) => source.stalenessWarning).length,
  unavailableSources: sourceRegistry.filter(
    (source) => source.accessStatus === 'temporarily_unavailable',
  ).length,
  lastVerifiedDate: institutions
    .map((record) => record.lastVerifiedDate)
    .sort()
    .at(-1)!,
};

export const membershipStats = {
  formalMembers: coverageStats.formalMembers,
  observers: coverageStats.observers,
  countriesEconomies: coverageStats.countriesEconomies,
  institutionsCovered: coverageStats.institutions,
  level1Complete: coverageStats.level1Complete,
  level2Complete: coverageStats.level2Complete,
  level2Partial: coverageStats.level2Partial,
  level2Insufficient: coverageStats.level2Insufficient,
  level3Reliable: coverageStats.level3Reliable,
  sourceReferences: coverageStats.sourceReferences,
  uniqueOfficialSources: coverageStats.uniqueOfficialSources,
  lastMembershipVerificationDate: coverageStats.lastVerifiedDate,
};

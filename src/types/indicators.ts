import type { LocalizedText } from './index';

export type IndicatorCategory =
  | 'institutional_scale'
  | 'guarantee_activity'
  | 'guarantee_terms'
  | 'portfolio_risk'
  | 'financial_capacity'
  | 'reach_and_inclusion'
  | 'delivery_network'
  | 'special_policy_programmes'
  | 'operational_efficiency'
  | 'recovery_and_claims';

export type ComparabilityLevel = 'high' | 'medium' | 'low' | 'institution_specific';

export interface IndicatorDefinition {
  indicatorId: string;
  category: IndicatorCategory;
  name: LocalizedText;
  definition: LocalizedText;
  requiredMetadata: string[];
  numeratorDefinition: LocalizedText | null;
  denominatorDefinition: LocalizedText | null;
  comparabilityLevel: ComparabilityLevel;
  commonMisinterpretations: Record<'en' | 'zh-TW', string[]>;
  allowedAggregation: string[];
  notComparableWith: string[];
  notes: LocalizedText;
  valueType: 'monetary' | 'count' | 'ratio' | 'descriptive';
  timeBasis: 'flow' | 'stock' | 'cumulative' | 'point_in_time' | 'institution_specific';
}

export type PilotIndicatorId =
  | 'new_guarantee_volume'
  | 'outstanding_guarantee_balance'
  | 'number_of_guarantees'
  | 'beneficiary_enterprises'
  | 'guarantee_coverage_ratio'
  | 'partner_financial_institutions'
  | 'capital_or_fund_size';

export type IndicatorReadinessStatus =
  | 'ready'
  | 'partially_ready'
  | 'not_ready'
  | 'not_applicable'
  | 'definition_mismatch'
  | 'scheme_specific'
  | 'source_unavailable'
  | 'requires_manual_review';

export type ProductionVerificationStatus =
  | 'verified'
  | 'verified_with_limitation'
  | 'scheme_specific'
  | 'definition_mismatch'
  | 'not_disclosed'
  | 'not_applicable'
  | 'source_unavailable'
  | 'requires_manual_review';

export type NormalizationStatus =
  | 'direct'
  | 'unit_conversion'
  | 'counted_from_official_list'
  | 'definition_mapping'
  | 'not_normalized';

export interface IndicatorReadinessRecord {
  institutionId: 'jfc-jp' | 'acgf-tw' | 'tsmeg-tw';
  indicatorId: PilotIndicatorId;
  status: IndicatorReadinessStatus;
  verificationOutcome: ProductionVerificationStatus;
  officialSourceAvailable: boolean;
  definitionCompatible: boolean;
  periodAvailable: boolean;
  productionEligible: boolean;
  reason: LocalizedText;
  sourceIds: string[];
  reviewedDate: string;
}

export interface Level3IndicatorRecord {
  recordId: string;
  institutionId: 'jfc-jp' | 'acgf-tw' | 'tsmeg-tw';
  indicatorId: PilotIndicatorId;
  indicatorDefinitionVersion: '1.0';
  reported: {
    label: string;
    value: number | null;
    unit: string;
    currency: 'JPY' | 'TWD' | null;
    periodLabel: string;
    population: string;
    definition: LocalizedText;
  };
  normalized: {
    indicatorId: PilotIndicatorId;
    value: number | null;
    unit: string;
    currency: 'JPY' | 'TWD' | null;
    method: string;
    status: NormalizationStatus;
    notes: LocalizedText;
  };
  period: {
    reportingPeriodType:
      'calendar_year' | 'fiscal_year' | 'point_in_time' | 'cumulative_since_establishment';
    fiscalYear: string | null;
    calendarYear: number | null;
    periodStart: string | null;
    periodEnd: string | null;
    asOfDate: string | null;
  };
  scheme: {
    schemeSpecific: boolean;
    schemeId: string | null;
    schemeName: Record<'en' | 'zh-TW', string | null>;
  };
  source: {
    sourceId: string;
    pageOrSection: string;
    tableOrFigure: string | null;
    pdfPageIndex: number | null;
    publicationDate: string | null;
    verifiedDate: string;
  };
  comparability: {
    status: 'comparable_with_conditions' | 'reference_only' | 'not_comparable';
    level: ComparabilityLevel;
    issues: Record<'en' | 'zh-TW', string[]>;
  };
  verificationStatus: 'verified' | 'verified_with_limitation';
  manualReviewStatus: 'completed' | 'not_required' | 'pending';
  gates: {
    researchVerified: boolean;
    schemaValidated: boolean;
    sourceValidated: boolean;
    comparabilityReviewed: boolean;
    manualReviewRequired: boolean;
  };
  derivation: {
    isDerived: boolean;
    derivationMethod: string | null;
    inputSourceIds: string[];
    calculation: string | null;
    calculatedDate: string | null;
  };
  convertedValue: number | null;
  capitalConcept: string | null;
  institutionTypes: string[];
  notes: LocalizedText;
}

export interface Level3PilotReadiness {
  institutionId: string;
  annualReportAvailable: boolean;
  financialStatementsAvailable: boolean;
  guaranteeVolumeAvailable: boolean;
  outstandingBalanceAvailable: boolean;
  coverageTermsAvailable: boolean;
  feeInformationAvailable: boolean;
  claimDataAvailable: boolean;
  recoveryDataAvailable: boolean;
  beneficiaryDataAvailable: boolean;
  sourceLanguage: string[];
  historicalSeriesAvailable: boolean;
  comparabilityRisk: 'high' | 'medium' | 'low';
  pilotReadiness: 'ready' | 'partially_ready' | 'not_ready';
  rationale: LocalizedText;
  reviewedDate: string;
}

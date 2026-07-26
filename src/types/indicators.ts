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

export interface Level3IndicatorRecord {
  institutionId: string;
  indicatorId: string;
  value: number | null;
  unit: string | null;
  currency: string | null;
  reportedCurrency: string | null;
  convertedValue: number | null;
  exchangeRate: number | null;
  exchangeRateDate: string | null;
  conversionSourceId: string | null;
  reportingPeriodType:
    | 'calendar_year'
    | 'fiscal_year'
    | 'year_to_date'
    | 'point_in_time'
    | 'cumulative_since_establishment'
    | null;
  fiscalYear: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  asOfDate: string | null;
  publicationDate: string | null;
  sourceVerifiedDate: string | null;
  definitionUsed: LocalizedText | null;
  sourceId: string | null;
  pageOrSection: string | null;
  verificationStatus: 'not_collected' | 'pilot' | 'verified';
  comparabilityAssessment: LocalizedText | null;
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

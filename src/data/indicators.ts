import rawDictionary from './indicator-dictionary.json';
import rawIndicatorReadiness from './indicator-readiness.json';
import rawLevel3Pilot from './level3-pilot.json';
import type {
  IndicatorCategory,
  IndicatorDefinition,
  IndicatorReadinessRecord,
  Level3IndicatorRecord,
  Level3PilotReadiness,
  PilotIndicatorId,
} from '../types/indicators';

export const indicatorDictionaryVersion = rawDictionary.version;
export const indicatorDictionaryTitle = `${rawDictionary.title} v${rawDictionary.version}`;
export const indicatorDictionary = rawDictionary.indicators as IndicatorDefinition[];

export const indicatorById = new Map(
  indicatorDictionary.map((indicator) => [indicator.indicatorId, indicator]),
);

export const pilotIndicatorIds: PilotIndicatorId[] = [
  'new_guarantee_volume',
  'outstanding_guarantee_balance',
  'number_of_guarantees',
  'beneficiary_enterprises',
  'guarantee_coverage_ratio',
  'partner_financial_institutions',
  'capital_or_fund_size',
];

export const indicatorCategoryLabels: Record<IndicatorCategory, { en: string; 'zh-TW': string }> = {
  institutional_scale: { en: 'Institutional Scale', 'zh-TW': '機構規模' },
  guarantee_activity: { en: 'Guarantee Activity', 'zh-TW': '保證業務' },
  guarantee_terms: { en: 'Guarantee Terms', 'zh-TW': '保證條件' },
  portfolio_risk: { en: 'Portfolio Risk', 'zh-TW': '風險表現' },
  financial_capacity: { en: 'Financial Capacity', 'zh-TW': '財務能力' },
  reach_and_inclusion: { en: 'Reach and Inclusion', 'zh-TW': '金融可及性' },
  delivery_network: { en: 'Delivery Network', 'zh-TW': '金融機構合作網絡' },
  special_policy_programmes: { en: 'Special Policy Programmes', 'zh-TW': '政策專案' },
  operational_efficiency: { en: 'Operational Efficiency', 'zh-TW': '營運效率' },
  recovery_and_claims: { en: 'Recovery and Claims', 'zh-TW': '代償與追償' },
};

export const productionLevel3Values = rawLevel3Pilot as unknown as Level3IndicatorRecord[];
export const indicatorReadiness = rawIndicatorReadiness as unknown as IndicatorReadinessRecord[];

export const level3PilotReadiness: Level3PilotReadiness[] = [
  {
    institutionId: 'jfc-jp',
    annualReportAvailable: true,
    financialStatementsAvailable: true,
    guaranteeVolumeAvailable: true,
    outstandingBalanceAvailable: true,
    coverageTermsAvailable: true,
    feeInformationAvailable: true,
    claimDataAvailable: true,
    recoveryDataAvailable: true,
    beneficiaryDataAvailable: true,
    sourceLanguage: ['ja', 'en'],
    historicalSeriesAvailable: true,
    comparabilityRisk: 'medium',
    pilotReadiness: 'ready',
    rationale: {
      en: 'Official reports and publications expose multiple defined time series, but SME credit insurance must remain separate from direct lending.',
      'zh-TW': '官方報告與出版品提供多項具定義時間序列，但中小企業信用保險仍須與直接融資分開。',
    },
    reviewedDate: '2026-07-26',
  },
  {
    institutionId: 'acgf-tw',
    annualReportAvailable: true,
    financialStatementsAvailable: true,
    guaranteeVolumeAvailable: true,
    outstandingBalanceAvailable: true,
    coverageTermsAvailable: true,
    feeInformationAvailable: true,
    claimDataAvailable: true,
    recoveryDataAvailable: true,
    beneficiaryDataAvailable: true,
    sourceLanguage: ['zh-Hant'],
    historicalSeriesAvailable: true,
    comparabilityRisk: 'medium',
    pilotReadiness: 'ready',
    rationale: {
      en: 'Public annual reports, budgets and scheme materials are available; Taiwan-specific fiscal-year and agriculture-policy definitions require mapping.',
      'zh-TW': '公開年報、預算與制度文件可取得，但須映射臺灣年度及農業政策特有定義。',
    },
    reviewedDate: '2026-07-26',
  },
  {
    institutionId: 'tsmeg-tw',
    annualReportAvailable: true,
    financialStatementsAvailable: true,
    guaranteeVolumeAvailable: true,
    outstandingBalanceAvailable: true,
    coverageTermsAvailable: true,
    feeInformationAvailable: true,
    claimDataAvailable: true,
    recoveryDataAvailable: true,
    beneficiaryDataAvailable: true,
    sourceLanguage: ['zh-Hant', 'en'],
    historicalSeriesAvailable: true,
    comparabilityRisk: 'medium',
    pilotReadiness: 'ready',
    rationale: {
      en: 'Strong public disclosure supports a pilot once indicator definitions and fiscal-year mappings are fixed.',
      'zh-TW': '公開揭露完整，在指標定義及年度映射確定後適合試辦。',
    },
    reviewedDate: '2026-07-26',
  },
  {
    institutionId: 'kotec-kr',
    annualReportAvailable: true,
    financialStatementsAvailable: true,
    guaranteeVolumeAvailable: true,
    outstandingBalanceAvailable: true,
    coverageTermsAvailable: true,
    feeInformationAvailable: true,
    claimDataAvailable: true,
    recoveryDataAvailable: false,
    beneficiaryDataAvailable: true,
    sourceLanguage: ['ko', 'en'],
    historicalSeriesAvailable: true,
    comparabilityRisk: 'medium',
    pilotReadiness: 'partially_ready',
    rationale: {
      en: 'Official annual reports and business pages are strong, but recovery definitions and technology-appraisal boundaries need confirmation.',
      'zh-TW': '官方年報與業務頁完整，但追償定義及技術評價業務邊界仍待確認。',
    },
    reviewedDate: '2026-07-26',
  },
  {
    institutionId: 'cgc-my',
    annualReportAvailable: true,
    financialStatementsAvailable: true,
    guaranteeVolumeAvailable: true,
    outstandingBalanceAvailable: true,
    coverageTermsAvailable: true,
    feeInformationAvailable: true,
    claimDataAvailable: false,
    recoveryDataAvailable: false,
    beneficiaryDataAvailable: true,
    sourceLanguage: ['en', 'ms'],
    historicalSeriesAvailable: true,
    comparabilityRisk: 'medium',
    pilotReadiness: 'partially_ready',
    rationale: {
      en: 'Public reporting supports scale and reach indicators, while claim and recovery definitions need further official evidence.',
      'zh-TW': '公開報告可支持規模與可及性指標，但代償及追償定義仍需更多官方證據。',
    },
    reviewedDate: '2026-07-26',
  },
];

export const forbiddenIndicatorComparisons = [
  ['cumulative_guarantee_volume', 'new_guarantee_volume'],
  ['outstanding_guarantee_balance', 'new_guarantee_volume'],
  ['claim_rate', 'default_npl_indicator'],
  ['number_of_guarantees', 'beneficiary_enterprises'],
  ['guarantee_coverage_ratio', 'guarantee_ceiling'],
] as const;

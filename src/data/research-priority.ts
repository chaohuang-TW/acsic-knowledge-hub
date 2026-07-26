import type { LocalizedText } from '../types';

export type PriorityBand = 'high' | 'medium' | 'low' | 'deferred';

export interface ResearchPriority {
  institutionId: string;
  strategicRelevance: number;
  comparabilityPotential: number;
  sourceAvailability: number;
  researchGapValue: number;
  score: number;
  priorityBand: PriorityBand;
  researchStatus: 'active' | 'deferred_due_to_source_limitations';
  rationale: LocalizedText;
  lastReviewedDate: string;
}

type PriorityInput = readonly [number, number, number, number, string, string, boolean?];

const inputs: Record<string, PriorityInput> = {
  'cgcc-kh': [
    4,
    4,
    3,
    4,
    'Useful emerging-market guarantee corporation comparison.',
    '適合新興市場信用保證公司比較。',
  ],
  'cgtmse-in': [
    4,
    4,
    3,
    4,
    'Important micro and small enterprise guarantee-fund case.',
    '具微型與小型企業保證基金研究價值。',
  ],
  'asippindo-id': [
    3,
    3,
    3,
    3,
    'Association-level coordination case with moderate source depth.',
    '具協會協調功能研究價值，來源深度中等。',
  ],
  'askrindo-id': [
    4,
    4,
    1,
    5,
    'High potential value, deferred until the critical official profile is accessible.',
    '研究價值高，但關鍵官方簡介恢復存取前暫緩。',
    true,
  ],
  'jfc-jp': [
    5,
    5,
    5,
    1,
    'Complete baseline; maintenance is more valuable than immediate further collection.',
    '已是完整基準，現階段以維護證據優先。',
  ],
  'jfg-jp': [
    4,
    4,
    5,
    4,
    'Federation model has strong official publications and comparison value.',
    '聯合會制度具完整官方出版品與比較價值。',
  ],
  'kodit-kr': [
    5,
    5,
    4,
    4,
    'Core national guarantee-fund comparator with strong official-source potential.',
    '國家級信用保證基金的重要比較案例，官方來源潛力高。',
  ],
  'koreg-kr': [
    4,
    4,
    2,
    4,
    'Regional federation model is valuable but current English evidence is limited.',
    '地方聯合會制度具價值，但現有英文證據有限。',
  ],
  'kotec-kr': [
    5,
    5,
    5,
    4,
    'Distinct technology appraisal and guarantee model with strong official sources.',
    '技術評價與保證模式獨特，且官方來源充足。',
  ],
  'ojscgf-kg': [
    3,
    3,
    3,
    4,
    'Emerging guarantee-company case with several governance gaps.',
    '新興信用保證公司案例，仍有多項治理缺口。',
  ],
  'cgc-my': [
    5,
    5,
    4,
    5,
    'Strong candidate for institutional and future Level 3 comparison.',
    '適合機構制度及未來 Level 3 比較。',
  ],
  'cgfm-mn': [
    4,
    4,
    2,
    5,
    'High research-gap value, constrained by limited official source depth.',
    '研究缺口價值高，但受限於官方來源深度。',
  ],
  'dcgf-np': [
    5,
    4,
    5,
    4,
    'Dual deposit and credit mandate offers high comparative value.',
    '存款與信用保證雙重任務具高度比較價值。',
  ],
  'smec-pg': [
    4,
    3,
    4,
    4,
    'Clarifies the boundary between SME development and guarantee institutions.',
    '有助釐清中小企業發展機構與信用保證機構界線。',
  ],
  'cgcpng-pg': [
    3,
    3,
    2,
    4,
    'Guarantee-company case remains source constrained.',
    '信用保證公司案例仍受來源限制。',
  ],
  'philguarantee-ph': [
    5,
    5,
    4,
    4,
    'National guarantee corporation with broad policy-programme relevance.',
    '國家級保證公司，具廣泛政策方案研究價值。',
  ],
  'cbsl-lk': [
    4,
    3,
    4,
    4,
    'Central-bank scheme role needs careful unit and mandate separation.',
    '中央銀行方案角色需精確區分承辦單位與法定任務。',
  ],
  'slecic-lk': [
    5,
    4,
    5,
    4,
    'Distinct export credit insurance and guarantee model with official reports.',
    '出口信用保險與保證模式獨特，且有官方報告。',
  ],
  'tsmeg-tw': [
    5,
    5,
    5,
    5,
    'High-value guarantee-fund comparator and Level 3 pilot candidate.',
    '高價值信用保證基金比較案例及 Level 3 試辦候選。',
  ],
  'tcg-th': [
    5,
    5,
    4,
    4,
    'National guarantee corporation with strong comparability potential.',
    '國家級信用保證公司，具高度可比性潛力。',
  ],
  'acgf-tw': [
    5,
    4,
    5,
    5,
    'Agricultural finance, cooperative delivery and policy relevance justify immediate research.',
    '農業金融、合作金融通路與政策價值支持優先研究。',
  ],
};

function priorityBand(score: number, deferred: boolean): PriorityBand {
  if (deferred) return 'deferred';
  if (score >= 16) return 'high';
  if (score >= 11) return 'medium';
  return 'low';
}

export const researchPriorities: ResearchPriority[] = Object.entries(inputs).map(
  ([
    institutionId,
    [
      strategicRelevance,
      comparabilityPotential,
      sourceAvailability,
      researchGapValue,
      en,
      zh,
      deferred = false,
    ],
  ]) => {
    const score =
      strategicRelevance + comparabilityPotential + sourceAvailability + researchGapValue;
    return {
      institutionId,
      strategicRelevance,
      comparabilityPotential,
      sourceAvailability,
      researchGapValue,
      score,
      priorityBand: priorityBand(score, deferred),
      researchStatus: deferred ? 'deferred_due_to_source_limitations' : 'active',
      rationale: { en, 'zh-TW': zh },
      lastReviewedDate: '2026-07-26',
    };
  },
);

export const researchPriorityByInstitutionId = new Map(
  researchPriorities.map((priority) => [priority.institutionId, priority]),
);

export const researchPriorityDisclaimer: LocalizedText = {
  en: 'The score prioritises research effort, not institutional performance.',
  'zh-TW': '本分數僅用於安排研究工作優先順序，不代表機構績效或制度優劣。',
};

export const fieldResearchPriority = {
  tierA: [
    'legalBasis',
    'supervisingOrOversightAuthority',
    'fundingOrCapitalBasis',
    'guaranteeDeliveryModel',
    'targetBorrowers',
    'fundingSources',
    'riskSharingOverview',
    'memberComposition',
    'responsibleUnit',
    'creditGuaranteeSchemeRole',
  ],
  tierB: [
    'governanceType',
    'participatingFinancialInstitutions',
    'officialPublications',
    'sharedServices',
    'businessUnits',
  ],
  tierC: ['geographicScope'],
} as const;

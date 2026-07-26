import type { LocalizedText } from '../types';

export interface ReferenceSetDefinition {
  institutionId: string;
  role: LocalizedText;
  rationale: LocalizedText;
  verifiedDate: string;
}

export const referenceSetDefinitions: ReferenceSetDefinition[] = [
  {
    institutionId: 'jfc-jp',
    role: { en: 'Policy finance baseline', 'zh-TW': '政策金融基準案例' },
    rationale: {
      en: 'Provides the strict Level 2 baseline for policy finance, SME credit insurance and agriculture-related finance.',
      'zh-TW': '作為政策金融、中小企業信用保險及農業相關金融的嚴格 Level 2 基準案例。',
    },
    verifiedDate: '2026-07-26',
  },
  {
    institutionId: 'acgf-tw',
    role: { en: 'Agricultural credit guarantee', 'zh-TW': '農業信用保證' },
    rationale: {
      en: 'Represents an agriculture-specific guarantee fund linked to agricultural policy and cooperative finance.',
      'zh-TW': '代表連結農業政策與合作金融體系的農業專屬信用保證基金。',
    },
    verifiedDate: '2026-07-26',
  },
  {
    institutionId: 'kotec-kr',
    role: { en: 'Technology finance guarantee', 'zh-TW': '科技金融保證' },
    rationale: {
      en: 'Represents technology appraisal, technology guarantees, guarantee-linked investment and technology transfer.',
      'zh-TW': '代表技術評價、科技保證、保證連結投資及技術移轉制度。',
    },
    verifiedDate: '2026-07-26',
  },
  {
    institutionId: 'dcgf-np',
    role: { en: 'Deposit and credit dual mandate', 'zh-TW': '存款與信用保證雙重任務' },
    rationale: {
      en: 'Provides a dual-mandate case in which deposit protection and credit guarantee functions must remain analytically separate.',
      'zh-TW': '提供存款保障與信用保證功能必須分開分析的雙重任務案例。',
    },
    verifiedDate: '2026-07-26',
  },
  {
    institutionId: 'jfg-jp',
    role: { en: 'Guarantee federation', 'zh-TW': '信用保證聯合會' },
    rationale: {
      en: 'Represents federation, coordination and support functions rather than direct guarantee delivery.',
      'zh-TW': '代表聯合、協調與支援功能，而非直接辦理信用保證。',
    },
    verifiedDate: '2026-07-26',
  },
  {
    institutionId: 'slecic-lk',
    role: { en: 'Export credit insurance and guarantee', 'zh-TW': '出口信用保險與保證' },
    rationale: {
      en: 'Represents export credit insurance, bank guarantees and exporter risk support.',
      'zh-TW': '代表出口信用保險、銀行保證及出口商風險支援制度。',
    },
    verifiedDate: '2026-07-26',
  },
  {
    institutionId: 'smec-pg',
    role: { en: 'SME development agency', 'zh-TW': '中小企業發展機構' },
    rationale: {
      en: 'Represents enterprise development, formalisation and financial-access support without assuming direct guarantee activity.',
      'zh-TW': '代表企業發展、正式化與融資可及性支援，不假設其直接辦理信用保證。',
    },
    verifiedDate: '2026-07-26',
  },
];

export const referenceSetByInstitutionId = new Map(
  referenceSetDefinitions.map((definition) => [definition.institutionId, definition]),
);

export const referenceSetDisclaimer: LocalizedText = {
  en: 'Reference status indicates research coverage and institutional diversity. It is not a ranking of institutional performance.',
  'zh-TW': '標竿研究機構係依制度代表性與研究涵蓋需要選定，不代表機構績效排名或制度優劣。',
};

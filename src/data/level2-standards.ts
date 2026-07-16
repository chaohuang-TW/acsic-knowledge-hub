import type { InstitutionRoleCategory, LocalizedText } from '../types';
import standard from './level2-standard.json';

export const LEVEL2_STANDARD_VERSION = standard.version;

export const commonLevel2Fields = standard.common;

export const roleSpecificLevel2Fields = standard.roles as Record<InstitutionRoleCategory, string[]>;

export const level2FieldLabels: Record<string, LocalizedText> = {
  establishedYear: { en: 'Established year', 'zh-TW': '設立年份' },
  legalBasis: { en: 'Legal basis', 'zh-TW': '法源依據' },
  ownershipOrLegalStatus: { en: 'Ownership or legal status', 'zh-TW': '所有權或法律地位' },
  supervisingOrOversightAuthority: {
    en: 'Supervising or oversight relationship',
    'zh-TW': '主管、監督或治理關係',
  },
  mandate: { en: 'Mandate', 'zh-TW': '機構任務' },
  serviceTargets: { en: 'Service targets', 'zh-TW': '服務對象' },
  majorFunctions: { en: 'Major functions', 'zh-TW': '主要功能' },
  governanceType: { en: 'Governance type', 'zh-TW': '治理型態' },
  fundingOrCapitalBasis: { en: 'Funding or capital basis', 'zh-TW': '資金或資本基礎' },
  geographicScope: { en: 'Geographic scope', 'zh-TW': '地理範圍' },
  officialPublications: { en: 'Official publications', 'zh-TW': '官方出版品' },
  acsicRoleNotes: { en: 'ACSIC role notes', 'zh-TW': 'ACSIC 身分說明' },
  guaranteeDeliveryModel: { en: 'Guarantee delivery model', 'zh-TW': '保證辦理模式' },
  participatingFinancialInstitutions: {
    en: 'Participating financial institutions',
    'zh-TW': '合作金融機構',
  },
  targetBorrowers: { en: 'Target borrowers', 'zh-TW': '目標借款人' },
  mainGuaranteeCategories: { en: 'Main guarantee categories', 'zh-TW': '主要保證類別' },
  fundingSources: { en: 'Funding sources', 'zh-TW': '資金來源' },
  riskSharingOverview: { en: 'Risk-sharing overview', 'zh-TW': '風險分擔概況' },
  memberComposition: { en: 'Member composition', 'zh-TW': '會員組成' },
  coordinationRole: { en: 'Coordination role', 'zh-TW': '協調角色' },
  sharedServices: { en: 'Shared services', 'zh-TW': '共同服務' },
  policyRepresentation: { en: 'Policy representation', 'zh-TW': '政策代表角色' },
  trainingOrCapacityBuildingRole: {
    en: 'Training and capacity-building role',
    'zh-TW': '培訓與能力建構角色',
  },
  policyFinanceRole: { en: 'Policy-finance role', 'zh-TW': '政策金融角色' },
  creditInsuranceOrGuaranteeRole: {
    en: 'Credit-insurance or guarantee role',
    'zh-TW': '信用保險或保證角色',
  },
  businessUnits: { en: 'Business units', 'zh-TW': '業務單位' },
  relationshipWithPrivateFinancialInstitutions: {
    en: 'Relationship with private financial institutions',
    'zh-TW': '與民營金融機構的關係',
  },
  technologyAppraisalRole: { en: 'Technology-appraisal role', 'zh-TW': '技術評估角色' },
  guaranteeRole: { en: 'Guarantee role', 'zh-TW': '保證角色' },
  investmentRole: { en: 'Investment role', 'zh-TW': '投資角色' },
  technologyTransferRole: { en: 'Technology-transfer role', 'zh-TW': '技術移轉角色' },
  depositGuaranteeRole: { en: 'Deposit-guarantee role', 'zh-TW': '存款保證角色' },
  creditGuaranteeRole: { en: 'Credit-guarantee role', 'zh-TW': '信用保證角色' },
  coveredInstitutions: { en: 'Covered institutions', 'zh-TW': '適用機構' },
  governanceOfDualMandate: { en: 'Governance of dual mandate', 'zh-TW': '雙重任務治理' },
  centralBankMandate: { en: 'Central-bank mandate', 'zh-TW': '中央銀行任務' },
  creditGuaranteeSchemeRole: { en: 'Credit-guarantee scheme role', 'zh-TW': '信用保證方案角色' },
  refinanceOrGovernmentSchemeRole: {
    en: 'Refinance or government-scheme role',
    'zh-TW': '再融資或政府方案角色',
  },
  responsibleUnit: { en: 'Responsible unit', 'zh-TW': '負責單位' },
  SMEDevelopmentMandate: { en: 'SME-development mandate', 'zh-TW': '中小企業發展任務' },
  financialAccessRole: { en: 'Financial-access role', 'zh-TW': '融資可近性角色' },
  trainingAndCapacityBuilding: { en: 'Training and capacity building', 'zh-TW': '培訓與能力建構' },
  relationshipWithGuaranteeSchemes: {
    en: 'Relationship with guarantee schemes',
    'zh-TW': '與保證制度的關係',
  },
  exportCreditInsuranceRole: { en: 'Export-credit insurance role', 'zh-TW': '出口信用保險角色' },
  bankGuaranteeRole: { en: 'Bank-guarantee role', 'zh-TW': '銀行保證角色' },
  exporterSupport: { en: 'Exporter support', 'zh-TW': '出口商支援' },
  legalMandate: { en: 'Legal mandate', 'zh-TW': '法定任務' },
  agricultureSpecificMandate: { en: 'Agriculture-specific mandate', 'zh-TW': '農業專屬任務' },
  eligibleAgriculturalSectors: { en: 'Eligible agricultural sectors', 'zh-TW': '適用農業部門' },
  partnerFinancialInstitutions: { en: 'Partner financial institutions', 'zh-TW': '合作金融機構' },
  agriculturalPolicyRole: { en: 'Agricultural-policy role', 'zh-TW': '農業政策角色' },
};

export function requiredLevel2Fields(role: InstitutionRoleCategory): string[] {
  return [...commonLevel2Fields, ...roleSpecificLevel2Fields[role]];
}

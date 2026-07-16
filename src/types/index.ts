export type VerificationStatus = 'verified' | 'partially_verified' | 'pending_verification';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type AcsicMembershipStatus = 'member' | 'observer';
export type Locale = 'en' | 'zh-TW';
export type TranslationStatus = 'official' | 'research_translation' | 'pending';
export type LocalizedText = Record<Locale, string>;

export type InstitutionRoleCategory =
  | 'credit_guarantee_corporation'
  | 'credit_guarantee_fund'
  | 'guarantee_association'
  | 'guarantee_federation'
  | 'policy_finance_institution'
  | 'technology_finance_guarantee_institution'
  | 'deposit_and_credit_guarantee_fund'
  | 'central_bank'
  | 'sme_development_agency'
  | 'export_credit_insurer_and_guarantor'
  | 'agricultural_credit_guarantee_fund';

export interface SourceReference {
  sourceId: string;
  institutionId: string | null;
  title: string;
  publisher: string;
  sourceType: string;
  sourceContextYear?: number | null;
  url: string;
  finalResolvedUrl: string;
  originalLanguage: string;
  publicationDate: string | null;
  documentDate: string | null;
  accessedDate: string;
  pageOrSection: string;
  isPrimarySource: true;
  accessStatus: 'accessible' | 'redirected' | 'temporarily_unavailable' | 'archived';
  stalenessWarning: boolean;
  notes: LocalizedText;
  id: string;
  documentType: 'official_webpage' | 'official_document' | 'official_report' | 'official_index';
  year: number | null;
  section: string;
  official: true;
}

export interface InstitutionName {
  en: string;
  officialEnglish: string;
  native: string | null;
  nativeLanguage: string | null;
  'zh-TW': string;
  zhTWTranslationStatus: TranslationStatus;
  aliases: string[];
}

export interface Institution {
  id: string;
  countryCode: string;
  countryName: LocalizedText;
  sourceCountryLabel: string;
  name: InstitutionName;
  summary: LocalizedText;
  institutionAbbreviation: string;
  acsicMembershipStatus: AcsicMembershipStatus;
  institutionRoleCategory: InstitutionRoleCategory;
  officialWebsite: string;
  establishedYear: number | null;
  legalBasis: string | null;
  ownershipOrLegalStatus: string | null;
  supervisingAuthority: string | null;
  mandate: LocalizedText;
  serviceTargets: string[];
  majorFunctions: string[];
  governanceType: string | null;
  fundingOrCapitalBasis: string | null;
  geographicScope: string | null;
  officialPublications: string[];
  acsicRoleNotes: LocalizedText;
  typeSpecificProfile: Record<string, string | string[] | null>;
  sourceReferences: SourceReference[];
  fieldEvidence: Record<string, string[]>;
  profileCompletenessLevel: 1 | 2 | 3;
  level1Completion: number;
  level2Completion: number;
  level2ApplicableFields: string[];
  level2VerifiedFields: string[];
  missingFields: string[];
  notApplicableFields: string[];
  nextResearchPriority: LocalizedText;
  membershipVerifiedDate: string;
  institutionVerifiedDate: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  confidenceLevel: ConfidenceLevel;
  originalLanguages: string[];
  level3Metrics: Array<Record<string, string | number>>;
  tags: string[];
  verifiedFacts: string[];
  analysisInferences: string[];
  pendingItems: string[];
  // Compatibility view used by existing comparison/report components.
  countryNameEn: string;
  countryNameZhTw: string;
  institutionNameEn: string;
  institutionNameZhTw: string;
  nameTranslationStatus: TranslationStatus;
  institutionType: string;
  type: LocalizedText;
  guaranteePrograms: string[];
  guaranteeCoverage: string | null;
  fundingSources: string[];
  riskSharingModel: string | null;
  governanceStructure: string | null;
  policyTools: string[];
  specialMeasures: string[];
  agricultureRelatedMeasures: string[];
  youthFarmerMeasures: string[];
  documentDate: string | null;
  notes: string;
}

export interface InstitutionFilters {
  query: string;
  country: string;
  type: string;
  tag: string;
  verification: string;
  agriculture: string;
  youth: string;
  sort: 'newest' | 'oldest' | 'name';
}

export type ReportType = 'executive' | 'country' | 'comparison' | 'meeting-qa' | 'presentation';

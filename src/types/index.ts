export type VerificationStatus = 'verified' | 'partially_verified' | 'pending_verification';
export type Level2Status = 'complete' | 'partial' | 'insufficient' | 'not_assessed';
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

export type SourceType =
  | 'official_membership_roster'
  | 'official_institution_profile'
  | 'official_law_or_regulation'
  | 'official_annual_report'
  | 'official_scheme_document'
  | 'official_governance_document'
  | 'official_government_source'
  | 'official_press_release'
  | 'official_strategy_document';

export interface SourceReference {
  sourceId: string;
  institutionIds: string[];
  title: string;
  publisher: string;
  sourceType: SourceType;
  tier: 'tier_1' | 'tier_2';
  url: string;
  finalResolvedUrl: string;
  originalLanguage: string;
  publicationDate: string | null;
  documentDate: string | null;
  accessedDate: string;
  pageOrSection: string;
  accessStatus: 'accessible' | 'redirected' | 'temporarily_unavailable' | 'archived';
  stalenessWarning: boolean;
  isPrimarySource: boolean;
  notes: LocalizedText;
}

export interface FieldEvidence {
  evidenceId: string;
  sourceId: string;
  pageOrSection: string;
  evidenceSummary: LocalizedText;
  evidenceType:
    | 'direct_official_statement'
    | 'official_document_summary'
    | 'official_legal_text'
    | 'official_statistical_table'
    | 'research_translation_of_official_source';
  verifiedDate: string;
}

export interface NotApplicableField {
  field: string;
  reason: LocalizedText;
  basis: 'role_methodology' | 'official_source';
  sourceIds: string[];
  reviewedDate: string;
}

export interface VerifiedClaim {
  claimId: string;
  statement: LocalizedText;
  fieldKeys: string[];
  sourceEvidenceIds: string[];
  verifiedDate: string;
}

export interface NativeName {
  value: string | null;
  language: string | null;
  status: 'official' | 'pending';
  sourceId: string | null;
}

export interface InstitutionName {
  en: string;
  officialEnglish: string;
  nativeName: NativeName;
  'zh-TW': string;
  zhTWTranslationStatus: TranslationStatus;
  aliases: string[];
}

export interface ConfidenceFactors {
  tier1SourceCount: number;
  sourceTypeCount: number;
  evidenceCoverage: number;
  hasStaleSource: boolean;
  hasUnavailableCriticalSource: boolean;
  unresolvedConflictCount: number;
  bilingualCoverage: number;
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
  legalBasis: LocalizedText | null;
  ownershipOrLegalStatus: LocalizedText | null;
  supervisingOrOversightAuthority: LocalizedText | null;
  mandate: LocalizedText;
  serviceTargets: LocalizedText[];
  majorFunctions: LocalizedText[];
  governanceType: LocalizedText | null;
  fundingOrCapitalBasis: LocalizedText | null;
  geographicScope: LocalizedText | null;
  officialPublications: LocalizedText[];
  acsicRoleNotes: LocalizedText;
  typeSpecificProfile: Record<string, LocalizedText | LocalizedText[] | null>;
  sourceIds: string[];
  sourceReferences: SourceReference[];
  fieldEvidence: Record<string, FieldEvidence[]>;
  profileCompletenessLevel: 1 | 2 | 3;
  level1Completion: number;
  level2Status: Level2Status;
  level2Completion: number;
  level2RequiredFields: string[];
  level2ApplicableFields: string[];
  level2VerifiedFields: string[];
  missingFields: string[];
  notApplicableFields: NotApplicableField[];
  nextResearchPriority: LocalizedText;
  membershipVerifiedDate: string;
  institutionVerifiedDate: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  confidenceRationale: LocalizedText;
  confidenceFactors: ConfidenceFactors;
  originalLanguages: string[];
  level3Metrics: Array<Record<string, string | number>>;
  tags: string[];
  verifiedFacts: VerifiedClaim[];
  analysisInferences: LocalizedText[];
  pendingItems: LocalizedText[];
  unresolvedConflicts: LocalizedText[];
  countryNameEn: string;
  countryNameZhTw: string;
  institutionNameEn: string;
  institutionNameZhTw: string;
  nameTranslationStatus: TranslationStatus;
  institutionType: string;
  type: LocalizedText;
  guaranteePrograms: LocalizedText[];
  guaranteeCoverage: LocalizedText | null;
  fundingSources: LocalizedText[];
  riskSharingModel: LocalizedText | null;
  governanceStructure: LocalizedText | null;
  policyTools: LocalizedText[];
  specialMeasures: LocalizedText[];
  agricultureRelatedMeasures: LocalizedText[];
  youthFarmerMeasures: LocalizedText[];
  documentDate: string | null;
  notes: LocalizedText;
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

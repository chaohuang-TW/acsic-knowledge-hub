export type VerificationStatus = 'verified' | 'partially_verified' | 'pending_verification';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type AcsicMembershipStatus = 'Member' | 'Observer';
export type Locale = 'en' | 'zh-TW';
export type TranslationStatus = 'official' | 'research_translation' | 'pending';
export type LocalizedText = Record<Locale, string>;

export interface SourceReference {
  id: string;
  title: string;
  documentType: 'official_webpage' | 'official_document' | 'official_report' | 'official_index';
  publisher: string;
  url: string;
  documentDate: string | null;
  year: number | null;
  section: string;
  accessedDate: string;
  originalLanguage: string;
  official: true;
}

export interface Institution {
  id: string;
  countryCode: string;
  countryNameZhTw: string;
  countryNameEn: string;
  institutionNameZhTw: string;
  institutionNameEn: string;
  name: LocalizedText;
  summary: LocalizedText;
  nameTranslationStatus: TranslationStatus;
  institutionAbbreviation: string;
  institutionType: string;
  type: LocalizedText;
  establishedYear: number | null;
  supervisingAuthority: string | null;
  legalBasis: string | null;
  serviceTargets: string[];
  guaranteePrograms: string[];
  guaranteeCoverage: string | null;
  fundingSources: string[];
  riskSharingModel: string | null;
  governanceStructure: string | null;
  policyTools: string[];
  specialMeasures: string[];
  agricultureRelatedMeasures: string[];
  youthFarmerMeasures: string[];
  acsicMembershipStatus: AcsicMembershipStatus;
  officialWebsite: string;
  sourceReferences: SourceReference[];
  documentDate: string | null;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  confidenceLevel: ConfidenceLevel;
  tags: string[];
  notes: string;
  verifiedFacts: string[];
  analysisInferences: string[];
  pendingItems: string[];
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

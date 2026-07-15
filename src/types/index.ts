export type VerificationStatus = '示範已檢核' | '示範待複核' | '待查證';
export type ConfidenceLevel = '高' | '中' | '低';

export interface DemoSource {
  id: string;
  title: string;
  sourceType: '示範一手來源' | '示範二手來源';
  publisher: string;
  url: string;
  accessedDate: string;
  note: string;
}

export interface Institution {
  id: string;
  demo: true;
  institutionName: string;
  countryName: string;
  institutionType: string;
  tags: string[];
  serviceTargets: string[];
  guaranteeMeasures: string[];
  guaranteeCoverage: string;
  fundingSources: string[];
  riskSharing: string;
  governanceModel: string;
  agricultureMeasures: string[];
  youthFarmerMeasures: string[];
  verificationStatus: VerificationStatus;
  confidenceLevel: ConfidenceLevel;
  updatedAt: string;
  facts: string[];
  inferences: string[];
  pending: string[];
  sources: DemoSource[];
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

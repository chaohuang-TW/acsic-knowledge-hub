import rawInstitutions from './institutions.json';
import type {
  AcsicMembershipStatus,
  Institution,
  InstitutionRoleCategory,
  LocalizedText,
  TranslationStatus,
} from '../types';

interface RawInstitution {
  id: string;
  countryCode: string;
  countryName: LocalizedText;
  sourceCountryLabel: string;
  officialEnglish: string;
  zhTw: string;
  translationStatus: TranslationStatus;
  aliases: string[];
  abbr: string;
  status: AcsicMembershipStatus;
  role: InstitutionRoleCategory;
  website: string;
  establishedYear: number | null;
  legalBasis: string | null;
  ownershipOrLegalStatus: string | null;
  supervisingAuthority: string | null;
  mandate: LocalizedText;
  serviceTargets: string[];
  majorFunctions: string[];
  profileSource: {
    title: string;
    publisher: string;
    url: string;
    language: string;
    section: string;
    accessStatus: 'accessible' | 'temporarily_unavailable';
  };
  level2ApplicableFields: string[];
  level2VerifiedFields: string[];
  missingFields: string[];
  typeSpecificProfile: Record<string, string | string[] | null>;
}

export const membershipRosterSource = {
  sourceId: 'acsic-2026-member-roster',
  institutionId: null,
  title: 'List of ACSIC Members',
  publisher: 'Credit Guarantee Fund Trust for Micro and Small Enterprises',
  sourceType: 'official_acsic_event_member_roster',
  sourceContextYear: 2026,
  url: 'https://globalacsic2026.in/about-members/',
  finalResolvedUrl: 'https://globalacsic2026.in/about-members/',
  originalLanguage: 'en',
  publicationDate: null,
  documentDate: null,
  accessedDate: '2026-07-16',
  pageOrSection: 'List of ACSIC Members',
  isPrimarySource: true as const,
  accessStatus: 'accessible' as const,
  stalenessWarning: false,
  notes: {
    en: 'Primary 2026 roster for 20 formal members across 14 countries or economies.',
    'zh-TW': '2026 年 20 個正式會員及 14 個國家／經濟體的主要名冊證據。',
  },
  id: 'acsic-2026-member-roster',
  documentType: 'official_index' as const,
  year: 2026,
  section: 'List of ACSIC Members',
  official: true as const,
};

export const observerRosterSource = {
  sourceId: 'acsic-current-member-institutions',
  institutionId: null,
  title: 'ACSIC Member Institutions',
  publisher: 'Small and Medium Enterprise Credit Guarantee Fund of Taiwan',
  sourceType: 'official_member_institution_roster',
  url: 'https://www.smeg.org.tw/en/basic/?node=10082',
  finalResolvedUrl: 'https://www.smeg.org.tw/en/basic/?node=10082',
  originalLanguage: 'en',
  publicationDate: null,
  documentDate: null,
  accessedDate: '2026-07-16',
  pageOrSection: 'Member Institutions; Observer',
  isPrimarySource: true as const,
  accessStatus: 'accessible' as const,
  stalenessWarning: false,
  notes: {
    en: 'Cross-check roster and evidence that ACGF is the observer. Listed links are not used as official-website evidence.',
    'zh-TW': '交叉查核名冊並確認 ACGF 為 Observer；頁面 href 不作為官方網站證據。',
  },
  id: 'acsic-current-member-institutions',
  documentType: 'official_index' as const,
  year: null,
  section: 'Member Institutions; Observer',
  official: true as const,
};

const roleLabels: Record<InstitutionRoleCategory, LocalizedText> = {
  credit_guarantee_corporation: { en: 'Credit guarantee corporation', 'zh-TW': '信用保證公司' },
  credit_guarantee_fund: { en: 'Credit guarantee fund', 'zh-TW': '信用保證基金' },
  guarantee_association: { en: 'Guarantee association', 'zh-TW': '信用保證協會' },
  guarantee_federation: { en: 'Guarantee federation', 'zh-TW': '信用保證聯合會' },
  policy_finance_institution: { en: 'Policy finance institution', 'zh-TW': '政策金融機構' },
  technology_finance_guarantee_institution: {
    en: 'Technology finance guarantee institution',
    'zh-TW': '科技金融保證機構',
  },
  deposit_and_credit_guarantee_fund: {
    en: 'Deposit and credit guarantee fund',
    'zh-TW': '存款與信用保證基金',
  },
  central_bank: { en: 'Central bank', 'zh-TW': '中央銀行' },
  sme_development_agency: { en: 'SME development agency', 'zh-TW': '中小企業發展機構' },
  export_credit_insurer_and_guarantor: {
    en: 'Export credit insurer and guarantor',
    'zh-TW': '出口信用保險與保證機構',
  },
  agricultural_credit_guarantee_fund: {
    en: 'Agricultural credit guarantee fund',
    'zh-TW': '農業信用保證基金',
  },
};

function toInstitution(raw: RawInstitution): Institution {
  const membershipSource =
    raw.status === 'observer' ? observerRosterSource : membershipRosterSource;
  const evidence = Object.fromEntries(
    raw.level2VerifiedFields.map((field) => [field, [`${raw.id}-profile`]]),
  );
  evidence.acsicMembershipStatus = [membershipSource.sourceId];
  evidence.officialWebsite = [`${raw.id}-profile`];
  const sourceReferences = [
    { ...membershipSource, institutionId: raw.id },
    {
      sourceId: `${raw.id}-profile`,
      institutionId: raw.id,
      title: raw.profileSource.title,
      publisher: raw.profileSource.publisher,
      sourceType: 'official_institution_webpage',
      url: raw.profileSource.url,
      finalResolvedUrl: raw.profileSource.url,
      originalLanguage: raw.profileSource.language,
      publicationDate: null,
      documentDate: null,
      accessedDate: '2026-07-16',
      pageOrSection: raw.profileSource.section,
      isPrimarySource: true as const,
      accessStatus: raw.profileSource.accessStatus,
      stalenessWarning: raw.id === 'asippindo-id',
      notes: {
        en:
          raw.profileSource.accessStatus === 'accessible'
            ? 'Official institution source used for the verified profile fields.'
            : 'Official source retained; access was temporarily unavailable during verification.',
        'zh-TW':
          raw.profileSource.accessStatus === 'accessible'
            ? '用於查證機構檔案欄位的官方來源。'
            : '保留官方來源；本次查核期間暫時無法穩定存取。',
      },
      id: `${raw.id}-profile`,
      documentType: 'official_webpage' as const,
      year: null,
      section: raw.profileSource.section,
      official: true as const,
    },
  ];
  const completion = Math.round(
    (raw.level2VerifiedFields.length / raw.level2ApplicableFields.length) * 100,
  );
  return {
    id: raw.id,
    countryCode: raw.countryCode,
    countryName: raw.countryName,
    sourceCountryLabel: raw.sourceCountryLabel,
    name: {
      en: raw.officialEnglish,
      officialEnglish: raw.officialEnglish,
      native: raw.translationStatus === 'official' ? raw.zhTw : null,
      nativeLanguage: raw.translationStatus === 'official' ? 'zh-TW' : null,
      'zh-TW': raw.zhTw,
      zhTWTranslationStatus: raw.translationStatus,
      aliases: raw.aliases,
    },
    summary: raw.mandate,
    institutionAbbreviation: raw.abbr,
    acsicMembershipStatus: raw.status,
    institutionRoleCategory: raw.role,
    officialWebsite: raw.website,
    establishedYear: raw.establishedYear,
    legalBasis: raw.legalBasis,
    ownershipOrLegalStatus: raw.ownershipOrLegalStatus,
    supervisingAuthority: raw.supervisingAuthority,
    mandate: raw.mandate,
    serviceTargets: raw.serviceTargets,
    majorFunctions: raw.majorFunctions,
    governanceType: raw.ownershipOrLegalStatus,
    fundingOrCapitalBasis: null,
    geographicScope: raw.countryName.en,
    officialPublications: [],
    acsicRoleNotes: {
      en:
        raw.status === 'observer'
          ? 'ACSIC observer; excluded from formal-member totals.'
          : 'Formal ACSIC member in the 2026 roster.',
      'zh-TW':
        raw.status === 'observer'
          ? 'ACSIC 觀察員，不計入正式會員總數。'
          : '2026 名冊所列 ACSIC 正式會員。',
    },
    typeSpecificProfile: raw.typeSpecificProfile,
    sourceReferences,
    fieldEvidence: evidence,
    profileCompletenessLevel: completion === 100 ? 2 : 1,
    level1Completion: 100,
    level2Completion: completion,
    level2ApplicableFields: raw.level2ApplicableFields,
    level2VerifiedFields: raw.level2VerifiedFields,
    missingFields: raw.missingFields,
    notApplicableFields: [],
    nextResearchPriority: {
      en: raw.missingFields.length
        ? `Verify: ${raw.missingFields.join(', ')}.`
        : 'Add dated official Level 3 metrics only when definitions are comparable.',
      'zh-TW': raw.missingFields.length
        ? `待查證：${raw.missingFields.join('、')}。`
        : '僅在定義可比較時，新增具日期的官方 Level 3 指標。',
    },
    membershipVerifiedDate: '2026-07-16',
    institutionVerifiedDate: '2026-07-16',
    lastVerifiedDate: '2026-07-16',
    verificationStatus: completion === 100 ? 'verified' : 'partially_verified',
    confidenceLevel: raw.profileSource.accessStatus === 'accessible' ? 'high' : 'medium',
    originalLanguages: [...new Set(['en', raw.profileSource.language])],
    level3Metrics: [],
    tags: [raw.status, raw.role, raw.countryCode],
    verifiedFacts: raw.level2VerifiedFields.map(
      (field) => `${field}: verified by official source.`,
    ),
    analysisInferences: [],
    pendingItems: raw.missingFields,
    countryNameEn: raw.countryName.en,
    countryNameZhTw: raw.countryName['zh-TW'],
    institutionNameEn: raw.officialEnglish,
    institutionNameZhTw: raw.zhTw,
    nameTranslationStatus: raw.translationStatus,
    institutionType: raw.role,
    type: roleLabels[raw.role],
    guaranteePrograms: raw.majorFunctions,
    guaranteeCoverage: null,
    fundingSources: [],
    riskSharingModel: null,
    governanceStructure: raw.ownershipOrLegalStatus,
    policyTools: raw.majorFunctions,
    specialMeasures: [],
    agricultureRelatedMeasures:
      raw.role === 'agricultural_credit_guarantee_fund' ? raw.majorFunctions : [],
    youthFarmerMeasures: [],
    documentDate: null,
    notes: raw.missingFields.length ? `Missing: ${raw.missingFields.join(', ')}` : '',
  };
}

/** Single governed production-data entry point. */
export const institutions = (rawInstitutions as RawInstitution[]).map(toInstitution);

export const roleCategoryLabels = roleLabels;

export const membershipStats = {
  formalMembers: institutions.filter((record) => record.acsicMembershipStatus === 'member').length,
  observers: institutions.filter((record) => record.acsicMembershipStatus === 'observer').length,
  countriesEconomies: new Set(
    institutions
      .filter((record) => record.acsicMembershipStatus === 'member')
      .map((record) => record.countryCode),
  ).size,
  institutionsCovered: institutions.length,
  level1Complete: institutions.filter((record) => record.level1Completion === 100).length,
  level2Complete: institutions.filter((record) => record.level2Completion === 100).length,
  level2Partial: institutions.filter(
    (record) => record.level2Completion > 0 && record.level2Completion < 100,
  ).length,
  level3Reliable: institutions.filter((record) => record.level3Metrics.length > 0).length,
  sources: institutions.reduce((count, record) => count + record.sourceReferences.length, 0),
  lastMembershipVerificationDate: '2026-07-16',
};

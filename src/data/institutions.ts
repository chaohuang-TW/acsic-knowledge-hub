import rawInstitutions from './institutions.json';
import rawSources from './sources.json';
import { level2FieldLabels, requiredLevel2Fields } from './level2-standards';
import { hasResearchTranslation, localize, localizeList } from './translations';
import type {
  AcsicMembershipStatus,
  FieldEvidence,
  Institution,
  InstitutionRoleCategory,
  LocalizedText,
  NativeName,
  NotApplicableField,
  SourceReference,
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
  supervisingOrOversightAuthority: string | null;
  mandate: LocalizedText;
  serviceTargets: string[];
  majorFunctions: string[];
  typeSpecificProfile: Record<string, string | string[] | null>;
  profileSourceId: string;
  sourceIds: string[];
  verifiedFieldKeys: string[];
  nativeName: NativeName;
  notApplicableFields: NotApplicableField[];
}

export const sourceRegistry = rawSources as SourceReference[];
export const sourceById = new Map(sourceRegistry.map((source) => [source.sourceId, source]));

export const roleCategoryLabels: Record<InstitutionRoleCategory, LocalizedText> = {
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

const evidenceSourceOverrides: Record<string, Record<string, string>> = {
  'jfc-jp': {
    businessUnits: 'jfc-guide-2024',
    relationshipWithPrivateFinancialInstitutions: 'jfc-guide-2024',
    officialPublications: 'jfc-guide-2024',
    supervisingOrOversightAuthority: 'jfc-governance',
    fundingOrCapitalBasis: 'jfc-governance',
    geographicScope: 'jfc-japanese-profile',
  },
  'jfg-jp': {
    sharedServices: 'jfg-japanese-profile',
    policyRepresentation: 'jfg-japanese-profile',
    trainingOrCapacityBuildingRole: 'jfg-japanese-profile',
  },
  'kotec-kr': {
    legalBasis: 'kotec-act-current',
    fundingOrCapitalBasis: 'kotec-act-current',
    guaranteeRole: 'kotec-act-current',
    fundingSources: 'kotec-act-current',
  },
  'philguarantee-ph': { legalBasis: 'philguarantee-eo58-2018' },
  'dcgf-np': {
    legalBasis: 'dcgf-act-2073',
    coveredInstitutions: 'dcgf-act-2073',
    governanceOfDualMandate: 'dcgf-act-2073',
  },
};

function localizedTypeProfile(
  profile: RawInstitution['typeSpecificProfile'],
): Institution['typeSpecificProfile'] {
  return Object.fromEntries(
    Object.entries(profile).map(([key, value]) => [
      key,
      Array.isArray(value)
        ? localizeList(value)
        : typeof value === 'string'
          ? localize(value)
          : null,
    ]),
  );
}

function fieldValue(record: Institution, field: string): unknown {
  if (field in record.typeSpecificProfile) return record.typeSpecificProfile[field];
  return (record as unknown as Record<string, unknown>)[field];
}

function localizedValue(value: unknown): LocalizedText | null {
  if (typeof value === 'number') return { en: String(value), 'zh-TW': String(value) };
  if (value && typeof value === 'object' && 'en' in value && 'zh-TW' in value)
    return value as LocalizedText;
  if (Array.isArray(value)) {
    const items = value as LocalizedText[];
    return {
      en: items.map((item) => item.en).join('; '),
      'zh-TW': items.map((item) => item['zh-TW']).join('、'),
    };
  }
  return null;
}

function evidenceFor(record: Institution, field: string, sourceId: string): FieldEvidence {
  const source = sourceById.get(sourceId);
  if (!source) throw new Error(`Unknown source ${sourceId}`);
  const value = localizedValue(fieldValue(record, field));
  const label = level2FieldLabels[field] ?? { en: field, 'zh-TW': field };
  const fallback = {
    en: `${label.en} is identified in the cited official source.`,
    'zh-TW': `引用的官方來源載明${label['zh-TW']}。`,
  };
  const summary = value
    ? {
        en: `The official source identifies ${label.en.toLowerCase()} as: ${value.en}.`,
        'zh-TW': `官方來源載明${label['zh-TW']}為：${value['zh-TW']}。`,
      }
    : fallback;
  return {
    evidenceId: `${record.id}-${field}-evidence`,
    sourceId,
    pageOrSection: source.pageOrSection,
    evidenceSummary: summary,
    evidenceType:
      source.sourceType === 'official_law_or_regulation'
        ? 'official_legal_text'
        : source.sourceType.endsWith('_document')
          ? 'official_document_summary'
          : 'direct_official_statement',
    verifiedDate: '2026-07-16',
  };
}

function initialInstitution(raw: RawInstitution): Institution {
  const typeSpecificProfile = localizedTypeProfile(raw.typeSpecificProfile);
  const sourceReferences = raw.sourceIds.map((id) => {
    const source = sourceById.get(id);
    if (!source) throw new Error(`Unknown source ${id}`);
    return source;
  });
  const fundingValues = raw.typeSpecificProfile.fundingSources;
  const explicitFundingBasis = raw.typeSpecificProfile.fundingOrCapitalBasis;
  const fundingOrCapitalBasis =
    typeof explicitFundingBasis === 'string'
      ? localize(explicitFundingBasis)
      : Array.isArray(fundingValues)
        ? {
            en: fundingValues.join('; '),
            'zh-TW': localizeList(fundingValues)
              .map((item) => item['zh-TW'])
              .join('、'),
          }
        : null;
  const officialPublications =
    raw.id === 'jfc-jp' ? [localize('Guide to Japan Finance Corporation 2024')] : [];
  const acsicRoleNotes = {
    en:
      raw.status === 'observer'
        ? 'ACSIC observer; excluded from formal-member totals.'
        : 'Formal ACSIC member in the 2026 roster.',
    'zh-TW':
      raw.status === 'observer'
        ? 'ACSIC 觀察員，不計入正式會員總數。'
        : '2026 年名冊所列 ACSIC 正式會員。',
  };
  const ownership = raw.ownershipOrLegalStatus ? localize(raw.ownershipOrLegalStatus) : null;
  const record: Institution = {
    id: raw.id,
    countryCode: raw.countryCode,
    countryName: raw.countryName,
    sourceCountryLabel: raw.sourceCountryLabel,
    name: {
      en: raw.officialEnglish,
      officialEnglish: raw.officialEnglish,
      nativeName: raw.nativeName,
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
    legalBasis: raw.legalBasis ? localize(raw.legalBasis) : null,
    ownershipOrLegalStatus: ownership,
    supervisingOrOversightAuthority: raw.supervisingOrOversightAuthority
      ? localize(raw.supervisingOrOversightAuthority)
      : null,
    mandate: raw.mandate,
    serviceTargets: localizeList(raw.serviceTargets),
    majorFunctions: localizeList(raw.majorFunctions),
    governanceType: ownership,
    fundingOrCapitalBasis,
    geographicScope: raw.countryName,
    officialPublications,
    acsicRoleNotes,
    typeSpecificProfile,
    sourceIds: raw.sourceIds,
    sourceReferences,
    fieldEvidence: {},
    profileCompletenessLevel: 1 as const,
    level1Completion: 100,
    level2Status: 'not_assessed' as const,
    level2Completion: 0,
    level2RequiredFields: requiredLevel2Fields(raw.role),
    level2ApplicableFields: [],
    level2VerifiedFields: [],
    missingFields: [],
    notApplicableFields: raw.notApplicableFields,
    nextResearchPriority: { en: '', 'zh-TW': '' },
    membershipVerifiedDate: '2026-07-16',
    institutionVerifiedDate: '2026-07-16',
    lastVerifiedDate: '2026-07-16',
    verificationStatus: 'pending_verification' as const,
    confidenceScore: 0,
    confidenceLevel: 'low' as const,
    confidenceRationale: { en: '', 'zh-TW': '' },
    confidenceFactors: {
      tier1SourceCount: 0,
      sourceTypeCount: 0,
      evidenceCoverage: 0,
      hasStaleSource: false,
      hasUnavailableCriticalSource: false,
      unresolvedConflictCount: 0,
      bilingualCoverage: 100,
    },
    originalLanguages: [...new Set(sourceReferences.map((source) => source.originalLanguage))],
    level3Metrics: [],
    tags: [raw.status, raw.role, raw.countryCode],
    verifiedFacts: [],
    analysisInferences: [],
    pendingItems: [],
    unresolvedConflicts: [],
    countryNameEn: raw.countryName.en,
    countryNameZhTw: raw.countryName['zh-TW'],
    institutionNameEn: raw.officialEnglish,
    institutionNameZhTw: raw.zhTw,
    nameTranslationStatus: raw.translationStatus,
    institutionType: raw.role,
    type: roleCategoryLabels[raw.role],
    guaranteePrograms: localizeList(raw.majorFunctions),
    guaranteeCoverage: null,
    fundingSources: Array.isArray(fundingValues) ? localizeList(fundingValues) : [],
    riskSharingModel: null,
    governanceStructure: ownership,
    policyTools: localizeList(raw.majorFunctions),
    specialMeasures: [],
    agricultureRelatedMeasures:
      raw.role === 'agricultural_credit_guarantee_fund' ? localizeList(raw.majorFunctions) : [],
    youthFarmerMeasures: [],
    documentDate: null,
    notes: { en: '', 'zh-TW': '' },
  };

  const verifiedFields = new Set(raw.verifiedFieldKeys);
  verifiedFields.add('acsicRoleNotes');
  if (verifiedFields.has('ownershipOrLegalStatus')) verifiedFields.add('governanceType');
  if (raw.id === 'jfc-jp') verifiedFields.add('officialPublications');
  const fieldEvidence: Record<string, FieldEvidence[]> = {};
  for (const field of verifiedFields) {
    if (!fieldValue(record, field)) continue;
    const sourceId =
      field === 'acsicRoleNotes'
        ? raw.status === 'observer'
          ? 'acsic-current-member-institutions'
          : 'acsic-2026-member-roster'
        : (evidenceSourceOverrides[raw.id]?.[field] ?? raw.profileSourceId);
    fieldEvidence[field] = [evidenceFor(record, field, sourceId)];
  }
  record.fieldEvidence = fieldEvidence;

  const excluded = new Set(raw.notApplicableFields.map((item) => item.field));
  record.level2ApplicableFields = record.level2RequiredFields.filter(
    (field) => !excluded.has(field),
  );
  record.level2VerifiedFields = record.level2ApplicableFields.filter(
    (field) => fieldEvidence[field]?.length && fieldValue(record, field),
  );
  record.missingFields = record.level2ApplicableFields.filter(
    (field) => !record.level2VerifiedFields.includes(field),
  );
  record.level2Completion = Math.round(
    (record.level2VerifiedFields.length / record.level2ApplicableFields.length) * 100,
  );

  const tier1SourceCount = sourceReferences.filter((source) => source.tier === 'tier_1').length;
  const sourceTypeCount = new Set(sourceReferences.map((source) => source.sourceType)).size;
  const hasStaleSource = sourceReferences.some((source) => source.stalenessWarning);
  const hasUnavailableCriticalSource = sourceReferences.some(
    (source) =>
      source.sourceId === raw.profileSourceId && source.accessStatus === 'temporarily_unavailable',
  );
  const evidenceCoverage = record.level2Completion;
  const completeEligible =
    record.missingFields.length === 0 &&
    sourceTypeCount >= 3 &&
    tier1SourceCount >= 3 &&
    !hasStaleSource &&
    !hasUnavailableCriticalSource;
  record.level2Status = completeEligible
    ? 'complete'
    : record.level2VerifiedFields.length <= 1 || hasUnavailableCriticalSource
      ? 'insufficient'
      : 'partial';
  record.profileCompletenessLevel = record.level2Status === 'complete' ? 2 : 1;
  record.verificationStatus =
    record.level2Status === 'complete'
      ? 'verified'
      : record.level2Status === 'insufficient'
        ? 'pending_verification'
        : 'partially_verified';

  record.confidenceFactors = {
    tier1SourceCount,
    sourceTypeCount,
    evidenceCoverage,
    hasStaleSource,
    hasUnavailableCriticalSource,
    unresolvedConflictCount: 0,
    bilingualCoverage: 100,
  };
  record.confidenceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        evidenceCoverage * 0.6 +
          Math.min(tier1SourceCount, 3) * 7 +
          Math.min(sourceTypeCount, 3) * 5 -
          (hasStaleSource ? 12 : 0) -
          (hasUnavailableCriticalSource ? 30 : 0),
      ),
    ),
  );
  record.confidenceLevel =
    record.level2Status === 'complete' && record.confidenceScore >= 80
      ? 'high'
      : record.level2Status === 'insufficient' || record.confidenceScore < 40
        ? 'low'
        : 'medium';
  record.confidenceRationale = {
    en:
      record.confidenceLevel === 'high'
        ? 'All applicable Level 2 fields have field-level Tier 1 evidence, with adequate source diversity and no critical access or staleness warning.'
        : record.confidenceLevel === 'medium'
          ? `The official sources establish a usable institutional profile, but ${record.missingFields.length} applicable Level 2 fields remain unverified.`
          : 'Only a limited official profile can be established; the critical institution source is unavailable or evidence coverage is too low.',
    'zh-TW':
      record.confidenceLevel === 'high'
        ? '所有適用 Level 2 欄位均有 Tier 1 欄位級證據，來源類型充分，且無關鍵存取或時效警示。'
        : record.confidenceLevel === 'medium'
          ? `官方來源足以建立基本機構輪廓，但仍有 ${record.missingFields.length} 個適用 Level 2 欄位待查證。`
          : '目前僅能建立有限的官方輪廓；關鍵機構來源無法存取，或證據涵蓋率過低。',
  };
  const missingLabels = record.missingFields.map(
    (field) => level2FieldLabels[field] ?? { en: field, 'zh-TW': field },
  );
  record.pendingItems = missingLabels;
  record.nextResearchPriority = {
    en: missingLabels.length
      ? `Prioritise official evidence for: ${missingLabels.map((item) => item.en).join(', ')}.`
      : 'Maintain current evidence and review source dates before adding Level 3 metrics.',
    'zh-TW': missingLabels.length
      ? `優先補查官方證據：${missingLabels.map((item) => item['zh-TW']).join('、')}。`
      : '維護現有證據，並在新增 Level 3 指標前複核來源日期。',
  };
  record.notes = {
    en: missingLabels.length
      ? `${missingLabels.length} applicable Level 2 fields remain pending.`
      : 'No applicable Level 2 field is pending.',
    'zh-TW': missingLabels.length
      ? `仍有 ${missingLabels.length} 個適用 Level 2 欄位待查證。`
      : '沒有待查證的適用 Level 2 欄位。',
  };
  record.verifiedFacts = Object.entries(fieldEvidence).map(([field, evidence]) => ({
    claimId: `${record.id}-${field}-claim`,
    statement: evidence[0]!.evidenceSummary,
    fieldKeys: [field],
    sourceEvidenceIds: evidence.map((item) => item.evidenceId),
    verifiedDate: '2026-07-16',
  }));
  return record;
}

/** Single governed production-data entry point. */
const governedRawInstitutions = rawInstitutions as unknown as RawInstitution[];
export const institutions = governedRawInstitutions.map(initialInstitution);

export const untranslatedProductionValues = governedRawInstitutions.flatMap((raw) => {
  const values = [
    raw.legalBasis,
    raw.ownershipOrLegalStatus,
    raw.supervisingOrOversightAuthority,
    ...raw.serviceTargets,
    ...raw.majorFunctions,
    ...Object.values(raw.typeSpecificProfile).flatMap((value) =>
      Array.isArray(value) ? value : typeof value === 'string' ? [value] : [],
    ),
  ].filter((value): value is string => Boolean(value));
  return values.filter((value) => !hasResearchTranslation(value));
});

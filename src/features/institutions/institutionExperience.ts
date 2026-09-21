import { indicatorById, productionLevel3Values } from '../../data/indicators';
import { institutionPath } from '../../routing';
import { institutions, sourceById } from '../../data/institutions';
import type { Institution, Locale, LocalizedText, SourceReference } from '../../types';
import type { Level3IndicatorRecord, PilotIndicatorId } from '../../types/indicators';
import { systemCards } from './systemEvidence';

export type InstitutionExperienceMetricLimit = 3 | 5;

export const institutionExperienceCopy: Record<
  Locale,
  {
    member: string;
    observer: string;
    fullProfile: string;
    viewProfile: string;
    officialWebsite: string;
    opensNewTab: string;
    latestVerifiedMetrics: string;
    officialMetrics: string;
    systemHighlights: string;
    select: string;
    selected: string;
    openSource: string;
    reportingPeriod: string;
    source: string;
    selectedAnnouncement: string;
    researchEvidence: string;
    noVerifiedMetrics: string;
    provenance: string;
    reportedValue: string;
    publicationDate: string;
    definition: string;
    definitionMapping: string;
    normalization: string;
    comparability: string;
    pageOrSection: string;
  }
> = {
  en: {
    member: 'Member',
    observer: 'Observer',
    fullProfile: 'View full profile',
    viewProfile: 'View full profile',
    officialWebsite: 'Official website',
    opensNewTab: 'opens in a new tab',
    latestVerifiedMetrics: 'Latest verified metrics',
    officialMetrics: 'Official metrics',
    systemHighlights: 'System highlights',
    select: 'Select institution',
    selected: 'Selected',
    openSource: 'Open source',
    reportingPeriod: 'Reporting period',
    source: 'Source',
    selectedAnnouncement: 'Selected {name}.',
    researchEvidence: 'Research evidence',
    noVerifiedMetrics: 'No numeric Level 3 metrics are available.',
    provenance: 'Metric provenance',
    reportedValue: 'Reported value',
    publicationDate: 'Publication date',
    definition: 'Definition',
    definitionMapping: 'Definition mapping',
    normalization: 'Normalization',
    comparability: 'Comparability',
    pageOrSection: 'Page or section',
  },
  'zh-TW': {
    member: '正式會員',
    observer: '觀察員',
    fullProfile: '查看完整機構檔案',
    viewProfile: '查看完整機構檔案',
    officialWebsite: '官方網站',
    opensNewTab: '在新分頁開啟',
    latestVerifiedMetrics: '最新核驗指標',
    officialMetrics: '官方指標',
    systemHighlights: '制度重點',
    select: '選取機構',
    selected: '已選取',
    openSource: '開啟來源',
    reportingPeriod: '資料期間',
    source: '來源',
    selectedAnnouncement: '已選取{name}。',
    researchEvidence: '研究證據',
    noVerifiedMetrics: '目前沒有可用的數值型 Level 3 指標。',
    provenance: '指標來源脈絡',
    reportedValue: '原始揭露值',
    publicationDate: '發布日期',
    definition: '定義',
    definitionMapping: '定義對映',
    normalization: '標準化處理',
    comparability: '可比較性',
    pageOrSection: '頁碼或章節',
  },
};

export interface InstitutionSystemHighlight {
  field: string;
  label: string;
  value: string;
  evidenceSummary: string;
  sourceIds: string[];
  sources: SourceReference[];
}

export interface InstitutionExperienceMetric {
  recordId: string;
  indicatorId: PilotIndicatorId;
  label: string;
  periodLabel: string;
  originalPeriodLabel: string;
  formattedValue: string;
  /** The exact reported number; never currency- or unit-converted. */
  exactValue: number;
  qualification: string | null;
  reportedValue: Level3IndicatorRecord['reported'];
  unit: string;
  originalUnit: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  sourcePageOrSection: string;
  sourcePublicationDate: string | null;
  schemeName: string | null;
  record: Level3IndicatorRecord;
}

export interface InstitutionSnapshotIdentity {
  id: string;
  countryCode: string;
  countryName: string;
  name: string;
  officialEnglishName: string;
  nativeName: string | null;
  abbreviation: string;
  membershipStatus: Institution['acsicMembershipStatus'];
  membershipLabel: string;
  institutionType: string;
  profilePath: string;
}

export interface InstitutionSnapshot {
  institution: Institution;
  locale: Locale;
  identity: InstitutionSnapshotIdentity;
  roleSummary: string;
  membershipLabel: string;
  systemHighlights: InstitutionSystemHighlight[];
  latestMetrics: InstitutionExperienceMetric[];
  profilePath: string;
  officialWebsite: string;
}

const metricPresentationOrder: PilotIndicatorId[] = [
  'number_of_guarantees',
  'new_guarantee_volume',
  'outstanding_guarantee_balance',
  'capital_or_fund_size',
  'beneficiary_enterprises',
  'partner_financial_institutions',
  'guarantee_coverage_ratio',
];

const highlightPresentationOrder = [
  'guaranteeDeliveryModel',
  'creditInsuranceOrGuaranteeRole',
  'riskSharingOverview',
  'technologyAppraisalRole',
  'guaranteeRole',
  'agricultureSpecificMandate',
  'policyFinanceRole',
  'technologyTransferRole',
  'investmentRole',
  'majorFunctions',
] as const;

const highlightLabels: Record<(typeof highlightPresentationOrder)[number], LocalizedText> = {
  guaranteeDeliveryModel: { en: 'Guarantee delivery', 'zh-TW': '保證辦理' },
  creditInsuranceOrGuaranteeRole: {
    en: 'Credit-insurance or guarantee role',
    'zh-TW': '信用保險或保證角色',
  },
  riskSharingOverview: { en: 'Risk-sharing approach', 'zh-TW': '風險分擔方式' },
  technologyAppraisalRole: { en: 'Technology appraisal', 'zh-TW': '技術評價' },
  guaranteeRole: { en: 'Guarantee role', 'zh-TW': '保證角色' },
  agricultureSpecificMandate: {
    en: 'Agriculture-specific mandate',
    'zh-TW': '農業專屬任務',
  },
  policyFinanceRole: { en: 'Policy-finance role', 'zh-TW': '政策金融角色' },
  technologyTransferRole: { en: 'Technology transfer', 'zh-TW': '技術移轉' },
  investmentRole: { en: 'Investment role', 'zh-TW': '投資角色' },
  majorFunctions: { en: 'Major functions', 'zh-TW': '主要功能' },
};

/** Select already-published Systems-page evidence for the corresponding institution snapshot. */
const systemEvidenceReferences: Record<
  string,
  Array<{ cardId: string; itemIndex: number; sourceIds: string[] }>
> = {
  'tsmeg-tw': [
    { cardId: 'taiwan', itemIndex: 2, sourceIds: ['tsmeg-direct-guarantee'] },
    { cardId: 'taiwan', itemIndex: 0, sourceIds: ['tsmeg-indirect-guarantee'] },
    { cardId: 'taiwan', itemIndex: 1, sourceIds: ['tsmeg-indirect-guarantee'] },
  ],
  'jfc-jp': [
    { cardId: 'japan', itemIndex: 1, sourceIds: ['jfc-credit-insurance-outline'] },
    { cardId: 'japan', itemIndex: 2, sourceIds: ['jfc-credit-insurance-outline'] },
  ],
  'jfg-jp': [{ cardId: 'japan', itemIndex: 0, sourceIds: ['jfg-credit-guarantee-system-2025'] }],
  'kodit-kr': [
    { cardId: 'korea-kodit', itemIndex: 0, sourceIds: ['kodit-credit-guarantee-process'] },
    { cardId: 'korea-kodit', itemIndex: 1, sourceIds: ['kodit-credit-guarantee-process'] },
  ],
  'kotec-kr': [
    { cardId: 'korea-kotec', itemIndex: 0, sourceIds: ['kotec-guarantee-key-features'] },
    { cardId: 'korea-kotec', itemIndex: 1, sourceIds: ['kotec-airate-main-features'] },
  ],
};

function fieldValue(institution: Institution, field: string): unknown {
  const profileValue = institution.typeSpecificProfile[field];
  if (profileValue !== undefined && profileValue !== null) return profileValue;
  return (institution as unknown as Record<string, unknown>)[field];
}

function localizedValue(value: unknown, locale: Locale): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (value && typeof value === 'object' && locale in value) {
    const localized = (value as LocalizedText)[locale];
    return typeof localized === 'string' && localized.trim() ? localized.trim() : null;
  }
  if (Array.isArray(value)) {
    const values = value
      .map((item) => localizedValue(item, locale))
      .filter((item): item is string => Boolean(item));
    return values.length ? values.join(locale === 'en' ? '; ' : '、') : null;
  }
  return null;
}

function verifiedHighlight(
  institution: Institution,
  field: (typeof highlightPresentationOrder)[number],
  locale: Locale,
): InstitutionSystemHighlight | null {
  const value = localizedValue(fieldValue(institution, field), locale);
  if (!value) return null;

  const evidence = institution.fieldEvidence[field] ?? [];
  const sourceIds = [...new Set(evidence.map((item) => item.sourceId))];
  const sources = sourceIds
    .map((sourceId) => sourceById.get(sourceId))
    .filter((source): source is SourceReference => {
      if (!source) return false;
      return (
        source.isPrimarySource &&
        !source.stalenessWarning &&
        source.accessStatus !== 'temporarily_unavailable'
      );
    });
  if (!sources.length) return null;
  const validSourceIds = new Set(sources.map((source) => source.sourceId));
  const evidenceSummary = evidence.find((item) => validSourceIds.has(item.sourceId))
    ?.evidenceSummary[locale];
  if (!evidenceSummary) return null;

  return {
    field,
    label: highlightLabels[field][locale],
    value,
    evidenceSummary,
    sourceIds: sources.map((source) => source.sourceId),
    sources,
  };
}

function documentedSystemHighlights(
  institutionId: string,
  locale: Locale,
): InstitutionSystemHighlight[] {
  return (systemEvidenceReferences[institutionId] ?? [])
    .map((reference): InstitutionSystemHighlight | null => {
      const card = systemCards.find((item) => item.id === reference.cardId);
      const item = card?.items[reference.itemIndex];
      if (
        !item ||
        !card ||
        !reference.sourceIds.some((sourceId) =>
          (card.sourceIds as readonly string[]).includes(sourceId),
        )
      )
        return null;
      const sources = reference.sourceIds
        .filter((sourceId) => (card.sourceIds as readonly string[]).includes(sourceId))
        .map((sourceId) => sourceById.get(sourceId))
        .filter((source): source is SourceReference => Boolean(source?.isPrimarySource));
      if (!sources.length) return null;

      return {
        field: `${reference.cardId}:${reference.itemIndex}`,
        label: item.title[locale],
        value: item.text[locale],
        evidenceSummary: item.text[locale],
        sourceIds: sources.map((source) => source.sourceId),
        sources,
      };
    })
    .filter((highlight): highlight is InstitutionSystemHighlight => highlight !== null)
    .slice(0, 3);
}

function recordPeriodOrder(record: Level3IndicatorRecord): string | null {
  const { period } = record;
  if (period.asOfDate) return period.asOfDate;
  if (period.periodEnd) return period.periodEnd;
  if (period.calendarYear) return `${period.calendarYear}-12-31`;
  if (period.fiscalYear) {
    const year = period.fiscalYear.match(/\d{4}/)?.[0];
    if (year) return `${year}-12-31`;
  }
  if (period.periodStart) return period.periodStart;
  return null;
}

function periodGroupKey(record: Level3IndicatorRecord): string {
  const localizedSchemeName = [record.scheme.schemeName.en, record.scheme.schemeName['zh-TW']]
    .filter((name): name is string => Boolean(name))
    .join('|');
  const schemeKey = record.scheme.schemeId
    ? record.scheme.schemeId
    : record.scheme.schemeSpecific
      ? localizedSchemeName || record.recordId
      : 'institution-wide';
  return [record.indicatorId, schemeKey, record.period.reportingPeriodType].join(':');
}

function passesPublicationGates(record: Level3IndicatorRecord): boolean {
  const source = sourceById.get(record.source.sourceId);
  const gates = record.gates;
  return Boolean(
    (record.verificationStatus === 'verified' ||
      record.verificationStatus === 'verified_with_limitation') &&
    gates.researchVerified &&
    gates.schemaValidated &&
    gates.sourceValidated &&
    gates.comparabilityReviewed &&
    (!gates.manualReviewRequired || record.manualReviewStatus === 'completed') &&
    (record.manualReviewStatus === 'completed' || record.manualReviewStatus === 'not_required') &&
    source?.isPrimarySource &&
    !source.stalenessWarning &&
    record.reported.value !== null &&
    Number.isFinite(record.reported.value) &&
    record.reported.unit.trim() &&
    record.source.verifiedDate &&
    recordPeriodOrder(record),
  );
}

function formatDate(date: string, locale: Locale): string {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return date;
  const [, year, month, day] = match;
  if (locale === 'zh-TW') return `${year}年${Number(month)}月${Number(day)}日`;
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`;
}

export function formatMetricPeriod(record: Level3IndicatorRecord, locale: Locale): string {
  const { period, reported } = record;
  if (period.reportingPeriodType === 'calendar_year' && period.calendarYear) {
    return locale === 'en' ? `CY${period.calendarYear}` : `${period.calendarYear} 曆年`;
  }
  if (period.reportingPeriodType === 'fiscal_year' && period.fiscalYear) return period.fiscalYear;
  if (period.reportingPeriodType === 'point_in_time' && period.asOfDate) {
    const date = formatDate(period.asOfDate, locale);
    return locale === 'en' ? `As of ${date}` : `截至${date}`;
  }
  if (period.reportingPeriodType === 'cumulative_since_establishment') {
    const through = period.asOfDate ?? period.periodEnd;
    if (through) {
      const date = formatDate(through, locale);
      return locale === 'en' ? `Cumulative through ${date}` : `累計至${date}`;
    }
  }
  return (
    reported.originalPeriodLabel ||
    reported.periodLabel ||
    period.fiscalYear ||
    String(period.calendarYear ?? '')
  );
}

export function formatMetricValue(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 10 }).format(value);
}

export function formatMetricUnit(unit: string, locale: Locale): string {
  if (locale === 'zh-TW') return unit;
  const translations: Record<string, string> = {
    新臺幣千元: 'thousand TWD',
    新臺幣百萬元: 'million TWD',
    新臺幣億元: 'TWD 100 million',
    件: 'cases',
    戶企業: 'enterprises',
    官方具名機構清單: 'officially named institutions',
  };
  return translations[unit] ?? unit;
}

function toSnapshotMetric(
  record: Level3IndicatorRecord,
  locale: Locale,
): InstitutionExperienceMetric | null {
  if (!passesPublicationGates(record) || record.reported.value === null) return null;
  const definition = indicatorById.get(record.indicatorId);
  const source = sourceById.get(record.source.sourceId);
  if (!definition || !source) return null;

  return {
    recordId: record.recordId,
    indicatorId: record.indicatorId,
    label: definition.name[locale],
    periodLabel: formatMetricPeriod(record, locale),
    originalPeriodLabel: record.reported.originalPeriodLabel ?? record.reported.periodLabel,
    formattedValue: formatMetricValue(record.reported.value, locale),
    exactValue: record.reported.value,
    qualification:
      record.verificationStatus === 'verified_with_limitation' ||
      record.comparability.status !== 'comparable_with_conditions'
        ? record.normalized.notes[locale] || record.comparability.issues[locale].join(' ')
        : null,
    reportedValue: record.reported,
    unit: formatMetricUnit(record.reported.unit, locale),
    originalUnit: record.reported.unit,
    sourceId: source.sourceId,
    sourceLabel: source.title,
    sourceUrl: source.finalResolvedUrl || source.url,
    sourcePageOrSection: record.source.pageOrSection,
    sourcePublicationDate: record.source.publicationDate,
    schemeName: record.scheme.schemeName[locale],
    record,
  };
}

export function latestVerifiedMetrics(
  institutionId: string,
  locale: Locale,
  limit: InstitutionExperienceMetricLimit = 3,
  records: readonly Level3IndicatorRecord[] = productionRecords,
): InstitutionExperienceMetric[] {
  const latestBySeries = new Map<string, Level3IndicatorRecord>();
  for (const record of records) {
    if (record.institutionId !== institutionId || !passesPublicationGates(record)) continue;
    const key = periodGroupKey(record);
    const current = latestBySeries.get(key);
    if (!current || recordPeriodOrder(record)! > recordPeriodOrder(current)!) {
      latestBySeries.set(key, record);
    }
  }

  return [...latestBySeries.values()]
    .sort((a, b) => {
      const orderDifference =
        metricPresentationOrder.indexOf(a.indicatorId) -
        metricPresentationOrder.indexOf(b.indicatorId);
      if (orderDifference !== 0) return orderDifference;
      return periodGroupKey(a).localeCompare(periodGroupKey(b));
    })
    .map((record) => toSnapshotMetric(record, locale))
    .filter((metric): metric is InstitutionExperienceMetric => metric !== null)
    .slice(0, limit);
}

const productionRecords = productionLevel3Values;

export function buildInstitutionSnapshot(
  institution: Institution,
  locale: Locale,
  metricLimit: InstitutionExperienceMetricLimit = 3,
): InstitutionSnapshot {
  const sourcedSystemHighlights = documentedSystemHighlights(institution.id, locale);
  const highlights =
    sourcedSystemHighlights.length > 0
      ? sourcedSystemHighlights
      : highlightPresentationOrder
          .map((field) => verifiedHighlight(institution, field, locale))
          .filter((highlight): highlight is InstitutionSystemHighlight => highlight !== null)
          .slice(0, 3);
  const name = institution.name[locale];
  const profilePath = institutionPath(locale, institution.id);

  return {
    institution,
    locale,
    identity: {
      id: institution.id,
      countryCode: institution.countryCode,
      countryName: institution.countryName[locale],
      name,
      officialEnglishName: institution.name.officialEnglish,
      nativeName: institution.name.nativeName.value,
      abbreviation: institution.institutionAbbreviation,
      membershipStatus: institution.acsicMembershipStatus,
      membershipLabel:
        institution.acsicMembershipStatus === 'observer'
          ? institutionExperienceCopy[locale].observer
          : institutionExperienceCopy[locale].member,
      institutionType: institution.type[locale],
      profilePath,
    },
    roleSummary: institution.summary[locale],
    membershipLabel:
      institution.acsicMembershipStatus === 'observer'
        ? institutionExperienceCopy[locale].observer
        : institutionExperienceCopy[locale].member,
    systemHighlights: highlights,
    latestMetrics: latestVerifiedMetrics(institution.id, locale, metricLimit),
    profilePath,
    officialWebsite: institution.officialWebsite,
  };
}

export function findInstitutionSnapshot(
  institutionId: string,
  locale: Locale,
  metricLimit: InstitutionExperienceMetricLimit = 3,
): InstitutionSnapshot | null {
  const institution = institutions.find((record) => record.id === institutionId);
  return institution ? buildInstitutionSnapshot(institution, locale, metricLimit) : null;
}

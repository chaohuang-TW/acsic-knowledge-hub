import { level2FieldLabels } from '../data/level2-standards';
import type { Institution, InstitutionFilters, Locale, LocalizedText, ReportType } from '../types';

export const DISCLAIMER =
  '本網站為獨立研究平台，不是 ACSIC 或任何會員機構的官方網站。正式引用或決策前，請回到原始官方來源查證。';
export const DISCLAIMER_EN =
  'This independent research platform is not an official website of ACSIC or any member institution. Verify information against the original official sources before formal use.';
export const RESEARCH_LABEL = 'ACSIC Knowledge Hub';
export const MISSING_VALUE = '官方資料未揭露／待查證';
export const COMPARISON_LIMITATION =
  '各機構的法定任務、政策工具、服務對象、統計口徑與資料日期不同；「不適用」、「官方資料未揭露」與「待查證」具有不同意義。本表只協助辨識差異，不評定制度優劣或績效。';
export const COMPARISON_LIMITATION_EN =
  'Institutional mandates, policy tools, target groups, statistical definitions and dates differ. Not applicable, not disclosed and pending verification are distinct states. This comparison does not rank systems or performance.';

export const verificationLabels = {
  verified: '已查證',
  partially_verified: '部分查證',
  pending_verification: '待查證',
} as const;
export const confidenceLabels = { high: '高', medium: '中', low: '低' } as const;
const verificationLabelsEn = {
  verified: 'Verified',
  partially_verified: 'Partially verified',
  pending_verification: 'Pending verification',
} as const;
const confidenceLabelsEn = { high: 'High', medium: 'Medium', low: 'Low' } as const;
const level2Labels = {
  en: {
    complete: 'Complete',
    partial: 'Partial',
    insufficient: 'Insufficient',
    not_assessed: 'Not assessed',
  },
  'zh-TW': {
    complete: '完整',
    partial: '部分完成',
    insufficient: '證據不足',
    not_assessed: '尚未評估',
  },
} as const;

export const defaultFilters: InstitutionFilters = {
  query: '',
  country: '全部',
  type: '全部',
  tag: '全部',
  verification: '全部',
  agriculture: '全部',
  youth: '全部',
  sort: 'newest',
};

export function filterInstitutions(records: Institution[], filters: InstitutionFilters) {
  const query = filters.query.trim().toLocaleLowerCase('zh-Hant-TW');
  return records
    .filter((record) => {
      const searchable = [
        record.name.en,
        record.name['zh-TW'],
        record.name.nativeName.value,
        record.summary.en,
        record.summary['zh-TW'],
        record.institutionAbbreviation,
        record.countryNameZhTw,
        record.countryNameEn,
        record.type.en,
        record.type['zh-TW'],
        record.acsicMembershipStatus,
        ...record.name.aliases,
        ...record.tags,
        ...record.serviceTargets.flatMap((item) => [item.en, item['zh-TW']]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('zh-Hant-TW');
      return (
        (!query || searchable.includes(query)) &&
        (filters.country === '全部' || record.countryNameZhTw === filters.country) &&
        (filters.type === '全部' || record.institutionType === filters.type) &&
        (filters.tag === '全部' || record.tags.includes(filters.tag)) &&
        (filters.verification === '全部' || record.verificationStatus === filters.verification)
      );
    })
    .sort((a, b) =>
      filters.sort === 'name'
        ? a.name['zh-TW'].localeCompare(b.name['zh-TW'], 'zh-Hant-TW')
        : filters.sort === 'oldest'
          ? a.lastVerifiedDate.localeCompare(b.lastVerifiedDate)
          : b.lastVerifiedDate.localeCompare(a.lastVerifiedDate),
    );
}

function isLocalized(value: unknown): value is LocalizedText {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'en' in value &&
    'zh-TW' in value,
  );
}

export function displayValue(value: unknown, locale: Locale = 'zh-TW'): string {
  if (value === null || value === undefined || value === '')
    return locale === 'en'
      ? 'Not disclosed in the reviewed official sources / pending verification'
      : MISSING_VALUE;
  if (isLocalized(value)) return value[locale];
  if (Array.isArray(value))
    return value.length
      ? value.map((item) => displayValue(item, locale)).join(locale === 'en' ? '; ' : '、')
      : locale === 'en'
        ? 'Not disclosed in the reviewed official sources / pending verification'
        : MISSING_VALUE;
  if (value === 'verified' || value === 'partially_verified' || value === 'pending_verification')
    return locale === 'en' ? verificationLabelsEn[value] : verificationLabels[value];
  if (value === 'high' || value === 'medium' || value === 'low')
    return locale === 'en' ? confidenceLabelsEn[value] : confidenceLabels[value];
  if (
    value === 'complete' ||
    value === 'partial' ||
    value === 'insufficient' ||
    value === 'not_assessed'
  )
    return level2Labels[locale][value];
  if (typeof value === 'object')
    return locale === 'en'
      ? 'Structured evidence available in JSON export'
      : '完整結構化證據請參閱 JSON 匯出';
  return String(value);
}

type ComparisonField = {
  label: LocalizedText;
  value: (record: Institution, locale: Locale) => string;
};
const comparisonFieldDefinitions: ComparisonField[] = [
  {
    label: { en: 'Official English name', 'zh-TW': '官方英文名稱' },
    value: (r) => r.name.officialEnglish,
  },
  {
    label: { en: 'Official native-language name', 'zh-TW': '官方原生語言名稱' },
    value: (r, l) =>
      r.name.nativeName.status === 'official'
        ? `${r.name.nativeName.value} (${r.name.nativeName.language})`
        : l === 'en'
          ? 'Pending official-source confirmation'
          : '待官方來源確認',
  },
  {
    label: { en: 'Traditional Chinese name', 'zh-TW': '繁體中文名稱' },
    value: (r) => r.name['zh-TW'],
  },
  { label: { en: 'Institution type', 'zh-TW': '機構類型' }, value: (r, l) => r.type[l] },
  {
    label: { en: 'ACSIC status', 'zh-TW': 'ACSIC 身分' },
    value: (r, l) =>
      r.acsicMembershipStatus === 'member'
        ? l === 'en'
          ? 'Member'
          : '正式會員'
        : l === 'en'
          ? 'Observer'
          : '觀察員',
  },
  {
    label: { en: 'Strict Level 2 status', 'zh-TW': '嚴格 Level 2 狀態' },
    value: (r, l) => displayValue(r.level2Status, l),
  },
  {
    label: { en: 'Level 2 evidence coverage', 'zh-TW': 'Level 2 證據涵蓋率' },
    value: (r) => `${r.level2Completion}%`,
  },
  {
    label: { en: 'Legal basis', 'zh-TW': '法源依據' },
    value: (r, l) => displayValue(r.legalBasis, l),
  },
  {
    label: { en: 'Supervising or oversight relationship', 'zh-TW': '主管、監督或治理關係' },
    value: (r, l) => displayValue(r.supervisingOrOversightAuthority, l),
  },
  {
    label: { en: 'Service targets', 'zh-TW': '服務對象' },
    value: (r, l) => displayValue(r.serviceTargets, l),
  },
  {
    label: { en: 'Major functions', 'zh-TW': '主要功能' },
    value: (r, l) => displayValue(r.majorFunctions, l),
  },
  {
    label: { en: 'Funding or capital basis', 'zh-TW': '資金或資本基礎' },
    value: (r, l) => displayValue(r.fundingOrCapitalBasis, l),
  },
  {
    label: { en: 'Missing applicable fields', 'zh-TW': '缺漏的適用欄位' },
    value: (r, l) =>
      r.missingFields
        .map((field) => (level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[l])
        .join(l === 'en' ? '; ' : '、') || (l === 'en' ? 'None' : '無'),
  },
  {
    label: { en: 'Documented non-applicable fields', 'zh-TW': '正式記錄的不適用欄位' },
    value: (r, l) =>
      r.notApplicableFields
        .map(
          (item) =>
            `${(level2FieldLabels[item.field] ?? { en: item.field, 'zh-TW': item.field })[l]}: ${item.reason[l]}`,
        )
        .join(l === 'en' ? '; ' : '；') || (l === 'en' ? 'None' : '無'),
  },
  {
    label: { en: 'Confidence and rationale', 'zh-TW': '可信度與理由' },
    value: (r, l) =>
      `${displayValue(r.confidenceLevel, l)} (${r.confidenceScore}/100): ${r.confidenceRationale[l]}`,
  },
  {
    label: { en: 'Source numbers', 'zh-TW': '來源編號' },
    value: (r) => r.sourceReferences.map((_, i) => `[${i + 1}]`).join(', '),
  },
  { label: { en: 'Last verified', 'zh-TW': '最後查核日期' }, value: (r) => r.lastVerifiedDate },
];

export function comparisonFieldsFor(locale: Locale): Array<[string, string]> {
  return comparisonFieldDefinitions.map((item) => [item.label[locale], item.label.en]);
}
export const comparisonFields = comparisonFieldsFor('zh-TW');

export function comparisonRows(records: Institution[], locale: Locale) {
  return comparisonFieldDefinitions.map((field) => ({
    key: field.label.en,
    label: field.label[locale],
    values: records.map((record) => field.value(record, locale)),
  }));
}

function sourceText(record: Institution, locale: Locale) {
  return record.sourceReferences
    .map(
      (source, index) =>
        `[${index + 1}] ${source.title} | ${source.url} | ${locale === 'en' ? 'accessed' : '查閱'} ${source.accessedDate} | ${source.originalLanguage}`,
    )
    .join(locale === 'en' ? '; ' : '；');
}
function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function comparisonMarkdown(records: Institution[], locale: Locale = 'zh-TW') {
  const en = locale === 'en';
  const rows = comparisonFieldDefinitions.map(
    (field) =>
      `| ${field.label[locale]} | ${records.map((record) => field.value(record, locale)).join(' | ')} |`,
  );
  return [
    `# ${en ? 'Member Institution Comparison' : '會員機構公開資料比較'}`,
    '',
    `${en ? 'Generated' : '產製日期'}: ${new Date().toISOString().slice(0, 10)}`,
    '',
    en ? DISCLAIMER_EN : DISCLAIMER,
    '',
    `## ${en ? 'Comparison limitations' : '比較限制'}`,
    en ? COMPARISON_LIMITATION_EN : COMPARISON_LIMITATION,
    '',
    `| ${en ? 'Field' : '比較項目'} | ${records.map((record) => record.name[locale]).join(' | ')} |`,
    `| --- | ${records.map(() => '---').join(' | ')} |`,
    ...rows,
    '',
    `## ${en ? 'Official sources' : '官方來源'}`,
    ...records.map((record) => `- ${record.name[locale]}: ${sourceText(record, locale)}`),
  ].join('\n');
}

export function comparisonCsv(records: Institution[], locale: Locale = 'zh-TW') {
  const en = locale === 'en';
  const rows = [
    [
      en ? 'Member Institution Comparison' : '會員機構公開資料比較',
      ...records.map((r) => r.name[locale]),
    ],
    [
      en ? 'Generated' : '產製日期',
      new Date().toISOString().slice(0, 10),
      ...records.slice(1).map(() => ''),
    ],
    [
      en ? 'Comparison limitations' : '比較限制',
      en ? COMPARISON_LIMITATION_EN : COMPARISON_LIMITATION,
      ...records.slice(1).map(() => ''),
    ],
    ...comparisonFieldDefinitions.map((field) => [
      field.label[locale],
      ...records.map((record) => field.value(record, locale)),
    ]),
    [en ? 'Official sources' : '官方來源', ...records.map((record) => sourceText(record, locale))],
    [
      en ? 'Disclaimer' : '非官方聲明',
      en ? DISCLAIMER_EN : DISCLAIMER,
      ...records.slice(1).map(() => ''),
    ],
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

export function comparisonJson(records: Institution[], locale: Locale = 'zh-TW') {
  return JSON.stringify(
    {
      brand: 'ACSIC Knowledge Hub',
      language: locale,
      generatedAt: new Date().toISOString().slice(0, 10),
      comparisonLimitation: locale === 'en' ? COMPARISON_LIMITATION_EN : COMPARISON_LIMITATION,
      disclaimer: locale === 'en' ? DISCLAIMER_EN : DISCLAIMER,
      institutions: records,
    },
    null,
    2,
  );
}

const reportTitles: Record<Locale, Record<ReportType, string>> = {
  en: {
    executive: 'One-page Institution Brief',
    country: 'Country Credit Guarantee System Brief',
    comparison: 'Cross-institution Comparison',
    'meeting-qa': 'Meeting Q&A Draft',
    presentation: 'Presentation Outline',
  },
  'zh-TW': {
    executive: '一頁式機構摘要',
    country: '國別信用保證制度摘要',
    comparison: '跨機構比較',
    'meeting-qa': '國際拜會 Q&A 草案',
    presentation: '簡報大綱',
  },
};

export function generateReport(
  type: ReportType,
  records: Institution[],
  date = new Date(),
  locale: Locale = 'zh-TW',
) {
  const en = locale === 'en';
  const generatedAt = date.toISOString().slice(0, 10);
  const facts = records.flatMap((record) =>
    record.verifiedFacts.map((claim) => {
      const sourceNumbers = claim.sourceEvidenceIds
        .map(
          (evidenceId) =>
            Object.values(record.fieldEvidence)
              .flat()
              .find((evidence) => evidence.evidenceId === evidenceId)?.sourceId,
        )
        .map((sourceId) =>
          record.sourceReferences.findIndex((source) => source.sourceId === sourceId),
        )
        .filter((index) => index >= 0)
        .map((index) => `[${record.institutionAbbreviation}-${index + 1}]`);
      return `- ${record.name[locale]}: ${claim.statement[locale]}${sourceNumbers.length ? ` ${[...new Set(sourceNumbers)].join(', ')}` : ''}`;
    }),
  );
  const pending = records.flatMap((record) =>
    record.pendingItems.map((item) => `- ${record.name[locale]}: ${item[locale]}`),
  );
  const inference = records.flatMap((record) =>
    record.analysisInferences.map((item) => `- ${record.name[locale]}: ${item[locale]}`),
  );
  const sources = records.flatMap((record) =>
    record.sourceReferences.map(
      (source, index) =>
        `- [${record.institutionAbbreviation}-${index + 1}] ${source.title} | ${source.url} | ${source.pageOrSection} | ${en ? 'accessed' : '查閱'} ${source.accessedDate}`,
    ),
  );
  return [
    `# ${reportTitles[locale][type]}`,
    '',
    en ? DISCLAIMER_EN : DISCLAIMER,
    '',
    `${en ? 'Generated' : '產製日期'}: ${generatedAt}`,
    `${en ? 'Selected institutions' : '選取機構'}: ${records.length ? records.map((record) => `${record.name[locale]} (${record.institutionAbbreviation})`).join(en ? ', ' : '、') : en ? 'None' : '未選取'}`,
    '',
    `## ${en ? 'Strict Level 2 status' : '嚴格 Level 2 狀態'}`,
    ...records.map(
      (record) =>
        `- ${record.name[locale]}: ${displayValue(record.level2Status, locale)} (${record.level2Completion}%) — ${record.confidenceRationale[locale]}`,
    ),
    '',
    `## ${en ? 'Verified facts' : '已查證事實'}`,
    ...(facts.length ? facts : [`- ${en ? 'Pending' : '待查證'}`]),
    '',
    `## ${en ? 'Analysis or inference' : '分析或推論'}`,
    ...(inference.length
      ? inference
      : [
          `- ${en ? 'None. Research inference is not generated automatically.' : '無；系統不自動產生研究推論。'}`,
        ]),
    '',
    `## ${en ? 'Pending research' : '待查證事項'}`,
    ...(pending.length ? pending : [`- ${en ? 'None' : '無'}`]),
    '',
    `## ${en ? 'Official sources' : '官方來源'}`,
    ...(sources.length ? sources : [`- ${en ? 'Pending' : '待查證'}`]),
    '',
    `## ${en ? 'Comparison limitations' : '比較限制'}`,
    en ? COMPARISON_LIMITATION_EN : COMPARISON_LIMITATION,
    '',
    `## ${en ? 'Disclaimer' : '免責聲明'}`,
    en ? DISCLAIMER_EN : DISCLAIMER,
  ].join('\n');
}

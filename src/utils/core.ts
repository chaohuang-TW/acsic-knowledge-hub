import type { Institution, InstitutionFilters, Locale, ReportType } from '../types';

export const DISCLAIMER =
  '本網站為獨立研究平台，不是 ACSIC 或任何會員機構的官方網站。正式引用或決策前，請回到原始官方來源查證。';
export const DISCLAIMER_EN =
  'This independent research platform is not an official website of ACSIC or any member institution. Verify information against the original official sources before formal use.';
export const RESEARCH_LABEL = 'ACSIC Knowledge Hub';
export const MISSING_VALUE = '官方資料未揭露';
export const COMPARISON_LIMITATION =
  '各機構的法定任務、政策工具、服務對象、統計口徑與資料日期不同，表格只能協助辨識差異，不能據此直接評定制度優劣或績效。';
export const COMPARISON_LIMITATION_EN =
  'Institutional mandates, policy tools, target groups, statistical definitions and data dates differ. This table supports research comparison but does not rank systems or performance.';

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
        record.summary.en,
        record.summary['zh-TW'],
        record.institutionAbbreviation,
        record.countryNameZhTw,
        record.countryNameEn,
        record.institutionType,
        record.acsicMembershipStatus,
        ...record.tags,
        ...record.serviceTargets,
      ]
        .join(' ')
        .toLocaleLowerCase('zh-Hant-TW');
      return (
        (!query || searchable.includes(query)) &&
        (filters.country === '全部' || record.countryNameZhTw === filters.country) &&
        (filters.type === '全部' || record.institutionType === filters.type) &&
        (filters.tag === '全部' || record.tags.includes(filters.tag)) &&
        (filters.verification === '全部' || record.verificationStatus === filters.verification) &&
        (filters.agriculture === '全部' ||
          (filters.agriculture === '有'
            ? record.agricultureRelatedMeasures.length > 0
            : record.agricultureRelatedMeasures.length === 0)) &&
        (filters.youth === '全部' ||
          (filters.youth === '有'
            ? record.youthFarmerMeasures.length > 0
            : record.youthFarmerMeasures.length === 0))
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

const fieldKeys: Array<keyof Institution> = [
  'institutionNameEn',
  'institutionAbbreviation',
  'institutionType',
  'establishedYear',
  'supervisingAuthority',
  'legalBasis',
  'serviceTargets',
  'guaranteePrograms',
  'guaranteeCoverage',
  'fundingSources',
  'riskSharingModel',
  'governanceStructure',
  'policyTools',
  'agricultureRelatedMeasures',
  'youthFarmerMeasures',
  'acsicMembershipStatus',
  'officialWebsite',
  'lastVerifiedDate',
  'verificationStatus',
  'confidenceLevel',
];
const fieldLabels = {
  en: [
    'Official English name',
    'Abbreviation',
    'Institution type',
    'Established',
    'Supervising authority',
    'Legal basis',
    'Service targets',
    'Guarantee programs or operations',
    'Guarantee coverage',
    'Funding sources',
    'Risk sharing',
    'Governance',
    'Policy tools',
    'Agriculture-related measures',
    'Young farmer measures',
    'ACSIC status',
    'Official website',
    'Last verified',
    'Verification status',
    'Confidence',
  ],
  'zh-TW': [
    '官方英文名稱',
    '簡稱',
    '機構類型',
    '設立年份',
    '主管或監督關係',
    '法源',
    '服務對象',
    '保證方案或業務',
    '保證範圍',
    '資金來源',
    '風險分擔',
    '治理架構',
    '政策工具',
    '農業相關措施',
    '青年農民措施',
    'ACSIC 身分',
    '官方網站',
    '最後查證日期',
    '查證狀態',
    '可信度',
  ],
} as const;

export function comparisonFieldsFor(locale: Locale): Array<[keyof Institution, string]> {
  return fieldKeys.map((key, index) => [key, fieldLabels[locale][index]!]);
}
export const comparisonFields = comparisonFieldsFor('zh-TW');

export function displayValue(
  value: Institution[keyof Institution] | string,
  locale: Locale = 'zh-TW',
): string {
  if (Array.isArray(value))
    return value.length
      ? value.join(locale === 'en' ? '; ' : '、')
      : locale === 'en'
        ? 'Not stated in the official source'
        : MISSING_VALUE;
  if (value === null || value === '')
    return locale === 'en' ? 'Not stated in the official source' : MISSING_VALUE;
  if (value === 'verified' || value === 'partially_verified' || value === 'pending_verification')
    return locale === 'en' ? verificationLabelsEn[value] : verificationLabels[value];
  if (value === 'high' || value === 'medium' || value === 'low')
    return locale === 'en' ? confidenceLabelsEn[value] : confidenceLabels[value];
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
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
  const names = records.map((record) => record.name[locale]);
  const rows = comparisonFieldsFor(locale).map(
    ([key, label]) =>
      `| ${label} | ${records.map((record) => displayValue(record[key], locale)).join(' | ')} |`,
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
    `| ${en ? 'Field' : '比較項目'} | ${names.join(' | ')} |`,
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
      ...records.map((record) => record.name[locale]),
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
    ...comparisonFieldsFor(locale).map(([key, label]) => [
      label,
      ...records.map((record) => displayValue(record[key], locale)),
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
  const latest =
    records
      .map((record) => record.lastVerifiedDate)
      .sort()
      .at(-1) ?? (en ? 'Pending' : '待查證');
  const facts = records.flatMap((record) =>
    record.verifiedFacts.map((fact) => `- ${record.name[locale]}: ${fact}`),
  );
  const inference = records.flatMap((record) =>
    record.analysisInferences.map((item) => `- ${record.name[locale]}: ${item}`),
  );
  const pending = records.flatMap((record) =>
    record.pendingItems.map((item) => `- ${record.name[locale]}: ${item}`),
  );
  return [
    `# ${reportTitles[locale][type]}`,
    '',
    en ? DISCLAIMER_EN : DISCLAIMER,
    '',
    `${en ? 'Generated' : '產製日期'}: ${generatedAt}`,
    `${en ? 'Latest verification date' : '資料最後查證日期'}: ${latest}`,
    `${en ? 'Selected institutions' : '選取機構'}: ${records.length ? records.map((record) => `${record.name[locale]} (${record.institutionAbbreviation})`).join(en ? ', ' : '、') : en ? 'None' : '未選取'}`,
    '',
    `## ${en ? 'Official sources' : '官方來源'}`,
    ...(records.length
      ? records.flatMap((record) =>
          record.sourceReferences.map(
            (source) =>
              `- ${record.institutionAbbreviation} | ${source.title} | ${source.url} | ${source.originalLanguage} | ${en ? 'accessed' : '查閱'} ${source.accessedDate}`,
          ),
        )
      : [`- ${en ? 'Pending' : '待查證'}`]),
    '',
    `## ${en ? 'Verified facts' : '已查證事實'}`,
    ...(facts.length ? facts : [`- ${en ? 'Pending' : '待查證'}`]),
    '',
    `## ${en ? 'Analysis or inference' : '分析或推論'}`,
    ...(inference.length
      ? inference
      : [
          `- ${en ? 'None. The system does not add inference automatically.' : '無，系統不自動補入推論。'}`,
        ]),
    '',
    `## ${en ? 'Pending research' : '待查證事項'}`,
    ...(pending.length ? pending : [`- ${en ? 'None' : '無'}`]),
    '',
    `## ${en ? 'Comparison limitations' : '比較限制'}`,
    en ? COMPARISON_LIMITATION_EN : COMPARISON_LIMITATION,
    '',
    `## ${en ? 'Disclaimer' : '免責聲明'}`,
    en ? DISCLAIMER_EN : DISCLAIMER,
  ].join('\n');
}

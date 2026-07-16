import type { Institution, InstitutionFilters, ReportType } from '../types';

export const DISCLAIMER =
  '本網站為個人研究與 AI 知識管理實驗，並非任何政府機關、基金會、ACSIC 或國際組織的官方網站。內容僅供研究參考，正式引用及決策前應回到原始來源查證。';

export const RESEARCH_LABEL = '官方公開資料研究版';
export const MISSING_VALUE = '官方資料未揭露';
export const COMPARISON_LIMITATION =
  '各機構的法定任務、政策工具、服務對象、統計口徑與資料日期不同；表格只能協助辨識差異，不能據此直接評定制度優劣或績效。';

export const verificationLabels = {
  verified: '已查證',
  partially_verified: '部分查證',
  pending_verification: '待查證',
} as const;

export const confidenceLabels = { high: '高', medium: '中', low: '低' } as const;

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
        record.institutionNameZhTw,
        record.institutionNameEn,
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
    .sort((a, b) => {
      if (filters.sort === 'name')
        return a.institutionNameZhTw.localeCompare(b.institutionNameZhTw, 'zh-Hant-TW');
      return filters.sort === 'oldest'
        ? a.lastVerifiedDate.localeCompare(b.lastVerifiedDate)
        : b.lastVerifiedDate.localeCompare(a.lastVerifiedDate);
    });
}

export const comparisonFields: Array<[keyof Institution, string]> = [
  ['institutionNameEn', '英文名稱'],
  ['institutionAbbreviation', '簡稱'],
  ['institutionType', '機構類型'],
  ['establishedYear', '設立年份'],
  ['supervisingAuthority', '主管或監督關係'],
  ['legalBasis', '法源'],
  ['serviceTargets', '服務對象'],
  ['guaranteePrograms', '保證方案／業務'],
  ['guaranteeCoverage', '保證範圍／成數'],
  ['fundingSources', '資金來源'],
  ['riskSharingModel', '風險分擔'],
  ['governanceStructure', '治理架構'],
  ['policyTools', '政策工具'],
  ['agricultureRelatedMeasures', '農業相關措施'],
  ['youthFarmerMeasures', '青年農民措施'],
  ['acsicMembershipStatus', 'ACSIC 身分'],
  ['lastVerifiedDate', '最後查證日期'],
  ['verificationStatus', '查證狀態'],
  ['confidenceLevel', '可信度'],
];

export function displayValue(value: Institution[keyof Institution]): string {
  if (Array.isArray(value)) return value.length ? value.join('、') : MISSING_VALUE;
  if (value === null || value === '') return MISSING_VALUE;
  if (value === 'verified' || value === 'partially_verified' || value === 'pending_verification')
    return verificationLabels[value];
  if (value === 'high' || value === 'medium' || value === 'low') return confidenceLabels[value];
  return String(value);
}

function sourceText(record: Institution) {
  return record.sourceReferences
    .map(
      (source, index) =>
        `[${index + 1}] ${source.title}｜${source.url}｜查閱 ${source.accessedDate}`,
    )
    .join('；');
}

export function comparisonMarkdown(records: Institution[]) {
  const header = `| 比較項目 | ${records.map((record) => record.institutionNameZhTw).join(' | ')} |`;
  const divider = `| --- | ${records.map(() => '---').join(' | ')} |`;
  const rows = comparisonFields.map(
    ([key, label]) =>
      `| ${label} | ${records.map((record) => displayValue(record[key])).join(' | ')} |`,
  );
  const sources = records.map((record) => `- ${record.institutionNameZhTw}：${sourceText(record)}`);
  return [
    '# 跨機構公開資料比較',
    '',
    `產製日期：${new Date().toISOString().slice(0, 10)}`,
    '',
    DISCLAIMER,
    '',
    '## 比較限制',
    COMPARISON_LIMITATION,
    '',
    header,
    divider,
    ...rows,
    '',
    '## 官方來源',
    ...sources,
  ].join('\n');
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function comparisonCsv(records: Institution[]) {
  const rows = [
    ['跨機構公開資料比較', ...records.map((record) => record.institutionNameZhTw)],
    ['產製日期', new Date().toISOString().slice(0, 10), ...records.slice(1).map(() => '')],
    ['比較限制', COMPARISON_LIMITATION, ...records.slice(1).map(() => '')],
    ...comparisonFields.map(([key, label]) => [
      label,
      ...records.map((record) => displayValue(record[key])),
    ]),
    ['官方來源', ...records.map(sourceText)],
    ['非官方聲明', DISCLAIMER, ...records.slice(1).map(() => '')],
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

export function comparisonJson(records: Institution[]) {
  return JSON.stringify(
    {
      label: RESEARCH_LABEL,
      generatedAt: new Date().toISOString().slice(0, 10),
      comparisonLimitation: COMPARISON_LIMITATION,
      disclaimer: DISCLAIMER,
      institutions: records,
    },
    null,
    2,
  );
}

const reportTitles: Record<ReportType, string> = {
  executive: '一頁式機構摘要',
  country: '國別信用保證制度摘要',
  comparison: '跨機構比較',
  'meeting-qa': '國際拜會 Q&A 草案',
  presentation: '簡報大綱',
};

export function generateReport(type: ReportType, records: Institution[], date = new Date()) {
  const generatedAt = date.toISOString().slice(0, 10);
  const latest =
    records
      .map((record) => record.lastVerifiedDate)
      .sort()
      .at(-1) ?? '待查證';
  const facts = records.flatMap((record) =>
    record.verifiedFacts.map((fact) => `- ${record.institutionNameZhTw}：${fact}`),
  );
  const inferences = records.flatMap((record) =>
    record.analysisInferences.map((item) => `- ${record.institutionNameZhTw}：${item}`),
  );
  const pending = records.flatMap((record) =>
    record.pendingItems.map((item) => `- ${record.institutionNameZhTw}：${item}`),
  );
  const purpose: Record<ReportType, string> = {
    executive: '以一頁式結構整理所選機構的定位、已查證事實、來源與缺口。',
    country: '依國別彙整信用保證制度參與機構，保留機構功能差異。',
    comparison: '以一致欄位比較二至四個機構，並明示資料與口徑限制。',
    'meeting-qa': '把官方已知事項與待確認問題分開，形成國際拜會準備草案。',
    presentation: '把公開來源、制度事實、比較限制與待查證事項整理為簡報順序。',
  };
  return [
    `# ${reportTitles[type]}`,
    '',
    DISCLAIMER,
    '',
    `產製日期：${generatedAt}`,
    `資料最後查證日期：${latest}`,
    `選取機構：${records.length ? records.map((r) => `${r.institutionNameZhTw}（${r.institutionAbbreviation}）`).join('、') : '未選取'}`,
    '',
    '## 使用目的',
    purpose[type],
    '',
    '## 官方來源',
    ...(records.length
      ? records.flatMap((record) =>
          record.sourceReferences.map(
            (source) =>
              `- ${record.institutionAbbreviation}｜${source.title}｜${source.url}｜查閱 ${source.accessedDate}`,
          ),
        )
      : ['- 待查證']),
    '',
    '## 已查證事實',
    ...(facts.length ? facts : ['- 待查證']),
    '',
    '## 分析／推論',
    ...(inferences.length ? inferences : ['- 無；系統不自動補入推論。']),
    '',
    '## 待查證事項',
    ...(pending.length ? pending : ['- 無。']),
    '',
    '## 比較限制',
    COMPARISON_LIMITATION,
    '',
    '## 免責聲明',
    DISCLAIMER,
  ].join('\n');
}

import type { Institution, InstitutionFilters, ReportType } from '../types';

export const DISCLAIMER =
  '本網站為個人 AI 知識管理與介面設計實驗，並非任何政府機關、基金會或國際組織的官方網站。展示資料不構成政策、金融或法律建議。';

export const DEMO_NOTICE = 'DEMO 示範資料';

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

export function filterInstitutions(
  records: Institution[],
  filters: InstitutionFilters,
): Institution[] {
  const query = filters.query.trim().toLocaleLowerCase('zh-Hant-TW');
  return records
    .filter((record) => {
      const searchable = [
        record.institutionName,
        record.countryName,
        record.institutionType,
        ...record.tags,
        ...record.serviceTargets,
      ]
        .join(' ')
        .toLocaleLowerCase('zh-Hant-TW');
      return (
        (!query || searchable.includes(query)) &&
        (filters.country === '全部' || record.countryName === filters.country) &&
        (filters.type === '全部' || record.institutionType === filters.type) &&
        (filters.tag === '全部' || record.tags.includes(filters.tag)) &&
        (filters.verification === '全部' || record.verificationStatus === filters.verification) &&
        (filters.agriculture === '全部' ||
          (filters.agriculture === '有'
            ? record.agricultureMeasures.length > 0
            : record.agricultureMeasures.length === 0)) &&
        (filters.youth === '全部' ||
          (filters.youth === '有'
            ? record.youthFarmerMeasures.length > 0
            : record.youthFarmerMeasures.length === 0))
      );
    })
    .sort((a, b) => {
      if (filters.sort === 'name')
        return a.institutionName.localeCompare(b.institutionName, 'zh-Hant-TW');
      return filters.sort === 'oldest'
        ? a.updatedAt.localeCompare(b.updatedAt)
        : b.updatedAt.localeCompare(a.updatedAt);
    });
}

export const comparisonFields: Array<[keyof Institution, string]> = [
  ['serviceTargets', '服務對象'],
  ['institutionType', '機構類型'],
  ['guaranteeCoverage', '保證範圍'],
  ['fundingSources', '資金來源'],
  ['riskSharing', '風險分擔'],
  ['governanceModel', '治理模式'],
  ['agricultureMeasures', '農業措施'],
  ['youthFarmerMeasures', '青年農民措施'],
  ['verificationStatus', '查證狀態'],
  ['confidenceLevel', '資料可信度'],
];

function displayValue(value: Institution[keyof Institution]): string {
  if (Array.isArray(value)) return value.length ? value.join('、') : '不適用或尚無資料';
  return String(value);
}

export function comparisonMarkdown(records: Institution[]): string {
  const header = `| 比較項目 | ${records.map((record) => record.institutionName).join(' | ')} |`;
  const divider = `| --- | ${records.map(() => '---').join(' | ')} |`;
  const rows = comparisonFields.map(
    ([key, label]) =>
      `| ${label} | ${records.map((record) => displayValue(record[key])).join(' | ')} |`,
  );
  return [`# DEMO 跨機構比較`, '', DISCLAIMER, '', header, divider, ...rows].join('\n');
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function comparisonCsv(records: Institution[]): string {
  const rows = [
    ['DEMO 跨機構比較', ...records.map((record) => record.institutionName)],
    ['非官方聲明', DISCLAIMER, ...records.slice(1).map(() => '')],
    ...comparisonFields.map(([key, label]) => [
      label,
      ...records.map((record) => displayValue(record[key])),
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

export function comparisonJson(records: Institution[]): string {
  return JSON.stringify(
    {
      label: DEMO_NOTICE,
      disclaimer: DISCLAIMER,
      generatedAt: new Date().toISOString().slice(0, 10),
      institutions: records,
    },
    null,
    2,
  );
}

const reportTitles: Record<ReportType, string> = {
  executive: '一頁式高階摘要',
  country: '國別制度報告',
  comparison: '跨機構比較報告',
  'meeting-qa': '國際拜會 Q&A',
  presentation: '簡報大綱',
};

export function generateReport(
  type: ReportType,
  records: Institution[],
  date = new Date(),
): string {
  const generatedAt = date.toISOString().slice(0, 10);
  const latest =
    records
      .map((record) => record.updatedAt)
      .sort()
      .at(-1) ?? '待查證';
  const facts = records.flatMap((record) =>
    record.facts.map((fact) => `- ${record.institutionName}：${fact}`),
  );
  const inferences = records.flatMap((record) =>
    record.inferences.map((item) => `- ${record.institutionName}：${item}`),
  );
  const pending = records.flatMap((record) =>
    record.pending.map((item) => `- ${record.institutionName}：${item}`),
  );
  const purpose: Record<ReportType, string> = {
    executive: '以短篇幅整理制度重點、來源與待確認事項。',
    country: '以單一虛構國家為單位呈現制度欄位與來源。',
    comparison: '以一致欄位比較二至四筆示範機構資料。',
    'meeting-qa': '把已知內容、推論與待問事項轉為拜會準備架構。',
    presentation: '把資料治理與制度比較整理為簡報頁面順序。',
  };
  return [
    `# DEMO ${reportTitles[type]}`,
    '',
    DISCLAIMER,
    '',
    `產製日期：${generatedAt}`,
    `資料最後更新日期：${latest}`,
    '',
    '## 使用目的',
    purpose[type],
    '',
    '## 已查證事實（示範）',
    ...(facts.length ? facts : ['- 待查證']),
    '',
    '## 分析推論（示範）',
    ...(inferences.length ? inferences : ['- 無，不自動補填。']),
    '',
    '## 待查證事項',
    ...(pending.length ? pending : ['- 無。']),
    '',
    '## 示範來源',
    ...records.flatMap((record) =>
      record.sources.map((source) => `- ${source.title}｜${source.sourceType}｜${source.url}`),
    ),
  ].join('\n');
}

import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import { useLocale } from '../../i18n';
import type { Locale, ReportType } from '../../types';
import { generateReport } from '../../utils/core';

const options: Record<Locale, Array<[ReportType, string, string]>> = {
  en: [
    [
      'executive',
      'One-page institution brief',
      'Institution role, verified facts, sources and gaps.',
    ],
    ['country', 'Country system brief', 'Institutions and functional differences by country.'],
    [
      'comparison',
      'Cross-institution comparison',
      'Two to four institutions using consistent fields.',
    ],
    ['meeting-qa', 'Meeting Q&A draft', 'Separate confirmed information from questions.'],
    [
      'presentation',
      'Presentation outline',
      'Arrange sources, facts, limitations and research gaps.',
    ],
  ],
  'zh-TW': [
    ['executive', '一頁式機構摘要', '整理機構定位、已查證事實、來源與缺口。'],
    ['country', '國別信用保證制度摘要', '依國別呈現制度參與機構與功能差異。'],
    ['comparison', '跨機構比較', '以一致欄位整理二至四個機構。'],
    ['meeting-qa', '國際拜會 Q&A 草案', '把官方已知事項與待確認問題分開。'],
    ['presentation', '簡報大綱', '把來源、制度事實、限制與待查證事項編排為簡報順序。'],
  ],
};
const ui = {
  en: {
    title: 'Research Reports',
    intro: 'Create bilingual Markdown from governed data without external translation services.',
    settings: 'Template settings',
    type: 'Report type',
    language: 'Report language',
    institutions: 'Select institutions (up to four)',
    note: 'Output separates verified facts, analysis and pending research.',
    preview: 'Markdown preview',
    export: 'Export Markdown',
    empty: 'No institution selected',
    emptyText: 'Select at least one institution. The system will not invent content.',
  },
  'zh-TW': {
    title: '研究報告',
    intro: '由治理資料建立雙語 Markdown，不依賴外部翻譯服務。',
    settings: '範本設定',
    type: '報告類型',
    language: '報告語言',
    institutions: '選擇機構（最多四筆）',
    note: '輸出明確區分已查證事實、分析推論與待查證事項。',
    preview: 'Markdown 預覽',
    export: '匯出 Markdown',
    empty: '尚未選擇機構',
    emptyText: '請至少選擇一個機構，系統不會自動填補內容。',
  },
} as const;

function downloadMarkdown(content: string, type: ReportType, locale: Locale) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `acsic-knowledge-hub-${type}-${locale}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}
export function ReportsPage() {
  const { locale } = useLocale();
  const c = ui[locale];
  const [reportLocale, setReportLocale] = useState<Locale>(locale);
  const [type, setType] = useState<ReportType>('executive');
  const [selectedIds, setSelectedIds] = useState([institutions[0]!.id]);
  const selected = useMemo(
    () => institutions.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );
  const report = useMemo(
    () => generateReport(type, selected, new Date(), reportLocale),
    [reportLocale, selected, type],
  );
  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 4),
    );
  const reportOptions = options[locale];
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="report-layout">
        <section className="report-controls" aria-labelledby="report-settings">
          <h2 id="report-settings">{c.settings}</h2>
          <label>
            <span>{c.type}</span>
            <select
              aria-label={c.type}
              value={type}
              onChange={(event) => setType(event.target.value as ReportType)}
            >
              {reportOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p>{reportOptions.find(([value]) => value === type)?.[2]}</p>
          <label>
            <span>{c.language}</span>
            <select
              aria-label={c.language}
              value={reportLocale}
              onChange={(event) => setReportLocale(event.target.value as Locale)}
            >
              <option value="en">English</option>
              <option value="zh-TW">繁體中文</option>
            </select>
          </label>
          <fieldset>
            <legend>{c.institutions}</legend>
            {institutions.map((record) => (
              <label key={record.id} className="report-record-option">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(record.id)}
                  disabled={!selectedIds.includes(record.id) && selectedIds.length >= 4}
                  onChange={() => toggle(record.id)}
                />
                <span>
                  {record.name[locale]}
                  <small>
                    {locale === 'en' ? record.countryNameEn : record.countryNameZhTw} |{' '}
                    {record.institutionAbbreviation}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="info-note">
            <ResearchBadge />
            <p>{c.note}</p>
          </div>
        </section>
        <section className="report-preview" aria-labelledby="report-preview-title">
          <div className="section-heading-row">
            <h2 id="report-preview-title">{c.preview}</h2>
            <button
              className="button primary"
              disabled={!selected.length}
              onClick={() => downloadMarkdown(report, type, reportLocale)}
            >
              {c.export}
            </button>
          </div>
          {selected.length ? (
            <pre tabIndex={0}>{report}</pre>
          ) : (
            <div className="state-message">
              <h3>{c.empty}</h3>
              <p>{c.emptyText}</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

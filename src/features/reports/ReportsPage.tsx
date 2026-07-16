import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import type { ReportType } from '../../types';
import { generateReport } from '../../utils/core';

const reportOptions: Array<[ReportType, string, string]> = [
  ['executive', '一頁式機構摘要', '整理機構定位、已查證事實、來源與缺口。'],
  ['country', '國別信用保證制度摘要', '依國別呈現制度參與機構與功能差異。'],
  ['comparison', '跨機構比較', '以一致欄位整理二至四個機構。'],
  ['meeting-qa', '國際拜會 Q&A 草案', '把官方已知事項與待確認問題分開。'],
  ['presentation', '簡報大綱', '把來源、制度事實、限制與待查證事項編排為簡報順序。'],
];

function downloadMarkdown(content: string, type: ReportType) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `research-${type}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [type, setType] = useState<ReportType>('executive');
  const [selectedIds, setSelectedIds] = useState([institutions[0]!.id]);
  const selected = useMemo(
    () => institutions.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );
  const report = useMemo(() => generateReport(type, selected), [type, selected]);
  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 4),
    );
  return (
    <section className="section-shell page-section">
      <PageHeader
        title="報告範本"
        intro="以規則式範本產生 Markdown，保留官方來源、查證日期、事實、推論、缺口與比較限制。"
      />
      <div className="report-layout">
        <section className="report-controls" aria-labelledby="report-settings">
          <h2 id="report-settings">範本設定</h2>
          <label htmlFor="report-type">
            <span>報告類型</span>
            <select
              id="report-type"
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
            >
              {reportOptions.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <p>{reportOptions.find(([v]) => v === type)?.[2]}</p>
          <fieldset>
            <legend>選擇機構（最多四筆）</legend>
            {institutions.map((r) => (
              <label key={r.id} className="report-record-option">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  disabled={!selectedIds.includes(r.id) && selectedIds.length >= 4}
                  onChange={() => toggle(r.id)}
                />
                <span>
                  {r.institutionNameZhTw}
                  <small>
                    {r.countryNameZhTw}｜{r.institutionAbbreviation}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="info-note">
            <ResearchBadge />
            <p>輸出會明確區分已查證事實、分析／推論及待查證事項。</p>
          </div>
        </section>
        <section className="report-preview" aria-labelledby="report-preview-title">
          <div className="section-heading-row">
            <h2 id="report-preview-title">Markdown 預覽</h2>
            <button
              className="button primary"
              disabled={!selected.length}
              onClick={() => downloadMarkdown(report, type)}
            >
              匯出 Markdown
            </button>
          </div>
          {selected.length ? (
            <pre tabIndex={0}>{report}</pre>
          ) : (
            <div className="state-message">
              <h3>尚未選擇資料</h3>
              <p>請至少選擇一個機構；系統不會自動填補內容。</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

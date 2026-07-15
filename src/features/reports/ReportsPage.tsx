import { useMemo, useState } from 'react';
import { DemoBadge, PageHeader } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import type { ReportType } from '../../types';
import { generateReport } from '../../utils/core';

const reportOptions: Array<[ReportType, string, string]> = [
  ['executive', '一頁式高階摘要', '短篇幅整理制度重點、來源與待確認事項。'],
  ['country', '國別制度報告', '以單一虛構國家呈現制度欄位與來源。'],
  ['comparison', '跨機構比較報告', '以一致欄位整理二至四筆示範資料。'],
  ['meeting-qa', '國際拜會 Q&A', '把已知內容與待問事項轉為拜會準備架構。'],
  ['presentation', '簡報大綱', '把資料治理與制度比較整理為簡報頁面順序。'],
];

function downloadMarkdown(content: string, type: ReportType) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `demo-${type}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [type, setType] = useState<ReportType>('executive');
  const [selectedIds, setSelectedIds] = useState<string[]>([institutions[0]!.id]);
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
        title="報告範本展示"
        intro="以可靠規則產生示範 Markdown，不串接生成式 AI API，也不自動補填缺漏。"
      />
      <div className="report-layout">
        <section className="report-controls" aria-labelledby="report-settings">
          <h2 id="report-settings">範本設定</h2>
          <label htmlFor="report-type">
            <span>報告類型</span>
            <select
              id="report-type"
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
          <fieldset>
            <legend>選擇示範資料（最多四筆）</legend>
            {institutions.map((record) => (
              <label key={record.id} className="report-record-option">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(record.id)}
                  disabled={!selectedIds.includes(record.id) && selectedIds.length >= 4}
                  onChange={() => toggle(record.id)}
                />
                <span>
                  {record.institutionName}
                  <small>{record.countryName}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="info-note">
            <DemoBadge />
            <p>報告會顯示產製日期、資料最後更新日期、事實、推論、待查證事項與示範來源。</p>
          </div>
        </section>
        <section className="report-preview" aria-labelledby="report-preview-title">
          <div className="section-heading-row">
            <h2 id="report-preview-title">Markdown 預覽</h2>
            <button
              className="button primary"
              disabled={selected.length === 0}
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
              <p>請至少選擇一筆 DEMO 示範資料。系統不會自動填補內容。</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

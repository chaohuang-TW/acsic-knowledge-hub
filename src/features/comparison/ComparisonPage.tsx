import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import {
  COMPARISON_LIMITATION,
  comparisonCsv,
  comparisonFields,
  comparisonJson,
  comparisonMarkdown,
  displayValue,
} from '../../utils/core';

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ComparisonPage() {
  const [selectedIds, setSelectedIds] = useState(institutions.slice(0, 2).map((item) => item.id));
  const selected = useMemo(
    () => institutions.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );
  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 4
          ? [...current, id]
          : current,
    );
  return (
    <section className="section-shell page-section">
      <PageHeader
        title="跨機構比較"
        intro="選擇二至四個真實機構，以一致欄位檢視差異，並同步保留來源、日期與查證狀態。"
      />
      <div className="comparison-picker">
        <div className="section-heading-row">
          <h2>選擇機構</h2>
          <span>{selected.length} / 4 筆</span>
        </div>
        <div className="selector-grid">
          {institutions.map((record) => (
            <label key={record.id} className="selector-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(record.id)}
                disabled={!selectedIds.includes(record.id) && selectedIds.length >= 4}
                onChange={() => toggle(record.id)}
              />
              <span>
                <ResearchBadge />
                <strong>{record.institutionNameZhTw}</strong>
                <small>
                  {record.countryNameZhTw}｜{record.institutionAbbreviation}
                </small>
              </span>
            </label>
          ))}
        </div>
      </div>
      {selected.length < 2 ? (
        <div className="state-message" role="status">
          <h2>請至少選擇兩筆資料</h2>
          <p>比較表最多同時呈現四個機構。</p>
        </div>
      ) : (
        <section className="comparison-result" aria-labelledby="comparison-title">
          <div className="section-heading-row">
            <h2 id="comparison-title">公開資料比較表</h2>
            <div className="button-row export-buttons">
              <button
                className="button secondary"
                onClick={() =>
                  download(
                    'institution-comparison.md',
                    comparisonMarkdown(selected),
                    'text/markdown',
                  )
                }
              >
                匯出 Markdown
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  download('institution-comparison.csv', comparisonCsv(selected), 'text/csv')
                }
              >
                匯出 CSV
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  download(
                    'institution-comparison.json',
                    comparisonJson(selected),
                    'application/json',
                  )
                }
              >
                匯出 JSON
              </button>
            </div>
          </div>
          <p className="table-note">
            <strong>比較限制：</strong>
            {COMPARISON_LIMITATION}
          </p>
          <div className="table-scroll" tabIndex={0} aria-label="跨機構比較表，可水平捲動">
            <table>
              <thead>
                <tr>
                  <th scope="col">比較項目</th>
                  {selected.map((r) => (
                    <th scope="col" key={r.id}>
                      {r.institutionNameZhTw}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map(([key, label]) => (
                  <tr key={String(key)}>
                    <th scope="row">{label}</th>
                    {selected.map((r) => (
                      <td key={r.id}>{displayValue(r[key])}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">來源與編號</th>
                  {selected.map((r) => (
                    <td key={r.id}>
                      {r.sourceReferences.map((s, i) => (
                        <div key={s.id}>
                          [{i + 1}]{' '}
                          <a href={s.url} target="_blank" rel="noreferrer">
                            {s.title}
                          </a>
                          <br />
                          <small>查閱：{s.accessedDate}</small>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}

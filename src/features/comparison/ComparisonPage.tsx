import { useMemo, useState } from 'react';
import { DemoBadge, PageHeader } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import type { Institution } from '../../types';
import {
  comparisonCsv,
  comparisonFields,
  comparisonJson,
  comparisonMarkdown,
} from '../../utils/core';

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function valueText(value: Institution[keyof Institution]) {
  if (Array.isArray(value)) return value.length ? value.join('、') : '不適用或尚無資料';
  return String(value);
}

export function ComparisonPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    institutions.slice(0, 2).map((item) => item.id),
  );
  const selected = useMemo(
    () => institutions.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );
  const toggle = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 4
          ? [...current, id]
          : current,
    );
  };

  return (
    <section className="section-shell page-section">
      <PageHeader title="跨機構比較" intro="選擇二至四筆完全虛構的資料，以相同欄位檢視制度差異。" />
      <div className="comparison-picker">
        <div className="section-heading-row">
          <h2>選擇示範資料</h2>
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
                <DemoBadge />
                <strong>{record.institutionName}</strong>
                <small>{record.countryName}</small>
              </span>
            </label>
          ))}
        </div>
      </div>

      {selected.length < 2 ? (
        <div className="state-message" role="status">
          <h2>請至少選擇兩筆資料</h2>
          <p>比較表最多可同時呈現四筆 DEMO 示範資料。</p>
        </div>
      ) : (
        <section className="comparison-result" aria-labelledby="comparison-title">
          <div className="section-heading-row">
            <h2 id="comparison-title">DEMO 比較表</h2>
            <div className="button-row export-buttons">
              <button
                className="button secondary"
                onClick={() =>
                  download('demo-comparison.md', comparisonMarkdown(selected), 'text/markdown')
                }
              >
                匯出 Markdown
              </button>
              <button
                className="button secondary"
                onClick={() => download('demo-comparison.csv', comparisonCsv(selected), 'text/csv')}
              >
                匯出 CSV
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  download('demo-comparison.json', comparisonJson(selected), 'application/json')
                }
              >
                匯出 JSON
              </button>
            </div>
          </div>
          <p className="table-note">
            <DemoBadge /> 匯出內容會保留 DEMO 與非官方聲明。
          </p>
          <div className="table-scroll" tabIndex={0} aria-label="跨機構比較表，可水平捲動">
            <table>
              <thead>
                <tr>
                  <th scope="col">比較項目</th>
                  {selected.map((record) => (
                    <th scope="col" key={record.id}>
                      {record.institutionName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map(([key, label]) => (
                  <tr key={String(key)}>
                    <th scope="row">{label}</th>
                    {selected.map((record) => (
                      <td key={record.id}>{valueText(record[key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}

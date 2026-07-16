import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import { useLocale } from '../../i18n';
import type { Locale } from '../../types';
import {
  COMPARISON_LIMITATION,
  COMPARISON_LIMITATION_EN,
  comparisonCsv,
  comparisonFieldsFor,
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
const ui = {
  en: {
    title: 'Compare Member Institutions',
    intro:
      'Select two to four institutions and retain sources, dates, language and verification context.',
    select: 'Select institutions',
    minimum: 'Select at least two institutions',
    maximum: 'The table supports up to four institutions.',
    table: 'Public-data comparison',
    limit: 'Comparison limitations:',
    field: 'Field',
    source: 'Sources',
    accessed: 'Accessed',
    exportLanguage: 'Export language',
    export: 'Export',
  },
  'zh-TW': {
    title: '會員機構比較',
    intro: '選擇二至四個機構，以一致欄位比較並保留來源、日期、語言與查證脈絡。',
    select: '選擇機構',
    minimum: '請至少選擇兩筆資料',
    maximum: '比較表最多同時呈現四個機構。',
    table: '公開資料比較表',
    limit: '比較限制：',
    field: '比較項目',
    source: '來源與編號',
    accessed: '查閱',
    exportLanguage: '匯出語言',
    export: '匯出',
  },
} as const;

export function ComparisonPage() {
  const { locale } = useLocale();
  const c = ui[locale];
  const [exportLocale, setExportLocale] = useState<Locale>(locale);
  const [selectedIds, setSelectedIds] = useState(institutions.slice(0, 2).map((item) => item.id));
  const selected = useMemo(
    () => institutions.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );
  const mixedRoles = new Set(selected.map((item) => item.institutionRoleCategory)).size > 1;
  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 4
          ? [...current, id]
          : current,
    );
  const fileBase = `acsic-knowledge-hub-comparison-${exportLocale}`;
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="comparison-picker">
        <div className="section-heading-row">
          <h2>{c.select}</h2>
          <span>{selected.length} / 4</span>
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
                <strong>{record.name[locale]}</strong>
                <small>
                  {locale === 'en' ? record.countryNameEn : record.countryNameZhTw} |{' '}
                  {record.institutionAbbreviation}
                </small>
              </span>
            </label>
          ))}
        </div>
      </div>
      {selected.length < 2 ? (
        <div className="state-message" role="status">
          <h2>{c.minimum}</h2>
          <p>{c.maximum}</p>
        </div>
      ) : (
        <section className="comparison-result" aria-labelledby="comparison-title">
          <div className="section-heading-row">
            <h2 id="comparison-title">{c.table}</h2>
            <div className="export-toolbar">
              <label>
                <span>{c.exportLanguage}</span>
                <select
                  aria-label={c.exportLanguage}
                  value={exportLocale}
                  onChange={(event) => setExportLocale(event.target.value as Locale)}
                >
                  <option value="en">English</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
              </label>
              <div className="button-row export-buttons">
                <button
                  className="button secondary"
                  onClick={() =>
                    download(
                      `${fileBase}.md`,
                      comparisonMarkdown(selected, exportLocale),
                      'text/markdown',
                    )
                  }
                >
                  {c.export} Markdown
                </button>
                <button
                  className="button secondary"
                  onClick={() =>
                    download(`${fileBase}.csv`, comparisonCsv(selected, exportLocale), 'text/csv')
                  }
                >
                  {c.export} CSV
                </button>
                <button
                  className="button secondary"
                  onClick={() =>
                    download(
                      `${fileBase}.json`,
                      comparisonJson(selected, exportLocale),
                      'application/json',
                    )
                  }
                >
                  {c.export} JSON
                </button>
              </div>
            </div>
          </div>
          <p className="table-note">
            <strong>{c.limit}</strong>
            {locale === 'en' ? COMPARISON_LIMITATION_EN : COMPARISON_LIMITATION}
          </p>
          {mixedRoles && (
            <div className="state-message" role="note">
              <h3>{locale === 'en' ? 'Comparability warning' : '比較限制提醒'}</h3>
              <p>
                {locale === 'en'
                  ? 'The selected institutions have different legal and operational roles. Non-applicable fields must not be used to rank institutional performance.'
                  : '所選機構具有不同法律與業務型態；不適用欄位不得用來評定機構績效或制度優劣。'}
              </p>
            </div>
          )}
          <div className="table-scroll" tabIndex={0} aria-label={c.table}>
            <table>
              <thead>
                <tr>
                  <th scope="col">{c.field}</th>
                  {selected.map((record) => (
                    <th scope="col" key={record.id}>
                      {record.name[locale]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFieldsFor(locale).map(([key, label]) => (
                  <tr key={String(key)}>
                    <th scope="row">{label}</th>
                    {selected.map((record) => (
                      <td key={record.id}>{displayValue(record[key], locale)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">{c.source}</th>
                  {selected.map((record) => (
                    <td key={record.id}>
                      {record.sourceReferences.map((source, index) => (
                        <div key={source.id}>
                          [{index + 1}]{' '}
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.title}
                          </a>
                          <br />
                          <small>
                            {c.accessed}: {source.accessedDate} | {source.originalLanguage}
                          </small>
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

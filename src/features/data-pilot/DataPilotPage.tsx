import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/Layout';
import {
  indicatorById,
  indicatorDictionaryTitle,
  indicatorReadiness,
  pilotIndicatorIds,
  productionLevel3Values,
} from '../../data/indicators';
import { institutions, sourceRegistry } from '../../data/institutions';
import { useLocale } from '../../i18n';
import type { Locale } from '../../types';
import type {
  IndicatorReadinessStatus,
  ProductionVerificationStatus,
} from '../../types/indicators';

const pilotInstitutionIds = ['jfc-jp', 'acgf-tw', 'tsmeg-tw'] as const;

const statusLabels: Record<
  IndicatorReadinessStatus | ProductionVerificationStatus,
  Record<Locale, string>
> = {
  ready: { en: 'Ready', 'zh-TW': '可進入試辦' },
  partially_ready: { en: 'Partially ready', 'zh-TW': '部分準備完成' },
  not_ready: { en: 'Not ready', 'zh-TW': '尚未準備完成' },
  not_applicable: { en: 'Not applicable', 'zh-TW': '不適用' },
  definition_mismatch: { en: 'Definition mismatch', 'zh-TW': '定義不相容' },
  scheme_specific: { en: 'Scheme-specific', 'zh-TW': '特定方案適用' },
  source_unavailable: { en: 'Source unavailable', 'zh-TW': '來源無法取得' },
  requires_manual_review: { en: 'Requires manual review', 'zh-TW': '需人工複核' },
  verified: { en: 'Verified', 'zh-TW': '已查證' },
  verified_with_limitation: {
    en: 'Verified with limitation',
    'zh-TW': '已查證但有限制',
  },
  not_disclosed: { en: 'Not disclosed', 'zh-TW': '官方未揭露' },
};

const copy = {
  en: {
    title: 'Verified Data Pilot',
    intro:
      'Trace each published value from an official source through definition mapping and normalization to a governed Level 3 indicator.',
    boundary: 'Pilot boundary',
    boundaryText:
      'Twelve official records cover JFC, ACGF and TSMEG only. Missing values remain governed readiness outcomes; no USD conversion, chart or performance ranking is produced.',
    records: 'production records',
    readiness: 'indicator readiness decisions',
    institutions: 'pilot institutions',
    dictionary: 'Dictionary',
    institution: 'Institution',
    indicator: 'Indicator',
    all: 'All',
    exportJson: 'Export pilot JSON',
    exportCsv: 'Export readiness CSV',
    officialLabel: 'Official reported label',
    reportedValue: 'Reported value',
    originalCurrency: 'Original currency',
    period: 'Reporting period',
    scheme: 'Scheme',
    normalized: 'Normalized interpretation',
    comparability: 'Comparability',
    source: 'Official source',
    page: 'Page / section',
    verifiedDate: 'Verification date',
    viewProvenance: 'View provenance',
    officialSource: 'Official source',
    sourceLocation: 'Page / table',
    reported: 'Reported value',
    mapping: 'Definition mapping',
    normalization: 'Normalization',
    hubIndicator: 'Knowledge Hub indicator',
    derived: 'Derived from official list',
    openSource: 'Open official source',
    readinessTitle: 'Indicator-level readiness',
    readinessIntro:
      'Twenty-one decisions are required; readiness does not imply that every cell must contain a number.',
    sourceAvailable: 'Official source',
    definitionCompatible: 'Definition compatible',
    periodAvailable: 'Period available',
    productionEligible: 'Production eligible',
    reason: 'Reason',
    yes: 'Yes',
    no: 'No',
    comparisonTitle: 'Pilot comparison guard',
    comparisonUnavailable: 'Comparison unavailable due to definition mismatch.',
    periodWarning: 'Period mismatch — values are shown for individual reference only.',
    currencyWarning:
      'JPY and TWD monetary values are never placed on one shared chart and are not converted to USD.',
    conceptWarning:
      'Annual flows, year-end stocks, beneficiary populations and contributed capital remain separate concepts.',
    noChart: 'No chart is displayed because the current records do not pass every comparison gate.',
    manualReview: 'Manual review gate',
    gatesPassed: 'Research, schema, source and comparability review passed.',
  },
  'zh-TW': {
    title: '官方量化資料試辦',
    intro: '每筆發布數值皆可由官方來源，經定義對映與標準化程序，追溯至治理後的 Level 3 指標。',
    boundary: '試辦邊界',
    boundaryText:
      '12 筆官方資料僅涵蓋 JFC、ACGF 與 TSMEG。缺漏維持治理狀態；不轉換美元、不建立圖表或績效排名。',
    records: '筆 production 資料',
    readiness: '格指標準備度判斷',
    institutions: '家試辦機構',
    dictionary: '指標字典',
    institution: '機構',
    indicator: '指標',
    all: '全部',
    exportJson: '匯出試辦 JSON',
    exportCsv: '匯出準備度 CSV',
    officialLabel: '官方原始欄位名稱',
    reportedValue: '官方原始值',
    originalCurrency: '原始幣別',
    period: '報告期間',
    scheme: '方案',
    normalized: '標準化解讀',
    comparability: '可比性',
    source: '官方來源',
    page: '頁碼／章節',
    verifiedDate: '查證日期',
    viewProvenance: '檢視資料來源鏈',
    officialSource: '官方來源',
    sourceLocation: '頁碼／表格',
    reported: '官方原始值',
    mapping: '定義對映',
    normalization: '標準化',
    hubIndicator: 'Knowledge Hub 指標',
    derived: '由官方名單衍生',
    openSource: '開啟官方來源',
    readinessTitle: '指標層級準備度',
    readinessIntro: '必須完成 21 格獨立判斷；準備度不代表每一格都必須有數值。',
    sourceAvailable: '有官方來源',
    definitionCompatible: '定義相容',
    periodAvailable: '有完整期間',
    productionEligible: '可進 production',
    reason: '判斷理由',
    yes: '是',
    no: '否',
    comparisonTitle: '試辦比較限制',
    comparisonUnavailable: '因統計定義不一致，無法直接比較。',
    periodWarning: '報告期間不同，數值僅供個別參考。',
    currencyWarning: 'JPY 與 TWD 金額不放在同一圖表，亦不自動轉換為美元。',
    conceptWarning: '年度流量、年末存量、受益對象與捐助資本維持不同概念。',
    noChart: '目前資料未通過全部比較門檻，因此不顯示圖表。',
    manualReview: '人工複核 Gate',
    gatesPassed: '研究、資料契約、來源及可比性複核均已通過。',
  },
} as const;

function formatNumber(value: number | null, locale: Locale) {
  if (value === null) return locale === 'en' ? 'Official list' : '官方名單';
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'zh-TW', {
    maximumFractionDigits: 3,
  }).format(value);
}

function downloadFile(filename: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string | number | boolean) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function DataPilotPage() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [indicatorFilter, setIndicatorFilter] = useState('all');
  const records = useMemo(
    () =>
      productionLevel3Values.filter(
        (record) =>
          (institutionFilter === 'all' || record.institutionId === institutionFilter) &&
          (indicatorFilter === 'all' || record.indicatorId === indicatorFilter),
      ),
    [indicatorFilter, institutionFilter],
  );
  const institutionName = (id: string) =>
    institutions.find((institution) => institution.id === id)?.name[locale] ?? id;
  const indicatorName = (id: string) => indicatorById.get(id)?.name[locale] ?? id;

  const exportJson = () =>
    downloadFile(
      `acsic-level3-pilot-v1-${locale}.json`,
      JSON.stringify(
        {
          dictionary: indicatorDictionaryTitle,
          exportedLocale: locale,
          records: productionLevel3Values,
        },
        null,
        2,
      ),
      'application/json',
    );

  const exportReadiness = () => {
    const header = [
      c.institution,
      c.indicator,
      'Status',
      c.sourceAvailable,
      c.definitionCompatible,
      c.periodAvailable,
      c.productionEligible,
      c.reason,
    ];
    const rows = indicatorReadiness.map((item) => [
      institutionName(item.institutionId),
      indicatorName(item.indicatorId),
      statusLabels[item.status][locale],
      item.officialSourceAvailable ? c.yes : c.no,
      item.definitionCompatible ? c.yes : c.no,
      item.periodAvailable ? c.yes : c.no,
      item.productionEligible ? c.yes : c.no,
      item.reason[locale],
    ]);
    downloadFile(
      `acsic-level3-readiness-v1-${locale}.csv`,
      [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n'),
      'text/csv;charset=utf-8',
    );
  };

  return (
    <section className="section-shell page-section data-pilot-page">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="research-notice" role="note">
        <strong>{c.boundary}</strong>
        <p>{c.boundaryText}</p>
      </div>

      <div className="pilot-summary" aria-label={c.boundary}>
        <div>
          <strong>{productionLevel3Values.length}</strong>
          <span>{c.records}</span>
        </div>
        <div>
          <strong>{indicatorReadiness.length}</strong>
          <span>{c.readiness}</span>
        </div>
        <div>
          <strong>{pilotInstitutionIds.length}</strong>
          <span>{c.institutions}</span>
        </div>
        <div>
          <strong>v1.0</strong>
          <span>{c.dictionary}</span>
        </div>
      </div>

      <div className="pilot-toolbar">
        <label>
          <span>{c.institution}</span>
          <select
            aria-label={c.institution}
            value={institutionFilter}
            onChange={(event) => setInstitutionFilter(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {pilotInstitutionIds.map((id) => (
              <option key={id} value={id}>
                {institutionName(id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{c.indicator}</span>
          <select
            aria-label={c.indicator}
            value={indicatorFilter}
            onChange={(event) => setIndicatorFilter(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {pilotIndicatorIds.map((id) => (
              <option key={id} value={id}>
                {indicatorName(id)}
              </option>
            ))}
          </select>
        </label>
        <div className="button-row">
          <button className="button secondary" type="button" onClick={exportJson}>
            {c.exportJson}
          </button>
          <button className="button secondary" type="button" onClick={exportReadiness}>
            {c.exportCsv}
          </button>
        </div>
      </div>

      <div className="pilot-records" aria-live="polite">
        {records.map((record) => {
          const source = sourceRegistry.find((item) => item.sourceId === record.source.sourceId)!;
          const scheme =
            record.scheme.schemeName[locale] ??
            (record.scheme.schemeSpecific
              ? statusLabels.scheme_specific[locale]
              : locale === 'en'
                ? 'Institution-wide reported value'
                : '機構整體公布值');
          return (
            <article className="pilot-record-card" key={record.recordId}>
              <div className="record-title">
                <div>
                  <span className="eyebrow">
                    {institutionName(record.institutionId)} · {record.reported.periodLabel}
                  </span>
                  <h2>{indicatorName(record.indicatorId)}</h2>
                </div>
                <span className="data-status">
                  {statusLabels[record.verificationStatus][locale]}
                </span>
              </div>
              <dl className="pilot-record-grid">
                <div>
                  <dt>{c.officialLabel}</dt>
                  <dd lang={source.originalLanguage}>{record.reported.label}</dd>
                </div>
                <div>
                  <dt>{c.reportedValue}</dt>
                  <dd className="reported-number">
                    {formatNumber(record.reported.value, locale)} {record.reported.unit}
                  </dd>
                </div>
                <div>
                  <dt>{c.originalCurrency}</dt>
                  <dd>{record.reported.currency ?? '—'}</dd>
                </div>
                <div>
                  <dt>{c.period}</dt>
                  <dd>
                    {record.reported.periodLabel}
                    {record.period.asOfDate ? ` · ${record.period.asOfDate}` : ''}
                  </dd>
                </div>
                <div>
                  <dt>{c.scheme}</dt>
                  <dd>{scheme}</dd>
                </div>
                <div>
                  <dt>{c.normalized}</dt>
                  <dd>
                    {formatNumber(record.normalized.value, locale)} {record.normalized.unit}
                    <small>{record.normalized.notes[locale]}</small>
                  </dd>
                </div>
                <div>
                  <dt>{c.comparability}</dt>
                  <dd>
                    {record.comparability.status.replaceAll('_', ' ')}
                    <small>{record.comparability.issues[locale].join(' ')}</small>
                  </dd>
                </div>
                <div>
                  <dt>{c.source}</dt>
                  <dd>{source.title}</dd>
                </div>
                <div>
                  <dt>{c.page}</dt>
                  <dd>{record.source.pageOrSection}</dd>
                </div>
                <div>
                  <dt>{c.verifiedDate}</dt>
                  <dd>{record.source.verifiedDate}</dd>
                </div>
              </dl>

              <details className="provenance-viewer">
                <summary>{c.viewProvenance}</summary>
                <ol>
                  <li>
                    <strong>{c.officialSource}</strong>
                    <span>{source.title}</span>
                  </li>
                  <li>
                    <strong>{c.sourceLocation}</strong>
                    <span>
                      {record.source.pageOrSection}
                      {record.source.tableOrFigure ? ` · ${record.source.tableOrFigure}` : ''}
                    </span>
                  </li>
                  <li>
                    <strong>{c.reported}</strong>
                    <span>
                      {record.reported.label}: {formatNumber(record.reported.value, locale)}{' '}
                      {record.reported.unit}
                    </span>
                  </li>
                  <li>
                    <strong>{c.mapping}</strong>
                    <span>{record.reported.definition[locale]}</span>
                  </li>
                  <li>
                    <strong>{c.normalization}</strong>
                    <span>{record.normalized.method}</span>
                  </li>
                  <li>
                    <strong>{c.hubIndicator}</strong>
                    <span>{indicatorName(record.normalized.indicatorId)} · v1.0</span>
                  </li>
                </ol>
                {record.derivation.isDerived && (
                  <p className="derived-note">
                    <strong>{c.derived}:</strong> {record.derivation.calculation}
                  </p>
                )}
                <p>
                  <strong>{c.manualReview}:</strong> {c.gatesPassed}
                </p>
                <a className="button secondary" href={source.url} target="_blank" rel="noreferrer">
                  {c.openSource}
                </a>
              </details>
            </article>
          );
        })}
      </div>

      <section className="comparison-guard" aria-labelledby="comparison-guard-title">
        <h2 id="comparison-guard-title">{c.comparisonTitle}</h2>
        <p>
          <strong>{c.comparisonUnavailable}</strong>
        </p>
        <ul>
          <li>{c.periodWarning}</li>
          <li>{c.currencyWarning}</li>
          <li>{c.conceptWarning}</li>
        </ul>
        <p>{c.noChart}</p>
      </section>

      <section className="readiness-section">
        <h2>{c.readinessTitle}</h2>
        <p>{c.readinessIntro}</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{c.institution}</th>
                <th>{c.indicator}</th>
                <th>Status</th>
                <th>{c.sourceAvailable}</th>
                <th>{c.definitionCompatible}</th>
                <th>{c.periodAvailable}</th>
                <th>{c.productionEligible}</th>
                <th>{c.reason}</th>
              </tr>
            </thead>
            <tbody>
              {indicatorReadiness.map((item) => (
                <tr key={`${item.institutionId}-${item.indicatorId}`}>
                  <th scope="row">{institutionName(item.institutionId)}</th>
                  <td>{indicatorName(item.indicatorId)}</td>
                  <td>
                    <span className="data-status">{statusLabels[item.status][locale]}</span>
                  </td>
                  <td>{item.officialSourceAvailable ? c.yes : c.no}</td>
                  <td>{item.definitionCompatible ? c.yes : c.no}</td>
                  <td>{item.periodAvailable ? c.yes : c.no}</td>
                  <td>{item.productionEligible ? c.yes : c.no}</td>
                  <td>{item.reason[locale]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

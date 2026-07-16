import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import type { Institution, InstitutionFilters } from '../../types';
import {
  confidenceLabels,
  defaultFilters,
  displayValue,
  filterInstitutions,
  verificationLabels,
} from '../../utils/core';

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'zh-Hant-TW'));
}

function ListValue({ values }: { values: string[] }) {
  return <span>{displayValue(values)}</span>;
}

function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function InstitutionDetail({ record, onClose }: { record: Institution; onClose: () => void }) {
  const details: Array<[string, Institution[keyof Institution]]> = [
    ['英文名稱', record.institutionNameEn],
    ['簡稱', record.institutionAbbreviation],
    ['設立年份', record.establishedYear],
    ['主管或監督關係', record.supervisingAuthority],
    ['法源', record.legalBasis],
    ['服務對象', record.serviceTargets],
    ['保證方案／業務', record.guaranteePrograms],
    ['保證範圍／成數', record.guaranteeCoverage],
    ['資金來源', record.fundingSources],
    ['風險分擔', record.riskSharingModel],
    ['治理架構', record.governanceStructure],
    ['政策工具', record.policyTools],
    ['特別措施', record.specialMeasures],
    ['農業相關措施', record.agricultureRelatedMeasures],
    ['青年農民措施', record.youthFarmerMeasures],
    ['ACSIC 身分', record.acsicMembershipStatus],
  ];
  return (
    <section className="detail-panel" aria-labelledby="detail-title">
      <div className="detail-heading">
        <div>
          <ResearchBadge />
          <h2 id="detail-title">{record.institutionNameZhTw}</h2>
          <p>
            {record.countryNameZhTw}｜{record.institutionType}
          </p>
        </div>
        <button className="button secondary" onClick={onClose}>
          關閉詳細資料
        </button>
      </div>
      <div className="detail-grid">
        {details.map(([label, value]) => (
          <section key={label}>
            <h3>{label}</h3>
            <p>{displayValue(value)}</p>
          </section>
        ))}
      </div>
      <div className="evidence-grid">
        <section>
          <h3>已查證事實</h3>
          <ul>
            {record.verifiedFacts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>分析／推論</h3>
          <ul>
            {record.analysisInferences.length ? (
              record.analysisInferences.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>無；不自動補入推論。</li>
            )}
          </ul>
        </section>
        <section>
          <h3>待查證事項</h3>
          <ul>
            {record.pendingItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="sources-block">
        <h3>官方來源</h3>
        {record.sourceReferences.map((source, index) => (
          <dl key={source.id}>
            <div>
              <dt>來源編號</dt>
              <dd>{index + 1}</dd>
            </div>
            <div>
              <dt>標題</dt>
              <dd>{source.title}</dd>
            </div>
            <div>
              <dt>文件類型</dt>
              <dd>{source.documentType}</dd>
            </div>
            <div>
              <dt>發布者</dt>
              <dd>{source.publisher}</dd>
            </div>
            <div>
              <dt>文件日期</dt>
              <dd>{source.documentDate ?? '官方資料未揭露'}</dd>
            </div>
            <div>
              <dt>章節</dt>
              <dd>{source.section}</dd>
            </div>
            <div>
              <dt>查閱日期</dt>
              <dd>{source.accessedDate}</dd>
            </div>
            <div>
              <dt>網址</dt>
              <dd>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.url}
                </a>
              </dd>
            </div>
          </dl>
        ))}
      </section>
    </section>
  );
}

export function InstitutionsPage() {
  const [filters, setFilters] = useState<InstitutionFilters>(defaultFilters);
  const [selected, setSelected] = useState<Institution | null>(null);
  const [viewState, setViewState] = useState<'normal' | 'empty' | 'error'>('normal');
  const filtered = useMemo(
    () => (viewState === 'normal' ? filterInstitutions(institutions, filters) : []),
    [filters, viewState],
  );
  const setFilter = <K extends keyof InstitutionFilters>(key: K, value: InstitutionFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const countries = unique(institutions.map((item) => item.countryNameZhTw));
  const types = unique(institutions.map((item) => item.institutionType));
  const tags = unique(institutions.flatMap((item) => item.tags));

  return (
    <section className="section-shell page-section">
      <PageHeader
        title="公開資料研究庫"
        intro="以一致欄位整理九個真實信用保證及政策金融機構，保留官方來源、查證狀態與資料缺口。"
      />
      <section className="state-demo" aria-label="介面狀態預覽">
        <span>介面狀態預覽</span>
        <div className="segmented-control">
          {(
            [
              ['normal', '正常資料'],
              ['empty', '空資料'],
              ['error', '載入錯誤'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={viewState === value}
              onClick={() => setViewState(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <form className="filter-panel" onSubmit={(event) => event.preventDefault()}>
        <label className="search-field" htmlFor="institution-search">
          <span>關鍵字搜尋</span>
          <input
            id="institution-search"
            type="search"
            value={filters.query}
            placeholder="搜尋機構、國家、簡稱、標籤或服務對象"
            onChange={(event) => setFilter('query', event.target.value)}
          />
        </label>
        <SelectFilter
          id="country"
          label="國家"
          value={filters.country}
          options={['全部', ...countries].map((v) => [v, v])}
          onChange={(v) => setFilter('country', v)}
        />
        <SelectFilter
          id="type"
          label="機構類型"
          value={filters.type}
          options={['全部', ...types].map((v) => [v, v])}
          onChange={(v) => setFilter('type', v)}
        />
        <SelectFilter
          id="tag"
          label="標籤"
          value={filters.tag}
          options={['全部', ...tags].map((v) => [v, v])}
          onChange={(v) => setFilter('tag', v)}
        />
        <SelectFilter
          id="verification"
          label="查證狀態"
          value={filters.verification}
          options={[
            ['全部', '全部'],
            ['verified', '已查證'],
            ['partially_verified', '部分查證'],
            ['pending_verification', '待查證'],
          ]}
          onChange={(v) => setFilter('verification', v)}
        />
        <SelectFilter
          id="agriculture"
          label="農業措施"
          value={filters.agriculture}
          options={['全部', '有', '無'].map((v) => [v, v])}
          onChange={(v) => setFilter('agriculture', v)}
        />
        <SelectFilter
          id="youth"
          label="青年農民措施"
          value={filters.youth}
          options={['全部', '有', '無'].map((v) => [v, v])}
          onChange={(v) => setFilter('youth', v)}
        />
        <label htmlFor="sort">
          <span>排序</span>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value as InstitutionFilters['sort'])}
          >
            <option value="newest">最近查證優先</option>
            <option value="oldest">較早查證優先</option>
            <option value="name">機構名稱排序</option>
          </select>
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => setFilters(defaultFilters)}
        >
          清除篩選
        </button>
      </form>
      {viewState === 'error' ? (
        <div className="state-message" role="alert">
          <h2>公開資料載入失敗</h2>
          <p>這是錯誤狀態預覽；靜態網站不會把錯誤內容傳送至外部服務。</p>
          <button className="button secondary" onClick={() => setViewState('normal')}>
            返回正常資料
          </button>
        </div>
      ) : viewState === 'empty' ? (
        <div className="state-message">
          <h2>目前沒有公開資料</h2>
          <p>這是空資料狀態，用於確認無資料時仍有清楚說明。</p>
          <button className="button secondary" onClick={() => setViewState('normal')}>
            載入公開資料
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="state-message">
          <h2>沒有符合條件的結果</h2>
          <p>請調整搜尋或篩選；系統不會產生內容填補結果。</p>
          <button className="button secondary" onClick={() => setFilters(defaultFilters)}>
            清除篩選
          </button>
        </div>
      ) : (
        <>
          <div className="result-summary" aria-live="polite">
            顯示 {filtered.length} 筆官方公開資料紀錄
          </div>
          <div className="institution-list">
            {filtered.map((record) => (
              <article key={record.id}>
                <div className="record-title">
                  <div>
                    <ResearchBadge />
                    <h2>{record.institutionNameZhTw}</h2>
                    <small>{record.institutionNameEn}</small>
                  </div>
                  <span className={`status status-${record.confidenceLevel}`}>
                    {verificationLabels[record.verificationStatus]}
                  </span>
                </div>
                <p>
                  {record.countryNameZhTw}｜{record.institutionType}｜ACSIC{' '}
                  {record.acsicMembershipStatus}
                </p>
                <dl className="record-summary">
                  <div>
                    <dt>服務對象</dt>
                    <dd>
                      <ListValue values={record.serviceTargets} />
                    </dd>
                  </div>
                  <div>
                    <dt>政策工具</dt>
                    <dd>
                      <ListValue values={record.policyTools} />
                    </dd>
                  </div>
                  <div>
                    <dt>最後查證</dt>
                    <dd>{record.lastVerifiedDate}</dd>
                  </div>
                  <div>
                    <dt>資料可信度</dt>
                    <dd>{confidenceLabels[record.confidenceLevel]}</dd>
                  </div>
                </dl>
                <div className="record-footer">
                  <div className="tag-list">
                    {record.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button className="button secondary" onClick={() => setSelected(record)}>
                    檢視詳細資料
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {selected && <InstitutionDetail record={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

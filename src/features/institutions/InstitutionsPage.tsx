import { useMemo, useState } from 'react';
import { DemoBadge, PageHeader } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import type { Institution, InstitutionFilters } from '../../types';
import { defaultFilters, filterInstitutions } from '../../utils/core';

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'zh-Hant-TW'));
}

function ListValue({ values }: { values: string[] }) {
  return <span>{values.length ? values.join('、') : '不適用或尚無資料'}</span>;
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
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

const sortOptions: Array<{ value: InstitutionFilters['sort']; label: string }> = [
  { value: 'newest', label: '最近更新優先' },
  { value: 'oldest', label: '較早更新優先' },
  { value: 'name', label: '機構名稱排序' },
];

function InstitutionDetail({ record, onClose }: { record: Institution; onClose: () => void }) {
  return (
    <section className="detail-panel" aria-labelledby="detail-title">
      <div className="detail-heading">
        <div>
          <DemoBadge />
          <h2 id="detail-title">{record.institutionName}</h2>
          <p>
            {record.countryName}｜{record.institutionType}
          </p>
        </div>
        <button className="button secondary" onClick={onClose}>
          關閉詳細資料
        </button>
      </div>
      <div className="detail-grid">
        <section>
          <h3>服務對象</h3>
          <p>
            <ListValue values={record.serviceTargets} />
          </p>
        </section>
        <section>
          <h3>保證措施</h3>
          <p>
            <ListValue values={record.guaranteeMeasures} />
          </p>
        </section>
        <section>
          <h3>保證範圍</h3>
          <p>{record.guaranteeCoverage}</p>
        </section>
        <section>
          <h3>資金來源</h3>
          <p>
            <ListValue values={record.fundingSources} />
          </p>
        </section>
        <section>
          <h3>風險分擔</h3>
          <p>{record.riskSharing}</p>
        </section>
        <section>
          <h3>治理模式</h3>
          <p>{record.governanceModel}</p>
        </section>
        <section>
          <h3>農業相關措施</h3>
          <p>
            <ListValue values={record.agricultureMeasures} />
          </p>
        </section>
        <section>
          <h3>青年農民措施</h3>
          <p>
            <ListValue values={record.youthFarmerMeasures} />
          </p>
        </section>
      </div>
      <div className="evidence-grid">
        <section>
          <h3>已查證事實（示範）</h3>
          <ul>
            {record.facts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>分析推論（示範）</h3>
          <ul>
            {record.inferences.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>待查證事項</h3>
          <ul>
            {record.pending.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="sources-block">
        <h3>示範來源</h3>
        {record.sources.map((source) => (
          <dl key={source.id}>
            <div>
              <dt>標題</dt>
              <dd>{source.title}</dd>
            </div>
            <div>
              <dt>來源類型</dt>
              <dd>{source.sourceType}</dd>
            </div>
            <div>
              <dt>發布者</dt>
              <dd>{source.publisher}</dd>
            </div>
            <div>
              <dt>存取日期</dt>
              <dd>{source.accessedDate}</dd>
            </div>
            <div>
              <dt>網址</dt>
              <dd>
                <a href={source.url}>{source.url}</a>
              </dd>
            </div>
            <div>
              <dt>說明</dt>
              <dd>{source.note}</dd>
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
  const [demoState, setDemoState] = useState<'normal' | 'empty' | 'error'>('normal');
  const filtered = useMemo(
    () => (demoState === 'normal' ? filterInstitutions(institutions, filters) : []),
    [filters, demoState],
  );
  const setFilter = <K extends keyof InstitutionFilters>(key: K, value: InstitutionFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const countries = unique(institutions.map((item) => item.countryName));
  const types = unique(institutions.map((item) => item.institutionType));
  const tags = unique(institutions.flatMap((item) => item.tags));

  return (
    <section className="section-shell page-section">
      <PageHeader
        title="示範機構資料庫"
        intro="完全虛構的國家、機構、制度與來源，只用於展示資料架構。"
      />

      <section className="state-demo" aria-label="介面狀態展示">
        <span>介面狀態展示</span>
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
              aria-pressed={demoState === value}
              onClick={() => setDemoState(value)}
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
            placeholder="搜尋機構、國家、標籤或服務對象"
            onChange={(event) => setFilter('query', event.target.value)}
          />
        </label>
        <SelectFilter
          id="country"
          label="國家"
          value={filters.country}
          options={['全部', ...countries]}
          onChange={(value) => setFilter('country', value)}
        />
        <SelectFilter
          id="type"
          label="機構類型"
          value={filters.type}
          options={['全部', ...types]}
          onChange={(value) => setFilter('type', value)}
        />
        <SelectFilter
          id="tag"
          label="標籤"
          value={filters.tag}
          options={['全部', ...tags]}
          onChange={(value) => setFilter('tag', value)}
        />
        <SelectFilter
          id="verification"
          label="查證狀態"
          value={filters.verification}
          options={['全部', '示範已檢核', '示範待複核', '待查證']}
          onChange={(value) => setFilter('verification', value)}
        />
        <SelectFilter
          id="agriculture"
          label="農業措施"
          value={filters.agriculture}
          options={['全部', '有', '無']}
          onChange={(value) => setFilter('agriculture', value)}
        />
        <SelectFilter
          id="youth"
          label="青年農民措施"
          value={filters.youth}
          options={['全部', '有', '無']}
          onChange={(value) => setFilter('youth', value)}
        />
        <label htmlFor="sort">
          <span>排序</span>
          <select
            id="sort"
            value={filters.sort}
            onChange={(event) =>
              setFilter('sort', event.target.value as InstitutionFilters['sort'])
            }
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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

      {demoState === 'error' ? (
        <div className="state-message error-state" role="alert">
          <h2>示範資料載入失敗</h2>
          <p>這是錯誤狀態展示。靜態網站不會把錯誤內容傳送到外部服務。</p>
          <button className="button secondary" onClick={() => setDemoState('normal')}>
            返回正常資料
          </button>
        </div>
      ) : demoState === 'empty' ? (
        <div className="state-message">
          <h2>目前沒有示範資料</h2>
          <p>這是空資料狀態，用於確認介面在資料尚未建立時仍提供清楚說明。</p>
          <button className="button secondary" onClick={() => setDemoState('normal')}>
            載入示範資料
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="state-message">
          <h2>沒有符合條件的結果</h2>
          <p>請調整關鍵字或篩選條件。本網站不會自動產生資料填補結果。</p>
          <button className="button secondary" onClick={() => setFilters(defaultFilters)}>
            清除篩選
          </button>
        </div>
      ) : (
        <>
          <div className="result-summary" aria-live="polite">
            顯示 {filtered.length} 筆 DEMO 示範資料
          </div>
          <div className="institution-list">
            {filtered.map((record) => (
              <article key={record.id}>
                <div className="record-title">
                  <div>
                    <DemoBadge />
                    <h2>{record.institutionName}</h2>
                  </div>
                  <span className={`status status-${record.confidenceLevel}`}>
                    {record.verificationStatus}
                  </span>
                </div>
                <p>
                  {record.countryName}｜{record.institutionType}
                </p>
                <dl className="record-summary">
                  <div>
                    <dt>服務對象</dt>
                    <dd>
                      <ListValue values={record.serviceTargets} />
                    </dd>
                  </div>
                  <div>
                    <dt>保證措施</dt>
                    <dd>
                      <ListValue values={record.guaranteeMeasures} />
                    </dd>
                  </div>
                  <div>
                    <dt>最後更新</dt>
                    <dd>{record.updatedAt}</dd>
                  </div>
                  <div>
                    <dt>資料可信度</dt>
                    <dd>{record.confidenceLevel}</dd>
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

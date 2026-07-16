import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import { useLocale } from '../../i18n';
import type { Institution } from '../../types';
import { displayValue } from '../../utils/core';

const ui = {
  en: {
    title: 'Member Institutions',
    intro:
      'Bilingual research profiles with official names, source provenance, verification status and visible data gaps.',
    states: 'Interface state preview',
    normal: 'Data',
    empty: 'Empty',
    error: 'Error',
    search: 'Search',
    placeholder: 'Search institution, country, abbreviation or summary',
    country: 'Country',
    type: 'Institution type',
    verification: 'Verification',
    all: 'All',
    verified: 'Verified',
    partial: 'Partially verified',
    pending: 'Pending verification',
    agriculture: 'Agriculture measures',
    youth: 'Young farmer measures',
    any: 'Any',
    yes: 'Available',
    no: 'Not recorded',
    clear: 'Clear filters',
    results: 'official institution records',
    noResults: 'No matching results',
    noResultsText:
      'Adjust the search or filters. The system does not generate replacement records.',
    emptyTitle: 'No public records',
    emptyText: 'This preview confirms that the interface explains an empty dataset clearly.',
    errorTitle: 'Public data could not be loaded',
    errorText: 'This is an error-state preview. No content is sent to an external service.',
    return: 'Return to data',
    load: 'Load data',
    details: 'View profile',
    close: 'Close profile',
    service: 'Service targets',
    tools: 'Policy tools',
    verifiedDate: 'Last verified',
    confidence: 'Confidence',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    officialName: 'Official English name',
    translatedName: 'Traditional Chinese name',
    translation: 'Name translation status',
    summary: 'Summary',
    established: 'Established',
    authority: 'Supervising authority',
    legal: 'Legal basis',
    programs: 'Guarantee programs or operations',
    funding: 'Funding sources',
    governance: 'Governance',
    membership: 'ACSIC status',
    website: 'Official website',
    facts: 'Verified facts',
    analysis: 'Analysis or inference',
    pendingItems: 'Pending research',
    sources: 'Official sources',
    publisher: 'Publisher',
    originalLanguage: 'Original language',
    documentDate: 'Document date',
    accessed: 'Accessed',
    section: 'Section',
    missing: 'Not stated in the official source',
    official: 'official',
    research_translation: 'research translation',
    pendingTranslation: 'pending',
    noInference: 'None. The system does not add inference automatically.',
    noItems: 'None recorded.',
  },
  'zh-TW': {
    title: '會員機構',
    intro: '以雙語研究檔案保存官方名稱、來源脈絡、查證狀態與清楚可見的資料缺口。',
    states: '介面狀態預覽',
    normal: '正常資料',
    empty: '空資料',
    error: '載入錯誤',
    search: '關鍵字搜尋',
    placeholder: '搜尋機構、國家、簡稱或摘要',
    country: '國家',
    type: '機構類型',
    verification: '查證狀態',
    all: '全部',
    verified: '已查證',
    partial: '部分查證',
    pending: '待查證',
    agriculture: '農業措施',
    youth: '青年農民措施',
    any: '全部',
    yes: '有',
    no: '無',
    clear: '清除篩選',
    results: '筆官方機構紀錄',
    noResults: '沒有符合條件的結果',
    noResultsText: '請調整搜尋或篩選，系統不會產生內容填補結果。',
    emptyTitle: '目前沒有公開資料',
    emptyText: '這是空資料狀態，用於確認無資料時仍有清楚說明。',
    errorTitle: '公開資料載入失敗',
    errorText: '這是錯誤狀態預覽，內容不會傳送至外部服務。',
    return: '返回正常資料',
    load: '載入公開資料',
    details: '檢視機構檔案',
    close: '關閉機構檔案',
    service: '服務對象',
    tools: '政策工具',
    verifiedDate: '最後查證',
    confidence: '資料可信度',
    high: '高',
    medium: '中',
    low: '低',
    officialName: '官方英文名稱',
    translatedName: '繁體中文名稱',
    translation: '名稱翻譯狀態',
    summary: '摘要',
    established: '設立年份',
    authority: '主管或監督關係',
    legal: '法源',
    programs: '保證方案或業務',
    funding: '資金來源',
    governance: '治理架構',
    membership: 'ACSIC 身分',
    website: '官方網站',
    facts: '已查證事實',
    analysis: '分析或推論',
    pendingItems: '待查證事項',
    sources: '官方來源',
    publisher: '發布者',
    originalLanguage: '原始語言',
    documentDate: '文件日期',
    accessed: '查閱日期',
    section: '章節',
    missing: '官方資料未揭露',
    official: '官方',
    research_translation: '研究翻譯',
    pendingTranslation: '待處理',
    noInference: '無，系統不自動補入推論。',
    noItems: '目前未記錄。',
  },
} as const;

function InstitutionDetail({ record, onClose }: { record: Institution; onClose: () => void }) {
  const { locale } = useLocale();
  const c = ui[locale];
  const translation =
    record.nameTranslationStatus === 'pending'
      ? c.pendingTranslation
      : c[record.nameTranslationStatus];
  const details: Array<[string, Institution[keyof Institution] | string]> = [
    [c.officialName, record.name.en],
    [c.translatedName, record.name['zh-TW']],
    [c.translation, translation],
    [c.summary, record.summary[locale]],
    [c.established, record.establishedYear],
    [c.authority, record.supervisingAuthority],
    [c.legal, record.legalBasis],
    [c.service, record.serviceTargets],
    [c.programs, record.guaranteePrograms],
    [c.funding, record.fundingSources],
    [c.governance, record.governanceStructure],
    [c.membership, record.acsicMembershipStatus],
    [c.website, record.officialWebsite],
  ];
  const list = (items: string[], empty: string) => (
    <ul>{items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>{empty}</li>}</ul>
  );
  return (
    <section className="detail-panel" aria-labelledby="detail-title">
      <div className="detail-heading">
        <div>
          <ResearchBadge />
          <h2 id="detail-title">{record.name[locale]}</h2>
          <p>
            {locale === 'en' ? record.countryNameEn : record.countryNameZhTw} |{' '}
            {record.type[locale]}
          </p>
        </div>
        <button className="button secondary" onClick={onClose}>
          {c.close}
        </button>
      </div>
      <div className="detail-grid">
        {details.map(([label, value]) => (
          <section key={label}>
            <h3>{label}</h3>
            <p>{displayValue(value as Institution[keyof Institution], locale)}</p>
          </section>
        ))}
      </div>
      <div className="evidence-grid">
        <section>
          <h3>{c.facts}</h3>
          {list(record.verifiedFacts, c.noItems)}
        </section>
        <section>
          <h3>{c.analysis}</h3>
          {list(record.analysisInferences, c.noInference)}
        </section>
        <section>
          <h3>{c.pendingItems}</h3>
          {list(record.pendingItems, c.noItems)}
        </section>
      </div>
      <section className="sources-block">
        <h3>{c.sources}</h3>
        {record.sourceReferences.map((source, index) => (
          <dl key={source.id}>
            <div>
              <dt>#</dt>
              <dd>{index + 1}</dd>
            </div>
            <div>
              <dt>{c.publisher}</dt>
              <dd>{source.publisher}</dd>
            </div>
            <div>
              <dt>{c.originalLanguage}</dt>
              <dd>{source.originalLanguage}</dd>
            </div>
            <div>
              <dt>{c.documentDate}</dt>
              <dd>{source.documentDate ?? c.missing}</dd>
            </div>
            <div>
              <dt>{c.section}</dt>
              <dd>{source.section}</dd>
            </div>
            <div>
              <dt>{c.accessed}</dt>
              <dd>{source.accessedDate}</dd>
            </div>
            <div>
              <dt>URL</dt>
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
  const { locale } = useLocale();
  const c = ui[locale];
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [type, setType] = useState('all');
  const [verification, setVerification] = useState('all');
  const [agriculture, setAgriculture] = useState('any');
  const [youth, setYouth] = useState('any');
  const [selected, setSelected] = useState<Institution | null>(null);
  const [viewState, setViewState] = useState<'normal' | 'empty' | 'error'>('normal');
  const filtered = useMemo(
    () =>
      viewState === 'normal'
        ? institutions.filter((record) => {
            const text = [
              record.name.en,
              record.name['zh-TW'],
              record.summary.en,
              record.summary['zh-TW'],
              record.institutionAbbreviation,
              record.countryNameEn,
              record.countryNameZhTw,
            ]
              .join(' ')
              .toLocaleLowerCase();
            const boolFilter = (value: string, count: number) =>
              value === 'any' || (value === 'yes' ? count > 0 : count === 0);
            return (
              (!query || text.includes(query.toLocaleLowerCase())) &&
              (country === 'all' || record.countryCode === country) &&
              (type === 'all' || record.institutionType === type) &&
              (verification === 'all' || record.verificationStatus === verification) &&
              boolFilter(agriculture, record.agricultureRelatedMeasures.length) &&
              boolFilter(youth, record.youthFarmerMeasures.length)
            );
          })
        : [],
    [agriculture, country, query, type, verification, viewState, youth],
  );
  const clear = () => {
    setQuery('');
    setCountry('all');
    setType('all');
    setVerification('all');
    setAgriculture('any');
    setYouth('any');
  };
  const countries = [
    ...new Map(
      institutions.map((record) => [
        record.countryCode,
        locale === 'en' ? record.countryNameEn : record.countryNameZhTw,
      ]),
    ).entries(),
  ];
  const types = [...new Set(institutions.map((record) => record.institutionType))];
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <section className="state-demo" aria-label={c.states}>
        <span>{c.states}</span>
        <div className="segmented-control">
          {(
            [
              ['normal', c.normal],
              ['empty', c.empty],
              ['error', c.error],
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
        <label className="search-field">
          <span>{c.search}</span>
          <input
            aria-label={c.search}
            type="search"
            value={query}
            placeholder={c.placeholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>{c.country}</span>
          <select
            aria-label={c.country}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {countries.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{c.type}</span>
          <select
            aria-label={c.type}
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {types.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{c.verification}</span>
          <select
            aria-label={c.verification}
            value={verification}
            onChange={(event) => setVerification(event.target.value)}
          >
            <option value="all">{c.all}</option>
            <option value="verified">{c.verified}</option>
            <option value="partially_verified">{c.partial}</option>
            <option value="pending_verification">{c.pending}</option>
          </select>
        </label>
        <label>
          <span>{c.agriculture}</span>
          <select
            aria-label={c.agriculture}
            value={agriculture}
            onChange={(event) => setAgriculture(event.target.value)}
          >
            <option value="any">{c.any}</option>
            <option value="yes">{c.yes}</option>
            <option value="no">{c.no}</option>
          </select>
        </label>
        <label>
          <span>{c.youth}</span>
          <select
            aria-label={c.youth}
            value={youth}
            onChange={(event) => setYouth(event.target.value)}
          >
            <option value="any">{c.any}</option>
            <option value="yes">{c.yes}</option>
            <option value="no">{c.no}</option>
          </select>
        </label>
        <button type="button" className="button secondary" onClick={clear}>
          {c.clear}
        </button>
      </form>
      {viewState === 'error' ? (
        <div className="state-message error-state" role="alert">
          <h2>{c.errorTitle}</h2>
          <p>{c.errorText}</p>
          <button className="button secondary" onClick={() => setViewState('normal')}>
            {c.return}
          </button>
        </div>
      ) : viewState === 'empty' ? (
        <div className="state-message">
          <h2>{c.emptyTitle}</h2>
          <p>{c.emptyText}</p>
          <button className="button secondary" onClick={() => setViewState('normal')}>
            {c.load}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="state-message">
          <h2>{c.noResults}</h2>
          <p>{c.noResultsText}</p>
          <button className="button secondary" onClick={clear}>
            {c.clear}
          </button>
        </div>
      ) : (
        <>
          <div className="result-summary" aria-live="polite">
            {filtered.length} {c.results}
          </div>
          <div className="institution-list">
            {filtered.map((record) => (
              <article key={record.id}>
                <div className="record-title">
                  <div>
                    <ResearchBadge />
                    <h2>{record.name[locale]}</h2>
                    <small>{record.name.en}</small>
                  </div>
                  <span className={`status status-${record.confidenceLevel}`}>
                    {record.verificationStatus === 'verified'
                      ? c.verified
                      : record.verificationStatus === 'partially_verified'
                        ? c.partial
                        : c.pending}
                  </span>
                </div>
                <p>
                  {locale === 'en' ? record.countryNameEn : record.countryNameZhTw} |{' '}
                  {record.type[locale]} | ACSIC {record.acsicMembershipStatus}
                </p>
                <p>{record.summary[locale]}</p>
                <dl className="record-summary">
                  <div>
                    <dt>{c.service}</dt>
                    <dd>{displayValue(record.serviceTargets, locale)}</dd>
                  </div>
                  <div>
                    <dt>{c.tools}</dt>
                    <dd>{displayValue(record.policyTools, locale)}</dd>
                  </div>
                  <div>
                    <dt>{c.verifiedDate}</dt>
                    <dd>{record.lastVerifiedDate}</dd>
                  </div>
                  <div>
                    <dt>{c.confidence}</dt>
                    <dd>
                      {record.confidenceLevel === 'high'
                        ? c.high
                        : record.confidenceLevel === 'medium'
                          ? c.medium
                          : c.low}
                    </dd>
                  </div>
                </dl>
                <div className="record-footer">
                  <div className="tag-list">
                    {record.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button className="button secondary" onClick={() => setSelected(record)}>
                    {c.details}
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

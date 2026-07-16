import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../../components/Layout';
import { institutions } from '../../data/institutions';
import { level2FieldLabels } from '../../data/level2-standards';
import { useLocale } from '../../i18n';
import type { Institution, Level2Status, Locale, LocalizedText, SourceType } from '../../types';
import { displayValue } from '../../utils/core';

const ui = {
  en: {
    title: 'Member Institutions',
    intro:
      'Auditable bilingual profiles with strict Level 2 status, field evidence and visible research gaps.',
    search: 'Search',
    placeholder: 'Search institution, country, abbreviation or summary',
    country: 'Countries / Economies',
    type: 'Institution type',
    status: 'Strict Level 2 status',
    membership: 'ACSIC status',
    all: 'All',
    member: 'Member',
    observer: 'Observer',
    clear: 'Clear filters',
    results: 'institution records',
    noResults: 'No matching results',
    noResultsText: 'Adjust the search or filters. Missing records are never generated.',
    details: 'View profile',
    close: 'Close profile',
    officialName: 'Official English name',
    nativeName: 'Official native-language name',
    nativePending: 'Pending official-source confirmation',
    translatedName: 'Traditional Chinese research name',
    translation: 'Chinese-name status',
    role: 'Institution type',
    level2: 'Strict Level 2 status',
    method: 'Completion method',
    methodText:
      'Verified applicable fields divided by all fields required by the central standard. A field is excluded only with a documented non-applicability reason.',
    service: 'Service targets',
    functions: 'Major functions',
    established: 'Established year',
    authority: 'Supervising or oversight relationship',
    legal: 'Legal basis',
    governance: 'Governance type',
    funding: 'Funding or capital basis',
    scope: 'Geographic scope',
    confidence: 'Confidence',
    confidenceReason: 'Confidence rationale',
    missingFields: 'Applicable fields still missing',
    notApplicable: 'Documented non-applicable fields',
    nextPriority: 'Next research priority',
    evidence: 'Field-level evidence',
    claims: 'Readable verified claims',
    sources: 'Official sources',
    sourceWarning: 'Source warning',
    stale: 'Staleness warning',
    unavailable: 'Temporarily unavailable',
    complete: 'Complete',
    partial: 'Partial',
    insufficient: 'Insufficient',
    not_assessed: 'Not assessed',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    official: 'official',
    research_translation: 'research translation',
    pending: 'pending',
    noItems: 'None recorded.',
    officialWebsite: 'Official website',
    openSource: 'Open source',
  },
  'zh-TW': {
    title: '會員機構',
    intro: '以嚴格 Level 2 狀態、欄位級證據與公開研究缺口呈現可稽核的完整雙語檔案。',
    search: '關鍵字搜尋',
    placeholder: '搜尋機構、國家、簡稱或摘要',
    country: '國家／經濟體',
    type: '機構類型',
    status: '嚴格 Level 2 狀態',
    membership: 'ACSIC 身分',
    all: '全部',
    member: '正式會員',
    observer: '觀察員',
    clear: '清除篩選',
    results: '筆機構紀錄',
    noResults: '沒有符合條件的結果',
    noResultsText: '請調整搜尋或篩選；系統不會產生資料填補結果。',
    details: '檢視機構檔案',
    close: '關閉機構檔案',
    officialName: '官方英文名稱',
    nativeName: '官方原生語言名稱',
    nativePending: '待官方來源確認',
    translatedName: '繁體中文研究名稱',
    translation: '中文名稱狀態',
    role: '機構類型',
    level2: '嚴格 Level 2 狀態',
    method: '完整度算法',
    methodText:
      '以中央規格要求的全部欄位為基礎，計算已有證據的適用欄位比例；只有具正式理由的不適用欄位才能排除。',
    service: '服務對象',
    functions: '主要功能',
    established: '設立年份',
    authority: '主管、監督或治理關係',
    legal: '法源依據',
    governance: '治理型態',
    funding: '資金或資本基礎',
    scope: '地理範圍',
    confidence: '資料可信度',
    confidenceReason: '可信度理由',
    missingFields: '仍缺漏的適用欄位',
    notApplicable: '正式記錄的不適用欄位',
    nextPriority: '下一步研究優先事項',
    evidence: '欄位級證據',
    claims: '可閱讀的已查證事實',
    sources: '官方來源',
    sourceWarning: '來源警示',
    stale: '資料時效警示',
    unavailable: '暫時無法存取',
    complete: '完整',
    partial: '部分完成',
    insufficient: '證據不足',
    not_assessed: '尚未評估',
    high: '高',
    medium: '中',
    low: '低',
    official: '官方',
    research_translation: '研究翻譯',
    pending: '待處理',
    noItems: '目前沒有紀錄。',
    officialWebsite: '官方網站',
    openSource: '開啟來源',
  },
} as const;

const sourceTypeLabels: Record<SourceType, LocalizedText> = {
  official_membership_roster: { en: 'Official membership roster', 'zh-TW': '官方會員名冊' },
  official_institution_profile: { en: 'Official institution profile', 'zh-TW': '官方機構簡介' },
  official_law_or_regulation: { en: 'Official law or regulation', 'zh-TW': '官方法律或法規' },
  official_annual_report: { en: 'Official annual report', 'zh-TW': '官方年度報告' },
  official_scheme_document: { en: 'Official scheme document', 'zh-TW': '官方制度文件' },
  official_governance_document: { en: 'Official governance document', 'zh-TW': '官方治理文件' },
  official_government_source: { en: 'Official government source', 'zh-TW': '政府官方來源' },
  official_press_release: { en: 'Official press release', 'zh-TW': '官方新聞稿' },
  official_strategy_document: { en: 'Official strategy document', 'zh-TW': '官方策略文件' },
};

function localizedList(items: LocalizedText[], locale: Locale, empty: string) {
  return (
    <ul>
      {items.length ? items.map((item) => <li key={item.en}>{item[locale]}</li>) : <li>{empty}</li>}
    </ul>
  );
}

function statusLabel(status: Level2Status, locale: Locale) {
  return ui[locale][status];
}

function InstitutionDetail({ record, onClose }: { record: Institution; onClose: () => void }) {
  const { locale } = useLocale();
  const c = ui[locale];
  const source = (id: string) => record.sourceReferences.find((item) => item.sourceId === id);
  return (
    <section className="detail-panel" aria-labelledby="detail-title">
      <div className="detail-heading">
        <div>
          <ResearchBadge />
          <h2 id="detail-title">{record.name[locale]}</h2>
          <p>
            {record.countryName[locale]} · {record.type[locale]} · ACSIC{' '}
            {record.acsicMembershipStatus === 'member' ? c.member : c.observer}
          </p>
        </div>
        <button className="button secondary" onClick={onClose}>
          {c.close}
        </button>
      </div>
      <div className="detail-grid">
        <section>
          <h3>{c.officialName}</h3>
          <p>{record.name.officialEnglish}</p>
        </section>
        <section>
          <h3>{c.nativeName}</h3>
          <p>
            {record.name.nativeName.status === 'official'
              ? `${record.name.nativeName.value} (${record.name.nativeName.language})`
              : c.nativePending}
          </p>
        </section>
        <section>
          <h3>{c.translatedName}</h3>
          <p>
            {record.name['zh-TW']} · {c[record.name.zhTWTranslationStatus]}
          </p>
        </section>
        <section>
          <h3>{c.role}</h3>
          <p>{record.type[locale]}</p>
        </section>
        <section>
          <h3>{c.level2}</h3>
          <p>
            {statusLabel(record.level2Status, locale)} · {record.level2Completion}%
          </p>
        </section>
        <section>
          <h3>{c.method}</h3>
          <p>{c.methodText}</p>
        </section>
        <section>
          <h3>{c.established}</h3>
          <p>{displayValue(record.establishedYear, locale)}</p>
        </section>
        <section>
          <h3>{c.legal}</h3>
          <p>{displayValue(record.legalBasis, locale)}</p>
        </section>
        <section>
          <h3>{c.authority}</h3>
          <p>{displayValue(record.supervisingOrOversightAuthority, locale)}</p>
        </section>
        <section>
          <h3>{c.governance}</h3>
          <p>{displayValue(record.governanceType, locale)}</p>
        </section>
        <section>
          <h3>{c.funding}</h3>
          <p>{displayValue(record.fundingOrCapitalBasis, locale)}</p>
        </section>
        <section>
          <h3>{c.scope}</h3>
          <p>{displayValue(record.geographicScope, locale)}</p>
        </section>
        <section>
          <h3>{c.service}</h3>
          {localizedList(record.serviceTargets, locale, c.noItems)}
        </section>
        <section>
          <h3>{c.functions}</h3>
          {localizedList(record.majorFunctions, locale, c.noItems)}
        </section>
        <section>
          <h3>{c.confidence}</h3>
          <p>
            {c[record.confidenceLevel]} · {record.confidenceScore}/100
          </p>
        </section>
        <section>
          <h3>{c.confidenceReason}</h3>
          <p>{record.confidenceRationale[locale]}</p>
        </section>
        <section>
          <h3>{c.nextPriority}</h3>
          <p>{record.nextResearchPriority[locale]}</p>
        </section>
        <section>
          <h3>{c.officialWebsite}</h3>
          <p>
            <a href={record.officialWebsite} target="_blank" rel="noreferrer">
              {record.officialWebsite}
            </a>
          </p>
        </section>
      </div>
      <div className="evidence-grid">
        <section>
          <h3>{c.missingFields}</h3>
          <ul>
            {record.missingFields.map((field) => (
              <li key={field}>
                {(level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale]}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>{c.notApplicable}</h3>
          {record.notApplicableFields.length ? (
            record.notApplicableFields.map((item) => (
              <article key={item.field}>
                <strong>
                  {
                    (level2FieldLabels[item.field] ?? { en: item.field, 'zh-TW': item.field })[
                      locale
                    ]
                  }
                </strong>
                <p>{item.reason[locale]}</p>
              </article>
            ))
          ) : (
            <p>{c.noItems}</p>
          )}
        </section>
      </div>
      <section className="sources-block">
        <h3>{c.evidence}</h3>
        {Object.entries(record.fieldEvidence).map(([field, entries]) => (
          <article key={field} className="evidence-card">
            <h4>{(level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale]}</h4>
            {entries.map((entry) => {
              const item = source(entry.sourceId);
              return (
                <div key={entry.evidenceId}>
                  <p>{entry.evidenceSummary[locale]}</p>
                  <p>
                    <strong>{item?.title}</strong> · {entry.pageOrSection} · {entry.verifiedDate}
                  </p>
                  {item && (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {c.openSource}
                    </a>
                  )}
                </div>
              );
            })}
          </article>
        ))}
      </section>
      <section className="sources-block">
        <h3>{c.claims}</h3>
        <ul>
          {record.verifiedFacts.map((claim) => (
            <li key={claim.claimId}>{claim.statement[locale]}</li>
          ))}
        </ul>
      </section>
      <section className="sources-block">
        <h3>{c.sources}</h3>
        {record.sourceReferences.map((item, index) => (
          <article key={item.sourceId} className="source-card">
            <h4>
              [{index + 1}] {item.title}
            </h4>
            <p>
              {item.publisher} · {sourceTypeLabels[item.sourceType][locale]} ·{' '}
              {item.originalLanguage} · {item.accessedDate}
            </p>
            <p>{item.notes[locale]}</p>
            {(item.stalenessWarning || item.accessStatus === 'temporarily_unavailable') && (
              <p className="warning">
                <strong>{c.sourceWarning}:</strong>{' '}
                {item.stalenessWarning ? c.stale : c.unavailable}
              </p>
            )}
            <a href={item.url} target="_blank" rel="noreferrer">
              {c.openSource}
            </a>
          </article>
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
  const [status, setStatus] = useState('all');
  const [membership, setMembership] = useState('all');
  const [selected, setSelected] = useState<Institution | null>(null);
  const filtered = useMemo(
    () =>
      institutions.filter((record) => {
        const text = [
          record.name.en,
          record.name['zh-TW'],
          record.name.nativeName.value,
          record.summary.en,
          record.summary['zh-TW'],
          record.institutionAbbreviation,
          record.countryName.en,
          record.countryName['zh-TW'],
          ...record.name.aliases,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();
        return (
          (!query || text.includes(query.toLocaleLowerCase())) &&
          (country === 'all' || record.countryCode === country) &&
          (type === 'all' || record.institutionRoleCategory === type) &&
          (status === 'all' || record.level2Status === status) &&
          (membership === 'all' || record.acsicMembershipStatus === membership)
        );
      }),
    [country, membership, query, status, type],
  );
  const countries = [
    ...new Map(
      institutions.map((record) => [record.countryCode, record.countryName[locale]]),
    ).entries(),
  ];
  const roles = [
    ...new Map(
      institutions.map((record) => [record.institutionRoleCategory, record.type[locale]]),
    ).entries(),
  ];
  const clear = () => {
    setQuery('');
    setCountry('all');
    setType('all');
    setStatus('all');
    setMembership('all');
  };
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
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
            {countries.map(([value, label]) => (
              <option key={value} value={value}>
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
            {roles.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{c.status}</span>
          <select
            aria-label={c.status}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {(['complete', 'partial', 'insufficient', 'not_assessed'] as const).map((value) => (
              <option key={value} value={value}>
                {c[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{c.membership}</span>
          <select
            aria-label={c.membership}
            value={membership}
            onChange={(event) => setMembership(event.target.value)}
          >
            <option value="all">{c.all}</option>
            <option value="member">{c.member}</option>
            <option value="observer">{c.observer}</option>
          </select>
        </label>
        <button type="button" className="button secondary" onClick={clear}>
          {c.clear}
        </button>
      </form>
      {filtered.length === 0 ? (
        <div className="state-message">
          <h2>{c.noResults}</h2>
          <p>{c.noResultsText}</p>
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
                    {statusLabel(record.level2Status, locale)}
                  </span>
                </div>
                <p>
                  {record.countryName[locale]} · {record.type[locale]} · ACSIC{' '}
                  {record.acsicMembershipStatus === 'member' ? c.member : c.observer}
                </p>
                <p>{record.summary[locale]}</p>
                <dl className="record-summary">
                  <div>
                    <dt>{c.service}</dt>
                    <dd>{displayValue(record.serviceTargets, locale)}</dd>
                  </div>
                  <div>
                    <dt>{c.functions}</dt>
                    <dd>{displayValue(record.majorFunctions, locale)}</dd>
                  </div>
                  <div>
                    <dt>{c.level2}</dt>
                    <dd>
                      {statusLabel(record.level2Status, locale)} · {record.level2Completion}%
                    </dd>
                  </div>
                  <div>
                    <dt>{c.missingFields}</dt>
                    <dd>{record.missingFields.length}</dd>
                  </div>
                  <div>
                    <dt>{c.confidence}</dt>
                    <dd>
                      {c[record.confidenceLevel]} · {record.confidenceScore}/100
                    </dd>
                  </div>
                </dl>
                <div className="record-footer">
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

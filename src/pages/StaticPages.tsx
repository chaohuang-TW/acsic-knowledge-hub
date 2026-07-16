import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../components/Layout';
import { coverageStats, membershipStats } from '../data/coverage';
import { institutions, sourceRegistry } from '../data/institutions';
import { level2FieldLabels } from '../data/level2-standards';
import { useLocale } from '../i18n';
import { routePath } from '../routing';
import type { Locale, SourceType } from '../types';

const sourceTypeLabels: Record<SourceType, Record<Locale, string>> = {
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

const accessStatusLabels = {
  accessible: { en: 'Accessible', 'zh-TW': '可存取' },
  redirected: { en: 'Redirected', 'zh-TW': '已重新導向' },
  temporarily_unavailable: { en: 'Temporarily unavailable', 'zh-TW': '暫時無法存取' },
  archived: { en: 'Archived', 'zh-TW': '已封存' },
} as const;

const pageCopy = {
  en: {
    home: {
      title: 'Credit guarantee knowledge, connected across Asia',
      intro:
        'Independent bilingual research on ACSIC member institutions, systems and public sources.',
      primary: 'Explore institutions',
      secondary: 'How the platform works',
      imageAlt:
        'Abstract knowledge flow connecting official sources, verification and research outputs',
      imageCaption:
        'Official sources become traceable knowledge through structured review and comparison.',
      scopeTitle: 'A platform designed for the full ACSIC community',
      scope: [
        [
          'Member institutions',
          'Structured profiles preserve official names, evidence and research gaps.',
        ],
        [
          'Credit guarantee systems',
          'A future comparison layer for legal mandates, tools and risk-sharing arrangements.',
        ],
        [
          'Knowledge and practices',
          'Reusable comparisons and reports generated from the same governed data.',
        ],
      ],
      currentTitle: 'Current research foundation',
      current: [
        '9 institution profiles',
        '18 official source records',
        'English and Traditional Chinese interface',
      ],
      boundaryTitle: 'Independent and evidence-led',
      boundary:
        'This platform is not operated or endorsed by ACSIC. Unknown information remains clearly marked instead of being generated.',
    },
    overview: {
      title: 'ACSIC Overview',
      intro:
        'A neutral entry point for future public information about ACSIC, its membership scope and knowledge network.',
      headings: ['Scope', 'Evidence boundary', 'Next research stage'],
      text: [
        'The platform covers member institutions and observers only when their status is supported by an official public source.',
        'Membership evidence, institution facts, research translations and pending items remain separate.',
        'The next stage will validate the complete membership list before expanding institution-level detail.',
      ],
    },
    systems: {
      title: 'Credit Guarantee Systems',
      intro:
        'A bilingual structure for future country and system research. Detailed content will be added only after source verification.',
      emptyTitle: 'System profiles are being prepared',
      emptyText:
        'No placeholder country systems are published. The schema is ready for legal basis, risk sharing, coverage and fee evidence.',
    },
    practices: {
      title: 'Knowledge & Practices',
      intro: 'Use governed institution data for comparison and reusable research outputs.',
      compare: 'Compare institutions',
      report: 'Create a report',
      governance: 'Review data governance',
    },
    resources: {
      title: 'Events & Resources',
      intro: 'A future home for verified ACSIC event materials and official public resources.',
      source: 'Browse official sources',
      emptyTitle: 'No event archive has been added',
      emptyText:
        'Resources will appear only after official provenance, date and original language are recorded.',
    },
    governance: {
      title: 'Data Governance',
      intro: 'Source, language, date and verification status matter more than record volume.',
      headings: [
        'Official sources first',
        'Original language',
        'Translation status',
        'Human review before publication',
      ],
      text: [
        'Institution facts return to the institution’s own public materials. Membership status requires separate official evidence.',
        'Each source records its original language. Official English names are preserved verbatim.',
        'Traditional Chinese names are marked official, research translation or pending.',
        'Tests, builds, sensitive-data scans and content checks run before publication.',
      ],
    },
    sources: {
      title: 'Official Sources',
      intro:
        'Review the official webpages, documents and indexes used by each institution profile.',
      country: 'Country',
      institution: 'Institution',
      type: 'Document type',
      year: 'Year',
      all: 'All',
      results: 'official sources',
      publisher: 'Publisher',
      section: 'Section',
      documentDate: 'Document date',
      accessed: 'Accessed',
      originalLanguage: 'Original language',
      open: 'Open official source',
      missing: 'Not stated in the official source',
    },
    about: {
      title: 'About the Platform',
      intro:
        'An independent bilingual public-data research platform for ACSIC member institutions.',
      headings: ['Purpose', 'Independent status', 'Data scope'],
      text: [
        'The platform supports transparent research, comparison and knowledge reuse across credit guarantee institutions.',
        'It is not an official ACSIC website and does not imply endorsement by any institution.',
        'Only publicly accessible official sources are used. Private repositories, internal documents and case data are outside scope.',
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      intro: 'Understand the limits of public-data research before reading or downloading content.',
      items: [
        'Content is not financial, legal, policy, investment or credit advice.',
        'Official webpages, programs and systems may change. Verify information again before use.',
        'Partially verified and pending content must not be treated as confirmed.',
        'Cross-institution comparison does not remove differences in mandates, definitions or dates.',
        'Noindex and robots.txt discourage indexing but do not provide access control.',
      ],
    },
  },
  'zh-TW': {
    home: {
      title: '串聯亞洲信用保證知識',
      intro: '以雙語、獨立且可查證的方式研究 ACSIC 會員機構、制度與公開來源。',
      primary: '探索會員機構',
      secondary: '了解平台方法',
      imageAlt: '抽象知識流程圖，連結官方來源、查證程序與研究成果',
      imageCaption: '官方來源經結構化、查證與比較後，形成可追溯的研究知識。',
      scopeTitle: '為 ACSIC 全體會員設計的知識平台',
      scope: [
        ['會員機構', '結構化機構檔案保留官方名稱、會員證據與研究缺口。'],
        ['信用保證制度', '未來可比較法定任務、政策工具與風險分擔安排。'],
        ['知識與實務', '由同一套治理資料產生比較與可重用報告。'],
      ],
      currentTitle: '目前研究基礎',
      current: ['9 筆機構檔案', '18 筆官方來源紀錄', '英文與繁體中文介面'],
      boundaryTitle: '獨立且以證據為本',
      boundary: '本平台不是 ACSIC 經營或授權的網站。未知資料維持清楚標記，不由系統捏造補齊。',
    },
    overview: {
      title: 'ACSIC 概覽',
      intro: '作為未來整理 ACSIC 公開資訊、會員範圍與知識網絡的中立入口。',
      headings: ['研究範圍', '證據邊界', '下一階段'],
      text: [
        '只有在官方公開來源支持其身分時，才將會員機構與 Observer 納入平台。',
        '會員證據、機構事實、研究翻譯與待查證事項分開保存。',
        '下一階段將先驗證完整會員名冊，再逐步擴充機構制度細節。',
      ],
    },
    systems: {
      title: '信用保證制度',
      intro: '為未來國別與制度研究建立雙語架構，詳細內容只在完成來源查證後加入。',
      emptyTitle: '制度檔案準備中',
      emptyText:
        '平台不刊登占位式虛構國別資料。資料契約已可承接法源、風險分擔、保證範圍與費率證據。',
    },
    practices: {
      title: '知識與實務',
      intro: '以治理後的機構資料進行比較，並產生可重用研究成果。',
      compare: '比較會員機構',
      report: '建立研究報告',
      governance: '檢視資料治理',
    },
    resources: {
      title: '活動與資源',
      intro: '未來集中收錄可查證的 ACSIC 活動材料與官方公開資源。',
      source: '瀏覽官方來源',
      emptyTitle: '尚未建立活動資料庫',
      emptyText: '只有完成官方出處、日期與原始語言登錄的資源才會刊登。',
    },
    governance: {
      title: '資料治理',
      intro: '來源、語言、日期與查證狀態，比資料數量更重要。',
      headings: ['官方一手來源優先', '原始語言', '翻譯狀態', '發布前人工審查'],
      text: [
        '機構事實回到各機構自身公開資料，會員身分另以官方證據查核。',
        '每筆來源記錄原始語言，官方英文名稱完整原文保存。',
        '繁體中文名稱標記為官方、研究翻譯或待處理。',
        '發布前執行測試、建置、敏感資訊掃描與內容檢核。',
      ],
    },
    sources: {
      title: '官方來源',
      intro: '集中檢視各機構檔案使用的官方網頁、文件與會員索引。',
      country: '國家',
      institution: '機構',
      type: '文件類型',
      year: '年份',
      all: '全部',
      results: '筆官方來源',
      publisher: '發布者',
      section: '章節',
      documentDate: '文件日期',
      accessed: '查閱日期',
      originalLanguage: '原始語言',
      open: '開啟官方來源',
      missing: '官方資料未揭露',
    },
    about: {
      title: '關於平台',
      intro: '以 ACSIC 會員機構為範圍的獨立雙語公開資料研究平台。',
      headings: ['平台目的', '獨立定位', '資料範圍'],
      text: [
        '支援信用保證機構的透明研究、制度比較與知識重用。',
        '本平台不是 ACSIC 官方網站，也不代表任何機構背書。',
        '只使用可公開查閱的官方來源，私人 repository、內部文件與個案資料均不在範圍內。',
      ],
    },
    disclaimer: {
      title: '免責聲明',
      intro: '閱讀或下載內容前，請先理解公開資料研究的限制。',
      items: [
        '內容不構成金融、法律、政策、投資或授信建議。',
        '官方網頁、方案與制度可能更新，使用前應再次查證。',
        '部分查證與待查證內容不可視為確定事實。',
        '跨機構比較未消除法定任務、資料定義與時點差異。',
        'noindex 與 robots.txt 只是不鼓勵索引，不是存取控制。',
      ],
    },
  },
} as const;

export function HomePage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].home;
  return (
    <>
      <section className="hero section-shell">
        <div className="hero-copy">
          <ResearchBadge />
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
          <div className="button-row">
            <a className="button primary" href={`#${routePath(locale, 'members')}`}>
              {c.primary}
            </a>
            <a className="button secondary" href={`#${routePath(locale, 'overview')}`}>
              {c.secondary}
            </a>
          </div>
        </div>
        <figure className="hero-visual">
          <img
            src={`${import.meta.env.BASE_URL}assets/knowledge-flow.png`}
            alt={c.imageAlt}
            width="1536"
            height="1024"
          />
          <figcaption>{c.imageCaption}</figcaption>
        </figure>
      </section>
      <section className="section-shell problem-section">
        <h2>{c.scopeTitle}</h2>
        <div className="problem-grid">
          {c.scope.map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section-shell outcomes-section">
        <h2>{locale === 'en' ? 'Membership Coverage' : '會員涵蓋情形'}</h2>
        <div className="problem-grid coverage-grid">
          {[
            [locale === 'en' ? 'Formal Members' : '正式會員', membershipStats.formalMembers],
            [locale === 'en' ? 'Observer' : '觀察員', membershipStats.observers],
            [
              locale === 'en' ? 'Countries / Economies' : '國家／經濟體',
              membershipStats.countriesEconomies,
            ],
            [
              locale === 'en' ? 'Institutions Covered' : '涵蓋機構',
              membershipStats.institutionsCovered,
            ],
            [locale === 'en' ? 'Level 1 Complete' : 'Level 1 完成', membershipStats.level1Complete],
            [locale === 'en' ? 'Level 2 Complete' : 'Level 2 完成', membershipStats.level2Complete],
            [
              locale === 'en' ? 'Level 2 Partial' : 'Level 2 部分完成',
              membershipStats.level2Partial,
            ],
            [
              locale === 'en' ? 'Level 2 Insufficient' : 'Level 2 證據不足',
              membershipStats.level2Insufficient,
            ],
            [
              locale === 'en' ? 'Source references' : '來源引用紀錄',
              membershipStats.sourceReferences,
            ],
            [
              locale === 'en' ? 'Unique official sources' : '不重複官方來源',
              membershipStats.uniqueOfficialSources,
            ],
          ].map(([label, value]) => (
            <article key={label}>
              <strong className="coverage-number">{value}</strong>
              <p>{label}</p>
            </article>
          ))}
        </div>
        <p>
          {locale === 'en' ? 'Last membership verification' : '名冊最後查核日'}:{' '}
          {membershipStats.lastMembershipVerificationDate}
        </p>
        <h2>{c.currentTitle}</h2>
        <div className="outcome-layout">
          <ol className="numbered-list">
            {[
              locale === 'en' ? '21 institution profiles' : '21 筆機構檔案',
              locale === 'en'
                ? `${membershipStats.sourceReferences} references to ${membershipStats.uniqueOfficialSources} unique official sources`
                : `${membershipStats.sourceReferences} 筆引用紀錄，連結 ${membershipStats.uniqueOfficialSources} 個不重複官方來源`,
              locale === 'en' ? 'English and Traditional Chinese interface' : '英文與繁體中文介面',
            ].map((item) => (
              <li key={item}>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
          <div className="outcome-callout">
            <h3>{c.boundaryTitle}</h3>
            <p>{c.boundary}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function ThreePartPage({ type }: { type: 'overview' }) {
  const { locale } = useLocale();
  const c = pageCopy[locale][type];
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="concept-matrix">
        {c.headings.map((heading, index) => (
          <article key={heading}>
            <h2>{heading}</h2>
            <p>{c.text[index]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function OverviewPage() {
  return <ThreePartPage type="overview" />;
}

export function SystemsPage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].systems;
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="state-message">
        <h2>{c.emptyTitle}</h2>
        <p>{c.emptyText}</p>
      </div>
    </section>
  );
}
export function KnowledgePracticesPage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].practices;
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="knowledge-actions">
        <a className="button primary" href={`#${routePath(locale, 'compare')}`}>
          {c.compare}
        </a>
        <a className="button secondary" href={`#${routePath(locale, 'reports')}`}>
          {c.report}
        </a>
        <a className="button secondary" href={`#${routePath(locale, 'governance')}`}>
          {c.governance}
        </a>
      </div>
    </section>
  );
}
export function ResourcesPage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].resources;
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="state-message">
        <h2>{c.emptyTitle}</h2>
        <p>{c.emptyText}</p>
        <a className="button secondary" href={`#${routePath(locale, 'sources')}`}>
          {c.source}
        </a>
      </div>
    </section>
  );
}

export function GovernancePage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].governance;
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="governance-principles">
        {c.headings.map((heading, index) => (
          <article key={heading}>
            <h2>{heading}</h2>
            <p>{c.text[index]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SourcesPage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].sources;
  const [country, setCountry] = useState('all');
  const [institution, setInstitution] = useState('all');
  const [type, setType] = useState('all');
  const [year, setYear] = useState('all');
  const [language, setLanguage] = useState('all');
  const [access, setAccess] = useState('all');
  const [stale, setStale] = useState('all');
  const [tier, setTier] = useState('all');
  const countries = [
    ...new Map(
      institutions.map((record) => [record.countryCode, record.countryName[locale]]),
    ).entries(),
  ];
  const types = [...new Set(sourceRegistry.map((source) => source.sourceType))];
  const years = [
    ...new Set(
      sourceRegistry
        .map((source) => source.documentDate?.slice(0, 4) ?? source.publicationDate?.slice(0, 4))
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const languages = [...new Set(sourceRegistry.map((source) => source.originalLanguage))];
  const institutionsFor = (sourceId: string) =>
    institutions.filter((record) => record.sourceIds.includes(sourceId));
  const supportedFields = (sourceId: string) =>
    institutions.flatMap((record) =>
      Object.entries(record.fieldEvidence)
        .filter(([, entries]) => entries.some((entry) => entry.sourceId === sourceId))
        .map(([field]) => (level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale]),
    );
  const filtered = useMemo(
    () =>
      sourceRegistry.filter(
        (source) =>
          (country === 'all' ||
            institutionsFor(source.sourceId).some((record) => record.countryCode === country)) &&
          (institution === 'all' ||
            institutionsFor(source.sourceId).some((record) => record.id === institution)) &&
          (type === 'all' || source.sourceType === type) &&
          (year === 'all' ||
            source.documentDate?.startsWith(year) ||
            source.publicationDate?.startsWith(year)) &&
          (language === 'all' || source.originalLanguage === language) &&
          (access === 'all' || source.accessStatus === access) &&
          (stale === 'all' || source.stalenessWarning === (stale === 'yes')) &&
          (tier === 'all' || source.tier === tier),
      ),
    [access, country, institution, language, stale, tier, type, year],
  );
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div
        className="problem-grid coverage-grid"
        aria-label={locale === 'en' ? 'Source statistics' : '來源統計'}
      >
        {[
          [locale === 'en' ? 'Source references' : '來源引用紀錄', coverageStats.sourceReferences],
          [
            locale === 'en' ? 'Unique official sources' : '不重複官方來源',
            coverageStats.uniqueOfficialSources,
          ],
          [
            locale === 'en' ? 'Institution profiles' : '官方機構簡介',
            coverageStats.sourceTypes.official_institution_profile ?? 0,
          ],
          [
            locale === 'en' ? 'Legal or statutory documents' : '法律或法規文件',
            coverageStats.sourceTypes.official_law_or_regulation ?? 0,
          ],
          [
            locale === 'en' ? 'Annual or integrated reports' : '年度或整合報告',
            coverageStats.sourceTypes.official_annual_report ?? 0,
          ],
          [
            locale === 'en' ? 'Scheme or programme documents' : '制度或方案文件',
            coverageStats.sourceTypes.official_scheme_document ?? 0,
          ],
          [
            locale === 'en' ? 'Governance documents' : '治理文件',
            coverageStats.sourceTypes.official_governance_document ?? 0,
          ],
          [
            locale === 'en' ? 'Membership rosters' : '官方會員名冊',
            coverageStats.sourceTypes.official_membership_roster ?? 0,
          ],
          [locale === 'en' ? 'Staleness warnings' : '時效警示', coverageStats.staleSources],
          [
            locale === 'en' ? 'Temporarily unavailable' : '暫時無法存取',
            coverageStats.unavailableSources,
          ],
        ].map(([label, value]) => (
          <article key={label}>
            <strong className="coverage-number">{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </div>
      <form className="filter-panel" onSubmit={(event) => event.preventDefault()}>
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
          <span>{c.institution}</span>
          <select
            aria-label={c.institution}
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {institutions.map((record) => (
              <option key={record.id} value={record.id}>
                {record.institutionAbbreviation}
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
              <option key={value} value={value}>
                {sourceTypeLabels[value][locale]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{c.year}</span>
          <select
            aria-label={c.year}
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {years.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{locale === 'en' ? 'Original language' : '原始語言'}</span>
          <select
            aria-label={locale === 'en' ? 'Original language' : '原始語言'}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {languages.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{locale === 'en' ? 'Access status' : '存取狀態'}</span>
          <select
            aria-label={locale === 'en' ? 'Access status' : '存取狀態'}
            value={access}
            onChange={(event) => setAccess(event.target.value)}
          >
            <option value="all">{c.all}</option>
            <option value="accessible">{accessStatusLabels.accessible[locale]}</option>
            <option value="redirected">{accessStatusLabels.redirected[locale]}</option>
            <option value="temporarily_unavailable">
              {accessStatusLabels.temporarily_unavailable[locale]}
            </option>
            <option value="archived">{accessStatusLabels.archived[locale]}</option>
          </select>
        </label>
        <label>
          <span>{locale === 'en' ? 'Staleness warning' : '時效警示'}</span>
          <select
            aria-label={locale === 'en' ? 'Staleness warning' : '時效警示'}
            value={stale}
            onChange={(event) => setStale(event.target.value)}
          >
            <option value="all">{c.all}</option>
            <option value="yes">{locale === 'en' ? 'Warning' : '有警示'}</option>
            <option value="no">{locale === 'en' ? 'No warning' : '無警示'}</option>
          </select>
        </label>
        <label>
          <span>Tier</span>
          <select aria-label="Tier" value={tier} onChange={(event) => setTier(event.target.value)}>
            <option value="all">{c.all}</option>
            <option value="tier_1">Tier 1</option>
            <option value="tier_2">Tier 2</option>
          </select>
        </label>
      </form>
      <div className="result-summary" aria-live="polite">
        {locale === 'en' ? `${filtered.length} ${c.results}` : `${filtered.length} ${c.results}`}
      </div>
      <div className="institution-list">
        {filtered.map((source) => {
          const related = institutionsFor(source.sourceId);
          const fields = supportedFields(source.sourceId);
          return (
            <article key={source.sourceId}>
              <div className="record-title">
                <div>
                  <ResearchBadge />
                  <h2>{source.title}</h2>
                </div>
                <span className="status status-high">{locale === 'en' ? 'Official' : '官方'}</span>
              </div>
              <p>
                {related.length
                  ? related.map((record) => record.institutionAbbreviation).join(', ')
                  : locale === 'en'
                    ? 'Cross-institution roster'
                    : '跨機構名冊'}{' '}
                | {sourceTypeLabels[source.sourceType][locale]}
              </p>
              <dl className="record-summary">
                <div>
                  <dt>{c.publisher}</dt>
                  <dd>{source.publisher}</dd>
                </div>
                <div>
                  <dt>{c.section}</dt>
                  <dd>{source.pageOrSection}</dd>
                </div>
                <div>
                  <dt>{c.documentDate}</dt>
                  <dd>{source.documentDate ?? c.missing}</dd>
                </div>
                <div>
                  <dt>{c.accessed}</dt>
                  <dd>{source.accessedDate}</dd>
                </div>
                <div>
                  <dt>{c.originalLanguage}</dt>
                  <dd>{source.originalLanguage}</dd>
                </div>
                <div>
                  <dt>{locale === 'en' ? 'Tier' : '來源層級'}</dt>
                  <dd>{source.tier === 'tier_1' ? 'Tier 1' : 'Tier 2'}</dd>
                </div>
                <div>
                  <dt>{locale === 'en' ? 'Supported fields' : '支持欄位'}</dt>
                  <dd>{fields.length ? fields.join(locale === 'en' ? '; ' : '、') : c.missing}</dd>
                </div>
                <div>
                  <dt>{locale === 'en' ? 'Access status' : '存取狀態'}</dt>
                  <dd>{accessStatusLabels[source.accessStatus][locale]}</dd>
                </div>
                <div>
                  <dt>{locale === 'en' ? 'Staleness warning' : '時效警示'}</dt>
                  <dd>
                    {source.stalenessWarning
                      ? locale === 'en'
                        ? 'Yes'
                        : '有'
                      : locale === 'en'
                        ? 'No'
                        : '無'}
                  </dd>
                </div>
              </dl>
              <div className="record-footer">
                <a className="button secondary" href={source.url} target="_blank" rel="noreferrer">
                  {c.open}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function AboutPage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].about;
  return (
    <section className="section-shell page-section narrow-page">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="prose-block">
        {c.headings.map((heading, index) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{c.text[index]}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
export function DisclaimerPage() {
  const { locale, t } = useLocale();
  const c = pageCopy[locale].disclaimer;
  return (
    <section className="section-shell page-section narrow-page">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="disclaimer-document">
        <p className="lead">{t.disclaimer}</p>
        <ul>
          {c.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

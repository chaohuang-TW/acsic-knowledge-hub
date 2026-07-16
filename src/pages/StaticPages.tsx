import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../components/Layout';
import { institutions } from '../data/institutions';
import { useLocale } from '../i18n';
import { routePath } from '../routing';

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
        <h2>{c.currentTitle}</h2>
        <div className="outcome-layout">
          <ol className="numbered-list">
            {c.current.map((item) => (
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
  const all = institutions.flatMap((record) =>
    record.sourceReferences.map((source) => ({ record, source })),
  );
  const countries = [
    ...new Set(
      institutions.map((record) =>
        locale === 'en' ? record.countryNameEn : record.countryNameZhTw,
      ),
    ),
  ];
  const types = [...new Set(all.map(({ source }) => source.documentType))];
  const years = [
    ...new Set(
      all.map(({ source }) => source.year).filter((value): value is number => value !== null),
    ),
  ];
  const filtered = useMemo(
    () =>
      all.filter(
        ({ record, source }) =>
          (country === 'all' ||
            (locale === 'en' ? record.countryNameEn : record.countryNameZhTw) === country) &&
          (institution === 'all' || record.id === institution) &&
          (type === 'all' || source.documentType === type) &&
          (year === 'all' || source.year === Number(year)),
      ),
    [all, country, institution, locale, type, year],
  );
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <form className="filter-panel" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>{c.country}</span>
          <select
            aria-label={c.country}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            <option value="all">{c.all}</option>
            {countries.map((value) => (
              <option key={value}>{value}</option>
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
              <option key={value}>{value}</option>
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
      </form>
      <div className="result-summary" aria-live="polite">
        {locale === 'en' ? `${filtered.length} ${c.results}` : `${filtered.length} ${c.results}`}
      </div>
      <div className="institution-list">
        {filtered.map(({ record, source }) => (
          <article key={`${record.id}-${source.id}`}>
            <div className="record-title">
              <div>
                <ResearchBadge />
                <h2>{source.title}</h2>
              </div>
              <span className="status status-high">{locale === 'en' ? 'Official' : '官方'}</span>
            </div>
            <p>
              {record.name[locale]} | {source.documentType}
            </p>
            <dl className="record-summary">
              <div>
                <dt>{c.publisher}</dt>
                <dd>{source.publisher}</dd>
              </div>
              <div>
                <dt>{c.section}</dt>
                <dd>{source.section}</dd>
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
            </dl>
            <div className="record-footer">
              <a className="button secondary" href={source.url} target="_blank" rel="noreferrer">
                {c.open}
              </a>
            </div>
          </article>
        ))}
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

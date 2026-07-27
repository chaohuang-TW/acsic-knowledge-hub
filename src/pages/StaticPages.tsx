import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../components/Layout';
import { coverageStats, membershipStats } from '../data/coverage';
import { institutions, sourceRegistry } from '../data/institutions';
import { level2FieldLabels } from '../data/level2-standards';
import {
  indicatorCategoryLabels,
  indicatorDictionary,
  indicatorDictionaryTitle,
  level3PilotReadiness,
  productionLevel3Values,
} from '../data/indicators';
import { referenceSetDisclaimer } from '../data/reference-set';
import { researchPriorityDisclaimer } from '../data/research-priority';
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
      title: 'Explore Asia’s credit guarantee systems',
      intro:
        'One place to explore ACSIC institutions, institutional models and source-traceable official data.',
      primary: 'Explore institutions',
      secondary: 'Compare institutions',
      tertiary: 'About ACSIC',
      networkTitle: 'ACSIC Network',
      acrossAsia: 'Across Asia',
      formalMembers: 'Formal Members',
      observer: 'Observer',
      countriesEconomies: 'Countries / Economies',
      institutionsCovered: 'Institutions Covered',
      exploreAll: 'Explore all institutions →',
      scopeTitle: 'What you can do here',
      scope: [
        ['Find institutions', 'Find ACSIC members and its observer by country, type and mandate.'],
        [
          'Understand institutions',
          'Read what each institution does, who it serves and how its framework is documented.',
        ],
        [
          'Compare institutions',
          'Select two to four institutions and review their documented differences.',
        ],
        [
          'Use official data',
          'Explore quantitative records with sources, periods and definitions.',
        ],
      ],
      boundaryTitle: 'Independent and evidence-led',
      boundary:
        'This platform is not operated or endorsed by ACSIC. Unknown information remains clearly marked instead of being generated.',
    },
    overview: {
      title: 'ACSIC Overview',
      intro:
        'A concise introduction to the Asian network behind this knowledge hub and its member institutions.',
      headings: ['What is ACSIC?', 'ACSIC in brief', 'Purpose and exchange'],
      text: [
        'Asian Credit Supplementation Institution Confederation (ACSIC) is an international exchange network for credit supplementation and credit guarantee related institutions in Asia.',
        'This hub presents the current public membership scope with the underlying institution data kept separate from research metadata.',
        'Established on 20 October 1987, ACSIC promotes sound development through information exchange, discussion and personnel interchange among participating institutions.',
      ],
    },
    systems: {
      title: 'Credit Guarantee Systems',
      intro:
        'Source-traceable entry points to selected public system practices. Details are shown only where an official source supports them.',
    },
    practices: {
      title: 'Knowledge & Practices',
      intro: 'Use governed institution data for comparison and reusable research outputs.',
      compare: 'Compare institutions',
      report: 'Create a report',
      governance: 'Review data governance',
    },
    resources: {
      title: 'Resources',
      intro:
        'A practical starting point for source materials, methodology and comparative research.',
      source: 'Browse official sources',
      emptyTitle: 'ACSIC event archive - planned',
      emptyText:
        'Event materials are listed only after official provenance, date and original language are recorded.',
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
      title: '探索亞洲信用保證制度',
      intro: '從 ACSIC 會員機構、制度特色到官方數據，用一個入口理解亞洲信用補充體系。',
      primary: '探索會員機構',
      secondary: '比較制度',
      tertiary: '認識 ACSIC',
      networkTitle: 'ACSIC 聯盟概況',
      acrossAsia: '橫跨亞洲',
      formalMembers: '正式會員',
      observer: '觀察員',
      countriesEconomies: '國家／經濟體',
      institutionsCovered: '涵蓋機構',
      exploreAll: '探索全部會員機構 →',
      scopeTitle: '你可以在這裡做什麼',
      scope: [
        ['找機構', '依國家、類型與任務快速查找 ACSIC 會員及觀察員。'],
        ['看制度', '了解各機構的任務、服務對象與可查證的制度架構。'],
        ['做比較', '選擇二至四家機構，查看已記錄的制度差異。'],
        ['查官方數據', '查看具有官方出處、期間與資料定義的量化資訊。'],
      ],
      boundaryTitle: '獨立且以證據為本',
      boundary: '本平台不是 ACSIC 經營或授權的網站。未知資料維持清楚標記，不由系統捏造補齊。',
    },
    overview: {
      title: 'ACSIC 概覽',
      intro: '認識亞洲信用補充機構聯盟，以及本平台所整理的會員機構脈絡。',
      headings: ['什麼是 ACSIC？', 'ACSIC 一覽', '成立背景與宗旨'],
      text: [
        '亞洲地區信用補充機構聯盟（Asian Credit Supplementation Institution Confederation, ACSIC）是亞洲信用補充與信用保證相關機構的國際交流網絡。',
        '本平台以現有公開會員資料呈現機構範圍，並將機構資訊與研究治理資料分開處理。',
        'ACSIC 於 1987 年 10 月 20 日成立，透過資訊交換、討論及人員交流，促進會員地區信用補充制度的健全發展。',
      ],
    },
    systems: {
      title: '信用保證制度',
      intro: '從已查證的官方資料，認識部分制度作法；僅刊登有官方來源支持的細節。',
    },
    practices: {
      title: '知識與實務',
      intro: '以治理後的機構資料進行比較，並產生可重用研究成果。',
      compare: '比較會員機構',
      report: '建立研究報告',
      governance: '檢視資料治理',
    },
    resources: {
      title: '資源',
      intro: '從官方來源、研究方法到比較框架，快速找到可用的公開研究資源。',
      source: '瀏覽官方來源',
      emptyTitle: 'ACSIC 活動資料庫 - 規劃中',
      emptyText: '只有完成官方出處、日期與原始語言登錄的活動材料才會刊登。',
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
  const countries = useMemo(
    () =>
      [
        ...new Map(
          institutions.map((record) => [record.countryCode, record.countryName[locale]]),
        ).values(),
      ].sort((left, right) => left.localeCompare(right, locale)),
    [locale],
  );
  const networkStats = [
    [c.formalMembers, membershipStats.formalMembers],
    [c.observer, membershipStats.observers],
    [c.countriesEconomies, membershipStats.countriesEconomies],
    [c.institutionsCovered, membershipStats.institutionsCovered],
  ] as const;
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
            <a className="button secondary" href={`#${routePath(locale, 'compare')}`}>
              {c.secondary}
            </a>
          </div>
          <a className="text-link" href={`#${routePath(locale, 'overview')}`}>
            {c.tertiary}
          </a>
        </div>
        <aside className="network-hero" aria-label={c.networkTitle}>
          <h2>{c.networkTitle}</h2>
          <dl className="network-stats">
            {networkStats.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <section className="network-countries" aria-labelledby="network-countries-title">
            <h3 id="network-countries-title">{c.acrossAsia}</h3>
            <p>{countries.join(', ')}</p>
          </section>
          <a className="network-link" href={`#${routePath(locale, 'members')}`}>
            {c.exploreAll}
          </a>
        </aside>
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
      <section className="section-shell boundary-section home-boundary">
        <div>
          <h3>{c.boundaryTitle}</h3>
          <p>{c.boundary}</p>
        </div>
      </section>
    </>
  );
}

export function OverviewPage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].overview;
  const countryGroups = [
    ...new Map(institutions.map((record) => [record.countryCode, record.countryName])).entries(),
  ];
  const roleGroups = [
    ...new Map(
      institutions.map((record) => [record.institutionRoleCategory, record.type]),
    ).entries(),
  ];
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
      <dl
        className="overview-facts"
        aria-label={locale === 'en' ? 'ACSIC key facts' : 'ACSIC 一覽'}
      >
        {[
          [locale === 'en' ? 'Formal members' : '正式會員', membershipStats.formalMembers],
          [locale === 'en' ? 'Observer' : '觀察員', membershipStats.observers],
          [
            locale === 'en' ? 'Countries / economies' : '國家／經濟體',
            membershipStats.countriesEconomies,
          ],
          [
            locale === 'en' ? 'Institutions covered' : '涵蓋機構',
            membershipStats.institutionsCovered,
          ],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="overview-columns">
        <section>
          <h2>{locale === 'en' ? 'Members across Asia' : '亞洲會員分布'}</h2>
          <div className="country-groups">
            {countryGroups.map(([countryCode, country]) => (
              <article key={countryCode}>
                <h3>{country[locale]}</h3>
                <ul>
                  {institutions
                    .filter((record) => record.countryCode === countryCode)
                    .map((record) => (
                      <li key={record.id}>
                        {record.institutionAbbreviation} -{' '}
                        {record.acsicMembershipStatus === 'member'
                          ? locale === 'en'
                            ? 'Member'
                            : '正式會員'
                          : locale === 'en'
                            ? 'Observer'
                            : '觀察員'}
                      </li>
                    ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2>{locale === 'en' ? 'Institutional diversity' : '制度多樣性'}</h2>
          <p>
            {locale === 'en'
              ? 'ACSIC members do not all share one institutional model.'
              : 'ACSIC 會員並不都是同一種信用保證機構。'}
          </p>
          <ul className="role-list">
            {roleGroups.map(([role, label]) => (
              <li key={role}>{label[locale]}</li>
            ))}
          </ul>
        </section>
      </div>
      <p className="official-source-link">
        <a href="https://www.smeg.org.tw/en/basic/?node=10104" target="_blank" rel="noreferrer">
          {locale === 'en' ? 'Official source' : '官方來源'}
        </a>
      </p>
      <div className="knowledge-actions">
        <a className="button primary" href={`#${routePath(locale, 'members')}`}>
          {locale === 'en' ? 'Explore institutions' : '探索 21 家機構'}
        </a>
        <a className="button secondary" href={`#${routePath(locale, 'compare')}`}>
          {locale === 'en' ? 'Compare institutions' : '比較會員機構'}
        </a>
        <a className="button secondary" href={`#${routePath(locale, 'data-pilot')}`}>
          {locale === 'en' ? 'View verified data' : '查看官方量化資料'}
        </a>
      </div>
    </section>
  );
}

const systemCards = [
  {
    id: 'taiwan',
    title: {
      en: 'Taiwan: lender-led guarantee pathways',
      'zh-TW': '臺灣：由金融機構主導的保證途徑',
    },
    institution: { en: 'TSMEG', 'zh-TW': '中小企業信用保證基金（TSMEG）' },
    items: [
      {
        title: { en: 'Indirect guarantee', 'zh-TW': '間接保證' },
        text: {
          en: 'An SME applies through a lending institution. The institution performs its review and submits the case to TSMEG for a guarantee letter.',
          'zh-TW':
            '中小企業向金融機構申請融資；金融機構完成審查後，將案件送交 TSMEG 辦理保證並取得保證書。',
        },
      },
      {
        title: { en: 'Batch guarantee', 'zh-TW': '批次保證' },
        text: {
          en: 'The official scheme page distinguishes this route from indirect guarantee: lending is granted before the guarantee referral is submitted.',
          'zh-TW': '官方制度頁面區分此途徑與間接保證：金融機構先核貸，再送交保證。',
        },
      },
      {
        title: { en: 'Other documented models', 'zh-TW': '其他已記錄模式' },
        text: {
          en: 'Direct and co-guarantee remain recorded in TSMEG’s governed institution profile; detailed process claims are withheld pending source-specific verification.',
          'zh-TW':
            '直接保證與共同保證仍保留於 TSMEG 的治理後機構檔案；個別流程細節待取得對應官方來源後才刊登。',
        },
      },
    ],
    sourceIds: ['tsmeg-indirect-guarantee'],
  },
  {
    id: 'japan',
    title: { en: 'Japan: differentiated institutional roles', 'zh-TW': '日本：分工明確的機構角色' },
    institution: { en: 'JFG and JFC', 'zh-TW': 'JFG 與 JFC' },
    items: [
      {
        title: { en: 'Credit guarantee network', 'zh-TW': '信用保證網絡' },
        text: {
          en: 'JFG coordinates and supports Japan’s nationwide network of 51 credit guarantee corporations.',
          'zh-TW': 'JFG 協調並支援日本全國 51 家信用保證協會網絡。',
        },
      },
      {
        title: { en: 'Credit insurance role', 'zh-TW': '信用保險角色' },
        text: {
          en: 'JFC’s SME Unit includes credit insurance programmes within its policy-finance functions. Direct lending is not used as a comparison value in this hub.',
          'zh-TW':
            'JFC 的中小企業事業設有信用保險方案，屬其政策金融職能的一部分；本平台不以直接融資作為比較數值。',
        },
      },
    ],
    sourceIds: ['jfg-credit-guarantee-system-2025', 'jfc-operational-performance-2025'],
  },
  {
    id: 'korea-kodit',
    title: {
      en: 'Republic of Korea: KODIT programme categories',
      'zh-TW': '韓國：KODIT 的方案類別',
    },
    institution: {
      en: 'Korea Credit Guarantee Fund (KODIT)',
      'zh-TW': '韓國信用保證基金（KODIT）',
    },
    items: [
      {
        title: { en: 'Publicly documented scope', 'zh-TW': '已公開記錄的範圍' },
        text: {
          en: 'The governed profile identifies credit guarantee, credit insurance, infrastructure guarantee and P-CBO guarantee among KODIT’s documented functions and categories.',
          'zh-TW':
            '治理後檔案記錄 KODIT 的信用保證、信用保險、基礎建設保證與 P-CBO 保證等職能與類別。',
        },
      },
      {
        title: { en: 'Comparability boundary', 'zh-TW': '可比性界線' },
        text: {
          en: 'Coverage ratios, guarantee fees and loss-related metrics are not presented here without directly verified, comparable official evidence.',
          'zh-TW':
            '未取得可直接查證且可比較的官方證據前，本頁不刊登保證成數、保證費或損失相關指標。',
        },
      },
    ],
    sourceIds: ['kodit-kr-profile'],
  },
  {
    id: 'korea-kotec',
    title: {
      en: 'Republic of Korea: technology appraisal in guarantee review',
      'zh-TW': '韓國：保證審查中的技術評價',
    },
    institution: { en: 'KOTEC (Kibo)', 'zh-TW': 'KOTEC（Kibo）' },
    items: [
      {
        title: { en: 'Individual approach', 'zh-TW': '逐案審查' },
        text: {
          en: 'KOTEC describes a case-by-case guarantee review that assesses a technology project’s commercial viability and risks before a decision.',
          'zh-TW': 'KOTEC 說明其逐案保證審查：在決定前評估技術專案的商業可行性與風險。',
        },
      },
      {
        title: { en: 'AIRATE technology appraisal', 'zh-TW': 'AIRATE 技術評價' },
        text: {
          en: 'AIRATE is described as a structured, quantitative and data-driven approach that considers future potential and non-financial factors.',
          'zh-TW': 'AIRATE 被說明為結構化、量化且資料導向的方法，並納入未來潛力與非財務因素。',
        },
      },
    ],
    sourceIds: ['kotec-guarantee-key-features', 'kotec-airate-main-features'],
  },
] as const;

export function SystemsPage() {
  const { locale } = useLocale();
  const c = pageCopy[locale].systems;
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="system-grid">
        {systemCards.map((card) => (
          <article className="system-card" key={card.id}>
            <p className="eyebrow">{card.institution[locale]}</p>
            <h2>{card.title[locale]}</h2>
            <div className="system-card-items">
              {card.items.map((item) => (
                <section key={item.title.en}>
                  <h3>{item.title[locale]}</h3>
                  <p>{item.text[locale]}</p>
                </section>
              ))}
            </div>
            <p className="official-source-link">
              {card.sourceIds.map((sourceId, index) => {
                const source = sourceRegistry.find((item) => item.sourceId === sourceId);
                if (!source) return null;
                return (
                  <span key={sourceId}>
                    {index > 0 ? ' · ' : ''}
                    <a href={source.finalResolvedUrl} target="_blank" rel="noreferrer">
                      {locale === 'en' ? 'Official source' : '官方來源'}
                    </a>
                  </span>
                );
              })}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ReferenceInstitutionsPage() {
  const { locale } = useLocale();
  const records = institutions.filter((record) => record.referenceSet);
  const statusLabel = (status: string) =>
    locale === 'en'
      ? status.replaceAll('_', ' ')
      : status === 'complete'
        ? '完整'
        : status === 'partial'
          ? '部分完成'
          : '證據不足';
  return (
    <section className="section-shell page-section">
      <PageHeader
        title={locale === 'en' ? 'Reference Institutions' : '標竿研究機構'}
        intro={
          locale === 'en'
            ? 'Seven institutionally diverse cases anchor Level 2 research and future comparison design.'
            : '以七個制度角色多元的機構案例，作為 Level 2 研究與未來比較設計的基礎。'
        }
      />
      <div className="research-notice" role="note">
        <strong>{locale === 'en' ? 'Research boundary' : '研究邊界'}</strong>
        <p>{referenceSetDisclaimer[locale]}</p>
        <p>{researchPriorityDisclaimer[locale]}</p>
      </div>
      <div className="reference-grid">
        {records.map((record) => (
          <article className="reference-card" key={record.id}>
            <div className="record-title">
              <div>
                <span className="eyebrow">
                  {record.countryName[locale]} · {record.institutionAbbreviation}
                </span>
                <h2>{record.name[locale]}</h2>
              </div>
              <span className={`status ${record.level2Status}`}>
                {statusLabel(record.level2Status)}
              </span>
            </div>
            <p className="reference-role">{record.referenceSetRole?.[locale]}</p>
            <p>{record.referenceSetRationale?.[locale]}</p>
            <dl className="metric-list">
              <div>
                <dt>{locale === 'en' ? 'Level 2 completion' : 'Level 2 完成度'}</dt>
                <dd>{record.level2Completion}%</dd>
              </div>
              <div>
                <dt>{locale === 'en' ? 'Evidence objects' : '證據物件'}</dt>
                <dd>{Object.values(record.fieldEvidence).flat().length}</dd>
              </div>
              <div>
                <dt>{locale === 'en' ? 'Research priority' : '研究優先級'}</dt>
                <dd>
                  {record.researchPriority.score}/20 · {record.researchPriority.priorityBand}
                </dd>
              </div>
            </dl>
            <p>
              <strong>{locale === 'en' ? 'Research role: ' : '研究角色：'}</strong>
              {record.referenceSetRole?.[locale]}
            </p>
            <p>
              <strong>{locale === 'en' ? 'Remaining gaps: ' : '待補缺口：'}</strong>
              {record.missingFields.length
                ? record.missingFields
                    .map(
                      (field) =>
                        (level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale],
                    )
                    .join(locale === 'en' ? ', ' : '、')
                : locale === 'en'
                  ? 'None under the current Level 2 standard'
                  : '目前 Level 2 標準下無缺口'}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ComparativeFrameworkPage() {
  const { locale } = useLocale();
  const categories = [...new Set(indicatorDictionary.map((item) => item.category))];
  return (
    <section className="section-shell page-section">
      <PageHeader
        title={locale === 'en' ? 'Comparative Indicator Framework' : '比較指標框架'}
        intro={
          locale === 'en'
            ? 'A governed dictionary for future Level 3 data collection, with explicit comparability limits.'
            : '供未來 Level 3 資料蒐集使用的治理型指標字典，並明確標示可比性限制。'
        }
      />
      <div className="research-notice" role="note">
        <strong>{locale === 'en' ? 'No performance ranking' : '不作績效排名'}</strong>
        <p>
          {locale === 'en'
            ? 'Indicators describe disclosed activity under different mandates and definitions. They must not be used as a league table.'
            : '各指標描述不同法定任務與定義下的公開業務，不得作為機構績效排行榜。'}
        </p>
        <p>
          {locale === 'en'
            ? `${indicatorDictionaryTitle}. Production Level 3 values: ${productionLevel3Values.length}; verified pilot records only.`
            : `${indicatorDictionaryTitle}。正式 Level 3 數值：${productionLevel3Values.length}；僅含完成查證的試辦資料。`}
        </p>
      </div>
      <div className="framework-summary">
        <strong>{indicatorDictionary.length}</strong>
        <span>{locale === 'en' ? 'governed indicators' : '個治理指標'}</span>
        <strong>{categories.length}</strong>
        <span>{locale === 'en' ? 'categories' : '個分類'}</span>
      </div>
      <div className="indicator-groups">
        {categories.map((category) => (
          <section key={category} className="indicator-group">
            <h2>{indicatorCategoryLabels[category][locale]}</h2>
            {indicatorDictionary
              .filter((indicator) => indicator.category === category)
              .map((indicator) => (
                <details key={indicator.indicatorId}>
                  <summary>
                    <span>{indicator.name[locale]}</span>
                    <small>{indicator.comparabilityLevel.replaceAll('_', ' ')}</small>
                  </summary>
                  <div className="indicator-detail">
                    <p>{indicator.definition[locale]}</p>
                    <dl>
                      <div>
                        <dt>{locale === 'en' ? 'Unit' : '單位'}</dt>
                        <dd>{indicator.valueType}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'en' ? 'Time basis' : '時間基礎'}</dt>
                        <dd>{indicator.timeBasis.replaceAll('_', ' ')}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'en' ? 'Comparability risk' : '可比性風險'}</dt>
                        <dd>
                          {indicator.comparabilityLevel.replaceAll('_', ' ')} —{' '}
                          {indicator.notes[locale]}
                        </dd>
                      </div>
                      <div>
                        <dt>{locale === 'en' ? 'Do not compare with' : '不可直接比較'}</dt>
                        <dd>{indicator.notComparableWith.join(', ') || '—'}</dd>
                      </div>
                    </dl>
                  </div>
                </details>
              ))}
          </section>
        ))}
      </div>
      <h2>{locale === 'en' ? 'Level 3 pilot readiness' : 'Level 3 試辦準備度'}</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{locale === 'en' ? 'Institution' : '機構'}</th>
              <th>{locale === 'en' ? 'Readiness' : '準備度'}</th>
              <th>{locale === 'en' ? 'Comparability risk' : '可比性風險'}</th>
              <th>{locale === 'en' ? 'Research note' : '研究說明'}</th>
            </tr>
          </thead>
          <tbody>
            {level3PilotReadiness.map((item) => {
              const institution = institutions.find((record) => record.id === item.institutionId)!;
              return (
                <tr key={item.institutionId}>
                  <th scope="row">{institution.name[locale]}</th>
                  <td>{item.pilotReadiness.replaceAll('_', ' ')}</td>
                  <td>{item.comparabilityRisk}</td>
                  <td>{item.rationale[locale]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
  const resources = [
    [
      'sources',
      locale === 'en' ? 'Official Sources' : '官方來源',
      locale === 'en'
        ? 'Browse the official webpages and documents used by this hub.'
        : '瀏覽本平台使用的官方網頁與文件。',
    ],
    [
      'governance',
      locale === 'en' ? 'Research Methodology' : '研究方法',
      locale === 'en'
        ? 'Understand source handling, translations and publication checks.'
        : '了解來源處理、翻譯與發布檢核方式。',
    ],
    [
      'framework',
      locale === 'en' ? 'Comparative Indicator Framework' : '比較指標框架',
      locale === 'en'
        ? 'Review the governed definitions used for comparative research.'
        : '檢視比較研究所使用的治理定義。',
    ],
    [
      'reference',
      locale === 'en' ? 'Reference Institutions' : '標竿研究機構',
      locale === 'en'
        ? 'See the seven evidence-led reference cases.'
        : '查看七個以證據為本的參考案例。',
    ],
    [
      'reports',
      locale === 'en' ? 'Reports' : '研究報告',
      locale === 'en'
        ? 'Create bilingual, source-aware research outputs.'
        : '建立雙語且保留來源脈絡的研究輸出。',
    ],
  ] as const;
  return (
    <section className="section-shell page-section">
      <PageHeader title={c.title} intro={c.intro} />
      <div className="resource-grid">
        {resources.map(([page, title, text]) => (
          <article key={page}>
            <h2>{title}</h2>
            <p>{text}</p>
            <a href={`#${routePath(locale, page)}`}>
              {locale === 'en' ? 'Open resource' : '開啟資源'}
            </a>
          </article>
        ))}
      </div>
      <div className="state-message resource-planned">
        <h2>{c.emptyTitle}</h2>
        <p>{c.emptyText}</p>
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

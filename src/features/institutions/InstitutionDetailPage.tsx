import { PageHeader } from '../../components/Layout';
import type { ReactNode } from 'react';
import { institutions } from '../../data/institutions';
import { level2FieldLabels } from '../../data/level2-standards';
import { useLocale } from '../../i18n';
import { routePath } from '../../routing';
import type { Institution, Locale } from '../../types';
import { displayValue } from '../../utils/core';

const copy = {
  en: {
    title: 'Institution profile',
    intro: 'A shareable, source-traceable profile from the ACSIC public institution dataset.',
    back: 'Back to all institutions',
    home: 'Back to explorer home',
    member: 'Member',
    observer: 'Observer',
    atGlance: 'At a glance',
    officialName: 'Official English name',
    nativeName: 'Official native-language name',
    translatedName: 'Traditional Chinese research name',
    translationStatus: 'Translation status',
    role: 'Institution type',
    established: 'Established year',
    website: 'Official website',
    mandate: 'Mandate',
    serviceTargets: 'Service targets',
    functions: 'Major functions',
    framework: 'Institutional framework',
    legal: 'Legal basis',
    authority: 'Supervising or oversight relationship',
    governance: 'Governance type',
    funding: 'Funding or capital basis',
    scope: 'Geographic scope',
    research: 'Research details & evidence',
    level2: 'Level 2 status',
    confidence: 'Confidence',
    source: 'Official sources',
    openSource: 'Open official source',
    noItems: 'None recorded.',
    official: 'official',
    research_translation: 'research translation',
    pending: 'pending',
    pendingOfficial: 'Pending official-source confirmation',
    nonApplicable: 'Documented non-applicable fields',
    sourceWarning: 'Source warning:',
    temporarilyUnavailable: 'Temporarily unavailable',
    notFound: 'Institution not found',
    notFoundText: 'This identifier does not match a governed ACSIC institution record.',
  },
  'zh-TW': {
    title: '機構檔案',
    intro: '來自 ACSIC 公開機構資料集，可直接分享並追溯來源的機構檔案。',
    back: '返回全部會員機構',
    home: '返回探索首頁',
    member: '正式會員',
    observer: '觀察員',
    atGlance: '機構概覽',
    officialName: '官方英文名稱',
    nativeName: '官方原生語言名稱',
    translatedName: '繁體中文研究名稱',
    translationStatus: '翻譯狀態',
    role: '機構類型',
    established: '設立年份',
    website: '官方網站',
    mandate: '機構任務',
    serviceTargets: '服務對象',
    functions: '主要功能',
    framework: '制度架構',
    legal: '法源依據',
    authority: '主管、監督或治理關係',
    governance: '治理型態',
    funding: '資金或資本基礎',
    scope: '地理範圍',
    research: '研究細節與證據',
    level2: 'Level 2 狀態',
    confidence: '資料可信度',
    source: '官方來源',
    openSource: '開啟官方來源',
    noItems: '目前沒有紀錄。',
    official: '官方',
    research_translation: '研究翻譯',
    pending: '待處理',
    pendingOfficial: '待官方來源確認',
    nonApplicable: '正式記錄的不適用欄位',
    sourceWarning: '來源警示：',
    temporarilyUnavailable: '暫時無法存取',
    notFound: '找不到此機構',
    notFoundText: '此識別碼不符合目前治理中的 ACSIC 機構紀錄。',
  },
} as const;

function list(items: Institution['serviceTargets'], locale: Locale, empty: string) {
  return items.length ? (
    <ul>
      {items.map((item) => (
        <li key={item.en}>{item[locale]}</li>
      ))}
    </ul>
  ) : (
    <p>{empty}</p>
  );
}

export function InstitutionDetailPage({ institutionId }: { institutionId: string }) {
  const { locale } = useLocale();
  const c = copy[locale];
  const record = institutions.find((item) => item.id === institutionId);

  if (!record) {
    return (
      <section className="section-shell page-section institution-detail-page">
        <PageHeader title={c.notFound} intro={c.notFoundText} />
        <a className="button secondary" href={`#${routePath(locale, 'members')}`}>
          {c.back}
        </a>
      </section>
    );
  }

  const status = record.acsicMembershipStatus === 'member' ? c.member : c.observer;
  return (
    <section className="section-shell page-section institution-detail-page">
      <a className="text-link institution-back-link" href={`#${routePath(locale, 'members')}`}>
        ← {c.back}
      </a>
      <a className="text-link institution-home-link" href={`#${routePath(locale, 'home')}`}>
        {c.home}
      </a>
      <PageHeader title={record.name[locale]} intro={c.intro} />
      <div className="institution-detail-identity">
        <p>
          <strong>{record.institutionAbbreviation}</strong> · {record.countryName[locale]} ·{' '}
          {record.type[locale]} · ACSIC {status}
        </p>
        <p className="institution-official-name">{record.name.officialEnglish}</p>
      </div>

      <section className="detail-section">
        <h2>{c.atGlance}</h2>
        <div className="detail-grid">
          <DetailField label={c.officialName} value={record.name.officialEnglish} />
          <DetailField
            label={c.nativeName}
            value={
              record.name.nativeName.status === 'official'
                ? `${record.name.nativeName.value} (${record.name.nativeName.language})`
                : c.pendingOfficial
            }
          />
          <DetailField label={c.translatedName} value={record.name['zh-TW']} />
          <DetailField label={c.translationStatus} value={c[record.name.zhTWTranslationStatus]} />
          <DetailField label={c.role} value={record.type[locale]} />
          <DetailField label={c.established} value={displayValue(record.establishedYear, locale)} />
          <DetailField
            label={c.website}
            value={
              <a href={record.officialWebsite} target="_blank" rel="noreferrer">
                {record.officialWebsite}
              </a>
            }
          />
        </div>
      </section>

      <section className="detail-section">
        <h2>{c.mandate}</h2>
        <p>{record.mandate[locale]}</p>
        <div className="detail-grid">
          <section>
            <h3>{c.serviceTargets}</h3>
            {list(record.serviceTargets, locale, c.noItems)}
          </section>
          <section>
            <h3>{c.functions}</h3>
            {list(record.majorFunctions, locale, c.noItems)}
          </section>
        </div>
      </section>

      <section className="detail-section">
        <h2>{c.framework}</h2>
        <div className="detail-grid">
          <DetailField label={c.legal} value={displayValue(record.legalBasis, locale)} />
          <DetailField
            label={c.authority}
            value={displayValue(record.supervisingOrOversightAuthority, locale)}
          />
          <DetailField label={c.governance} value={displayValue(record.governanceType, locale)} />
          <DetailField
            label={c.funding}
            value={displayValue(record.fundingOrCapitalBasis, locale)}
          />
          <DetailField label={c.scope} value={displayValue(record.geographicScope, locale)} />
        </div>
      </section>

      <details className="research-details institution-research-details">
        <summary>{c.research}</summary>
        <div className="detail-grid">
          <DetailField
            label={c.level2}
            value={`${record.level2Status} · ${record.level2Completion}%`}
          />
          <DetailField
            label={c.confidence}
            value={`${
              locale === 'en'
                ? record.confidenceLevel.charAt(0).toUpperCase() + record.confidenceLevel.slice(1)
                : record.confidenceLevel === 'high'
                  ? '高'
                  : record.confidenceLevel === 'medium'
                    ? '中'
                    : '低'
            } · ${record.confidenceScore}/100`}
          />
        </div>
        <section className="sources-block">
          <h3>{c.source}</h3>
          {record.sourceReferences.map((item) => (
            <article className="source-card" key={item.sourceId}>
              <h4>{item.title}</h4>
              <p>
                {item.publisher} · {item.originalLanguage} · {item.accessedDate}
              </p>
              {(item.stalenessWarning || item.accessStatus === 'temporarily_unavailable') && (
                <p className="warning">
                  <strong>{c.sourceWarning}</strong>{' '}
                  {item.accessStatus === 'temporarily_unavailable'
                    ? c.temporarilyUnavailable
                    : locale === 'en'
                      ? 'Source may be stale.'
                      : '來源可能已過時。'}
                </p>
              )}
              <a href={item.url} target="_blank" rel="noreferrer">
                {c.openSource}
              </a>
            </article>
          ))}
        </section>
        {record.notApplicableFields.length > 0 && (
          <section className="sources-block">
            <h3>{c.nonApplicable}</h3>
            <ul>
              {record.notApplicableFields.map((item) => (
                <li key={item.field}>{item.reason[locale]}</li>
              ))}
            </ul>
          </section>
        )}
        {record.missingFields.length > 0 && (
          <section className="sources-block">
            <h3>{locale === 'en' ? 'Pending fields' : '待查證欄位'}</h3>
            <ul>
              {record.missingFields.map((field) => (
                <li key={field}>
                  {(level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale]}
                </li>
              ))}
            </ul>
          </section>
        )}
      </details>
    </section>
  );
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <section>
      <h3>{label}</h3>
      <p>{value}</p>
    </section>
  );
}

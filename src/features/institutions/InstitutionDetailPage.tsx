import { useEffect } from 'react';
import { PageHeader } from '../../components/Layout';
import type { ReactNode } from 'react';
import { institutions, sourceById } from '../../data/institutions';
import { level2FieldLabels } from '../../data/level2-standards';
import { useLocale } from '../../i18n';
import { routePath } from '../../routing';
import type { Institution, Locale, LocalizedText } from '../../types';
import { displayValue } from '../../utils/core';
import { buildInstitutionSnapshot, institutionExperienceCopy } from './institutionExperience';
import { InstitutionMetrics } from './InstitutionSnapshot';

const copy = {
  en: {
    title: 'Institution profile',
    back: 'Back to all institutions',
    home: 'Back to Asia Explorer',
    member: 'Member',
    observer: 'Observer',
    economy: 'Economy',
    institutionType: 'Institution type',
    established: 'Established',
    atGlance: 'At a glance',
    officialData: 'Official data',
    systemEvidence: 'System and programme evidence',
    research: 'Research and source details',
    officialEnglish: 'Official English name',
    nativeName: 'Official native-language name',
    translatedName: 'Traditional Chinese research name',
    translationStatus: 'Translation status',
    mandate: 'Mandate',
    serviceTargets: 'Service targets',
    functions: 'Major functions',
    framework: 'Institutional framework',
    legal: 'Legal basis',
    authority: 'Supervising or oversight relationship',
    governance: 'Governance type',
    funding: 'Funding or capital basis',
    scope: 'Geographic scope',
    officialPublications: 'Official publications',
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
    pendingFields: 'Pending fields',
    sourceWarning: 'Source warning:',
    temporarilyUnavailable: 'Temporarily unavailable',
    evidence: 'Field evidence',
    verifiedFacts: 'Verified facts',
    inferences: 'Analytical inferences',
    unresolved: 'Unresolved conflicts',
    pendingItems: 'Pending research items',
    notFound: 'Institution not found',
    notFoundText: 'This identifier does not match a governed ACSIC institution record.',
  },
  'zh-TW': {
    title: '機構檔案',
    back: '返回全部會員機構',
    home: '返回亞洲探索器',
    member: '正式會員',
    observer: '觀察員',
    economy: '國家／經濟體',
    institutionType: '機構類型',
    established: '設立年份',
    atGlance: '機構概覽',
    officialData: '官方數據',
    systemEvidence: '制度與方案證據',
    research: '研究與來源細節',
    officialEnglish: '官方英文名稱',
    nativeName: '官方原生語言名稱',
    translatedName: '繁體中文研究名稱',
    translationStatus: '翻譯狀態',
    mandate: '機構任務',
    serviceTargets: '服務對象',
    functions: '主要功能',
    framework: '制度架構',
    legal: '法源依據',
    authority: '主管、監督或治理關係',
    governance: '治理型態',
    funding: '資金或資本基礎',
    scope: '地理範圍',
    officialPublications: '官方出版品',
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
    pendingFields: '待查證欄位',
    sourceWarning: '來源警示：',
    temporarilyUnavailable: '暫時無法存取',
    evidence: '欄位證據',
    verifiedFacts: '已查證事實',
    inferences: '分析推論',
    unresolved: '尚未解決的差異',
    pendingItems: '待辦研究事項',
    notFound: '找不到此機構',
    notFoundText: '此識別碼不符合目前治理中的 ACSIC 機構紀錄。',
  },
} as const;

function list(items: Institution['serviceTargets'], locale: Locale, empty: string) {
  return items.length ? (
    <ul>
      {items.map((item, index) => (
        <li key={`${item.en}-${index}`}>{item[locale]}</li>
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [institutionId]);

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

  const snapshot = buildInstitutionSnapshot(record, locale, 5);
  const status = record.acsicMembershipStatus === 'member' ? c.member : c.observer;
  const experience = institutionExperienceCopy[locale];
  const nativeName =
    record.name.nativeName.status === 'official' && record.name.nativeName.value
      ? `${record.name.nativeName.value} (${record.name.nativeName.language})`
      : c.pendingOfficial;
  const establishedEvidence = record.fieldEvidence.establishedYear?.length
    ? displayValue(record.establishedYear, locale)
    : null;

  return (
    <section className="section-shell page-section institution-detail-page">
      <header className="institution-profile-hero">
        <nav className="institution-profile-navigation" aria-label={c.title}>
          <a className="text-link institution-back-link" href={`#${routePath(locale, 'members')}`}>
            ← {c.back}
          </a>
          <a className="text-link institution-home-link" href={`#${routePath(locale, 'home')}`}>
            {c.home}
          </a>
        </nav>
        <p className="eyebrow">
          {record.countryName[locale]} · {status}
        </p>
        <h1>{record.name[locale]}</h1>
        <p className="institution-profile-identifiers">
          <strong>{record.institutionAbbreviation}</strong> · {record.type[locale]}
        </p>
        <p className="institution-profile-summary">
          {snapshot.roleSummary ?? record.summary[locale]}
        </p>
        {record.name.officialEnglish !== record.name[locale] ? (
          <p className="institution-official-name">{record.name.officialEnglish}</p>
        ) : null}
        <div className="institution-profile-actions">
          <a
            className="button primary"
            href={snapshot.officialWebsite}
            target="_blank"
            rel="noreferrer"
            aria-label={`${experience.officialWebsite}: ${record.name[locale]} (${experience.opensNewTab})`}
          >
            {experience.officialWebsite} ↗
          </a>
          <a className="button secondary" href={`#${routePath(locale, 'members')}`}>
            {c.back}
          </a>
        </div>
      </header>

      <section
        className="detail-section institution-at-a-glance"
        aria-labelledby="institution-glance-title"
      >
        <h2 id="institution-glance-title">{c.atGlance}</h2>
        <div className="detail-grid">
          <DetailField label={c.economy} value={record.countryName[locale]} />
          <DetailField label={c.institutionType} value={record.type[locale]} />
          {establishedEvidence ? (
            <DetailField label={c.established} value={establishedEvidence} />
          ) : null}
          <DetailField label={status} value={record.acsicRoleNotes[locale]} />
        </div>
      </section>

      {snapshot.latestMetrics.length > 0 ? (
        <section className="detail-section" aria-labelledby="institution-official-data-title">
          <h2 id="institution-official-data-title">{c.officialData}</h2>
          <InstitutionMetrics snapshot={snapshot} locale={locale} provenance />
        </section>
      ) : null}

      {snapshot.systemHighlights.length > 0 ? (
        <section
          className="detail-section institution-evidence"
          aria-labelledby="institution-evidence-title"
        >
          <h2 id="institution-evidence-title">{c.systemEvidence}</h2>
          <ul className="institution-snapshot-highlights">
            {snapshot.systemHighlights.map((highlight, index) => (
              <li key={`${highlight.label}-${index}`}>
                <span className="institution-highlight-label">{highlight.label}</span>
                <span>{highlight.value}</span>
                {highlight.evidenceSummary ? <p>{highlight.evidenceSummary}</p> : null}
                {highlight.sources.length > 0 ? (
                  <ul className="institution-highlight-sources">
                    {highlight.sources.map((source) => (
                      <li key={source.sourceId}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {c.openSource}: {source.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="research-details institution-research-details">
        <summary>{c.research}</summary>
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
            <DetailField
              label={c.officialPublications}
              value={
                record.officialPublications.map((item) => item[locale]).join(' · ') || c.noItems
              }
            />
          </div>
        </section>
        <section className="detail-section">
          <h2>{c.systemEvidence}</h2>
          <div className="detail-grid">
            {Object.entries(record.typeSpecificProfile).map(([field, value]) => {
              if (value === null) return null;
              const text = Array.isArray(value)
                ? value.map((item) => item[locale]).join(' · ')
                : value[locale];
              if (!text) return null;
              return (
                <DetailField
                  key={field}
                  label={(level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale]}
                  value={text}
                />
              );
            })}
          </div>
        </section>
        <section className="detail-section">
          <h2>{c.title}</h2>
          <div className="detail-grid">
            <DetailField label={c.officialEnglish} value={record.name.officialEnglish} />
            <DetailField label={c.nativeName} value={nativeName} />
            <DetailField label={c.translatedName} value={record.name['zh-TW']} />
            <DetailField label={c.translationStatus} value={c[record.name.zhTWTranslationStatus]} />
            <DetailField
              label={c.level2}
              value={`${record.level2Status} · ${record.level2Completion}%`}
            />
            <DetailField
              label={c.confidence}
              value={`${record.confidenceLevel} · ${record.confidenceScore}/100`}
            />
          </div>
        </section>
        <section className="sources-block">
          <h3>{c.evidence}</h3>
          {Object.entries(record.fieldEvidence).map(([field, entries]) => (
            <section className="institution-field-evidence" key={field}>
              <h4>{(level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale]}</h4>
              {entries.map((entry) => {
                const source = sourceById.get(entry.sourceId);
                return (
                  <article key={entry.evidenceId}>
                    <p>{entry.evidenceSummary[locale]}</p>
                    <p>
                      {entry.pageOrSection} · {entry.verifiedDate}
                    </p>
                    {source ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {c.openSource}: {source.title} ↗
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </section>
          ))}
        </section>
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
                {c.openSource} ↗
              </a>
            </article>
          ))}
        </section>
        {record.notApplicableFields.length > 0 ? (
          <section className="sources-block">
            <h3>{c.nonApplicable}</h3>
            <ul>
              {record.notApplicableFields.map((item) => (
                <li key={item.field}>{item.reason[locale]}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {record.missingFields.length > 0 ? (
          <section className="sources-block">
            <h3>{c.pendingFields}</h3>
            <ul>
              {record.missingFields.map((field) => (
                <li key={field}>
                  {(level2FieldLabels[field] ?? { en: field, 'zh-TW': field })[locale]}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <ResearchNotes
          title={c.verifiedFacts}
          items={record.verifiedFacts.map((item) => item.statement)}
          locale={locale}
        />
        <ResearchNotes title={c.inferences} items={record.analysisInferences} locale={locale} />
        <ResearchNotes title={c.unresolved} items={record.unresolvedConflicts} locale={locale} />
        <ResearchNotes title={c.pendingItems} items={record.pendingItems} locale={locale} />
      </details>
    </section>
  );
}

function ResearchNotes({
  title,
  items,
  locale,
}: {
  title: string;
  items: LocalizedText[];
  locale: Locale;
}) {
  return items.length ? (
    <section className="sources-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${item.en}-${index}`}>{item[locale]}</li>
        ))}
      </ul>
    </section>
  ) : null;
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <section>
      <h3>{label}</h3>
      <p>{value}</p>
    </section>
  );
}

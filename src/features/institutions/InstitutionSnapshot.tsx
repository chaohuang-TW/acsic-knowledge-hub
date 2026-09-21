import type { ReactNode } from 'react';
import type { Institution, Locale } from '../../types';
import {
  buildInstitutionSnapshot,
  institutionExperienceCopy,
  type InstitutionSnapshot,
} from './institutionExperience';

type InstitutionSnapshotCardProps = {
  institution: Institution;
  locale: Locale;
  metricLimit?: 3 | 5;
  headingLevel?: 3 | 4;
  selected?: boolean;
  onSelect?: () => void;
  showProfileLink?: boolean;
  provenance?: boolean;
};

export function InstitutionSnapshotCard({
  institution,
  locale,
  metricLimit = 3,
  headingLevel = 3,
  selected = false,
  onSelect,
  showProfileLink = true,
  provenance = false,
}: InstitutionSnapshotCardProps) {
  const snapshot = buildInstitutionSnapshot(institution, locale, metricLimit);
  const c = institutionExperienceCopy[locale];
  const Heading = headingLevel === 4 ? 'h4' : 'h3';

  return (
    <article
      className={
        selected
          ? 'institution-snapshot-card network-institution-card is-selected'
          : 'institution-snapshot-card network-institution-card'
      }
      data-institution-id={institution.id}
      data-membership={institution.acsicMembershipStatus}
    >
      <header className="institution-snapshot-header network-card-heading">
        <span
          className={`network-badge${institution.acsicMembershipStatus === 'observer' ? ' observer' : ''}`}
        >
          {snapshot.membershipLabel}
        </span>
        <span className="network-abbreviation">{institution.institutionAbbreviation}</span>
      </header>
      <Heading>{institution.name[locale]}</Heading>
      {snapshot.roleSummary ? (
        <p className="institution-snapshot-role">{snapshot.roleSummary}</p>
      ) : null}

      {snapshot.systemHighlights.length > 0 ? (
        <section className="institution-snapshot-evidence" aria-label={c.systemHighlights}>
          <h4>{c.systemHighlights}</h4>
          <ul className="institution-snapshot-highlights">
            {snapshot.systemHighlights.map((highlight, index) => (
              <li key={`${highlight.label}-${index}`}>
                <span className="institution-highlight-label">{highlight.label}</span>
                <span>{highlight.value}</span>
                {provenance && highlight.sources.length > 0 ? (
                  <ul className="institution-highlight-sources">
                    {highlight.sources.map((source) => (
                      <li key={source.sourceId}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {c.openSource}: {source.title}
                        </a>
                        {highlight.evidenceSummary ? (
                          <span> · {highlight.evidenceSummary}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <InstitutionMetrics snapshot={snapshot} locale={locale} provenance={provenance} />

      <div className="network-card-actions institution-snapshot-actions">
        {onSelect ? (
          <button
            type="button"
            className="button secondary network-card-select"
            aria-pressed={selected}
            onClick={onSelect}
          >
            {selected ? c.selected : c.select}
          </button>
        ) : null}
        {showProfileLink ? (
          <a className="button secondary" href={`#${snapshot.profilePath}`}>
            {c.viewProfile}
          </a>
        ) : null}
        {snapshot.officialWebsite ? (
          <a
            href={snapshot.officialWebsite}
            target="_blank"
            rel="noreferrer"
            aria-label={`${c.officialWebsite}: ${institution.name[locale]} (${c.opensNewTab})`}
          >
            {c.officialWebsite} ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function InstitutionMetrics({
  snapshot,
  locale,
  provenance = false,
}: {
  snapshot: InstitutionSnapshot;
  locale: Locale;
  provenance?: boolean;
}) {
  const c = institutionExperienceCopy[locale];
  if (snapshot.latestMetrics.length === 0) return null;

  return (
    <section className="institution-official-metrics" aria-label={c.officialMetrics}>
      <h3>{c.officialMetrics}</h3>
      <div className="institution-metric-strip">
        {snapshot.latestMetrics.map((metric) => (
          <article className="institution-metric" key={metric.recordId}>
            <span className="institution-metric-period">{metric.periodLabel}</span>
            {metric.schemeName ? (
              <span className="institution-metric-scheme">{metric.schemeName}</span>
            ) : null}
            <strong>{metric.formattedValue}</strong>
            <span className="institution-metric-label">{metric.label}</span>
            <span className="institution-metric-unit">{metric.unit}</span>
            {metric.qualification ? (
              <span className="institution-metric-qualification">{metric.qualification}</span>
            ) : null}
            {provenance ? <MetricProvenance metric={metric} locale={locale} /> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function MetricProvenance({
  metric,
  locale,
}: {
  metric: InstitutionSnapshot['latestMetrics'][number];
  locale: Locale;
}) {
  const c = institutionExperienceCopy[locale];
  const record = metric.record;
  const sourceDate = record.source.publicationDate ?? '—';
  const mapping = record.normalized.status;
  const normalizationNotes = record.normalized.notes[locale];
  const comparabilityNotes = record.comparability.issues[locale];

  return (
    <details className="institution-metric-provenance">
      <summary>{c.provenance}</summary>
      <dl>
        <ProvenanceRow label={c.source} value={metric.sourceLabel} />
        <ProvenanceRow
          label={c.reportedValue}
          value={`${record.reported.value ?? '—'} ${record.reported.unit}`}
        />
        <ProvenanceRow
          label={c.reportingPeriod}
          value={record.reported.originalPeriodLabel ?? record.reported.periodLabel}
        />
        <ProvenanceRow label={c.publicationDate} value={sourceDate} />
        <ProvenanceRow label={c.definition} value={record.reported.definition[locale]} />
        <ProvenanceRow label={c.definitionMapping} value={mapping} />
        <ProvenanceRow label={c.normalization} value={normalizationNotes} />
        <ProvenanceRow
          label={c.comparability}
          value={
            comparabilityNotes.length ? comparabilityNotes.join(' ') : record.comparability.status
          }
        />
        <ProvenanceRow label={c.pageOrSection} value={record.source.pageOrSection} />
      </dl>
      <a href={metric.sourceUrl} target="_blank" rel="noreferrer">
        {c.openSource} ↗
      </a>
    </details>
  );
}

function ProvenanceRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

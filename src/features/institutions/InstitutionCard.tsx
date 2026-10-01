import { institutionPath } from '../../routing';
import { useLocale } from '../../i18n';
import type { Institution, Locale } from '../../types';

const copy = {
  en: {
    member: 'Member',
    observer: 'Observer',
    profile: 'View profile',
    website: 'Official website ↗',
    summary: 'Read summary',
  },
  'zh-TW': {
    member: '正式會員',
    observer: '觀察員',
    profile: '查看機構檔案',
    website: '官方網站 ↗',
    summary: '閱讀機構簡介',
  },
} as const;

function anchor(locale: Locale, path: string) {
  return `#${path}`;
}

export function InstitutionCard({
  record,
  onOpenProfile,
}: {
  record: Institution;
  onOpenProfile?: () => void;
}) {
  const { locale } = useLocale();
  const c = copy[locale];
  const membershipLabel = record.acsicMembershipStatus === 'member' ? c.member : c.observer;
  return (
    <article className="directory-card" data-institution-id={record.id}>
      <div className="directory-card__topline">
        <span className="directory-card__abbr">{record.institutionAbbreviation}</span>
        <span
          className={`membership-badge membership-badge--${record.acsicMembershipStatus}`}
          data-membership={record.acsicMembershipStatus}
        >
          {membershipLabel}
        </span>
      </div>
      <h3>{record.name[locale]}</h3>
      <p className="directory-card__type">{record.type[locale]}</p>
      <details className="directory-card__description">
        <summary>{c.summary}</summary>
        <p className="directory-card__summary">{record.summary[locale]}</p>
      </details>
      <div className="directory-card__actions">
        <a
          className="button"
          href={anchor(locale, institutionPath(locale, record.id))}
          onClick={onOpenProfile}
        >
          {c.profile}
        </a>
        <a
          className="button secondary"
          href={record.officialWebsite}
          target="_blank"
          rel="noreferrer"
        >
          {c.website}
        </a>
      </div>
    </article>
  );
}

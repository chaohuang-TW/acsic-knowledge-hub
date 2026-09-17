import type { AcsicMembershipStatus, InstitutionRoleCategory } from '../../types';
import type { DirectoryFilters, EconomyOption, InstitutionTypeOption } from './directoryUtils';

const copy = {
  en: {
    search: 'Search institutions',
    economy: 'Economy',
    type: 'Institution type',
    membership: 'Membership',
    allEconomies: 'All economies',
    all: 'All',
    member: 'Members',
    observer: 'Observer',
    clear: 'Clear filters',
  },
  'zh-TW': {
    search: '搜尋機構',
    economy: '國家／經濟體',
    type: '機構類型',
    membership: '會員身分',
    allEconomies: '全部',
    all: '全部',
    member: '正式會員',
    observer: '觀察員',
    clear: '清除篩選',
  },
} as const;

type Locale = keyof typeof copy;

export function InstitutionFilters({
  locale,
  filters,
  economies,
  types,
  onQueryChange,
  onEconomyChange,
  onTypeChange,
  onMembershipChange,
  onClear,
  clearDisabled,
}: {
  locale: Locale;
  filters: DirectoryFilters;
  economies: EconomyOption[];
  types: InstitutionTypeOption[];
  onQueryChange: (value: string) => void;
  onEconomyChange: (value: string) => void;
  onTypeChange: (value: InstitutionRoleCategory | 'all') => void;
  onMembershipChange: (value: AcsicMembershipStatus | 'all') => void;
  onClear: () => void;
  clearDisabled: boolean;
}) {
  const c = copy[locale];
  return (
    <form className="directory-filters" onSubmit={(event) => event.preventDefault()}>
      <label className="directory-filter directory-filter--search">
        <span>{c.search}</span>
        <input
          type="search"
          value={filters.query}
          placeholder={c.search}
          aria-label={c.search}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <label className="directory-filter">
        <span>{c.economy}</span>
        <select
          value={filters.economy}
          aria-label={c.economy}
          onChange={(event) => onEconomyChange(event.target.value)}
        >
          <option value="all">{c.allEconomies}</option>
          {economies.map((economy) => (
            <option key={economy.id} value={economy.id}>
              {economy.label[locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="directory-filter">
        <span>{c.type}</span>
        <select
          value={filters.type}
          aria-label={c.type}
          onChange={(event) => onTypeChange(event.target.value as InstitutionRoleCategory | 'all')}
        >
          <option value="all">{c.all}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label[locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="directory-filter">
        <span>{c.membership}</span>
        <select
          value={filters.membership}
          aria-label={c.membership}
          onChange={(event) =>
            onMembershipChange(event.target.value as AcsicMembershipStatus | 'all')
          }
        >
          <option value="all">{c.all}</option>
          <option value="member">{c.member}</option>
          <option value="observer">{c.observer}</option>
        </select>
      </label>
      <button
        className="button secondary directory-filter__clear"
        type="button"
        disabled={clearDisabled}
        onClick={onClear}
      >
        {c.clear}
      </button>
    </form>
  );
}

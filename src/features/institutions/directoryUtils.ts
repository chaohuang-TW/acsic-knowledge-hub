import { institutions, roleCategoryLabels } from '../../data/institutions';
import type {
  AcsicMembershipStatus,
  Institution,
  InstitutionRoleCategory,
  LocalizedText,
} from '../../types';

export type EconomyOption = {
  id: string;
  label: LocalizedText;
};

export type InstitutionTypeOption = {
  id: InstitutionRoleCategory;
  label: LocalizedText;
};

export type DirectoryFilters = {
  query: string;
  economy: string;
  type: InstitutionRoleCategory | 'all';
  membership: AcsicMembershipStatus | 'all';
};

export const directorySessionStorageKey = 'acsic-knowledge-hub-directory-session';

export type DirectorySession = {
  filters: DirectoryFilters;
  scrollY: number;
  savedAt: number;
};

const emptyDirectoryFilters: DirectoryFilters = {
  query: '',
  economy: 'all',
  type: 'all',
  membership: 'all',
};

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isRoleCategory(value: unknown): value is InstitutionRoleCategory {
  return typeof value === 'string' && value in roleCategoryLabels;
}

function isMembership(value: unknown): value is AcsicMembershipStatus {
  return value === 'member' || value === 'observer';
}

/** Keep session-restored filters inside the same governed vocabulary as the UI. */
export function normalizeDirectoryFilters(
  value: Partial<DirectoryFilters> | null | undefined,
): DirectoryFilters {
  return {
    query: typeof value?.query === 'string' ? value.query : emptyDirectoryFilters.query,
    economy: typeof value?.economy === 'string' ? value.economy : emptyDirectoryFilters.economy,
    type: isRoleCategory(value?.type) ? value.type : emptyDirectoryFilters.type,
    membership: isMembership(value?.membership)
      ? value.membership
      : emptyDirectoryFilters.membership,
  };
}

/** Read a directory hand-off saved before opening an institution profile. */
export function readDirectorySession(
  storage: Storage | null = getSessionStorage(),
): DirectorySession | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(directorySessionStorageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<DirectorySession>;
    return {
      filters: normalizeDirectoryFilters(candidate.filters),
      scrollY:
        typeof candidate.scrollY === 'number' && Number.isFinite(candidate.scrollY)
          ? Math.max(0, candidate.scrollY)
          : 0,
      savedAt:
        typeof candidate.savedAt === 'number' && Number.isFinite(candidate.savedAt)
          ? candidate.savedAt
          : 0,
    };
  } catch {
    return null;
  }
}

/** Save the current directory context so profile links behave like a reversible research trail. */
export function writeDirectorySession(
  filters: DirectoryFilters,
  scrollY: number,
  storage: Storage | null = getSessionStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(
      directorySessionStorageKey,
      JSON.stringify({
        filters: normalizeDirectoryFilters(filters),
        scrollY: Math.max(0, Number.isFinite(scrollY) ? scrollY : 0),
        savedAt: Date.now(),
      } satisfies DirectorySession),
    );
  } catch {
    // Storage can be disabled in private browsing; directory navigation remains usable.
  }
}

export function clearDirectorySession(storage: Storage | null = getSessionStorage()): void {
  try {
    storage?.removeItem(directorySessionStorageKey);
  } catch {
    // Storage can be disabled in private browsing; directory navigation remains usable.
  }
}

/** Accept q/economy/type/membership from a Pages-safe query string or hash hand-off. */
export function parseDirectoryQuery(
  search = typeof window === 'undefined' ? '' : window.location.search,
  hash = typeof window === 'undefined' ? '' : window.location.hash,
): Partial<DirectoryFilters> {
  const result: Partial<DirectoryFilters> = {};
  const queryStrings = [search];
  const hashQueryIndex = hash.indexOf('?');
  if (hashQueryIndex >= 0) queryStrings.push(hash.slice(hashQueryIndex));

  for (const queryString of queryStrings) {
    const params = new URLSearchParams(queryString);
    const query = params.get('q') ?? params.get('query');
    const economy = params.get('economy') ?? params.get('country');
    const type = params.get('type');
    const membership = params.get('membership');
    if (query && result.query === undefined) result.query = query;
    if (economy && result.economy === undefined) result.economy = economy;
    if (type && result.type === undefined) result.type = type as InstitutionRoleCategory;
    if (membership && result.membership === undefined) {
      result.membership = membership as AcsicMembershipStatus;
    }
  }
  return result;
}

/** Derive economy labels from the governed institution records only. */
export function getEconomies(records: readonly Institution[] = institutions): EconomyOption[] {
  const unique = new Map<string, LocalizedText>();
  records.forEach((record) => unique.set(record.countryCode, record.countryName));
  return [...unique.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((left, right) => left.label.en.localeCompare(right.label.en));
}

/** Derive institution type filters from the governed role categories. */
export function getInstitutionTypes(
  records: readonly Institution[] = institutions,
): InstitutionTypeOption[] {
  const unique = new Set(records.map((record) => record.institutionRoleCategory));
  return [...unique]
    .map((id) => ({ id, label: roleCategoryLabels[id] }))
    .sort((left, right) => left.label.en.localeCompare(right.label.en));
}

export function getMembershipStats(records: readonly Institution[] = institutions) {
  return {
    institutions: records.length,
    members: records.filter((record) => record.acsicMembershipStatus === 'member').length,
    observers: records.filter((record) => record.acsicMembershipStatus === 'observer').length,
    economies: new Set(records.map((record) => record.countryCode)).size,
  };
}

function searchableText(record: Institution) {
  return [
    record.institutionAbbreviation,
    record.name.en,
    record.name.officialEnglish,
    record.name['zh-TW'],
    record.name.nativeName.value ?? '',
    record.countryName.en,
    record.countryName['zh-TW'],
    record.summary.en,
    record.summary['zh-TW'],
    ...record.name.aliases,
  ]
    .join(' ')
    .toLocaleLowerCase();
}

export function filterInstitutions(
  records: readonly Institution[],
  filters: DirectoryFilters,
): Institution[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const matchesQuery = !query || searchableText(record).includes(query);
    const matchesEconomy = filters.economy === 'all' || record.countryCode === filters.economy;
    const matchesType = filters.type === 'all' || record.institutionRoleCategory === filters.type;
    const matchesMembership =
      filters.membership === 'all' || record.acsicMembershipStatus === filters.membership;
    return matchesQuery && matchesEconomy && matchesType && matchesMembership;
  });
}

function institutionOrder(left: Institution, right: Institution) {
  if (left.acsicMembershipStatus !== right.acsicMembershipStatus) {
    return left.acsicMembershipStatus === 'member' ? -1 : 1;
  }
  return left.name.en.localeCompare(right.name.en);
}

/** Group each filtered record exactly once by its governed economy. */
export function groupInstitutionsByEconomy(records: readonly Institution[]) {
  const grouped = new Map<string, Institution[]>();
  records.forEach((record) => {
    const current = grouped.get(record.countryCode) ?? [];
    current.push(record);
    grouped.set(record.countryCode, current);
  });
  return getEconomies(institutions)
    .filter((economy) => grouped.has(economy.id))
    .map((economy) => ({
      ...economy,
      institutions: [...(grouped.get(economy.id) ?? [])].sort(institutionOrder),
    }));
}

export function hasActiveDirectoryFilters(filters: DirectoryFilters) {
  return Boolean(
    filters.query.trim() ||
    filters.economy !== 'all' ||
    filters.type !== 'all' ||
    filters.membership !== 'all',
  );
}

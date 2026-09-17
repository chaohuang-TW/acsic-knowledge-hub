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

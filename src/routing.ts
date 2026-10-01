import type { Locale } from './types';

export type PageId =
  | 'home'
  | 'overview'
  | 'members'
  | 'systems'
  | 'reference'
  | 'framework'
  | 'data-pilot'
  | 'practices'
  | 'resources'
  | 'compare'
  | 'reports'
  | 'sources'
  | 'governance'
  | 'about'
  | 'disclaimer'
  | 'institution'
  | 'not-found';

export function routePath(locale: Locale, page: PageId) {
  return page === 'home' ? `/${locale}/` : `/${locale}/${page}`;
}

/** Canonical deep link for one governed institution record. */
export function institutionPath(locale: Locale, institutionId: string) {
  return `/${locale}/institutions/${encodeURIComponent(institutionId)}`;
}

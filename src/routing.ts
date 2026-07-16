import type { Locale } from './types';

export type PageId =
  | 'home'
  | 'overview'
  | 'members'
  | 'systems'
  | 'practices'
  | 'resources'
  | 'compare'
  | 'reports'
  | 'sources'
  | 'governance'
  | 'about'
  | 'disclaimer';

export function routePath(locale: Locale, page: PageId) {
  return page === 'home' ? `/${locale}/` : `/${locale}/${page}`;
}

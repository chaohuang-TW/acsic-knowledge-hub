import type { Locale, LocalizedText } from '../../types';

export function institutionListStateMessage(
  state: 'empty' | 'error',
  locale: Locale,
): LocalizedText[Locale] {
  if (state === 'error')
    return locale === 'en' ? 'Public data could not be loaded.' : '公開資料載入失敗。';
  return locale === 'en' ? 'No matching public record.' : '沒有符合條件的公開資料。';
}

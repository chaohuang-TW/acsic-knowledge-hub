import { createContext, useContext } from 'react';
import type { Locale } from './types';

export const locales: Locale[] = ['en', 'zh-TW'];
export const defaultLocale: Locale = 'en';
export const localeStorageKey = 'acsic-knowledge-hub-locale';

export function browserLocale(): Locale {
  const stored = window.localStorage.getItem(localeStorageKey);
  if (stored === 'en' || stored === 'zh-TW') return stored;
  const preferred = window.navigator.languages?.[0] ?? window.navigator.language;
  return /^(zh-TW|zh-Hant)/i.test(preferred) ? 'zh-TW' : defaultLocale;
}

export const copy = {
  en: {
    brand: 'ACSIC Knowledge Hub',
    fullName: 'ACSIC Member Institutions Knowledge Hub',
    subtitle: 'Connecting Asia’s Credit Guarantee Knowledge',
    positioning:
      'An independent bilingual public-data research platform for ACSIC member institutions.',
    unofficial: 'Independent, unofficial platform',
    disclaimer:
      'This independent research platform is not an official website of ACSIC or any member institution. Verify information against the original official sources before formal use.',
    researchBadge: 'Official public-data research',
    skip: 'Skip to main content',
    language: 'Language',
    nav: {
      overview: 'ACSIC Overview',
      members: 'Member Institutions',
      systems: 'Credit Guarantee Systems',
      practices: 'Knowledge & Practices',
      resources: 'Events & Resources',
    },
    footerData: 'Data is drawn only from publicly accessible official sources.',
    footerMissing: 'Unknown fields remain pending and are not inferred by the system.',
  },
  'zh-TW': {
    brand: 'ACSIC Knowledge Hub',
    fullName: '亞洲地區信用補充機構聯盟會員知識平台',
    subtitle: '串聯亞洲信用保證機構、制度與實務知識',
    positioning: '以 ACSIC 會員機構為範圍的獨立雙語公開資料研究平台。',
    unofficial: '獨立非官方平台',
    disclaimer:
      '本網站為獨立研究平台，不是 ACSIC 或任何會員機構的官方網站。正式引用或決策前，請回到原始官方來源查證。',
    researchBadge: '官方公開資料研究',
    skip: '跳至主要內容',
    language: '語言',
    nav: {
      overview: 'ACSIC 概覽',
      members: '會員機構',
      systems: '信用保證制度',
      practices: '知識與實務',
      resources: '活動與資源',
    },
    footerData: '資料僅取自可公開查閱的官方來源。',
    footerMissing: '缺漏欄位維持待查證，不由系統推測補填。',
  },
} as const;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('LocaleContext is unavailable');
  return { ...context, t: copy[context.locale] };
}

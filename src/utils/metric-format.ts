import type { Locale } from '../types';

export interface FormattedMetricAmount {
  value: string;
  unit: string;
}

/** Formats TWD thousand amounts for display without changing the reported source value. */
export function formatFinancialAmount(
  value: number | null,
  unit: string,
  currency: string | null,
  locale: Locale,
): FormattedMetricAmount | null {
  if (value === null || !Number.isFinite(value) || currency !== 'TWD' || unit !== '新臺幣千元') {
    return null;
  }

  if (locale === 'en') {
    const billions = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value / 1_000_000);
    return { value: `TWD ${billions}`, unit: 'billion' };
  }

  const hundredMillions = new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value / 100_000);
  return { value: `約新臺幣 ${hundredMillions}`, unit: '億元' };
}

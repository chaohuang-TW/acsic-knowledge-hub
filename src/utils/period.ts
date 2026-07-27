import type { Locale } from '../types';
import type { Level3IndicatorRecord } from '../types/indicators';

type Period = Level3IndicatorRecord['period'];

function parts(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

export function formatDisplayDate(date: string, locale: Locale) {
  const { year, month, day } = parts(date);
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }
  return `${year} 年 ${month} 月 ${day} 日`;
}

function formatMonth(date: string, locale: Locale) {
  const { year, month } = parts(date);
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
  return `${year} 年 ${month} 月`;
}

export function formatDisplayPeriod(period: Period, locale: Locale) {
  switch (period.reportingPeriodType) {
    case 'calendar_year':
      return period.calendarYear === null
        ? ''
        : locale === 'en'
          ? `CY${period.calendarYear}`
          : `${period.calendarYear} 年`;
    case 'fiscal_year': {
      const fiscalYear = period.fiscalYear ?? '';
      if (!period.periodStart || !period.periodEnd || locale === 'en') return fiscalYear;
      return `${fiscalYear}（${formatMonth(period.periodStart, locale)}至 ${formatMonth(period.periodEnd, locale)}）`;
    }
    case 'point_in_time':
      return period.asOfDate
        ? locale === 'en'
          ? `As of ${formatDisplayDate(period.asOfDate, locale)}`
          : `截至 ${formatDisplayDate(period.asOfDate, locale)}`
        : '';
    case 'cumulative_since_establishment':
      if (!period.periodStart || !period.asOfDate) return '';
      return `${parts(period.periodStart).year}–${parts(period.asOfDate).year}`;
  }
}

export function rocYearToGregorian(rocYear: number) {
  return rocYear + 1911;
}

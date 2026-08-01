import type { LocalizedText } from '../types';

export interface AcsicEvent {
  id: string;
  edition: string;
  eventType: 'conference';
  title: LocalizedText;
  dateStart: string;
  dateEnd: string;
  location: LocalizedText;
  hostInstitutionId: string;
  summary: LocalizedText;
  topics: LocalizedText[];
  sourceIds: string[];
  status: 'completed';
}

/**
 * Format an event date range from its governed ISO date fields.
 * Dates are parsed as UTC so the display does not shift with the viewer's timezone.
 */
export function formatEventDate(
  dateStart: string,
  dateEnd: string,
  locale: 'en' | 'zh-TW',
): string {
  const start = new Date(`${dateStart}T00:00:00Z`);
  const end = new Date(`${dateEnd}T00:00:00Z`);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = start.getUTCMonth();
  const endMonth = end.getUTCMonth();
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (locale === 'zh-TW') {
    const startMonthLabel = new Intl.DateTimeFormat('zh-TW', {
      month: 'numeric',
      timeZone: 'UTC',
    }).format(start);
    const endMonthLabel = new Intl.DateTimeFormat('zh-TW', {
      month: 'numeric',
      timeZone: 'UTC',
    }).format(end);
    if (startYear === endYear && startMonth === endMonth) {
      return `${startYear} 年 ${startMonthLabel} ${startDay}–${endDay} 日`;
    }
    return `${startYear} 年 ${startMonthLabel} ${startDay} 日 – ${endYear} 年 ${endMonthLabel} ${endDay} 日`;
  }

  const startMonthLabel = new Intl.DateTimeFormat('en', {
    month: 'long',
    timeZone: 'UTC',
  }).format(start);
  const endMonthLabel = new Intl.DateTimeFormat('en', {
    month: 'long',
    timeZone: 'UTC',
  }).format(end);
  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}–${endDay} ${startMonthLabel} ${startYear}`;
  }
  return `${startDay} ${startMonthLabel} ${startYear} – ${endDay} ${endMonthLabel} ${endYear}`;
}

/** Public ACSIC events appear here only after a primary official source is recorded. */
export const acsicEvents: AcsicEvent[] = [
  {
    id: 'acsic-38th-conference-2026',
    edition: '38th',
    eventType: 'conference',
    title: {
      en: 'Global Symposium & 38th ACSIC Conference 2026',
      'zh-TW': '全球信用保證論壇暨第 38 屆 ACSIC 年會 2026',
    },
    dateStart: '2026-04-23',
    dateEnd: '2026-04-24',
    location: { en: 'The Taj Mahal Palace, Mumbai, India', 'zh-TW': '印度孟買泰姬瑪哈酒店' },
    hostInstitutionId: 'cgtmse-in',
    summary: {
      en: 'The 38th ACSIC Conference was held together with the Global Symposium on Credit Guarantee.',
      'zh-TW': '第 38 屆 ACSIC 年會與全球信用保證論壇共同舉行。',
    },
    topics: [
      { en: 'Credit guarantee systems', 'zh-TW': '信用保證制度' },
      { en: 'Financial inclusion', 'zh-TW': '金融包容' },
      { en: 'Risk and sustainability', 'zh-TW': '風險與永續' },
      { en: 'Innovation and technology', 'zh-TW': '創新與科技' },
      { en: 'International knowledge exchange', 'zh-TW': '國際知識交流' },
    ],
    sourceIds: ['acsic-38th-conference-2026'],
    status: 'completed',
  },
  {
    id: 'acsic-37th-conference-2025',
    edition: '37th',
    eventType: 'conference',
    title: {
      en: '37th ACSIC Conference 2025',
      'zh-TW': '第 37 屆 ACSIC 年會 2025',
    },
    dateStart: '2025-11-10',
    dateEnd: '2025-11-14',
    location: { en: 'Grand Hyatt Taipei, Taiwan', 'zh-TW': '臺北君悅酒店' },
    hostInstitutionId: 'tsmeg-tw',
    summary: {
      en: 'Hosted by TSMEG, the conference brought together more than 200 participants from 13 countries and 18 credit guarantee institutions to exchange practice on financial innovation, digital transformation, green finance and financial inclusion.',
      'zh-TW':
        '由 TSMEG 主辦，來自 13 個國家、18 家信用保證機構的逾 200 人齊聚交流，聚焦金融創新、數位轉型、綠色金融與金融包容。',
    },
    topics: [
      { en: 'Financial innovation', 'zh-TW': '金融創新' },
      { en: 'Digital transformation', 'zh-TW': '數位轉型' },
      { en: 'Green finance', 'zh-TW': '綠色金融' },
      { en: 'Financial inclusion', 'zh-TW': '金融包容' },
    ],
    sourceIds: ['acsic-37th-conference-2025'],
    status: 'completed',
  },
];

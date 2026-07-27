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
  hostLabel: LocalizedText;
  summary: LocalizedText;
  topics: LocalizedText[];
  sourceIds: string[];
  status: 'completed';
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
    hostLabel: {
      en: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
      'zh-TW': '微型及小型企業信用保證基金信託（CGTMSE）',
    },
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
];

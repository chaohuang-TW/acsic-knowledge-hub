import { describe, expect, it } from 'vitest';
import { formatFinancialAmount } from '../src/utils/metric-format';

describe('human-readable financial amount formatting', () => {
  it('formats thousand-TWD values as billions without changing the source amount', () => {
    expect(formatFinancialAmount(23928298, '新臺幣千元', 'TWD', 'en')).toEqual({
      value: 'TWD 23.928',
      unit: 'billion',
    });
    expect(formatFinancialAmount(25245745, '新臺幣千元', 'TWD', 'en')).toEqual({
      value: 'TWD 25.246',
      unit: 'billion',
    });
  });

  it('formats TWD in Traditional Chinese 億元 and keeps precision in the source record', () => {
    expect(formatFinancialAmount(23928298, '新臺幣千元', 'TWD', 'zh-TW')).toEqual({
      value: '約新臺幣 239.283',
      unit: '億元',
    });
    expect(formatFinancialAmount(18480910, '新臺幣千元', 'TWD', 'zh-TW')).toEqual({
      value: '約新臺幣 184.809',
      unit: '億元',
    });
  });

  it('does not convert other currencies or non-thousand-TWD units', () => {
    expect(formatFinancialAmount(1000, 'JPY', 'JPY', 'en')).toBeNull();
    expect(formatFinancialAmount(1000, '新臺幣百萬元', 'TWD', 'zh-TW')).toBeNull();
    expect(formatFinancialAmount(null, '新臺幣千元', 'TWD', 'en')).toBeNull();
  });
});

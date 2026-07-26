import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { coverageStats } from '../src/data/coverage';

const root = new URL('../', import.meta.url);

describe('README coverage source of truth', () => {
  it('keeps exactly one Level 2 summary generated from production data', () => {
    const summaries = readFileSync(new URL('README.md', root), 'utf8')
      .split('\n')
      .filter((line) => /Level 2.*complete:.*partial:/i.test(line));

    expect(summaries).toEqual([
      `- Level 1 complete: ${coverageStats.level1Complete}; strict Level 2 complete: ${coverageStats.level2Complete}; partial: ${coverageStats.level2Partial}; insufficient: ${coverageStats.level2Insufficient}; reliable Level 3 metrics: ${coverageStats.level3Reliable}.`,
    ]);
  });
});

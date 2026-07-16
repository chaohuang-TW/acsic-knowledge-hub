import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { coverageStats } from '../src/data/coverage';
import {
  institutions,
  sourceById,
  sourceRegistry,
  untranslatedProductionValues,
} from '../src/data/institutions';
import {
  commonLevel2Fields,
  level2FieldLabels,
  requiredLevel2Fields,
} from '../src/data/level2-standards';
import { routePath } from '../src/routing';
import { institutionListStateMessage } from '../src/features/institutions/stateMessages';
import {
  comparisonCsv,
  comparisonJson,
  comparisonMarkdown,
  generateReport,
} from '../src/utils/core';
import type { LocalizedText } from '../src/types';

const root = new URL('../', import.meta.url);
const bilingual = (value: LocalizedText | null) =>
  Boolean(value?.en.trim() && value['zh-TW'].trim());

describe('fixed ACSIC membership boundary', () => {
  it('keeps 21 institutions', () => expect(institutions).toHaveLength(21));
  it('keeps 20 formal members', () => expect(coverageStats.formalMembers).toBe(20));
  it('keeps one observer', () => expect(coverageStats.observers).toBe(1));
  it('keeps ACGF as the only observer', () =>
    expect(
      institutions
        .filter((r) => r.acsicMembershipStatus === 'observer')
        .map((r) => r.institutionAbbreviation),
    ).toEqual(['ACGF']));
  it('keeps 14 countries or economies', () => expect(coverageStats.countriesEconomies).toBe(14));
  it('keeps all Level 1 records complete', () => expect(coverageStats.level1Complete).toBe(21));
  it('keeps Level 3 empty', () => expect(coverageStats.level3Reliable).toBe(0));
});

describe('strict central Level 2 standard', () => {
  it('uses one shared common-field list', () => expect(commonLevel2Fields).toHaveLength(12));
  it('includes every common field for every institution', () =>
    institutions.forEach((r) =>
      commonLevel2Fields.forEach((field) => expect(r.level2RequiredFields).toContain(field)),
    ));
  it('adds the role-specific standard centrally', () =>
    institutions.forEach((r) =>
      expect(r.level2RequiredFields).toEqual(requiredLevel2Fields(r.institutionRoleCategory)),
    ));
  it('does not allow a record to shrink the common denominator', () =>
    institutions.forEach((r) => expect(r.level2RequiredFields.length).toBeGreaterThanOrEqual(16)));
  it('keeps missing and not-applicable fields disjoint', () =>
    institutions.forEach((r) =>
      expect(r.notApplicableFields.some((item) => r.missingFields.includes(item.field))).toBe(
        false,
      ),
    ));
  it('requires bilingual non-applicability reasons', () =>
    institutions
      .flatMap((r) => r.notApplicableFields)
      .forEach((item) => expect(bilingual(item.reason)).toBe(true)));
  it('requires a basis and review date for non-applicability', () =>
    institutions
      .flatMap((r) => r.notApplicableFields)
      .forEach((item) => {
        expect(['role_methodology', 'official_source']).toContain(item.basis);
        expect(item.reviewedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }));
  it('excludes a required field only with a formal non-applicability record', () =>
    institutions.forEach((r) => {
      const excluded = r.level2RequiredFields.filter(
        (field) => !r.level2ApplicableFields.includes(field),
      );
      const documented = new Set(r.notApplicableFields.map((item) => item.field));
      excluded.forEach((field) => expect(documented.has(field)).toBe(true));
    }));
  it('calculates completion from verified applicable fields', () =>
    institutions.forEach((r) =>
      expect(r.level2Completion).toBe(
        Math.round((r.level2VerifiedFields.length / r.level2ApplicableFields.length) * 100),
      ),
    ));
  it('does not hard-code the previous 15/6 result', () =>
    expect([coverageStats.level2Complete, coverageStats.level2Partial]).not.toEqual([15, 6]));
  it('classifies all records from their actual evidence', () =>
    expect(
      coverageStats.level2Complete +
        coverageStats.level2Partial +
        coverageStats.level2Insufficient +
        coverageStats.level2NotAssessed,
    ).toBe(21));
  it('allows complete only with no missing applicable field', () =>
    institutions
      .filter((r) => r.level2Status === 'complete')
      .forEach((r) => expect(r.missingFields).toHaveLength(0)));
  it('requires evidence for every complete applicable field', () =>
    institutions
      .filter((r) => r.level2Status === 'complete')
      .forEach((r) =>
        r.level2ApplicableFields.forEach((field) =>
          expect(r.fieldEvidence[field]?.length).toBeGreaterThan(0),
        ),
      ));
  it('conservatively marks ASKRINDO insufficient', () =>
    expect(institutions.find((r) => r.institutionAbbreviation === 'ASKRINDO')?.level2Status).toBe(
      'insufficient',
    ));
});

describe('deduplicated source registry and evidence', () => {
  it('has unique source IDs', () =>
    expect(new Set(sourceRegistry.map((s) => s.sourceId)).size).toBe(sourceRegistry.length));
  it('stores each membership roster once', () =>
    expect(
      sourceRegistry.filter((s) => s.sourceType === 'official_membership_roster'),
    ).toHaveLength(2));
  it('separates references from unique sources', () => {
    expect(coverageStats.sourceReferences).toBeGreaterThan(coverageStats.uniqueOfficialSources);
    expect(coverageStats.uniqueOfficialSources).toBe(sourceRegistry.length);
  });
  it('keeps institution source references as IDs', () =>
    institutions.forEach((r) =>
      r.sourceIds.forEach((id) => expect(sourceById.has(id)).toBe(true)),
    ));
  it('uses standard source types', () =>
    sourceRegistry.forEach((s) => expect(s.sourceType).toMatch(/^official_/)));
  it('retains source metadata', () =>
    sourceRegistry.forEach((s) => {
      expect(s.title).toBeTruthy();
      expect(s.publisher).toBeTruthy();
      expect(s.finalResolvedUrl).toMatch(/^https:/);
      expect(s.originalLanguage).toBeTruthy();
      expect(s.accessedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(bilingual(s.notes)).toBe(true);
    }));
  it('gives every evidence object a valid source', () =>
    institutions.forEach((r) =>
      Object.values(r.fieldEvidence)
        .flat()
        .forEach((e) => expect(sourceById.has(e.sourceId)).toBe(true)),
    ));
  it('gives every evidence object a section, bilingual summary and date', () =>
    institutions.forEach((r) =>
      Object.values(r.fieldEvidence)
        .flat()
        .forEach((e) => {
          expect(e.pageOrSection).toBeTruthy();
          expect(bilingual(e.evidenceSummary)).toBe(true);
          expect(e.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }),
    ));
  it('counts field-level evidence separately', () =>
    expect(coverageStats.fieldEvidenceCount).toBeGreaterThan(150));
  it('requires Tier 1 source depth for complete status', () =>
    institutions
      .filter((r) => r.level2Status === 'complete')
      .forEach((r) => expect(r.confidenceFactors.tier1SourceCount).toBeGreaterThanOrEqual(3)));
  it('does not assign high confidence to an unavailable critical source', () =>
    institutions
      .filter((r) => r.confidenceFactors.hasUnavailableCriticalSource)
      .forEach((r) => expect(r.confidenceLevel).not.toBe('high')));
  it('does not assign high confidence when a stale source warning exists', () =>
    institutions
      .filter((r) => r.confidenceFactors.hasStaleSource)
      .forEach((r) => expect(r.confidenceLevel).not.toBe('high')));
});

describe('full bilingual governed content', () => {
  it('has no untranslated production dictionary value', () =>
    expect(untranslatedProductionValues).toEqual([]));
  it('localises core Level 2 text', () =>
    institutions.forEach((r) =>
      [
        r.legalBasis,
        r.ownershipOrLegalStatus,
        r.supervisingOrOversightAuthority,
        r.governanceType,
        r.fundingOrCapitalBasis,
        r.geographicScope,
      ]
        .filter(Boolean)
        .forEach((v) => expect(bilingual(v)).toBe(true)),
    ));
  it('localises service targets and major functions', () =>
    institutions.forEach((r) =>
      [...r.serviceTargets, ...r.majorFunctions].forEach((v) => expect(bilingual(v)).toBe(true)),
    ));
  it('localises type-specific values', () =>
    institutions.forEach((r) =>
      Object.values(r.typeSpecificProfile)
        .flatMap((v) => (Array.isArray(v) ? v : v ? [v] : []))
        .forEach((v) => expect(bilingual(v)).toBe(true)),
    ));
  it('localises missing-field labels through the standard', () =>
    institutions.forEach((r) =>
      r.missingFields.forEach((field) => expect(bilingual(level2FieldLabels[field])).toBe(true)),
    ));
  it('localises confidence rationales', () =>
    institutions.forEach((r) => expect(bilingual(r.confidenceRationale)).toBe(true)));
  it('uses readable bilingual claims', () =>
    institutions.forEach((r) =>
      r.verifiedFacts.forEach((claim) => {
        expect(bilingual(claim.statement)).toBe(true);
        expect(claim.statement.en).not.toContain('verified by official source');
        expect(claim.statement['zh-TW']).not.toMatch(/^[a-zA-Z]+:/);
      }),
    ));
  it('records native-name language or an explicit pending state', () =>
    institutions.forEach((r) =>
      r.name.nativeName.status === 'official'
        ? expect(r.name.nativeName.language).toBeTruthy()
        : expect(r.name.nativeName.value).toBeNull(),
    ));
  it('preserves 2 official and 19 research-translated Chinese names', () => {
    expect(coverageStats.officialChineseNames).toBe(2);
    expect(coverageStats.researchTranslationChineseNames).toBe(19);
  });
  it('reports complete bilingual coverage', () =>
    expect(coverageStats.bilingualCoveragePercent).toBe(100));
});

describe('readable exports and reports', () => {
  const selected = institutions.slice(0, 2);
  it('exports strict status and limitations in Markdown', () => {
    const text = comparisonMarkdown(selected, 'en');
    expect(text).toContain('Strict Level 2 status');
    expect(text).toContain('Comparison limitations');
    expect(text).toContain(DISCLAIMER_FRAGMENT);
  });
  it('exports readable Traditional Chinese CSV', () => {
    const text = comparisonCsv(selected, 'zh-TW');
    expect(text).toContain('嚴格 Level 2 狀態');
    expect(text).not.toContain('credit_guarantee_corporation');
  });
  it('keeps structured evidence in JSON', () =>
    expect(comparisonJson(selected, 'en')).toContain('fieldEvidence'));
  it('produces five English report types without raw templates', () =>
    ['executive', 'country', 'comparison', 'meeting-qa', 'presentation'].forEach((type) => {
      const text = generateReport(type as never, selected, new Date('2026-07-16'), 'en');
      expect(text).not.toContain('verified by official source');
      expect(text).not.toContain('官方資料未揭露');
    }));
  it('produces five Chinese report types without raw field keys', () =>
    ['executive', 'country', 'comparison', 'meeting-qa', 'presentation'].forEach((type) => {
      const text = generateReport(type as never, selected, new Date('2026-07-16'), 'zh-TW');
      expect(text).not.toContain('establishedYear:');
      expect(text).not.toContain('-profile');
    }));
});

describe('production UI, routes and generated documents', () => {
  it('removes interface-state preview from production', () => {
    const source = readFileSync(
      new URL('src/features/institutions/InstitutionsPage.tsx', root),
      'utf8',
    );
    expect(source).not.toContain('Interface state preview');
    expect(source).not.toContain('介面狀態預覽');
  });
  it('keeps testable empty and error messages', () => {
    expect(institutionListStateMessage('empty', 'en')).toBe('No matching public record.');
    expect(institutionListStateMessage('error', 'zh-TW')).toBe('公開資料載入失敗。');
  });
  it('keeps bilingual hash routes', () => {
    expect(routePath('en', 'members')).toBe('/en/members');
    expect(routePath('zh-TW', 'members')).toBe('/zh-TW/members');
  });
  it('keeps the Pages base path', () =>
    expect(readFileSync(new URL('vite.config.ts', root), 'utf8')).toContain(
      "'/acsic-knowledge-hub/'",
    ));
  it('keeps noindex and robots controls', () => {
    expect(readFileSync(new URL('index.html', root), 'utf8')).toContain('noindex');
    expect(readFileSync(new URL('public/robots.txt', root), 'utf8')).toContain('Disallow: /');
  });
  it('keeps generated README statistics aligned', () =>
    expect(readFileSync(new URL('README.md', root), 'utf8')).toContain(
      `strict Level 2 complete: ${coverageStats.level2Complete}; partial: ${coverageStats.level2Partial}; insufficient: ${coverageStats.level2Insufficient}`,
    ));
  it('keeps generated coverage statistics aligned', () =>
    expect(readFileSync(new URL('docs/ACSIC_MEMBER_COVERAGE.md', root), 'utf8')).toContain(
      `strict Level 2 complete: ${coverageStats.level2Complete}; partial: ${coverageStats.level2Partial}; insufficient: ${coverageStats.level2Insufficient}`,
    ));
  it('keeps generated completion statistics aligned', () =>
    expect(readFileSync(new URL('docs/COMPLETION_REPORT.md', root), 'utf8')).toContain(
      `Strict Level 2: ${coverageStats.level2Complete} complete, ${coverageStats.level2Partial} partial and ${coverageStats.level2Insufficient} insufficient`,
    ));
});

const DISCLAIMER_FRAGMENT = 'not an official website of ACSIC';

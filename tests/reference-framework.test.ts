import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { coverageStats } from '../src/data/coverage';
import {
  forbiddenIndicatorComparisons,
  indicatorDictionary,
  level3PilotReadiness,
  productionLevel3Values,
} from '../src/data/indicators';
import { institutions, sourceRegistry } from '../src/data/institutions';
import { referenceSetDefinitions } from '../src/data/reference-set';
import { researchPriorities } from '../src/data/research-priority';

describe('reference set governance', () => {
  it('keeps exactly seven reference institutions', () =>
    expect(referenceSetDefinitions).toHaveLength(7));
  it('uses the required seven institution IDs', () =>
    expect(referenceSetDefinitions.map((item) => item.institutionId).sort()).toEqual(
      ['jfc-jp', 'acgf-tw', 'kotec-kr', 'dcgf-np', 'jfg-jp', 'slecic-lk', 'smec-pg'].sort(),
    ));
  it('maps every definition to one institution', () =>
    referenceSetDefinitions.forEach((item) =>
      expect(institutions.find((record) => record.id === item.institutionId)?.referenceSet).toBe(
        true,
      ),
    ));
  it('keeps bilingual roles and rationales', () =>
    referenceSetDefinitions.forEach((item) => {
      expect(item.role.en).toBeTruthy();
      expect(item.role['zh-TW']).toBeTruthy();
      expect(item.rationale.en).toBeTruthy();
      expect(item.rationale['zh-TW']).toBeTruthy();
    }));
  it('does not alter the ACSIC membership boundary', () => {
    expect(coverageStats.formalMembers).toBe(20);
    expect(coverageStats.observers).toBe(1);
    expect(coverageStats.countriesEconomies).toBe(14);
    expect(coverageStats.institutions).toBe(21);
  });
  it('keeps ACGF as the only observer', () =>
    expect(
      institutions
        .filter((item) => item.acsicMembershipStatus === 'observer')
        .map((item) => item.id),
    ).toEqual(['acgf-tw']));
  it('preserves strict completion rules', () =>
    institutions
      .filter((item) => item.level2Status === 'complete')
      .forEach((item) => expect(item.missingFields).toHaveLength(0)));
});

describe('research priority model', () => {
  it('scores every institution once', () => expect(researchPriorities).toHaveLength(21));
  it('uses four 1-to-5 dimensions', () =>
    researchPriorities.forEach((item) =>
      [
        item.strategicRelevance,
        item.comparabilityPotential,
        item.sourceAvailability,
        item.researchGapValue,
      ].forEach((score) => expect(score).toBeGreaterThanOrEqual(1)),
    ));
  it('caps each dimension at five', () =>
    researchPriorities.forEach((item) =>
      [
        item.strategicRelevance,
        item.comparabilityPotential,
        item.sourceAvailability,
        item.researchGapValue,
      ].forEach((score) => expect(score).toBeLessThanOrEqual(5)),
    ));
  it('derives totals from the four dimensions', () =>
    researchPriorities.forEach((item) =>
      expect(item.score).toBe(
        item.strategicRelevance +
          item.comparabilityPotential +
          item.sourceAvailability +
          item.researchGapValue,
      ),
    ));
  it('keeps totals within 4 to 20', () =>
    researchPriorities.forEach((item) => {
      expect(item.score).toBeGreaterThanOrEqual(4);
      expect(item.score).toBeLessThanOrEqual(20);
    }));
  it('defers ASKRINDO for source limitations', () =>
    expect(researchPriorities.find((item) => item.institutionId === 'askrindo-id')).toMatchObject({
      priorityBand: 'deferred',
      researchStatus: 'deferred_due_to_source_limitations',
    }));
});

describe('comparative indicator dictionary', () => {
  it('defines at least 20 indicators', () =>
    expect(indicatorDictionary.length).toBeGreaterThanOrEqual(20));
  it('uses ten categories', () =>
    expect(new Set(indicatorDictionary.map((item) => item.category)).size).toBe(10));
  it('uses unique IDs', () =>
    expect(new Set(indicatorDictionary.map((item) => item.indicatorId)).size).toBe(
      indicatorDictionary.length,
    ));
  it('has bilingual names and definitions', () =>
    indicatorDictionary.forEach((item) => {
      expect(item.name.en).toBeTruthy();
      expect(item.name['zh-TW']).toBeTruthy();
      expect(item.definition.en).toBeTruthy();
      expect(item.definition['zh-TW']).toBeTruthy();
    }));
  it('records required metadata', () =>
    indicatorDictionary.forEach((item) => expect(item.requiredMetadata.length).toBeGreaterThan(0)));
  it('records bilingual misinterpretations', () =>
    indicatorDictionary.forEach((item) => {
      expect(item.commonMisinterpretations.en.length).toBeGreaterThan(0);
      expect(item.commonMisinterpretations['zh-TW'].length).toBeGreaterThan(0);
    }));
  it('records comparability levels', () =>
    indicatorDictionary.forEach((item) =>
      expect(['high', 'medium', 'low', 'institution_specific']).toContain(item.comparabilityLevel),
    ));
  it('records explicit forbidden comparisons', () =>
    expect(forbiddenIndicatorComparisons.length).toBeGreaterThanOrEqual(5));
  it('keeps production Level 3 values empty', () => expect(productionLevel3Values).toEqual([]));
});

describe('Level 3 pilot readiness and official sources', () => {
  it('assesses exactly five pilot institutions', () =>
    expect(level3PilotReadiness).toHaveLength(5));
  it('includes the required pilot IDs', () =>
    expect(level3PilotReadiness.map((item) => item.institutionId).sort()).toEqual(
      ['jfc-jp', 'acgf-tw', 'tsmeg-tw', 'kotec-kr', 'cgc-my'].sort(),
    ));
  it('keeps JFC, ACGF and TSMEG ready', () =>
    ['jfc-jp', 'acgf-tw', 'tsmeg-tw'].forEach((id) =>
      expect(level3PilotReadiness.find((item) => item.institutionId === id)?.pilotReadiness).toBe(
        'ready',
      ),
    ));
  it('keeps KOTEC and CGC partially ready', () =>
    ['kotec-kr', 'cgc-my'].forEach((id) =>
      expect(level3PilotReadiness.find((item) => item.institutionId === id)?.pilotReadiness).toBe(
        'partially_ready',
      ),
    ));
  it('uses only governed official source types', () =>
    sourceRegistry
      .filter((source) => source.accessedDate === '2026-07-26')
      .forEach((source) => {
        expect(source.isPrimarySource).toBe(true);
        expect(source.tier).toBe('tier_1');
      }));
  it('stores original language for every source', () =>
    sourceRegistry.forEach((source) => expect(source.originalLanguage).toBeTruthy()));
  it('publishes the new bilingual routes in the app', () => {
    const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
    expect(app).toContain("'reference'");
    expect(app).toContain("'framework'");
  });
  it('documents the non-ranking boundary', () => {
    const method = readFileSync(
      new URL('../docs/COMPARATIVE_INDICATOR_METHODOLOGY.md', import.meta.url),
      'utf8',
    );
    expect(method.toLowerCase()).toContain('never creates a ranking');
  });
});

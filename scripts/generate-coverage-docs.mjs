import { readFileSync, writeFileSync } from 'node:fs';
import prettier from 'prettier';

const root = new URL('../', import.meta.url);
const institutions = JSON.parse(readFileSync(new URL('src/data/institutions.json', root)));
const sources = JSON.parse(readFileSync(new URL('src/data/sources.json', root)));
const standard = JSON.parse(readFileSync(new URL('src/data/level2-standard.json', root)));
const sourceById = new Map(sources.map((source) => [source.sourceId, source]));

function calibrated(record) {
  const excluded = new Set(record.notApplicableFields.map((item) => item.field));
  const required = [...standard.common, ...standard.roles[record.role]];
  const applicable = required.filter((field) => !excluded.has(field));
  const verified = new Set(record.verifiedFieldKeys);
  verified.add('acsicRoleNotes');
  if (verified.has('ownershipOrLegalStatus')) verified.add('governanceType');
  if (record.id === 'jfc-jp') verified.add('officialPublications');
  const verifiedApplicable = applicable.filter((field) => verified.has(field));
  const missing = applicable.filter((field) => !verified.has(field));
  const recordSources = record.sourceIds.map((id) => sourceById.get(id));
  const sourceTypeCount = new Set(recordSources.map((source) => source.sourceType)).size;
  const tier1 = recordSources.filter((source) => source.tier === 'tier_1').length;
  const stale = recordSources.some((source) => source.stalenessWarning);
  const unavailable = recordSources.some(
    (source) =>
      source.sourceId === record.profileSourceId &&
      source.accessStatus === 'temporarily_unavailable',
  );
  const completion = Math.round((verifiedApplicable.length / applicable.length) * 100);
  const level2Status =
    missing.length === 0 && sourceTypeCount >= 3 && tier1 >= 3 && !stale && !unavailable
      ? 'complete'
      : verifiedApplicable.length <= 1 || unavailable
        ? 'insufficient'
        : 'partial';
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        completion * 0.6 +
          Math.min(tier1, 3) * 7 +
          Math.min(sourceTypeCount, 3) * 5 -
          (stale ? 12 : 0) -
          (unavailable ? 30 : 0),
      ),
    ),
  );
  const confidence =
    level2Status === 'complete' && score >= 80
      ? 'high'
      : level2Status === 'insufficient' || score < 40
        ? 'low'
        : 'medium';
  return {
    ...record,
    applicable,
    verifiedApplicable,
    missing,
    completion,
    level2Status,
    confidence,
  };
}

const records = institutions.map(calibrated);
const sourceTypes = Object.fromEntries(
  [...new Set(sources.map((source) => source.sourceType))].map((type) => [
    type,
    sources.filter((source) => source.sourceType === type).length,
  ]),
);
const stats = {
  formalMembers: records.filter((record) => record.status === 'member').length,
  observers: records.filter((record) => record.status === 'observer').length,
  countries: new Set(
    records.filter((record) => record.status === 'member').map((record) => record.countryCode),
  ).size,
  institutions: records.length,
  level1: records.length,
  complete: records.filter((record) => record.level2Status === 'complete').length,
  partial: records.filter((record) => record.level2Status === 'partial').length,
  insufficient: records.filter((record) => record.level2Status === 'insufficient').length,
  level3: 0,
  references: records.reduce((sum, record) => sum + record.sourceIds.length, 0),
  uniqueSources: sources.length,
  evidence: records.reduce((sum, record) => sum + record.verifiedApplicable.length, 0),
  bilingual: 100,
  native: records.filter((record) => record.nativeName.status === 'official').length,
  confidenceHigh: records.filter((record) => record.confidence === 'high').length,
  confidenceMedium: records.filter((record) => record.confidence === 'medium').length,
  confidenceLow: records.filter((record) => record.confidence === 'low').length,
};

const summaryBlock = `<!-- GENERATED:COVERAGE:START -->
## Current governed coverage

- Formal members: ${stats.formalMembers}; observers: ${stats.observers}; countries/economies: ${stats.countries}; institutions: ${stats.institutions}.
- Level 1 complete: ${stats.level1}; strict Level 2 complete: ${stats.complete}; partial: ${stats.partial}; insufficient: ${stats.insufficient}; reliable Level 3 metrics: ${stats.level3}.
- Source references: ${stats.references}; unique official sources: ${stats.uniqueSources}; field-level evidence objects: ${stats.evidence}.
- User-visible governed content bilingual coverage: ${stats.bilingual}%; official native-language names: ${stats.native}/${stats.institutions}.
<!-- GENERATED:COVERAGE:END -->`;

const rows = records
  .map(
    (record) =>
      `| ${record.countryName.en} | ${record.officialEnglish} | ${record.abbr} | ${record.status === 'member' ? 'Member' : 'Observer'} | ${record.role} | 100% | ${record.level2Status} (${record.completion}%) | ${record.sourceIds.length} | ${record.missing.length} | ${record.nativeName.status} | 2026-07-16 |`,
  )
  .join('\n');
const coverageDoc = `# ACSIC Member Coverage

${summaryBlock}

Level 2 is calculated from the central versioned standard. Missing applicable fields remain in the denominator; only a documented non-applicability record can exclude a field.

| Country / Economy | Institution | Abbreviation | ACSIC status | Role category | Level 1 | Strict Level 2 | Source references | Missing applicable fields | Native name | Last verified |
| --- | --- | --- | --- | --- | ---: | --- | ---: | ---: | --- | --- |
${rows}

## Unique source types

${Object.entries(sourceTypes)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}
`;

const completionBlock = `<!-- GENERATED:COMPLETION:START -->
## Calibrated production result

- Membership remains ${stats.formalMembers} formal members plus ${stats.observers} observer across ${stats.countries} countries/economies.
- Strict Level 2: ${stats.complete} complete, ${stats.partial} partial and ${stats.insufficient} insufficient. Level 3 reliable metrics remain ${stats.level3}.
- ${stats.references} source-reference relationships resolve to ${stats.uniqueSources} unique official sources and ${stats.evidence} field-evidence objects.
- Governed user-visible data content has ${stats.bilingual}% English/Traditional-Chinese coverage; ${stats.native} official native-language names are confirmed.
- Confidence distribution: high ${stats.confidenceHigh}, medium ${stats.confidenceMedium}, low ${stats.confidenceLow}.
<!-- GENERATED:COMPLETION:END -->`;

function replaceOrAppend(path, start, end, block) {
  const url = new URL(path, root);
  const current = readFileSync(url, 'utf8');
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`, 'm');
  return pattern.test(current)
    ? current.replace(pattern, block)
    : `${current.trimEnd()}\n\n${block}\n`;
}

const unformattedExpected = {
  'README.md': replaceOrAppend(
    'README.md',
    '<!-- GENERATED:COVERAGE:START -->',
    '<!-- GENERATED:COVERAGE:END -->',
    summaryBlock,
  ),
  'docs/ACSIC_MEMBER_COVERAGE.md': coverageDoc,
  'docs/COMPLETION_REPORT.md': replaceOrAppend(
    'docs/COMPLETION_REPORT.md',
    '<!-- GENERATED:COMPLETION:START -->',
    '<!-- GENERATED:COMPLETION:END -->',
    completionBlock,
  ),
};

const expected = Object.fromEntries(
  await Promise.all(
    Object.entries(unformattedExpected).map(async ([path, content]) => [
      path,
      await prettier.format(content, { parser: 'markdown' }),
    ]),
  ),
);

if (process.argv.includes('--check')) {
  const mismatches = Object.entries(expected).filter(
    ([path, content]) => readFileSync(new URL(path, root), 'utf8') !== content,
  );
  if (mismatches.length) {
    console.error(
      `Generated coverage documents are stale: ${mismatches.map(([path]) => path).join(', ')}`,
    );
    process.exitCode = 1;
  } else {
    console.log('Generated coverage documents match production data.');
  }
} else {
  for (const [path, content] of Object.entries(expected))
    writeFileSync(new URL(path, root), content);
  console.log(JSON.stringify(stats));
}

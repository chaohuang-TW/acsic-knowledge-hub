#!/usr/bin/env node
/* global document, window */

/**
 * Capture a reproducible UX baseline for the ACSIC Knowledge Hub.
 *
 * The audit intentionally reads the production UI only. It does not mutate
 * source data or make browser-side writes other than the page's normal local
 * storage behaviour. Screenshots and the detailed JSON report are written to
 * an external artifact directory; the Markdown baseline and protected file
 * manifest are the only repository outputs.
 *
 * Usage:
 *   node scripts/experience-audit.mjs
 *   node scripts/experience-audit.mjs --base-url http://127.0.0.1:4173/acsic-knowledge-hub/
 *   node scripts/experience-audit.mjs --output /private/tmp/acsic-experience-artifacts
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const repositoryRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const defaultBaseUrl = 'https://chaohuang-tw.github.io/acsic-knowledge-hub/';
const defaultArtifactRoot = '/private/tmp/acsic-experience-artifacts';
const args = parseArgs(process.argv.slice(2));
const baseUrl = ensureTrailingSlash(
  args['base-url'] || args.baseUrl || process.env.AUDIT_BASE_URL || defaultBaseUrl,
);
const artifactRoot = resolve(args.output || process.env.AUDIT_OUTPUT || defaultArtifactRoot);
const screenshotRoot = join(artifactRoot, 'screenshots');
const reportPath = resolve(
  args.report || join(repositoryRoot, 'docs/experience-redesign/baseline.md'),
);
const checksumPath = resolve(
  args.checksums || join(repositoryRoot, 'docs/experience-redesign/protected-checksums.json'),
);

const locales = [
  { id: 'en', label: 'English', economy: 'Taiwan' },
  { id: 'zh-TW', label: '繁體中文', economy: '臺灣' },
];
const viewports = [
  { id: 'desktop', width: 1440, height: 1000, isMobile: false, hasTouch: false },
  { id: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
];

const caseDefinitions = [
  { id: 'home', label: 'Home overview', route: (locale) => `/${locale}/` },
  {
    id: 'selectedTaiwan',
    label: 'Home with Taiwan selected',
    route: (locale) => `/${locale}/`,
    action: 'selectTaiwan',
  },
  {
    id: 'map',
    label: 'Map stage focus',
    route: (locale) => `/${locale}/`,
    action: 'focusMap',
  },
  { id: 'directory', label: 'Members directory', route: (locale) => `/${locale}/members` },
  {
    id: 'acgf',
    label: 'ACGF institution profile',
    route: (locale) => `/${locale}/institutions/acgf-tw`,
  },
  {
    id: 'sparseKOTEC',
    label: 'KOTEC sparse institution profile',
    route: (locale) => `/${locale}/institutions/kotec-kr`,
  },
  { id: 'compare', label: 'Institution comparison', route: (locale) => `/${locale}/compare` },
  { id: 'data', label: 'Verified data', route: (locale) => `/${locale}/data-pilot` },
  { id: 'systems', label: 'Systems', route: (locale) => `/${locale}/systems` },
  { id: 'resources', label: 'Resources', route: (locale) => `/${locale}/resources` },
  {
    id: 'unknownInstitution',
    label: 'Unknown institution route',
    route: (locale) => `/${locale}/institutions/unknown-governed-id`,
  },
  {
    id: 'unknownRoute',
    label: 'Unknown route',
    route: (locale) => `/${locale}/not-a-real-route`,
  },
  {
    id: 'standardExplorer',
    label: 'Standard explorer fallback',
    route: (locale) => `/${locale}/`,
    query: 'networkFallback=1',
  },
];

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) continue;
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

function buildUrl(route, query) {
  const url = new URL(baseUrl);
  url.search = query ? `?${query}` : '';
  url.hash = `#${route}`;
  return url.toString();
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '');
}

function nowIso() {
  return new Date().toISOString();
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files.sort();
}

async function createProtectedManifest() {
  const dataDirectory = join(repositoryRoot, 'src/data');
  const dataFiles = await listFiles(dataDirectory);
  const mascotPath = join(repositoryRoot, 'public/assets/mascot/meng-ge-guide.webp');
  const protectedFiles = [...dataFiles, mascotPath];
  const entries = [];
  for (const file of protectedFiles) {
    const content = await readFile(file);
    const metadata = await stat(file);
    entries.push({
      path: relative(repositoryRoot, file),
      bytes: metadata.size,
      sha256: sha256(content),
    });
  }
  return {
    schema: 'acsic-knowledge-hub-protected-checksums/v1',
    generatedAt: nowIso(),
    commit: getCommit(),
    scope: ['src/data/**/*', 'public/assets/mascot/meng-ge-guide.webp'],
    files: entries,
  };
}

function getCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

async function captureCase(browser, locale, viewport, definition) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    locale: locale.id === 'zh-TW' ? 'zh-TW' : 'en-US',
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  const interactions = [];
  const startedAt = Date.now();

  page.on('console', (message) => {
    consoleMessages.push({
      type: message.type(),
      text: message.text(),
      location: message.location(),
      at: nowIso(),
    });
  });
  page.on('pageerror', (error) => {
    pageErrors.push({ message: error.message, stack: error.stack, at: nowIso() });
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure(),
      at: nowIso(),
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      httpErrors.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method(),
        at: nowIso(),
      });
    }
  });

  const record = (name, status, details = {}) => {
    interactions.push({ name, status, at: nowIso(), ...details });
  };

  const route = definition.route(locale.id);
  const url = buildUrl(route, definition.query);
  let navigationError = null;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    record('navigate', 'ok', { url });
    await page.waitForTimeout(1_000);
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error);
    record('navigate', 'error', { url, error: navigationError });
  }

  if (!navigationError && definition.action === 'selectTaiwan') {
    try {
      const button = page.getByRole('button', { name: locale.economy, exact: true });
      if (await button.count()) {
        await button.first().click();
        record('selectTaiwan', 'ok', { control: 'button' });
      } else {
        const selector = page.getByRole('combobox', {
          name: locale.id === 'en' ? 'Choose an economy' : '選擇國家／經濟體',
        });
        await selector.selectOption('TW');
        record('selectTaiwan', 'ok', { control: 'combobox' });
      }
      await page.waitForTimeout(900);
    } catch (error) {
      record('selectTaiwan', 'error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (!navigationError && definition.action === 'focusMap') {
    try {
      const map = page.locator('[data-testid="asia-map-stage"], .network-standard-shell').first();
      await map.scrollIntoViewIfNeeded();
      record('focusMap', 'ok');
      await page.waitForTimeout(250);
    } catch (error) {
      record('focusMap', 'error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const stem = `${locale.id}-${safeName(definition.id)}-${viewport.id}`;
  const firstScreenPath = join(screenshotRoot, `${stem}-first-screen.png`);
  const fullPagePath = join(screenshotRoot, `${stem}-full-page.png`);
  if (!navigationError) {
    await page.screenshot({ path: firstScreenPath, fullPage: false });
    record('screenshot:first-screen', 'ok', { path: firstScreenPath });
    await page.screenshot({ path: fullPagePath, fullPage: true });
    record('screenshot:full-page', 'ok', { path: fullPagePath });
  } else {
    record('screenshot:first-screen', 'skipped');
    record('screenshot:full-page', 'skipped');
  }

  const pageState = await page
    .evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      hash: window.location.hash,
      pathname: window.location.pathname,
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      headings: [...document.querySelectorAll('h1, h2')]
        .slice(0, 12)
        .map((node) => node.textContent),
      visibleText: document.body.innerText.slice(0, 700),
      resources: performance.getEntriesByType('resource').map((entry) => {
        const resource = entry;
        return {
          name: resource.name,
          initiatorType: resource.initiatorType,
          startTime: resource.startTime,
          duration: resource.duration,
          transferSize: resource.transferSize,
          encodedBodySize: resource.encodedBodySize,
          decodedBodySize: resource.decodedBodySize,
        };
      }),
      navigation: performance.getEntriesByType('navigation').map((entry) => {
        const navigation = entry;
        return {
          startTime: navigation.startTime,
          duration: navigation.duration,
          domContentLoaded: navigation.domContentLoadedEventEnd,
          loadEventEnd: navigation.loadEventEnd,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize,
          decodedBodySize: navigation.decodedBodySize,
        };
      }),
    }))
    .catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));

  const result = {
    locale: locale.id,
    viewport: viewport.id,
    width: viewport.width,
    height: viewport.height,
    case: definition.id,
    label: definition.label,
    requestedUrl: url,
    capturedAt: nowIso(),
    durationMs: Date.now() - startedAt,
    navigationError,
    pageState,
    interactions,
    consoleMessages,
    pageErrors,
    failedRequests,
    httpErrors,
    screenshots: {
      firstScreen: navigationError ? null : relative(artifactRoot, firstScreenPath),
      fullPage: navigationError ? null : relative(artifactRoot, fullPagePath),
    },
  };
  await context.close();
  return result;
}

function flattenIssues(results) {
  return results.flatMap((result) => [
    ...result.pageErrors.map((item) => ({ kind: 'pageerror', result: resultKey(result), ...item })),
    ...result.failedRequests.map((item) => ({
      kind: 'requestfailed',
      result: resultKey(result),
      ...item,
    })),
    ...result.httpErrors.map((item) => ({ kind: 'http', result: resultKey(result), ...item })),
    ...result.consoleMessages
      .filter((item) => ['error', 'warning'].includes(item.type))
      .map((item) => ({ kind: `console:${item.type}`, result: resultKey(result), ...item })),
  ]);
}

function resultKey(result) {
  return `${result.locale}/${result.viewport}/${result.case}`;
}

function topTimings(results) {
  return results
    .flatMap((result) => {
      const resources = result.pageState?.resources;
      if (!Array.isArray(resources)) return [];
      return resources.map((resource) => ({
        result: resultKey(result),
        ...resource,
      }));
    })
    .sort((left, right) => right.duration - left.duration)
    .slice(0, 30);
}

function writeMarkdown(report, checksumManifest) {
  const lines = [
    args['verify-protected']
      ? '# ACSIC Knowledge Hub production-build review'
      : '# ACSIC Knowledge Hub UX baseline',
    '',
    `- Captured: ${report.capturedAt}`,
    `- Base checkout commit: \`${report.commit}\` (working-tree presentation is captured before release)`,
    `- Base URL: ${report.baseUrl}`,
    '- Screenshots and raw observations are retained in the external experience-audit artifact bundle.',
    `- Viewports: desktop ${report.viewports.desktop.width}×${report.viewports.desktop.height}; mobile ${report.viewports.mobile.width}×${report.viewports.mobile.height}`,
    '',
    'This is an observed browser capture for the Award-Caliber Experience Rebuild. It records rendering and interaction behaviour; it is not by itself a release-quality claim.',
    '',
    '## Coverage matrix',
    '',
    '| Locale | Viewport | Case | Hash after capture | First-screen screenshot | Full-page screenshot |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  for (const result of report.results) {
    const first = result.screenshots.firstScreen
      ? `\`${result.screenshots.firstScreen}\``
      : 'not captured';
    const full = result.screenshots.fullPage
      ? `\`${result.screenshots.fullPage}\``
      : 'not captured';
    lines.push(
      `| ${result.locale} | ${result.viewport} | ${result.case} | \`${result.pageState?.hash ?? 'navigation failed'}\` | ${first} | ${full} |`,
    );
  }
  lines.push('', '## Observed issues', '');
  if (report.issues.length === 0)
    lines.push(
      '- No console warnings/errors, page errors, failed requests or HTTP responses ≥ 400 were observed.',
    );
  else
    for (const issue of report.issues)
      lines.push(
        `- ${issue.kind} in \`${issue.result}\`: ${issue.text || issue.message || issue.url || 'see audit.json'}`,
      );
  lines.push(
    '',
    '## Interactions recorded',
    '',
    '| Result | Interaction | Status |',
    '| --- | --- | --- |',
  );
  for (const result of report.results) {
    for (const interaction of result.interactions) {
      lines.push(`| ${resultKey(result)} | ${interaction.name} | ${interaction.status} |`);
    }
  }
  lines.push(
    '',
    '## Slowest observed resources',
    '',
    '| Result | Initiator | Duration (ms) | Resource |',
    '| --- | --- | ---: | --- |',
  );
  for (const timing of report.topResourceTimings.slice(0, 15)) {
    lines.push(
      `| ${timing.result} | ${timing.initiatorType} | ${Math.round(timing.duration)} | ${timing.name} |`,
    );
  }
  lines.push(
    '',
    '## Protected checksums',
    '',
    `See [protected-checksums.json](./protected-checksums.json), covering all files under \`src/data\` and the supplied Meng-Ge WebP asset. ${checksumManifest.files.length} files are protected.`,
    '',
    '## Reproduction',
    '',
    '```sh',
    `node scripts/experience-audit.mjs --base-url ${report.baseUrl}`,
    '```',
    '',
  );
  return `${lines.join('\n')}\n`;
}

await mkdir(artifactRoot, { recursive: true });
await mkdir(screenshotRoot, { recursive: true });
await mkdir(dirname(reportPath), { recursive: true });
await mkdir(dirname(checksumPath), { recursive: true });

const checksumManifest = await createProtectedManifest();
let checksumVerification = null;
if (args['verify-protected']) {
  const baseline = JSON.parse(await readFile(checksumPath, 'utf8'));
  const current = new Map(checksumManifest.files.map((file) => [file.path, file]));
  const changed = baseline.files
    .filter((file) => current.get(file.path)?.sha256 !== file.sha256)
    .map((file) => file.path);
  const added = checksumManifest.files
    .filter((file) => !baseline.files.some((old) => old.path === file.path))
    .map((file) => file.path);
  checksumVerification = {
    baselineCommit: baseline.commit,
    protectedFiles: baseline.files.length,
    changed,
    added,
    passed: changed.length === 0 && added.length === 0,
  };
  if (!checksumVerification.passed)
    throw new Error(`Protected data changed: ${[...changed, ...added].join(', ')}`);
}
const browser = await chromium.launch({ headless: !args.headed });
const results = [];
try {
  for (const viewport of viewports) {
    for (const locale of locales) {
      for (const definition of caseDefinitions) {
        process.stdout.write(`Capturing ${locale.id}/${viewport.id}/${definition.id}\n`);
        results.push(await captureCase(browser, locale, viewport, definition));
      }
    }
  }
} finally {
  await browser.close();
}

const report = {
  schema: 'acsic-knowledge-hub-experience-audit/v1',
  capturedAt: nowIso(),
  commit: getCommit(),
  baseUrl,
  artifactRoot,
  viewports: Object.fromEntries(viewports.map((item) => [item.id, item])),
  caseDefinitions: caseDefinitions.map(({ id, label }) => ({ id, label })),
  results,
  issues: flattenIssues(results),
  topResourceTimings: topTimings(results),
  checksumVerification,
  summary: {
    captures: results.length,
    navigationFailures: results.filter((result) => result.navigationError).length,
    issueCount: flattenIssues(results).length,
    interactionCount: results.reduce((sum, result) => sum + result.interactions.length, 0),
  },
};

if (!args['verify-protected'])
  await writeFile(checksumPath, `${JSON.stringify(checksumManifest, null, 2)}\n`, 'utf8');
await writeFile(
  join(artifactRoot, 'audit.json'),
  `${JSON.stringify({ report, checksumManifest }, null, 2)}\n`,
  'utf8',
);
await writeFile(reportPath, writeMarkdown(report, checksumManifest), 'utf8');

process.stdout.write(`\nCompleted ${results.length} captures.\n`);
process.stdout.write(`Issues observed: ${report.summary.issueCount}\n`);
process.stdout.write(`Detailed report: ${join(artifactRoot, 'audit.json')}\n`);
process.stdout.write(`Baseline: ${reportPath}\n`);
process.stdout.write(`Protected checksums: ${checksumPath}\n`);

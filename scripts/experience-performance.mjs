#!/usr/bin/env node
/* global document, window */

/**
 * Run a cold Lighthouse/performance baseline against a production build.
 *
 * This script deliberately keeps Lighthouse and axe out of package.json. The
 * repository can run the browser/resource checks with its existing Playwright
 * dependency; Lighthouse is discovered when the caller provides it (for
 * example, LIGHTHOUSE_BIN=/private/tmp/acsic-qa/node_modules/.bin/lighthouse).
 *
 * Usage:
 *   node scripts/experience-performance.mjs
 *   node scripts/experience-performance.mjs --base-url http://127.0.0.1:4176/acsic-knowledge-hub/
 *   node scripts/experience-performance.mjs --output /private/tmp/acsic-performance
 *   node scripts/experience-performance.mjs --require-lighthouse
 */

import { execFile as execFileCallback, execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const execFile = promisify(execFileCallback);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2));
const baseUrl = ensureTrailingSlash(
  args['base-url'] || process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4176/acsic-knowledge-hub/',
);
const outputRoot = resolve(
  args.output || process.env.PERFORMANCE_OUTPUT || '/private/tmp/acsic-performance-artifacts',
);
const lighthouseRoot = join(outputRoot, 'lighthouse');
const requireLighthouse = Boolean(args['require-lighthouse']);

const profiles = [
  {
    id: 'mobile',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    preset: 'mobile',
  },
  {
    id: 'desktop',
    width: 1440,
    height: 1000,
    isMobile: false,
    hasTouch: false,
    preset: 'desktop',
  },
];

const routeSpecs = [
  { id: 'home', route: '/en/', map: true },
  { id: 'members', route: '/en/members', map: false },
  { id: 'acgf', route: '/en/institutions/acgf-tw', map: false },
  { id: 'compare', route: '/en/compare', map: false },
  { id: 'data', route: '/en/data-pilot', map: false },
  { id: 'systems', route: '/en/systems', map: false },
  { id: 'resources', route: '/en/resources', map: false },
];

const fixedThrottling = {
  method: 'devtools',
  rttMs: 150,
  throughputKbps: 1_638.4,
  requestLatencyMs: 150,
  downloadThroughputKbps: 1_638.4,
  uploadThroughputKbps: 750,
  cpuSlowdownMultiplier: 4,
};

// Vite emits the 3D scene as `NetworkScene-<hash>.js` and may emit a
// package/vendor chunk beginning with `three` or `react-three`.  Keep this
// intentionally narrow: the main `NetworkExplorer` route chunk contains the
// lightweight SVG explorer and must not count as a Three.js request.
const threeChunkPattern =
  /^(?:(?:NetworkScene|three|react-three|vendor-three)(?:[-_.].*)?)\.m?js$/i;

function isThreeChunkUrl(resourceUrl) {
  let pathname = resourceUrl;
  try {
    pathname = new URL(resourceUrl).pathname;
  } catch {
    // Resource Timing URLs should be absolute, but keep the audit resilient
    // when a test fixture supplies a relative URL.
  }
  const fileName = pathname.split('/').pop() || pathname;
  return threeChunkPattern.test(fileName);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value?.startsWith('--')) continue;
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

function buildUrl(route, query = '') {
  const url = new URL(baseUrl);
  if (query) {
    const queryParams = new URLSearchParams(query);
    queryParams.forEach((value, key) => url.searchParams.set(key, value));
  }
  url.hash = `#${route}`;
  return url.toString();
}

function nowIso() {
  return new Date().toISOString();
}

function median(values) {
  const numbers = values.filter((value) => typeof value === 'number' && Number.isFinite(value));
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function round(value, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
}

function findLighthouse() {
  const explicit = process.env.LIGHTHOUSE_BIN || args['lighthouse-bin'];
  if (explicit) return { command: resolve(explicit), prefix: [] };

  const local = join(repositoryRoot, 'node_modules/.bin/lighthouse');
  if (existsSync(local)) return { command: local, prefix: [] };

  try {
    const command = execFileSync('which', ['lighthouse'], { encoding: 'utf8' }).trim();
    if (command) return { command, prefix: [] };
  } catch {
    // Lighthouse is an optional QA dependency.
  }

  try {
    execFileSync('pnpm', ['exec', 'lighthouse', '--version'], {
      cwd: repositoryRoot,
      stdio: 'ignore',
    });
    return { command: 'pnpm', prefix: ['exec', 'lighthouse'] };
  } catch {
    return null;
  }
}

function lighthouseFlags(profile, outputPath) {
  return [
    '--output=json',
    `--output-path=${outputPath}`,
    '--quiet',
    profile.preset === 'mobile' ? '--form-factor=mobile' : '--preset=desktop',
    `--throttling-method=${fixedThrottling.method}`,
    `--throttling.rttMs=${fixedThrottling.rttMs}`,
    `--throttling.throughputKbps=${fixedThrottling.throughputKbps}`,
    `--throttling.requestLatencyMs=${fixedThrottling.requestLatencyMs}`,
    `--throttling.downloadThroughputKbps=${fixedThrottling.downloadThroughputKbps}`,
    `--throttling.uploadThroughputKbps=${fixedThrottling.uploadThroughputKbps}`,
    `--throttling.cpuSlowdownMultiplier=${fixedThrottling.cpuSlowdownMultiplier}`,
    `--screenEmulation.mobile=${profile.isMobile}`,
    `--screenEmulation.width=${profile.width}`,
    `--screenEmulation.height=${profile.height}`,
    '--screenEmulation.deviceScaleFactor=1',
    '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu',
  ];
}

async function runLighthouse(lighthouse, profile, runNumber) {
  const directory = join(lighthouseRoot, profile.id);
  await mkdir(directory, { recursive: true });
  const outputPath = join(directory, `run-${runNumber}.json`);
  const url = buildUrl('/en/');
  const commandArgs = [...lighthouse.prefix, url, ...lighthouseFlags(profile, outputPath)];
  try {
    await execFile(lighthouse.command, commandArgs, {
      cwd: repositoryRoot,
      maxBuffer: 2 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: '1' },
    });
    const report = JSON.parse(await readFile(outputPath, 'utf8'));
    return {
      status: 'ok',
      run: runNumber,
      profile: profile.id,
      url,
      path: outputPath,
      metrics: extractLighthouseMetrics(report),
    };
  } catch (error) {
    return {
      status: 'error',
      run: runNumber,
      profile: profile.id,
      url,
      path: outputPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractLighthouseMetrics(report) {
  const audit = (id) => report.audits?.[id] ?? {};
  const categoryScore = report.categories?.performance?.score;
  return {
    performanceScore: categoryScore == null ? null : round(categoryScore * 100, 1),
    lcpMs: round(audit('largest-contentful-paint').numericValue),
    lcpScore: score(audit('largest-contentful-paint')),
    cls: round(audit('cumulative-layout-shift').numericValue, 4),
    clsScore: score(audit('cumulative-layout-shift')),
    tbtMs: round(audit('total-blocking-time').numericValue),
    tbtScore: score(audit('total-blocking-time')),
    speedIndexMs: round(audit('speed-index').numericValue),
    firstContentfulPaintMs: round(audit('first-contentful-paint').numericValue),
  };
}

function score(audit) {
  return audit.score == null ? null : round(audit.score * 100, 1);
}

function medianMetrics(runs) {
  const keys = [
    'performanceScore',
    'lcpMs',
    'lcpScore',
    'cls',
    'clsScore',
    'tbtMs',
    'tbtScore',
    'speedIndexMs',
    'firstContentfulPaintMs',
  ];
  return Object.fromEntries(
    keys.map((key) => [key, median(runs.map((run) => run.metrics?.[key]))]),
  );
}

function lighthouseGate(runsByProfile) {
  const profileChecks = Object.fromEntries(
    profiles.map((profile) => {
      const runs = runsByProfile[profile.id] ?? [];
      const successfulRuns = runs.filter((run) => run.status === 'ok').length;
      const metrics = medianMetrics(runs.filter((run) => run.status === 'ok'));
      const minimumScore = profile.id === 'mobile' ? 90 : 95;
      const qualityPassed =
        metrics.performanceScore >= minimumScore && metrics.lcpMs <= 2500 && metrics.cls <= 0.1;
      return [
        profile.id,
        {
          expectedRuns: 3,
          observedRuns: runs.length,
          successfulRuns,
          failedRuns: runs.filter((run) => run.status !== 'ok').map((run) => run.run),
          minimumScore,
          metrics,
          qualityPassed,
          passed: runs.length === 3 && successfulRuns === 3 && qualityPassed,
        },
      ];
    }),
  );
  return {
    required: requireLighthouse,
    available: Object.values(runsByProfile).some((runs) => runs.length > 0),
    profiles: profileChecks,
    passed:
      !requireLighthouse ||
      Object.values(profileChecks).every((profileCheck) => profileCheck.passed),
  };
}

async function measureBrowserRoute(browser, profile, routeSpec) {
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    serviceWorkers: 'block',
    colorScheme: 'light',
  });
  await context.addInitScript(() => performance.mark('acsic-qa-navigation-start'));
  const page = await context.newPage();
  const scriptResponses = new Map();
  const pageErrors = [];
  const failedRequests = [];
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script')
      scriptResponses.set(response.url(), response);
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), failure: request.failure() }),
  );

  const url = buildUrl(routeSpec.route, routeSpec.map ? '' : '');
  let navigationError = null;
  let mapFirstUsableTimeMs = null;
  let mapMode = null;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('load', { timeout: 45_000 }).catch(() => undefined);
    if (routeSpec.map) {
      await page
        .locator('[data-testid="asia-map-stage"], .network-explorer-fallback')
        .first()
        .waitFor({ state: 'visible', timeout: 45_000 });
      await page.waitForFunction(
        () =>
          Boolean(document.querySelector('.network-explorer-fallback')) ||
          Boolean(document.querySelector('[data-testid="asia-map-stage"] .network-map-svg')) ||
          [...document.querySelectorAll('[data-testid="asia-map-stage"] canvas')].some(
            (canvas) => canvas.width > 0 && canvas.height > 0,
          ),
        undefined,
        { timeout: 45_000 },
      );
      mapFirstUsableTimeMs = await page.evaluate(() => {
        const start = performance.getEntriesByName('acsic-qa-navigation-start')[0]?.startTime ?? 0;
        return performance.now() - start;
      });
      mapMode = await page.evaluate(() => {
        if (document.querySelector('.network-explorer-fallback')) return 'fallback';
        if (
          [...document.querySelectorAll('[data-testid="asia-map-stage"] canvas')].some(
            (canvas) => canvas.width > 0 && canvas.height > 0,
          )
        ) {
          return 'webgl';
        }
        return document.querySelector('[data-testid="asia-map-stage"] .network-map-svg')
          ? 'svg'
          : 'unknown';
      });
    }
    await page.waitForTimeout(250);
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error);
  }

  const pageState = await page
    .evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadEnd = navigation?.loadEventEnd || performance.now();
      return {
        title: document.title,
        hash: window.location.hash,
        bodyScrollWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        resources: performance
          .getEntriesByType('resource')
          .filter((entry) => entry.startTime <= loadEnd + 250)
          .map((entry) => ({
            name: entry.name,
            initiatorType: entry.initiatorType,
            startTime: entry.startTime,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
          })),
        navigation: navigation
          ? {
              domContentLoaded: navigation.domContentLoadedEventEnd,
              loadEventEnd: navigation.loadEventEnd,
              transferSize: navigation.transferSize,
              encodedBodySize: navigation.encodedBodySize,
              decodedBodySize: navigation.decodedBodySize,
            }
          : null,
      };
    })
    .catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));

  const resourceByUrl = new Map(
    Array.isArray(pageState.resources)
      ? pageState.resources.map((resource) => [resource.name, resource])
      : [],
  );
  const scripts = [];
  for (const [urlKey, response] of scriptResponses) {
    const timing = resourceByUrl.get(urlKey);
    if (!timing || response.status() >= 400) continue;
    let body = null;
    try {
      body = await response.body();
    } catch {
      // A cached/closed response still has timing data below.
    }
    const rawBytes = body?.byteLength ?? timing.decodedBodySize ?? null;
    const gzipBytes = body ? gzipSync(body).byteLength : null;
    const networkBytes = timing.transferSize || timing.encodedBodySize || null;
    scripts.push({
      url: urlKey,
      rawBytes,
      gzipBytes,
      networkBytes,
      three: isThreeChunkUrl(urlKey),
    });
  }
  const allResources = Array.isArray(pageState.resources) ? pageState.resources : [];
  const threeRequests = allResources
    .filter((resource) => isThreeChunkUrl(resource.name))
    .map((resource) => resource.name);
  const totals = {
    rawBytes: sum(scripts.map((item) => item.rawBytes)),
    gzipBytes: sum(scripts.map((item) => item.gzipBytes)),
    networkBytes: sum(scripts.map((item) => item.networkBytes)),
  };

  const result = {
    status: navigationError ? 'error' : 'ok',
    profile: profile.id,
    route: routeSpec.id,
    url,
    navigationError,
    mapFirstUsableTimeMs: round(mapFirstUsableTimeMs),
    mapMode,
    initialJavaScript: { ...totals, files: scripts },
    threeRequests,
    pageState,
    pageErrors,
    failedRequests,
  };
  await context.close();
  return result;
}

function sum(values) {
  const numbers = values.filter((value) => typeof value === 'number' && Number.isFinite(value));
  return numbers.length ? numbers.reduce((total, value) => total + value, 0) : null;
}

function medianBrowserMetric(runs, key) {
  return median(runs.map((run) => run[key]));
}

function markdownReport(report) {
  const lines = [
    '# ACSIC Knowledge Hub performance baseline',
    '',
    `Generated: ${report.generatedAt}`,
    `Base URL: ${report.baseUrl}`,
    '',
    '## Lighthouse',
    '',
    'Three cold runs per profile use fixed DevTools throttling. Values are medians of successful runs; scores are percentages.',
    '',
    '| Profile | Performance | LCP (ms) | CLS | TBT (ms) | LCP score | CLS score | TBT score |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const profile of profiles) {
    const metrics = report.lighthouse.medians[profile.id];
    lines.push(
      `| ${profile.id} | ${display(metrics?.performanceScore)} | ${display(metrics?.lcpMs)} | ${display(metrics?.cls, 4)} | ${display(metrics?.tbtMs)} | ${display(metrics?.lcpScore)} | ${display(metrics?.clsScore)} | ${display(metrics?.tbtScore)} |`,
    );
  }
  lines.push(
    '',
    '## Browser resource checks',
    '',
    '| Profile | Home map first usable (ms) | Map mode |',
    '| --- | ---: | --- |',
  );
  for (const profile of profiles) {
    const runs = report.browser.mapRuns[profile.id] ?? [];
    lines.push(
      `| ${profile.id} | ${display(medianBrowserMetric(runs, 'mapFirstUsableTimeMs'))} | ${runs.map((run) => run.mapMode ?? 'n/a').join(', ') || 'n/a'} |`,
    );
  }
  lines.push(
    '',
    '### Initial JavaScript totals',
    '',
    '| Profile | Raw bytes | Gzip estimate | Network bytes |',
    '| --- | ---: | ---: | ---: |',
  );
  for (const profile of profiles) {
    const home = report.browser.initialJavaScript?.[profile.id];
    lines.push(
      `| ${profile.id} | ${display(home?.rawBytes)} | ${display(home?.gzipBytes)} | ${display(home?.networkBytes)} |`,
    );
  }
  const violations = report.checks.nonMapThreeRequests.filter((item) => item.count > 0);
  lines.push('', '### Non-map Three.js request invariant', '');
  lines.push(
    violations.length
      ? `FAIL: ${violations.length} non-map route/profile combinations requested Three.js-related resources.`
      : 'PASS: no non-map route requested a Three.js-related resource.',
  );
  const gates = report.checks?.gates;
  if (gates) {
    lines.push(
      '',
      '### Gate status',
      '',
      '| Gate | Status | Detail |',
      '| --- | --- | --- |',
      `| Lighthouse | ${gates.lighthouse.passed ? 'PASS' : 'FAIL'} | ${gates.lighthouse.required ? '3 successful runs per profile required' : 'optional'} |`,
      `| Non-map Three.js | ${gates.nonMapThree.passed ? 'PASS' : 'FAIL'} | ${gates.nonMapThree.violations.length} violating route/profile combinations |`,
      `| Browser checks | ${gates.browser.passed ? 'PASS' : 'FAIL'} | ${gates.browser.errorCount} runs with errors |`,
      `| Overall | ${gates.passed ? 'PASS' : 'FAIL'} | All required gates |`,
    );
  }
  lines.push(
    '',
    '## Interpretation',
    '',
    '- This is a performance baseline, not a release SLO.',
    '- Lighthouse scores and custom browser timings must be compared using the same build, viewport and throttling.',
    '- Raw/gzip/network byte totals are estimates when the browser did not expose a response body or transfer size.',
    '',
  );
  return `${lines.join('\n')}\n`;
}

function display(value, digits = 2) {
  if (value == null) return 'n/a';
  return typeof value === 'number' ? value.toFixed(digits).replace(/\.00$/, '') : String(value);
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  const lighthouse = findLighthouse();
  const lighthouseRuns = { mobile: [], desktop: [] };
  if (lighthouse) {
    for (const profile of profiles) {
      for (let run = 1; run <= 3; run += 1) {
        process.stdout.write(`Lighthouse ${profile.id} cold run ${run}/3\n`);
        lighthouseRuns[profile.id].push(await runLighthouse(lighthouse, profile, run));
      }
    }
  } else {
    process.stdout.write('Lighthouse is unavailable; browser/resource checks will still run.\n');
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-http-cache', '--disable-dev-shm-usage'],
  });
  const mapRuns = { mobile: [], desktop: [] };
  const resourceAudits = [];
  try {
    for (const profile of profiles) {
      for (let run = 1; run <= 3; run += 1) {
        process.stdout.write(`Browser map ${profile.id} cold run ${run}/3\n`);
        mapRuns[profile.id].push(await measureBrowserRoute(browser, profile, routeSpecs[0]));
      }
      for (const routeSpec of routeSpecs) {
        if (routeSpec.map) continue;
        process.stdout.write(`Browser resources ${profile.id}/${routeSpec.id}\n`);
        resourceAudits.push(await measureBrowserRoute(browser, profile, routeSpec));
      }
    }
  } finally {
    await browser.close();
  }

  const nonMapThreeRequests = resourceAudits.map((result) => ({
    profile: result.profile,
    route: result.route,
    count: result.threeRequests.length,
    requests: result.threeRequests,
  }));
  const initialJavaScript = Object.fromEntries(
    profiles.map((profile) => {
      const runs = mapRuns[profile.id];
      return [
        profile.id,
        {
          rawBytes: median(runs.map((run) => run.initialJavaScript?.rawBytes)),
          gzipBytes: median(runs.map((run) => run.initialJavaScript?.gzipBytes)),
          networkBytes: median(runs.map((run) => run.initialJavaScript?.networkBytes)),
        },
      ];
    }),
  );
  const nonMapThreeGate = {
    passed: nonMapThreeRequests.every((item) => item.count === 0),
    violations: nonMapThreeRequests.filter((item) => item.count > 0),
  };
  const browserErrors = [...mapRuns.mobile, ...mapRuns.desktop, ...resourceAudits].filter(
    (item) => item.status !== 'ok' || item.pageErrors.length || item.failedRequests.length,
  );
  const browserGate = {
    passed: browserErrors.length === 0,
    errorCount: browserErrors.length,
  };
  const gates = {
    lighthouse: lighthouseGate(lighthouseRuns),
    nonMapThree: nonMapThreeGate,
    browser: browserGate,
  };
  gates.passed = gates.lighthouse.passed && gates.nonMapThree.passed && gates.browser.passed;
  const report = {
    schema: 'acsic-knowledge-hub-experience-performance/v1',
    generatedAt: nowIso(),
    baseUrl,
    profiles,
    fixedThrottling,
    tooling: {
      lighthouse: lighthouse ? `${lighthouse.command} ${lighthouse.prefix.join(' ')}`.trim() : null,
      playwright: '@playwright/test',
    },
    lighthouse: {
      status: lighthouse ? 'collected' : 'unavailable',
      runs: lighthouseRuns,
      medians: Object.fromEntries(
        profiles.map((profile) => [
          profile.id,
          medianMetrics(lighthouseRuns[profile.id].filter((run) => run.status === 'ok')),
        ]),
      ),
    },
    browser: { mapRuns, initialJavaScript, resourceAudits },
    checks: { nonMapThreeRequests, gates },
    notes: [
      'Lighthouse uses three fresh CLI runs per profile with DevTools throttling.',
      'Map first usable time is measured until the WebGL canvas or standard explorer fallback is visible and usable.',
      'Raw JavaScript size uses response bodies when available; gzip is a deterministic estimate and network bytes use Resource Timing transfer/encoded sizes.',
      'Absence of Three.js on non-map routes is checked against the browser Resource Timing entries.',
    ],
  };
  await writeFile(
    join(outputRoot, 'performance-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await writeFile(join(outputRoot, 'performance-summary.md'), markdownReport(report));
  process.stdout.write(`Performance report: ${join(outputRoot, 'performance-report.json')}\n`);

  if (!gates.lighthouse.passed || !gates.nonMapThree.passed || !gates.browser.passed)
    process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}

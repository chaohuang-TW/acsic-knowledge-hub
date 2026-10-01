#!/usr/bin/env node
/* global document, window */

/**
 * Run an accessibility smoke audit over the public ACSIC routes.
 *
 * axe-core is intentionally optional: when it is not installed the report
 * still contains keyboard, target-size, overflow and sampled-contrast data,
 * and explicitly marks the automated axe portion as unavailable. This is not
 * a claim of complete WCAG AA conformance; the report always calls out the
 * manual review still required for focus appearance, contrast and 200% text.
 *
 * Usage:
 *   node scripts/experience-accessibility.mjs
 *   node scripts/experience-accessibility.mjs --base-url http://127.0.0.1:4176/acsic-knowledge-hub/
 *   node scripts/experience-accessibility.mjs --output /private/tmp/acsic-a11y
 *   AXE_CORE_PATH=/private/tmp/acsic-experience-qa-tools/node_modules/axe-core/axe.js node scripts/experience-accessibility.mjs
 *   node scripts/experience-accessibility.mjs --strict
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2));
const baseUrl = ensureTrailingSlash(
  args['base-url'] || process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4176/acsic-knowledge-hub/',
);
const outputRoot = resolve(
  args.output || process.env.ACCESSIBILITY_OUTPUT || '/private/tmp/acsic-accessibility-artifacts',
);
const strict = Boolean(args.strict);

const routes = [
  { id: 'home-en', route: '/en/', query: 'networkFallback=1' },
  { id: 'members-en', route: '/en/members' },
  { id: 'acgf-en', route: '/en/institutions/acgf-tw' },
  { id: 'compare-en', route: '/en/compare' },
  { id: 'data-en', route: '/en/data-pilot' },
  { id: 'systems-en', route: '/en/systems' },
  { id: 'resources-en', route: '/en/resources' },
  { id: 'reports-en', route: '/en/reports' },
  { id: 'unknown-en', route: '/en/not-a-real-route' },
  { id: 'home-zh-TW', route: '/zh-TW/', query: 'networkFallback=1' },
  { id: 'members-zh-TW', route: '/zh-TW/members' },
  { id: 'acgf-zh-TW', route: '/zh-TW/institutions/acgf-tw' },
  { id: 'compare-zh-TW', route: '/zh-TW/compare' },
  { id: 'data-zh-TW', route: '/zh-TW/data-pilot' },
  { id: 'systems-zh-TW', route: '/zh-TW/systems' },
  { id: 'resources-zh-TW', route: '/zh-TW/resources' },
  { id: 'reports-zh-TW', route: '/zh-TW/reports' },
  { id: 'unknown-zh-TW', route: '/zh-TW/not-a-real-route' },
];

const viewportSamples = [
  { id: '320', width: 320, height: 844, isMobile: true, hasTouch: true },
  { id: '390', width: 390, height: 844, isMobile: true, hasTouch: true },
  { id: '430', width: 430, height: 932, isMobile: true, hasTouch: true },
  { id: '768', width: 768, height: 1024, isMobile: false, hasTouch: false },
  { id: '1024', width: 1024, height: 900, isMobile: false, hasTouch: false },
  { id: '1440', width: 1440, height: 1000, isMobile: false, hasTouch: false },
  { id: '1920', width: 1920, height: 1080, isMobile: false, hasTouch: false },
  {
    id: '1024-text-zoom-200',
    width: 1024,
    height: 900,
    isMobile: false,
    hasTouch: false,
    textZoom: 2,
  },
];

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

function iso() {
  return new Date().toISOString();
}

async function loadAxeSource() {
  try {
    const explicitPath = process.env.AXE_CORE_PATH || args['axe-core'];
    const module = explicitPath
      ? await import(pathToFileURL(resolve(explicitPath)).href)
      : await import('axe-core');
    return module.default?.source || module.source || null;
  } catch {
    return null;
  }
}

async function installAxe(page, source) {
  if (!source) return false;
  try {
    await page.addScriptTag({ content: source });
    return true;
  } catch {
    return false;
  }
}

async function runAxe(page, installed) {
  if (!installed) return { status: 'unavailable', violations: [], incomplete: [], passes: [] };
  try {
    const result = await page.evaluate(async () => {
      if (!window.axe) return null;
      return window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        resultTypes: ['violations', 'incomplete', 'passes'],
      });
    });
    if (!result) return { status: 'unavailable', violations: [], incomplete: [], passes: [] };
    return {
      status: 'ok',
      violations: result.violations || [],
      incomplete: result.incomplete || [],
      passes: result.passes || [],
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      violations: [],
      incomplete: [],
      passes: [],
    };
  }
}

async function collectKeyboardFocus(page) {
  await page.evaluate(() => document.body?.focus());
  const sequence = [];
  const seen = new Set();
  for (let index = 0; index < 80; index += 1) {
    await page.keyboard.press('Tab');
    const item = await page.evaluate(() => {
      const node = document.activeElement;
      if (!node || node === document.body || node === document.documentElement) return null;
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      const key = `${node.tagName}:${node.id}:${node.getAttribute('aria-label') || ''}:${node.textContent?.trim().slice(0, 36) || ''}`;
      return {
        key,
        tag: node.tagName.toLowerCase(),
        role: node.getAttribute('role'),
        label: node.getAttribute('aria-label'),
        text: node.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) || '',
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
        focusVisible: node.matches(':focus-visible'),
        outline: style.outline,
        boxShadow: style.boxShadow,
        observableFocus:
          node.matches(':focus-visible') &&
          (style.outlineStyle !== 'none' ||
            style.outlineWidth !== '0px' ||
            style.boxShadow !== 'none'),
      };
    });
    if (!item || seen.has(item.key)) break;
    seen.add(item.key);
    sequence.push(item);
  }
  return {
    tabStops: sequence.length,
    sequence,
    focusStopsNeedingManualReview: sequence.filter((item) => !item.observableFocus).length,
  };
}

async function collectTouchTargets(page) {
  return page.evaluate(() => {
    const selectors = 'a,button,input,select,textarea,[role="button"],[role="link"],[tabindex]';
    return [...document.querySelectorAll(selectors)]
      .map((node) => {
        const element = node;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          label:
            element.getAttribute('aria-label') ||
            element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
            element.getAttribute('name') ||
            '',
          width: rect.width,
          height: rect.height,
          visible:
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            rect.width > 0 &&
            rect.height > 0,
        };
      })
      .filter((item) => item.visible)
      .map((item) => ({ ...item, meets44px: item.width >= 44 && item.height >= 44 }));
  });
}

async function collectContrastSample(page) {
  return page.evaluate(() => {
    const parseColor = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/i);
      if (!match) return null;
      const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
      if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) return null;
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
    };
    const luminance = (channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    const ratio = (foreground, background) => {
      const foregroundLuminance =
        0.2126 * luminance(foreground.r) +
        0.7152 * luminance(foreground.g) +
        0.0722 * luminance(foreground.b);
      const backgroundLuminance =
        0.2126 * luminance(background.r) +
        0.7152 * luminance(background.g) +
        0.0722 * luminance(background.b);
      const light = Math.max(foregroundLuminance, backgroundLuminance);
      const dark = Math.min(foregroundLuminance, backgroundLuminance);
      return (light + 0.05) / (dark + 0.05);
    };
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      );
    };
    const backgroundFor = (element) => {
      let current = element;
      while (current) {
        const color = parseColor(window.getComputedStyle(current).backgroundColor);
        if (color && color.a > 0.05) return color;
        current = current.parentElement;
      }
      return parseColor(window.getComputedStyle(document.body).backgroundColor);
    };
    const candidates = [];
    for (const element of document.querySelectorAll(
      'h1,h2,h3,h4,p,a,button,label,summary,dt,dd,li',
    )) {
      if (!visible(element) || !element.textContent?.trim()) continue;
      const style = window.getComputedStyle(element);
      const foreground = parseColor(style.color);
      const background = backgroundFor(element);
      if (!foreground || !background || background.a <= 0.05) continue;
      const contrast = ratio(foreground, background);
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
      const largeText = fontSize >= 18.66 || (fontSize >= 14 && fontWeight >= 700);
      const threshold = largeText ? 3 : 4.5;
      candidates.push({
        selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`,
        text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
        contrast: Number(contrast.toFixed(2)),
        threshold,
        passesSample: contrast >= threshold,
        foreground: style.color,
        background: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
      });
    }
    return {
      sampled: candidates.length,
      failingSample: candidates.filter((item) => !item.passesSample).slice(0, 40),
      lowestRatios: candidates.sort((left, right) => left.contrast - right.contrast).slice(0, 20),
    };
  });
}

async function inspectPage(browser, route, viewport, axeSource) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    serviceWorkers: 'block',
    colorScheme: 'light',
  });
  const page = await context.newPage();
  const pageErrors = [];
  const failedRequests = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), failure: request.failure() }),
  );
  const url = buildUrl(route.route, route.query);
  let navigationError = null;
  let axeInstalled = false;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForLoadState('load', { timeout: 45_000 }).catch(() => undefined);
    if (viewport.textZoom) {
      await page.evaluate((zoom) => {
        document.documentElement.dataset.qaTextZoom = `${zoom * 100}%`;
        document.documentElement.style.fontSize = `${zoom * 100}%`;
      }, viewport.textZoom);
    }
    await page.waitForTimeout(150);
    axeInstalled = await installAxe(page, axeSource);
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error);
  }

  const [axe, keyboard, touchTargets, contrast, layout] = await Promise.all([
    runAxe(page, axeInstalled),
    collectKeyboardFocus(page),
    collectTouchTargets(page),
    collectContrastSample(page),
    page
      .evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        noHorizontalOverflow:
          document.documentElement.scrollWidth <= window.innerWidth &&
          document.body.scrollWidth <= window.innerWidth,
      }))
      .catch((error) => ({ error: error instanceof Error ? error.message : String(error) })),
  ]);
  const result = {
    route: route.id,
    requestedUrl: url,
    viewport,
    capturedAt: iso(),
    navigationError,
    axe,
    keyboard,
    touchTargets: {
      count: touchTargets.length,
      under44px: touchTargets.filter((item) => !item.meets44px),
    },
    contrast,
    layout,
    pageErrors,
    failedRequests,
  };
  await context.close();
  return result;
}

function flatten(values) {
  return values.flatMap((value) => value);
}

function markdownReport(report) {
  const allResults = report.results;
  const axeResults = allResults.filter((result) => result.axe.status === 'ok');
  const violationCount = flatten(axeResults.map((result) => result.axe.violations)).length;
  const overflowCount = allResults.filter(
    (result) => result.layout.noHorizontalOverflow === false,
  ).length;
  const targetCount = allResults.reduce(
    (total, result) => total + result.touchTargets.under44px.length,
    0,
  );
  const focusReviewCount = allResults.reduce(
    (total, result) => total + result.keyboard.focusStopsNeedingManualReview,
    0,
  );
  const lines = [
    '# ACSIC Knowledge Hub accessibility baseline',
    '',
    `Generated: ${report.generatedAt}`,
    `Base URL: ${report.baseUrl}`,
    '',
    '## Automated and sampled results',
    '',
    `- axe-core: ${report.tooling.axe.status === 'available' ? `available (${axeResults.length} samples)` : 'not installed; automated axe checks were not run'}`,
    `- axe violations: ${violationCount}`,
    `- samples with horizontal overflow: ${overflowCount}`,
    `- interactive targets under 44×44 CSS px: ${targetCount}`,
    `- focus stops needing manual focus-ring review: ${focusReviewCount}`,
    '',
    '| Route | Viewport | Axe violations | Overflow | Under 44px | Focus review | Lowest sampled contrast |',
    '| --- | --- | ---: | --- | ---: | ---: | ---: |',
  ];
  for (const result of allResults) {
    const lowest = result.contrast.lowestRatios?.[0]?.contrast;
    lines.push(
      `| ${result.route} | ${result.viewport.id} | ${result.axe.violations.length} | ${result.layout.noHorizontalOverflow === false ? 'FAIL' : 'pass'} | ${result.touchTargets.under44px.length} | ${result.keyboard.focusStopsNeedingManualReview} | ${lowest ?? 'n/a'} |`,
    );
  }
  lines.push(
    '',
    '## Scope limits',
    '',
    '- This is a route, viewport, keyboard, target-size and sampled-contrast smoke audit; it is not an automated claim of complete WCAG 2.2 AA conformance.',
    '- The 200% text sample uses a root-font-size approximation because Playwright does not expose a portable browser text-zoom control. Confirm reflow and focus appearance manually in a browser.',
    '- Contrast samples skip transparent/image/complex backgrounds and therefore require manual review.',
    '- A human should review the axe incomplete list, all focus stops, touch-target exceptions and the screenshots/production UI before release.',
    '',
  );
  return `${lines.join('\n')}\n`;
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  const axeSource = await loadAxeSource();
  const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
  const results = [];
  try {
    for (const route of routes) {
      for (const viewport of viewportSamples) {
        process.stdout.write(`Accessibility ${route.id}/${viewport.id}\n`);
        results.push(await inspectPage(browser, route, viewport, axeSource));
      }
    }
  } finally {
    await browser.close();
  }
  const report = {
    schema: 'acsic-knowledge-hub-experience-accessibility/v1',
    generatedAt: iso(),
    repositoryRoot,
    baseUrl,
    tooling: {
      axe: { status: axeSource ? 'available' : 'unavailable', package: 'axe-core' },
      playwright: '@playwright/test',
    },
    viewportSamples,
    routes,
    results,
    notes: [
      'Automated axe checks, when available, cover the WCAG 2A/2AA tagged rules only.',
      'Keyboard focus, 44px targets and contrast are reported as evidence for human review rather than a complete conformance claim.',
      'The 200% text sample increases the root font size to approximate text zoom and must be checked manually in a real browser.',
    ],
  };
  await writeFile(
    resolve(outputRoot, 'accessibility-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await writeFile(resolve(outputRoot, 'accessibility-summary.md'), markdownReport(report));
  process.stdout.write(
    `Accessibility report: ${resolve(outputRoot, 'accessibility-report.json')}\n`,
  );

  const axeViolations = flatten(results.map((result) => result.axe.violations));
  const overflowFailures = results.filter((result) => result.layout.noHorizontalOverflow === false);
  if (strict && (axeViolations.length || overflowFailures.length)) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}

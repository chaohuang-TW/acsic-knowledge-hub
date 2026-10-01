#!/usr/bin/env node
/* global document, window */

/** Capture archived local concepts; provide their served URL and local HTML source. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const args = parseArgs(process.argv.slice(2));
const baseUrl = args['base-url'] || args.baseUrl;
if (!baseUrl || !args.source)
  throw new Error('Provide --base-url and --source for the archived concept HTML.');
const output = resolve(args.output || '/private/tmp/acsic-experience-artifacts/prototypes');
const sourcePath = resolve(args.source);
const viewports = [
  { id: 'desktop1440', width: 1440, height: 1000 },
  { id: 'mobile390', width: 390, height: 844 },
];
const concepts = ['a', 'b', 'c'];

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index]?.startsWith('--')) continue;
    const key = argv[index].slice(2);
    const next = argv[index + 1];
    result[key] = next && !next.startsWith('--') ? next : true;
    if (result[key] !== true) index += 1;
  }
  return result;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function iso() {
  return new Date().toISOString();
}

const browser = await chromium.launch({ headless: !args.headed });
const results = [];
await mkdir(output, { recursive: true });
try {
  for (const concept of concepts) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.id.startsWith('mobile'),
        hasTouch: viewport.id.startsWith('mobile'),
        colorScheme: 'light',
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      const consoleMessages = [];
      const pageErrors = [];
      const failedRequests = [];
      const httpErrors = [];
      page.on('console', (message) =>
        consoleMessages.push({ type: message.type(), text: message.text() }),
      );
      page.on('pageerror', (error) =>
        pageErrors.push({ message: error.message, stack: error.stack }),
      );
      page.on('requestfailed', (request) =>
        failedRequests.push({ url: request.url(), failure: request.failure() }),
      );
      page.on('response', (response) => {
        if (response.status() >= 400)
          httpErrors.push({ url: response.url(), status: response.status() });
      });
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}concept=${concept}`;
      let navigationError = null;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(500);
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }
      const stem = `concept-${concept}-${viewport.id}`;
      const firstScreen = join(output, `${stem}-first-screen.png`);
      const fullPage = join(output, `${stem}-full-page.png`);
      if (!navigationError) {
        await page.screenshot({ path: firstScreen, fullPage: false });
        await page.screenshot({ path: fullPage, fullPage: true });
      }
      const state = await page
        .evaluate(() => ({
          title: document.title,
          concept: document.querySelector('#concept')?.textContent,
          hash: window.location.hash,
          bodyScrollWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
          headings: [...document.querySelectorAll('h1, h2')].map((node) => node.textContent),
          resources: performance.getEntriesByType('resource').map((entry) => ({
            name: entry.name,
            initiatorType: entry.initiatorType,
            duration: entry.duration,
            transferSize: entry.transferSize,
          })),
        }))
        .catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));
      results.push({
        concept,
        viewport,
        url,
        capturedAt: iso(),
        navigationError,
        state,
        consoleMessages,
        pageErrors,
        failedRequests,
        httpErrors,
        screenshots: navigationError ? null : { firstScreen, fullPage },
      });
      await context.close();
      process.stdout.write(`Captured concept ${concept}/${viewport.id}\n`);
    }
  }
} finally {
  await browser.close();
}

let html;
try {
  html = await readFile(sourcePath);
} catch {
  const response = await fetch(baseUrl);
  html = Buffer.from(await response.arrayBuffer());
}
const report = {
  schema: 'acsic-knowledge-hub-prototype-audit/v1',
  capturedAt: iso(),
  source: sourcePath,
  sourceSha256: sha256(html),
  baseUrl,
  output,
  results,
};
await writeFile(join(output, 'prototype-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`Prototype report: ${join(output, 'prototype-audit.json')}\n`);

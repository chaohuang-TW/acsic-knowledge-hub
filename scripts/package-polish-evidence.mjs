#!/usr/bin/env node
/* global document, window */

/**
 * Package selected, reproducible polish evidence outside the source tree.
 * `--collect-ci` sequentially audits exact baseline/candidate production builds.
 * Plain packaging accepts local before/after roots and explicit path overrides.
 * No participant results, private attachments or dependency files are included.
 */

import { execFile as execFileCallback, execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from '@playwright/test';

const execFile = promisify(execFileCallback);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs(process.argv.slice(2));
const zipName = 'ACSIC-Experience-Polish-Evidence.zip';

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) throw new Error(`Unexpected argument: ${argv[index]}`);
    const key = argv[index].slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function commit(workspace) {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: workspace, encoding: 'utf8' }).trim();
}

function workingTreeDirty(workspace) {
  return (
    execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], {
      cwd: workspace,
      encoding: 'utf8',
    }).trim().length > 0
  );
}

async function json(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const all = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) all.push(...(await files(path)));
    else if (entry.isFile()) all.push(path);
  }
  return all.sort();
}

function phasePaths(id, output) {
  const base = resolve(args[id] || join(output, id));
  return {
    base,
    captures: resolve(args[`${id}-captures`] || join(base, 'captures')),
    performance: resolve(args[`${id}-performance`] || join(base, 'performance')),
    accessibility: resolve(args[`${id}-accessibility`] || join(base, 'accessibility')),
    targets: resolve(args[`${id}-targets`] || join(base, 'targets')),
  };
}

async function run(command, commandArgs, cwd, allowFailure = false) {
  const child = spawn(command, commandArgs, { cwd, env: process.env, stdio: 'inherit' });
  const exitCode = await new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolveExit(code));
  });
  if (exitCode !== 0 && !allowFailure)
    throw new Error(`${command} ${commandArgs.join(' ')} exited ${exitCode}`);
  return exitCode;
}

async function startPreview(workspace, port) {
  const child = spawn(
    process.execPath,
    [
      join(workspace, 'node_modules/vite/bin/vite.js'),
      'preview',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--strictPort',
    ],
    { cwd: workspace, stdio: 'inherit' },
  );
  const baseUrl = `http://127.0.0.1:${port}/acsic-knowledge-hub/`;
  let startupError = null;
  child.once('error', (error) => {
    startupError = error;
  });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (startupError) throw startupError;
    if (child.exitCode != null) throw new Error(`Preview exited ${child.exitCode}`);
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) {
        const servedHtml = await response.text();
        const exactHtml = await readFile(join(workspace, 'dist/index.html'), 'utf8');
        if (servedHtml !== exactHtml) throw new Error('Preview does not serve this exact build');
        return { child, baseUrl };
      }
    } catch {
      // Give the production preview a short bounded startup interval.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
  }
  child.kill('SIGTERM');
  throw new Error('Production preview startup timed out');
}

async function stopPreview(child) {
  if (child.exitCode != null) return;
  const exited = new Promise((resolveExit) => child.once('exit', resolveExit));
  child.kill('SIGTERM');
  await exited;
}

async function collectPhase(workspace, paths, baselineChecksum, isAfter, beforeTargets) {
  await mkdir(paths.captures, { recursive: true });
  const { child, baseUrl } = await startPreview(workspace, Number(args.port || 4180));
  try {
    // Lighthouse runs exclusively, before all screenshot/axe browser work.
    await run(
      process.execPath,
      [
        join(workspace, 'scripts/experience-performance.mjs'),
        '--base-url',
        baseUrl,
        '--output',
        paths.performance,
        '--require-lighthouse',
      ],
      workspace,
      !isAfter,
    );
    const captureArgs = [
      join(workspace, 'scripts/experience-audit.mjs'),
      '--base-url',
      baseUrl,
      '--output',
      paths.captures,
      '--report',
      join(paths.captures, 'captures.md'),
      '--checksums',
      baselineChecksum,
    ];
    if (isAfter) captureArgs.push('--verify-protected');
    await run(process.execPath, captureArgs, workspace);
    await collectFilteredScreenshots(baseUrl, paths.captures);
    await run(
      process.execPath,
      [
        join(workspace, 'scripts/experience-accessibility.mjs'),
        '--base-url',
        baseUrl,
        '--output',
        paths.accessibility,
        ...(isAfter ? ['--strict'] : []),
      ],
      workspace,
    );
    const targetScript = join(root, 'scripts/polish-target-audit.mjs');
    if (existsSync(targetScript))
      await run(
        process.execPath,
        [
          targetScript,
          '--base-url',
          baseUrl,
          '--output',
          paths.targets,
          '--phase',
          isAfter ? 'after' : 'before',
          '--build-sha',
          commit(workspace),
          ...(isAfter ? ['--before', join(beforeTargets, 'report.json')] : []),
        ],
        root,
      );
  } finally {
    await stopPreview(child);
  }
}

async function collectFilteredScreenshots(baseUrl, directory) {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const locale of ['en', 'zh-TW']) {
      for (const state of [
        'directoryFiltered',
        'dataAcgf',
        'dataLoanIndicator',
        'dataAcgfHistory',
      ]) {
        const context = await browser.newContext({
          viewport: { width: 390, height: 844 },
          isMobile: true,
          hasTouch: true,
          locale: locale === 'en' ? 'en-US' : 'zh-TW',
          colorScheme: 'light',
          reducedMotion: 'reduce',
        });
        try {
          const page = await context.newPage();
          const url = new URL(baseUrl);
          url.hash =
            state === 'directoryFiltered'
              ? `#/${locale}/members?q=KODIT`
              : `#/${locale}/data-pilot`;
          await page.goto(url.href, { waitUntil: 'networkidle' });
          if (state.startsWith('data')) {
            await page.locator('.pilot-toolbar select').first().waitFor({ state: 'visible' });
            if (state !== 'dataLoanIndicator')
              await page.locator('.pilot-toolbar select').first().selectOption('acgf-tw');
            if (state === 'dataLoanIndicator')
              await page
                .locator('.pilot-toolbar select')
                .nth(1)
                .selectOption('guaranteed_loan_volume');
            if (state === 'dataAcgfHistory') {
              await page.locator('.historical-series > summary').click();
              await page.locator('.historical-series').scrollIntoViewIfNeeded();
            }
          }
          await page.waitForTimeout(200);
          const file = `screenshots/${locale}-${state}-mobile-first-screen.png`;
          await page.screenshot({ path: join(directory, file) });
          const pageState = await page.evaluate(() => ({
            hash: window.location.hash,
            title: document.title,
            visibleText: document.body.innerText.slice(0, 700),
          }));
          results.push({
            file,
            locale,
            route: pageState.hash,
            state,
            viewport: { width: 390, height: 844 },
            browser: browser.version(),
            capturedAt: new Date().toISOString(),
            requestedUrl: url.href,
            captureKind: 'first-screen',
            conditions: { colorScheme: 'light', reducedMotion: 'reduce', freshContext: true },
            environment: args.source || 'local-production-build',
            pageState,
          });
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  await writeFile(
    join(directory, 'filtered-captures.json'),
    `${JSON.stringify({ results }, null, 2)}\n`,
  );
}

function sanitize(value, replacements) {
  if (typeof value === 'string') {
    let text = value;
    for (const [from, to] of replacements) text = text.split(from).join(to);
    // The evidence must not retain incidental local-user or CI-runner paths.
    text = text.replace(
      /\/(?:Users|home\/runner|private\/tmp|tmp)\/[^\s"'<>),]+/g,
      '[local-path-redacted]',
    ); // secret-scan:allow
    return text;
  }
  if (Array.isArray(value)) return value.map((item) => sanitize(item, replacements));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitize(item, replacements)]),
    );
  return value;
}

async function saveJson(destination, value, replacements) {
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(sanitize(value, replacements), null, 2)}\n`);
}

async function copyText(source, destination, replacements) {
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, sanitize(await readFile(source, 'utf8'), replacements));
}

async function buildAssets(directory) {
  if (!directory || !existsSync(directory)) return { status: 'unavailable', files: [] };
  const selected = (await files(directory)).filter((path) =>
    /\.(?:html|js|css|svg|webp)$/.test(path),
  );
  const assets = [];
  for (const path of selected) {
    const content = await readFile(path);
    assets.push({
      path: relative(directory, path),
      bytes: content.length,
      sha256: sha256(content),
    });
  }
  return { status: 'collected', files: assets };
}

async function packagePhase(id, paths, staging, replacements) {
  const capture = await json(join(paths.captures, 'audit.json'));
  const performance = await json(join(paths.performance, 'performance-report.json'));
  const accessibility = await json(join(paths.accessibility, 'accessibility-report.json'));
  await saveJson(join(staging, 'tests', `${id}-capture-audit.json`), capture, replacements);
  await saveJson(
    join(staging, 'metrics/lighthouse', `${id}-performance-report.json`),
    performance,
    replacements,
  );
  await saveJson(
    join(staging, 'metrics/accessibility', `${id}-accessibility-report.json`),
    accessibility,
    replacements,
  );
  await saveJson(
    join(staging, 'metrics/bundles', `${id}-protected-checksums.json`),
    capture.checksumManifest,
    replacements,
  );

  for (const path of await files(join(paths.performance, 'lighthouse'))) {
    if (!path.endsWith('.json')) continue;
    await saveJson(
      join(
        staging,
        'metrics/lighthouse',
        id,
        relative(join(paths.performance, 'lighthouse'), path),
      ),
      await json(path),
      replacements,
    );
  }
  for (const [source, target] of [
    [join(paths.performance, 'performance-summary.md'), `metrics/lighthouse/${id}-summary.md`],
    [
      join(paths.accessibility, 'accessibility-summary.md'),
      `metrics/accessibility/${id}-summary.md`,
    ],
  ])
    if (existsSync(source)) await copyText(source, join(staging, target), replacements);

  const selectedCases = new Set([
    'home',
    'acgf',
    'directory',
    'data',
    'map',
    'selectedTaiwan',
    'standardExplorer',
  ]);
  const screenshots = [];
  for (const result of capture.report.results) {
    if (!selectedCases.has(result.case)) continue;
    if (!result.screenshots.firstScreen)
      throw new Error(`Missing ${id} screenshot: ${result.case}`);
    // First screens show hierarchy; mobile profile/directory/data also retain full content.
    const shots = [['first-screen', result.screenshots.firstScreen]];
    if (result.viewport === 'mobile' && ['acgf', 'directory', 'data'].includes(result.case))
      shots.push(['full-page', result.screenshots.fullPage]);
    for (const [kind, sourceRelative] of shots) {
      if (!sourceRelative) throw new Error(`Missing ${id} ${kind} screenshot`);
      const source = resolve(paths.captures, sourceRelative);
      if (!source.startsWith(`${paths.captures}/`))
        throw new Error('Screenshot escaped capture root');
      const file = `screenshots/${id}/${result.locale}-${result.case}-${result.viewport}-${kind}.png`;
      await mkdir(dirname(join(staging, file)), { recursive: true });
      await cp(source, join(staging, file));
      screenshots.push({
        file,
        locale: result.locale,
        route: result.pageState?.hash,
        state: result.case,
        viewport: { width: result.width, height: result.height },
        browser: 'Chromium (Playwright)',
        capturedAt: result.capturedAt,
        requestedUrl: result.requestedUrl,
        captureKind: kind,
        conditions: { colorScheme: 'light', reducedMotion: 'reduce', freshContext: true },
        environment: args.source || 'local-production-build',
      });
    }
  }
  if (existsSync(paths.targets)) {
    for (const path of await files(paths.targets)) {
      const destination = join(
        staging,
        'metrics/accessibility',
        id,
        'targets',
        relative(paths.targets, path),
      );
      if (path.endsWith('.json')) await saveJson(destination, await json(path), replacements);
      else if (/\.(?:md|csv|txt)$/.test(path)) await copyText(path, destination, replacements);
    }
  }
  const filteredReportPath = join(paths.captures, 'filtered-captures.json');
  if (existsSync(filteredReportPath)) {
    const filtered = await json(filteredReportPath);
    await saveJson(join(staging, 'tests', `${id}-filtered-captures.json`), filtered, replacements);
    for (const result of filtered.results) {
      const file = `screenshots/${id}/${result.file.split('/').pop()}`;
      await cp(join(paths.captures, result.file), join(staging, file));
      screenshots.push({ ...result, file });
    }
  }
  return { capture, performance, accessibility, screenshots };
}

function compareProtected(before, after) {
  const left = new Map(before.files.map((file) => [file.path, file.sha256]));
  const right = new Map(after.files.map((file) => [file.path, file.sha256]));
  const differences = [...new Set([...left.keys(), ...right.keys()])].filter(
    (path) => left.get(path) !== right.get(path),
  );
  return { passed: differences.length === 0, count: left.size, differences };
}

function compareBundles(before, after) {
  return Object.fromEntries(
    ['mobile', 'desktop'].map((profile) => {
      const baselineGzipBytes = before.browser.initialJavaScript[profile].gzipBytes;
      const releaseGzipBytes = after.browser.initialJavaScript[profile].gzipBytes;
      const deltaPercent = (releaseGzipBytes / baselineGzipBytes - 1) * 100;
      return [
        profile,
        {
          baselineGzipBytes,
          releaseGzipBytes,
          deltaPercent,
          maximumIncreasePercent: 5,
          passed: Number.isFinite(deltaPercent) && deltaPercent <= 5,
        },
      ];
    }),
  );
}

async function packageTests(staging, replacements) {
  const reportPaths = [
    args['tests-report'] ||
      (args['verification-root'] && join(args['verification-root'], 'e2e-results.json')),
    args['unit-report'] ||
      (args['verification-root'] && join(args['verification-root'], 'unit-results.json')),
  ];
  const [e2ePath, unitPath] = reportPaths;
  let e2e = null;
  let unit = null;
  if (e2ePath && existsSync(e2ePath)) {
    e2e = await json(e2ePath);
    await saveJson(join(staging, 'tests/e2e-results.json'), e2e, replacements);
  }
  if (unitPath && existsSync(unitPath)) {
    unit = await json(unitPath);
    await saveJson(join(staging, 'tests/unit-results.json'), unit, replacements);
  }
  const summary = {
    engineeringVerification: args['verified-ci']
      ? 'passed exact-head verify job'
      : 'not inferred; see supplied test reports and repository acceptance record',
    e2e: e2e
      ? {
          stats: e2e.stats,
          errors: e2e.errors || [],
          projects: e2e.config?.projects?.map((project) => ({
            name: project.name,
            use: project.use,
          })),
        }
      : { status: 'not supplied' },
    unit: unit
      ? {
          passed: unit.numPassedTests,
          failed: unit.numFailedTests,
          pending: unit.numPendingTests,
          success: unit.success,
        }
      : { status: 'not supplied' },
  };
  await saveJson(join(staging, 'tests/results-summary.json'), summary, replacements);
  await writeFile(
    join(staging, 'tests/results-summary.md'),
    `# Test scope and results\n\n- Engineering verification: ${summary.engineeringVerification}.\n- E2E: ${e2e ? `${e2e.stats?.expected ?? 'unknown'} expected, ${e2e.stats?.unexpected ?? 'unknown'} unexpected, ${e2e.stats?.flaky ?? 'unknown'} flaky, ${e2e.stats?.skipped ?? 'unknown'} skipped.` : 'Results not supplied; do not infer a pass.'}\n- Unit/data governance: ${unit ? `${unit.numPassedTests} passed, ${unit.numFailedTests} failed, ${unit.numPendingTests} pending.` : 'Results not supplied; do not infer a pass.'}\n- Browser projects and individual assertions are recorded in the JSON reports when supplied. WebKit is not a physical iPhone test.\n- 200% root-font enlargement is an approximation, not native browser text zoom.\n- axe WCAG2A/2AA rule scans and 44px controls evidence are not complete WCAG2.2 certification.\n- Real participant sessions, physical iPhone Safari and native text zoom: pending.\n- CI test traces, when retries produced them, are retained separately in the experience-browser-evidence artifact for the same workflow run. No fabricated trace is included.\n`,
  );
  await mkdir(join(staging, 'tests/relevant-traces'), { recursive: true });
  await writeFile(
    join(staging, 'tests/relevant-traces/README.md'),
    '# Relevant traces\n\nPassing tests may not produce retry traces. The workflow retains actual test-results separately as experience-browser-evidence. No trace is invented to fill this directory.\n',
  );
  return summary;
}

async function tooling() {
  let browserVersion = 'unavailable';
  try {
    browserVersion = (await execFile(chromium.executablePath(), ['--version'])).stdout.trim();
  } catch {
    /* Version unavailable; do not infer it. */
  }
  const packageVersion = async (name) => {
    try {
      return (await json(join(root, 'node_modules', name, 'package.json'))).version;
    } catch {
      return 'unavailable';
    }
  };
  let lighthouse = 'unavailable';
  if (process.env.LIGHTHOUSE_BIN) {
    try {
      lighthouse = (await execFile(process.env.LIGHTHOUSE_BIN, ['--version'])).stdout.trim();
    } catch {
      /* Explicitly unavailable. */
    }
  }
  let axe = 'unavailable';
  if (process.env.AXE_CORE_PATH) {
    try {
      axe = (await json(join(dirname(process.env.AXE_CORE_PATH), 'package.json'))).version;
    } catch {
      /* Explicitly unavailable. */
    }
  }
  return {
    node: process.version,
    playwright: await packageVersion('@playwright/test'),
    chromium: browserVersion,
    lighthouse,
    axe,
  };
}

async function main() {
  if (args.help) {
    console.log(
      'Usage: node scripts/package-polish-evidence.mjs --before ROOT --after ROOT --output ROOT --baseline-sha SHA --release-sha SHA [--before-captures DIR ...] [--tests-report JSON] [--unit-report JSON] [--before-build DIST] [--after-build DIST] [--strict]\nCI: --collect-ci --baseline-workspace DIR --verification-root DIR --verified-ci',
    );
    return;
  }
  if (!args.output) throw new Error('--output is required and must be outside the source tree');
  const output = resolve(args.output);
  if (output === root || output.startsWith(`${root}/`))
    throw new Error('Evidence must remain outside the source tree');
  await mkdir(output, { recursive: true });
  const marker = await json(join(root, 'docs/experience-redesign/polish-baseline.json'));
  const beforePaths = phasePaths('before', output);
  const afterPaths = phasePaths('after', output);
  let baselineSha = args['baseline-sha'] || marker.baselineSha;
  let releaseSha = args['release-sha'] || commit(root);
  if (!/^[a-f0-9]{40}$/.test(baselineSha) || !/^[a-f0-9]{40}$/.test(releaseSha))
    throw new Error('Both SHA values must be full commit identifiers');
  let beforeBuild = args['before-build'];
  let afterBuild = args['after-build'];
  if (args['collect-ci']) {
    if (!args['baseline-workspace']) throw new Error('--baseline-workspace is required');
    const baselineWorkspace = resolve(args['baseline-workspace']);
    baselineSha = commit(baselineWorkspace);
    releaseSha = commit(root);
    if (baselineSha !== marker.baselineSha)
      throw new Error('Baseline checkout is not the exact marker SHA');
    beforeBuild = join(baselineWorkspace, 'dist');
    afterBuild = join(root, 'dist');
    process.env.CHROME_PATH = chromium.executablePath();
    const baselineChecksum = join(beforePaths.base, 'protected-checksums.json');
    await collectPhase(
      baselineWorkspace,
      beforePaths,
      baselineChecksum,
      false,
      beforePaths.targets,
    );
    await collectPhase(root, afterPaths, baselineChecksum, true, beforePaths.targets);
  }
  const staging = join(output, 'package');
  if (existsSync(staging) && (await readdir(staging)).length)
    throw new Error('Package directory is not empty; choose a fresh output directory');
  await mkdir(staging, { recursive: true });
  const replacements = [
    [beforePaths.base, 'raw/before'],
    [afterPaths.base, 'raw/after'],
    [output, 'evidence-workspace'],
    [root, 'repository'],
  ];
  const before = await packagePhase('before', beforePaths, staging, replacements);
  const after = await packagePhase('after', afterPaths, staging, replacements);
  const protectedFiles = compareProtected(
    before.capture.checksumManifest,
    after.capture.checksumManifest,
  );
  const bundles = compareBundles(before.performance, after.performance);
  await saveJson(
    join(staging, 'metrics/bundles/comparison.json'),
    { protectedFiles, bundles },
    replacements,
  );
  const tests = await packageTests(staging, replacements);
  const kitRoot = join(root, 'docs/experience-redesign/usability');
  for (const file of [
    'facilitator-guide.md',
    'participant-tasks-en.md',
    'participant-tasks-zh-TW.md',
    'results-template.csv',
  ])
    await copyText(join(kitRoot, file), join(staging, 'usability', file), replacements);
  for (const file of ['polish-review.md', 'polish-acceptance.md', 'usability-test-plan.md']) {
    const source = join(root, 'docs/experience-redesign', file);
    if (existsSync(source))
      await copyText(source, join(staging, 'requirements', file), replacements);
  }
  const accessibilityViolations = after.accessibility.results.reduce(
    (count, result) => count + result.axe.violations.length,
    0,
  );
  const overflowFailures = after.accessibility.results.filter(
    (result) => result.layout.noHorizontalOverflow === false,
  ).length;
  const failedInteractions = after.capture.report.results
    .flatMap((result) => result.interactions)
    .filter((interaction) => interaction.status === 'error');
  const beforeTargetPath = join(beforePaths.targets, 'report.json');
  const afterTargetPath = join(afterPaths.targets, 'report.json');
  const beforeTargets = existsSync(beforeTargetPath) ? await json(beforeTargetPath) : null;
  const afterTargets = existsSync(afterTargetPath) ? await json(afterTargetPath) : null;
  const gates = {
    protectedFiles: protectedFiles.passed,
    initialJavaScript: Object.values(bundles).every((profile) => profile.passed),
    comparablePerformanceConditions:
      JSON.stringify(before.performance.fixedThrottling) ===
        JSON.stringify(after.performance.fixedThrottling) &&
      JSON.stringify(before.performance.profiles) === JSON.stringify(after.performance.profiles),
    baselineColdRuns: ['mobile', 'desktop'].every((profile) => {
      const runs = before.performance.lighthouse.runs[profile] || [];
      return runs.length === 3 && runs.every((run) => run.status === 'ok');
    }),
    performance: after.performance.checks.gates.passed,
    accessibility:
      accessibilityViolations === 0 &&
      overflowFailures === 0 &&
      after.accessibility.tooling.axe.status === 'available' &&
      after.accessibility.results.every((result) => result.axe.status === 'ok'),
    captures:
      after.capture.report.summary.issueCount === 0 &&
      after.capture.report.summary.navigationFailures === 0 &&
      failedInteractions.length === 0,
    targetAuditEvidence:
      beforeTargets?.phase === 'before' &&
      afterTargets?.phase === 'after' &&
      afterTargets.summary.erroredStates === 0 &&
      afterTargets.summary.overflowStates === 0 &&
      afterTargets.summary.htmlOverlapStateEntries === 0,
  };
  if (args['verified-ci']) {
    gates.verifiedReports =
      tests.unit.success === true &&
      tests.unit.failed === 0 &&
      tests.e2e.stats?.expected > 0 &&
      tests.e2e.stats.unexpected === 0 &&
      tests.e2e.errors.length === 0;
    gates.exactCheckout =
      commit(root) === releaseSha &&
      before.capture.report.commit === baselineSha &&
      after.capture.report.commit === releaseSha &&
      beforeTargets?.revision === baselineSha &&
      afterTargets?.revision === releaseSha &&
      !workingTreeDirty(root);
  }
  const manifest = {
    schema: 'acsic-experience-polish-evidence/v1',
    generatedAt: new Date().toISOString(),
    baselineSha,
    releaseSha,
    baseCheckoutSha: commit(root),
    workingTreeDirty: workingTreeDirty(root),
    releaseIdentity:
      args.source === 'ci-production-build'
        ? 'Exact workflow checkout, not a claim of Pages deployment'
        : workingTreeDirty(root)
          ? 'Local uncommitted build; releaseSha identifies its base checkout, not a committed release. Verify committed release and deployment separately.'
          : 'Supplied local checkout/build; verify deployment separately',
    publicUrl: marker.publicUrl,
    workflow: {
      runUrl: args['workflow-url'] || null,
      ref: args.ref || null,
      retentionDays: 14,
      verificationStatus: tests.engineeringVerification,
    },
    source: args.source || 'local-production-build',
    tools: await tooling(),
    measurementConditions: {
      lighthouse: after.performance.fixedThrottling,
      profiles: after.performance.profiles,
      coldRunsPerProfilePerRevision: 3,
      baselineAndAfterSameEnvironment: args['collect-ci']
        ? true
        : 'Caller must confirm; local roots alone do not prove identical conditions',
      measurementEnvironment: args['collect-ci']
        ? 'one GitHub Actions runner, sequential baseline then candidate, same preview port, no concurrent audit browsers'
        : 'caller-supplied reports',
      accessibility:
        'axe WCAG2A/2AA tags; manual review and applicable WCAG2.2 exceptions remain necessary',
      textZoom: 'root font-size 200% approximation only',
    },
    builds: { before: await buildAssets(beforeBuild), after: await buildAssets(afterBuild) },
    screenshots: [...before.screenshots, ...after.screenshots],
    gates,
    protectedFiles,
    humanAcceptance: 'pending; no human participant results included',
    rawEvidence: {
      included: [
        'tests/before-capture-audit.json',
        'tests/after-capture-audit.json',
        'metrics/lighthouse/*',
        'metrics/accessibility/*',
        'metrics/bundles/*',
      ],
      fullScreenshotMatrix:
        'Not all raw captures are selected for this ZIP; workflow raw-evidence artifact retains the full matrix for the same 14-day period.',
    },
  };
  await saveJson(join(staging, 'manifest.json'), manifest, replacements);
  await writeFile(
    join(staging, 'requirements/remaining-items.md'),
    '# Remaining and unverified items\n\n- Real first-time participant sessions: pending; the kit is blank and ready for the owner to arrange with consent.\n- Physical iPhone Safari and native browser text zoom: not established by simulated mobile/WebKit/root-font tests.\n- Complete WCAG2.2 conformance: not claimed; inspect axe incomplete findings, contrast, focus, target exceptions and alternatives manually.\n- Exact release CI/Pages status and production-asset match: see the repository acceptance summary and linked workflow. CI production-build captures are not production-site evidence.\n- Specific P2 issues, impact, frequency, alternatives and retention rationale: see polish-review.md and polish-acceptance.md when included.\n',
  );
  await writeFile(
    join(staging, 'release-summary.md'),
    `# Experience Final Polish\n\n- Baseline: ${baselineSha}\n- Exact evidence build: ${releaseSha}\n- Public site: ${marker.publicUrl}\n- Evidence environment: ${manifest.source}\n- Workflow: ${manifest.workflow.runUrl || 'not supplied'}\n- Gates: ${Object.entries(
      gates,
    )
      .map(([name, passed]) => `${name}=${passed ? 'PASS' : 'FAIL'}`)
      .join(
        ', ',
      )}\n- Human test kit: supplied. Real human acceptance: pending.\n\nThe candidate/main workflow artifact and successful engineering gates do not by themselves establish Pages deployment. Use the acceptance record for exact deployed SHA and live asset checks. No external award or comprehensive accessibility certification is claimed.\n`,
  );
  await writeFile(
    join(staging, 'README.md'),
    `# ACSIC Experience Polish Evidence\n\nThis ZIP contains selected before/after screenshots, raw Lighthouse and axe observations, build identifiers, protected-file checksums, supplied automated-test results and an unexecuted bilingual human usability kit.\n\nStart with release-summary.md and manifest.json. Screenshots are sorted by before/after, language, route state and viewport. Research facts are not changed by this package.\n\nThe GitHub Actions artifact download contains ${zipName} plus its SHA256 sidecar. Extract the artifact wrapper, then verify the named ZIP with its sidecar. Inside this ZIP, checksums.sha256 lists every included file except itself.\n\nArtifacts are retained for 14 days from upload, not permanently. Download and save them before the exact expiration shown by GitHub. Long-term lightweight records remain in the repository PR/commit.\n\nThe full raw screenshot matrix is in the same workflow's ACSIC-Experience-Polish-Raw artifact. Both artifacts have the same retention policy. No participant personal data, recordings, fonts, dependency folders or credentials are included.\n\nReproduce on exact checkouts with the repository's package-polish-evidence.mjs --collect-ci workflow; Lighthouse13.5.0 and axe-core4.13.0 are external QA-only tools. No runtime translation or QA service is required by the website.\n`,
  );
  const included = await files(staging);
  const sums = [];
  for (const path of included)
    sums.push(`${sha256(await readFile(path))}  ${relative(staging, path)}`);
  await writeFile(join(staging, 'checksums.sha256'), `${sums.join('\n')}\n`);
  const archive = join(output, zipName);
  await execFile('zip', ['-q', '-r', archive, '.'], { cwd: staging, maxBuffer: 4 * 1024 * 1024 });
  await execFile('unzip', ['-t', archive], { maxBuffer: 4 * 1024 * 1024 });
  const archiveSha256 = sha256(await readFile(archive));
  await writeFile(`${archive}.sha256`, `${archiveSha256}  ${zipName}\n`);
  await saveJson(
    join(output, 'package-result.json'),
    {
      archive: zipName,
      sha256: archiveSha256,
      bytes: (await stat(archive)).size,
      baselineSha,
      releaseSha,
      gates,
      performanceMedians: {
        before: before.performance.lighthouse.medians,
        after: after.performance.lighthouse.medians,
      },
      initialJavaScript: bundles,
      targetSummary: { before: beforeTargets?.summary, after: afterTargets?.summary },
      automatedTests: { unit: tests.unit, e2e: tests.e2e.stats },
      accessibility: { violations: accessibilityViolations, overflowFailures },
    },
    [],
  );
  console.log(
    JSON.stringify(
      {
        archive,
        sha256: archiveSha256,
        baselineSha,
        releaseSha,
        gates,
        performanceMedians: {
          before: before.performance.lighthouse.medians,
          after: after.performance.lighthouse.medians,
        },
        initialJavaScript: bundles,
        targetSummary: { before: beforeTargets?.summary, after: afterTargets?.summary },
        automatedTests: { unit: tests.unit, e2e: tests.e2e.stats },
        accessibility: { violations: accessibilityViolations, overflowFailures },
      },
      null,
      2,
    ),
  );
  if (args.strict && Object.values(gates).some((passed) => !passed)) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.error(error.stack || String(error));
  process.exitCode = 1;
}

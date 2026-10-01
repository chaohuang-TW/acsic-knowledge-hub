#!/usr/bin/env node
/* global document, window, NodeFilter */

/**
 * Component/purpose/state target audit, with repeat observations kept as
 * evidence rather than counted as distinct defects. Run sequentially with
 * Lighthouse, not at the same time as cold-load measurements.
 *
 * node scripts/polish-target-audit.mjs --base-url URL --output DIR --phase before
 * node scripts/polish-target-audit.mjs --base-url URL --output DIR --phase after --before BEFORE/report.json
 * --widths 320,390,430,768,1440 includes every requested viewport.
 * --build-sha SHA records the externally served build identity separately
 * from the revision of this QA script, useful for a frozen baseline server.
 * --build-label local-candidate explicitly distinguishes an uncommitted build.
 * This measurement is not a WCAG certification. SVG targets require manual
 * shape/occlusion review; bounding-box intersections are not click collisions.
 */

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = {};
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index]?.replace(/^--/, '');
  if (!key || !process.argv[index].startsWith('--')) continue;
  const next = process.argv[index + 1];
  args[key] = next && !next.startsWith('--') ? process.argv[++index] : true;
}
const baseUrl = String(args['base-url'] || 'http://127.0.0.1:4178/acsic-knowledge-hub/');
const outputRoot = resolve(String(args.output || '/private/tmp/acsic-polish-targets'));
const phase = String(args.phase || 'after');
const widths = String(args.widths || '320,390,1440')
  .split(',')
  .map(Number)
  .filter((width) => Number.isFinite(width) && width >= 320);
const baseline = args.before ? JSON.parse(await readFile(resolve(args.before), 'utf8')) : null;
const catalog = [
  control(
    'site-navigation',
    '.site-header nav a',
    'Navigate main areas',
    1,
    'high',
    'Site navigation',
  ),
  control('site-language', '.language-picker select', 'Switch language', 1, 'high', 'Language'),
  control('site-brand', '.site-header .brand', 'Return home', 1, 'medium', 'Home'),
  control(
    'site-disclaimer',
    '.disclaimer-strip a',
    'Read unofficial disclaimer',
    3,
    'low',
    'Disclaimer',
  ),
  control(
    'footer-navigation',
    '.footer-links a',
    'Open secondary research pages',
    3,
    'low',
    'Footer',
  ),
  control('home-search', '#home-search', 'Enter institution lookup', 1, 'high', 'Home'),
  control('home-submit', '.home-lookup button', 'Submit lookup', 1, 'high', 'Home'),
  control('home-shortcuts', '.home-shortcuts a', 'Open directory or comparison', 1, 'high', 'Home'),
  control(
    'home-index',
    '.home-index-links a',
    'Open institutional research area',
    2,
    'medium',
    'Home',
  ),
  control(
    'home-overview',
    '.home-research-index > .text-link',
    'Read ACSIC overview',
    3,
    'low',
    'Home',
  ),
  control(
    'network-economy-native',
    '.network-mobile-economy-control select, .network-standard-mobile-select select',
    'Choose economy using native control',
    1,
    'high',
    'Explorer',
  ),
  control(
    'network-economy-buttons',
    '.network-destination-controls button, .network-standard-economy',
    'Choose economy or overview',
    1,
    'high',
    'Explorer',
  ),
  control(
    'network-map-economy',
    '.network-map-marker[role="button"]',
    'Choose economy at geographic location',
    2,
    'medium',
    'Explorer',
    'economy',
  ),
  control(
    'network-map-institution',
    '.network-map-institution-node[role="button"]',
    'Choose institution on map',
    2,
    'medium',
    'Explorer',
    'institution',
  ),
  control(
    'network-select-institution',
    '.institution-snapshot-actions .network-card-select',
    'Select institution snapshot',
    2,
    'medium',
    'Explorer',
  ),
  control(
    'network-profile',
    '.institution-snapshot-actions a[href*="/institutions/"]',
    'Open selected institution profile',
    1,
    'high',
    'Explorer',
  ),
  control(
    'network-official',
    '.institution-snapshot-actions a[target="_blank"]',
    'Open selected official website',
    1,
    'high',
    'Explorer',
  ),
  control(
    'network-disclosure',
    '.institution-snapshot-disclosure > summary',
    'Read institution snapshot details',
    2,
    'medium',
    'Explorer',
  ),
  control(
    'network-back',
    '.network-back, .network-standard-back',
    'Return to Asia overview',
    1,
    'high',
    'Explorer',
  ),
  control(
    'network-all-institutions',
    '.network-explore-all',
    'Open full directory',
    1,
    'high',
    'Explorer',
  ),
  control(
    'network-mode',
    '.network-standard-toggle, .network-three-toggle, .network-standard-actions button',
    'Choose SVG, optional 3D or standard explorer',
    2,
    'medium',
    'Explorer',
  ),
  control(
    'directory-search',
    '.directory-filter--search input',
    'Find institution within directory',
    1,
    'high',
    'Directory',
  ),
  control(
    'directory-economy',
    '.directory-filter--economy select',
    'Filter directory economy',
    1,
    'high',
    'Directory',
  ),
  control(
    'directory-more-filters',
    '.directory-filter-details > summary',
    'Reveal secondary filters',
    2,
    'medium',
    'Directory',
  ),
  control(
    'directory-secondary-filter',
    '.directory-secondary-filters select',
    'Filter institution role or membership',
    2,
    'medium',
    'Directory',
  ),
  control(
    'directory-clear',
    '.directory-filter__clear, .directory-empty button',
    'Clear filters or empty result',
    1,
    'high',
    'Directory',
  ),
  control(
    'directory-profile',
    '.directory-card__actions a[href*="/institutions/"]',
    'Read complete institution profile',
    1,
    'high',
    'Directory',
  ),
  control(
    'directory-official',
    '.directory-card__actions a[target="_blank"]',
    'Open official institution website',
    1,
    'high',
    'Directory',
  ),
  control(
    'directory-summary',
    '.directory-card details > summary',
    'Read full institution summary',
    2,
    'medium',
    'Directory',
  ),
  control(
    'profile-back-directory',
    '.institution-profile-hero a[href$="/members"]',
    'Restore directory context',
    1,
    'high',
    'Profile',
  ),
  control(
    'profile-back-map',
    '.institution-home-link',
    'Return to geographic exploration',
    1,
    'medium',
    'Profile',
  ),
  control(
    'profile-official',
    '.institution-profile-actions a[target="_blank"]',
    'Open official institution website',
    1,
    'high',
    'Profile',
  ),
  control(
    'profile-research',
    '.institution-research-details > summary',
    'Read full research and governance details',
    2,
    'medium',
    'Profile',
  ),
  control(
    'profile-provenance',
    '.institution-metric-provenance > summary',
    'Trace metric source and definition',
    2,
    'high',
    'Profile',
  ),
  control(
    'profile-source',
    '.institution-detail-page a[target="_blank"]:not(.institution-profile-actions a)',
    'Open a specific official source',
    2,
    'medium',
    'Profile',
    'inline',
  ),
  control(
    'data-filters',
    '.pilot-toolbar select',
    'Filter records by institution or indicator',
    1,
    'high',
    'Data',
  ),
  control(
    'data-download-disclosure',
    '.data-pilot-page .download-details > summary',
    'Reveal data export controls',
    1,
    'high',
    'Data',
  ),
  control(
    'data-download',
    '.data-pilot-page .download-details button',
    'Download governed records and history',
    1,
    'high',
    'Data',
  ),
  control(
    'data-history',
    '.historical-series > summary',
    'Read multi-year historical table',
    2,
    'high',
    'Data',
  ),
  control(
    'data-provenance',
    '.provenance-viewer > summary',
    'Read source and processing details',
    2,
    'high',
    'Data',
  ),
  control(
    'data-source',
    '.pilot-record-card a[target="_blank"]',
    'Open record official source',
    2,
    'high',
    'Data',
    'inline',
  ),
  control(
    'compare-select',
    '.research-compare-page .selector-item input',
    'Add or remove comparison institution',
    1,
    'high',
    'Compare',
    'label',
  ),
  control(
    'compare-remove',
    '.selection-chip button',
    'Remove institution from comparison tray',
    1,
    'high',
    'Compare',
  ),
  control(
    'compare-language',
    '.research-compare-page .export-toolbar select',
    'Choose comparison export language',
    1,
    'medium',
    'Compare',
  ),
  control(
    'compare-download',
    '.research-compare-page .export-buttons button',
    'Download comparison',
    1,
    'high',
    'Compare',
  ),
  control(
    'compare-source-details',
    '.comparison-sources summary',
    'Reveal institution comparison sources',
    2,
    'medium',
    'Compare',
  ),
  control(
    'reports-settings',
    '.report-controls select',
    'Choose report type or language',
    2,
    'medium',
    'Reports',
  ),
  control(
    'reports-select',
    '.report-record-option input',
    'Choose report institutions',
    1,
    'high',
    'Reports',
    'label',
  ),
  control(
    'reports-download',
    '.report-preview button',
    'Download research report',
    1,
    'high',
    'Reports',
  ),
];

function control(id, selector, purpose, priority, frequency, page, exception = null) {
  return { id, selector, purpose, priority, frequency, page, exception };
}

const states = [
  { id: 'home-svg-overview', page: 'home', route: '', mode: 'svg' },
  { id: 'home-svg-taiwan', page: 'home', route: '', mode: 'svg', economy: 'TW' },
  { id: 'home-standard-overview', page: 'home', route: '', mode: 'standard' },
  { id: 'home-standard-taiwan', page: 'home', route: '', mode: 'standard', economy: 'TW' },
  { id: 'directory-all', page: 'directory', route: 'members' },
  { id: 'directory-filtered', page: 'directory', route: 'members?q=KODIT', expand: 'filters' },
  { id: 'profile-core', page: 'profile', route: 'institutions/acgf-tw' },
  { id: 'profile-details', page: 'profile', route: 'institutions/acgf-tw', expand: 'profile' },
  { id: 'data-default', page: 'data', route: 'data-pilot', expand: 'downloads' },
  { id: 'data-acgf', page: 'data', route: 'data-pilot', institution: 'acgf-tw', expand: 'data' },
  { id: 'comparison-two', page: 'compare', route: 'compare' },
  { id: 'reports-default', page: 'reports', route: 'reports' },
];

async function openDetails(page, selector) {
  const summaries = page.locator(selector);
  const count = await summaries.count();
  for (let index = 0; index < count; index += 1) {
    const summary = summaries.nth(index);
    if (!(await summary.isVisible())) continue;
    if (!(await summary.evaluate((node) => node.parentElement?.hasAttribute('open')))) {
      await summary.click();
    }
  }
}

async function prepare(page, state, locale) {
  const url = new URL(baseUrl);
  url.hash = `/${locale}/${state.route}`;
  if (state.mode === 'standard') url.searchParams.set('networkFallback', '1');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.locator('h1').waitFor();
  if (state.mode === 'svg' && (await page.locator('.network-explorer-fallback').count())) {
    const mapPreview = page.getByRole('button', {
      name: locale === 'en' ? 'Use map preview' : '使用地圖預覽',
      exact: true,
    });
    await mapPreview.click();
    await page.locator('.network-explorer-fallback').waitFor({ state: 'detached' });
  }
  if (state.economy) {
    const native = page.locator(
      '.network-mobile-economy-control select, .network-standard-mobile-select select',
    );
    if (await native.isVisible()) await native.selectOption(state.economy);
    else {
      await page
        .locator('.network-destination-controls, .network-standard-economy-grid')
        .getByRole('button', { name: locale === 'en' ? 'Taiwan' : '臺灣', exact: true })
        .click();
    }
    await page.locator('.institution-snapshot-card').first().waitFor();
  }
  if (state.institution) {
    await page.locator('.pilot-toolbar select').first().selectOption(state.institution);
  }
  if (state.expand === 'filters') await openDetails(page, '.directory-filter-details > summary');
  if (state.expand === 'profile') {
    await openDetails(page, '.institution-research-details > summary');
    await openDetails(page, '.institution-metric-provenance > summary');
  }
  if (state.expand === 'downloads' || state.expand === 'data') {
    await openDetails(page, '.data-pilot-page .download-details > summary');
  }
  if (state.expand === 'data') {
    await openDetails(page, '.historical-series > summary');
    await openDetails(page, '.provenance-viewer > summary');
  }
  // Expanding details scrolls its summary into view. Measure the same top-of-
  // page position so sticky navigation does not create scroll-position-only
  // rectangle intersections with otherwise separate content controls.
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function measure(page) {
  return page.evaluate((definitions) => {
    const round = (number) => Math.round(number * 10) / 10;
    const box = (rect) => ({
      x: round(rect.x),
      y: round(rect.y),
      width: round(rect.width),
      height: round(rect.height),
      right: round(rect.right),
      bottom: round(rect.bottom),
    });
    const visible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (parent.tagName !== 'DETAILS' || parent.hasAttribute('open')) continue;
        const summary = [...parent.children].find((child) => child.tagName === 'SUMMARY');
        if (!summary?.contains(element)) return false;
      }
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        element.getClientRects().length > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.closest('[hidden], [aria-hidden="true"]')
      );
    };
    const clickableRect = (element) => {
      const initial = element.getBoundingClientRect();
      let left = initial.left;
      let right = initial.right;
      let top = initial.top;
      let bottom = initial.bottom;
      // The page viewport is intentionally not a clipping region: ordinary
      // scrolling can reach off-screen controls. Internal overflow containers
      // do clip hit areas, even when a child retains a non-empty DOM box.
      for (
        let parent = element.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        const style = window.getComputedStyle(parent);
        const rect = parent.getBoundingClientRect();
        if (['auto', 'scroll', 'hidden', 'clip'].includes(style.overflowX)) {
          left = Math.max(left, rect.left);
          right = Math.min(right, rect.right);
        }
        if (['auto', 'scroll', 'hidden', 'clip'].includes(style.overflowY)) {
          top = Math.max(top, rect.top);
          bottom = Math.min(bottom, rect.bottom);
        }
      }
      return {
        x: left,
        y: top,
        left,
        top,
        right: Math.max(left, right),
        bottom: Math.max(top, bottom),
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    };
    const union = (rects) => {
      if (!rects.length) return null;
      const left = Math.min(...rects.map((rect) => rect.left));
      const top = Math.min(...rects.map((rect) => rect.top));
      const right = Math.max(...rects.map((rect) => rect.right));
      const bottom = Math.max(...rects.map((rect) => rect.bottom));
      return box({ x: left, y: top, width: right - left, height: bottom - top, right, bottom });
    };
    const label = (node) =>
      node.getAttribute('aria-label') ||
      node.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100) ||
      node.getAttribute('name') ||
      node.id ||
      node.tagName;
    const all = [
      ...document.querySelectorAll('a, button, input, select, textarea, summary, [role="button"]'),
    ]
      .filter(visible)
      .filter((node) => !node.matches('[disabled]'))
      .map((node) => ({
        node,
        effective: node.matches('input[type="checkbox"],input[type="radio"]')
          ? node.labels?.[0] || node
          : node,
      }))
      .filter(
        (item) =>
          clickableRect(item.effective).width > 0 && clickableRect(item.effective).height > 0,
      );
    const distance = (first, second) =>
      Math.hypot(
        Math.max(0, first.left - second.right, second.left - first.right),
        Math.max(0, first.top - second.bottom, second.top - first.bottom),
      );
    const overlaps = (first, second) =>
      Math.min(first.right, second.right) - Math.max(first.left, second.left) > 0.5 &&
      Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top) > 0.5;
    const measured = [];
    for (const definition of definitions) {
      for (const node of document.querySelectorAll(definition.selector)) {
        if (!visible(node)) continue;
        const effective = node.matches('input[type="checkbox"],input[type="radio"]')
          ? node.labels?.[0] || node
          : node;
        const actual = clickableRect(effective);
        if (!actual.width || !actual.height) continue;
        const native = node.getBoundingClientRect();
        const svg = node.namespaceURI === 'http://www.w3.org/2000/svg';
        let contentBox = null;
        if (svg) {
          contentBox = union(
            [...node.querySelectorAll('rect, circle:not(.network-map-hit-area), text')]
              .filter(visible)
              .map((part) => part.getBoundingClientRect()),
          );
        } else if (node.matches('input,select,textarea')) contentBox = box(native);
        else {
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          const rects = [];
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(walker.currentNode);
            rects.push(...range.getClientRects());
          }
          contentBox = union(rects) || box(native);
        }
        const neighbors = all.filter(
          (candidate) =>
            candidate.node !== node &&
            candidate.effective !== effective &&
            !effective.contains(candidate.node) &&
            !candidate.effective.contains(node),
        );
        const nearest = neighbors
          .map((candidate) => ({
            label: label(candidate.node),
            rect: clickableRect(candidate.effective),
            svg: candidate.node.namespaceURI === 'http://www.w3.org/2000/svg',
          }))
          .sort((first, second) => distance(actual, first.rect) - distance(actual, second.rect))[0];
        const collisions = neighbors
          .filter(
            (candidate) =>
              !svg &&
              candidate.node.namespaceURI !== 'http://www.w3.org/2000/svg' &&
              overlaps(actual, clickableRect(candidate.effective)),
          )
          .map((candidate) => label(candidate.node));
        let equivalent = null;
        if (definition.exception === 'economy') {
          const candidates = [
            ...document.querySelectorAll(
              '.network-mobile-economy-control select, .network-standard-mobile-select select, .network-destination-controls button, .network-standard-economy',
            ),
          ].filter(visible);
          const economyId = node.getAttribute('data-economy-id');
          const candidate = candidates.find((candidate) => {
            if (candidate.tagName === 'SELECT')
              return [...candidate.options].some((option) => option.value === economyId);
            return (
              candidate.textContent?.trim() === node.querySelector('text')?.textContent?.trim()
            );
          });
          if (candidate)
            equivalent = {
              label: label(candidate),
              clickBox: box(candidate.getBoundingClientRect()),
            };
        }
        if (definition.exception === 'institution') {
          const name = node.getAttribute('aria-label')?.split(':')[1]?.split(',')[0]?.trim();
          const candidates = [...document.querySelectorAll('.institution-snapshot-card')].filter(
            visible,
          );
          const card = candidates.find((candidate) =>
            candidate.textContent?.includes(name || '___'),
          );
          const candidate = card?.querySelector('.network-card-select');
          if (candidate && visible(candidate))
            equivalent = {
              label: label(candidate),
              clickBox: box(candidate.getBoundingClientRect()),
            };
        }
        const width = actual.width;
        const height = actual.height;
        const spacing24 =
          !svg &&
          neighbors.every((candidate) => {
            const other = clickableRect(candidate.effective);
            const centerX = actual.x + actual.width / 2;
            const centerY = actual.y + actual.height / 2;
            if (other.width < 24 || other.height < 24) {
              return (
                Math.hypot(
                  centerX - other.x - other.width / 2,
                  centerY - other.y - other.height / 2,
                ) >= 24
              );
            }
            const nearestX = Math.max(other.left, Math.min(centerX, other.right));
            const nearestY = Math.max(other.top, Math.min(centerY, other.bottom));
            return Math.hypot(centerX - nearestX, centerY - nearestY) >= 12;
          });
        const inlineCandidate =
          definition.exception === 'inline' &&
          !node.classList.contains('button') &&
          window.getComputedStyle(node).display === 'inline' &&
          Boolean(node.closest('p, li, dd'));
        const minimumAssessment = svg
          ? equivalent && equivalent.clickBox.width >= 24 && equivalent.clickBox.height >= 24
            ? 'equivalent control observed; manually review spatial shape and occlusion'
            : 'spatial-map essential exception candidate; manual assessment required'
          : width >= 24 && height >= 24
            ? 'bounding box meets 24px; manually confirm usable shape and occlusion'
            : inlineCandidate
              ? 'inline exception candidate; manually confirm text context'
              : spacing24
                ? '24px circle spacing calculation clear; manual confirmation required'
                : 'manual review required: undersized box without measured spacing exception';
        measured.push({
          component: definition.id,
          selector: definition.selector,
          purpose: definition.purpose,
          priority: definition.priority,
          frequency: definition.frequency,
          page: definition.page,
          label: label(node),
          visibleContentBox: contentBox,
          nativeElementBox: box(native),
          actualClickBox: box(actual),
          clickBoxBasis:
            effective !== node
              ? 'associated whole label'
              : svg
                ? 'SVG enclosing box, not a solid rectangle'
                : 'interactive element border box clipped by internal overflow ancestors',
          nearestGapPx: nearest ? round(distance(actual, nearest.rect)) : null,
          nearestLabel: nearest?.label || null,
          overlappingHtmlTargets: collisions,
          equivalentLargeControl: equivalent,
          meets44pxDesignGoal: width >= 43.9 && height >= 43.9,
          minimumAssessment,
          disabled: node.matches('[disabled]'),
          svgShapeNeedsManualReview: svg,
        });
      }
    }
    return {
      observations: measured,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  }, catalog);
}

function summarize(observations) {
  const map = new Map();
  for (const observation of observations) {
    const key = `${observation.component}:${observation.state}`;
    const group = map.get(key) || {
      key,
      component: observation.component,
      selector: observation.selector,
      page: observation.page,
      state: observation.state,
      purpose: observation.purpose,
      priority: observation.priority,
      frequency: observation.frequency,
      impact:
        observation.priority === 1
          ? 'Core task accuracy and access'
          : observation.priority === 2
            ? 'Secondary exploration or evidence access'
            : 'Secondary reading/navigation',
      observations: 0,
      under44Observations: 0,
      minClickWidth: Infinity,
      minClickHeight: Infinity,
      minContentWidth: Infinity,
      minContentHeight: Infinity,
      minGap: Infinity,
      variants: [],
      minimumAssessments: new Set(),
      equivalents: [],
      collisions: [],
    };
    group.observations += 1;
    if (!observation.meets44pxDesignGoal && !observation.disabled) group.under44Observations += 1;
    group.minClickWidth = Math.min(group.minClickWidth, observation.actualClickBox.width);
    group.minClickHeight = Math.min(group.minClickHeight, observation.actualClickBox.height);
    group.minContentWidth = Math.min(
      group.minContentWidth,
      observation.visibleContentBox?.width ?? Infinity,
    );
    group.minContentHeight = Math.min(
      group.minContentHeight,
      observation.visibleContentBox?.height ?? Infinity,
    );
    group.minGap = Math.min(group.minGap, observation.nearestGapPx ?? Infinity);
    group.variants.push({
      locale: observation.locale,
      width: observation.viewport.width,
      label: observation.label,
      clickBox: observation.actualClickBox,
    });
    group.minimumAssessments.add(observation.minimumAssessment);
    if (observation.equivalentLargeControl)
      group.equivalents.push(observation.equivalentLargeControl);
    group.collisions.push(...observation.overlappingHtmlTargets);
    map.set(key, group);
  }
  return [...map.values()]
    .map((group) => ({
      ...group,
      minGap: Number.isFinite(group.minGap) ? group.minGap : null,
      minimumAssessments: [...group.minimumAssessments],
      collisions: [...new Set(group.collisions)],
      equivalents: group.equivalents.filter(
        (value, index, list) =>
          list.findIndex(
            (candidate) =>
              candidate.label === value.label &&
              candidate.clickBox.width === value.clickBox.width &&
              candidate.clickBox.height === value.clickBox.height,
          ) === index,
      ),
      handling: group.collisions.length
        ? 'Investigate overlapping non-spatial targets before release'
        : group.under44Observations === 0
          ? 'Design goal achieved in observed states'
          : group.component.startsWith('network-map-')
            ? 'Retain geographic precision with measured equivalent large controls; manual map review'
            : group.priority === 3
              ? 'Retain proportionate secondary text; manually assess minimum/spacing/inline applicability'
              : group.priority === 2
                ? 'Review evidence/prose controls for 24px minimum, spacing or legitimate inline context; retain readable hierarchy'
                : 'Prioritize core target sizing or document specific equivalent operation',
    }))
    .sort(
      (first, second) => first.priority - second.priority || first.key.localeCompare(second.key),
    );
}

function markdown(report) {
  const previous = new Map((baseline?.controls || []).map((item) => [item.key, item]));
  const format = (item) =>
    item ? `${item.minClickWidth.toFixed(1)} × ${item.minClickHeight.toFixed(1)}` : 'not sampled';
  const rows = report.controls.map((item) => {
    const before = previous.get(item.key);
    return `| ${item.component} / ${item.state} | ${item.priority} / ${item.frequency} | ${item.minContentWidth.toFixed(1)} × ${item.minContentHeight.toFixed(1)} | ${baseline ? format(before) : format(item)} | ${baseline ? format(item) : 'pending final audit'} | ${item.minGap ?? 'n/a'} | ${item.equivalents.map((equivalent) => `${equivalent.label}: ${equivalent.clickBox.width.toFixed(1)} × ${equivalent.clickBox.height.toFixed(1)}`).join('; ') || 'none needed/observed'} | ${item.handling} |`;
  });
  return [
    '# Deduplicated control target audit',
    '',
    `Phase: ${phase}. Revision/base: ${report.revision}. Build label: ${report.buildLabel || 'see artifact manifest'}. Captured: ${report.capturedAt}.`,
    '',
    `Distinct component/purpose families: ${report.summary.distinctComponentFamilies}. Component/purpose/page-state entries: ${report.summary.distinctStateEntries}. Raw repeated observations: ${report.summary.rawObservations}. These are three different counts, not a defect total.`,
    '',
    'Frequency and impact are task-priority estimates from the brief, not user analytics or observed human-test results.',
    '',
    'Visible content bounds measure labels/glyphs or native controls. Actual click bounds include valid associated checkbox labels and respect internal overflow clipping; ordinary page scrolling is not treated as loss of access. Fully internally clipped controls are not counted as currently visible. SVG enclosing rectangles are not assumed to be solid hit areas; their geographic overlaps are reviewed separately, with native selectors or institution-card controls as equivalent operations.',
    '',
    'The project targets 44 × 44 CSS px for frequent standalone tasks. WCAG 2.2 SC 2.5.8 (AA) uses a 24 × 24 minimum with spacing, equivalent, inline, user-agent and essential exceptions. SC 2.5.5 (AAA) uses 44 × 44 with its own exceptions. This table does not certify either criterion or whole-site conformance.',
    '',
    'References: [W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [W3C 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).',
    '',
    '| Component / state | Priority / frequency | Visible content min (px) | Before click min (px) | After click min (px) | Nearest gap (px) | Equivalent operation | Handling |',
    '|---|---|---|---|---|---|---|---|',
    ...rows,
    '',
    'Selectors, routes, individual viewport/language boxes, nearby control labels, disabled-state notes and minimum-criterion assessment candidates are in report.json. Where a component was added or removed, “not sampled” is deliberate, not assumed zero.',
    '',
    'Manual items: actual pointer activation and occlusion of spatial SVG marks; legitimate inline exception context; native browser control rendering; focus visibility; reading clarity; real touchscreen and assistive technology use. Automated HTML rectangle collision checks omit SVG spatial marks and do not represent a human usability study.',
    '',
    'Footer and prose links are intentionally not inflated globally. Any retained smaller non-inline control requires adequate minimum size/spacing or a documented exception; priority and alternatives do not substitute for minimum-criterion evaluation.',
    '',
  ].join('\n');
}

await mkdir(outputRoot, { recursive: true });
const browser = await chromium.launch();
const observations = [];
const stateResults = [];
try {
  for (const locale of ['en', 'zh-TW']) {
    for (const width of widths) {
      for (const state of states) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          locale,
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await prepare(page, state, locale);
          const result = await measure(page);
          observations.push(
            ...result.observations.map((item) => ({
              ...item,
              locale,
              state: state.id,
              route: page.url().replace(new URL(baseUrl).origin, '<origin>'),
              viewport: { width, height: 900 },
            })),
          );
          stateResults.push({
            locale,
            width,
            state: state.id,
            controls: result.observations.length,
            horizontalOverflow: result.horizontalOverflow,
            errors,
          });
        } catch (error) {
          stateResults.push({ locale, width, state: state.id, error: error.message, errors });
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}
const controls = summarize(observations);
const componentFamilies = [...new Set(controls.map((item) => item.component))];
const beforeComponentMap = new Map((baseline?.controls || []).map((item) => [item.key, item]));
const improved = controls.filter((item) => {
  const before = beforeComponentMap.get(item.key);
  return before && before.under44Observations > 0 && item.under44Observations === 0;
});
const beforeUnder44Families = new Set(
  (baseline?.controls || [])
    .filter((item) => item.under44Observations > 0)
    .map((item) => item.component),
);
const afterUnder44Families = new Set(
  controls.filter((item) => item.under44Observations > 0).map((item) => item.component),
);
const fullyImprovedFamilies = [...beforeUnder44Families].filter(
  (component) => componentFamilies.includes(component) && !afterUnder44Families.has(component),
);
const auditToolRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
}).trim();
const workingTreeDirty = Boolean(
  execFileSync('git', ['status', '--porcelain'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  }).trim(),
);
const report = {
  capturedAt: new Date().toISOString(),
  phase,
  revision: String(args['build-sha'] || auditToolRevision),
  buildLabel: String(args['build-label'] || 'see artifact manifest'),
  servedBuildIdentityBasis: args['build-sha']
    ? 'caller-specified build/base revision; consult buildLabel, workingTreeDirty and artifact manifest before treating it as committed contents'
    : 'QA checkout revision; inspect workingTreeDirty and artifact manifest for build identity',
  auditToolRevision,
  workingTreeDirty,
  origin: new URL(baseUrl).origin,
  conditions: {
    browser: `Chromium ${browser.version()}`,
    widths,
    height: 900,
    localeVariants: ['en', 'zh-TW'],
    reducedMotion: 'reduce',
    measurement:
      'DOM bounding boxes plus text-content bounds, associated labels, HTML collision rectangles, 24px spacing circles; no input latency benchmark',
    certification: false,
  },
  summary: {
    distinctComponentFamilies: componentFamilies.length,
    distinctStateEntries: controls.length,
    rawObservations: observations.length,
    componentFamiliesUnder44: afterUnder44Families.size,
    improvedComponentFamilies: fullyImprovedFamilies.length,
    partiallyImprovedComponentFamilies: new Set(
      improved
        .filter((item) => !fullyImprovedFamilies.includes(item.component))
        .map((item) => item.component),
    ).size,
    improvedStateEntries: improved.length,
    htmlOverlapStateEntries: controls.filter((item) => item.collisions.length).length,
    erroredStates: stateResults.filter((item) => item.error || item.errors.length).length,
    overflowStates: stateResults.filter((item) => item.horizontalOverflow).length,
  },
  controls,
  states: stateResults,
  observations,
};
await writeFile(resolve(outputRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(outputRoot, 'audit.md'), markdown(report));
console.log(JSON.stringify({ phase, summary: report.summary, output: outputRoot }, null, 2));
if (
  report.summary.erroredStates ||
  report.summary.overflowStates ||
  (phase !== 'before' && report.summary.htmlOverlapStateEntries)
)
  process.exitCode = 1;

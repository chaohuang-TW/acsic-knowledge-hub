import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
]);
const forbiddenNames = new Set(['CNAME', 'sitemap.xml']);
const findings = [];
const patterns = [
  ['GitHub token', /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/], // secret-scan:allow
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/], // secret-scan:allow
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/], // secret-scan:allow
  ['Password assignment', /\b(?:password|passwd|pwd)\s*[:=]\s*[^\s]{6,}/i], // secret-scan:allow
  ['Personal email', /\b[A-Z0-9._%+-]+@(?!example\.|invalid\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/i], // secret-scan:allow
  ['Local user path', /\/Users\/[A-Za-z0-9._-]+\//], // secret-scan:allow
  ['Taiwan ID', /\b[A-Z][12]\d{8}\b/], // secret-scan:allow
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    const relative = path.relative(root, fullPath);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (forbiddenNames.has(entry.name)) findings.push(`${relative}: 禁止的發布檔案`);
    if (entry.name.startsWith('.env') && entry.name !== '.env.example')
      findings.push(`${relative}: 環境檔不得提交`);
    if (/\.(png|jpe?g|gif|webp|ico|woff2?)$/i.test(entry.name)) continue;
    const content = await readFile(fullPath, 'utf8');
    content.split(/\r?\n/).forEach((line, index) => {
      if (line.includes('secret-scan:allow')) return;
      for (const [label, pattern] of patterns) {
        if (pattern.test(line)) findings.push(`${relative}:${index + 1}: ${label}`);
      }
    });
  }
}

await walk(root);
if (findings.length) {
  console.error('敏感資訊掃描失敗：');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}
console.log('敏感資訊掃描通過：未發現常見憑證、個人資料、本機路徑或禁止發布檔案。');

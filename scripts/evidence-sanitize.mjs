/** Pure, dependency-free redaction and fail-closed checks for shareable QA evidence. */

const emailPattern = /\b[A-Z0-9._%+-]+(?:@|%40)[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const localPathPattern =
  /\/(?:Users|home\/runner|home\/[^/\s]+|private\/tmp|tmp|var\/folders)\/[^\s"'<>),]+/g; // secret-scan:allow
const windowsPathPattern = /\b[A-Z]:\\(?:Users|Temp)\\[^\s"'<>),]+/gi;
const traceResourceReference = /^(?:src@[a-f0-9]{16,}\.txt|page@[a-f0-9]{16,}-\d+\.jpeg)$/i;
const withoutTraceResourceReferences = (text) =>
  text.replace(/\b(?:src@[a-f0-9]{16,}\.txt|page@[a-f0-9]{16,}-\d+\.jpeg)\b/gi, '[trace-resource]');
const secretPatterns = [
  ['email', new RegExp(emailPattern.source, 'i')],
  ['local path', new RegExp(localPathPattern.source)],
  ['local path', new RegExp(windowsPathPattern.source, 'i')],
  ['GitHub token', /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/], // secret-scan:allow
  ['API token', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/], // secret-scan:allow
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/], // secret-scan:allow
  [
    'credential assignment',
    /\b(?:password|passwd|api[_-]?key|access[_-]?token|secret[_-]?key)\s*["']?\s*[:=]\s*["']?[^\s"'\],;]{6,}/i,
  ], // secret-scan:allow
];

const normalizeKey = (key) => key.replace(/[^a-z]/gi, '').toLowerCase();

/** Trace resources may be extensionless Markdown/JSON; binary resources stay byte-identical. */
export function decodeEvidenceText(bytes) {
  if (bytes.some((byte) => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)) return null;
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function sanitizeEvidence(value, replacements = [], gitContext = false) {
  if (typeof value === 'string') {
    let text = value;
    for (const [from, to] of replacements) text = text.split(from).join(to);
    return text
      .replace(emailPattern, (match) =>
        traceResourceReference.test(match) ? match : '[email-redacted]',
      )
      .replace(localPathPattern, '[local-path-redacted]')
      .replace(windowsPathPattern, '[local-path-redacted]');
  }
  if (Array.isArray(value))
    return value.map((item) => sanitizeEvidence(item, replacements, gitContext));
  if (value && typeof value === 'object') {
    const entries = [];
    for (const [key, item] of Object.entries(value)) {
      const normalized = normalizeKey(key);
      if (normalized === 'gitdiff') continue;
      // Identity fields are incidental Git metadata; keep hashes/URLs/timestamps.
      if (gitContext && /^(?:author|committer)(?:name|email)?$/.test(normalized)) {
        entries.push([key, item == null ? item : '[git-identity-redacted]']);
        continue;
      }
      entries.push([
        key,
        sanitizeEvidence(item, replacements, gitContext || normalized === 'gitcommit'),
      ]);
    }
    return Object.fromEntries(entries);
  }
  return value;
}

export function findEvidenceSecrets(value, at = '$') {
  if (typeof value === 'string')
    return secretPatterns
      .filter(([, pattern]) => pattern.test(withoutTraceResourceReferences(value)))
      .map(([kind]) => ({ kind, at }));
  if (Array.isArray(value))
    return value.flatMap((item, index) => findEvidenceSecrets(item, `${at}[${index}]`));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, item]) => [
      ...(normalizeKey(key) === 'gitdiff'
        ? [{ kind: 'Git diff metadata', at: `${at}.${key}` }]
        : []),
      ...(/^(?:password|passwd|apikey|accesstoken|secretkey)$/.test(normalizeKey(key)) &&
      typeof item === 'string' &&
      item.length > 0 &&
      !/^\[(?:.*redacted|pending)\]$/.test(item)
        ? [{ kind: 'credential field', at: `${at}.${key}` }]
        : []),
      ...findEvidenceSecrets(item, `${at}.${key}`),
    ]);
  return [];
}

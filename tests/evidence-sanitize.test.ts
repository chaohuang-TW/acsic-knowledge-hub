import { describe, expect, it } from 'vitest';

const modulePath = '../scripts/evidence-sanitize.mjs';
const { decodeEvidenceText, sanitizeEvidence, findEvidenceSecrets } = (await import(
  modulePath
)) as {
  decodeEvidenceText: (bytes: Uint8Array) => string | null;
  sanitizeEvidence: <T>(value: T, replacements?: [string, string][]) => T;
  findEvidenceSecrets: (value: unknown) => { kind: string; at: string }[];
};

describe('shareable evidence redaction', () => {
  it('recognizes extensionless UTF-8 text but keeps binary resources out of text redaction', () => {
    const markdown = '# Error\n繁體中文 trace resource\n';
    const json = '{"stats":{"expected":172,"unexpected":0}}';
    expect(decodeEvidenceText(new TextEncoder().encode(markdown))).toBe(markdown);
    expect(decodeEvidenceText(new TextEncoder().encode(json))).toBe(json);
    const bomText = '\uFEFF# Error\n';
    expect(decodeEvidenceText(new TextEncoder().encode(bomText))).toBe(bomText);
    expect(decodeEvidenceText(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBeNull();
    expect(decodeEvidenceText(new Uint8Array([65, 0, 66]))).toBeNull();
    expect(decodeEvidenceText(new Uint8Array([65, 1, 66]))).toBeNull();
  });

  it('removes nested project Git identities and diffs without changing assertions, stats or SHA', () => {
    const sha = '34fce0fa89a360049a5825dfe4ba7177d522f407';
    const input = {
      config: {
        projects: [
          {
            metadata: {
              gitCommit: {
                hash: sha,
                author: 'Synthetic author',
                authorEmail: 'author@example.invalid',
                committerEmail: 'committer@example.invalid',
              },
              gitDiff: 'incidental diff',
            },
          },
        ],
        metadata: { gitDiff: 'another incidental diff' },
      },
      stats: { expected: 172, unexpected: 0, skipped: 0, flaky: 0 },
      suites: [
        {
          tests: [
            {
              status: 'expected',
              results: [
                {
                  status: 'passed',
                  duration: 42,
                  errors: [],
                  assertions: [{ expected: 2025, actual: 2025 }],
                },
              ],
            },
          ],
        },
      ],
      releaseSha: sha,
    };
    const result = sanitizeEvidence(input);
    expect(result.config.projects[0].metadata).not.toHaveProperty('gitDiff');
    expect(result.config.metadata).not.toHaveProperty('gitDiff');
    expect(result.config.projects[0].metadata.gitCommit).toEqual({
      hash: sha,
      author: '[git-identity-redacted]',
      authorEmail: '[git-identity-redacted]',
      committerEmail: '[git-identity-redacted]',
    });
    expect(result.suites).toEqual(input.suites);
    expect(result.stats).toEqual(input.stats);
    expect(result.releaseSha).toBe(sha);
    expect(findEvidenceSecrets(result)).toEqual([]);
    expect(input.config.projects[0].metadata.gitDiff).toBe('incidental diff');
  });

  it('redacts emails in any copied JSON string, including URI-encoded addresses', () => {
    const result = sanitizeEvidence({
      error: 'Contact synthetic@example.invalid',
      nested: ['mailto:tester@example.invalid', 'synthetic%40example.invalid'],
    });
    expect(result).toEqual({
      error: 'Contact [email-redacted]',
      nested: ['mailto:[email-redacted]', '[email-redacted]'],
    });
    expect(findEvidenceSecrets(result)).toEqual([]);
  });

  it('redacts local paths and applies caller-supplied root replacements', () => {
    const local = ['', 'Users', 'synthetic-user', 'workspace', 'report.json'].join('/');
    const windows = ['C:', 'Users', 'synthetic-user', 'report.json'].join('\\');
    const result = sanitizeEvidence({
      local,
      windows,
      runner: '/home/runner/work/repo/report.json',
      temp: '/private/tmp/report.json',
      relative: 'tests/e2e/example.spec.ts',
    });
    expect(result.local).toBe('[local-path-redacted]');
    expect(result.windows).toBe('[local-path-redacted]');
    expect(result.runner).toBe('[local-path-redacted]');
    expect(result.temp).toBe('[local-path-redacted]');
    expect(result.relative).toBe('tests/e2e/example.spec.ts');
    expect(sanitizeEvidence(local, [[local, 'reports/report.json']])).toBe('reports/report.json');
    expect(findEvidenceSecrets(result)).toEqual([]);
  });

  it('preserves non-Git diff assertions, booleans, nulls and numeric values', () => {
    const evidence = {
      assertions: [{ diff: { expected: 'Member', actual: 'Observer' } }],
      success: false,
      count: 202,
      pending: null,
    };
    expect(sanitizeEvidence(evidence)).toEqual(evidence);
  });

  it('detects credentials rather than silently publishing or changing their values', () => {
    const token = `ghp_${'x'.repeat(40)}`;
    const sanitized = sanitizeEvidence({ token });
    expect(sanitized.token).toBe(token);
    expect(findEvidenceSecrets(sanitized)).toEqual([{ kind: 'GitHub token', at: '$.token' }]);
    expect(findEvidenceSecrets(Object.fromEntries([['password', 'synthetic-credential']]))).toEqual(
      [{ kind: 'credential field', at: '$.password' }],
    );
  });

  it('preserves Playwright hashed source and screencast references so traces remain usable', () => {
    const reference = `resources/src@${'a'.repeat(40)}.txt`;
    const screenshot = `page@${'b'.repeat(32)}-1790834678404.jpeg`;
    expect(sanitizeEvidence({ reference, screenshot })).toEqual({ reference, screenshot });
    expect(findEvidenceSecrets({ reference, screenshot })).toEqual([]);
  });

  it('detects unsanitized metadata and privacy findings without returning sensitive text', () => {
    const findings = findEvidenceSecrets({
      metadata: { gitDiff: 'diff', authorEmail: 'synthetic@example.invalid' },
    });
    expect(findings).toContainEqual({ kind: 'Git diff metadata', at: '$.metadata.gitDiff' });
    expect(findings).toContainEqual({ kind: 'email', at: '$.metadata.authorEmail' });
    expect(JSON.stringify(findings)).not.toContain('synthetic@example.invalid');
  });
});

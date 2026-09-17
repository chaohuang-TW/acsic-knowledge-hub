import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { mascotSpriteUrl } from '../src/features/network-explorer/mascot';

describe('official Meng-Ge mascot asset contract', () => {
  it('ships a bounded, transparent WebP derived from the supplied reference', () => {
    const assetPath = new URL('../public/assets/mascot/meng-ge-guide.webp', import.meta.url);
    const bytes = readFileSync(assetPath);
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    expect(statSync(assetPath).size).toBeLessThan(100_000);
    expect(mascotSpriteUrl).toContain('assets/mascot/meng-ge-guide.webp');
  });

  it('keeps the intended portrait canvas dimensions', () => {
    const assetPath = new URL('../public/assets/mascot/meng-ge-guide.webp', import.meta.url);
    const bytes = readFileSync(assetPath);
    // Pillow emits VP8X for the alpha-bearing WebP; dimensions are 24-bit little endian.
    expect(bytes.subarray(12, 16).toString()).toBe('VP8X');
    const width = 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16);
    const height = 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16);
    expect({ width, height }).toEqual({ width: 250, height: 465 });
  });
});

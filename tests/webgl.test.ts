import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWebGLCapability, isWebGLAvailable } from '../src/features/network-explorer/webgl';

function stubCanvas(getContext: (contextId: string) => unknown) {
  vi.stubGlobal('window', { location: { search: '' } });
  vi.stubGlobal('document', { createElement: () => ({ getContext }) });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WebGL capability detection', () => {
  it('prefers WebGL2 when available', () => {
    stubCanvas((contextId) => (contextId === 'webgl2' ? {} : null));

    expect(getWebGLCapability()).toEqual({ available: true, mode: 'webgl2' });
    expect(isWebGLAvailable()).toBe(true);
  });

  it('falls back to WebGL1 when WebGL2 is unavailable', () => {
    stubCanvas((contextId) => (contextId === 'webgl' ? {} : null));

    expect(getWebGLCapability()).toEqual({ available: true, mode: 'webgl1' });
  });

  it('reports unsupported when neither context exists', () => {
    stubCanvas(() => null);

    expect(getWebGLCapability()).toEqual({
      available: false,
      mode: 'none',
      reason: 'unsupported',
    });
    expect(isWebGLAvailable()).toBe(false);
  });

  it('distinguishes context creation failures from unsupported browsers', () => {
    stubCanvas(() => {
      throw new Error('context blocked');
    });

    expect(getWebGLCapability()).toEqual({
      available: false,
      mode: 'none',
      reason: 'context-creation-failed',
    });
  });

  it('keeps manual QA fallback explicit and does not probe the canvas', () => {
    vi.stubGlobal('window', { location: { search: '?networkFallback=1' } });
    const createElement = vi.fn(() => ({ getContext: vi.fn() }));
    vi.stubGlobal('document', { createElement });

    expect(getWebGLCapability()).toEqual({ available: false, mode: 'none', reason: 'manual-test' });
    expect(createElement).not.toHaveBeenCalled();
  });
});

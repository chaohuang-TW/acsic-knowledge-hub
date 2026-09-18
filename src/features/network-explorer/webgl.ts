export type WebGLMode = 'webgl2' | 'webgl1' | 'none';

export type WebGLCapability = {
  available: boolean;
  mode: WebGLMode;
  reason?: 'manual-test' | 'unsupported' | 'context-creation-failed' | 'server-render';
};

export type NetworkFallbackReason =
  'capability-unavailable' | 'scene-error' | 'context-lost' | 'manual-test';

type NetworkWindow = Window & {
  __ACSIC_FORCE_NETWORK_FALLBACK__?: boolean;
};

/**
 * Detect the least capable context Three.js can use instead of treating a
 * missing WebGL2 context as a total 3D failure.
 */
export function getWebGLCapability(): WebGLCapability {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { available: true, mode: 'webgl2', reason: 'server-render' };
  }

  const networkWindow = window as NetworkWindow;
  const manualOverride =
    new URLSearchParams(window.location.search).get('networkFallback') === '1' ||
    networkWindow.__ACSIC_FORCE_NETWORK_FALLBACK__ === true;
  if (manualOverride) return { available: false, mode: 'none', reason: 'manual-test' };

  const canvas = document.createElement('canvas');
  let webgl2Failed = false;
  try {
    if (canvas.getContext('webgl2')) return { available: true, mode: 'webgl2' };
  } catch {
    webgl2Failed = true;
  }

  try {
    if (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) {
      return { available: true, mode: 'webgl1' };
    }
  } catch {
    return { available: false, mode: 'none', reason: 'context-creation-failed' };
  }

  return {
    available: false,
    mode: 'none',
    reason: webgl2Failed ? 'context-creation-failed' : 'unsupported',
  };
}

export function isWebGLAvailable() {
  return getWebGLCapability().available;
}

/** Keep diagnostics local and sanitized; no telemetry or error service is used. */
export function reportNetworkDiagnostic(
  reason: NetworkFallbackReason | 'asset-error',
  error?: unknown,
  metadata?: Record<string, string | undefined>,
) {
  const errorName = error instanceof Error ? error.name : undefined;
  const details = { reason, ...(errorName ? { errorName } : {}), ...metadata };
  console.error('[ACSIC Network Explorer]', details);
}

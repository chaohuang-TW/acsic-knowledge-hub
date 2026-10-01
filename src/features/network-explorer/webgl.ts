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
 * The installed Three.js renderer requires WebGL2. WebGL1-only devices use
 * the complete SVG explorer rather than attempting an unsupported renderer.
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
    const context = canvas.getContext('webgl2');
    if (context) {
      context.getExtension?.('WEBGL_lose_context')?.loseContext();
      return { available: true, mode: 'webgl2' };
    }
  } catch {
    webgl2Failed = true;
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
  if (reason === 'manual-test' || reason === 'capability-unavailable')
    console.info('[ACSIC Network Explorer]', details);
  else console.error('[ACSIC Network Explorer]', details);
}

export function isWebGLAvailable() {
  if (typeof window === 'undefined') return true;
  if (window.location.search.includes('networkFallback=1')) return false;
  if (
    (window as Window & { __ACSIC_FORCE_NETWORK_FALLBACK__?: boolean })
      .__ACSIC_FORCE_NETWORK_FALLBACK__
  )
    return false;
  const canvas = document.createElement('canvas');
  try {
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

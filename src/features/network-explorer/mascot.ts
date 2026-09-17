import type { Vec3 } from './networkSceneData';

export type MascotGuideState = 'idle' | 'walk' | 'arrive' | 'point';

/**
 * Stable integration contract for the official mascot. The current release
 * uses a camera-facing 2.5D sprite; modelUrl remains reserved for a future
 * GLB without changing scene callers.
 */
export interface MascotGuideProps {
  target: Vec3;
  state: MascotGuideState;
  reducedMotion: boolean;
  modelUrl?: string;
  spriteUrl?: string;
}

export const mascotSpriteUrl = `${import.meta.env.BASE_URL}assets/mascot/meng-ge-guide.webp`;

import coastlineData from './mapCoastline.json';

/** Longitude/latitude-like points used only for the explorer's presentation map. */
export type MapPoint = [number, number];

/**
 * One projection is shared by the 3D scene and the lightweight SVG explorer.
 * The anchors are intentionally approximate; they are not borders or research
 * measurements. Keep this transform stable so institution hotspots do not drift
 * when the coastline source is refreshed.
 */
export function projectMapPosition(longitude: number, latitude: number): [number, number, number] {
  return [(longitude - 108) * 0.14, 0.12, (23 - latitude) * 0.16];
}

/**
 * The SVG viewBox is normalized from the same projected world coordinates as
 * the Three scene. Keeping a generous frame preserves the full coastline and
 * leaves room for leader lines around Japan, Korea and Taiwan.
 */
export const MAP_SVG_VIEWBOX = { width: 1000, height: 620 } as const;

const SVG_WORLD_BOUNDS = {
  minX: (55 - 108) * 0.14,
  maxX: (155 - 108) * 0.14,
  minZ: (23 - 58) * 0.16,
  maxZ: (23 - -13) * 0.16,
} as const;

export function projectMapSvgPoint(longitude: number, latitude: number): [number, number] {
  const [x, , z] = projectMapPosition(longitude, latitude);
  return projectMapSvgWorldPoint(x, z);
}

export function projectMapSvgWorldPoint(x: number, z: number): [number, number] {
  const normalizedX = (x - SVG_WORLD_BOUNDS.minX) / (SVG_WORLD_BOUNDS.maxX - SVG_WORLD_BOUNDS.minX);
  const normalizedY = (z - SVG_WORLD_BOUNDS.minZ) / (SVG_WORLD_BOUNDS.maxZ - SVG_WORLD_BOUNDS.minZ);
  return [normalizedX * MAP_SVG_VIEWBOX.width, normalizedY * MAP_SVG_VIEWBOX.height];
}

/** Natural Earth 50m coastline, converted to the small presentation format. */
export const asiaLandContours: MapPoint[][] = coastlineData.map((contour) =>
  contour.map(([longitude, latitude]) => [longitude, latitude] as MapPoint),
);

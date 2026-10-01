import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Presentation geometry only. The official-source research registry is untouched.
const input = process.argv[2];
if (!input) throw new Error('Pass the Natural Earth 50m land GeoJSON file.');
const raw = readFileSync(input);
const geo = JSON.parse(raw);
const bounds = [55, -13, 155, 58];
function clip(points, axis, limit, greater) {
  const result = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const ai = greater ? a[axis] >= limit : a[axis] <= limit;
    const bi = greater ? b[axis] >= limit : b[axis] <= limit;
    if (ai) result.push(a);
    if (ai !== bi) {
      const t = (limit - a[axis]) / (b[axis] - a[axis]);
      result.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return result;
}
function simplify(points, tolerance = 0.075) {
  if (points.length <= 4) return points;
  const first = points[0],
    last = points.at(-1);
  let max = 0,
    index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const dx = last[0] - first[0],
      dy = last[1] - first[1];
    const t = Math.max(
      0,
      Math.min(1, ((p[0] - first[0]) * dx + (p[1] - first[1]) * dy) / (dx * dx + dy * dy || 1)),
    );
    const distance = Math.hypot(p[0] - first[0] - t * dx, p[1] - first[1] - t * dy);
    if (distance > max) {
      max = distance;
      index = i;
    }
  }
  return max > tolerance
    ? [
        ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
        ...simplify(points.slice(index), tolerance),
      ]
    : [first, last];
}
const contours = [];
for (const feature of geo.features) {
  const polygons =
    feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates
      : [feature.geometry.coordinates];
  for (const polygon of polygons) {
    let ring = polygon[0].slice(0, -1);
    ring = clip(
      clip(clip(clip(ring, 0, bounds[0], true), 0, bounds[2], false), 1, bounds[1], true),
      1,
      bounds[3],
      false,
    );
    if (ring.length < 3) continue;
    const area =
      Math.abs(
        ring.reduce((sum, p, i) => {
          const q = ring[(i + 1) % ring.length];
          return sum + p[0] * q[1] - q[0] * p[1];
        }, 0),
      ) / 2;
    if (area < 0.1) continue;
    ring = simplify([...ring, ring[0]])
      .slice(0, -1)
      .map((p) => p.map((v) => Math.round(v * 1000) / 1000));
    if (ring.length >= 3) contours.push(ring);
  }
}
const target = new URL('../src/features/network-explorer/mapCoastline.json', import.meta.url);
writeFileSync(target, JSON.stringify(contours) + '\n');
console.log(
  JSON.stringify(
    {
      source: 'Natural Earth 50m land',
      license: 'Public domain',
      sourceSha256: createHash('sha256').update(raw).digest('hex'),
      contours: contours.length,
      points: contours.reduce((n, p) => n + p.length, 0),
    },
    null,
    2,
  ),
);

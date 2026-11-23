// Групиране без учител: набори от точки без етикети, алгоритъмът k-средни и проекция върху права.

import { mulberry32 } from '../history/rollouts';

export type P2 = { x: number; y: number };
export type CloudId = 'three' | 'four' | 'none';

export const CLOUDS: { id: CloudId; label: string }[] = [
  { id: 'three', label: 'три групи' },
  { id: 'four', label: 'четири групи' },
  { id: 'none', label: 'без групи' },
];

const CENTERS: Record<CloudId, [number, number, number][]> = {
  three: [
    [2.6, 3.0, 0.8],
    [7.2, 3.4, 0.9],
    [5.0, 7.4, 0.8],
  ],
  four: [
    [2.4, 2.6, 0.7],
    [7.6, 2.8, 0.7],
    [2.8, 7.4, 0.7],
    [7.2, 7.2, 0.7],
  ],
  none: [],
};

/** `n` точки в квадрата [0; 10]² – винаги едни и същи за дадено `seed`. */
export function makeCloud(id: CloudId, n: number, seed: number): P2[] {
  const random = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const clamp = (v: number) => Math.min(9.8, Math.max(0.2, v));
  const centers = CENTERS[id];
  return Array.from({ length: n }, (_, i) => {
    if (!centers.length) return { x: 0.4 + 9.2 * random(), y: 0.4 + 9.2 * random() };
    const [cx, cy, s] = centers[i % centers.length];
    return { x: clamp(cx + s * normal()), y: clamp(cy + s * normal()) };
  });
}

const d2 = (a: P2, b: P2) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/** Стъпка 1: всяка точка отива при най-близкия център. */
export const assign = (points: P2[], centers: P2[]) => points.map(p => centers.reduce((best, c, i) => (d2(p, c) < d2(p, centers[best]) ? i : best), 0));

/** Стъпка 2: всеки център се мести в средното на своите точки (празна група запазва центъра си). */
export function moveCenters(points: P2[], labels: number[], centers: P2[]): P2[] {
  return centers.map((c, i) => {
    const mine = points.filter((_, k) => labels[k] === i);
    return mine.length ? { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length } : c;
  });
}

/** Сборът от квадратите на разстоянията от точките до центровете на групите им. */
export const scatter = (points: P2[], labels: number[], centers: P2[]) => points.reduce((s, p, k) => s + d2(p, centers[labels[k]]), 0);

/** Начални центрове: k случайно избрани различни точки от данните. */
export function initialCenters(points: P2[], k: number, seed: number): P2[] {
  const random = mulberry32(seed);
  const picked = new Set<number>();
  while (picked.size < k) picked.add(Math.floor(random() * points.length));
  return [...picked].map(i => ({ ...points[i] }));
}

/** k-средни докрай от даден старт. */
export function kMeans(points: P2[], start: P2[]) {
  let centers = start;
  let labels = assign(points, centers);
  for (let i = 0; i < 100; i++) {
    centers = moveCenters(points, labels, centers);
    const next = assign(points, centers);
    if (next.every((v, k) => v === labels[k])) break;
    labels = next;
  }
  return { centers, labels, scatter: scatter(points, labels, centers) };
}

/** Най-доброто от няколко старта. */
export function bestKMeans(points: P2[], k: number, tries = 12) {
  let best = kMeans(points, initialCenters(points, k, 100 + k));
  for (let t = 1; t < tries; t++) {
    const r = kMeans(points, initialCenters(points, k, 100 + k + 31 * t));
    if (r.scatter < best.scatter) best = r;
  }
  return best;
}

/** Разсейване (дисперсия) на проекциите на точките върху права под ъгъл `deg` и дялът му от общото разсейване. */
export function projectionSpread(points: P2[], deg: number) {
  const mx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const my = points.reduce((s, p) => s + p.y, 0) / points.length;
  const ux = Math.cos((deg * Math.PI) / 180);
  const uy = Math.sin((deg * Math.PI) / 180);
  const along = points.map(p => (p.x - mx) * ux + (p.y - my) * uy);
  const kept = along.reduce((s, t) => s + t * t, 0) / points.length;
  const total = points.reduce((s, p) => s + (p.x - mx) ** 2 + (p.y - my) ** 2, 0) / points.length;
  return { mx, my, ux, uy, along, kept, total, share: kept / total };
}

/** Посоката с най-голямо разсейване – първата главна компонента (ъгъл в градуси от 0 до 180). */
export function bestDirection(points: P2[]) {
  const mx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const my = points.reduce((s, p) => s + p.y, 0) / points.length;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
    sxy += (p.x - mx) * (p.y - my);
  }
  const deg = (0.5 * Math.atan2(2 * sxy, sxx - syy) * 180) / Math.PI;
  return (deg + 180) % 180;
}

/** Удължен наклонен облак за лабораторията с проекцията. */
export function makeStretched(n: number, seed: number): P2[] {
  const random = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  return Array.from({ length: n }, () => {
    const a = 2.6 * normal();
    const b = 0.7 * normal();
    // Завъртане на 33° около (5; 5)
    return { x: 5 + a * 0.839 - b * 0.545, y: 5 + a * 0.545 + b * 0.839 };
  });
}

/** Цветовете на групите – пълни имена на класовете, за да ги намери Tailwind. */
export const GROUP_FILL = ['fill-blue-600 dark:fill-blue-400', 'fill-rose-600 dark:fill-rose-400', 'fill-emerald-600 dark:fill-emerald-400', 'fill-amber-500', 'fill-violet-600 dark:fill-violet-400', 'fill-cyan-600 dark:fill-cyan-400'];

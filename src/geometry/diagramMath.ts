// Общи елементи за интерактивните геометрични чертежи.
// Чертежите са в координати на viewBox (W × H); една единица от мрежата е UNIT пиксела.

export type Point = { x: number; y: number };

export const W = 480;
export const H = 320;
export const UNIT = 20;

// ---------- Математика ----------

export const dist = (p: Point, q: Point) => Math.hypot(q.x - p.x, q.y - p.y);
export const mid = (p: Point, q: Point): Point => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
export const add = (p: Point, q: Point): Point => ({ x: p.x + q.x, y: p.y + q.y });
export const sub = (p: Point, q: Point): Point => ({ x: p.x - q.x, y: p.y - q.y });
export const scale = (p: Point, k: number): Point => ({ x: p.x * k, y: p.y * k });

export const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Ъгълът при върха V между лъчите към P и Q, в градуси (0–180). */
export function angleAt(v: Point, p: Point, q: Point) {
  const a = Math.atan2(p.y - v.y, p.x - v.x);
  const b = Math.atan2(q.y - v.y, q.x - v.x);
  let d = Math.abs(toDeg(a - b));
  if (d > 180) d = 360 - d;
  return d;
}

/** Лице на многоъгълник (формула на Гаус). */
export function polygonArea(points: Point[]) {
  let s = 0;
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    s += p.x * q.y - q.x * p.y;
  });
  return Math.abs(s) / 2;
}

export const snap = (p: Point, margin = UNIT): Point => ({
  x: Math.min(W - margin, Math.max(margin, Math.round(p.x / UNIT) * UNIT)),
  y: Math.min(H - margin, Math.max(margin, Math.round(p.y / UNIT) * UNIT)),
});

/** Дължина в единици на мрежата. */
export const units = (px: number) => px / UNIT;

/** Число с десетична запетая, както е прието в българския език. */
export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('bg-BG', { maximumFractionDigits: digits, useGrouping: false });

// ---------- Цветове ----------

export const tones = {
  blue: { stroke: 'stroke-blue-500', fill: 'fill-blue-500', soft: 'fill-blue-500/10', label: 'fill-blue-700 dark:fill-blue-300', text: 'text-blue-700 dark:text-blue-300' },
  rose: { stroke: 'stroke-rose-500', fill: 'fill-rose-500', soft: 'fill-rose-500/15', label: 'fill-rose-600 dark:fill-rose-400', text: 'text-rose-600 dark:text-rose-400' },
  emerald: { stroke: 'stroke-emerald-500', fill: 'fill-emerald-500', soft: 'fill-emerald-500/15', label: 'fill-emerald-700 dark:fill-emerald-400', text: 'text-emerald-700 dark:text-emerald-400' },
  violet: { stroke: 'stroke-violet-500', fill: 'fill-violet-500', soft: 'fill-violet-500/15', label: 'fill-violet-700 dark:fill-violet-400', text: 'text-violet-700 dark:text-violet-400' },
  amber: { stroke: 'stroke-amber-500', fill: 'fill-amber-500', soft: 'fill-amber-500/20', label: 'fill-amber-700 dark:fill-amber-400', text: 'text-amber-700 dark:text-amber-400' },
  gray: { stroke: 'stroke-gray-400 dark:stroke-gray-500', fill: 'fill-gray-500', soft: 'fill-gray-500/10', label: 'fill-gray-600 dark:fill-gray-300', text: 'text-gray-600 dark:text-gray-300' },
};

export type Tone = keyof typeof tones;

export const toRad = (deg: number) => (deg * Math.PI) / 180;
export const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

/** Точка от окръжност с център c и радиус r при ъгъл φ (в градуси, обратно на часовниковата стрелка). */
export const polar = (c: Point, r: number, deg: number): Point => ({
  x: c.x + r * Math.cos(toRad(deg)),
  y: c.y - r * Math.sin(toRad(deg)),
});

/** Ъгълът (в градуси, 0–360) на точката p спрямо центъра c. */
export const polarAngle = (c: Point, p: Point) => norm360(toDeg(Math.atan2(c.y - p.y, p.x - c.x)));

/** SVG път за дъга от φ1 до φ2 обратно на часовниковата стрелка; closed – като сектор. */
export function arcPath(c: Point, r: number, from: number, to: number, closed = false) {
  const span = norm360(to - from);
  const s = polar(c, r, from);
  const e = polar(c, r, to);
  const arc = `A ${r} ${r} 0 ${span > 180 ? 1 : 0} 0 ${e.x} ${e.y}`;
  return closed ? `M ${c.x} ${c.y} L ${s.x} ${s.y} ${arc} Z` : `M ${s.x} ${s.y} ${arc}`;
}

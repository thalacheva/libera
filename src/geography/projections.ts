// Картографски проекции за уроците по география: формули, изкривявания, сушата и окръжностите на Тисо.
import { rad, deg, type LatLon } from './geo';
import { LAND } from './worldLand';

export type ProjectionId = 'equirect' | 'mercator' | 'peters' | 'mollweide' | 'azimuthal';

type Projection = {
  id: ProjectionId;
  name: string;
  kind: string;
  /** Какво запазва. */
  keeps: string;
  /** (λ, φ) в радиани → (x, y) в условни единици, y нагоре. */
  forward: (lon: number, lat: number) => [number, number];
  /** Обхват на картата в условни единици. */
  bounds: [number, number, number, number];
  /** Цилиндрична/псевдоцилиндрична – краищата при ±180° се режат, а пръстените отвъд 180° се рисуват и отместени. */
  wraps: boolean;
  /** Мащаб по меридиана h и по паралела k при ширина φ (null – зависят и от дължината). */
  scales: (lat: number) => { h: number; k: number } | null;
  /** Максимална ширина, до която се рисува. */
  maxLat: number;
};

const C45 = Math.cos(Math.PI / 4);
const MERC_MAX = 82;
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + lat / 2));

/** θ от уравнението 2θ + sin 2θ = π sin φ (метод на Нютон). */
function mollweideTheta(lat: number) {
  if (Math.abs(Math.abs(lat) - Math.PI / 2) < 1e-9) return lat;
  let t = lat;
  for (let i = 0; i < 30; i++) {
    const f = 2 * t + Math.sin(2 * t) - Math.PI * Math.sin(lat);
    const d = 2 + 2 * Math.cos(2 * t);
    const step = f / d;
    t -= step;
    if (Math.abs(step) < 1e-10) break;
  }
  return t;
}

export const PROJECTIONS: Projection[] = [
  {
    id: 'equirect',
    name: 'Равнопромежутъчна цилиндрична',
    kind: 'цилиндрична',
    keeps: 'разстоянията по меридианите',
    forward: (l, f) => [l, f],
    bounds: [-Math.PI, -Math.PI / 2, Math.PI, Math.PI / 2],
    wraps: true,
    scales: f => ({ h: 1, k: 1 / Math.cos(f) }),
    maxLat: 90,
  },
  {
    id: 'mercator',
    name: 'Меркатор',
    kind: 'цилиндрична',
    keeps: 'ъглите и формата на малките области (равноъгълна)',
    forward: (l, f) => [l, mercY(Math.max(-rad(MERC_MAX), Math.min(rad(MERC_MAX), f)))],
    bounds: [-Math.PI, mercY(-rad(MERC_MAX)), Math.PI, mercY(rad(MERC_MAX))],
    wraps: true,
    scales: f => ({ h: 1 / Math.cos(f), k: 1 / Math.cos(f) }),
    maxLat: MERC_MAX,
  },
  {
    id: 'peters',
    name: 'Гал–Петерс',
    kind: 'цилиндрична',
    keeps: 'лицата (равновелика)',
    forward: (l, f) => [l * C45, Math.sin(f) / C45],
    bounds: [-Math.PI * C45, -1 / C45, Math.PI * C45, 1 / C45],
    wraps: true,
    scales: f => ({ h: Math.cos(f) / C45, k: C45 / Math.cos(f) }),
    maxLat: 90,
  },
  {
    id: 'mollweide',
    name: 'Молвайде',
    kind: 'псевдоцилиндрична',
    keeps: 'лицата (равновелика)',
    forward: (l, f) => {
      const t = mollweideTheta(f);
      return [((2 * Math.SQRT2) / Math.PI) * l * Math.cos(t), Math.SQRT2 * Math.sin(t)];
    },
    bounds: [-2 * Math.SQRT2, -Math.SQRT2, 2 * Math.SQRT2, Math.SQRT2],
    wraps: true,
    scales: () => null,
    maxLat: 90,
  },
  {
    id: 'azimuthal',
    name: 'Азимутална равнопромежутъчна',
    kind: 'азимутална (полярна)',
    keeps: 'разстоянията и посоките от Северния полюс',
    forward: (l, f) => {
      const r = Math.PI / 2 - f;
      return [r * Math.sin(l), -r * Math.cos(l)];
    },
    bounds: [-Math.PI, -Math.PI, Math.PI, Math.PI],
    wraps: false,
    scales: f => ({ h: 1, k: f > Math.PI / 2 - 1e-6 ? 1 : (Math.PI / 2 - f) / Math.cos(f) }),
    maxLat: 90,
  },
];

export const projectionById = (id: ProjectionId) => PROJECTIONS.find(p => p.id === id) ?? PROJECTIONS[0];

/** Вписва проекцията в правоъгълник (x0, y0, w, h) с поле pad; връща (λ°, φ°) → точка на екрана. */
export function fitProjection(p: Projection, x0: number, y0: number, w: number, h: number, pad = 6) {
  const [ax, ay, bx, by] = p.bounds;
  const s = Math.min((w - 2 * pad) / (bx - ax), (h - 2 * pad) / (by - ay));
  const cx = x0 + w / 2 - (s * (ax + bx)) / 2;
  const cy = y0 + h / 2 + (s * (ay + by)) / 2;
  const toScreen = (q: LatLon) => {
    const [x, y] = p.forward(rad(q.lon), rad(Math.max(-p.maxLat, Math.min(p.maxLat, q.lat))));
    return { x: cx + s * x, y: cy - s * y };
  };
  return { toScreen, scale: s, box: { x: cx + s * ax, y: cy - s * by, w: s * (bx - ax), h: s * (by - ay) } };
}

/** Контурът на целия свят в проекцията (за фон и за изрязване). */
export function outlinePath(p: Projection, toScreen: (q: LatLon) => { x: number; y: number }) {
  if (p.id === 'azimuthal') {
    const pts = Array.from({ length: 145 }, (_, i) => toScreen({ lat: -90 + 1e-6, lon: -180 + i * 2.5 }));
    return pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('') + 'Z';
  }
  const pts: LatLon[] = [];
  for (let lat = -90; lat <= 90; lat += 2) pts.push({ lat, lon: -180 });
  for (let lat = 90; lat >= -90; lat -= 2) pts.push({ lat, lon: 180 });
  return pts.map((q, i) => {
    const s = toScreen(q);
    return `${i ? 'L' : 'M'}${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
  }).join('') + 'Z';
}

/** Точките на пръстен от LAND като (λ, φ) в градуси; ръбовете по полюса се сгъстяват. */
export function ringPoints(ring: number[]): LatLon[] {
  const out: LatLon[] = [];
  for (let i = 0; i < ring.length; i += 2) {
    const q = { lon: ring[i] / 10, lat: ring[i + 1] / 10 };
    const prev = out[out.length - 1];
    if (prev && Math.abs(prev.lat) >= 89.9 && Math.abs(q.lat) >= 89.9) {
      const n = Math.ceil(Math.abs(q.lon - prev.lon) / 3);
      for (let j = 1; j < n; j++) out.push({ lat: q.lat, lon: prev.lon + ((q.lon - prev.lon) * j) / n });
    }
    out.push(q);
  }
  return out;
}

const pathOf = (pts: LatLon[], toScreen: (q: LatLon) => { x: number; y: number }) =>
  pts.map((q, i) => {
    const s = toScreen(q);
    return `${i ? 'L' : 'M'}${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
  }).join('') + 'Z';

/** Сушата в проекцията (fill-rule evenodd, изрязва се по outlinePath). */
export function landPath(p: Projection, toScreen: (q: LatLon) => { x: number; y: number }) {
  return LAND.map(ring => {
    const pts = ringPoints(ring);
    const wide = p.wraps && pts.some(q => q.lon > 180);
    return pathOf(pts, toScreen) + (wide ? pathOf(pts.map(q => ({ ...q, lon: q.lon - 360 })), toScreen) : '');
  }).join('');
}

/** Точка на разстояние d (радиани) и азимут az (радиани) от p. */
export function destination(p: LatLon, d: number, az: number): LatLon {
  const f1 = rad(p.lat);
  const l1 = rad(p.lon);
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(az));
  const l2 = l1 + Math.atan2(Math.sin(az) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
  return { lat: deg(f2), lon: deg(l2) };
}

/** Окръжност на Тисо: еднакъв кръг по земната повърхност с ъглов радиус r°, рисуван в проекцията. */
export function tissotPath(center: LatLon, r: number, toScreen: (q: LatLon) => { x: number; y: number }) {
  const pts = Array.from({ length: 36 }, (_, i) => destination(center, rad(r), (i / 36) * 2 * Math.PI));
  return pathOf(pts, toScreen);
}

// ---------- Пренасяне на област по сферата ----------

type Vec = [number, number, number];
const toVec = (q: LatLon): Vec => {
  const f = rad(q.lat);
  const l = rad(q.lon);
  return [Math.cos(f) * Math.cos(l), Math.cos(f) * Math.sin(l), Math.sin(f)];
};
const fromVec = ([x, y, z]: Vec): LatLon => ({ lat: deg(Math.atan2(z, Math.hypot(x, y))), lon: deg(Math.atan2(y, x)) });
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** „Центърът“ на областта – средното на точките ѝ върху сферата. */
export function centroid(pts: LatLon[]): LatLon {
  const s: Vec = [0, 0, 0];
  for (const q of pts) {
    const v = toVec(q);
    s[0] += v[0];
    s[1] += v[1];
    s[2] += v[2];
  }
  return fromVec(s);
}

/** Завърта областта по сферата така, че центърът ѝ from отиде в to – формата и размерът не се променят. */
export function moveOnSphere(pts: LatLon[], from: LatLon, to: LatLon): LatLon[] {
  const a = toVec(from);
  const b = toVec(to);
  let k = cross(a, b);
  const sin = Math.hypot(...k);
  const cos = dot(a, b);
  if (sin < 1e-12) return pts;
  k = [k[0] / sin, k[1] / sin, k[2] / sin];
  return pts.map(q => {
    const v = toVec(q);
    const kv = cross(k, v);
    const kd = dot(k, v);
    // Формулата на Родриг
    return fromVec([
      v[0] * cos + kv[0] * sin + k[0] * kd * (1 - cos),
      v[1] * cos + kv[1] * sin + k[1] * kd * (1 - cos),
      v[2] * cos + kv[2] * sin + k[2] * kd * (1 - cos),
    ]);
  });
}

/** Истинската площ на пръстен по сферата, km² (по равновеликата цилиндрична проекция на Ламберт). */
export function sphericalAreaKm2(pts: LatLon[], R = 6371) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += rad(a.lon) * Math.sin(rad(b.lat)) - rad(b.lon) * Math.sin(rad(a.lat));
  }
  return (Math.abs(s) / 2) * R * R;
}

/** Лице на многоъгълник на екрана. */
export function planarArea(pts: { x: number; y: number }[]) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/** Пръстенът от LAND, който съдържа дадената точка (напр. Гренландия, Австралия). */
export function ringContaining(q: LatLon): LatLon[] {
  for (const ring of LAND) {
    const pts = ringPoints(ring);
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i];
      const b = pts[j];
      if (a.lat > q.lat !== b.lat > q.lat && q.lon < ((b.lon - a.lon) * (q.lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
    }
    if (inside) return pts;
  }
  return [];
}

// Геометрия на небесната сфера.
// Хоризонтална система (дясна): x → Юг, y → Изток, z → Зенит.

export type Vec3 = [number, number, number];

export const DEG = Math.PI / 180;
export const OBLIQUITY = 23.44;

export const dot = (a: Vec3, b: Vec3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const add = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const scale = (a: Vec3, k: number): Vec3 => [
  a[0] * k,
  a[1] * k,
  a[2] * k,
];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const normalize = (a: Vec3): Vec3 => scale(a, 1 / Math.hypot(...a));

export const SOUTH: Vec3 = [1, 0, 0];
export const NORTH: Vec3 = [-1, 0, 0];
export const EAST: Vec3 = [0, 1, 0];
export const WEST: Vec3 = [0, -1, 0];
export const ZENITH: Vec3 = [0, 0, 1];
export const NADIR: Vec3 = [0, 0, -1];

/** Екваториалният базис за наблюдател на ширина φ (в градуси). */
export function equatorialFrame(latitude: number) {
  const phi = latitude * DEG;
  // Северен полюс на света – на височина φ над северната точка
  const pole: Vec3 = [-Math.cos(phi), 0, Math.sin(phi)];
  // Горната точка на екватора върху меридиана (часов ъгъл t = 0)
  const q: Vec3 = [Math.sin(phi), 0, Math.cos(phi)];
  return { pole, q };
}

/** Посока към обект с деклинация δ и часов ъгъл t (в градуси). */
export function hourAngleToHorizon(
  latitude: number,
  declination: number,
  hourAngle: number
): Vec3 {
  const { pole, q } = equatorialFrame(latitude);
  const d = declination * DEG;
  const t = hourAngle * DEG;
  // Часовият ъгъл расте на запад
  return add(
    add(
      scale(q, Math.cos(d) * Math.cos(t)),
      scale(WEST, Math.cos(d) * Math.sin(t))
    ),
    scale(pole, Math.sin(d))
  );
}

/** Посока към обект с ректасцензия α (часове) и деклинация δ при звездно време s (часове). */
export function raDecToHorizon(
  latitude: number,
  siderealHours: number,
  raHours: number,
  declination: number
): Vec3 {
  return hourAngleToHorizon(
    latitude,
    declination,
    (siderealHours - raHours) * 15
  );
}

/** Точка от еклиптиката с еклиптична дължина λ (в градуси). */
export function eclipticToHorizon(
  latitude: number,
  siderealHours: number,
  longitude: number
): Vec3 {
  const l = longitude * DEG;
  const e = OBLIQUITY * DEG;
  const x = Math.cos(l);
  const y = Math.sin(l) * Math.cos(e);
  const z = Math.sin(l) * Math.sin(e);
  const ra = (Math.atan2(y, x) / DEG + 360) % 360;
  const dec = Math.asin(z) / DEG;
  return raDecToHorizon(latitude, siderealHours, ra / 15, dec);
}

/** Височина h и азимут A (от север през изток) в градуси. */
export function altAz(v: Vec3) {
  const alt = Math.asin(Math.max(-1, Math.min(1, v[2]))) / DEG;
  const az = (Math.atan2(v[1], -v[0]) / DEG + 360) % 360;
  return { alt, az };
}

export type StarKind = 'circumpolar' | 'rising' | 'never';

/** Незалязваща, изгряваща и залязваща или неизгряваща звезда. */
export function starKind(latitude: number, declination: number): StarKind {
  if (latitude >= 0) {
    if (declination >= 90 - latitude) return 'circumpolar';
    if (declination <= latitude - 90) return 'never';
  } else {
    if (declination <= -90 - latitude) return 'circumpolar';
    if (declination >= 90 + latitude) return 'never';
  }
  return 'rising';
}

export const STAR_KIND_COLORS: Record<StarKind, string> = {
  circumpolar: 'rgb(56, 189, 248)',
  rising: 'rgb(250, 204, 21)',
  never: 'rgb(148, 163, 184)',
};

export const STAR_KIND_LABELS: Record<StarKind, string> = {
  circumpolar: 'незалязваща (циркумполярна)',
  rising: 'изгрява и залязва',
  never: 'никога не изгрява',
};

/** Разделя последователност от точки на непрекъснати части с еднакъв ключ. */
export function splitRuns<T, K>(points: T[], key: (p: T) => K) {
  const runs: { key: K; points: T[] }[] = [];
  points.forEach((p, i) => {
    const k = key(p);
    const last = runs[runs.length - 1];
    if (last && last.key === k) {
      last.points.push(p);
    } else {
      // Припокриваме с предишната точка, за да няма прекъсване
      runs.push({ key: k, points: i > 0 ? [points[i - 1], p] : [p] });
    }
  });
  return runs;
}

export function formatHours(hours: number) {
  const h = ((hours % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

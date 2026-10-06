import { DEG, OBLIQUITY } from './skyMath';

// Опростен модел на годишното движение на Слънцето (точност ±1 ден).
// day е пореден ден от годината, 0 = 1 януари.

const TROPICAL_YEAR = 365.2422;
const VERNAL_EQUINOX_DAY = 78.5; // ≈ 20 март
const PERIHELION_DAY = 2; // ≈ 3 януари
const ECCENTRICITY = 0.0167;
export const AU_MILLION_KM = 149.6;

export const SIDEREAL_DAY_HOURS = 23.9345;

/** Еклиптична дължина на Слънцето в градуси. */
export function sunLongitude(day: number) {
  return (
    (((((day - VERNAL_EQUINOX_DAY) / TROPICAL_YEAR) * 360) % 360) + 360) % 360
  );
}

/** Деклинация на Слънцето в градуси. */
export function sunDeclination(day: number) {
  return (
    Math.asin(Math.sin(OBLIQUITY * DEG) * Math.sin(sunLongitude(day) * DEG)) /
    DEG
  );
}

/** Разстояние Земя – Слънце в AU. */
export function sunDistance(day: number) {
  return (
    1 -
    ECCENTRICITY * Math.cos(((day - PERIHELION_DAY) / 365.2564) * 2 * Math.PI)
  );
}

/** Продължителност на деня в часове (без рефракция): cos t₀ = −tg φ · tg δ. */
export function dayLength(latitude: number, declination: number) {
  const c = -Math.tan(latitude * DEG) * Math.tan(declination * DEG);
  if (c <= -1) return 24;
  if (c >= 1) return 0;
  return (2 * Math.acos(c)) / DEG / 15;
}

/** Височина на Слънцето по пладне: h = 90° − |φ − δ|. */
export function noonAltitude(latitude: number, declination: number) {
  return 90 - Math.abs(latitude - declination);
}

const MONTHS = [
  'януари',
  'февруари',
  'март',
  'април',
  'май',
  'юни',
  'юли',
  'август',
  'септември',
  'октомври',
  'ноември',
  'декември',
];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const MONTH_STARTS = MONTH_DAYS.reduce<number[]>(
  (acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + MONTH_DAYS[i - 1]],
  []
);

export function monthShort(index: number) {
  return MONTHS[index].slice(0, 3);
}

export function formatDate(day: number) {
  let d = Math.floor(day) % 365;
  for (let m = 0; m < 12; m++) {
    if (d < MONTH_DAYS[m]) return `${d + 1} ${MONTHS[m]}`;
    d -= MONTH_DAYS[m];
  }
  return '';
}

export function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 60 ? `${h + 1}h 00m` : `${h}h ${String(m).padStart(2, '0')}m`;
}

/**
 * Път на осветената част от диск с радиус r (ортогонална проекция).
 * sx, sy – екранната проекция на посоката към Слънцето (y нагоре),
 * k – компонентата ѝ към наблюдателя.
 */
export function litPath(
  cx: number,
  cy: number,
  r: number,
  sx: number,
  sy: number,
  k: number
) {
  if (Math.hypot(sx, sy) < 1e-6) {
    return k > 0
      ? `M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy} A ${r},${r} 0 1,1 ${cx - r},${cy}`
      : '';
  }
  // Работим в завъртяна система, където Слънцето е надясно
  const angle = Math.atan2(-sy, sx);
  const rot = (x: number, y: number) => ({
    x: cx + x * Math.cos(angle) - y * Math.sin(angle),
    y: cy + x * Math.sin(angle) + y * Math.cos(angle),
  });
  const top = rot(0, -r);
  const bottom = rot(0, r);
  const deg = angle / DEG;
  const rx = Math.max(0.01, r * Math.abs(k));
  return (
    `M ${top.x},${top.y} A ${r},${r} ${deg} 0,1 ${bottom.x},${bottom.y} ` +
    `A ${rx},${r} ${deg} 0,${k > 0 ? 1 : 0} ${top.x},${top.y} Z`
  );
}

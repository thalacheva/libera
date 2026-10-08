// Обща геометрия и модели за диаграмата на Херцшпрунг–Ръсел (Лекция 19).

import { T_SUN } from './starData';

export const LOG_T_HOT = Math.log10(45000);
export const LOG_T_COOL = Math.log10(2400);
export const LOG_L_MIN = -4.5;
export const LOG_L_MAX = 6.5;

/** Създава функциите за чертане на HR диаграма в правоъгълник. Температурата расте наляво! */
export function hrAxes(x0: number, x1: number, y0: number, y1: number) {
  const x = (T: number) => x0 + ((LOG_T_HOT - Math.log10(T)) / (LOG_T_HOT - LOG_T_COOL)) * (x1 - x0);
  const y = (L: number) => y1 - ((Math.log10(L) - LOG_L_MIN) / (LOG_L_MAX - LOG_L_MIN)) * (y1 - y0);
  return { x, y };
}

/** Светимост от радиус и температура (в слънчеви единици). */
export const lumOf = (R: number, T: number) => R * R * (T / T_SUN) ** 4;

// ---------- Главна последователност като функция на масата ----------

/** Светимост (L☉) на звезда от главната последователност с маса M (M☉). */
export function msLuminosity(M: number) {
  if (M < 0.43) return 0.23 * M ** 2.3;
  if (M < 2) return M ** 4;
  if (M < 55) return 1.4 * M ** 3.5;
  return 32000 * M;
}

/** Радиус (R☉) на звезда от главната последователност. */
export const msRadius = (M: number) => (M < 1 ? M ** 0.8 : M ** 0.57);

/** Температура на повърхността (K) от L = R²(T/T☉)⁴. */
export const msTemperature = (M: number) => T_SUN * (msLuminosity(M) / msRadius(M) ** 2) ** 0.25;

/** Време на главната последователност в години: горивото ∝ M, разходът ∝ L. */
export const msLifetime = (M: number) => (1e10 * M) / msLuminosity(M);

/** Маса, чийто живот на главната последователност е t години (търсим с бисекция). */
export function turnoffMass(t: number) {
  let lo = 0.08;
  let hi = 150;
  for (let i = 0; i < 60; i++) {
    const mid = Math.sqrt(lo * hi);
    if (msLifetime(mid) > t) lo = mid;
    else hi = mid;
  }
  return Math.sqrt(lo * hi);
}

// ---------- Синтетични звезди ----------

/** Детерминирано псевдослучайно число в [0, 1). */
export function rnd(n: number) {
  const x = Math.sin(n * 91.345 + 47.853) * 43758.5453;
  return x - Math.floor(x);
}

export type Dot = { T: number; L: number; kind: 'ms' | 'giant' | 'supergiant' | 'wd' };

/** Звезда от главната последователност с маса M и малко разсейване. */
export function msDot(M: number, seed: number): Dot {
  const T = msTemperature(M) * (1 + (rnd(seed) - 0.5) * 0.06);
  const L = msLuminosity(M) * 10 ** ((rnd(seed + 1) - 0.5) * 0.25);
  return { T, L, kind: 'ms' };
}

/** Червен гигант: по клона на гигантите от ~5200 K към ~3500 K. */
export function giantDot(seed: number): Dot {
  const u = rnd(seed);
  const T = 5200 - u * 1700 + (rnd(seed + 1) - 0.5) * 300;
  const L = 10 ** (1.2 + u * 2 + (rnd(seed + 2) - 0.5) * 0.5);
  return { T, L, kind: 'giant' };
}

/** Свръхгигант: почти хоризонтална ивица с L ~ 10⁴–10⁶. */
export function supergiantDot(seed: number): Dot {
  const T = 10 ** (Math.log10(3400) + rnd(seed) * (Math.log10(30000) - Math.log10(3400)));
  const L = 10 ** (4.2 + rnd(seed + 1) * 1.5);
  return { T, L, kind: 'supergiant' };
}

/** Бяло джудже: радиус ~0,01 R☉. */
export function wdDot(seed: number): Dot {
  const T = 10 ** (Math.log10(5000) + rnd(seed) ** 2 * (Math.log10(40000) - Math.log10(5000))); // повечето са стари и хладни
  const R = 0.009 + (rnd(seed + 1) - 0.5) * 0.004;
  return { T, L: lumOf(R, T), kind: 'wd' };
}

/** Маса по начална функция на масите (повечето звезди са малки), m ∈ [0,08; mMax]. */
export function imfMass(seed: number, mMax = 60) {
  // Степенен закон dN/dM ∝ M^(−2,35) (Салпитър), обърнат аналитично
  const a = -1.35;
  const lo = 0.08 ** a;
  const hi = mMax ** a;
  return (lo + rnd(seed) * (hi - lo)) ** (1 / a);
}

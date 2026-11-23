// Преобучаване и оценка: нагласяне на полином от различна степен и броене на грешките на класификатор.

import { mulberry32 } from '../history/rollouts';

export type XY = { x: number; y: number };

/** Истинската зависимост, която моделът не знае. */
export const truth = (x: number) => 0.8 * Math.sin(1.6 * Math.PI * x) + 0.4 * x;

/** `n` измервания на истинската зависимост с шум, за x от −1 до 1. */
export function makeMeasurements(n: number, seed: number, noise = 0.25): XY[] {
  const random = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  return Array.from({ length: n }, (_, i) => {
    const x = -0.97 + (1.94 * (i + random() * 0.8)) / n;
    return { x, y: truth(x) + noise * normal() };
  });
}

/** Полиномите на Чебишов T₀…T_d в точката x – по-устойчива основа от степените 1, x, x², … */
function basis(x: number, degree: number): number[] {
  const t = [1, x];
  for (let k = 2; k <= degree; k++) t.push(2 * x * t[k - 1] - t[k - 2]);
  return t.slice(0, degree + 1);
}

/** Решава системата A·c = b с метода на Гаус с избор на главен елемент. */
function solve(a: number[][], b: number[]): number[] {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r][col] / m[col][col];
      for (let k = col; k <= n; k++) m[r][k] -= f * m[col][k];
    }
  }
  return m.map((row, i) => row[n] / row[i]);
}

/** Полиномът от дадена степен с най-малка средна квадратична грешка върху данните. */
export function fitPolynomial(data: XY[], degree: number): (x: number) => number {
  const rows = data.map(p => basis(p.x, degree));
  const n = degree + 1;
  const ata = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? 1e-9 : 0)));
  const aty = Array.from({ length: n }, (_, i) => rows.reduce((s, r, k) => s + r[i] * data[k].y, 0));
  const c = solve(ata, aty);
  return x => basis(x, degree).reduce((s, v, i) => s + c[i] * v, 0);
}

export const meanSquaredError = (data: XY[], f: (x: number) => number) => data.reduce((s, p) => s + (p.y - f(p.x)) ** 2, 0) / data.length;

// ---------- Класификатор с праг ----------

export type Scored = { score: number; positive: boolean };

/** Оценки от 0 до 1, които един модел дава на `n` писма; спамът получава по-високи оценки, но двете групи се застъпват. */
export function makeScores(n: number, share: number, seed: number): Scored[] {
  const random = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  return Array.from({ length: n }, (_, i) => {
    const positive = i < Math.round(n * share);
    const score = Math.min(0.99, Math.max(0.01, (positive ? 0.68 : 0.3) + 0.17 * normal()));
    return { score, positive };
  });
}

export type Counts = { tp: number; fp: number; fn: number; tn: number };

export function confusion(items: Scored[], threshold: number): Counts {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const it of items) {
    if (it.score >= threshold) c[it.positive ? 'tp' : 'fp']++;
    else c[it.positive ? 'fn' : 'tn']++;
  }
  return c;
}

export const metrics = (c: Counts) => ({
  accuracy: (c.tp + c.tn) / (c.tp + c.fp + c.fn + c.tn),
  precision: c.tp + c.fp ? c.tp / (c.tp + c.fp) : 1,
  recall: c.tp + c.fn ? c.tp / (c.tp + c.fn) : 1,
});

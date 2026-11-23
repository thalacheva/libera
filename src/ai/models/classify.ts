// Примерни набори от точки в два класа и два прости класификатора: k най-близки съседи и логистична регресия.

import { mulberry32 } from '../history/rollouts';

export type Pt = { x: number; y: number; c: 0 | 1 };
export type DatasetId = 'groups' | 'ring' | 'moons' | 'noisy';

export const DATASETS: { id: DatasetId; label: string }[] = [
  { id: 'groups', label: 'две групи' },
  { id: 'ring', label: 'кръг в кръг' },
  { id: 'moons', label: 'две дъги' },
];

/** За дърветата: вместо чистите „две групи“ – две силно застъпващи се групи. */
export const NOISY_DATASETS: { id: DatasetId; label: string }[] = [{ id: 'noisy', label: 'две застъпени групи' }, ...DATASETS.slice(1)];

/** `n` точки в квадрата [0; 10]² – винаги едни и същи за дадено `seed`. */
export function makeData(id: DatasetId, n: number, seed: number): Pt[] {
  const random = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const clamp = (v: number) => Math.min(9.8, Math.max(0.2, v));
  return Array.from({ length: n }, (_, i) => {
    const c = (i % 2) as 0 | 1;
    let x: number;
    let y: number;
    if (id === 'groups') {
      x = (c ? 6.4 : 3.6) + 1.35 * normal();
      y = (c ? 6.2 : 3.9) + 1.35 * normal();
    } else if (id === 'noisy') {
      // Две групи, които се застъпват силно – няма граница без грешки
      x = (c ? 6.1 : 3.9) + 1.7 * normal();
      y = (c ? 5.8 : 4.2) + 1.7 * normal();
    } else if (id === 'ring') {
      const a = 2 * Math.PI * random();
      const r = c ? 1.6 * Math.sqrt(random()) : 3.2 + 1.1 * random();
      x = 5 + r * Math.cos(a);
      y = 5 + r * Math.sin(a);
    } else {
      const a = Math.PI * random();
      x = c ? 6.3 - 2.6 * Math.cos(a) : 3.7 + 2.6 * Math.cos(a);
      y = c ? 4.6 - 2.6 * Math.sin(a) + 1.3 : 5.4 + 2.6 * Math.sin(a) - 1.3;
      x += 0.35 * normal();
      y += 0.35 * normal();
    }
    return { x: clamp(x), y: clamp(y), c };
  });
}

/** Делът на единиците сред k-те най-близки точки (евклидово разстояние). */
export function knnShare(data: Pt[], k: number, x: number, y: number): number {
  const near = data
    .map(p => ({ d: (p.x - x) ** 2 + (p.y - y) ** 2, c: p.c }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
  return near.reduce((s, p) => s + p.c, 0) / near.length;
}

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export type Logistic = { w1: number; w2: number; b: number };
export const logisticProb = (m: Logistic, x: number, y: number) => sigmoid(m.w1 * x + m.w2 * y + m.b);

/** `steps` стъпки градиентно спускане за логистична регресия с два признака. */
export function trainLogistic(m: Logistic, data: Pt[], steps: number, rate = 0.05): Logistic {
  let { w1, w2, b } = m;
  for (let s = 0; s < steps; s++) {
    let g1 = 0;
    let g2 = 0;
    let gb = 0;
    for (const p of data) {
      const e = sigmoid(w1 * p.x + w2 * p.y + b) - p.c;
      g1 += e * p.x;
      g2 += e * p.y;
      gb += e;
    }
    w1 -= (rate * g1) / data.length;
    w2 -= (rate * g2) / data.length;
    b -= (rate * gb) / data.length;
  }
  return { w1, w2, b };
}

/** Дял на вярно класифицираните точки; `prob` връща вероятността за клас 1. */
export const accuracy = (data: Pt[], prob: (x: number, y: number) => number) => data.filter(p => (prob(p.x, p.y) > 0.5 ? 1 : 0) === p.c).length / data.length;

/** Оси за графиките с тези набори. */
export const AXIS = { x: [0, 10] as [number, number], y: [0, 10] as [number, number], xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 2, 4, 6, 8, 10] };
export const pct = (v: number) => `${Math.round(v * 100)}%`;

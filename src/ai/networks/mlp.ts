// Малка мрежа 2 → H → 1: скрит слой с tanh (или без активация), изход със сигмоида, логаритмична загуба.
// Обучава се с градиентно спускане върху всички примери; градиентите идват от обратно разпространение.

import { mulberry32 } from '../history/rollouts';
import { type Pt } from '../models/classify';

export type Activation = 'tanh' | 'linear';

export type Mlp = {
  act: Activation;
  /** w1[j] = [тегло от x₁, тегло от x₂] за скрит неврон j */
  w1: [number, number][];
  b1: number[];
  /** w2[j] – теглото от скрит неврон j към изхода */
  w2: number[];
  b2: number;
};

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Признаците са в [0; 10] – изместваме ги около нулата, за да тръгне спускането по-лесно (урокът „Градиентно спускане“). */
const norm = (v: number) => (v - 5) / 2.5;

/** Случайни начални тегла – едни и същи за дадено `seed`. */
export function randomMlp(hidden: number, act: Activation, seed: number): Mlp {
  const r = mulberry32(seed);
  const u = (k: number) => (2 * r() - 1) * k;
  return {
    act,
    w1: Array.from({ length: hidden }, () => [u(1.5), u(1.5)] as [number, number]),
    b1: Array.from({ length: hidden }, () => u(0.5)),
    w2: Array.from({ length: hidden }, () => u(1)),
    b2: 0,
  };
}

/** Стойностите на скритите неврони за точка (x; y) от полето [0; 10]². */
export function hiddenValues(n: Mlp, x: number, y: number): number[] {
  const a = norm(x);
  const b = norm(y);
  return n.w1.map((w, j) => {
    const z = w[0] * a + w[1] * b + n.b1[j];
    return n.act === 'tanh' ? Math.tanh(z) : z;
  });
}

/** Вероятността за клас 1. */
export function mlpProb(n: Mlp, x: number, y: number): number {
  const h = hiddenValues(n, x, y);
  let z = n.b2;
  for (let j = 0; j < h.length; j++) z += n.w2[j] * h[j];
  return sigmoid(z);
}

/** Средна логаритмична загуба върху набора. */
export function mlpLoss(n: Mlp, data: Pt[]): number {
  let s = 0;
  for (const p of data) {
    const q = Math.min(1 - 1e-9, Math.max(1e-9, mlpProb(n, p.x, p.y)));
    s -= p.c ? Math.log(q) : Math.log(1 - q);
  }
  return s / data.length;
}

/** `steps` стъпки градиентно спускане върху всички примери. */
export function trainMlp(start: Mlp, data: Pt[], steps: number, rate = 0.3): Mlp {
  const H = start.w1.length;
  const n: Mlp = { act: start.act, w1: start.w1.map(w => [w[0], w[1]] as [number, number]), b1: [...start.b1], w2: [...start.w2], b2: start.b2 };
  for (let s = 0; s < steps; s++) {
    const g1 = Array.from({ length: H }, () => [0, 0]);
    const gb1 = new Array<number>(H).fill(0);
    const g2 = new Array<number>(H).fill(0);
    let gb2 = 0;
    for (const p of data) {
      const a = norm(p.x);
      const b = norm(p.y);
      const h = hiddenValues(n, p.x, p.y);
      let z = n.b2;
      for (let j = 0; j < H; j++) z += n.w2[j] * h[j];
      // Сигмоида с логаритмична загуба: сигналът на изхода е (предсказание − верен отговор)
      const dOut = sigmoid(z) - p.c;
      gb2 += dOut;
      for (let j = 0; j < H; j++) {
        g2[j] += dOut * h[j];
        // Назад през теглото w2[j] и през производната на активацията: 1 − h² за tanh, 1 без активация
        const dHidden = dOut * n.w2[j] * (n.act === 'tanh' ? 1 - h[j] * h[j] : 1);
        g1[j][0] += dHidden * a;
        g1[j][1] += dHidden * b;
        gb1[j] += dHidden;
      }
    }
    const k = rate / data.length;
    for (let j = 0; j < H; j++) {
      n.w1[j][0] -= k * g1[j][0];
      n.w1[j][1] -= k * g1[j][1];
      n.b1[j] -= k * gb1[j];
      n.w2[j] -= k * g2[j];
    }
    n.b2 -= k * gb2;
  }
  return n;
}

/** Брой параметри на мрежа 2 → H → 1: 2H тегла + H отмествания в скрития слой, H тегла + 1 отместване на изхода. */
export const paramCount = (hidden: number) => 4 * hidden + 1;

// ---------- Приближаване на функция с „стъпала“ от сигмоиди ----------

export type Target = { id: string; label: string; f: (x: number) => number };

export const TARGETS: Target[] = [
  { id: 'wave', label: 'вълна', f: x => 0.5 + 0.35 * Math.sin(2.5 * Math.PI * x) },
  { id: 'hills', label: 'хълмове', f: x => 0.5 + 0.25 * Math.sin(3 * Math.PI * x) + 0.2 * Math.cos(7 * Math.PI * x) * x },
  { id: 'tent', label: 'зъбци', f: x => 0.15 + 0.7 * Math.abs(((2.5 * x) % 1) - 0.5) * 2 },
  { id: 'jump', label: 'скок', f: x => (x < 0.4 ? 0.25 : 0.8) - 0.15 * x },
];

/**
 * Мрежа с един скрит слой от `n` сигмоиди, построена на ръка (без обучение): интервалът [0; 1] се дели на n части,
 * неврон i „се включва“ в средата на част i и добавя към изхода разликата между стойностите на функцията в двата ѝ края.
 * `sharp` е стръмността на сигмоидите, измерена в ширини на една част.
 */
export function stepNet(f: (x: number) => number, n: number, sharp: number) {
  const units = Array.from({ length: n }, (_, i) => ({ center: (i + 0.5) / n, slope: sharp * n, weight: f((i + 1) / n) - f(i / n) }));
  const base = f(0);
  const value = (x: number) => units.reduce((s, u) => s + u.weight * sigmoid(u.slope * (x - u.center)), base);
  return { units, base, value };
}

/** Средна абсолютна разлика между функцията и мрежата в 200 точки от [0; 1]. */
export function approxError(f: (x: number) => number, g: (x: number) => number): number {
  let s = 0;
  for (let i = 0; i <= 200; i++) s += Math.abs(f(i / 200) - g(i / 200));
  return s / 201;
}

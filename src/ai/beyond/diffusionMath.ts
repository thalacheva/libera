// Дифузия в малък мащаб: график на шума, „идеална мрежа“ за смес от гаусови петна и обратният процес стъпка по стъпка.

import { mulberry32 } from '../history/rollouts';

/** Брой стъпки на зашумяването и дял на шума, добавян на всяка стъпка (дисперсията β). */
export const STEPS = 40;
export const BETA = 0.1;

/** ᾱ_t – каква част от дисперсията на сигнала е останала след t стъпки. */
export const alphaBar = (t: number) => Math.pow(1 - BETA, t);
/** Множителят пред оригинала: √ᾱ_t. */
export const signal = (t: number) => Math.sqrt(alphaBar(t));
/** Множителят пред шума: √(1 − ᾱ_t). */
export const noise = (t: number) => Math.sqrt(1 - alphaBar(t));

/** n числа от стандартното нормално разпределение (метод на Бокс–Мюлер) с дадено начало на генератора. */
export function gaussians(seed: number, n: number): number[] {
  const rnd = mulberry32(seed);
  const out: number[] = [];
  while (out.length < n) {
    const u = Math.max(rnd(), 1e-12);
    const v = rnd();
    const r = Math.sqrt(-2 * Math.log(u));
    out.push(r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v));
  }
  return out.slice(0, n);
}

// ---------- Картинка 16 × 16 за лабораторията със зашумяването ----------

export const SIZE = 16;
const HOUSE = [
  '................',
  '...........++...',
  '..........++++..',
  '.......#...++...',
  '......###.......',
  '.....#####......',
  '....#######.....',
  '...#########....',
  '..###########...',
  '...#+++++++#....',
  '...#+##+++##....',
  '...#+##+++##....',
  '...#++++#+##....',
  '...#++++#+##....',
  '...#########....',
  '################',
];
/** Картинката като вектор от 256 числа между −1 (бяло) и 1 (черно). */
export const PICTURE: number[] = HOUSE.flatMap(row => [...row].map(c => (c === '#' ? 1 : c === '+' ? 0 : -1)));

/** Зашумената картинка x_t = √ᾱ_t · x_0 + √(1 − ᾱ_t) · ε. */
export const noisy = (x0: number[], eps: number[], t: number) => x0.map((v, i) => signal(t) * v + noise(t) * eps[i]);

export function correlation(a: number[], b: number[]) {
  const ma = a.reduce((s, v) => s + v, 0) / a.length;
  const mb = b.reduce((s, v) => s + v, 0) / b.length;
  let ab = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i++) {
    ab += (a[i] - ma) * (b[i] - mb);
    aa += (a[i] - ma) ** 2;
    bb += (b[i] - mb) ** 2;
  }
  return ab / Math.sqrt(aa * bb);
}

// ---------- Точки в равнината: данните са смес от малки гаусови петна ----------

/** Гаусово петно с център (x, y) и ширина s; share е делът му в сместа (по подразбиране всички са равни). */
export type Blob = { x: number; y: number; s: number; share?: number };
export type P = [number, number];

const ring = (n: number, r: number, s: number): Blob[] => Array.from({ length: n }, (_, i) => ({ x: r * Math.cos((2 * Math.PI * i) / n), y: r * Math.sin((2 * Math.PI * i) / n), s }));

/** Формите, които „данните“ очертават. */
export const SHAPES: { name: string; blobs: Blob[] }[] = [
  { name: 'кръг', blobs: ring(16, 1.4, 0.07) },
  {
    name: 'усмивка',
    blobs: [
      { x: -0.7, y: 0.8, s: 0.09 },
      { x: 0.7, y: 0.8, s: 0.09 },
      ...Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * (1.15 + (0.7 * i) / 8);
        return { x: 1.5 * Math.cos(a), y: 0.4 + 1.5 * Math.sin(a), s: 0.07 };
      }),
    ],
  },
  {
    name: 'две купчинки',
    blobs: [
      { x: -1.2, y: 0, s: 0.3 },
      { x: 1.2, y: 0, s: 0.3 },
    ],
  },
];

/** Тежестите на петната за точка p на стъпка t: кое петно най-вероятно е „произвело“ тази зашумена точка. */
function weights(p: P, t: number, blobs: Blob[]) {
  const ab = alphaBar(t);
  const k = Math.sqrt(ab);
  const logs = blobs.map(b => {
    const v = ab * b.s * b.s + 1 - ab;
    return -((p[0] - k * b.x) ** 2 + (p[1] - k * b.y) ** 2) / (2 * v) - Math.log(v) + Math.log(b.share ?? 1);
  });
  const m = Math.max(...logs);
  const e = logs.map(l => Math.exp(l - m));
  const sum = e.reduce((s, v) => s + v, 0);
  return e.map(v => v / sum);
}

/**
 * „Идеалната мрежа“: най-добрата възможна прогноза за шума в точка p на стъпка t,
 * когато данните са смес от петната blobs. Истинските модели учат приближение на тази функция с невронна мрежа.
 */
export function predictNoise(p: P, t: number, blobs: Blob[]): P {
  const ab = alphaBar(t);
  const k = Math.sqrt(ab);
  const w = weights(p, t, blobs);
  let gx = 0;
  let gy = 0;
  blobs.forEach((b, i) => {
    const v = ab * b.s * b.s + 1 - ab;
    gx += (w[i] * (k * b.x - p[0])) / v;
    gy += (w[i] * (k * b.y - p[1])) / v;
  });
  const n = Math.sqrt(1 - ab);
  return [-n * gx, -n * gy];
}

/** Насочване без класификатор: ε = ε_без + w · (ε_с − ε_без). */
export function guidedNoise(p: P, t: number, all: Blob[], wanted: Blob[], w: number): P {
  const u = predictNoise(p, t, all);
  const c = predictNoise(p, t, wanted);
  return [u[0] + w * (c[0] - u[0]), u[1] + w * (c[1] - u[1])];
}

/** Една стъпка назад: от x_t към x_{t−1} по прогнозата eps за шума и свеж шум z. */
export function stepBack(p: P, t: number, eps: P, z: P): P {
  const a = 1 - BETA;
  const c = BETA / noise(t);
  const sigma = t > 1 ? Math.sqrt((BETA * (1 - alphaBar(t - 1))) / (1 - alphaBar(t))) : 0;
  return [(p[0] - c * eps[0]) / Math.sqrt(a) + sigma * z[0], (p[1] - c * eps[1]) / Math.sqrt(a) + sigma * z[1]];
}

/**
 * Целият обратен процес за n точки: резултатът [k] са точките след k стъпки назад (k = 0 – чист шум, k = STEPS – готово).
 * predict е мрежата, която казва какъв шум има в точката.
 */
export function generate(n: number, seed: number, predict: (p: P, t: number) => P): P[][] {
  const g = gaussians(seed, 2 * n * (STEPS + 1));
  let pts: P[] = Array.from({ length: n }, (_, i) => [g[2 * i], g[2 * i + 1]]);
  const out: P[][] = [pts];
  for (let t = STEPS; t >= 1; t--) {
    const off = 2 * n * (STEPS - t + 1);
    pts = pts.map((p, i) => stepBack(p, t, predict(p, t), [g[off + 2 * i], g[off + 2 * i + 1]]));
    out.push(pts);
  }
  return out;
}

/** Индексът на най-близкото петно и разстоянието до центъра му. */
export function nearest(p: P, blobs: Blob[]): { i: number; d: number } {
  let best = 0;
  let d = Infinity;
  blobs.forEach((b, i) => {
    const r = Math.hypot(p[0] - b.x, p[1] - b.y);
    if (r < d) {
      d = r;
      best = i;
    }
  });
  return { i: best, d };
}

export const meanDistance = (pts: P[], blobs: Blob[]) => pts.reduce((s, p) => s + nearest(p, blobs).d, 0) / pts.length;

/** Средно отклонение на точките от общия им център – мярка за разнообразие. */
export function spread(pts: P[]) {
  if (pts.length === 0) return 0;
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return Math.sqrt(pts.reduce((s, p) => s + (p[0] - mx) ** 2 + (p[1] - my) ** 2, 0) / pts.length);
}

// ---------- Насочване: „котки“ и „кучета“ в равнината ----------

/** Три вида котки и три вида кучета; третият вид от всяка група е близо до другата („котка, която прилича на куче“). */
export const CATS: Blob[] = [
  { x: -1.5, y: 1.0, s: 0.28 },
  { x: -1.5, y: -1.0, s: 0.28 },
  { x: -0.45, y: 0, s: 0.28 },
];
export const DOGS: Blob[] = CATS.map(b => ({ x: -b.x, y: b.y, s: b.s }));
export const PETS: Blob[] = [...CATS, ...DOGS];
/** Колко от картинките с надпис „котка“ в обучаващите данни наистина са котки – надписите не са съвършени. */
export const CAPTION_ACCURACY = 0.75;
/** Какво е научил моделът за дадена заявка: най-вече исканото животно, но с примес от другото. */
export const withCaption = (cat: boolean): Blob[] => [...CATS.map(b => ({ ...b, share: cat ? CAPTION_ACCURACY : 1 - CAPTION_ACCURACY })), ...DOGS.map(b => ({ ...b, share: cat ? 1 - CAPTION_ACCURACY : CAPTION_ACCURACY }))];
export const KINDS = ['горе', 'долу', 'по средата'];

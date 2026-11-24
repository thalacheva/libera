// Малка мрежа с произволен брой слоеве за лабораториите на урока „Обучение на дълбоки мрежи“:
// начални тегла с избран мащаб, изправител или tanh, преки връзки, затихване на теглата, изключване на неврони.

import { mulberry32 } from '../history/rollouts';

export type Act = 'tanh' | 'relu';

export type Net = {
  /** W[l][j][i] – теглото от неврон i на слой l към неврон j на слой l + 1 */
  W: number[][][];
  b: number[][];
  act: Act;
  /** Преки връзки: всеки скрит слой с еднакъв брой входове и изходи пресмята a + f(Wa + b) */
  residual: boolean;
};

/** Числа с нормално разпределение (средно 0, разсейване 1) – винаги едни и същи за дадено `seed`. */
export function normalSource(seed: number) {
  const r = mulberry32(seed);
  return () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
}

/**
 * Мрежа със слоеве с размери `sizes`. Началните тегла са случайни с дисперсия `gain / n`,
 * където n е броят на входовете на неврона; отместванията са нули.
 */
export function makeNet(sizes: number[], act: Act, gain: number, seed: number, residual = false): Net {
  const normal = normalSource(seed);
  const W: number[][][] = [];
  const b: number[][] = [];
  for (let l = 0; l + 1 < sizes.length; l++) {
    const k = Math.sqrt(gain / sizes[l]);
    W.push(Array.from({ length: sizes[l + 1] }, () => Array.from({ length: sizes[l] }, () => k * normal())));
    b.push(new Array<number>(sizes[l + 1]).fill(0));
  }
  return { W, b, act, residual };
}

const f = (act: Act, z: number) => (act === 'relu' ? Math.max(0, z) : Math.tanh(z));
/** Производната на активиращата функция, изразена чрез сумата z и изхода a = f(z). */
const df = (act: Act, z: number, a: number) => (act === 'relu' ? (z > 0 ? 1 : 0) : 1 - a * a);

const isSkip = (n: Net, l: number) => n.residual && l < n.W.length - 1 && n.W[l].length === n.W[l][0].length;

type Trace = { a: number[][]; z: number[][]; fa: number[][]; mask: (number[] | null)[] };

/**
 * Права посока. Последният слой е без активираща функция (изходът е сумата z).
 * `drop` – вероятност за изключване на всеки скрит неврон; `random` дава числата за маските.
 */
export function forward(n: Net, x: number[], drop = 0, random?: () => number): Trace {
  const a = [x];
  const z: number[][] = [];
  const fa: number[][] = [];
  const mask: (number[] | null)[] = [];
  const last = n.W.length - 1;
  for (let l = 0; l <= last; l++) {
    const prev = a[l];
    const zl = n.W[l].map((w, j) => {
      let s = n.b[l][j];
      for (let i = 0; i < prev.length; i++) s += w[i] * prev[i];
      return s;
    });
    z.push(zl);
    if (l === last) {
      fa.push(zl);
      mask.push(null);
      a.push(zl);
      break;
    }
    let out = zl.map(v => f(n.act, v));
    fa.push(out);
    if (drop > 0 && random) {
      // Изключените неврони дават 0, останалите се усилват, за да се запази средната стойност
      const m = out.map(() => (random() < drop ? 0 : 1 / (1 - drop)));
      mask.push(m);
      out = out.map((v, j) => v * m[j]);
    } else mask.push(null);
    a.push(isSkip(n, l) ? out.map((v, j) => v + prev[j]) : out);
  }
  return { a, z, fa, mask };
}

export type Grads = { W: number[][][]; b: number[][]; /** signal[l] – средният размер на сигнала за грешка, който стига до изходите на слой l (1 е първият) */ signal: number[] };

export const rms = (v: number[]) => Math.sqrt(v.reduce((s, q) => s + q * q, 0) / v.length);

/** Обратна посока: от сигнала на изхода `dOut` (производната на загубата по изходните суми) към всички тегла. */
export function backward(n: Net, t: Trace, dOut: number[], g?: Grads): Grads {
  const L = n.W.length;
  const grads: Grads = g ?? { W: n.W.map(w => w.map(r => r.map(() => 0))), b: n.b.map(r => r.map(() => 0)), signal: new Array<number>(L).fill(0) };
  // dA – производната на загубата по изходите a[l + 1] на слой l
  let dA = dOut;
  for (let l = L - 1; l >= 0; l--) {
    grads.signal[l] += rms(dA);
    const last = l === L - 1;
    const m = t.mask[l];
    const dZ = last ? dA : dA.map((v, j) => v * (m ? m[j] : 1) * df(n.act, t.z[l][j], t.fa[l][j]));
    const prev = t.a[l];
    const dPrev = new Array<number>(prev.length).fill(0);
    for (let j = 0; j < dZ.length; j++) {
      const d = dZ[j];
      grads.b[l][j] += d;
      const w = n.W[l][j];
      const gw = grads.W[l][j];
      for (let i = 0; i < prev.length; i++) {
        gw[i] += d * prev[i];
        dPrev[i] += d * w[i];
      }
    }
    // Пряката връзка пренася сигнала назад непроменен
    if (isSkip(n, l)) for (let i = 0; i < dPrev.length; i++) dPrev[i] += dA[i];
    dA = dPrev;
  }
  return grads;
}

export type Sample = { x: number[]; t: number };
export type LossKind = 'mse' | 'log';

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Средна загуба върху набора: квадратична за регресия или логаритмична за два класа (изходът минава през сигмоида). */
export function lossOf(n: Net, data: Sample[], kind: LossKind): number {
  let s = 0;
  for (const p of data) {
    const y = forward(n, p.x).a[n.W.length][0];
    if (kind === 'mse') s += (y - p.t) ** 2;
    else {
      const q = Math.min(1 - 1e-9, Math.max(1e-9, sigmoid(y)));
      s -= p.t ? Math.log(q) : Math.log(1 - q);
    }
  }
  return s / data.length;
}

/** Вероятността за клас 1 според мрежата (за двоична класификация). */
export const probOf = (n: Net, x: number[]) => sigmoid(forward(n, x).a[n.W.length][0]);

export const accuracyOf = (n: Net, data: Sample[]) => data.filter(p => (probOf(n, p.x) > 0.5 ? 1 : 0) === p.t).length / data.length;

/** Градиентът на средната загуба върху набора (и средният сигнал за грешка по слоеве). */
export function gradOf(n: Net, data: Sample[], kind: LossKind, drop = 0, random?: () => number): Grads {
  let g: Grads | undefined;
  for (const p of data) {
    const t = forward(n, p.x, drop, random);
    const y = t.a[n.W.length][0];
    g = backward(n, t, [kind === 'mse' ? 2 * (y - p.t) : sigmoid(y) - p.t], g);
  }
  const k = 1 / data.length;
  const out = g as Grads;
  return { W: out.W.map(w => w.map(r => r.map(v => v * k))), b: out.b.map(r => r.map(v => v * k)), signal: out.signal.map(v => v * k) };
}

export type TrainOptions = { rate: number; kind: LossKind; /** коефициент на затихване на теглата λ */ decay?: number; /** вероятност за изключване на скрит неврон */ drop?: number; random?: () => number; /** инерция: каква част от предишната стъпка се запазва */ momentum?: number };
export type State = { net: Net; vW: number[][][]; vb: number[][] };

export const startState = (net: Net): State => ({ net, vW: net.W.map(w => w.map(r => r.map(() => 0))), vb: net.b.map(r => r.map(() => 0)) });

/** Една стъпка градиентно спускане върху целия набор (с инерция, затихване на теглата и изключване на неврони по избор). */
export function trainStep(s: State, data: Sample[], o: TrainOptions): State {
  const g = gradOf(s.net, data, o.kind, o.drop ?? 0, o.random);
  const mu = o.momentum ?? 0;
  const decay = o.decay ?? 0;
  const vW = s.vW.map((w, l) => w.map((r, j) => r.map((v, i) => mu * v - o.rate * (g.W[l][j][i] + decay * s.net.W[l][j][i]))));
  const vb = s.vb.map((r, l) => r.map((v, j) => mu * v - o.rate * g.b[l][j]));
  return {
    net: { ...s.net, W: s.net.W.map((w, l) => w.map((r, j) => r.map((v, i) => v + vW[l][j][i]))), b: s.net.b.map((r, l) => r.map((v, j) => v + vb[l][j])) },
    vW,
    vb,
  };
}

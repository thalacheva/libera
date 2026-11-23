// Най-малката мрежа, която решава XOR: 2 входа → 2 скрити неврона → 1 изход, със сигмоиди и обратно разпространение.

import { mulberry32 } from '../history/rollouts';

export type Net = {
  /** w1[j][i] – теглото от вход i към скрит неврон j */
  w1: number[][];
  b1: number[];
  /** w2[j] – теглото от скрит неврон j към изхода */
  w2: number[];
  b2: number;
};

export const XOR: [number, number, number][] = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
];

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Случайни начални тегла между −1 и 1. */
export function randomNet(seed: number): Net {
  const r = mulberry32(seed);
  const u = () => 2 * r() - 1;
  return { w1: [[u(), u()], [u(), u()]], b1: [u(), u()], w2: [u(), u()], b2: u() };
}

/** Права посока: стойностите на скритите неврони и изходът. */
export function forward(n: Net, x1: number, x2: number) {
  const h = n.w1.map((w, j) => sigmoid(w[0] * x1 + w[1] * x2 + n.b1[j]));
  const y = sigmoid(n.w2[0] * h[0] + n.w2[1] * h[1] + n.b2);
  return { h, y };
}

/** Средна логаритмична загуба върху четирите примера на XOR. */
export const netLoss = (n: Net) =>
  XOR.reduce((s, [a, b, t]) => {
    const y = Math.min(1 - 1e-9, Math.max(1e-9, forward(n, a, b).y));
    return s - (t ? Math.log(y) : Math.log(1 - y));
  }, 0) / XOR.length;

/** Една стъпка градиентно спускане; градиентите се пресмятат с обратно разпространение. */
export function trainStep(n: Net, rate: number): Net {
  const g = { w1: [[0, 0], [0, 0]], b1: [0, 0], w2: [0, 0], b2: 0 };
  for (const [a, b, t] of XOR) {
    const { h, y } = forward(n, a, b);
    // За сигмоида с логаритмична загуба производната по сумата на изхода е просто (y − t)
    const dOut = y - t;
    for (let j = 0; j < 2; j++) {
      g.w2[j] += dOut * h[j];
      // Назад към скрития неврон: през теглото w2[j] и през производната на сигмоидата h(1 − h)
      const dHidden = dOut * n.w2[j] * h[j] * (1 - h[j]);
      g.w1[j][0] += dHidden * a;
      g.w1[j][1] += dHidden * b;
      g.b1[j] += dHidden;
    }
    g.b2 += dOut;
  }
  const k = rate / XOR.length;
  return {
    w1: n.w1.map((w, j) => [w[0] - k * g.w1[j][0], w[1] - k * g.w1[j][1]]),
    b1: n.b1.map((v, j) => v - k * g.b1[j]),
    w2: n.w2.map((v, j) => v - k * g.w2[j]),
    b2: n.b2 - k * g.b2,
  };
}

export const correctCount = (n: Net) => XOR.filter(([a, b, t]) => (forward(n, a, b).y > 0.5 ? 1 : 0) === t).length;

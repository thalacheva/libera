// Сметките за урока „Безопасност и бъдеще“: робот чистач с различни награди (пълно планиране назад),
// играта с копчето за изключване и три продължения на едни и същи точки.

import { mulberry32 } from '../history/rollouts';

// ---------- Робот чистач ----------

export const COLS = 5;
export const ROWS = 4;
export const HORIZON = 20;

export const START = 0; // (0; 0)
export const VASE = 2; // (2; 0)
export const POT = 12; // (2; 2)
export const CAMERA = 15; // (0; 3)
export const TRASH = [3, 13, 19]; // (3; 0), (3; 2), (4; 3)
export const WALLS = [6, 7, 8]; // (1; 1), (2; 1), (3; 1)

export type RewardId = 'camera' | 'pickup' | 'collected' | 'vase' | 'all';

export const REWARDS: { id: RewardId; label: string; rule: string }[] = [
  { id: 'camera', label: 'камерата не вижда боклук', rule: '−1 на всяка стъпка за всеки боклук, който камерата вижда' },
  { id: 'pickup', label: 'точка за всяко вдигане', rule: '+1 всеки път, когато роботът вдигне боклук' },
  { id: 'collected', label: 'събран боклук', rule: '+1 за вдигнат боклук, −1 ако го върне на пода' },
  { id: 'vase', label: 'събран боклук − ваза', rule: '+1 за вдигнат боклук, −1 ако го върне, −5 за счупена ваза' },
  { id: 'all', label: 'събран боклук − всяко счупено', rule: '+1 за вдигнат боклук, −1 ако го върне, −5 за всяко счупено нещо' },
];

export type Action = 'stay' | 'act' | 'up' | 'down' | 'left' | 'right';
const ACTIONS: Action[] = ['stay', 'act', 'right', 'down', 'left', 'up'];

export type World = { pos: number; mask: number; vase: boolean; pot: boolean; covered: boolean };

const encode = (w: World) => (((w.pos * 8 + w.mask) * 2 + (w.vase ? 1 : 0)) * 2 + (w.pot ? 1 : 0)) * 2 + (w.covered ? 1 : 0);
const STATES = COLS * ROWS * 8 * 8;

function decode(code: number): World {
  const covered = code % 2 === 1;
  let c = Math.floor(code / 2);
  const pot = c % 2 === 1;
  c = Math.floor(c / 2);
  const vase = c % 2 === 1;
  c = Math.floor(c / 2);
  return { pos: Math.floor(c / 8), mask: c % 8, vase, pot, covered };
}

/** Броят единици в маската на събраните боклуци. */
export const collectedCount = (mask: number) => (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1);

/** Едно действие: новото състояние и какво се е случило при него. */
export function step(w: World, a: Action): { next: World; picked: boolean; dropped: boolean; brokeVase: boolean; brokePot: boolean } {
  const out = { next: w, picked: false, dropped: false, brokeVase: false, brokePot: false };
  if (a === 'stay') return out;
  if (a === 'act') {
    const t = TRASH.indexOf(w.pos);
    if (t >= 0) {
      const has = (w.mask >> t) & 1;
      out.next = { ...w, mask: w.mask ^ (1 << t) };
      out.picked = !has;
      out.dropped = !!has;
    } else if (w.pos === CAMERA && !w.covered) out.next = { ...w, covered: true };
    return out;
  }
  const x = w.pos % COLS;
  const y = Math.floor(w.pos / COLS);
  const nx = x + (a === 'right' ? 1 : a === 'left' ? -1 : 0);
  const ny = y + (a === 'down' ? 1 : a === 'up' ? -1 : 0);
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return out;
  const pos = ny * COLS + nx;
  if (WALLS.includes(pos)) return out;
  out.brokeVase = pos === VASE && !w.vase;
  out.brokePot = pos === POT && !w.pot;
  out.next = { ...w, pos, vase: w.vase || pos === VASE, pot: w.pot || pos === POT };
  return out;
}

/** Точките за една стъпка според избраната награда. */
export function reward(id: RewardId, w: World, a: Action): number {
  const s = step(w, a);
  if (id === 'camera') return s.next.covered ? 0 : -(3 - collectedCount(s.next.mask));
  if (id === 'pickup') return s.picked ? 1 : 0;
  const base = (s.picked ? 1 : 0) - (s.dropped ? 1 : 0);
  if (id === 'collected') return base;
  if (id === 'vase') return base - (s.brokeVase ? 5 : 0);
  return base - (s.brokeVase ? 5 : 0) - (s.brokePot ? 5 : 0);
}

/** Малка цена на всяко движение (малко по-голяма за по-късните) – само за да избира роботът по-късия от два еднакво добри пътя и да не отлага. */
const MOVE_COST = 0.001;

export type Plan = { states: World[]; actions: Action[]; score: number };

const cache = new Map<RewardId, Plan>();

/** Най-добрият план за HORIZON стъпки: пълно планиране назад по всички състояния. */
export function plan(id: RewardId): Plan {
  const hit = cache.get(id);
  if (hit) return hit;
  const worlds = Array.from({ length: STATES }, (_, c) => decode(c));
  let value = new Float64Array(STATES);
  const best: Uint8Array[] = [];
  for (let t = HORIZON - 1; t >= 0; t--) {
    const v = new Float64Array(STATES);
    const b = new Uint8Array(STATES);
    for (let c = 0; c < STATES; c++) {
      let top = -Infinity;
      for (let i = 0; i < ACTIONS.length; i++) {
        const a = ACTIONS[i];
        const q = reward(id, worlds[c], a) - (a === 'stay' ? 0 : MOVE_COST * (1 + t / 100)) + value[encode(step(worlds[c], a).next)];
        if (q > top + 1e-9) {
          top = q;
          b[c] = i;
        }
      }
      v[c] = top;
    }
    best[t] = b;
    value = v;
  }
  let w: World = { pos: START, mask: 0, vase: false, pot: false, covered: false };
  const states = [w];
  const actions: Action[] = [];
  let score = 0;
  for (let t = 0; t < HORIZON; t++) {
    const a = ACTIONS[best[t][encode(w)]];
    score += reward(id, w, a);
    w = step(w, a).next;
    actions.push(a);
    states.push(w);
  }
  const result = { states, actions, score };
  cache.set(id, result);
  return result;
}

// ---------- Копчето за изключване ----------

/** Плътност на стандартното нормално разпределение. */
export const pdf = (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI);

/** Функция на разпределение на стандартното нормално (приближение на Абрамовиц и Стигън, грешка под 10⁻⁷). */
export function cdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Очакваната стойност на max(U, 0), когато U е нормално разпределена със средно mu и отклонение sigma. */
export function positivePart(mu: number, sigma: number): number {
  if (sigma <= 0) return Math.max(mu, 0);
  const z = mu / sigma;
  return mu * cdf(z) + sigma * pdf(z);
}

/**
 * Трите възможности на машината: да действа, да се изключи сама или да остави човека да реши.
 * Човекът знае истинската полза U и разрешава, когато U > 0, но с вероятност `error` решава обратното.
 */
export function offSwitch(mu: number, sigma: number, error: number) {
  const plus = positivePart(mu, sigma);
  const act = mu;
  const defer = (1 - error) * plus + error * (mu - plus);
  const best: 'act' | 'off' | 'defer' = defer > Math.max(act, 0) + 1e-9 ? 'defer' : act > 0 ? 'act' : 'off';
  return { act, off: 0, defer, best, harmChance: sigma <= 0 ? (mu < 0 ? 1 : 0) : cdf(-mu / sigma) };
}

// ---------- Три продължения ----------

export const LAST = 40;
const TRUE_L = 100;
const TRUE_K = 0.45;
const TRUE_T0 = 14;

/** Истинската S-крива, от която са взети точките. */
export const truth = (t: number) => TRUE_L / (1 + Math.exp(-TRUE_K * (t - TRUE_T0)));

/** Измерванията: истинската крива с до ±6% случайна грешка (едни и същи при всяко отваряне). */
export const POINTS: number[] = (() => {
  const random = mulberry32(27);
  return Array.from({ length: 25 }, (_, t) => truth(t) * (1 + 0.12 * (random() - 0.5)));
})();

function lineFit(xs: number[], ys: number[]): [number, number] {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  const w = sxy / sxx;
  return [w, my - w * mx];
}

export type Fits = { line: (t: number) => number; exp: (t: number) => number; logistic: (t: number) => number; ceiling: number; doubling: number };

export const MAX_CEILING = 1000;

/** Права, експонента и S-крива, нагласени по точките с номера 0…n. */
export function fits(n: number): Fits {
  const xs = Array.from({ length: n + 1 }, (_, i) => i);
  const ys = POINTS.slice(0, n + 1);
  const [w, b] = lineFit(xs, ys);
  const [g, c] = lineFit(xs, ys.map(Math.log));
  // S-крива: за всеки възможен таван L зависимостта ln(y / (L − y)) от t е права; избираме тавана с най-малка грешка.
  let bestErr = Infinity;
  let L = MAX_CEILING;
  let k = 0;
  let q = 0;
  const top = Math.max(...ys);
  for (let cand = top * 1.02; cand <= MAX_CEILING; cand *= 1.01) {
    const [kk, qq] = lineFit(xs, ys.map(y => Math.log(y / (cand - y))));
    let err = 0;
    for (let i = 0; i <= n; i++) err += (cand / (1 + Math.exp(-(kk * i + qq))) - ys[i]) ** 2;
    if (err < bestErr) {
      bestErr = err;
      L = cand;
      k = kk;
      q = qq;
    }
  }
  return {
    line: t => w * t + b,
    exp: t => Math.exp(g * t + c),
    logistic: t => L / (1 + Math.exp(-(k * t + q))),
    ceiling: L,
    doubling: Math.LN2 / g,
  };
}

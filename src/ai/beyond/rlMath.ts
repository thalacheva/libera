// Учене с подкрепление: многоръкият бандит, Q-учене в малък свят с клетки и възвръщаемост с отстъпка.

export { mulberry32 } from '../history/rollouts';

// ---------- Многоръкият бандит ----------

/** Скритите вероятности за печалба на четирите ръчки. */
export const ARMS = [0.4, 0.7, 0.2, 0.55];
export const ARM_NAMES = ['А', 'Б', 'В', 'Г'];

export type Bandit = { counts: number[]; wins: number[] };

export const newBandit = (): Bandit => ({ counts: ARMS.map(() => 0), wins: ARMS.map(() => 0) });

/** Оценката на ръчката: средната печалба досега (0, ако още не е дърпана). */
export const estimate = (b: Bandit, i: number) => (b.counts[i] ? b.wins[i] / b.counts[i] : 0);

/** Ръчката с най-висока оценка; при равенство – първата. */
export function greedyArm(b: Bandit): number {
  let best = 0;
  for (let i = 1; i < ARMS.length; i++) if (estimate(b, i) > estimate(b, best)) best = i;
  return best;
}

/** Едно дърпане на избрана ръчка. */
export function pull(b: Bandit, arm: number, random: () => number): Bandit {
  const win = random() < ARMS[arm] ? 1 : 0;
  return { counts: b.counts.map((c, i) => (i === arm ? c + 1 : c)), wins: b.wins.map((w, i) => (i === arm ? w + win : w)) };
}

/** ε-алчен избор: с вероятност ε – случайна ръчка, иначе – тази с най-висока оценка. */
export function epsGreedyArm(b: Bandit, eps: number, random: () => number): number {
  if (random() < eps) return Math.floor(random() * ARMS.length);
  return greedyArm(b);
}

export function runBandit(b: Bandit, eps: number, n: number, random: () => number): Bandit {
  let cur = b;
  for (let i = 0; i < n; i++) cur = pull(cur, epsGreedyArm(cur, eps, random), random);
  return cur;
}

export const totalPulls = (b: Bandit) => b.counts.reduce((s, c) => s + c, 0);
export const totalWins = (b: Bandit) => b.wins.reduce((s, c) => s + c, 0);
/** Очакваната печалба, изпусната спрямо това да дърпаш само най-добрата ръчка. */
export const regret = (b: Bandit) => b.counts.reduce((s, c, i) => s + c * (Math.max(...ARMS) - ARMS[i]), 0);

// ---------- Свят с клетки ----------

export const COLS = 5;
export const ROWS = 4;
export const cell = (x: number, y: number) => y * COLS + x;
export const START = cell(0, 3);
export const GOAL = cell(4, 0);
export const PIT = cell(3, 1);
export const WALLS = [cell(1, 1), cell(1, 2)];
/** Малка награда близо до старта – изкушението. */
export const SNACK = cell(2, 3);
export const GOAL_REWARD = 10;
export const PIT_REWARD = -10;
export const SNACK_REWARD = 1;
export const MAX_STEPS = 200;

/** Действията: нагоре, надясно, надолу, наляво. */
export const MOVES: [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
export const ARROWS = ['↑', '→', '↓', '←'];

export type QTable = number[][];
export const newQ = (): QTable => Array.from({ length: COLS * ROWS }, () => [0, 0, 0, 0]);
export const isEnd = (s: number) => s === GOAL || s === PIT || s === SNACK;
export const rewardAt = (s: number) => (s === GOAL ? GOAL_REWARD : s === PIT ? PIT_REWARD : s === SNACK ? SNACK_REWARD : 0);

/** Средата: от клетка s с действие a. В стена или извън полето агентът остава на място. */
export function move(s: number, a: number): { next: number; reward: number; done: boolean } {
  const x = (s % COLS) + MOVES[a][0];
  const y = Math.floor(s / COLS) + MOVES[a][1];
  const inside = x >= 0 && x < COLS && y >= 0 && y < ROWS && !WALLS.includes(cell(x, y));
  const next = inside ? cell(x, y) : s;
  return { next, reward: rewardAt(next), done: isEnd(next) };
}

/** Най-добрите действия в клетката според таблицата (може да са няколко с равна стойност). */
export function bestActions(q: QTable, s: number): number[] {
  const m = Math.max(...q[s]);
  return [0, 1, 2, 3].filter(a => q[s][a] === m);
}

export function chooseAction(q: QTable, s: number, eps: number, random: () => number): number {
  if (random() < eps) return Math.floor(random() * 4);
  const best = bestActions(q, s);
  return best[Math.floor(random() * best.length)];
}

export type Update = { s: number; a: number; reward: number; next: number; done: boolean; old: number; nextMax: number; target: number; value: number };

/** Една стъпка на Q-ученето: Q(s,a) ← Q(s,a) + α·(r + γ·max Q(s′,·) − Q(s,a)). Променя таблицата на място. */
export function qStep(q: QTable, s: number, a: number, alpha: number, gamma: number): Update {
  const { next, reward, done } = move(s, a);
  const old = q[s][a];
  const nextMax = done ? 0 : Math.max(...q[next]);
  const target = reward + gamma * nextMax;
  const value = old + alpha * (target - old);
  q[s][a] = value;
  return { s, a, reward, next, done, old, nextMax, target, value };
}

/** Доиграва епизода от клетка s. Връща броя стъпки и къде е свършил. */
export function runEpisode(q: QTable, from: number, alpha: number, gamma: number, eps: number, random: () => number, done = 0): { steps: number; end: number; last: Update | null } {
  let s = from;
  let steps = done;
  let last: Update | null = null;
  while (!isEnd(s) && steps < MAX_STEPS) {
    last = qStep(q, s, chooseAction(q, s, eps, random), alpha, gamma);
    s = last.next;
    steps++;
  }
  return { steps, end: s, last };
}

/** Накъде води алчната политика от старта: крайната клетка и броят стъпки (null, ако не стига до край). */
export function greedyPath(q: QTable): { end: number; steps: number } | null {
  let s = START;
  for (let n = 0; n < COLS * ROWS; n++) {
    if (isEnd(s)) return { end: s, steps: n };
    if (bestActions(q, s).length > 1) return null;
    s = move(s, bestActions(q, s)[0]).next;
  }
  return null;
}

/** Най-добрата възможна стойност на всяка клетка – с итерация на уравнението на Белман. */
export function optimalValues(gamma: number): number[] {
  let v = Array.from({ length: COLS * ROWS }, () => 0);
  for (let it = 0; it < 100; it++) {
    v = v.map((_, s) => {
      if (isEnd(s) || WALLS.includes(s)) return 0;
      return Math.max(
        ...[0, 1, 2, 3].map(a => {
          const m = move(s, a);
          return m.reward + (m.done ? 0 : gamma * v[m.next]);
        }),
      );
    });
  }
  return v;
}

// ---------- Отстъпка ----------

/** Възвръщаемост: G = r₁ + γ·r₂ + γ²·r₃ + … */
export const discounted = (rewards: number[], gamma: number) => rewards.reduce((s, r, t) => s + r * gamma ** t, 0);

/** Днешната стойност на награда r, получена на стъпка номер k (k = 1 е следващата стъпка). */
export const worth = (r: number, k: number, gamma: number) => r * gamma ** (k - 1);

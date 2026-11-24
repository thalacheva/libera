// Помощни сметки за урока „Компютърно зрение“: рамки и IoU, потискане на дублиращите се рамки,
// и малък линеен класификатор върху картинки 12 × 12, с който се показват измамните примери и картата на закриването.

import { mulberry32 } from '../history/rollouts';

// ---------- Рамки ----------

export type Box = { x: number; y: number; w: number; h: number };
export type Scored = Box & { score: number };

export const area = (b: Box) => Math.max(0, b.w) * Math.max(0, b.h);

/** Лицето на общата част на две рамки (0, ако не се застъпват). */
export function intersection(a: Box, b: Box): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

/** Сечение върху обединение: 1 при пълно съвпадение, 0 без застъпване. */
export function iou(a: Box, b: Box): number {
  const i = intersection(a, b);
  const u = area(a) + area(b) - i;
  return u > 0 ? i / u : 0;
}

export type NmsStep = { keep: number; dropped: number[] };

/**
 * Потискане на дублиращите се рамки: взима се рамката с най-висока оценка, махат се всички,
 * които се застъпват с нея с IoU над прага, и така докато останат неразгледани рамки.
 * Връща стъпките поред (индекси в подадения масив).
 */
export function nms(boxes: Scored[], threshold: number): NmsStep[] {
  let left = boxes.map((_, i) => i).sort((p, q) => boxes[q].score - boxes[p].score);
  const steps: NmsStep[] = [];
  while (left.length) {
    const keep = left[0];
    const dropped = left.slice(1).filter(i => iou(boxes[keep], boxes[i]) > threshold);
    steps.push({ keep, dropped });
    left = left.slice(1).filter(i => !dropped.includes(i));
  }
  return steps;
}

/** Предложени рамки за сцена с три предмета: два застъпващи се вляво и един отделно вдясно (чертеж 640 × 320). */
export const CANDIDATES: Scored[] = [
  { x: 40, y: 70, w: 180, h: 180, score: 0.92 },
  { x: 55, y: 55, w: 180, h: 185, score: 0.81 },
  { x: 25, y: 90, w: 160, h: 170, score: 0.64 },
  { x: 150, y: 80, w: 180, h: 180, score: 0.88 },
  { x: 165, y: 65, w: 170, h: 185, score: 0.73 },
  { x: 440, y: 110, w: 140, h: 140, score: 0.79 },
  { x: 455, y: 95, w: 135, h: 150, score: 0.58 },
];

// ---------- Картинки 12 × 12 и линеен класификатор ----------

export const N = 12;
export const INK = 0.8;
export const PAPER = 0.2;

export type Shape = 'ring' | 'square';

/** Дали точката (c, r) е част от фигурата, изместена с (dx, dy). */
function inShape(shape: Shape, c: number, r: number, dx: number, dy: number): boolean {
  const u = c - 5.5 - dx;
  const v = r - 5.5 - dy;
  if (shape === 'ring') {
    const d = Math.hypot(u, v);
    return d > 2.7 && d < 4.4;
  }
  const d = Math.max(Math.abs(u), Math.abs(v));
  return d > 2.4 && d < 4.4;
}

/** Картинка без шум: фигурата е тъмна (0,8), фонът – светъл (0,2). По избор – „етикетче“ 2 × 2 в долния десен ъгъл. */
export function drawShape(shape: Shape, dx = 0, dy = 0, tag = false): number[] {
  const out: number[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) out.push(inShape(shape, c, r, dx, dy) || (tag && r >= N - 2 && c >= N - 2) ? INK : PAPER);
  return out;
}

export type Linear = { w: number[]; b: number };

export const score = (m: Linear, x: number[]) => x.reduce((s, v, i) => s + v * m.w[i], m.b);
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/**
 * Обучава логистична регресия да различава кръгче (клас 1) от квадратче (клас 0) по 40 зашумени и изместени примера от всеки клас.
 * При `tagged` всички кръгчета в обучаващите данни носят етикетче в ъгъла, а квадратчетата – не: пряк път, който моделът с радост използва.
 */
export function trainClassifier(tagged: boolean, seed = 7): Linear {
  const random = mulberry32(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const shift = () => Math.floor(random() * 3) - 1;
  const data: { x: number[]; t: number }[] = [];
  for (let i = 0; i < 120; i++) {
    const t = i % 2;
    const clean = drawShape(t ? 'ring' : 'square', shift(), shift(), tagged && t === 1);
    data.push({ x: clean.map(v => Math.min(1, Math.max(0, v + 0.15 * normal()))), t });
  }
  const w = new Array<number>(N * N).fill(0);
  let b = 0;
  for (let step = 0; step < 1500; step++) {
    const g = new Array<number>(N * N).fill(0);
    let gb = 0;
    for (const { x, t } of data) {
      const e = sigmoid(x.reduce((s, v, i) => s + v * w[i], b)) - t;
      for (let i = 0; i < x.length; i++) g[i] += e * x[i];
      gb += e;
    }
    for (let i = 0; i < w.length; i++) w[i] -= (0.5 * g[i]) / data.length;
    b -= (0.5 * gb) / data.length;
  }
  return { w, b };
}

const cache: Partial<Record<'clean' | 'tagged', Linear>> = {};
/** Обучените класификатори се пресмятат веднъж – при първото поискване. */
export function classifier(kind: 'clean' | 'tagged'): Linear {
  return (cache[kind] ??= trainClassifier(kind === 'tagged'));
}

/** Измамна промяна: всеки пиксел се мести с ε в посоката, която най-бързо сваля (или вдига) оценката. */
export function perturb(m: Linear, x: number[], eps: number, down: boolean): number[] {
  return x.map((v, i) => Math.min(1, Math.max(0, v + (down ? -1 : 1) * eps * Math.sign(m.w[i]))));
}

/** Най-малкото ε (със стъпка 0,005), при което знакът на оценката се обръща; null, ако до 0,5 не става. */
export function flipEps(m: Linear, x: number[]): number | null {
  const down = score(m, x) > 0;
  for (let k = 1; k <= 100; k++) {
    const eps = k * 0.005;
    if (score(m, perturb(m, x, eps, down)) > 0 !== down) return eps;
  }
  return null;
}

/** Картинката с лепенка в цвета на фона size × size с горен ляв ъгъл (c, r). */
export function occlude(x: number[], c: number, r: number, size: number): number[] {
  return x.map((v, i) => {
    const pc = i % N;
    const pr = Math.floor(i / N);
    return pc >= c && pc < c + size && pr >= r && pr < r + size ? PAPER : v;
  });
}

/** За всеки пиксел: средно с колко се променя оценката, когато лепенка, която го покрива, скрие мястото. */
export function occlusionMap(m: Linear, x: number[], size: number): number[] {
  const base = score(m, x);
  const sum = new Array<number>(N * N).fill(0);
  const count = new Array<number>(N * N).fill(0);
  for (let r = 0; r <= N - size; r++)
    for (let c = 0; c <= N - size; c++) {
      const drop = base - score(m, occlude(x, c, r, size));
      for (let pr = r; pr < r + size; pr++)
        for (let pc = c; pc < c + size; pc++) {
          sum[pr * N + pc] += drop;
          count[pr * N + pc]++;
        }
    }
  return sum.map((s, i) => s / count[i]);
}

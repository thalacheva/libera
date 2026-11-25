// Сметките за трите лаборатории на урока „Какво става вътре в модела“:
// признаци като посоки (суперпозиция), линейна сонда върху скрития слой и малка верига с изключване и подмяна на неврони.

import { mulberry32 } from '../history/rollouts';
import { makeData, type Pt } from '../models/classify';
import { hiddenValues, type Mlp, mlpProb, randomMlp, trainMlp } from '../networks/mlp';

// ---------- Суперпозиция: N признака в 2 измерения ----------

export type Vec = [number, number];

/** Посоките на признаците: при 2 – перпендикулярни, при повече – равномерно по окръжността. */
export function directions(n: number): Vec[] {
  if (n === 2) return [[1, 0], [0, 1]];
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return [Math.cos(a), Math.sin(a)] as Vec;
  });
}

/** Векторът на активациите: сборът от посоките на включените признаци. */
export function encode(dirs: Vec[], active: boolean[]): Vec {
  let x = 0;
  let y = 0;
  dirs.forEach((d, i) => {
    if (active[i]) {
      x += d[0];
      y += d[1];
    }
  });
  return [x, y];
}

/** Четене на всеки признак: скаларно произведение с посоката му; с изправител отрицателните стават 0. */
export function readAll(dirs: Vec[], h: Vec, relu: boolean): number[] {
  return dirs.map(d => {
    const v = d[0] * h[0] + d[1] * h[1];
    return relu ? Math.max(0, v) : v;
  });
}

/**
 * Средната квадратична грешка на признак, ако всеки признак е включен независимо с вероятност p.
 * Пресмята се точно – по всичките 2^N набора.
 */
export function superpositionError(n: number, p: number, relu: boolean): number {
  const dirs = directions(n);
  let total = 0;
  for (let mask = 0; mask < 1 << n; mask++) {
    const active = Array.from({ length: n }, (_, i) => ((mask >> i) & 1) === 1);
    const k = active.filter(Boolean).length;
    const prob = p ** k * (1 - p) ** (n - k);
    const read = readAll(dirs, encode(dirs, active), relu);
    let err = 0;
    for (let i = 0; i < n; i++) err += (read[i] - (active[i] ? 1 : 0)) ** 2;
    total += (prob * err) / n;
  }
  return total;
}

/** Същата грешка, ако двете измерения пазят точно само два признака, а останалите N − 2 се губят. */
export const dedicatedError = (n: number, p: number) => (p * (n - 2)) / n;

// ---------- Линейна сонда ----------

export type PropertyId = 'target' | 'top' | 'quadrant' | 'random';

export const PROPERTIES: { id: PropertyId; label: string; note: string }[] = [
  { id: 'target', label: 'вътре в кръга', note: 'това е задачата, на която мрежата се учи' },
  { id: 'top', label: 'в горната половина', note: 'мрежата не е учена на това; свойството е права линия във входа' },
  { id: 'quadrant', label: 'горе вдясно или долу вляво', note: 'мрежата не е учена на това; във входа не се дели с права' },
  { id: 'random', label: 'случайни етикети', note: 'контрола: етикетите са хвърлени с монета и нямат връзка с точките' },
];

/** Етикетите на точките за избраното свойство. Случайните зависят само от поредния номер и семето. */
export function labelsFor(id: PropertyId, pts: Pt[], seed: number): number[] {
  const r = mulberry32(seed);
  return pts.map(p => {
    const coin = r() < 0.5 ? 1 : 0;
    if (id === 'target') return p.c;
    if (id === 'top') return p.y > 5 ? 1 : 0;
    if (id === 'quadrant') return (p.x - 5) * (p.y - 5) > 0 ? 1 : 0;
    return coin;
  });
}

export type Probe = { w: number[]; b: number };

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const score = (probe: Probe, f: number[]) => f.reduce((s, v, j) => s + v * probe.w[j], probe.b);

/** Сондата е логистична регресия върху дадените признаци (входа или активациите на скрития слой). */
export function trainProbe(features: number[][], labels: number[], steps = 600, rate = 1): Probe {
  const d = features[0].length;
  const probe: Probe = { w: new Array<number>(d).fill(0), b: 0 };
  for (let s = 0; s < steps; s++) {
    const g = new Array<number>(d).fill(0);
    let gb = 0;
    features.forEach((f, i) => {
      const e = sigmoid(score(probe, f)) - labels[i];
      for (let j = 0; j < d; j++) g[j] += e * f[j];
      gb += e;
    });
    for (let j = 0; j < d; j++) probe.w[j] -= (rate * g[j]) / features.length;
    probe.b -= (rate * gb) / features.length;
  }
  return probe;
}

export const probeGuess = (probe: Probe, f: number[]) => (score(probe, f) > 0 ? 1 : 0);

export function probeAccuracy(probe: Probe, features: number[][], labels: number[]): number {
  let ok = 0;
  features.forEach((f, i) => {
    if (probeGuess(probe, f) === labels[i]) ok++;
  });
  return ok / features.length;
}

/** Точките, по които се учат мрежата и сондата, и новите точки, върху които сондата се проверява. */
export const PROBE_TRAIN = makeData('ring', 120, 21);
export const PROBE_TEST = makeData('ring', 200, 77);
export const HIDDEN = 8;
export const NET_STEPS = [0, 100, 300, 1000, 3000];

const nets = new Map<number, Mlp>();
/** Мрежа 2 → 8 → 1, обучавана `steps` стъпки да познава „вътре в кръга“. Резултатът се пази. */
export function probeNet(steps: number): Mlp {
  let n = nets.get(steps);
  if (!n) {
    n = trainMlp(randomMlp(HIDDEN, 'tanh', 508), PROBE_TRAIN, steps);
    nets.set(steps, n);
  }
  return n;
}

/** Делът на новите точки, за които мрежата познава собствената си задача. */
export function netAccuracy(steps: number): number {
  const net = probeNet(steps);
  return PROBE_TEST.filter(p => (mlpProb(net, p.x, p.y) > 0.5 ? 1 : 0) === p.c).length / PROBE_TEST.length;
}

export type Site = 'input' | 'hidden';

export function featuresAt(site: Site, net: Mlp, pts: Pt[]): number[][] {
  return pts.map(p => (site === 'input' ? [(p.x - 5) / 2.5, (p.y - 5) / 2.5] : hiddenValues(net, p.x, p.y)));
}

export type ProbeResult = { probe: Probe; train: number; test: number; guesses: number[]; labels: number[] };

/** Обучава сонда на избраното място за избраното свойство и я проверява върху новите точки. */
export function runProbe(site: Site, steps: number, property: PropertyId): ProbeResult {
  const net = probeNet(steps);
  const fTrain = featuresAt(site, net, PROBE_TRAIN);
  const fTest = featuresAt(site, net, PROBE_TEST);
  const lTrain = labelsFor(property, PROBE_TRAIN, 5);
  const lTest = labelsFor(property, PROBE_TEST, 9);
  const probe = trainProbe(fTrain, lTrain);
  return {
    probe,
    train: probeAccuracy(probe, fTrain, lTrain),
    test: probeAccuracy(probe, fTest, lTest),
    guesses: fTest.map(f => probeGuess(probe, f)),
    labels: lTest,
  };
}

// ---------- Малка верига: „точно един от двата входа“ ----------

export type NeuronId = 'A' | 'B' | 'C' | 'D';
export const NEURONS: { id: NeuronId; name: string; rule: string; out: number }[] = [
  { id: 'A', name: 'поне един', rule: 'x₁ + x₂ ≥ 0,5', out: 0.5 },
  { id: 'B', name: 'и двата', rule: 'x₁ + x₂ ≥ 1,5', out: -1 },
  { id: 'C', name: 'поне един (резервен)', rule: 'x₁ + x₂ ≥ 0,5', out: 0.5 },
  { id: 'D', name: 'само първият', rule: 'x₁ − x₂ ≥ 0,5', out: 0 },
];
export const INPUTS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];
export const OUT_THRESHOLD = 0.25;

export type Mode = 'on' | 'off' | 'patch';
export type Modes = Record<NeuronId, Mode>;
export const ALL_ON: Modes = { A: 'on', B: 'on', C: 'on', D: 'on' };

/** Активациите на четирите скрити неврона без намеса. */
export function cleanActs(x1: number, x2: number): Record<NeuronId, number> {
  return {
    A: x1 + x2 >= 0.5 ? 1 : 0,
    B: x1 + x2 >= 1.5 ? 1 : 0,
    C: x1 + x2 >= 0.5 ? 1 : 0,
    D: x1 - x2 >= 0.5 ? 1 : 0,
  };
}

/** Ход напред с намеса: изключеният неврон дава 0, подмененият – стойността си при входа донор. */
export function runCircuit(x: [number, number], modes: Modes, donor: [number, number]) {
  const own = cleanActs(x[0], x[1]);
  const from = cleanActs(donor[0], donor[1]);
  const acts = { ...own };
  for (const n of NEURONS) {
    if (modes[n.id] === 'off') acts[n.id] = 0;
    if (modes[n.id] === 'patch') acts[n.id] = from[n.id];
  }
  const sum = NEURONS.reduce((s, n) => s + n.out * acts[n.id], 0);
  return { acts, sum, out: sum >= OUT_THRESHOLD ? 1 : 0, want: x[0] !== x[1] ? 1 : 0 };
}

/** Колко от четирите входа веригата решава вярно при дадената намеса. */
export const circuitCorrect = (modes: Modes, donor: [number, number]) =>
  INPUTS.filter(x => {
    const r = runCircuit(x, modes, donor);
    return r.out === r.want;
  }).length;

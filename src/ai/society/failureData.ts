// Данни и сметки за лабораториите в урока „Грешки, халюцинации и пристрастия“:
// калибриране на увереността, мерки за справедливост при две групи и липсваща група в обучаващите данни.

import { mulberry32 } from '../history/rollouts';

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

// ---------- Калибриране ----------

export type Forecast = { /** истинският шанс отговорът да е верен */ chance: number; /** z = ln(chance / (1 − chance)) */ z: number; correct: boolean };

/**
 * `n` отговора на един модел. Всеки има истински шанс да е верен между 50% и 99%.
 * Верните са разпределени така, че сред отговорите с шанс p да са верни почти точно p от тях.
 */
export function makeForecasts(n: number, seed: number): Forecast[] {
  const random = mulberry32(seed);
  const zs = Array.from({ length: n }, () => 0.1 + 3.4 * random() ** 1.3).sort((a, b) => a - b);
  let sum = 0.5;
  return zs.map(z => {
    const chance = sigmoid(z);
    const before = Math.floor(sum);
    sum += chance;
    return { chance, z, correct: Math.floor(sum) > before };
  });
}

/** Увереността, която моделът обявява: същата оценка z, умножена по „самоувереност“ k (k = 1 – честна). */
export const stated = (f: Forecast, k: number) => sigmoid(k * f.z);

export type Bin = { from: number; to: number; n: number; confidence: number; accuracy: number };

/** Кошове по обявена увереност между 50% и 100%. */
export function bins(items: Forecast[], k: number, count = 5): Bin[] {
  const out: Bin[] = Array.from({ length: count }, (_, i) => ({ from: 0.5 + (0.5 * i) / count, to: 0.5 + (0.5 * (i + 1)) / count, n: 0, confidence: 0, accuracy: 0 }));
  for (const f of items) {
    const c = stated(f, k);
    const b = out[Math.min(count - 1, Math.floor(((c - 0.5) / 0.5) * count))];
    b.n++;
    b.confidence += c;
    b.accuracy += f.correct ? 1 : 0;
  }
  for (const b of out) {
    if (b.n) {
      b.confidence /= b.n;
      b.accuracy /= b.n;
    }
  }
  return out;
}

/** Очаквана грешка на калибриране: претеглена средна на |точност − увереност| по кошове. */
export const calibrationError = (bs: Bin[]) => {
  const n = bs.reduce((s, b) => s + b.n, 0);
  return bs.reduce((s, b) => s + (b.n / n) * Math.abs(b.accuracy - b.confidence), 0);
};

export const meanConfidence = (items: Forecast[], k: number) => items.reduce((s, f) => s + stated(f, k), 0) / items.length;
export const shareCorrect = (items: Forecast[]) => items.filter(f => f.correct).length / items.length;

// ---------- Справедливост ----------

/** Оценките на риска са десет: 5%, 15%, …, 95%. */
export const SCORES = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];

export type Group = { name: string; /** брой хора с всяка оценка */ counts: number[] };

/** Две групи по 1000 души. Моделът е калибриран и в двете: от хората с оценка s точно s·n не връщат заема. */
export const GROUPS: [Group, Group] = [
  { name: 'Сините', counts: [60, 80, 100, 120, 140, 140, 120, 100, 80, 60] },
  { name: 'Оранжевите', counts: [300, 260, 140, 100, 60, 40, 40, 20, 20, 20] },
];

/** Колко от хората с оценка номер i наистина не връщат заема. */
export const positives = (g: Group, i: number) => Math.round(g.counts[i] * SCORES[i]);

export type Fair = { n: number; base: number; tp: number; fp: number; fn: number; tn: number; flagged: number; fpr: number; fnr: number; ppv: number; accuracy: number };

/** Отказ получават всички с оценка над прага `t`. */
export function fairness(g: Group, t: number): Fair {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  SCORES.forEach((s, i) => {
    const pos = positives(g, i);
    const neg = g.counts[i] - pos;
    if (s > t) {
      tp += pos;
      fp += neg;
    } else {
      fn += pos;
      tn += neg;
    }
  });
  const n = tp + fp + fn + tn;
  return { n, base: (tp + fn) / n, tp, fp, fn, tn, flagged: (tp + fp) / n, fpr: fp / (fp + tn), fnr: fn / (fn + tp), ppv: tp + fp ? tp / (tp + fp) : 1, accuracy: (tp + tn) / n };
}

// ---------- Липсваща група ----------

export type Reading = { x: number; sick: boolean; group: 0 | 1 };

/**
 * `n` измервания от една група: половината болни (около 6), половината здрави (около 4), с разсейване.
 * Вместо случайни числа се ползва равномерно разстлана редица – така малките извадки приличат на големите.
 */
function pool(group: 0 | 1, n: number, offset: number, start: number): Reading[] {
  return Array.from({ length: n }, (_, i) => {
    const sick = i % 2 === 0;
    const u = (start + (Math.floor(i / 2) + 1) * 0.6180339887) % 1;
    const noise = 0.45 * Math.log((0.002 + 0.996 * u) / (1 - 0.002 - 0.996 * u));
    return { x: (sick ? 6 : 4) + offset + noise, sick, group };
  });
}

export const TRAIN_SIZE = 200;
export const TEST_SIZE = 400;

/** Обучаващи данни: 200 измервания, от които `shareB` са от група Б. При група Б уредът показва с `offset` повече. */
export function trainingSet(shareB: number, offset: number): Reading[] {
  const nB = Math.round(TRAIN_SIZE * shareB);
  return [...pool(0, TRAIN_SIZE, 0, 0.11).slice(0, TRAIN_SIZE - nB), ...pool(1, TRAIN_SIZE, offset, 0.37).slice(0, nB)];
}

/** Отделен праг за всяка група; ако от групата няма нито едно измерване, моделът няма как да го нагласи и ползва общия. */
export function groupThresholds(data: Reading[]): [number, number] {
  const all = bestThreshold(data);
  const a = data.filter(r => r.group === 0);
  const b = data.filter(r => r.group === 1);
  return [a.length ? bestThreshold(a) : all, b.length ? bestThreshold(b) : all];
}

/** Нови хора за проверка: по 400 от всяка група. */
export const testSet = (group: 0 | 1, offset: number) => pool(group, TEST_SIZE, group ? offset : 0, group ? 0.73 : 0.52);

/** Точност на правилото „болен, ако показанието е над прага“. */
export const thresholdAccuracy = (data: Reading[], t: number) => (data.length ? data.filter(r => r.x > t === r.sick).length / data.length : 0);

/** Прагът с най-малко грешки върху данните (търсене през 0,05; при равенство – средата на най-добрите). */
export function bestThreshold(data: Reading[]): number {
  let best = -1;
  let from = 0;
  let to = 0;
  for (let i = 40; i <= 200; i++) {
    const t = i / 20;
    const a = thresholdAccuracy(data, t);
    if (a > best + 1e-9) {
      best = a;
      from = t;
      to = t;
    } else if (Math.abs(a - best) < 1e-9 && Math.abs(t - to - 0.05) < 1e-9) to = t;
  }
  return Math.round(((from + to) / 2) * 20) / 20;
}

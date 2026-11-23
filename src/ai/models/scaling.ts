// Разстояния и нормализиране на признаци – общи за лабораториите в урока „Данни и признаци“.

export type Metric = 'euclid' | 'manhattan';
export type Scaling = 'none' | 'minmax' | 'zscore';

export const euclid = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
export const manhattan = (a: number[], b: number[]) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0);
export const distance = (metric: Metric, a: number[], b: number[]) => (metric === 'euclid' ? euclid(a, b) : manhattan(a, b));

export const mean = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;
/** Стандартно отклонение (на цялата съвкупност – делим на n). */
export const std = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map(v => (v - m) ** 2)));
};

/** Функция, която привежда стойност на един признак към избрания мащаб, по стойностите му в целия набор. */
export function scaler(kind: Scaling, column: number[]): (v: number) => number {
  if (kind === 'minmax') {
    const lo = Math.min(...column);
    const hi = Math.max(...column);
    return v => (hi === lo ? 0 : (v - lo) / (hi - lo));
  }
  if (kind === 'zscore') {
    const m = mean(column);
    const s = std(column);
    return v => (s === 0 ? 0 : (v - m) / s);
  }
  return v => v;
}

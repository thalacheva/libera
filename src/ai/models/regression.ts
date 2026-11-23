// Линейна регресия с един признак по метода на най-малките квадрати.

export type Line = { w: number; b: number };

const mean = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;

/** Правата с най-малка средна квадратична грешка: w = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)², b = ȳ − w·x̄. */
export function fitLine(xs: number[], ys: number[]): Line {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  const w = sxx === 0 ? 0 : sxy / sxx;
  return { w, b: my - w * mx };
}

export const predict = (line: Line, x: number) => line.w * x + line.b;

/** Средна квадратична грешка на правата върху данните. */
export function mse(line: Line, xs: number[], ys: number[]) {
  return mean(xs.map((x, i) => (ys[i] - predict(line, x)) ** 2));
}

/** Коефициент на детерминация R² = 1 − Σ(y−ŷ)² / Σ(y−ȳ)². */
export function rSquared(line: Line, xs: number[], ys: number[]) {
  const my = mean(ys);
  const total = ys.reduce((s, y) => s + (y - my) ** 2, 0);
  const rest = xs.reduce((s, x, i) => s + (ys[i] - predict(line, x)) ** 2, 0);
  return total === 0 ? 1 : 1 - rest / total;
}

/** Олимпийските шампиони на 100 m при мъжете: година и време в секунди (до 1964 г. – ръчно засичане). */
export const SPRINT: [number, number][] = [
  [1896, 12.0],
  [1900, 11.0],
  [1904, 11.0],
  [1908, 10.8],
  [1912, 10.8],
  [1920, 10.8],
  [1924, 10.6],
  [1928, 10.8],
  [1932, 10.3],
  [1936, 10.3],
  [1948, 10.3],
  [1952, 10.4],
  [1956, 10.5],
  [1960, 10.2],
  [1964, 10.0],
  [1968, 9.95],
  [1972, 10.14],
  [1976, 10.06],
  [1980, 10.25],
  [1984, 9.99],
  [1988, 9.92],
  [1992, 9.96],
  [1996, 9.84],
  [2000, 9.87],
  [2004, 9.85],
  [2008, 9.69],
  [2012, 9.63],
  [2016, 9.81],
  [2020, 9.8],
  [2024, 9.79],
];

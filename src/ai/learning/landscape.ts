// Загубата като „релеф“ над параметрите на права ŷ = w·x + b – общо за уроците за загубата и градиентното спускане.

/** Същите примерни измервания на гейзер като в урока „Линейна регресия“: продължителност (min) → чакане (min). */
export const DATA: [number, number][] = [
  [1.7, 55],
  [4.0, 78],
  [4.1, 72],
  [2.3, 58],
  [3.9, 83],
  [3.2, 69],
  [2.0, 52],
  [4.7, 78],
  [4.9, 78],
  [1.7, 50],
  [4.0, 79],
  [5.0, 89],
  [1.6, 51],
  [5.3, 95],
  [3.7, 70],
  [1.7, 50],
];

export type Params = { w: number; b: number };

const meanOf = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;
export const X_MEAN = meanOf(DATA.map(p => p[0]));

/** Данните с признак, изместен така, че средното му да е 0 (центриран). */
export const CENTERED: [number, number][] = DATA.map(([x, y]) => [x - X_MEAN, y]);

/** Средна квадратична грешка на правата върху избрани примери. */
export const loss = (p: Params, data: [number, number][] = DATA) => data.reduce((s, [x, y]) => s + (y - (p.w * x + p.b)) ** 2, 0) / data.length;

/** Градиентът на загубата: частните производни по w и по b. */
export function gradient(p: Params, data: [number, number][] = DATA): Params {
  let gw = 0;
  let gb = 0;
  for (const [x, y] of data) {
    const e = p.w * x + p.b - y;
    gw += 2 * e * x;
    gb += 2 * e;
  }
  return { w: gw / data.length, b: gb / data.length };
}

/** Точният минимум по метода на най-малките квадрати. */
export function minimum(data: [number, number][] = DATA): Params {
  const mx = meanOf(data.map(p => p[0]));
  const my = meanOf(data.map(p => p[1]));
  const w = data.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0) / data.reduce((s, [x]) => s + (x - mx) ** 2, 0);
  return { w, b: my - w * mx };
}

/** Цвят на клетка от релефа по загубата (логаритмична скала): тъмно синьо – ниско, жълто – високо. */
export function heat(value: number, lo: number, hi: number): string {
  const t = Math.min(1, Math.max(0, (Math.log(value) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))));
  const stops = [
    [30, 27, 110],
    [37, 99, 235],
    [16, 185, 129],
    [250, 204, 21],
    [253, 246, 178],
  ];
  const k = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(k));
  const f = k - i;
  const c = stops[i].map((v, j) => Math.round(v + f * (stops[i + 1][j] - v)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

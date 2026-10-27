// Измислен релеф за лабораториите по топография: височини, хоризонтали и хипсометрични цветове.

/** Височина в метри в точка (x, y) от квадрата [0, 1]²; y расте на юг (надолу по картата). */
export type Terrain = (x: number, y: number) => number;

const g = (x: number, y: number, cx: number, cy: number, sx: number, sy = sx) => Math.exp(-(((x - cx) / sx) ** 2) - ((y - cy) / sy) ** 2);

/** Детерминиран „шум“ – малки неравности, еднакви при prerender и в браузъра. */
const ripple = (x: number, y: number) => Math.sin(9.1 * x + 3.3 * y) * Math.cos(7.7 * y - 2.1 * x) + 0.5 * Math.sin(17.3 * x - 11.9 * y);

export type Landform = { id: string; name: string; terrain: Terrain; note: string };

export const LANDFORMS: Landform[] = [
  {
    id: 'peak',
    name: 'Връх',
    terrain: (x, y) => 300 + 900 * g(x, y, 0.5, 0.5, 0.28),
    note: 'Затворени хоризонтали една в друга; най-високата е в средата.',
  },
  {
    id: 'saddle',
    name: 'Седловина',
    terrain: (x, y) => 300 + 800 * g(x, y, 0.22, 0.5, 0.22) + 700 * g(x, y, 0.78, 0.5, 0.22) + 120 * g(x, y, 0.5, 0.5, 0.3, 0.12),
    note: 'Понижение между два върха: хоризонталите на двата върха се „гледат“ една друга.',
  },
  {
    id: 'ridge',
    name: 'Хребет',
    terrain: (x, y) => 300 + 600 * g(x, y, 0.5, 0.45, 0.9, 0.17) * (1.2 - 0.6 * x) + 200 * g(x, y, 0.25, 0.45, 0.12),
    note: 'Удължено възвишение: хоризонталите се извиват като език в посока надолу по склона.',
  },
  {
    id: 'valley',
    name: 'Долина',
    terrain: (x, y) => 300 + 900 * Math.min(1, Math.abs(x - 0.5 - 0.08 * Math.sin(5 * y)) * 1.6) * (0.4 + 0.6 * (1 - y)) + 400 * (1 - y),
    note: 'Удълбочение: хоризонталите се извиват като език нагоре по течението, към по-високото.',
  },
  {
    id: 'basin',
    name: 'Котловина',
    terrain: (x, y) => 900 - 550 * g(x, y, 0.5, 0.5, 0.3, 0.24),
    note: 'Затворени хоризонтали, но най-ниската е в средата – личи по котите или по бергщрихите (чертички към понижението).',
  },
  {
    id: 'cliff',
    name: 'Стръмно и полегато',
    terrain: (x, y) => 300 + 1000 / (1 + Math.exp((x - 0.62) / 0.05)) * (0.3 + 0.7 * g(x, y, 0.35, 0.5, 0.6, 0.5)),
    note: 'Където хоризонталите са нагъсто, склонът е стръмен; където са нарядко – полегат.',
  },
];

/** Въображаема планина за профила и наклоните: два дяла, седловина, долина с река на юг. */
export const MOUNTAIN: Terrain = (x, y) =>
  420 +
  1550 * g(x, y, 0.36, 0.34, 0.2, 0.17) +
  1150 * g(x, y, 0.72, 0.26, 0.15, 0.13) +
  500 * g(x, y, 0.54, 0.31, 0.12, 0.08) -
  260 * g(x, y, 0.56, 0.72, 0.5, 0.08) +
  380 * g(x, y, 0.2, 0.8, 0.12) +
  22 * ripple(x, y);

/** Стойностите на релефа в мрежа n × n. */
export function sample(t: Terrain, n: number) {
  return Array.from({ length: n + 1 }, (_, j) => Array.from({ length: n + 1 }, (_, i) => t(i / n, j / n)));
}

/** Хоризонтали по алгоритъма „марширащи квадрати“: отсечки за всяко ниво в координати [0, 1]². */
export function contours(grid: number[][], levels: number[]) {
  const n = grid.length - 1;
  const out: { level: number; d: string }[] = [];
  for (const L of levels) {
    let d = '';
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const v = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
        const p = [
          [i, j],
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
        ];
        const cuts: [number, number][] = [];
        for (let e = 0; e < 4; e++) {
          const a = v[e];
          const b = v[(e + 1) % 4];
          if (a < L !== b < L) {
            const t = (L - a) / (b - a);
            const [x1, y1] = p[e];
            const [x2, y2] = p[(e + 1) % 4];
            cuts.push([(x1 + t * (x2 - x1)) / n, (y1 + t * (y2 - y1)) / n]);
          }
        }
        // 2 пресечни точки – една отсечка; 4 (седло) – две отсечки
        for (let k = 0; k + 1 < cuts.length; k += 2) d += `M${cuts[k][0].toFixed(4)} ${cuts[k][1].toFixed(4)}L${cuts[k + 1][0].toFixed(4)} ${cuts[k + 1][1].toFixed(4)}`;
      }
    if (d) out.push({ level: L, d });
  }
  return out;
}

/** Нивата през дадена стъпка между min и max. */
export function levelsOf(grid: number[][], step: number) {
  const all = grid.flat();
  const lo = Math.ceil(Math.min(...all) / step) * step;
  const hi = Math.max(...all);
  const out: number[] = [];
  for (let L = lo; L < hi; L += step) out.push(L);
  return out;
}

/** Хипсометрична скала: низини зелено, планини жълто-кафяво, най-високото – бяло. */
const STOPS: [number, [number, number, number]][] = [
  [0, [92, 160, 92]],
  [200, [140, 190, 110]],
  [500, [214, 222, 140]],
  [1000, [222, 190, 120]],
  [1500, [190, 140, 90]],
  [2000, [150, 105, 80]],
  [2500, [235, 230, 225]],
];
export function hypsoColor(h: number) {
  let k = 1;
  while (k < STOPS.length - 1 && h > STOPS[k][0]) k++;
  const [h1, c1] = STOPS[k - 1];
  const [h2, c2] = STOPS[k];
  const t = Math.max(0, Math.min(1, (h - h1) / (h2 - h1)));
  const c = c1.map((v, i) => Math.round(v + t * (c2[i] - v)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
export const HYPSO_LEGEND = STOPS.map(([h]) => h);

/** Наклон в посока (dx, dy) – градиент по краен разлики, в m на единица от квадрата. */
export function gradient(t: Terrain, x: number, y: number) {
  const e = 1e-3;
  return { gx: (t(x + e, y) - t(x - e, y)) / (2 * e), gy: (t(x, y + e) - t(x, y - e)) / (2 * e) };
}

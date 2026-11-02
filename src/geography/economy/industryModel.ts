// Данни и модели за урока „Промишленост и услуги“.

export type Pt = { x: number; y: number };

/** Обща транспортна работа Σ wᵢ·dᵢ (t·km на 1 t продукт). */
export function weberCost(p: Pt, pts: Pt[], w: number[]) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) s += w[i] * Math.hypot(p.x - pts[i].x, p.y - pts[i].y);
  return s;
}

/**
 * Точката с най-малки транспортни разходи (задачата на Вебер, обобщена точка на Ферма).
 * Първо проверява дали оптимумът е във връх: това става, когато теглото на върха надвишава
 * „дърпането“ на останалите. Иначе – итерации на Вайсфелд.
 */
export function weberOptimum(pts: Pt[], w: number[]): Pt {
  for (let i = 0; i < pts.length; i++) {
    let fx = 0;
    let fy = 0;
    for (let j = 0; j < pts.length; j++) {
      if (j === i) continue;
      const d = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
      if (d < 1e-9) continue;
      fx += (w[j] * (pts[j].x - pts[i].x)) / d;
      fy += (w[j] * (pts[j].y - pts[i].y)) / d;
    }
    if (Math.hypot(fx, fy) <= w[i]) return { ...pts[i] };
  }
  const W = w.reduce((a, b) => a + b, 0) || 1;
  let p = { x: pts.reduce((s, q, i) => s + w[i] * q.x, 0) / W, y: pts.reduce((s, q, i) => s + w[i] * q.y, 0) / W };
  for (let it = 0; it < 300; it++) {
    let nx = 0;
    let ny = 0;
    let den = 0;
    for (let i = 0; i < pts.length; i++) {
      const d = Math.max(Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 1e-6);
      nx += (w[i] * pts[i].x) / d;
      ny += (w[i] * pts[i].y) / d;
      den += w[i] / d;
    }
    const q = { x: nx / den, y: ny / den };
    if (Math.hypot(q.x - p.x, q.y - p.y) < 1e-4) return q;
    p = q;
  }
  return p;
}

/** Генератор на псевдослучайни числа (mulberry32) – за повторими симулации. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Заетост по сектори (% от заетите) и БВП на човек по ППС (постоянни международни долари от 2021 г.).
 * Световна банка, WDI: моделни оценки на МОТ, 2023 г.
 */
export type SectorRow = { name: string; gdp: number; agr: number; ind: number; srv: number };
export const SECTORS_2023: SectorRow[] = [
  { name: 'Нигер', gdp: 1713, agr: 74.2, ind: 9.2, srv: 16.6 },
  { name: 'Етиопия', gdp: 2758, agr: 62.2, ind: 6.4, srv: 31.5 },
  { name: 'Нигерия', gdp: 7843, agr: 34.7, ind: 16.8, srv: 48.5 },
  { name: 'Бангладеш', gdp: 8242, agr: 45.4, ind: 17.6, srv: 37.0 },
  { name: 'Индия', gdp: 8871, agr: 43.5, ind: 25.0, srv: 31.5 },
  { name: 'Виетнам', gdp: 13535, agr: 27.0, ind: 33.5, srv: 39.5 },
  { name: 'Индонезия', gdp: 13890, agr: 28.8, ind: 22.0, srv: 49.3 },
  { name: 'Бразилия', gdp: 19080, agr: 8.2, ind: 20.2, srv: 71.6 },
  { name: 'Китай', gdp: 22687, agr: 22.8, ind: 31.4, srv: 45.8 },
  { name: 'България', gdp: 33074, agr: 6.2, ind: 29.6, srv: 64.2 },
  { name: 'Турция', gdp: 35069, agr: 14.6, ind: 27.6, srv: 57.8 },
  { name: 'Полша', gdp: 43673, agr: 8.5, ind: 29.5, srv: 62.0 },
  { name: 'Япония', gdp: 47387, agr: 3.0, ind: 23.7, srv: 73.3 },
  { name: 'Великобритания', gdp: 53423, agr: 0.9, ind: 15.9, srv: 83.2 },
  { name: 'Южна Корея', gdp: 54029, agr: 5.3, ind: 24.0, srv: 70.7 },
  { name: 'Германия', gdp: 63140, agr: 1.2, ind: 26.4, srv: 72.4 },
  { name: 'САЩ', gdp: 74352, agr: 1.6, ind: 19.3, srv: 79.1 },
];
export const WORLD_2023: SectorRow = { name: 'Светът', gdp: 20895, agr: 26.6, ind: 23.5, srv: 49.9 };

/** Пътят на четири страни 1991–2023 (същите източник и единици). */
export const SECTOR_PATHS: { name: string; rows: [number, number, number, number, number][] }[] = [
  {
    name: 'Китай',
    rows: [
      [1991, 1798, 59.6, 21.4, 18.9],
      [1999, 3774, 50.1, 23.0, 26.9],
      [2007, 8014, 40.8, 26.8, 32.4],
      [2015, 14857, 28.3, 29.3, 42.4],
      [2023, 22687, 22.8, 31.4, 45.8],
    ],
  },
  {
    name: 'Индия',
    rows: [
      [1991, 2116, 63.1, 14.6, 22.3],
      [1999, 2954, 59.9, 16.3, 23.8],
      [2007, 4254, 53.4, 20.3, 26.3],
      [2015, 6302, 44.3, 24.9, 30.8],
      [2023, 8871, 43.5, 25.0, 31.5],
    ],
  },
  {
    name: 'Южна Корея',
    rows: [
      [1991, 15785, 15.5, 37.2, 47.4],
      [1999, 24382, 10.8, 28.5, 60.7],
      [2007, 36257, 6.9, 26.5, 66.6],
      [2015, 44849, 5.1, 25.4, 69.5],
      [2023, 54029, 5.3, 24.0, 70.7],
    ],
  },
  {
    name: 'България',
    rows: [
      [1991, 13828, 9.5, 45.1, 45.4],
      [1999, 11954, 13.4, 33.0, 53.6],
      [2007, 20440, 7.5, 35.5, 57.0],
      [2015, 24563, 6.8, 30.3, 62.9],
      [2023, 33074, 6.2, 29.6, 64.2],
    ],
  },
];

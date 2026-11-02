// Прост модел на населението: таблица за смъртност (логит модел на Брас), прогноза по възрастови групи
// и данни за броя на хората на Земята.

/** Възрастови групи по 5 години: 0–4, 5–9, …, 95–99 и последната 100+. */
export const GROUPS = 21;
export const groupLabel = (i: number) => (i === GROUPS - 1 ? '100+' : `${5 * i}–${5 * i + 4}`);

// Стандартна крива на смъртност (Гомпертц–Мейкхам с детска смъртност), e₀ ≈ 72 години
const mu = (x: number) => 0.04 * Math.exp(-1.2 * x) + 0.0005 + 0.00004 * Math.exp(0.095 * x);

function standardSurvival() {
  const out = [1];
  let v = 1;
  const dt = 0.1;
  for (let k = 0; k < 1100; k++) {
    const x = k * dt;
    v *= Math.exp(-mu(x + dt / 2) * dt);
    if ((k + 1) % 50 === 0) out.push(v);
  }
  return out.slice(0, GROUPS + 1);
}

const YS = standardSurvival().map(l => 0.5 * Math.log((1 - l) / l));

type Table = { l: number[]; L: number[]; e0: number };

function lifeTable(alpha: number): Table {
  const l = [1, ...YS.slice(1).map(y => 1 / (1 + Math.exp(2 * (alpha + y))))];
  const L: number[] = [];
  for (let i = 0; i < GROUPS; i++) L.push(i === 0 ? 5 * (0.3 * l[0] + 0.7 * l[1]) : 2.5 * (l[i] + l[i + 1]));
  L[GROUPS - 1] = 2.5 * l[GROUPS - 1];
  return { l, L, e0: L.reduce((a, b) => a + b, 0) };
}

const cache = new Map<number, Table>();
/** Таблица за смъртност с дадена средна продължителност на живота e₀ (търси α с разполовяване). */
export function tableFor(e0: number): Table {
  const key = Math.round(e0 * 10);
  const hit = cache.get(key);
  if (hit) return hit;
  let lo = -3;
  let hi = 3;
  for (let k = 0; k < 50; k++) {
    const m = (lo + hi) / 2;
    if (lifeTable(m).e0 > e0) lo = m;
    else hi = m;
  }
  const t = lifeTable((lo + hi) / 2);
  cache.set(key, t);
  return t;
}

/** Каква част от раждащите жени са на 15–19, 20–24, …, 45–49 години. */
export const FERTILITY_SHARE = [0.06, 0.2, 0.27, 0.23, 0.15, 0.07, 0.02];
const GIRLS = 0.488;

/** Коефициентът на плодовитост, при който всяко поколение жени точно се заменя (нетен коефициент = 1). */
export function replacementTfr(e0: number) {
  const { L } = tableFor(e0 + 2.5);
  return 1 / (GIRLS * FERTILITY_SHARE.reduce((s, f, k) => s + (f * L[3 + k]) / 5, 0));
}

export type Pop = { f: number[]; m: number[] };

/** Една стъпка от 5 години: оцелелите преминават в следващата група, жените на 15–49 раждат. */
export function step(p: Pop, tfr: number, e0: number): Pop {
  const tf = tableFor(e0 + 2.5);
  const tm = tableFor(e0 - 2.5);
  const age = (P: number[], L: number[]) => {
    const n = new Array<number>(GROUPS).fill(0);
    for (let i = 0; i < GROUPS - 2; i++) n[i + 1] = (P[i] * L[i + 1]) / L[i];
    const last = L[GROUPS - 1];
    n[GROUPS - 1] = ((P[GROUPS - 2] + P[GROUPS - 1]) * last) / (L[GROUPS - 2] + last);
    return n;
  };
  const f = age(p.f, tf.L);
  const m = age(p.m, tm.L);
  const births = tfr * FERTILITY_SHARE.reduce((s, sh, k) => s + (sh * (p.f[3 + k] + f[3 + k])) / 2, 0);
  f[0] = (births * GIRLS * tf.L[0]) / 5;
  m[0] = (births * (1 - GIRLS) * tm.L[0]) / 5;
  return { f, m };
}

export function stats(p: Pop) {
  const P = p.f.map((v, i) => v + p.m[i]);
  const total = P.reduce((a, b) => a + b, 0);
  let c = 0;
  let median = 0;
  for (let i = 0; i < GROUPS; i++) {
    if (c + P[i] >= total / 2) {
      median = 5 * i + (5 * (total / 2 - c)) / P[i];
      break;
    }
    c += P[i];
  }
  const young = P[0] + P[1] + P[2];
  const old = P.slice(13).reduce((a, b) => a + b, 0);
  const working = total - young - old;
  return {
    total,
    median,
    young: (100 * young) / total,
    old: (100 * old) / total,
    dependency: (100 * (young + old)) / working,
  };
}

/** Тип на възрастовата структура – грубо, по дела на децата и на възрастните. */
export function pyramidType(young: number, old: number) {
  if (young >= 30) return 'прогресивен (разширяваща се основа)';
  if (old > young) return 'регресивен (стесняваща се основа)';
  return 'стационарен (почти прави стени)';
}

function femaleShare(i: number) {
  const a = 5 * i + 2.5;
  return a < 50 ? 0.486 : Math.min(0.75, 0.486 + (a - 50) * 0.0062);
}

export type Preset = {
  name: string;
  year: number;
  /** Общо население в милиони */
  total: number;
  /** Относителни размери на петгодишните групи (и двата пола) */
  shape: number[];
  tfr: number;
  e0: number;
};

/** Приблизителни пирамиди по данни на ООН (WPP 2024) и НСИ (преброяване 2021). */
export const PRESETS: Preset[] = [
  {
    name: 'Нигер',
    year: 2024,
    total: 27,
    shape: [19, 16, 13.5, 11, 9, 7.5, 6.2, 5, 3.9, 3, 2.3, 1.7, 1.2, 0.8, 0.5, 0.25, 0.1, 0.04, 0.01, 0, 0],
    tfr: 6,
    e0: 63,
  },
  {
    name: 'Индия',
    year: 2024,
    total: 1451,
    shape: [7.4, 7.8, 8.3, 8.6, 8.7, 8.6, 8.2, 7.6, 6.8, 6, 5.3, 4.5, 3.8, 3, 2.2, 1.4, 0.8, 0.35, 0.12, 0.03, 0],
    tfr: 2,
    e0: 72,
  },
  {
    name: 'България',
    year: 2021,
    total: 6.52,
    shape: [300, 330, 330, 310, 290, 330, 410, 450, 500, 480, 450, 450, 470, 470, 420, 300, 210, 110, 35, 7, 1],
    tfr: 1.7,
    e0: 75,
  },
  {
    name: 'Япония',
    year: 2024,
    total: 124,
    shape: [4.1, 4.8, 5.3, 5.5, 6, 6.3, 6.4, 7, 7.8, 9, 9.6, 8.2, 7.4, 7.6, 9.3, 7.8, 6.2, 4, 2, 0.5, 0.09],
    tfr: 1.2,
    e0: 85,
  },
];

export function initialPop(p: Preset): Pop {
  const s = p.shape.reduce((a, b) => a + b, 0);
  return {
    f: p.shape.map((v, i) => ((p.total * v) / s) * femaleShare(i)),
    m: p.shape.map((v, i) => ((p.total * v) / s) * (1 - femaleShare(i))),
  };
}

/** Населението на Земята, млрд. души (оценки на ООН; след 2024 г. – средният вариант на прогнозата WPP 2024). */
export const WORLD: [number, number][] = [
  [1700, 0.6],
  [1750, 0.79],
  [1800, 0.98],
  [1850, 1.26],
  [1900, 1.65],
  [1927, 2],
  [1950, 2.5],
  [1960, 3.02],
  [1974, 4],
  [1987, 5],
  [1999, 6],
  [2011, 7],
  [2022, 8],
  [2024, 8.16],
];
export const WORLD_UN: [number, number][] = [
  [2024, 8.16],
  [2030, 8.55],
  [2040, 9.19],
  [2050, 9.66],
  [2060, 9.98],
  [2070, 10.18],
  [2080, 10.29],
  [2090, 10.27],
  [2100, 10.18],
];

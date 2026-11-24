// Вграждания на думи в умален вид: вектори от съвместни срещания в малък корпус, косинусова близост и аналогии върху карта.

export const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
export const norm = (a: number[]) => Math.sqrt(dot(a, a));
/** Косинусова близост: 1 – еднаква посока, 0 – перпендикулярни, −1 – противоположни. За нулев вектор връща 0. */
export const cosine = (a: number[], b: number[]) => {
  const n = norm(a) * norm(b);
  return n === 0 ? 0 : dot(a, b) / n;
};
export const euclid = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));

/** Малък корпус: прости изречения за животни, напитки и храни, превозни средства и хора. */
export const CORPUS: string[] = [
  'Котката пие мляко в кухнята.',
  'Кучето пие вода на двора.',
  'Котката спи на дивана.',
  'Кучето спи на двора.',
  'Котката гони мишката в двора.',
  'Кучето гони котката на двора.',
  'Баба храни котката с месо.',
  'Дядо храни кучето с месо.',
  'Котката яде месо и пие мляко.',
  'Кучето яде месо и пие вода.',
  'Конят пие вода на двора.',
  'Конят яде трева на поляната.',
  'Кравата яде трева на поляната.',
  'Кравата пие вода на поляната.',
  'Дядо храни коня с трева.',
  'Баба храни кравата с трева.',
  'Конят тича по поляната.',
  'Кучето тича по поляната.',
  'Баба пие чай с мед.',
  'Дядо пие кафе с мляко.',
  'Мама пие кафе сутрин.',
  'Татко пие чай сутрин.',
  'Мама налива чай в чашата.',
  'Татко налива кафе в чашата.',
  'Баба налива мляко в чашата.',
  'Чашата с чай е гореща.',
  'Чашата с кафе е гореща.',
  'Детето пие сок сутрин.',
  'Мама налива сок в чашата.',
  'Детето пие мляко сутрин.',
  'Баба пече хляб в кухнята.',
  'Мама реже хляб в кухнята.',
  'Детето яде хляб и сирене.',
  'Татко яде хляб и сирене.',
  'Дядо реже сирене в кухнята.',
  'Влакът пристига на гарата.',
  'Автобусът пристига на спирката.',
  'Влакът тръгва от гарата сутрин.',
  'Автобусът тръгва от спирката сутрин.',
  'Влакът пътува до морето.',
  'Автобусът пътува до града.',
  'Татко пътува с влака до града.',
  'Мама пътува с автобуса до града.',
  'Влакът закъснява с час.',
  'Автобусът закъснява с час.',
  'Самолетът пристига на летището.',
  'Самолетът тръгва от летището сутрин.',
  'Самолетът закъснява с час.',
];

/** Служебни думи: срещат се до всичко и почти не казват нищо за смисъла. */
export const STOP = new Set(['в', 'на', 'с', 'и', 'е', 'от', 'до', 'по']);

export const tokenize = (s: string): string[] => s.toLowerCase().match(/[а-я]+/g) ?? [];

export type Counts = Map<string, Map<string, number>>;

/** За всяка дума – колко пъти всяка друга дума се среща на най-много `window` места от нея в същото изречение. */
export function cooccurrence(corpus: string[], window: number, dropStop: boolean): Counts {
  const counts: Counts = new Map();
  for (const sentence of corpus) {
    const words = tokenize(sentence).filter(w => !dropStop || !STOP.has(w));
    words.forEach((w, i) => {
      const row = counts.get(w) ?? new Map<string, number>();
      counts.set(w, row);
      for (let j = Math.max(0, i - window); j <= Math.min(words.length - 1, i + window); j++) if (j !== i) row.set(words[j], (row.get(words[j]) ?? 0) + 1);
    });
  }
  return counts;
}

/** Косинусова близост между редовете на две думи в таблицата. */
export function rowCosine(counts: Counts, a: string, b: string): number {
  const ra = counts.get(a);
  const rb = counts.get(b);
  if (!ra || !rb) return 0;
  let d = 0;
  for (const [k, v] of ra) d += v * (rb.get(k) ?? 0);
  const len = (r: Map<string, number>) => Math.sqrt([...r.values()].reduce((s, v) => s + v * v, 0));
  const n = len(ra) * len(rb);
  return n === 0 ? 0 : d / n;
}

/** Думите от `among`, подредени по близост до `word`. */
export const nearest = (counts: Counts, word: string, among: string[]) =>
  among
    .filter(w => w !== word)
    .map(w => ({ word: w, cos: rowCosine(counts, word, w) }))
    .sort((a, b) => b.cos - a.cos);

/** Най-честите съседи на думата. */
export const topContexts = (counts: Counts, word: string, n: number) =>
  [...(counts.get(word) ?? new Map<string, number>())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'bg')).slice(0, n);

/** Думите, които могат да се избират в лабораторията. */
export const TARGETS = ['котката', 'кучето', 'конят', 'кравата', 'чай', 'кафе', 'мляко', 'сок', 'хляб', 'влакът', 'автобусът', 'самолетът'];

// ---------- Карта за аналогии ----------

export type MapWord = { word: string; x: number; y: number; group: 'people' | 'places' };

/**
 * Опростена карта в две измерения, подредена на ръка: посоката „мъж → жена“ и посоката „обикновен → владетел“
 * са приблизително еднакви за всички двойки, както и посоката „държава → столица“. Малките отклонения са нарочни.
 */
export const WORD_MAP: MapWord[] = [
  { word: 'мъж', x: 1.0, y: 1.0, group: 'people' },
  { word: 'жена', x: 3.6, y: 1.3, group: 'people' },
  { word: 'цар', x: 1.4, y: 6.6, group: 'people' },
  { word: 'царица', x: 4.1, y: 6.8, group: 'people' },
  { word: 'принц', x: 0.7, y: 5.0, group: 'people' },
  { word: 'принцеса', x: 3.5, y: 5.4, group: 'people' },
  { word: 'момче', x: 0.5, y: 2.5, group: 'people' },
  { word: 'момиче', x: 3.0, y: 2.6, group: 'people' },
  { word: 'баща', x: 1.9, y: 3.6, group: 'people' },
  { word: 'майка', x: 4.6, y: 3.8, group: 'people' },
  { word: 'дядо', x: 2.3, y: 0.3, group: 'people' },
  { word: 'баба', x: 4.9, y: 0.5, group: 'people' },
  { word: 'актьор', x: 2.2, y: 2.1, group: 'people' },
  { word: 'актриса', x: 5.0, y: 2.2, group: 'people' },
  { word: 'лекар', x: 3.2, y: 4.4, group: 'people' },
  { word: 'България', x: 7.2, y: 1.2, group: 'places' },
  { word: 'София', x: 8.6, y: 4.3, group: 'places' },
  { word: 'Франция', x: 8.6, y: 0.6, group: 'places' },
  { word: 'Париж', x: 10.1, y: 3.8, group: 'places' },
  { word: 'Италия', x: 9.9, y: 1.4, group: 'places' },
  { word: 'Рим', x: 11.2, y: 4.6, group: 'places' },
  { word: 'Япония', x: 11.3, y: 0.4, group: 'places' },
  { word: 'Токио', x: 12.6, y: 3.6, group: 'places' },
  { word: 'Гърция', x: 7.6, y: 2.6, group: 'places' },
  { word: 'Атина', x: 9.2, y: 5.8, group: 'places' },
  { word: 'Берлин', x: 12.0, y: 6.0, group: 'places' },
];

export const mapWord = (w: string) => WORD_MAP.find(m => m.word === w)!;

/** Аналогията „a е за b, както c е за ?“: точката b − a + c и думите, подредени по разстояние до нея. */
export function analogy(a: string, b: string, c: string, exclude = true) {
  const A = mapWord(a);
  const B = mapWord(b);
  const C = mapWord(c);
  const target = { x: B.x - A.x + C.x, y: B.y - A.y + C.y };
  const ranked = WORD_MAP.filter(m => !exclude || ![a, b, c].includes(m.word))
    .map(m => ({ word: m.word, d: Math.hypot(m.x - target.x, m.y - target.y) }))
    .sort((p, q) => p.d - q.d);
  return { target, ranked };
}

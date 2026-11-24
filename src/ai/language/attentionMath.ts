// Внимание: оценки със скаларно произведение, софтмакс и претеглена средна – и малък, нагласен на ръка модел за изречения.

export type Vec = number[];

export const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0);

/** Софтмакс: положителни тегла със сбор 1. */
export function softmax(scores: number[]): number[] {
  const top = Math.max(...scores);
  const e = scores.map(s => Math.exp(s - top));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / sum);
}

/** Претеглена средна на векторите `values` с тегла `weights`. */
export function mix(values: Vec[], weights: number[]): Vec {
  return values[0].map((_, d) => values.reduce((s, v, i) => s + weights[i] * v[d], 0));
}

/**
 * Една заявка към няколко ключа: оценка = q·k / √d, умножена по „остротата“,
 * тегла = софтмакс на оценките, изход = претеглена средна на стойностите.
 */
export function attend(query: Vec, keys: Vec[], values: Vec[], sharpness = 1) {
  const scores = keys.map(k => (sharpness * dot(query, k)) / Math.sqrt(query.length));
  const weights = softmax(scores);
  return { scores, weights, out: mix(values, weights) };
}

// ---------- Нагласен на ръка модел за изречения ----------

/** Признаците, по които главата „по смисъл“ сравнява думите. */
export const MEANING = ['прическа', 'сечиво', 'живо същество', 'предмет'] as const;
/** Признаците на главата „по граматика“. */
export const GRAMMAR = ['съществително от ж. р.', 'съществително от м. р.'] as const;

export type Word = {
  text: string;
  /** Заявка и ключ в главата „по смисъл“ (по признаците MEANING); липсват → нулев вектор. */
  mq?: Vec;
  mk?: Vec;
  /** Заявка и ключ в главата „по граматика“ (по признаците GRAMMAR). */
  gq?: Vec;
  gk?: Vec;
};

export type Sentence = { id: string; label: string; words: Word[]; /** Думата, избрана в началото, в главата „по смисъл“ и в главата „по граматика“. */ focus: number; gfocus: number; note: [string, string] };

const FEM: Vec = [2, 0];
const MASC: Vec = [0, 2];

export const SENTENCES: Sentence[] = [
  {
    id: 'hair',
    label: 'коса (прическа)',
    focus: 4,
    gfocus: 2,
    words: [
      { text: 'Мария', mk: [0, 0, 1, 0], gk: [1, 0] },
      { text: 'среса', mk: [2, 0, 0, 0], gq: [1, 1] },
      { text: 'дългата', mk: [0.5, 0, 0, 0], gq: [2, 0] },
      { text: 'си', gq: [1, 1] },
      { text: 'коса', mq: [2, 2, 0, 0], gk: FEM },
    ],
    note: ['„коса“ пита: „има ли наоколо нещо за прически или за сечива?“ Отговаря „среса“ – и новият вектор на думата се измества към прическата.', '„дългата“ търси съществително от женски род и намира „коса“ (и по-слабо „Мария“).'],
  },
  {
    id: 'scythe',
    label: 'коса (сечиво)',
    focus: 3,
    gfocus: 2,
    words: [
      { text: 'Дядо', mk: [0, 0, 1, 0], gk: MASC },
      { text: 'наточи', mk: [0, 2, 0, 0], gq: [1, 1] },
      { text: 'старата', gq: [2, 0] },
      { text: 'коса', mq: [2, 2, 0, 0], gk: FEM },
      { text: 'и' },
      { text: 'окоси', mk: [0, 2, 0, 0], gq: [1, 1] },
      { text: 'ливадата', mk: [0, 1.5, 0, 0], gk: FEM },
    ],
    note: ['Същата дума със същата заявка – но сега отговарят „наточи“, „окоси“ и „ливадата“. Векторът на „коса“ се измества към сечивото.', '„старата“ търси съществително от женски род. Има две – „коса“ и „ливадата“ – и без сведение за реда на думите главата не може да избере по-близкото.'],
  },
  {
    id: 'tall',
    label: 'тя … висока',
    focus: 8,
    gfocus: 6,
    words: [
      { text: 'Котката', mk: [0, 0, 2, 0], gk: FEM },
      { text: 'не' },
      { text: 'скочи', gq: [1, 1] },
      { text: 'на' },
      { text: 'масата', mk: [0, 0, 0, 2], gk: FEM },
      { text: 'защото' },
      { text: 'тя', gq: [2, 0] },
      { text: 'беше' },
      { text: 'висока', mq: [0, 0, 0.5, 2] },
    ],
    note: ['„висока“ търси най-вече предмет и намира „масата“.', '„тя“ търси съществително от женски род – а те са две. Теглата се делят почти поравно: само с граматика въпросът „коя е тя“ няма отговор.'],
  },
  {
    id: 'tired',
    label: 'тя … уморена',
    focus: 8,
    gfocus: 6,
    words: [
      { text: 'Котката', mk: [0, 0, 2, 0], gk: FEM },
      { text: 'не' },
      { text: 'скочи', gq: [1, 1] },
      { text: 'на' },
      { text: 'масата', mk: [0, 0, 0, 2], gk: FEM },
      { text: 'защото' },
      { text: 'тя', gq: [2, 0] },
      { text: 'беше' },
      { text: 'уморена', mq: [0, 0, 2.5, 0] },
    ],
    note: ['Сменихме само последната дума. „уморена“ търси живо същество и намира „Котката“.', '„тя“ пак се колебае между двете съществителни. В истински модел следващ слой би я свързал с „уморена“, която вече е „видяла“ котката.'],
  },
];

export type HeadId = 'meaning' | 'grammar';

/** Матрицата на вниманието за едно изречение: ред i – теглата, с които дума i гледа към всяка дума. */
export function attentionMatrix(s: Sentence, head: HeadId): number[][] {
  const size = head === 'meaning' ? MEANING.length : GRAMMAR.length;
  const zero = Array.from({ length: size }, () => 0);
  const q = s.words.map(w => (head === 'meaning' ? w.mq : w.gq) ?? zero);
  const k = s.words.map(w => (head === 'meaning' ? w.mk : w.gk) ?? zero);
  return q.map(qi => softmax(k.map(kj => dot(qi, kj))));
}

// ---------- Верига с памет срещу внимание ----------

/**
 * Опростена „верига с памет“: h ← a·h + (1 − a)·x на всяка дума.
 * Връща дела на всяка от n-те думи в крайното състояние (сборът клони към 1).
 */
export function chainShares(n: number, keep: number): number[] {
  return Array.from({ length: n }, (_, i) => (1 - keep) * keep ** (n - 1 - i));
}

/** Брой двойки (дума, дума), за които самовниманието пресмята тегло. */
export const pairCount = (n: number) => n * n;

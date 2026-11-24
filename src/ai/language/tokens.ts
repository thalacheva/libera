// Текстът като числа: байтове UTF-8, сливане на най-честите двойки (BPE) и езиков модел по броене (n-грами).

import { mulberry32 } from '../history/rollouts';

/** Малък учебен текст на български (написан за урока) – върху него се обучават речникът и моделът по броене. */
export const CORPUS = [
  'селото е малко и стои до реката. реката идва от планината и тече към голямото поле.',
  'сутрин над водата има мъгла, а по обед слънцето я вдига и полето светва.',
  'в селото има стара воденица, малко училище и една пекарна. пекарят става преди всички и пали пещта, докато още е тъмно.',
  'когато децата тръгват към училището, хлябът вече е готов и мирише по цялата улица.',
  'през пролетта снегът в планината се топи и реката става голяма и бърза. водата носи клони и листа и шуми под моста.',
  'децата стоят на моста и гледат как водата минава под тях. старите хора казват, че реката помни всяка зима.',
  'през лятото реката става малка и тиха. децата се къпят в нея, а кравите идват да пият вода.',
  'по обед всички търсят сянка под старата върба. там дядо петър разказва как едно време е работила воденицата.',
  'воденицата е мляла жито за цялото село и за съседните села. хората са идвали с каруци и са чакали реда си по цял ден.',
  'докато са чакали, са говорили за времето, за житото и за реката.',
  'през есента листата на върбата пожълтяват и падат във водата. реката ги носи надолу към полето.',
  'хората прибират житото и царевицата, а пекарят пече хляб от новото брашно. новият хляб е най-хубавият хляб през годината.',
  'децата носят по един топъл хляб на старите хора в селото.',
  'през зимата реката замръзва край бреговете, а по средата водата още тече. снегът покрива полето, моста и покрива на воденицата.',
  'сутрин се вижда димът от пекарната, а после и от всяка къща. децата правят пързалка до училището и се връщат вкъщи с червени бузи.',
  'вечер хората стоят край печката и разказват стари истории. дядо петър казва, че всяка история започва от реката и свършва при хляба.',
  'после идва пролетта, снегът пак се топи и всичко започва отначало.',
  'учителката в малкото училище казва на децата да пишат за селото. едно момиче пише за реката, едно момче пише за воденицата, а най-малкото дете пише за хляба.',
  'учителката чете всичко и казва, че от трите истории става една голяма история за селото.',
  'в неделя има пазар на площада. хората от съседните села идват с каруци и носят ябълки, мед и сирене.',
  'пекарят продава хляб и малки питки, а децата гледат какво има по масите. на пазара всеки пита за времето и за реката.',
  'ако реката е голяма, казват, че годината ще е добра. ако реката е малка, казват, че трябва да се пази водата.',
  'така минава годината в селото до реката. времето се сменя, водата тече, хлябът се пече и хората разказват.',
].join(' ');

// ---------- Знаци и байтове ----------

/** Байтовете на текста в UTF-8. */
export const utf8Bytes = (text: string): number[] => Array.from(new TextEncoder().encode(text));

/** Знаците на текста (един емотикон е един знак, макар в JavaScript да заема две позиции). */
export const chars = (text: string): string[] => Array.from(text);

export const hex = (b: number) => b.toString(16).toUpperCase().padStart(2, '0');

// ---------- Сливане на най-честите двойки (BPE) ----------

/** Знакът, с който отбелязваме интервала пред дума – той е част от токена. */
export const SPACE = '␣';

/** Текстът като думи, всяка разбита на знаци; пред всяка дума освен първата стои знакът за интервал. */
export function toWords(text: string): string[][] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (i === 0 ? chars(w) : [SPACE, ...chars(w)]));
}

export type Pair = { a: string; b: string; count: number };

/** Всички двойки съседни токени (само вътре в думите) с броя им, подредени от най-честата; при равенство – по реда на първата поява. */
export function countPairs(words: string[][]): Pair[] {
  const seen = new Map<string, Pair>();
  for (const w of words)
    for (let i = 0; i + 1 < w.length; i++) {
      const key = `${w[i]}\u0000${w[i + 1]}`;
      const p = seen.get(key);
      if (p) p.count++;
      else seen.set(key, { a: w[i], b: w[i + 1], count: 1 });
    }
  // Map пази реда на вмъкване, а sort е устойчив – равните остават по реда на първата поява
  return [...seen.values()].sort((x, y) => y.count - x.count);
}

/** Слива навсякъде двойката (a, b) в един токен. */
export function mergePair(words: string[][], a: string, b: string): string[][] {
  return words.map(w => {
    const out: string[] = [];
    for (let i = 0; i < w.length; i++) {
      if (i + 1 < w.length && w[i] === a && w[i + 1] === b) {
        out.push(a + b);
        i++;
      } else out.push(w[i]);
    }
    return out;
  });
}

export type Merge = [string, string];

/** Обучава речник: до `steps` сливания; спира, когато никоя двойка не се среща поне два пъти. */
export function trainBpe(text: string, steps: number): Merge[] {
  let words = toWords(text);
  const merges: Merge[] = [];
  for (let s = 0; s < steps; s++) {
    const best = countPairs(words)[0];
    if (!best || best.count < 2) break;
    merges.push([best.a, best.b]);
    words = mergePair(words, best.a, best.b);
  }
  return merges;
}

/** Нарязва текст на токени с вече обучен списък от сливания (прилагат се в реда, в който са научени). */
export function encode(text: string, merges: Merge[]): string[] {
  let words = toWords(text);
  for (const [a, b] of merges) words = mergePair(words, a, b);
  return words.flat();
}

/** Речникът: отделните знаци на обучаващия текст (по азбучен ред) и след тях слетите токени по реда на сливане. */
export function vocabulary(text: string, merges: Merge[]): string[] {
  const base = [...new Set(toWords(text).flat())].sort();
  return [...base, ...merges.map(([a, b]) => a + b)];
}

export const totalTokens = (words: string[][]) => words.reduce((s, w) => s + w.length, 0);

// ---------- Модел по броене (n-грами) ----------

export type Ngram = {
  /** ред n: следващият знак се предсказва по предишните n − 1 */
  order: number;
  /** контекст → (следващ знак → колко пъти) */
  table: Map<string, Map<string, number>>;
  alphabet: string[];
};

export function buildNgram(text: string, order: number): Ngram {
  const cs = chars(text);
  const table = new Map<string, Map<string, number>>();
  const k = order - 1;
  for (let i = k; i < cs.length; i++) {
    const ctx = cs.slice(i - k, i).join('');
    let row = table.get(ctx);
    if (!row) table.set(ctx, (row = new Map()));
    row.set(cs[i], (row.get(cs[i]) ?? 0) + 1);
  }
  return { order, table, alphabet: [...new Set(cs)].sort() };
}

export type Next = { ch: string; count: number; p: number };

/** Разпределението на следващия знак след даден текст; ако контекстът не е срещан, се опитва с по-къс. */
export function nextDist(m: Ngram, text: string): { context: string; next: Next[] } {
  const cs = chars(text);
  for (let k = Math.min(m.order - 1, cs.length); k >= 0; k--) {
    const ctx = cs.slice(cs.length - k).join('');
    // по-късите контексти не са в таблицата на модела – броим ги направо от по-дългите
    const row = k === m.order - 1 ? m.table.get(ctx) : shorter(m, ctx);
    if (row && row.size) {
      const total = [...row.values()].reduce((s, v) => s + v, 0);
      const next = [...row.entries()].map(([ch, count]) => ({ ch, count, p: count / total })).sort((x, y) => y.count - x.count);
      return { context: ctx, next };
    }
  }
  return { context: '', next: [] };
}

function shorter(m: Ngram, suffix: string): Map<string, number> {
  const row = new Map<string, number>();
  for (const [ctx, r] of m.table) if (ctx.endsWith(suffix)) for (const [ch, c] of r) row.set(ch, (row.get(ch) ?? 0) + c);
  return row;
}

/** Генерира `length` знака един по един, като всеки се тегли според броенето; резултатът зависи само от `seed`. */
export function generate(m: Ngram, start: string, length: number, seed: number): string {
  const random = mulberry32(seed);
  let out = start;
  for (let i = 0; i < length; i++) {
    const { next } = nextDist(m, out);
    if (!next.length) break;
    let r = random();
    let ch = next[next.length - 1].ch;
    for (const n of next) {
      r -= n.p;
      if (r < 0) {
        ch = n.ch;
        break;
      }
    }
    out += ch;
  }
  return out;
}

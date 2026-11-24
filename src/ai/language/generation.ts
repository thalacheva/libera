// Как от вероятности за следващия токен става текст: софтмакс с температура, отрязване по k и по p, избор
// и един съвсем малък модел за опити – брои коя дума след коя идва в 47 кратки изречения.

import { mulberry32 } from '../history/rollouts';

/** Оценки (логити) → вероятности. Оценките се делят на температурата T преди софтмакса. */
export function softmax(logits: number[], T = 1): number[] {
  const top = Math.max(...logits);
  const e = logits.map(v => Math.exp((v - top) / T));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / sum);
}

/** Оставя само k-те най-вероятни и ги нормира наново; останалите стават 0. */
export function topK(p: number[], k: number): number[] {
  const order = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const keep = new Set(order.slice(0, k).map(o => o[1]));
  const sum = order.slice(0, k).reduce((s, o) => s + o[0], 0);
  return p.map((v, i) => (keep.has(i) ? v / sum : 0));
}

/** „Ядрото“: най-малкият набор от най-вероятни кандидати с обща вероятност поне `mass`. */
export function topP(p: number[], mass: number): number[] {
  const order = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const keep = new Set<number>();
  let sum = 0;
  for (const [v, i] of order) {
    if (v === 0) break;
    keep.add(i);
    sum += v;
    if (sum >= mass - 1e-12) break;
  }
  return p.map((v, i) => (keep.has(i) ? v / sum : 0));
}

/** Ентропия в натурални единици; exp от нея е „между колко равновероятни варианта се колебае“ разпределението. */
export const entropy = (p: number[]) => -p.reduce((s, v) => s + (v > 0 ? v * Math.log(v) : 0), 0);
export const choices = (p: number[]) => Math.exp(entropy(p));

export const argMax = (p: number[]) => p.reduce((best, v, i) => (v > p[best] ? i : best), 0);

/** Избор според вероятностите с едно случайно число r от [0; 1). */
export function sample(p: number[], r: number): number {
  let acc = 0;
  let last = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] === 0) continue;
    acc += p[i];
    last = i;
    if (r < acc) return i;
  }
  return last;
}

/** Перплексия: exp от средната „изненада“ −ln p на токен. */
export const perplexity = (probs: number[]) => (probs.length ? Math.exp(-probs.reduce((s, v) => s + Math.log(v), 0) / probs.length) : 1);

// ---------- Малкият модел ----------

export const END = '■';
const START = '▶';

/** Целият „обучаващ текст“ на модела. */
export const CORPUS = [
  'котката спи на дивана',
  'котката спи на прозореца',
  'котката гледа през прозореца',
  'котката гледа птиците в градината',
  'котката гони мишката в градината',
  'котката яде риба в кухнята',
  'кучето спи на двора',
  'кучето гони котката в градината',
  'кучето гони топката на двора',
  'кучето гледа през оградата',
  'кучето яде хляб в кухнята',
  'детето гони топката на двора',
  'детето гледа през прозореца',
  'детето чете книга на дивана',
  'детето чете книга в градината',
  'детето рисува котката',
  'детето рисува птиците в градината',
  'детето яде баница в кухнята',
  'баба чете книга в градината',
  'баба гледа птиците през прозореца',
  'баба пече баница в кухнята',
  'баба пече хляб в кухнята',
  'дядо чете вестник в градината',
  'дядо чете вестник на дивана',
  'дядо гледа кучето през прозореца',
  'птиците пеят в градината',
  'птиците пеят на оградата',
  'птиците гледат котката',
  'мишката спи в кухнята',
  'мишката гледа котката през оградата',
  'мишката яде хляб в кухнята',
  'котката спи на дивана и кучето спи на двора',
  'баба пече баница в кухнята и дядо чете вестник в градината',
  'детето чете книга на дивана и котката спи на прозореца',
  'птиците пеят в градината и детето рисува птиците',
  'кучето гони котката в градината и котката гони мишката в кухнята',
  'мишката яде хляб в кухнята и котката гледа мишката',
  'дядо чете вестник в градината и кучето спи на двора',
  'баба чете книга в градината и птиците пеят на оградата',
  'котката гледа птиците в градината и птиците гледат котката',
  'детето гони топката на двора и кучето гони детето',
  'кучето гледа котката и котката гледа кучето',
  'баба пече хляб в кухнята и мишката гледа през прозореца',
  'дядо гледа птиците в градината и баба гледа дядо',
  'баба чете книга на дивана и дядо гледа през прозореца',
  'котката спи на дивана и детето рисува котката',
  'дядо спи на дивана и баба пече баница',
];

const sentences = CORPUS.map(s => [START, ...s.split(' '), END]);
/** Речникът: всички различни думи и знакът за край. */
export const VOCAB = [...new Set(sentences.flatMap(s => s.slice(1)))];
const index = new Map(VOCAB.map((w, i) => [w, i]));
const counts = new Map<string, number[]>();
for (const s of sentences)
  for (let i = 0; i + 1 < s.length; i++) {
    const row = counts.get(s[i]) ?? VOCAB.map(() => 0);
    row[index.get(s[i + 1])!] += 1;
    counts.set(s[i], row);
  }

/** Колко „въображаеми“ срещания получава всяка двойка думи, която я няма в текста – за да не е вероятността ѝ точно нула. */
const SMOOTH = 0.002;

/** Оценките (логитите) на модела за следващата дума. Моделът гледа само последната дума от текста. */
export function nextLogits(text: string[]): number[] {
  const row = counts.get(text.length ? text[text.length - 1] : START) ?? VOCAB.map(() => 0);
  return row.map(c => Math.log(c + SMOOTH));
}

export type Strategy = 'greedy' | 'sample' | 'topk' | 'topp';
export const TOP_K = 3;
export const TOP_P = 0.9;

/** Разпределението, от което се избира, при дадена стратегия и температура. */
export function choiceProbs(text: string[], strategy: Strategy, T: number): number[] {
  const p = softmax(nextLogits(text), T);
  if (strategy === 'greedy') return topK(softmax(nextLogits(text)), 1);
  if (strategy === 'topk') return topK(p, TOP_K);
  if (strategy === 'topp') return topP(p, TOP_P);
  return p;
}

/** Случайното число за стъпка `step` при семе `seed` – едно и също семе дава един и същ текст. */
export const randomAt = (seed: number, step: number) => mulberry32(seed * 7919 + step * 104729 + 1)();

/** Следващата дума. */
export function nextToken(text: string[], strategy: Strategy, T: number, seed: number): string {
  const p = choiceProbs(text, strategy, T);
  return VOCAB[strategy === 'greedy' ? argMax(p) : sample(p, randomAt(seed, text.length))];
}

/** Пише, докато стигне знака за край или `max` думи. */
export function write(start: string[], strategy: Strategy, T: number, seed: number, max: number): string[] {
  const text = [...start];
  while (text.length < max && text[text.length - 1] !== END) text.push(nextToken(text, strategy, T, seed));
  return text;
}

/** Вероятността, която моделът (при T = 1, без отрязване) дава на всяка дума от текста. */
export function tokenProbs(text: string[]): number[] {
  return text.map((w, i) => softmax(nextLogits(text.slice(0, i)))[index.get(w)!]);
}

/** Вярно, ако краят на текста повтаря последните `n` думи непосредствено преди тях. */
export function loops(text: string[], n = 4): boolean {
  if (text.length < 2 * n) return false;
  for (let i = 0; i < n; i++) if (text[text.length - 1 - i] !== text[text.length - 1 - n - i]) return false;
  return true;
}

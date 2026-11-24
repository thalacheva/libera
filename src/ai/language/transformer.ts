// Помощни сметки за урока „Трансформърът“: позиционно кодиране, маска към бъдещето и броене на параметри.

/** Синусоидално позиционно кодиране: вектор с `d` числа (d е четно) за позиция `pos`. */
export function positionVector(pos: number, d: number): number[] {
  const v: number[] = [];
  for (let i = 0; i < d / 2; i++) {
    const angle = pos / 10000 ** ((2 * i) / d);
    v.push(Math.sin(angle), Math.cos(angle));
  }
  return v;
}

/** Близост (косинус на ъгъла) между кодовете на две позиции; зависи само от разстоянието между тях. */
export function positionSimilarity(p: number, q: number, d: number): number {
  const a = positionVector(p, d);
  const b = positionVector(q, d);
  // Всеки код има дължина √(d/2), защото sin² + cos² = 1 за всяка двойка
  return a.reduce((s, v, i) => s + v * b[i], 0) / (d / 2);
}

/** Маска към бъдещето: позиция `row` вижда позиция `col` само ако col ≤ row. */
export const canSee = (row: number, col: number, masked: boolean) => !masked || col <= row;

/** Брой разрешени двойки „кой гледа – кого вижда“ при n токена. */
export const visiblePairs = (n: number, masked: boolean) => (masked ? (n * (n + 1)) / 2 : n * n);

export type Size = { vocab: number; d: number; layers: number };

/** Приблизителен брой параметри: таблица с вграждания V·d и по 4d² (внимание) + 8d² (мрежа с прав ход) на блок. */
export function countParams({ vocab, d, layers }: Size) {
  const embedding = vocab * d;
  const attention = 4 * d * d;
  const mlp = 8 * d * d;
  const blocks = layers * (attention + mlp);
  return { embedding, attention, mlp, block: attention + mlp, blocks, total: embedding + blocks };
}

/** Софтмакс: от оценки към вероятности. */
export function softmax(scores: number[]): number[] {
  const top = Math.max(...scores);
  const e = scores.map(s => Math.exp(s - top));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / sum);
}

/** Запис на голямо число с думи: 123,3 млн., 9,87 млрд. */
export function bigNumber(n: number): string {
  const f = (v: number, digits: number) => v.toLocaleString('bg-BG', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  if (n >= 1e12) return `${f(n / 1e12, 2)} трлн.`;
  if (n >= 1e9) return `${f(n / 1e9, 2)} млрд.`;
  if (n >= 1e6) return `${f(n / 1e6, 1)} млн.`;
  if (n >= 1e3) return `${f(n / 1e3, 1)} хил.`;
  return String(n);
}

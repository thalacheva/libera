// Общи помощници за тренажорите (src/Trainer.tsx).

export const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
export const pick = <T,>(xs: T[]) => xs[randInt(0, xs.length - 1)];
export const nonZero = (min: number, max: number) => {
  let v = 0;
  while (v === 0) v = randInt(min, max);
  return v;
};
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Число или дроб в LaTeX: 3/2 → \frac{3}{2}, −1/4 → -\frac{1}{4}. */
export function fracTex(p: number, q: number) {
  const g = gcd(p, q);
  const [a, b] = [p / g, q / g];
  const [n, d] = b < 0 ? [-a, -b] : [a, b];
  if (d === 1) return String(n);
  return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
}

/** Многочлен в LaTeX от събираеми [коефициент, степен]: [[3, 2], [-5, 1], [1, 0]] → 3x^2 - 5x + 1. */
export function polyTex(terms: [number, number][]) {
  let s = '';
  for (const [c, p] of terms) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const x = p === 0 ? '' : p === 1 ? 'x' : `x^${p}`;
    const body = abs === 1 && p !== 0 ? x : `${abs}${x}`;
    s += s === '' ? (c < 0 ? `-${body}` : body) : c < 0 ? ` - ${body}` : ` + ${body}`;
  }
  return s || '0';
}

/** Отрицателните числа в скоби: −3 → (−3). */
export const paren = (v: number) => (v < 0 ? `(${v})` : String(v));

/** Задача за тренажора: формула, въпрос, отговор num/den и стъпки на решението (с $…$). */
export type Drill = { tex: string; ask: string; num: number; den: number; steps: string[] };

export function parseNum(s: string) {
  const t = s.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
  if (t === '') return null;
  if (t.includes('/')) {
    const [p, q] = t.split('/').map(Number);
    return Number.isNaN(p) || Number.isNaN(q) || q === 0 ? null : p / q;
  }
  const v = Number(t);
  return Number.isNaN(v) ? null : v;
}

import { fmt, Point } from '~/geometry/diagramMath';

/** Корените на ax² + bx + c (без повторения), подредени по големина. */
export function roots(a: number, b: number, c: number) {
  const D = b * b - 4 * a * c;
  if (D < 0) return [];
  if (D === 0) return [-b / (2 * a)];
  const s = Math.sqrt(D);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q);
}

// ---------- Запис на формули ----------

/** Точка в българския запис: A(2; −3). */
export const point = (p: Point) => `(${num(p.x)}; ${num(p.y)})`;

/** Число с истински знак минус. */
export const num = (v: number, digits = 2) => {
  const s = fmt(v, digits);
  // −0 и малки отрицателни числа, закръглени до 0, се показват като 0
  return s === '-0' ? '0' : s.replace('-', '−');
};

/** Събираемо със знак: „+ 3“, „− 3“; нулевите събираеми се пропускат. */
const term = (coef: number, variable: string, first: boolean) => {
  if (coef === 0) return '';
  const abs = Math.abs(coef);
  const body = variable && abs === 1 ? variable : `${num(abs)}${variable}`;
  if (first) return coef < 0 ? `−${body}` : body;
  return coef < 0 ? ` − ${body}` : ` + ${body}`;
};

/** Многочлен по степените – напр. [1, −4, 3] → x² − 4x + 3. */
export function polynomial(coefs: number[]) {
  const vars = ['x²', 'x', ''].slice(3 - coefs.length);
  let s = '';
  coefs.forEach((c, i) => {
    s += term(c, vars[i], s === '');
  });
  return s || '0';
}

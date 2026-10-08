import { num } from '~/functions/functionMath';

// Линейно уравнение ax + by = c
export type Eq = { a: number; b: number; c: number };

/** Член с коефициент: 1·x → x, −1·x → −x, 0 → празно. */
const term = (k: number, v: string) => (k === 1 ? v : k === -1 ? `−${v}` : `${num(k)}${v}`);

/** Записва ax + by = c без излишни 1, 0 и знаци. */
export function fmtEq({ a, b, c }: Eq) {
  let left = '';
  if (a !== 0) left = term(a, 'x');
  if (b !== 0) left = left === '' ? term(b, 'y') : `${left} ${b > 0 ? '+' : '−'} ${term(Math.abs(b), 'y')}`;
  return `${left === '' ? '0' : left} = ${num(c)}`;
}

/** Детерминантите на системата (правило на Крамер). */
export function dets(e1: Eq, e2: Eq) {
  return {
    D: e1.a * e2.b - e2.a * e1.b,
    Dx: e1.c * e2.b - e2.c * e1.b,
    Dy: e1.a * e2.c - e2.a * e1.c,
  };
}

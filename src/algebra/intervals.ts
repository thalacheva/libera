import { num } from '~/functions/functionMath';

/** Интервал от решението; from/to могат да са ±Infinity. При from = to – една точка. */
export type Piece = { from: number; to: number; fromClosed: boolean; toClosed: boolean };

export type Rel = '<' | '≤' | '>' | '≥';
export const RELS: Rel[] = ['<', '≤', '>', '≥'];

/** Обратният знак – при умножение по отрицателно число. */
export const flip = (r: Rel): Rel => ({ '<': '>', '≤': '≥', '>': '<', '≥': '≤' })[r] as Rel;

export const strict = (r: Rel) => r === '<' || r === '>';

/** Решението на x REL k като интервал. */
export function ray(rel: Rel, k: number): Piece {
  return rel === '<' || rel === '≤'
    ? { from: -Infinity, to: k, fromClosed: false, toClosed: rel === '≤' }
    : { from: k, to: Infinity, fromClosed: rel === '≥', toClosed: false };
}

/** Решението в интервален запис: (−∞; 2] ∪ {5} ∪ (7; +∞). */
export function fmtPieces(pieces: Piece[]) {
  if (pieces.length === 0) return '∅ (няма решение)';
  return pieces
    .map(p => {
      if (p.from === -Infinity && p.to === Infinity) return '(−∞; +∞)';
      if (p.from === p.to) return `{${num(p.from)}}`;
      const l = p.from === -Infinity ? '(−∞' : `${p.fromClosed ? '[' : '('}${num(p.from)}`;
      const r = p.to === Infinity ? '+∞)' : `${num(p.to)}${p.toClosed ? ']' : ')'}`;
      return `${l}; ${r}`;
    })
    .join(' ∪ ');
}

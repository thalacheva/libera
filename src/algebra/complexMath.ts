import { num } from '~/functions/functionMath';
import type { Point } from '~/geometry/diagramMath';

/** a + bi като текст: 3 − 2i, −i, 4. */
export function complexText({ x: a, y: b }: Point) {
  const re = num(a);
  if (Math.abs(b) < 1e-9) return re;
  const im = Math.abs(b) === 1 ? 'i' : `${num(Math.abs(b))}i`;
  if (Math.abs(a) < 1e-9) return b < 0 ? `−${im}` : im;
  return `${re} ${b < 0 ? '−' : '+'} ${im}`;
}

// Числови изрази за урока „Смесени задачи“: токени, ред на действията и случайни изрази с цели резултати.

import { pick, randInt } from './kidsMath';

export type Op = '+' | '−' | '·' | ':';
export type Tok = { t: 'n'; v: number } | { t: 'op'; v: Op } | { t: '(' } | { t: ')' };

const apply = (a: number, op: Op, b: number) => (op === '+' ? a + b : op === '−' ? a - b : op === '·' ? a * b : a / b);
const high = (op: Op) => op === '·' || op === ':';

export const toText = (toks: Tok[]) =>
  toks
    .map(t => (t.t === 'n' ? String(t.v) : t.t === 'op' ? ` ${t.v} ` : t.t))
    .join('')
    .trim();

/**
 * Индексът на действието, което се прави първо по правилата от училище:
 * първо в най-вътрешните скоби; в тях първо · и :, после + и −; при равни – отляво надясно.
 * Връща всички „най-леви“ кандидати от различните най-вътрешни скоби (всеки от тях може да е пръв).
 */
export function nextOps(toks: Tok[]): number[] {
  // групи: [начало, край] на всяка двойка скоби без вложени скоби в нея, а ако няма скоби – целият израз
  const groups: [number, number][] = [];
  const stack: number[] = [];
  let hasParens = false;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.t === '(') {
      stack.push(i);
      hasParens = true;
    } else if (t.t === ')') {
      const s = stack.pop()!;
      if (!toks.slice(s + 1, i).some(x => x.t === '(')) groups.push([s + 1, i - 1]);
    }
  }
  if (!hasParens) groups.push([0, toks.length - 1]);
  const out: number[] = [];
  for (const [a, b] of groups) {
    const ops: number[] = [];
    for (let i = a; i <= b; i++) if (toks[i].t === 'op') ops.push(i);
    if (!ops.length) continue;
    const hi = ops.filter(i => high((toks[i] as { v: Op }).v));
    out.push((hi.length ? hi : ops)[0]);
  }
  return out;
}

/** Стойността на действието с индекс i (числата отляво и отдясно). */
export function valueAt(toks: Tok[], i: number) {
  const a = toks[i - 1] as { v: number };
  const b = toks[i + 1] as { v: number };
  return apply(a.v, (toks[i] as { v: Op }).v, b.v);
}

/** Извършва действието i и маха излишните скоби около самотно число. */
export function reduceAt(toks: Tok[], i: number): Tok[] {
  const v = valueAt(toks, i);
  let out: Tok[] = [...toks.slice(0, i - 1), { t: 'n', v }, ...toks.slice(i + 2)];
  const j = i - 1;
  if (out[j - 1]?.t === '(' && out[j + 1]?.t === ')') out = [...out.slice(0, j - 1), out[j], ...out.slice(j + 2)];
  return out;
}

/** Пресмята целия израз по реда на действията; null, ако някъде има дробно или отрицателно число или над max. */
export function evaluate(toks: Tok[], max: number): { value: number; steps: Tok[][] } | null {
  const steps: Tok[][] = [toks];
  let cur = toks;
  while (cur.length > 1) {
    const i = nextOps(cur)[0];
    const v = valueAt(cur, i);
    if (!Number.isInteger(v) || v < 0 || v > max) return null;
    cur = reduceAt(cur, i);
    steps.push(cur);
  }
  return { value: (cur[0] as { v: number }).v, steps };
}

// ---------- Случайни изрази ----------

export type ExprLevel = 'two' | 'paren' | 'three';

// Шаблони: n – число, останалото са знаци. „(“ и „)“ – скоби.
const PATTERNS: Record<ExprLevel, string[]> = {
  two: ['n+n·n', 'n·n+n', 'n−n·n', 'n·n−n', 'n+n:n', 'n:n+n', 'n−n:n', 'n:n−n', 'n·n:n', 'n+n−n', 'n−n+n'],
  paren: ['(n+n)·n', 'n·(n+n)', '(n−n)·n', 'n·(n−n)', '(n+n):n', 'n−(n+n)', 'n−(n−n)', '(n−n):n', 'n:(n−n)', 'n:(n+n)'],
  three: ['n+n·n−n', 'n·n+n·n', 'n·n−n·n', 'n:n+n·n', 'n+n·n:n', '(n+n)·n−n', 'n·(n+n)−n', 'n−(n+n):n', '(n+n)·(n−n)', 'n+n·(n−n)'],
};

function parse(pattern: string): Tok[] {
  return pattern.split('').map((c): Tok => {
    if (c === 'n') return { t: 'n', v: 0 };
    if (c === '(' || c === ')') return { t: c };
    return { t: 'op', v: c as Op };
  });
}

/** Подходящо случайно число за място i според знаците до него. */
function fill(toks: Tok[], i: number): number {
  const left = toks[i - 1];
  const right = toks[i + 1];
  const opL = left?.t === 'op' ? left.v : null;
  const opR = right?.t === 'op' ? right.v : null;
  if (opL === ':' ) return randInt(2, 9);
  if (opL === '·' || opR === '·') return randInt(2, 9);
  if (opR === ':') return randInt(2, 9) * randInt(2, 9);
  return randInt(2, 40);
}

export function randomExpr(level: ExprLevel, max = level === 'three' ? 200 : 100): { toks: Tok[]; value: number } {
  for (let guard = 0; guard < 5000; guard++) {
    const toks = parse(pick(PATTERNS[level]));
    toks.forEach((t, i) => {
      if (t.t === 'n') t.v = fill(toks, i);
    });
    const r = evaluate(toks, max);
    if (r && r.value > 0) return { toks, value: r.value };
  }
  return { toks: parse('n+n·n').map((t, i) => (t.t === 'n' ? { t: 'n', v: [3, 4, 2][i / 2] } : t)), value: 11 };
}

import { bySymbol } from './elements';

// Химични формули: броене на атомите, моларна маса и запис в LaTeX.
// Поддържа скоби и кристалохидрати: „Ca(OH)2“, „Al2(SO4)3“, „CuSO4·5H2O“ (или „CuSO4*5H2O“).

export type Counts = Map<string, number>;

function add(into: Counts, from: Counts, k = 1) {
  for (const [el, n] of from) into.set(el, (into.get(el) ?? 0) + n * k);
}

/** Броят на атомите от всеки елемент, в реда на първата им поява. Хвърля грешка при невалидна формула. */
export function parseFormula(formula: string): Counts {
  const parts = formula.replace(/\s/g, '').split(/[·*]/);
  const total: Counts = new Map();
  for (const part of parts) {
    const m = /^(\d*)(.+)$/.exec(part);
    if (!m) throw new Error(`Невалидна формула: ${formula}`);
    add(total, parseGroup(m[2], formula), m[1] ? Number(m[1]) : 1);
  }
  return total;
}

function parseGroup(s: string, whole: string): Counts {
  const stack: Counts[] = [new Map()];
  let i = 0;
  const count = () => {
    const m = /^\d+/.exec(s.slice(i));
    if (!m) return 1;
    i += m[0].length;
    return Number(m[0]);
  };
  while (i < s.length) {
    const c = s[i];
    if (c === '(' || c === '[') {
      stack.push(new Map());
      i++;
    } else if (c === ')' || c === ']') {
      i++;
      const inner = stack.pop();
      if (!inner || !stack.length) throw new Error(`Невалидна формула: ${whole}`);
      add(stack[stack.length - 1], inner, count());
    } else {
      const m = /^[A-Z][a-z]?/.exec(s.slice(i));
      if (!m || !bySymbol.has(m[0])) throw new Error(`Непознат елемент във формулата: ${whole}`);
      i += m[0].length;
      const top = stack[stack.length - 1];
      top.set(m[0], (top.get(m[0]) ?? 0) + count());
    }
  }
  if (stack.length !== 1) throw new Error(`Невалидна формула: ${whole}`);
  return stack[0];
}

/**
 * Моларна маса в g/mol. По подразбиране атомните маси се закръглят както в училищните задачи
 * (до цяло, а Cl – 35,5, Cu – 63,5); с exact = true се използват точните от таблицата.
 */
export function molarMass(formula: string, exact = false): number {
  let m = 0;
  for (const [el, n] of parseFormula(formula)) m += n * atomicMass(el, exact);
  return exact ? m : Math.round(m * 10) / 10;
}

/** Атомните маси, закръглени както в училищните задачи. */
const SCHOOL_MASS: Record<string, number> = { Cl: 35.5, Cu: 63.5 };

export function atomicMass(symbol: string, exact = false): number {
  const e = bySymbol.get(symbol);
  if (!e) throw new Error(`Непознат елемент: ${symbol}`);
  if (exact) return e.mass;
  return SCHOOL_MASS[symbol] ?? Math.round(e.mass);
}

/** Масовите части на елементите в съединението (сборът е 1). */
export function massFractions(formula: string, exact = false): { symbol: string; count: number; fraction: number }[] {
  const M = molarMass(formula, exact);
  return [...parseFormula(formula)].map(([symbol, count]) => ({ symbol, count, fraction: (count * atomicMass(symbol, exact)) / M }));
}

/** Формулата в LaTeX: „Al2(SO4)3“ → \mathrm{Al_{2}(SO_{4})_{3}}; „CuSO4·5H2O“ → \mathrm{CuSO_{4} \cdot 5H_{2}O}. */
export function formulaTex(formula: string): string {
  const body = formula
    .replace(/\s/g, '')
    .split(/[·*]/)
    .map(part => part.replace(/^(\d+)/, '$1').replace(/([A-Za-z)\]])(\d+)/g, '$1_{$2}'))
    .join(' \\cdot ');
  return `\\mathrm{${body}}`;
}

/** Формулата с Unicode индекси – за SVG и бутони: „H2SO4“ → „H₂SO₄“. */
export function formulaText(formula: string): string {
  const sub = '₀₁₂₃₄₅₆₇₈₉';
  return formula
    .replace(/\*/g, '·')
    .replace(/([A-Za-z)\]])(\d+)/g, (_, a: string, d: string) => a + [...d].map(c => sub[Number(c)]).join(''));
}

/** Двоично дърво: лист (име) или двойка поддървета. */
export type Tree = string | [Tree, Tree];

export type LaidNode = { tree: Tree; path: string; x: number; y: number; children: LaidNode[] };

/** Листата отляво надясно (отгоре надолу на чертежа). */
export const leaves = (t: Tree): string[] => (typeof t === 'string' ? [t] : [...leaves(t[0]), ...leaves(t[1])]);

const depth = (t: Tree): number => (typeof t === 'string' ? 0 : 1 + Math.max(depth(t[0]), depth(t[1])));

/**
 * Правоъгълна кладограма: листата са подравнени вдясно (x = leafX), вътрешните възли са
 * на стъпка step според броя нива до най-далечния лист, y на възела е средата на децата му.
 * path е адресът на възела: '' – коренът, '0', '01' … – наляво/надясно.
 */
export function layout(t: Tree, opts: { leafX: number; step: number; top: number; gap: number }): LaidNode {
  let row = 0;
  const go = (n: Tree, path: string): LaidNode => {
    if (typeof n === 'string') {
      return { tree: n, path, x: opts.leafX, y: opts.top + opts.gap * row++, children: [] };
    }
    const a = go(n[0], path + '0');
    const b = go(n[1], path + '1');
    return { tree: n, path, x: opts.leafX - opts.step * depth(n), y: (a.y + b.y) / 2, children: [a, b] };
  };
  return go(t, '');
}

/** Всички възли на нареденото дърво. */
export const allNodes = (n: LaidNode): LaidNode[] => [n, ...n.children.flatMap(allNodes)];

/**
 * Алгоритъм на Фич: минималният брой промени на един признак по дървото.
 * state дава състоянието на всеки лист. Връща множеството на корена и броя промени.
 */
export function fitch(t: Tree, state: (leaf: string) => string): { set: Set<string>; steps: number } {
  if (typeof t === 'string') return { set: new Set([state(t)]), steps: 0 };
  const a = fitch(t[0], state);
  const b = fitch(t[1], state);
  const both = new Set([...a.set].filter(s => b.set.has(s)));
  if (both.size) return { set: both, steps: a.steps + b.steps };
  return { set: new Set([...a.set, ...b.set]), steps: a.steps + b.steps + 1 };
}

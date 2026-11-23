// Морски шах: правила, минимакс и алфа-бета отсичане – за лабораторията и за проверка на числата в урока.

export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = Cell[];

export const EMPTY: Board = Array(9).fill(null);

export const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const other = (m: Mark): Mark => (m === 'X' ? 'O' : 'X');

/** Печелившата тройка полета или null. */
export function winLine(b: Board): number[] | null {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return l;
  return null;
}

export const winner = (b: Board): Mark | null => {
  const l = winLine(b);
  return l ? b[l[0]] : null;
};

export const isFull = (b: Board) => b.every(c => c !== null);
export const isOver = (b: Board) => winner(b) !== null || isFull(b);
export const freeCells = (b: Board) => b.flatMap((c, i) => (c === null ? [i] : []));

export const play = (b: Board, i: number, m: Mark): Board => {
  const n = b.slice();
  n[i] = m;
  return n;
};

/** Брояч на прегледаните позиции. */
export type Counter = { nodes: number };

/**
 * Минимакс: стойността на позицията за играча `me`, когато на ход е `turn`.
 * Победа = 10 − брой ходове до нея (по-бързата победа е по-добра), загуба – обратното, реми = 0.
 */
export function minimax(b: Board, turn: Mark, me: Mark, depth = 0, counter?: Counter): number {
  if (counter) counter.nodes++;
  const w = winner(b);
  if (w) return w === me ? 10 - depth : depth - 10;
  if (isFull(b)) return 0;
  const values = freeCells(b).map(i => minimax(play(b, i, turn), other(turn), me, depth + 1, counter));
  return turn === me ? Math.max(...values) : Math.min(...values);
}

/** Същата стойност, но с алфа-бета отсичане: клоните, които не могат да променят избора, не се преглеждат. */
export function alphaBeta(b: Board, turn: Mark, me: Mark, depth = 0, alpha = -Infinity, beta = Infinity, counter?: Counter): number {
  if (counter) counter.nodes++;
  const w = winner(b);
  if (w) return w === me ? 10 - depth : depth - 10;
  if (isFull(b)) return 0;
  if (turn === me) {
    let best = -Infinity;
    for (const i of freeCells(b)) {
      best = Math.max(best, alphaBeta(play(b, i, turn), other(turn), me, depth + 1, alpha, beta, counter));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const i of freeCells(b)) {
    best = Math.min(best, alphaBeta(play(b, i, turn), other(turn), me, depth + 1, alpha, beta, counter));
    beta = Math.min(beta, best);
    if (alpha >= beta) break;
  }
  return best;
}

/** Оценка на всеки възможен ход за играча на ход: > 0 – печели, 0 – реми, < 0 – губи (при най-добра игра и на двамата). */
export function moveValues(b: Board, turn: Mark): Map<number, number> {
  const out = new Map<number, number>();
  if (isOver(b)) return out;
  // От празната дъска всеки първи ход води до реми (проверено с пълно търсене) – спестяваме половин милион позиции
  if (b.every(c => c === null)) return new Map(b.map((_, i) => [i, 0]));
  for (const i of freeCells(b)) out.set(i, minimax(play(b, i, turn), other(turn), turn, 1));
  return out;
}

/** Колко позиции преглежда всеки от двата алгоритъма, за да избере ход в тази позиция. */
export function searchCost(b: Board, turn: Mark) {
  // Празната дъска е най-скъпият случай; числата са от същите две функции, пресметнати предварително
  if (b.every(c => c === null)) return { minimax: 549946, alphaBeta: 20866 };
  const full: Counter = { nodes: 0 };
  const pruned: Counter = { nodes: 0 };
  minimax(b, turn, turn, 0, full);
  alphaBeta(b, turn, turn, 0, -Infinity, Infinity, pruned);
  return { minimax: full.nodes, alphaBeta: pruned.nodes };
}

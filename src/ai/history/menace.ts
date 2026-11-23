// MENACE – „машината“ от кибритени кутийки на Доналд Мичи (1961 г.), която се учи да играе морски шах.
// За всяка позиция, в която е на ход, има кутийка с мъниста; цветът на мънистото е ход.

import { type Board, freeCells } from './ticTacToe';

/** Осемте симетрии на дъската: transformed[i] = board[p[i]]. */
const SYMMETRIES = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [6, 3, 0, 7, 4, 1, 8, 5, 2],
  [8, 7, 6, 5, 4, 3, 2, 1, 0],
  [2, 5, 8, 1, 4, 7, 0, 3, 6],
  [2, 1, 0, 5, 4, 3, 8, 7, 6],
  [6, 7, 8, 3, 4, 5, 0, 1, 2],
  [0, 3, 6, 1, 4, 7, 2, 5, 8],
  [8, 5, 2, 7, 4, 1, 6, 3, 0],
];

const keyOf = (b: Board, p: number[]) => p.map(i => b[i] ?? '-').join('');

/** Каноничният вид на позицията (еднакъв за всички завъртени и огледални копия) и симетрията, която води до него. */
export function canonical(b: Board) {
  let best = keyOf(b, SYMMETRIES[0]);
  let perm = SYMMETRIES[0];
  for (const p of SYMMETRIES) {
    const k = keyOf(b, p);
    if (k < best) {
      best = k;
      perm = p;
    }
  }
  return { key: best, perm };
}

/** Различните ходове в канонична позиция: симетричните полета се броят за един ход. */
function distinctMoves(key: string): number[] {
  const board: Board = key.split('').map(c => (c === '-' ? null : (c as 'X' | 'O')));
  const mark = key.replace(/-/g, '').length % 2 === 0 ? 'X' : 'O';
  const seen = new Set<string>();
  const out: number[] = [];
  for (const i of freeCells(board)) {
    const next = board.slice();
    next[i] = mark;
    const k = canonical(next).key;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(i);
    }
  }
  return out;
}

/** Кутийка: брой мъниста за всеки ход (в координатите на каноничната позиция). */
export type Box = Map<number, number>;
export type Menace = Map<string, Box>;

/** Начални мъниста според това кой пореден ход на MENACE е: 4, 3, 2, 1 – както при Мичи. */
const startBeads = (marks: number) => [4, 3, 2, 1][Math.floor(marks / 2)];

function boxFor(m: Menace, key: string): Box {
  let box = m.get(key);
  if (!box) {
    const marks = key.replace(/-/g, '').length;
    box = new Map(distinctMoves(key).map(i => [i, startBeads(marks)]));
    m.set(key, box);
  }
  return box;
}

export type Pick = { key: string; bead: number };

/** MENACE тегли мънисто от кутийката за тази позиция. Връща хода (на истинската дъска) и кое мънисто е изтеглено. */
export function menaceMove(m: Menace, b: Board, random: () => number = Math.random): { cell: number; pick: Pick | null } {
  // За последното свободно поле няма избор и няма кутийка – така кутийките са точно 304, както при Мичи
  const free = freeCells(b);
  if (free.length === 1) return { cell: free[0], pick: null };
  const { key, perm } = canonical(b);
  const box = boxFor(m, key);
  const total = [...box.values()].reduce((s, v) => s + v, 0);
  let r = random() * total;
  let bead = [...box.keys()][0];
  for (const [move, count] of box) {
    if (r < count) {
      bead = move;
      break;
    }
    r -= count;
  }
  return { cell: perm[bead], pick: { key, bead } };
}

/** След партията: победа +3 мъниста за всеки изигран ход, реми +1, загуба −1 (последното мънисто в кутийка остава). */
export function reinforce(m: Menace, picks: Pick[], result: 'win' | 'draw' | 'loss') {
  const delta = result === 'win' ? 3 : result === 'draw' ? 1 : -1;
  for (const { key, bead } of picks) {
    const box = m.get(key)!;
    const next = (box.get(bead) ?? 0) + delta;
    const others = [...box].filter(([k]) => k !== bead).reduce((s, [, v]) => s + v, 0);
    box.set(bead, next <= 0 && others === 0 ? 1 : Math.max(0, next));
  }
}

/** Мънистата в кутийката за празната дъска, разпределени по трите вида първи ход. */
export function openingBeads(m: Menace) {
  const box = boxFor(m, '---------');
  // Каноничните първи ходове: 0 – ъгъл, 1 – страна, 4 – център
  return { corner: box.get(0) ?? 0, edge: box.get(1) ?? 0, center: box.get(4) ?? 0 };
}

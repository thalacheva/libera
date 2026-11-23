// Случайни доигравания (метод Монте Карло) за морски шах – идеята, с която AlphaGo заобикаля пълното търсене.

import { type Board, freeCells, isOver, type Mark, other, play, winner } from './ticTacToe';

/** Малък генератор на псевдослучайни числа със зададено начало – еднакъв резултат на сървъра и в браузъра. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Доиграва позицията със случайни ходове и на двамата. Връща 1 при победа на `me`, 0,5 при реми и 0 при загуба. */
function playout(b: Board, turn: Mark, me: Mark, random: () => number): number {
  let board = b;
  let t = turn;
  while (!isOver(board)) {
    const free = freeCells(board);
    board = play(board, free[Math.floor(random() * free.length)], t);
    t = other(t);
  }
  const w = winner(board);
  return w === me ? 1 : w ? 0 : 0.5;
}

/** За всеки възможен ход на `turn`: средният резултат от `n` случайни доигравания след него. */
export function rolloutValues(b: Board, turn: Mark, n: number, seed: number): Map<number, number> {
  const random = mulberry32(seed);
  const out = new Map<number, number>();
  for (const i of freeCells(b)) {
    const next = play(b, i, turn);
    let sum = 0;
    for (let k = 0; k < n; k++) sum += playout(next, other(turn), turn, random);
    out.set(i, sum / n);
  }
  return out;
}

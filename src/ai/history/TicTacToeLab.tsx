import { useEffect, useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { EMPTY, freeCells, isFull, isOver, type Board, type Mark, moveValues, other, play, searchCost, winLine, winner } from './ticTacToe';

type Level = 'random' | 'greedy' | 'perfect';

const LEVELS: { id: Level; label: string }[] = [
  { id: 'random', label: 'случайни ходове' },
  { id: 'greedy', label: 'един ход напред' },
  { id: 'perfect', label: 'минимакс' },
];

const fmt = (n: number) => n.toLocaleString('bg-BG').replace(/,/g, ' ');
const pickOne = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** Ходът на компютъра според нивото. */
function computerMove(b: Board, me: Mark, level: Level): number {
  const free = freeCells(b);
  if (level === 'random') return pickOne(free);
  if (level === 'greedy') {
    // Печели, ако може с един ход; иначе пречи на противника да спечели с един ход; иначе – случайно
    const win = free.find(i => winner(play(b, i, me)) === me);
    if (win !== undefined) return win;
    const block = free.find(i => winner(play(b, i, other(me))) === other(me));
    return block ?? pickOne(free);
  }
  const values = moveValues(b, me);
  const best = Math.max(...values.values());
  return pickOne(free.filter(i => values.get(i) === best));
}

const verdict = (v: number) => (v > 0 ? 'печели' : v < 0 ? 'губи' : 'реми');

/** Морски шах срещу компютъра: оценка на всеки ход по минимакс и брой прегледани позиции. */
export default function TicTacToeLab() {
  const [board, setBoard] = useState<Board>(EMPTY);
  const [human, setHuman] = useState<Mark>('X');
  const [level, setLevel] = useState<Level>('perfect');
  const [hints, setHints] = useState(false);
  const [score, setScore] = useState({ win: 0, draw: 0, loss: 0 });

  const moves = board.filter(c => c !== null).length;
  const turn: Mark = moves % 2 === 0 ? 'X' : 'O';
  const over = isOver(board);
  const line = winLine(board);
  const won = winner(board);
  const computer = other(human);

  /** Поставя новата позиция и, ако партията е свършила, отчита резултата. */
  const commit = (next: Board) => {
    setBoard(next);
    if (!isOver(next)) return;
    const w = winner(next);
    setScore(s => (w === human ? { ...s, win: s.win + 1 } : w ? { ...s, loss: s.loss + 1 } : { ...s, draw: s.draw + 1 }));
  };

  // Компютърът играе след кратка пауза, за да се вижда ходът му
  useEffect(() => {
    if (over || turn !== computer) return;
    const id = window.setTimeout(() => commit(play(board, computerMove(board, computer, level), computer)), 450);
    return () => window.clearTimeout(id);
  }, [board, over, turn, computer, level]); // eslint-disable-line react-hooks/exhaustive-deps

  const values = useMemo(() => (hints && !over ? moveValues(board, turn) : new Map<number, number>()), [hints, over, board, turn]);
  const cost = useMemo(() => (over ? null : searchCost(board, turn)), [board, over, turn]);

  const restart = (as: Mark = human) => {
    setHuman(as);
    setBoard(EMPTY);
  };

  const status = won
    ? won === human
      ? 'Ти печелиш! Опитай същото срещу „минимакс“.'
      : 'Компютърът печели.'
    : isFull(board)
      ? 'Реми.'
      : turn === human
        ? `Ти си на ход (${human}).`
        : 'Компютърът мисли…';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="mx-auto grid w-full max-w-[18rem] grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const v = values.get(i);
          const inLine = line?.includes(i);
          const canPlay = !over && cell === null && turn === human;
          return (
            <button
              key={i}
              type="button"
              disabled={!canPlay}
              onClick={() => commit(play(board, i, human))}
              aria-label={cell ? `поле ${i + 1}: ${cell}` : `поле ${i + 1}: празно`}
              className={`relative flex aspect-square items-center justify-center rounded-xl border-2 text-4xl sm:text-5xl font-bold transition-colors ${
                inLine
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15'
                  : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50'
              } ${canPlay ? 'hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 cursor-pointer' : ''} ${
                cell === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {cell}
              {cell === null && v !== undefined && (
                <span
                  className={`text-sm sm:text-base font-semibold ${
                    v > 0 ? 'text-emerald-600 dark:text-emerald-400' : v < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {verdict(v)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Note tone={won === human ? 'emerald' : won ? 'rose' : 'gray'}>{status}</Note>

      <Buttons>
        {LEVELS.map(l => (
          <DiagramButton key={l.id} active={level === l.id} onClick={() => setLevel(l.id)}>
            {l.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => restart('X')}>нова игра – аз съм X (първи)</DiagramButton>
        <DiagramButton onClick={() => restart('O')}>нова игра – аз съм O (втори)</DiagramButton>
        <DiagramButton active={hints} onClick={() => setHints(h => !h)}>
          покажи оценките
        </DiagramButton>
      </Buttons>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'победи', value: score.win, tone: 'emerald' },
            { label: 'ремита', value: score.draw },
            { label: 'загуби', value: score.loss, tone: 'rose' },
            ...(cost
              ? [
                  { label: 'позиции за минимакс', value: fmt(cost.minimax), tone: 'violet' as const },
                  { label: 'с алфа-бета', value: fmt(cost.alphaBeta), tone: 'amber' as const },
                ]
              : []),
          ]}
        />
      </div>
      <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        „Оценките“ показват какво става след всеки възможен ход на играча, който е на ход, ако оттам нататък и двамата играят най-добре.
        Последните две числа са колко позиции трябва да се прегледат, за да се избере ход в текущата позиция.
      </p>
    </div>
  );
}

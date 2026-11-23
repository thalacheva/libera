import { useRef, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { type Menace, menaceMove, openingBeads, type Pick, reinforce } from './menace';
import { type Board, EMPTY, freeCells, isOver, type Mark, moveValues, other, play, winner } from './ticTacToe';

type Opponent = 'random' | 'perfect';
type Result = 'win' | 'draw' | 'loss';

const pickOne = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

function opponentMove(b: Board, kind: Opponent): number {
  const free = freeCells(b);
  if (kind === 'random') return pickOne(free);
  const values = moveValues(b, 'O');
  const best = Math.max(...values.values());
  return pickOne(free.filter(i => values.get(i) === best));
}

/** Една партия: MENACE е X и започва. Връща резултата за MENACE и крайната дъска. */
function playGame(m: Menace, kind: Opponent): { result: Result; board: Board } {
  let board = EMPTY;
  let turn: Mark = 'X';
  const picks: Pick[] = [];
  while (!isOver(board)) {
    if (turn === 'X') {
      const { cell, pick } = menaceMove(m, board);
      if (pick) picks.push(pick);
      board = play(board, cell, 'X');
    } else board = play(board, opponentMove(board, kind), 'O');
    turn = other(turn);
  }
  const w = winner(board);
  const result: Result = w === 'X' ? 'win' : w === 'O' ? 'loss' : 'draw';
  reinforce(m, picks, result);
  return { result, board };
}

const W = 640;
const H = 220;
const PAD = { l: 44, r: 12, t: 14, b: 30 };
const WINDOW = 20;

/** MENACE – кутийки с мъниста, които се учат на морски шах от победи и загуби. */
export default function MenaceLab() {
  const menace = useRef<Menace>(new Map());
  const [history, setHistory] = useState<Result[]>([]);
  const [opponent, setOpponent] = useState<Opponent>('perfect');
  const [last, setLast] = useState<Board | null>(null);

  const run = (games: number) => {
    const out: Result[] = [];
    let board: Board | null = null;
    for (let i = 0; i < games; i++) {
      const g = playGame(menace.current, opponent);
      out.push(g.result);
      board = g.board;
    }
    setHistory(h => [...h, ...out]);
    setLast(board);
  };

  const reset = () => {
    menace.current = new Map();
    setHistory([]);
    setLast(null);
  };

  const count = (r: Result, list = history) => list.filter(x => x === r).length;
  const recent = history.slice(-WINDOW);
  const beads = openingBeads(menace.current);
  const totalBeads = beads.corner + beads.edge + beads.center;
  const pct = (v: number) => `${Math.round((v / totalBeads) * 100)}%`;

  // Дял на партиите без загуба в плъзгащ се прозорец от 20 партии
  const n = history.length;
  const points: string[] = [];
  const xMax = Math.max(100, n);
  for (let i = 1; i <= n; i++) {
    const win = history.slice(Math.max(0, i - WINDOW), i);
    const share = win.filter(r => r !== 'loss').length / win.length;
    const x = PAD.l + (i / xMax) * (W - PAD.l - PAD.r);
    const y = PAD.t + (1 - share) * (H - PAD.t - PAD.b);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {[0, 0.5, 1].map(v => {
          const y = PAD.t + (1 - v) * (H - PAD.t - PAD.b);
          return (
            <g key={v}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1" />
              <text x={PAD.l - 6} y={y + 4} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
                {v * 100}%
              </text>
            </g>
          );
        })}
        <text x={PAD.l} y={H - 8} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          0
        </text>
        <text x={W - PAD.r} y={H - 8} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          {xMax} партии
        </text>
        <text x={(W + PAD.l) / 2} y={H - 8} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          дял на партиите без загуба (последните {WINDOW})
        </text>
        {points.length > 1 && <polyline points={points.join(' ')} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.5" strokeLinejoin="round" />}
        {n === 0 && (
          <text x={(W + PAD.l) / 2} y={H / 2} fontSize="14" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            Още няма изиграни партии.
          </text>
        )}
      </LabSvg>

      <Buttons>
        <DiagramButton active={opponent === 'perfect'} onClick={() => setOpponent('perfect')}>
          срещу минимакс
        </DiagramButton>
        <DiagramButton active={opponent === 'random'} onClick={() => setOpponent('random')}>
          срещу случайни ходове
        </DiagramButton>
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => run(1)}>1 партия</DiagramButton>
        <DiagramButton onClick={() => run(10)}>10 партии</DiagramButton>
        <DiagramButton onClick={() => run(100)}>100 партии</DiagramButton>
        <DiagramButton onClick={reset}>нови кутийки</DiagramButton>
      </Buttons>

      <div className="mt-3 flex flex-wrap items-start justify-center gap-6">
        <div>
          <p className="mb-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">първата кутийка: мъниста за първия ход</p>
          <div className="grid grid-cols-3 gap-1 text-sm">
            {(['corner', 'edge', 'corner', 'edge', 'center', 'edge', 'corner', 'edge', 'corner'] as const).map((kind, i) => (
              <div
                key={i}
                className="flex h-12 w-14 items-center justify-center rounded border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50"
                style={{ opacity: 0.35 + 0.65 * (beads[kind] / Math.max(beads.corner, beads.edge, beads.center, 1)) }}
              >
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{beads[kind]}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
            ъгъл {pct(beads.corner)} · страна {pct(beads.edge)} · център {pct(beads.center)}
          </p>
        </div>
        {last && (
          <div>
            <p className="mb-1 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">последната партия (MENACE е X)</p>
            <div className="grid grid-cols-3 gap-1">
              {last.map((c, i) => (
                <div
                  key={i}
                  className={`flex h-12 w-14 items-center justify-center rounded border border-gray-300 bg-gray-50 text-xl font-bold dark:border-gray-600 dark:bg-gray-900/50 ${
                    c === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'партии', value: n },
            { label: 'победи', value: count('win'), tone: 'emerald' },
            { label: 'ремита', value: count('draw') },
            { label: 'загуби', value: count('loss'), tone: 'rose' },
            { label: `загуби в последните ${Math.min(WINDOW, Math.max(n, 1))}`, value: count('loss', recent), tone: 'amber' },
            { label: 'използвани кутийки', value: `${menace.current.size} от 304`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone="gray">
        Числата в първата кутийка са едни и същи за четирите ъгъла и за четирите страни: MENACE не различава завъртените и огледалните
        позиции. След победа всеки изигран ход получава 3 мъниста, след реми – 1, а след загуба губи 1.
      </Note>
    </div>
  );
}

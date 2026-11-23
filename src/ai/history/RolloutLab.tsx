import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { rolloutValues } from './rollouts';
import { type Board, moveValues } from './ticTacToe';

const parse = (s: string): Board => s.split('').map(c => (c === '-' ? null : (c as 'X' | 'O')));

/** Позиции, в които на ход е X. */
const POSITIONS: { label: string; board: Board }[] = [
  { label: 'празна дъска', board: parse('---------') },
  { label: 'печеливш ход', board: parse('XO-XO----') },
  { label: 'капан', board: parse('-X------O') },
];

const COUNTS = [1, 3, 10, 30, 100, 300, 1000];

const pct = (v: number) => `${Math.round(v * 100)}%`;
const verdict = (v: number) => (v > 0 ? 'печели' : v < 0 ? 'губи' : 'реми');

/** Оценка на ходовете със случайни доигравания вместо с пълно търсене – и сравнение с минимакс. */
export default function RolloutLab() {
  const [pos, setPos] = useState(0);
  const [k, setK] = useState(2);
  const [seed, setSeed] = useState(1);
  const [exact, setExact] = useState(false);

  const board = POSITIONS[pos].board;
  const n = COUNTS[k];
  const estimates = useMemo(() => rolloutValues(board, 'X', n, seed), [board, n, seed]);
  const truth = useMemo(() => moveValues(board, 'X'), [board]);

  const bestEstimate = Math.max(...estimates.values());
  const choice = [...estimates].find(([, v]) => v === bestEstimate)![0];
  const bestTruth = Math.max(...truth.values());
  const agrees = truth.get(choice) === bestTruth;
  const free = estimates.size;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="mx-auto grid w-full max-w-[19rem] grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const v = estimates.get(i);
          const t = truth.get(i);
          return (
            <div
              key={i}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 ${
                i === choice ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-500/15' : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50'
              }`}
            >
              {cell ? (
                <span className={`text-4xl sm:text-5xl font-bold ${cell === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>{cell}</span>
              ) : (
                <>
                  <span className="font-mono text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">{pct(v!)}</span>
                  {exact && (
                    <span className={`text-xs sm:text-sm font-semibold ${t! > 0 ? 'text-emerald-600 dark:text-emerald-400' : t! < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {verdict(t!)}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        На ход е X. Числото във всяко свободно поле е средният резултат на X след {n} случайни доигравания (победа 100%, реми 50%, загуба 0%).
        Оцветеното поле е ходът с най-висока оценка.
      </p>

      <Buttons>
        {POSITIONS.map((p, i) => (
          <DiagramButton key={p.label} active={i === pos} onClick={() => setPos(i)}>
            {p.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="max-w-md mx-auto mt-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-24 flex-shrink-0 font-mono text-violet-700 dark:text-violet-400">доигравания</span>
          <input type="range" min={0} max={COUNTS.length - 1} step={1} value={k} onChange={e => setK(Number(e.target.value))} className="flex-1 min-w-0 accent-violet-500 cursor-pointer" aria-label="Брой доигравания на ход" />
          <span className="w-12 text-right font-mono text-gray-900 dark:text-gray-100">{n}</span>
        </label>
      </div>
      <Buttons>
        <DiagramButton onClick={() => setSeed(s => s + 1)}>доиграй отново</DiagramButton>
        <DiagramButton active={exact} onClick={() => setExact(e => !e)}>
          покажи минимакс
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'изиграни партии', value: n * free, tone: 'violet' },
            { label: 'най-висока оценка', value: pct(bestEstimate), tone: 'amber' },
            ...(exact ? [{ label: 'изборът според минимакс', value: agrees ? 'най-добър' : 'не е най-добър', tone: agrees ? ('emerald' as const) : ('rose' as const) }] : []),
          ]}
        />
      </div>
      <Note tone="gray">
        Натисни „доиграй отново“ няколко пъти при 3 и при 1000 доигравания: при малко партии оценките скачат и изборът се сменя, при много –
        почти не мърдат.
      </Note>
    </div>
  );
}

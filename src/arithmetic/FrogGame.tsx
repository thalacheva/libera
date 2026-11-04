import { useState } from 'react';
import { BigButton, Bubble, LevelPicker, RoundBar, RoundDone } from './kit';
import { praise } from './kidsMath';

// „Жабката“: стотна таблица 1–100. Жабката скача все по k – детето докосва камъчетата, на които ще кацне.
// Така се получава редът на таблицата за умножение: k, 2k, …, 10k – и се виждат шарките (колоните при 2, 5, 10, диагоналите при 9).

type Level = 'easy' | 'mid' | 'hard';
const LEVELS = [
  { id: 'easy', label: 'по 2, 5, 10' },
  { id: 'mid', label: 'по 3, 4' },
  { id: 'hard', label: 'по 6, 7, 8, 9' },
] as const;
const STEPS: Record<Level, number[]> = { easy: [2, 5, 10], mid: [3, 4], hard: [6, 7, 8, 9] };

export default function FrogGame() {
  const [level, setLevel] = useState<Level>('easy');
  const [index, setIndex] = useState(0); // коя таблица от нивото
  const [hops, setHops] = useState(0); // колко скока е направила жабката
  const [wrong, setWrong] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null);

  const steps = STEPS[level];
  const finished = index >= steps.length;
  const k = steps[Math.min(index, steps.length - 1)];
  const pos = hops * k;
  const tableDone = hops >= 10;

  const restart = (l: Level) => {
    setLevel(l);
    setIndex(0);
    setHops(0);
    setWrong(null);
    setMistakes(0);
    setMsg(null);
  };

  const tap = (n: number) => {
    if (tableDone) return;
    if (n === pos + k) {
      setHops(hops + 1);
      setWrong(null);
      setMsg(hops + 1 >= 10 ? { tone: 'good', text: `${praise()} Това е редът за ${k}: ${Array.from({ length: 10 }, (_, i) => (i + 1) * k).join(', ')}.` } : null);
    } else {
      setWrong(n);
      setMistakes(m => m + 1);
      setMsg({ tone: 'bad', text: `Не е ${n}. Жабката е на ${pos || 'старта (0)'} и скача с ${k}: ${pos} + ${k} = ?` });
    }
  };
  const nextTable = () => {
    setIndex(i => i + 1);
    setHops(0);
    setMsg(null);
    setWrong(null);
  };

  if (finished)
    return (
      <>
        <LevelPicker levels={LEVELS} value={level} onChange={restart} />
        <RoundDone mistakes={mistakes} onAgain={() => restart(level)} />
      </>
    );

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={restart} />
      <RoundBar done={index} total={steps.length} mistakes={mistakes} />
      <p className="text-center text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        🐸 Жабката скача по <span className="text-emerald-600 dark:text-emerald-400 text-2xl">{k}</span>.{' '}
        {tableDone ? 'Виж шарката!' : 'Къде ще кацне при следващия скок?'}
      </p>
      <div className="grid grid-cols-10 gap-0.5 sm:gap-1 max-w-md mx-auto select-none" role="grid" aria-label="стотна таблица">
        {Array.from({ length: 100 }, (_, i) => {
          const n = i + 1;
          const visited = n % k === 0 && n <= pos;
          const here = n === pos;
          return (
            <button
              key={n}
              onClick={() => tap(n)}
              className={`aspect-square rounded-md text-[11px] sm:text-sm font-semibold tabular-nums flex items-center justify-center transition-colors ${
                here
                  ? 'bg-emerald-500 text-white'
                  : visited
                    ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                    : wrong === n
                      ? 'bg-rose-200 text-rose-900 motion-safe:animate-shake'
                      : 'bg-sky-50 text-gray-600 hover:bg-amber-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-label={String(n)}
            >
              {here && !tableDone ? <span className="text-base sm:text-xl">🐸</span> : n}
            </button>
          );
        })}
      </div>
      {msg ? (
        <Bubble tone={msg.tone}>{msg.text}</Bubble>
      ) : (
        <Bubble tone="info">
          {hops === 0 ? `Жабката е на старта (0). Първият скок е до ${k}. Докосни го!` : `${hops} скока по ${k} = ${hops} · ${k} = ${pos}`}
        </Bubble>
      )}
      {tableDone && (
        <div className="text-center mt-4">
          <BigButton onClick={nextTable} tone="emerald">
            {index + 1 < steps.length ? `Сега по ${steps[index + 1]} →` : 'Край на рунда →'}
          </BigButton>
        </div>
      )}
    </>
  );
}

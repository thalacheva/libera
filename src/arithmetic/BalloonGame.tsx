import { useState } from 'react';
import { Bubble, LevelPicker, RoundBar, RoundDone } from './kit';
import { randInt, praise, shuffled } from './kidsMath';

// „Спукай балоните“: докосни два балона, чийто сбор (или разлика) е числото в облачето.
// Всеки рунд има 3 табла по 4 двойки.

type Op = '+' | '-';
export type BalloonLevel = { id: string; label: string; board: (prevTarget: number) => { target: number; pairs: [number, number][] } };

const COLORS = ['bg-rose-400', 'bg-sky-400', 'bg-amber-300', 'bg-emerald-400', 'bg-violet-400', 'bg-pink-400', 'bg-orange-400', 'bg-teal-400'];
const BOARDS = 3;
const PAIRS = 4;

/** Различни двойки с даден сбор: a + b = target, a ≤ b, a ≥ min. */
function sumPairs(target: number, min: number, step = 1) {
  const all: [number, number][] = [];
  for (let a = min; a <= target - a; a += step) all.push([a, target - a]);
  return shuffled(all).slice(0, PAIRS);
}

/** Различни двойки с дадена разлика: b − a = target, b ≤ max. */
function diffPairs(target: number, max: number) {
  const all: [number, number][] = [];
  for (let a = 1; a + target <= max; a++) all.push([a, a + target]);
  return shuffled(all).slice(0, PAIRS);
}

const SUM_LEVELS: BalloonLevel[] = [
  { id: 'to10', label: 'сбор 10', board: () => ({ target: 10, pairs: sumPairs(10, 1) }) },
  {
    id: 'to20',
    label: 'до 20',
    board: prev => {
      let t = prev;
      while (t === prev) t = randInt(11, 20);
      return { target: t, pairs: sumPairs(t, 2) };
    },
  },
  { id: 'to100', label: 'сбор 100', board: () => ({ target: 100, pairs: sumPairs(100, 5, randInt(0, 1) ? 5 : 1) }) },
];

const DIFF_LEVELS: BalloonLevel[] = [
  {
    id: 'to10',
    label: 'до 10',
    board: prev => {
      let t = prev;
      while (t === prev) t = randInt(2, 5);
      return { target: t, pairs: diffPairs(t, 10) };
    },
  },
  {
    id: 'to20',
    label: 'до 20',
    board: prev => {
      let t = prev;
      while (t === prev) t = randInt(4, 12);
      return { target: t, pairs: diffPairs(t, 20) };
    },
  },
  {
    id: 'to100',
    label: 'до 100',
    board: prev => {
      let t = prev;
      while (t === prev) t = 10 * randInt(1, 6);
      return { target: t, pairs: diffPairs(t, 99) };
    },
  },
];

type Balloon = { id: number; value: number; color: string; popped: boolean };

const toBalloons = (pairs: [number, number][], shuffle: boolean): Balloon[] => {
  const values = pairs.flat();
  const order = shuffle ? shuffled(values.map((_, i) => i)) : [0, 3, 5, 6, 1, 2, 4, 7].filter(i => i < values.length);
  return order.map((i, k) => ({ id: k, value: values[i], color: COLORS[k % COLORS.length], popped: false }));
};

// Първото табло е фиксирано (prerender), следващите са случайни.
const FIRST: Record<Op, { target: number; pairs: [number, number][] }> = {
  '+': { target: 10, pairs: [[1, 9], [3, 7], [4, 6], [2, 8]] },
  '-': { target: 3, pairs: [[1, 4], [5, 8], [2, 5], [7, 10]] },
};

export default function BalloonGame({ op = '+' }: { op?: Op }) {
  const levels = op === '+' ? SUM_LEVELS : DIFF_LEVELS;
  const [level, setLevel] = useState(levels[0].id);
  const [target, setTarget] = useState(FIRST[op].target);
  const [balloons, setBalloons] = useState<Balloon[]>(() => toBalloons(FIRST[op].pairs, false));
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [board, setBoard] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null);

  const newBoard = (id: string, prev: number) => {
    const b = levels.find(l => l.id === id)!.board(prev);
    setTarget(b.target);
    setBalloons(toBalloons(b.pairs, true));
    setPicked(null);
    setWrong(null);
  };
  const changeLevel = (id: string) => {
    setLevel(id);
    setBoard(0);
    setMistakes(0);
    setMsg(null);
    newBoard(id, target);
  };
  const again = () => {
    setBoard(0);
    setMistakes(0);
    setMsg(null);
    newBoard(level, target);
  };

  const tap = (b: Balloon) => {
    if (b.popped) return;
    setWrong(null);
    if (picked === null) {
      setPicked(b.id);
      setMsg(null);
      return;
    }
    if (picked === b.id) {
      setPicked(null);
      return;
    }
    const other = balloons.find(x => x.id === picked)!;
    const ok = op === '+' ? other.value + b.value === target : Math.abs(other.value - b.value) === target;
    const sum = op === '+' ? `${other.value} + ${b.value} = ${other.value + b.value}` : `${Math.max(other.value, b.value)} − ${Math.min(other.value, b.value)} = ${Math.abs(other.value - b.value)}`;
    if (ok) {
      const rest = balloons.map(x => (x.id === b.id || x.id === picked ? { ...x, popped: true } : x));
      setBalloons(rest);
      setPicked(null);
      setMsg({ tone: 'good', text: `💥 ${praise()} ${sum}` });
      if (rest.every(x => x.popped)) {
        if (board + 1 >= BOARDS) setBoard(BOARDS);
        else
          window.setTimeout(() => {
            setBoard(n => n + 1);
            setMsg(null);
            newBoard(level, target);
          }, 900);
      }
    } else {
      setMistakes(m => m + 1);
      setWrong([picked, b.id]);
      setPicked(null);
      setMsg({ tone: 'bad', text: `${sum}, а трябва ${target}. Опитай с друг балон!` });
    }
  };

  if (board >= BOARDS)
    return (
      <>
        <LevelPicker levels={levels} value={level} onChange={changeLevel} />
        <RoundDone mistakes={mistakes} onAgain={again} />
      </>
    );

  return (
    <>
      <LevelPicker levels={levels} value={level} onChange={changeLevel} />
      <RoundBar done={board} total={BOARDS} mistakes={mistakes} />
      <div className="flex justify-center mb-2">
        <div className="relative px-6 py-2 rounded-full bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-700 text-center">
          <span className="text-sm sm:text-base text-sky-800 dark:text-sky-200 mr-2">{op === '+' ? 'сбор' : 'разлика'}</span>
          <span className="text-4xl font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">{target}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto py-3">
        {balloons.map(b => (
          <button
            key={`${board}-${b.id}`}
            onClick={() => tap(b)}
            disabled={b.popped}
            aria-label={b.popped ? 'спукан балон' : `балон ${b.value}`}
            aria-pressed={picked === b.id}
            className={`relative flex flex-col items-center transition-transform ${b.popped ? '' : 'hover:-translate-y-1'} ${picked === b.id ? '-translate-y-2' : ''} ${
              wrong?.includes(b.id) ? 'motion-safe:animate-shake' : ''
            }`}
          >
            {b.popped ? (
              <span className="h-16 sm:h-20 flex items-center text-3xl motion-safe:animate-pop" aria-hidden>
                ✨
              </span>
            ) : (
              <>
                <span
                  className={`h-16 w-14 sm:h-20 sm:w-16 rounded-[50%] ${b.color} shadow-md flex items-center justify-center text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums ${
                    picked === b.id ? 'ring-4 ring-amber-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                  }`}
                >
                  {b.value}
                </span>
                <span className="block w-px h-5 bg-gray-400" aria-hidden />
              </>
            )}
          </button>
        ))}
      </div>
      {msg ? <Bubble tone={msg.tone}>{msg.text}</Bubble> : <Bubble tone="info">Докосни два балона, които {op === '+' ? 'заедно правят' : 'се различават с'} {target}.</Bubble>}
    </>
  );
}

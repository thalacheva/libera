import { useEffect, useRef, useState } from 'react';
import { BigButton, Bubble, LevelPicker, RoundDone } from './kit';
import { praise, randInt, shuffled } from './kidsMath';

// „Мемори“: 12 обърнати карти – 6 задачи от таблицата за умножение (или деление) и 6 отговора.
// Обръщаш две – ако задачата и отговорът си пасват, остават отворени.

type Op = '·' | ':';
type Level = 'easy' | 'mid' | 'hard' | 'all';
const levelsFor = (op: Op) =>
  [
    { id: 'easy', label: `${op} 2, 5, 10` },
    { id: 'mid', label: `${op} 3, 4` },
    { id: 'hard', label: `${op} 6 – 9` },
    { id: 'all', label: 'смесено' },
  ] as const;
const FACTORS: Record<Level, number[]> = { easy: [2, 5, 10], mid: [3, 4], hard: [6, 7, 8, 9], all: [2, 3, 4, 5, 6, 7, 8, 9] };
const PAIRS = 6;

type Card = { id: number; pair: number; text: string; kind: 'task' | 'answer' };

/** 6 задачи с различни отговори. При деление: (a · b) : a = b, b е отговорът. */
function newBoard(level: Level, op: Op): Card[] {
  const used = new Set<number>();
  const facts: [number, number][] = [];
  for (let guard = 0; facts.length < PAIRS && guard < 1000; guard++) {
    const a = FACTORS[level][randInt(0, FACTORS[level].length - 1)];
    const b = randInt(2, 10);
    const key = op === '·' ? a * b : b;
    if (used.has(key)) continue;
    used.add(key);
    facts.push(op === ':' || randInt(0, 1) ? [a, b] : [b, a]);
  }
  const cards = facts.flatMap(([a, b], i): Omit<Card, 'id'>[] =>
    op === '·'
      ? [
          { pair: i, text: `${a} · ${b}`, kind: 'task' },
          { pair: i, text: String(a * b), kind: 'answer' },
        ]
      : [
          { pair: i, text: `${a * b} : ${a}`, kind: 'task' },
          { pair: i, text: String(b), kind: 'answer' },
        ],
  );
  return shuffled(cards).map((c, id) => ({ ...c, id }));
}

export default function MemoryGame({ op = '·' }: { op?: Op }) {
  const LEVELS = levelsFor(op);
  const [level, setLevel] = useState<Level>('easy');
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]); // pair-ове, които са открити
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = (l: Level = level) => {
    window.clearTimeout(timer.current);
    setLevel(l);
    setCards(newBoard(l, op));
    setOpen([]);
    setFound([]);
    setTries(0);
    setMsg(null);
  };

  const flip = (c: Card) => {
    if (open.length >= 2 || open.includes(c.id) || found.includes(c.pair)) return;
    const now = [...open, c.id];
    setOpen(now);
    if (now.length < 2) return;
    setTries(t => t + 1);
    const [x, y] = now.map(id => cards[id]);
    if (x.pair === y.pair) {
      const task = x.kind === 'task' ? x : y;
      const ans = x.kind === 'task' ? y : x;
      setFound(f => [...f, x.pair]);
      setOpen([]);
      setMsg({ tone: 'good', text: `${praise()} ${task.text} = ${ans.text}` });
    } else {
      setMsg({ tone: 'bad', text: x.kind === y.kind ? 'Търси двойка задача + отговор.' : `${(x.kind === 'task' ? x : y).text} не е ${(x.kind === 'task' ? y : x).text}. Запомни къде са!` });
      timer.current = window.setTimeout(() => setOpen([]), 1100);
    }
  };

  const done = cards.length > 0 && found.length === PAIRS;
  // Звезди по брой опити: идеалното е 6, с малко късмет и памет – до 10.
  const stars = tries <= 10 ? 3 : tries <= 15 ? 2 : 1;

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={id => (cards.length ? start(id) : setLevel(id))} />
      {cards.length === 0 && (
        <div className="text-center py-6">
          <div className="text-5xl mb-3" aria-hidden>
            🃏
          </div>
          <BigButton onClick={() => start()} tone="pink">
            Подреди картите
          </BigButton>
        </div>
      )}
      {done && <RoundDone mistakes={tries - PAIRS} stars={stars} text={`Всички двойки за ${tries} опита!`} onAgain={() => start()} />}
      {cards.length > 0 && !done && (
        <>
          <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
            Открити: <b>{found.length}</b> от {PAIRS} · опити: <b>{tries}</b>
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
            {cards.map(c => {
              const shown = open.includes(c.id) || found.includes(c.pair);
              return (
                <button
                  key={c.id}
                  onClick={() => flip(c)}
                  aria-label={shown ? c.text : 'обърната карта'}
                  className={`h-16 sm:h-20 rounded-2xl text-xl sm:text-2xl font-extrabold tabular-nums border-b-4 transition-all ${
                    found.includes(c.pair)
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : shown
                        ? `bg-white border-pink-400 dark:bg-gray-700 motion-safe:animate-pop ${c.kind === 'task' ? 'text-pink-600 dark:text-pink-300' : 'text-gray-900 dark:text-white'}`
                        : 'bg-gradient-to-br from-pink-400 to-violet-500 border-violet-700 text-white/80 hover:-translate-y-0.5'
                  }`}
                >
                  {shown ? c.text : '?'}
                </button>
              );
            })}
          </div>
          {msg && <Bubble tone={msg.tone}>{msg.text}</Bubble>}
        </>
      )}
    </>
  );
}

import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { praise, randInt, shuffled, tryAgain } from './kidsMath';

// „Магазинчето“: списък за пазаруване → слагаш стоките в кошницата → колко плащаш → (по желание) колко е рестото.
// Цените са в цели евро.

type Level = 'small' | 'change' | 'big';
const LEVELS = [
  { id: 'small', label: 'сметка до 20 €' },
  { id: 'change', label: 'с ресто' },
  { id: 'big', label: 'до 100 €' },
] as const;
const ROUND = 4;

type Item = { id: string; emoji: string; name: string; price: number };
const CHEAP: Item[] = [
  { id: 'apple', emoji: '🍎', name: 'ябълка', price: 1 },
  { id: 'bread', emoji: '🥖', name: 'хляб', price: 2 },
  { id: 'juice', emoji: '🧃', name: 'сок', price: 3 },
  { id: 'choco', emoji: '🍫', name: 'шоколад', price: 2 },
  { id: 'cheese', emoji: '🧀', name: 'сирене', price: 6 },
  { id: 'milk', emoji: '🥛', name: 'мляко', price: 2 },
  { id: 'pencil', emoji: '✏️', name: 'молив', price: 1 },
  { id: 'book', emoji: '📒', name: 'тетрадка', price: 3 },
  { id: 'cake', emoji: '🍰', name: 'парче торта', price: 4 },
  { id: 'balloon', emoji: '🎈', name: 'балон', price: 1 },
];
const PRICEY: Item[] = [
  { id: 'ball', emoji: '⚽', name: 'топка', price: 12 },
  { id: 'teddy', emoji: '🧸', name: 'мече', price: 15 },
  { id: 'book2', emoji: '📚', name: 'книга', price: 9 },
  { id: 'cap', emoji: '🧢', name: 'шапка', price: 8 },
  { id: 'paint', emoji: '🎨', name: 'бои', price: 7 },
  { id: 'kite', emoji: '🪁', name: 'хвърчило', price: 11 },
  { id: 'puzzle', emoji: '🧩', name: 'пъзел', price: 14 },
  { id: 'socks', emoji: '🧦', name: 'чорапи', price: 5 },
  { id: 'shoes', emoji: '👟', name: 'маратонки', price: 35 },
  { id: 'bag', emoji: '🎒', name: 'раница', price: 25 },
];

type Line = { item: Item; count: number };
type Task = { shelf: Item[]; list: Line[]; pay: number | null };
const total = (list: Line[]) => list.reduce((s, l) => s + l.count * l.item.price, 0);

const FIRST: Task = {
  shelf: CHEAP.slice(0, 6),
  list: [
    { item: CHEAP[0], count: 3 },
    { item: CHEAP[2], count: 2 },
  ],
  pay: null,
};

function newTask(level: Level): Task {
  for (;;) {
    const pool = level === 'big' ? PRICEY : CHEAP;
    const shelf = shuffled(pool).slice(0, 6);
    const n = randInt(2, 3);
    const list = shuffled(shelf)
      .slice(0, n)
      .map(item => ({ item, count: randInt(1, level === 'big' ? 3 : 4) }));
    const t = total(list);
    const max = level === 'small' ? 20 : level === 'change' ? 45 : 95;
    if (t < 6 || t > max) continue;
    const pay = level === 'small' ? null : level === 'change' ? [10, 20, 50].find(b => b > t)! : 100;
    return { shelf, list, pay };
  }
}

export default function ShopGame() {
  const [level, setLevel] = useState<Level>('small');
  const [task, setTask] = useState<Task>(FIRST);
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'shop' | 'total' | 'change' | 'done'>('shop');
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null);
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const sum = total(task.list);
  const matches = task.list.every(l => basket[l.item.id] === l.count) && Object.entries(basket).every(([id, c]) => c === 0 || task.list.some(l => l.item.id === id));

  const reset = (t: Task) => {
    setTask(t);
    setBasket({});
    setPhase('shop');
    setValue('');
    setState(undefined);
    setMsg(null);
  };
  const changeLevel = (l: Level) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    reset(newTask(l));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    reset(newTask(level));
  };

  const add = (it: Item, d: number) => {
    if (phase !== 'shop') return;
    const nb = { ...basket, [it.id]: Math.max(0, (basket[it.id] ?? 0) + d) };
    setBasket(nb);
    const ok = task.list.every(l => nb[l.item.id] === l.count) && Object.entries(nb).every(([id, c]) => c === 0 || task.list.some(l => l.item.id === id));
    if (ok) {
      setPhase('total');
      setMsg({ tone: 'info', text: 'Всичко от списъка е в кошницата! Колко трябва да платиш?' });
    }
  };

  const submit = () => {
    if (value === '' || (phase !== 'total' && phase !== 'change')) return;
    const want = phase === 'total' ? sum : (task.pay ?? 0) - sum;
    if (Number(value) === want) {
      setValue('');
      setState(undefined);
      if (phase === 'total' && task.pay) {
        setPhase('change');
        setMsg({ tone: 'good', text: `${praise()} Сметката е ${sum} €. Плащаш с банкнота от ${task.pay} €. Колко ресто ще получиш?` });
      } else {
        setPhase('done');
        setMsg({ tone: 'good', text: phase === 'total' ? `${praise()} Сметката е ${sum} €.` : `${praise()} ${task.pay} − ${sum} = ${want} € ресто.` });
      }
    } else {
      setState('bad');
      setMistakes(n => n + 1);
      setMsg({
        tone: 'bad',
        text:
          phase === 'total'
            ? `${tryAgain()} Сметни всеки ред: ${task.list.map(l => `${l.count} · ${l.item.price}`).join(', ')} – и събери.`
            : `${tryAgain()} Рестото е ${task.pay} − ${sum}.`,
      });
    }
  };
  const next = () => {
    setDone(d => d + 1);
    reset(newTask(level));
  };
  const type = (v: string) => {
    setValue(v);
    setState(undefined);
  };

  if (done >= ROUND)
    return (
      <>
        <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
        <RoundDone mistakes={mistakes} onAgain={again} />
      </>
    );

  const inBasket = Object.entries(basket).filter(([, c]) => c > 0);

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-start">
        {/* рафтът */}
        <div className="grid grid-cols-3 gap-2">
          {task.shelf.map(it => (
            <button
              key={it.id}
              onClick={() => add(it, 1)}
              disabled={phase !== 'shop'}
              aria-label={`${it.name}, ${it.price} евро`}
              className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-1.5 sm:p-2 flex flex-col items-center hover:bg-amber-100 disabled:opacity-60 disabled:cursor-default"
            >
              <span className="text-3xl sm:text-4xl" aria-hidden>
                {it.emoji}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-tight text-center">{it.name}</span>
              <span className="mt-0.5 px-2 rounded-full bg-white dark:bg-gray-800 border border-amber-300 text-sm sm:text-base font-bold tabular-nums">{it.price} €</span>
            </button>
          ))}
        </div>
        {/* списъкът */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 p-3 sm:min-w-[12rem] shadow-sm -rotate-1">
          <p className="font-bold mb-1 text-gray-800 dark:text-gray-100">📝 Купи:</p>
          <ul className="space-y-1 text-base sm:text-lg">
            {task.list.map(l => {
              const have = basket[l.item.id] ?? 0;
              return (
                <li key={l.item.id} className={have === l.count ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-200'}>
                  {have === l.count ? '✓' : '○'} {l.item.emoji} {l.item.name} – <b>{l.count}</b> бр.
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {/* кошницата */}
      <div className="mt-3 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/20 p-2 min-h-[3.5rem] flex flex-wrap items-center gap-2">
        <span className="text-2xl" aria-hidden>
          🧺
        </span>
        {inBasket.length === 0 && <span className="text-sm text-sky-700 dark:text-sky-300">Докосни стока на рафта, за да я сложиш в кошницата.</span>}
        {inBasket.map(([id, c]) => {
          const it = task.shelf.find(x => x.id === id)!;
          return (
            <button
              key={id}
              onClick={() => add(it, -1)}
              disabled={phase !== 'shop'}
              className="px-2 py-1 rounded-xl bg-white dark:bg-gray-800 border border-sky-300 dark:border-sky-700 text-base"
              aria-label={`махни ${it.name}`}
            >
              {it.emoji} {c} бр. <span className="text-rose-500 text-sm">✕</span>
            </button>
          );
        })}
        {phase === 'shop' && !matches && inBasket.some(([id, c]) => (task.list.find(l => l.item.id === id)?.count ?? 0) < c) && (
          <span className="text-sm text-rose-600 dark:text-rose-400">Има нещо в повече – докосни го, за да го махнеш.</span>
        )}
      </div>
      {msg && <Bubble tone={msg.tone}>{msg.text}</Bubble>}
      {(phase === 'total' || phase === 'change') && (
        <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={3}>
          <Problem>
            {phase === 'total' ? (
              <>
                Сметка: <AnswerBox value={value} state={state} /> €
              </>
            ) : (
              <>
                Ресто: <AnswerBox value={value} state={state} /> €
              </>
            )}
          </Problem>
          <NumPad value={value} onChange={type} onSubmit={submit} maxLength={3} />
        </KeyCatcher>
      )}
      {phase === 'done' && (
        <div className="text-center mt-4">
          <BigButton onClick={next} tone="emerald">
            Следващ клиент →
          </BigButton>
        </div>
      )}
    </>
  );
}

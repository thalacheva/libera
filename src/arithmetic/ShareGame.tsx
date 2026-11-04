import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { pick, praise, randInt, tryAgain } from './kidsMath';

// „Раздели бонбоните“: n бонбона за k деца, по равно. Докосваш чиния – слагаш един бонбон,
// или раздаваш „по един на всички“. При „с остатък“ някои бонбони остават в купата.

type Level = 'equal' | 'rest';
const LEVELS = [
  { id: 'equal', label: 'по равно' },
  { id: 'rest', label: 'с остатък' },
] as const;
const ROUND = 6;
const KIDS = ['🐶', '🐱', '🐰', '🦊', '🐼', '🐸'];
const SWEETS = ['🍬', '🍭', '🍫', '🧁'];

type Task = { n: number; k: number; sweet: string };
const FIRST: Record<Level, Task> = { equal: { n: 12, k: 3, sweet: '🍬' }, rest: { n: 14, k: 4, sweet: '🍬' } };

function newTask(level: Level, prev: Task): Task {
  for (;;) {
    const k = randInt(2, level === 'equal' ? 5 : 4);
    const q = randInt(2, level === 'equal' ? 6 : 5);
    const r = level === 'equal' ? 0 : randInt(1, k - 1);
    const n = k * q + r;
    if (n !== prev.n || k !== prev.k) return { n, k, sweet: pick(SWEETS) };
  }
}

export default function ShareGame() {
  const [level, setLevel] = useState<Level>('equal');
  const [task, setTask] = useState<Task>(FIRST.equal);
  const [plates, setPlates] = useState<number[]>(Array(FIRST.equal.k).fill(0));
  const [history, setHistory] = useState<number[][]>([]);
  const [phase, setPhase] = useState<'q' | 'r'>('q');
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const q = Math.floor(task.n / task.k);
  const r = task.n % task.k;
  const given = plates.reduce((s, p) => s + p, 0);
  const left = task.n - given;
  const fair = plates.every(p => p === plates[0]);
  const finished = state === 'good' && (level === 'equal' || phase === 'r');

  const reset = (t: Task) => {
    setTask(t);
    setPlates(Array(t.k).fill(0));
    setHistory([]);
    setPhase('q');
    setValue('');
    setState(undefined);
  };
  const changeLevel = (l: Level) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    reset(newTask(l, FIRST[l]));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    reset(newTask(level, task));
  };

  const put = (next: number[]) => {
    setHistory(h => [...h, plates]);
    setPlates(next);
  };
  const giveOne = (i: number) => {
    if (left > 0 && !finished) put(plates.map((p, j) => (j === i ? p + 1 : p)));
  };
  const undo = () => {
    if (!history.length) return;
    setPlates(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  };
  const giveAll = () => {
    if (left >= task.k && !finished) put(plates.map(p => p + 1));
  };

  const submit = () => {
    if (value === '' || finished) return;
    const want = phase === 'q' ? q : r;
    if (Number(value) === want) {
      if (phase === 'q' && level === 'rest') {
        setPhase('r');
        setValue('');
        setState(undefined);
        setMsg(`${praise()} Всеки получава по ${q}. А колко остават в купата?`);
      } else {
        setState('good');
        setMsg(praise());
        setPlates(Array(task.k).fill(q));
      }
    } else {
      setState('bad');
      setMistakes(n => n + 1);
      setMsg(tryAgain());
    }
  };
  const next = () => {
    setDone(d => d + 1);
    reset(newTask(level, task));
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

  const bowl = finished ? r : left;

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <p className="text-center text-base sm:text-lg text-gray-700 dark:text-gray-200">
        Раздели <b>{task.n}</b> {task.sweet} на <b>{task.k}</b> приятели по равно. Докосни чиния, за да сложиш бонбон.
      </p>
      {/* купата */}
      <div className="mx-auto my-3 max-w-sm min-h-[3.5rem] rounded-b-[3rem] rounded-t-xl bg-amber-100 dark:bg-amber-900/30 border-4 border-amber-400 px-3 py-2 flex flex-wrap justify-center gap-0.5 text-xl sm:text-2xl" aria-label={`в купата: ${bowl}`}>
        {Array.from({ length: bowl }, (_, i) => (
          <span key={i}>{task.sweet}</span>
        ))}
        {bowl === 0 && <span className="text-sm text-amber-700 dark:text-amber-300 self-center">празна купа</span>}
      </div>
      {/* чиниите */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {plates.map((p, i) => (
          <button
            key={i}
            onClick={() => giveOne(i)}
            disabled={left === 0 || finished}
            aria-label={`${KIDS[i]}: ${p}`}
            className="w-[4.6rem] sm:w-24 rounded-2xl border-2 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 p-1.5 flex flex-col items-center hover:bg-sky-100 disabled:cursor-default"
          >
            <span className="text-3xl" aria-hidden>
              {KIDS[i]}
            </span>
            <span className="flex flex-wrap justify-center gap-0 min-h-[3rem] text-base sm:text-lg leading-tight">
              {Array.from({ length: p }, (_, j) => (
                <span key={j}>{task.sweet}</span>
              ))}
            </span>
            <span className="text-sm font-bold text-sky-800 dark:text-sky-200 tabular-nums">{p}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        <BigButton small tone="sky" onClick={giveAll} disabled={left < task.k || finished}>
          По един на всички
        </BigButton>
        <BigButton small tone="gray" onClick={undo} disabled={history.length === 0 || finished}>
          <Undo2 size={18} className="inline -mt-0.5" /> назад
        </BigButton>
      </div>
      {!fair && left < task.k && !finished && <Bubble tone="info">Някой има повече от другите – така не е честно! Натисни „назад“.</Bubble>}
      <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={2} enabled={!finished}>
        <Problem>
          {phase === 'q' ? (
            <>
              {task.n} : {task.k} = <AnswerBox value={value} state={state} />
            </>
          ) : (
            <span className="text-3xl sm:text-4xl">
              {task.n} : {task.k} = {q}, ост. <AnswerBox value={value} state={state} />
            </span>
          )}
        </Problem>
        {phase === 'r' && !finished && state !== 'bad' && <Bubble tone="good">{msg}</Bubble>}
        {finished && (
          <Bubble tone="good">
            {msg} {task.n} : {task.k} = {q}
            {r > 0 ? `, остатък ${r}` : ''}. Проверка: {q} · {task.k}
            {r > 0 ? ` + ${r}` : ''} = {task.n}.
          </Bubble>
        )}
        {state === 'bad' && (
          <Bubble tone="bad">
            {msg} {phase === 'q' ? 'Раздавай по един на всички, докато може, и виж колко има в една чиния.' : 'Преброй бонбоните, които останаха в купата.'}
          </Bubble>
        )}
        {finished ? (
          <div className="text-center mt-4">
            <BigButton onClick={next} tone="emerald">
              Следваща →
            </BigButton>
          </div>
        ) : (
          <NumPad value={value} onChange={type} onSubmit={submit} maxLength={2} />
        )}
      </KeyCatcher>
    </>
  );
}

import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { praise, randInt, tryAgain } from './kidsMath';

// „Кутиите с яйца“: n яйца, във всяка кутия влизат по k. Колко кутии ще напълним? (n : k)
// Другото лице на делението – не „по колко на всеки“, а „колко пъти по k“. И връзката с таблицата: ? · k = n.

type Level = 'easy' | 'mid' | 'hard';
const LEVELS = [
  { id: 'easy', label: ': 2, 5, 10' },
  { id: 'mid', label: ': 3, 4' },
  { id: 'hard', label: ': 6 – 9' },
] as const;
const DIVISORS: Record<Level, number[]> = { easy: [2, 5, 10], mid: [3, 4], hard: [6, 7, 8, 9] };
const ROUND = 6;

type Task = { n: number; k: number };
const FIRST: Task = { n: 20, k: 5 };

function newTask(level: Level, prev: Task): Task {
  for (;;) {
    const ks = DIVISORS[level];
    const k = ks[randInt(0, ks.length - 1)];
    const boxes = randInt(2, k === 10 ? 6 : level === 'hard' ? 6 : 8);
    if (boxes * k !== prev.n || k !== prev.k) return { n: boxes * k, k };
  }
}

export default function EggGame() {
  const [level, setLevel] = useState<Level>('easy');
  const [task, setTask] = useState<Task>(FIRST);
  const [packed, setPacked] = useState(0); // напълнени кутии
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const answer = task.n / task.k;
  const loose = task.n - packed * task.k;

  const reset = (t: Task) => {
    setTask(t);
    setPacked(0);
    setValue('');
    setState(undefined);
  };
  const changeLevel = (l: Level) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    reset(newTask(l, task));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    reset(newTask(level, task));
  };
  const submit = () => {
    if (value === '' || state === 'good') return;
    if (Number(value) === answer) {
      setState('good');
      setMsg(praise());
      setPacked(answer);
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

  const cols = task.k <= 5 ? task.k : Math.ceil(task.k / 2);

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <p className="text-center text-base sm:text-lg text-gray-700 dark:text-gray-200">
        <b>{task.n}</b> яйца, във всяка кутия влизат по <b>{task.k}</b>. Колко кутии ще напълним?
      </p>
      {/* неопакованите яйца */}
      <div className="mx-auto my-3 max-w-md min-h-[2.5rem] rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-dashed border-yellow-400 p-2 flex flex-wrap justify-center gap-0.5 text-xl sm:text-2xl" aria-label={`неопаковани яйца: ${loose}`}>
        {Array.from({ length: loose }, (_, i) => (
          <span key={i}>🥚</span>
        ))}
        {loose === 0 && <span className="text-sm text-yellow-700 dark:text-yellow-300 self-center">всички яйца са в кутии</span>}
      </div>
      {/* кутиите */}
      <div className="flex flex-wrap justify-center gap-2 min-h-[3rem]">
        {Array.from({ length: packed }, (_, b) => (
          <div key={b} className="relative rounded-xl bg-stone-300 dark:bg-stone-600 border-2 border-stone-500 p-1 motion-safe:animate-pop">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
              {Array.from({ length: task.k }, (_, i) => (
                <span key={i} className="text-base sm:text-lg leading-none">
                  🥚
                </span>
              ))}
            </div>
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{b + 1}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        <BigButton small tone="amber" onClick={() => setPacked(p => p + 1)} disabled={loose < task.k || state === 'good'}>
          📦 Напълни кутия
        </BigButton>
        <BigButton small tone="gray" onClick={() => setPacked(p => p - 1)} disabled={packed === 0 || state === 'good'}>
          <Undo2 size={18} className="inline -mt-0.5" /> назад
        </BigButton>
      </div>
      <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={2} enabled={state !== 'good'}>
        <Problem>
          {task.n} : {task.k} = <AnswerBox value={value} state={state} />
        </Problem>
        <p className="text-center text-base sm:text-lg text-gray-500 dark:text-gray-400 -mt-1">
          защото {state === 'good' ? <b className="text-emerald-600 dark:text-emerald-400">{answer}</b> : '?'} · {task.k} = {task.n}
        </p>
        {state === 'good' && (
          <Bubble tone="good">
            {msg} {answer} кутии по {task.k} яйца: {answer} · {task.k} = {task.n}, значи {task.n} : {task.k} = {answer}.
          </Bubble>
        )}
        {state === 'bad' && (
          <Bubble tone="bad">
            {msg} Помисли от таблицата: колко пъти по {task.k} правят {task.n}? Или напълни кутиите една по една.
          </Bubble>
        )}
        {state === 'good' ? (
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

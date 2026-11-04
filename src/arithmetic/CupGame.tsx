import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { praise, randInt, tryAgain } from './kidsMath';

// „Под чашата“: всичко са T топчета, виждаме S, останалите са скрити под чашата.
// S + ? = T, значи T − S = ? – изваждането като „колко липсват“ (броене нагоре).

type Level = 'to10' | 'to20' | 'to100';
const LEVELS = [
  { id: 'to10', label: 'до 10' },
  { id: 'to20', label: 'до 20' },
  { id: 'to100', label: 'до 100' },
] as const;
const ROUND = 6;

type Task = { total: number; seen: number };
const FIRST: Record<Level, Task> = { to10: { total: 9, seen: 6 }, to20: { total: 15, seen: 8 }, to100: { total: 45, seen: 28 } };

function newTask(level: Level, prev: Task): Task {
  for (;;) {
    let total: number;
    let seen: number;
    if (level === 'to10') {
      total = randInt(4, 10);
      seen = randInt(1, total - 1);
    } else if (level === 'to20') {
      total = randInt(11, 20);
      seen = randInt(3, total - 2);
    } else {
      total = randInt(30, 99);
      seen = randInt(11, total - 6);
    }
    if (total !== prev.total || seen !== prev.seen) return { total, seen };
  }
}

/** Число като пръчки по 10 и отделни топчета. */
function Beads({ n, tone }: { n: number; tone: 'sky' | 'pink' }) {
  const dot = `h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full ${tone === 'sky' ? 'bg-sky-500' : 'bg-pink-500'}`;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return (
    <div className="flex items-end gap-1" aria-label={`${n} топчета`}>
      {Array.from({ length: tens }, (_, t) => (
        <div key={`t${t}`} className="flex flex-col gap-0.5 p-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={dot} />
          ))}
        </div>
      ))}
      {ones > 0 && (
        <div className="grid grid-rows-5 grid-flow-col gap-0.5">
          {Array.from({ length: ones }, (_, i) => (
            <span key={i} className={dot} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CupGame() {
  const [level, setLevel] = useState<Level>('to10');
  const [task, setTask] = useState<Task>(FIRST.to10);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const hidden = task.total - task.seen;

  const reset = (t: Task) => {
    setTask(t);
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
  const submit = () => {
    if (value === '' || state === 'good') return;
    if (Number(value) === hidden) {
      setState('good');
      setMsg(praise());
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

  // Подсказка „броене нагоре“: до следващата десетица и после до края.
  const nextTen = Math.ceil(task.seen / 10) * 10;
  const countUp =
    task.total > nextTen && nextTen > task.seen
      ? `От ${task.seen} до ${nextTen} са ${nextTen - task.seen}, от ${nextTen} до ${task.total} са ${task.total - nextTen}. Събери ги!`
      : `Брой нагоре от ${task.seen} до ${task.total}: ${Array.from({ length: Math.min(hidden, 4) }, (_, i) => task.seen + i + 1).join(', ')}${hidden > 4 ? ', …' : ''}`;

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <p className="text-center text-base sm:text-lg text-gray-700 dark:text-gray-200">
        Всичко са <b>{task.total}</b> топчета. Колко са скрити под чашата?
      </p>
      <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-5 my-4 min-h-[9rem]">
        <Beads n={task.seen} tone="sky" />
        <span className="text-3xl font-bold text-gray-500 self-center">+</span>
        <div className="relative flex items-end justify-center min-w-[5.5rem] min-h-[8.5rem]">
          {state === 'good' && <Beads n={hidden} tone="pink" />}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-28 transition-all duration-700 ${state === 'good' ? '-translate-y-24 opacity-0' : ''}`}
            aria-hidden={state === 'good'}
          >
            <div className="w-full h-full bg-gradient-to-b from-rose-400 to-rose-600 [clip-path:polygon(15%_0,85%_0,100%_100%,0_100%)] flex items-center justify-center text-5xl font-extrabold text-white">
              ?
            </div>
          </div>
        </div>
        <span className="text-3xl font-bold text-gray-500 self-center">= {task.total}</span>
      </div>
      <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={2} enabled={state !== 'good'}>
        <Problem>
          <span className="text-sky-500">{task.seen}</span> + <AnswerBox value={value} state={state} /> = {task.total}
        </Problem>
        <p className="text-center text-base sm:text-lg text-gray-500 dark:text-gray-400 -mt-1">
          значи {task.total} − {task.seen} = {state === 'good' ? <b className="text-emerald-600 dark:text-emerald-400">{hidden}</b> : '?'}
        </p>
        {state === 'good' && (
          <Bubble tone="good">
            {msg} Под чашата има {hidden}: {task.seen} + {hidden} = {task.total}.
          </Bubble>
        )}
        {state === 'bad' && (
          <Bubble tone="bad">
            {msg} {countUp}
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

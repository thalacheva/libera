import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { pick, praise, randInt, tryAgain } from './kidsMath';

// „Лехите“: r реда по c цветя – r · c. Докосването на ред брои „по c“ (c, 2c, 3c, …),
// а бутонът „Завърти“ показва, че r · c = c · r.

type Level = 'small' | 'table';
const LEVELS = [
  { id: 'small', label: 'до 5 · 5' },
  { id: 'table', label: 'до 10 · 10' },
] as const;
const ROUND = 6;
const FLOWERS = ['🌷', '🌻', '🌼', '🍓', '🥕', '🍎'];

type Task = { r: number; c: number; flower: string };
const FIRST: Task = { r: 3, c: 4, flower: '🌷' };

function newTask(level: Level, prev: Task): Task {
  for (;;) {
    const max = level === 'small' ? 5 : 10;
    const r = randInt(2, max);
    const c = randInt(2, max);
    if ((r !== prev.r || c !== prev.c) && (level === 'small' || r * c > 25)) return { r, c, flower: pick(FLOWERS) };
  }
}

export default function ArrayGame() {
  const [level, setLevel] = useState<Level>('small');
  const [task, setTask] = useState<Task>(FIRST);
  const [counted, setCounted] = useState(0); // колко реда са преброени
  const [flipped, setFlipped] = useState(false);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const rows = flipped ? task.c : task.r;
  const cols = flipped ? task.r : task.c;
  const answer = task.r * task.c;

  const reset = (t: Task) => {
    setTask(t);
    setCounted(0);
    setFlipped(false);
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
      setCounted(rows);
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

  const size = Math.max(rows, cols) > 6 ? 'text-lg sm:text-2xl w-6 sm:w-9' : 'text-2xl sm:text-3xl w-9 sm:w-11';

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={3} enabled={state !== 'good'}>
        <Problem>
          {rows} · {cols} = <AnswerBox value={value} state={state} />
        </Problem>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
          <b>{rows}</b> реда по <b>{cols}</b>. Докосни ред, за да броиш по {cols}.
        </p>
        <div className="flex justify-center my-3">
          <div className="rounded-2xl bg-lime-100 dark:bg-lime-900/30 border-4 border-amber-700/60 p-1.5 sm:p-2">
            {Array.from({ length: rows }, (_, i) => (
              <button
                key={`${flipped}-${i}`}
                onClick={() => state !== 'good' && setCounted(Math.max(counted, i + 1))}
                className={`flex items-center w-full rounded-lg px-1 ${i < counted ? 'bg-amber-200/70 dark:bg-amber-700/40' : 'hover:bg-lime-200/60 dark:hover:bg-lime-800/40'}`}
                aria-label={`ред ${i + 1}`}
              >
                {Array.from({ length: cols }, (_, j) => (
                  <span key={j} className={`${size} text-center leading-tight`} aria-hidden>
                    {task.flower}
                  </span>
                ))}
                <span className="w-9 sm:w-12 text-right text-base sm:text-xl font-bold tabular-nums text-amber-800 dark:text-amber-300">{i < counted ? (i + 1) * cols : ''}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <BigButton small tone="sky" onClick={() => (setFlipped(f => !f), setCounted(0))}>
            🔄 Завърти лехата
          </BigButton>
        </div>
        {state === 'good' && (
          <Bubble tone="good">
            {msg} {rows} · {cols} = {answer}
            {task.r !== task.c && `, и ${cols} · ${rows} = ${answer}`}.
          </Bubble>
        )}
        {state === 'bad' && (
          <Bubble tone="bad">
            {msg} Брой по {cols}: {Array.from({ length: Math.min(rows, 3) }, (_, i) => (i + 1) * cols).join(', ')}
            {rows > 3 ? ', …' : ''}
          </Bubble>
        )}
        {state === 'good' ? (
          <div className="text-center mt-4">
            <BigButton onClick={next} tone="emerald">
              Следваща →
            </BigButton>
          </div>
        ) : (
          <NumPad value={value} onChange={type} onSubmit={submit} maxLength={3} />
        )}
      </KeyCatcher>
    </>
  );
}

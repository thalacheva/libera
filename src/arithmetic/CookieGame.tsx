import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { praise, randInt, tryAgain } from './kidsMath';

// „Бисквитките“: в кутиите по 10 места има бисквитки, мечето изяжда няколко. Колко остават?
// „През 10“: 13 − 5 – първо изяжда 3 от втората кутия (остават 10), после още 2 от пълната.

type Mode = 'to10' | 'bridge';
const LEVELS = [
  { id: 'to10', label: 'до 10' },
  { id: 'bridge', label: 'През 10 (до 20)' },
] as const;
const ROUND = 8;

type Task = { a: number; b: number };
// Първите задачи са фиксирани – страницата се рисува еднакво на сървъра и в браузъра.
const FIRST: Record<Mode, Task> = { to10: { a: 9, b: 4 }, bridge: { a: 13, b: 5 } };

function newTask(mode: Mode, prev: Task): Task {
  for (;;) {
    let t: Task;
    if (mode === 'to10') {
      const a = randInt(4, 10);
      t = { a, b: randInt(1, a - 1) };
    } else {
      const a = randInt(11, 18);
      t = { a, b: randInt(a - 9, 9) }; // b > единиците на a, резултатът е под 10
    }
    if (t.a !== prev.a || t.b !== prev.b) return t;
  }
}

function Box({ count, eaten, label }: { count: number; eaten: number; label: string }) {
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-orange-100 dark:bg-orange-900/30 border-4 border-orange-400" aria-label={label}>
      {Array.from({ length: 10 }, (_, i) => {
        const has = i < count;
        const gone = has && i >= count - eaten;
        return (
          <span key={i} className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-2xl sm:text-3xl">
            {has && (gone ? <span className="text-base text-orange-300 motion-safe:animate-pop">·:·</span> : '🍪')}
          </span>
        );
      })}
    </div>
  );
}

export default function CookieGame() {
  const [mode, setMode] = useState<Mode>('to10');
  const [task, setTask] = useState<Task>(FIRST.to10);
  const [eaten, setEaten] = useState(0);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const answer = task.a - task.b;
  const second = Math.max(0, task.a - 10); // бисквитките във втората кутия

  const reset = (t: Task) => {
    setTask(t);
    setEaten(0);
    setValue('');
    setState(undefined);
  };
  const changeMode = (m: Mode) => {
    setMode(m);
    setDone(0);
    setMistakes(0);
    reset(newTask(m, FIRST[m]));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    reset(newTask(mode, task));
  };
  const submit = () => {
    if (value === '' || state === 'good') return;
    if (Number(value) === answer) {
      setState('good');
      setMsg(praise());
      setEaten(task.b);
    } else {
      setState('bad');
      setMistakes(n => n + 1);
      setMsg(tryAgain());
    }
  };
  const next = () => {
    setDone(d => d + 1);
    reset(newTask(mode, task));
  };
  const type = (v: string) => {
    setValue(v);
    setState(undefined);
  };

  if (done >= ROUND)
    return (
      <>
        <LevelPicker levels={LEVELS} value={mode} onChange={changeMode} />
        <RoundDone mistakes={mistakes} onAgain={again} />
      </>
    );

  // Изядените се махат отзад напред: първо от втората кутия, после от първата.
  const eatenSecond = Math.min(eaten, second);
  const eatenFirst = eaten - eatenSecond;
  const firstCount = Math.min(task.a, 10);

  return (
    <>
      <LevelPicker levels={LEVELS} value={mode} onChange={changeMode} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={2} enabled={state !== 'good'}>
        <Problem>
          {task.a} − <span className="text-orange-500">{task.b}</span> = <AnswerBox value={value} state={state} />
        </Problem>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 my-2">
          <Box count={firstCount} eaten={eatenFirst} label="първа кутия" />
          {mode === 'bridge' && <Box count={second} eaten={eatenSecond} label="втора кутия" />}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <BigButton small tone="pink" onClick={() => setEaten(e => e + 1)} disabled={eaten >= task.b || state === 'good'}>
            🐻 Хам! Изяж една
          </BigButton>
          <BigButton small tone="gray" onClick={() => setEaten(0)} disabled={eaten === 0 || state === 'good'}>
            Върни ги
          </BigButton>
        </div>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
          {eaten < task.b ? (
            <>
              Мечето ще изяде <b>{task.b}</b> бисквитки. Изядени: <b>{eaten}</b>.
            </>
          ) : mode === 'bridge' ? (
            <>
              Първо {second} от втората кутия ({task.a} − {second} = 10), после още {task.b - second} от пълната.
            </>
          ) : (
            'Колко бисквитки останаха?'
          )}
        </p>
        {state === 'good' && (
          <Bubble tone="good">
            {msg} {mode === 'bridge' ? `${task.a} − ${second} − ${task.b - second} = 10 − ${task.b - second} = ${answer}` : `${task.a} − ${task.b} = ${answer}`}
          </Bubble>
        )}
        {state === 'bad' && (
          <Bubble tone="bad">
            {msg} {mode === 'bridge' ? `Махни първо ${second}, за да останат точно 10. После махни още ${task.b - second}.` : 'Нека мечето изяде бисквитките и преброй останалите.'}
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

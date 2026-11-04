import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { randInt, praise, tryAgain } from './kidsMath';

// „Десетичната кутия“: кутия 2 × 5 за 10 топчета.
// „Приятелите на 10“ – колко липсват до 10; „През 10“ – 8 + 5 = 8 + 2 + 3 = 10 + 3.

type Mode = 'make10' | 'bridge';
const LEVELS = [
  { id: 'make10', label: 'Приятелите на 10' },
  { id: 'bridge', label: 'През 10 (до 20)' },
] as const;
const ROUND = 8;

type Task = { a: number; b: number };
// Първите задачи са фиксирани – страницата се рисува еднакво на сървъра и в браузъра.
const FIRST: Record<Mode, Task> = { make10: { a: 7, b: 3 }, bridge: { a: 8, b: 5 } };

function newTask(mode: Mode, prev: Task): Task {
  for (;;) {
    let t: Task;
    if (mode === 'make10') {
      const a = randInt(1, 9);
      t = { a, b: 10 - a };
    } else {
      const a = randInt(5, 9);
      t = { a, b: randInt(11 - a, 9) };
    }
    if (t.a !== prev.a || t.b !== prev.b) return t;
  }
}

function Frame({ cells, onCell, label }: { cells: ('red' | 'blue' | null)[]; onCell?: (i: number) => void; label: string }) {
  return (
    <div className="inline-block" aria-label={label}>
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-amber-100 dark:bg-amber-900/40 border-4 border-amber-500">
        {cells.map((c, i) => (
          <button
            key={i}
            onClick={() => onCell?.(i)}
            disabled={!onCell}
            aria-label={c ? 'топче' : 'празно'}
            className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center disabled:cursor-default"
          >
            {c && (
              <span
                className={`block h-7 w-7 sm:h-9 sm:w-9 rounded-full shadow-inner motion-safe:animate-pop ${c === 'red' ? 'bg-rose-500' : 'bg-sky-500'}`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TenFrameGame() {
  const [mode, setMode] = useState<Mode>('make10');
  const [task, setTask] = useState<Task>(FIRST.make10);
  // make10: кои празни клетки детето е напълнило; bridge: колко сини топчета е преместило в първата кутия.
  const [filled, setFilled] = useState<boolean[]>(Array(10).fill(false));
  const [moved, setMoved] = useState(0);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const answer = mode === 'make10' ? task.b : task.a + task.b;

  const reset = (t: Task) => {
    setTask(t);
    setFilled(Array(10).fill(false));
    setMoved(0);
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
      if (mode === 'make10') setFilled(Array(10).fill(true));
      else setMoved(10 - task.a);
    } else {
      setState('bad');
      setMistakes(m => m + 1);
      setMsg(tryAgain());
    }
  };
  const next = () => {
    setDone(d => d + 1);
    reset(newTask(mode, task));
  };

  if (done >= ROUND) return (
    <>
      <LevelPicker levels={LEVELS} value={mode} onChange={changeMode} />
      <RoundDone mistakes={mistakes} onAgain={again} />
    </>
  );

  // Клетките на кутиите.
  let frames: { cells: ('red' | 'blue' | null)[]; onCell?: (i: number) => void; label: string }[];
  if (mode === 'make10') {
    const cells = Array.from({ length: 10 }, (_, i) => (i < task.a ? 'red' : filled[i] ? 'blue' : null)) as ('red' | 'blue' | null)[];
    frames = [
      {
        cells,
        label: 'кутия с 10 места',
        onCell: state === 'good' ? undefined : i => i >= task.a && setFilled(f => f.map((v, j) => (j === i ? !v : v))),
      },
    ];
  } else {
    const space = 10 - task.a;
    const first = Array.from({ length: 10 }, (_, i) => (i < task.a ? 'red' : i < task.a + moved ? 'blue' : null)) as ('red' | 'blue' | null)[];
    const left = task.b - moved;
    const second = Array.from({ length: 10 }, (_, i) => (i < left ? 'blue' : null)) as ('red' | 'blue' | null)[];
    frames = [
      { cells: first, label: 'първа кутия' },
      { cells: second, label: 'втора кутия', onCell: moved < space && state !== 'good' ? i => i < left && setMoved(m => m + 1) : undefined },
    ];
  }
  const added = filled.filter(Boolean).length;
  const space = 10 - task.a;
  const rest = task.b - space;

  return (
    <>
      <LevelPicker levels={LEVELS} value={mode} onChange={changeMode} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <KeyCatcher value={value} onChange={v => (setValue(v), setState(undefined))} onSubmit={submit} maxLength={2} enabled={state !== 'good'}>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 my-2">
          {frames.map((f, i) => (
            <Frame key={i} {...f} />
          ))}
        </div>
        <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
          {mode === 'make10'
            ? state === 'good'
              ? ''
              : `Докосни празните места, за да сложиш сини топчета${added ? ` (сложи ${added})` : ''}.`
            : moved < space && state !== 'good'
              ? 'Докосни синьо топче във втората кутия – то ще скочи в първата.'
              : `Първата кутия е пълна: ${task.a} + ${task.b} = 10 + ${rest}`}
        </p>
        <Problem>
          {mode === 'make10' ? (
            <>
              <span className="text-rose-500">{task.a}</span> + <AnswerBox value={value} state={state} /> = 10
            </>
          ) : (
            <>
              <span className="text-rose-500">{task.a}</span> + <span className="text-sky-500">{task.b}</span> = <AnswerBox value={value} state={state} />
            </>
          )}
        </Problem>
        {state === 'good' && (
          <Bubble tone="good">
            {msg} {mode === 'make10' ? `${task.a} и ${task.b} са приятели – заедно правят 10.` : `${task.a} + ${space} = 10, после 10 + ${rest} = ${answer}.`}
          </Bubble>
        )}
        {state === 'bad' && (
          <Bubble tone="bad">
            {msg} {mode === 'make10' ? 'Преброй празните места в кутията.' : `Първо допълни до 10: ${task.a} + ${space} = 10. Остават още ${rest}.`}
          </Bubble>
        )}
        {state === 'good' ? (
          <div className="text-center mt-4">
            <BigButton onClick={next} tone="emerald">
              Следваща →
            </BigButton>
          </div>
        ) : (
          <NumPad value={value} onChange={v => (setValue(v), setState(undefined))} onSubmit={submit} maxLength={2} />
        )}
      </KeyCatcher>
    </>
  );
}

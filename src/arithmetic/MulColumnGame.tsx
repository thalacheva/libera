import { useState, type KeyboardEvent } from 'react';
import { BigButton, Bubble, LevelPicker, RoundBar, RoundDone } from './kit';
import { praise, randInt } from './kidsMath';

// „Писмено умножение“ с едноцифрено число: всяка цифра на a се умножава по b отдясно наляво,
// пишем единиците, а десетиците „пренасяме“ (може да са повече от 1) над следващата колона.

type Level = 'two' | 'three' | 'four';
const LEVELS = [
  { id: 'two', label: '23 · 4' },
  { id: 'three', label: '234 · 5' },
  { id: 'four', label: '2345 · 6' },
] as const;
const ROUND = 4;

type Task = { a: number; b: number };
const FIRST: Task = { a: 36, b: 4 };

function newTask(level: Level, prev: Task): Task {
  for (;;) {
    const a = level === 'two' ? randInt(12, 98) : level === 'three' ? randInt(102, 987) : randInt(1023, 9876);
    const b = randInt(level === 'two' ? 2 : 3, 9);
    if (a % 10 === 0) continue;
    // поне едно пренасяне
    if ((a % 10) * b < 10) continue;
    if (a !== prev.a || b !== prev.b) return { a, b };
  }
}

function model({ a, b }: Task) {
  const A = String(a).split('').map(Number);
  const product = a * b;
  const P = String(product).split('');
  const len = P.length;
  // Стъпка s (0 = единици): умножаваме цифрата на a, добавяме пренесеното.
  const stepsA = A.length;
  const carryIn: number[] = [];
  const raw: number[] = [];
  let c = 0;
  for (let s = 0; s < stepsA; s++) {
    carryIn.push(c);
    const d = A[A.length - 1 - s];
    raw.push(d * b + c);
    c = Math.floor((d * b + c) / 10);
  }
  return { A, P, len, product, carryIn, raw, digitOf: (s: number) => (s < stepsA ? A[A.length - 1 - s] : null), finalCarry: c };
}

export default function MulColumnGame() {
  const [level, setLevel] = useState<Level>('two');
  const [task, setTask] = useState<Task>(FIRST);
  const [filled, setFilled] = useState(0);
  const [bad, setBad] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const m = model(task);
  const complete = filled >= m.len;
  const s = filled; // текущата стъпка отдясно
  const width = m.len; // колони за цифрите

  const reset = (t: Task) => {
    setTask(t);
    setFilled(0);
    setBad(false);
    setMsg('');
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

  const explain = (step: number) => {
    const d = m.digitOf(step);
    if (d === null) return `Остана пренесеното ${m.finalCarry} – пишем го отпред.`;
    const c = m.carryIn[step];
    const v = m.raw[step];
    const first = `${d} · ${task.b} = ${d * task.b}`;
    const plus = c ? `, плюс пренесените ${c} = ${v}` : '';
    const tail = v >= 10 ? `: пишем ${v % 10}, а ${Math.floor(v / 10)} пренасяме.` : `: пишем ${v}.`;
    return first + plus + tail;
  };

  const press = (d: number) => {
    if (complete) return;
    const expected = Number(m.P[m.len - 1 - s]);
    if (d === expected) {
      setBad(false);
      const nf = filled + 1;
      setFilled(nf);
      setMsg(nf >= m.len ? `${praise()} ${task.a} · ${task.b} = ${m.product}` : m.digitOf(s) !== null && m.raw[s] >= 10 ? explain(s) : '');
    } else {
      setBad(true);
      setMistakes(n => n + 1);
      setMsg(`Не е ${d}. ${explain(s)}`);
    }
  };
  const next = () => {
    setDone(n => n + 1);
    reset(newTask(level, task));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      press(Number(e.key));
    } else if (e.key === 'Enter' && complete) {
      e.preventDefault();
      next();
    }
  };

  if (done >= ROUND)
    return (
      <>
        <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
        <RoundDone mistakes={mistakes} onAgain={again} />
      </>
    );

  const cell = 'w-10 sm:w-12 h-12 sm:h-14 flex items-center justify-center';
  // Колоната (отляво, 0..width−1) на стъпка step.
  const colOf = (step: number) => width - 1 - step;
  const activeCol = colOf(s);
  const Apad = String(task.a).padStart(width, ' ').split('');
  // Пренесеното над колоната се вижда, щом стигнем до нея.
  const carryShown = (col: number) => {
    const step = width - 1 - col;
    return step < m.A.length && step <= s && m.carryIn[step] > 0;
  };

  return (
    <div onKeyDown={onKeyDown} tabIndex={-1} className="outline-none">
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <div className="flex justify-center">
        <div className="inline-grid gap-x-1 text-3xl sm:text-4xl font-bold tabular-nums text-gray-900 dark:text-white" style={{ gridTemplateColumns: `repeat(${width + 1}, auto)` }}>
          <span />
          {Apad.map((_, col) => (
            <span key={`c${col}`} className={`${cell} !h-6 text-lg text-rose-600 dark:text-rose-400`}>
              {carryShown(col) ? <span className="motion-safe:animate-pop">+{m.carryIn[width - 1 - col]}</span> : ''}
            </span>
          ))}
          <span />
          {Apad.map((d, col) => (
            <span key={`a${col}`} className={`${cell} ${col === activeCol && !complete && d !== ' ' ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
              {d.trim()}
            </span>
          ))}
          <span className={cell} aria-label="умножено по">
            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-gray-500" />
          </span>
          {Apad.map((_, col) => (
            <span key={`b${col}`} className={`${cell} ${col === width - 1 ? 'text-sky-600 dark:text-sky-400' : ''}`}>
              {col === width - 1 ? task.b : ''}
            </span>
          ))}
          <span className="col-span-full h-1 rounded bg-gray-800 dark:bg-gray-200 my-1" />
          <span />
          {m.P.map((d, col) => {
            const shown = width - 1 - col < filled;
            const active = col === activeCol && !complete;
            return (
              <span
                key={`p${col}`}
                className={`${cell} rounded-xl border-2 ${
                  shown
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : active
                      ? `border-amber-500 border-dashed bg-amber-50 dark:bg-amber-900/20 ${bad ? 'motion-safe:animate-shake border-rose-500' : ''}`
                      : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {shown ? d : active ? '?' : ''}
              </span>
            );
          })}
        </div>
      </div>
      {!complete && (
        <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
          {m.digitOf(s) !== null ? (
            <>
              Умножи <b>{m.digitOf(s)}</b> по <b>{task.b}</b>
              {m.carryIn[s] ? (
                <>
                  {' '}
                  и добави пренесените <b className="text-rose-600 dark:text-rose-400">{m.carryIn[s]}</b>
                </>
              ) : (
                ''
              )}
              . Коя цифра пишем?
            </>
          ) : (
            <>Остана пренесеното. Коя цифра пишем отпред?</>
          )}
        </p>
      )}
      {msg && <Bubble tone={complete ? 'good' : bad ? 'bad' : 'info'}>{msg}</Bubble>}
      {complete ? (
        <div className="text-center mt-4">
          <BigButton onClick={next} tone="emerald">
            Следваща →
          </BigButton>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto mt-3 select-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => (
            <button
              key={d}
              onClick={() => press(d)}
              className="h-12 sm:h-14 rounded-2xl text-2xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all bg-white hover:bg-amber-50 text-gray-800 border-gray-300 shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-900"
            >
              {d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

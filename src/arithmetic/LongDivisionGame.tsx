import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { BigButton, Bubble, LevelPicker, RoundBar, RoundDone } from './kit';
import { praise, randInt } from './kidsMath';

// „Писмено деление“ на едноцифрено число, както в българските учебници:
//   672 : 4 = 168
//   4
//   27
//   24
//    32 …
// Всяка стъпка: колко пъти делителят се съдържа в частичното делимо (цифра на частното), после остатъкът.

type Level = 'two' | 'three' | 'rest';
const LEVELS = [
  { id: 'two', label: '84 : 4' },
  { id: 'three', label: '672 : 4' },
  { id: 'rest', label: 'с остатък' },
] as const;
const ROUND = 4;

type Task = { n: number; k: number };
const FIRST: Task = { n: 84, k: 4 };

function newTask(level: Level, prev: Task): Task {
  for (;;) {
    const k = randInt(level === 'two' ? 2 : 3, level === 'two' ? 6 : 9);
    let n: number;
    if (level === 'two') {
      const q = randInt(11, Math.floor(99 / k));
      n = q * k;
    } else if (level === 'three') {
      // понякога с нула в частното: 612 : 3 = 204
      const q = randInt(0, 3) === 0 ? 100 * randInt(1, 9) + randInt(0, 9) : randInt(Math.ceil(100 / k) + 1, Math.floor(999 / k));
      n = q * k;
    } else {
      const q = randInt(Math.ceil(100 / k) + 1, Math.floor(990 / k));
      n = q * k + randInt(1, k - 1);
    }
    if (n < 10 || n > 999 || (level !== 'two' && n < 100)) continue;
    if (n !== prev.n || k !== prev.k) return { n, k };
  }
}

type Step = { P: number; end: number; q: number; prod: number; rem: number };

/** Стъпките на делението: частично делимо, докъде стига (индекс на цифра), цифра на частното, произведение, остатък. */
function stepsOf({ n, k }: Task): Step[] {
  const D = String(n).split('').map(Number);
  let end = 0;
  let P = D[0];
  while (P < k && end < D.length - 1) {
    end++;
    P = P * 10 + D[end];
  }
  const steps: Step[] = [];
  for (;;) {
    const q = Math.floor(P / k);
    const rem = P - q * k;
    steps.push({ P, end, q, prod: q * k, rem });
    if (end === D.length - 1) break;
    end++;
    P = rem * 10 + D[end];
  }
  return steps;
}

export default function LongDivisionGame() {
  const [level, setLevel] = useState<Level>('two');
  const [task, setTask] = useState<Task>(FIRST);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'q' | 'r'>('q');
  const [bad, setBad] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const steps = stepsOf(task);
  const complete = step >= steps.length;
  const cur = steps[Math.min(step, steps.length - 1)];
  const D = String(task.n).split('');
  const L = D.length;
  const Q = Math.floor(task.n / task.k);
  const R = task.n % task.k;

  const reset = (t: Task) => {
    setTask(t);
    setStep(0);
    setPhase('q');
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

  const press = (d: number) => {
    if (complete) return;
    const { P, q, prod, rem } = cur;
    const k = task.k;
    if (phase === 'q') {
      if (d === q) {
        setBad(false);
        setPhase('r');
        setMsg(q === 0 ? `${k} не се съдържа в ${P} – пишем 0 в частното.` : '');
      } else {
        setBad(true);
        setMistakes(n => n + 1);
        setMsg(d * k > P ? `${d} · ${k} = ${d * k} – това е повече от ${P}. Опитай с по-малко.` : `${d} · ${k} = ${d * k}, но остават ${P - d * k} – още едно ${k} се събира.`);
      }
    } else if (d === rem) {
      setBad(false);
      setPhase('q');
      const ns = step + 1;
      setStep(ns);
      if (ns >= steps.length) setMsg(`${praise()} ${task.n} : ${k} = ${Q}${R ? `, остатък ${R}` : ''}. Проверка: ${Q} · ${k}${R ? ` + ${R}` : ''} = ${task.n}.`);
      else setMsg(`Сваляме следващата цифра ${D[steps[ns].end]} – стават ${steps[ns].P}.`);
    } else {
      setBad(true);
      setMistakes(n => n + 1);
      setMsg(`Извади: ${P} − ${prod} = ?`);
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

  // ---- чертежът: редове от L клетки (+ колона за знака „−“ отляво) ----
  const cellW = 'w-8 sm:w-10';
  const cell = `${cellW} h-10 sm:h-12 flex items-center justify-center`;
  /** Ред с числото text, подравнено вдясно до колона end. */
  const rowCells = (text: string, end: number, opts: { minus?: boolean; tone?: string; hi?: boolean } = {}) => {
    const cells: ReactNode[] = [];
    const start = end - text.length + 1;
    // знакът „−“ е точно пред числото (в колоната вляво от него или в най-лявата колона)
    const minusAt = opts.minus ? start - 1 : -2;
    cells.push(
      <span key="s" className={`${cell} !w-5 text-gray-500`}>
        {minusAt === -1 ? '−' : ''}
      </span>,
    );
    for (let c = 0; c < L; c++) {
      if (c === minusAt) {
        cells.push(
          <span key={c} className={`${cell} justify-end pr-0.5 text-gray-500`}>
            −
          </span>,
        );
        continue;
      }
      const ch = c >= start && c <= end ? text[c - start] : '';
      cells.push(
        <span key={c} className={`${cell} ${ch ? (opts.tone ?? '') : ''} ${opts.hi && ch ? 'bg-amber-100 dark:bg-amber-900/40 rounded-md' : ''}`}>
          {ch}
        </span>,
      );
    }
    return cells;
  };

  const shownQ = steps
    .slice(0, step + (phase === 'r' && !complete ? 1 : 0))
    .map(s => s.q)
    .join('');
  const rows: ReactNode[] = [];
  steps.forEach((s, i) => {
    const qDone = i < step || (i === step && phase === 'r');
    if (!qDone) return;
    // произведение и черта
    rows.push(
      <div key={`p${i}`} className="flex">
        {rowCells(String(s.prod), s.end, { minus: true, tone: 'text-sky-700 dark:text-sky-300' })}
      </div>,
    );
    const w = String(Math.max(s.prod, s.P)).length;
    rows.push(
      <div key={`l${i}`} className="flex">
        <span className="!w-5 w-5" />
        {Array.from({ length: L }, (_, c) => (
          <span key={c} className={`${cellW} h-1`}>
            {c > s.end - w && c <= s.end && <span className="block h-0.5 bg-gray-700 dark:bg-gray-300" />}
          </span>
        ))}
      </div>,
    );
    // остатък (и свалената цифра, ако следващата стъпка е започнала)
    if (i < step) {
      const nextStarted = i + 1 < steps.length;
      rows.push(
        <div key={`r${i}`} className="flex">
          {nextStarted ? rowCells(String(steps[i + 1].P), steps[i + 1].end, { hi: i + 1 === step && !complete }) : rowCells(String(s.rem), s.end, { tone: 'text-emerald-700 dark:text-emerald-300' })}
        </div>,
      );
    }
  });

  return (
    <div onKeyDown={onKeyDown} tabIndex={-1} className="outline-none">
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <div className="flex justify-center overflow-x-auto">
        <div className="text-2xl sm:text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
          <div className="flex items-center">
            <span className="!w-5 w-5" />
            {D.map((d, c) => {
              const hi = step === 0 && !complete && c <= steps[0].end;
              return (
                <span key={c} className={`${cell} ${hi ? 'bg-amber-100 dark:bg-amber-900/40 rounded-md' : ''}`}>
                  {d}
                </span>
              );
            })}
            <span className="px-1.5 sm:px-2 whitespace-nowrap">
              : <span className="text-sky-600 dark:text-sky-400">{task.k}</span> ={' '}
              <span className="text-emerald-700 dark:text-emerald-300">{shownQ}</span>
              {!complete && (
                <span className={`inline-block min-w-[1.2em] text-center rounded-lg border-2 border-dashed ${phase === 'q' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-transparent'} ${bad && phase === 'q' ? 'motion-safe:animate-shake border-rose-500' : ''}`}>
                  {phase === 'q' ? '?' : ''}
                </span>
              )}
              {complete && R > 0 && <span className="text-base sm:text-lg text-rose-600 dark:text-rose-400"> ост. {R}</span>}
            </span>
          </div>
          {rows}
          {!complete && phase === 'r' && (
            <div className="flex">
              {rowCells('?', cur.end, { tone: `border-2 border-dashed rounded-lg border-amber-500 bg-amber-50 dark:bg-amber-900/30 ${bad ? 'motion-safe:animate-shake border-rose-500' : ''}` })}
            </div>
          )}
        </div>
      </div>
      {!complete && (
        <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-3">
          {phase === 'q' ? (
            <>
              Колко пъти <b className="text-sky-600 dark:text-sky-400">{task.k}</b> се съдържа в <b className="text-amber-600 dark:text-amber-400">{cur.P}</b>?
            </>
          ) : (
            <>
              {cur.q} · {task.k} = {cur.prod}. Колко остава: {cur.P} − {cur.prod} = ?
            </>
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

import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, Problem, RoundBar, RoundDone } from './kit';
import { randInt, praise, tryAgain } from './kidsMath';

// „Зайчето скача“: числова права, зайчето тръгва от a и прави скокове по 10 и по 1, докато измине b.
// При събиране скача надясно, при изваждане – наляво. После детето казва къде е кацнало.

type Op = '+' | '-';
type Level = 'to20' | 'to100';
const LEVELS = [
  { id: 'to20', label: 'до 20' },
  { id: 'to100', label: 'до 100' },
] as const;
const ROUND = 6;

type Task = { a: number; b: number };
const FIRST: Record<Op, Record<Level, Task>> = {
  '+': { to20: { a: 7, b: 6 }, to100: { a: 37, b: 25 } },
  '-': { to20: { a: 15, b: 7 }, to100: { a: 62, b: 27 } },
};

function newTask(op: Op, level: Level, prev: Task): Task {
  for (;;) {
    let a: number;
    let b: number;
    if (level === 'to20') {
      if (op === '+') {
        a = randInt(2, 15);
        b = randInt(2, Math.min(9, 20 - a));
      } else {
        a = randInt(8, 20);
        b = randInt(2, Math.min(9, a - 1));
      }
    } else if (op === '+') {
      a = randInt(12, 75);
      b = randInt(11, Math.min(48, 100 - a));
    } else {
      a = randInt(35, 99);
      b = randInt(11, Math.min(48, a - 5));
    }
    if (a !== prev.a || b !== prev.b) return { a, b };
  }
}

const W = 440;
const PAD = 18;

/** Числовата права с отсечка [lo, hi], зайчето и дъгите на направените скокове. */
function Line({ lo, hi, start, jumps, sign }: { lo: number; hi: number; start: number; jumps: number[]; sign: 1 | -1 }) {
  const n = hi - lo;
  const x = (v: number) => PAD + ((v - lo) / n) * (W - 2 * PAD);
  const step = n <= 20 ? 1 : 5;
  let pos = start;
  const arcs = jumps.map((j, i) => {
    const from = pos;
    pos += sign * j;
    const x0 = x(from);
    const x1 = x(pos);
    const h = j >= 10 ? 56 : 22;
    return (
      <g key={i}>
        <path
          d={`M ${x0} 100 Q ${(x0 + x1) / 2} ${100 - 2 * h} ${x1} 100`}
          fill="none"
          strokeWidth="3"
          className={j >= 10 ? 'stroke-violet-500' : 'stroke-emerald-500'}
        />
        {j >= 10 && (
          <text x={(x0 + x1) / 2} y={100 - h - 6} textAnchor="middle" fontSize="16" fontWeight="700" className="fill-violet-600 dark:fill-violet-300">
            {sign > 0 ? '+' : '−'}10
          </text>
        )}
      </g>
    );
  });
  const ticks = [];
  for (let v = lo; v <= hi; v++) {
    const big = v % 10 === 0;
    ticks.push(
      <g key={v}>
        <line x1={x(v)} x2={x(v)} y1={100 - (big ? 10 : v % 5 === 0 ? 7 : 4)} y2={100 + (big ? 10 : v % 5 === 0 ? 7 : 4)} stroke="currentColor" strokeWidth={big ? 2 : 1} />
        {v % step === 0 && (
          <text x={x(v)} y={124} textAnchor="middle" fontSize={n <= 20 ? 14 : big ? 16 : 13} fontWeight={big ? 700 : 400} fill="currentColor">
            {v}
          </text>
        )}
      </g>,
    );
  }
  return (
    <svg viewBox={`0 0 ${W} 135`} className="w-full max-w-2xl mx-auto block h-auto select-none text-gray-700 dark:text-gray-200" role="img" aria-label="числова права">
      <line x1={PAD - 10} x2={W - PAD + 10} y1={100} y2={100} stroke="currentColor" strokeWidth="2" />
      {ticks}
      {arcs}
      <circle cx={x(start)} cy={100} r="5" className="fill-rose-500" />
      <text x={x(pos)} y={92} textAnchor="middle" fontSize="30">
        🐰
      </text>
    </svg>
  );
}

export default function BunnyGame({ op = '+' }: { op?: Op }) {
  const [level, setLevel] = useState<Level>('to20');
  const [task, setTask] = useState<Task>(FIRST[op].to20);
  const [jumps, setJumps] = useState<number[]>([]);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const sign = op === '+' ? 1 : -1;
  const answer = task.a + sign * task.b;
  const jumped = jumps.reduce((s, j) => s + j, 0);
  const left = task.b - jumped;
  const lo = level === 'to20' ? 0 : Math.floor(Math.min(task.a, answer) / 10) * 10;
  const hi = level === 'to20' ? 20 : Math.max(lo + 20, Math.ceil(Math.max(task.a, answer) / 10) * 10);

  const reset = (t: Task) => {
    setTask(t);
    setJumps([]);
    setValue('');
    setState(undefined);
  };
  const changeLevel = (l: Level) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    reset(newTask(op, l, FIRST[op][l]));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    reset(newTask(op, level, task));
  };
  const submit = () => {
    if (value === '' || state === 'good') return;
    if (Number(value) === answer) {
      setState('good');
      setMsg(praise());
      if (left > 0) setJumps([...jumps, ...Array(Math.floor(left / 10)).fill(10), ...Array(left % 10).fill(1)]);
    } else {
      setState('bad');
      setMistakes(m => m + 1);
      setMsg(tryAgain());
    }
  };
  const next = () => {
    setDone(d => d + 1);
    reset(newTask(op, level, task));
  };

  if (done >= ROUND)
    return (
      <>
        <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
        <RoundDone mistakes={mistakes} onAgain={again} />
      </>
    );

  const tens = jumps.filter(j => j === 10).length;
  const ones = jumps.filter(j => j === 1).length;
  const arrow = op === '+' ? '→' : '←';

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <KeyCatcher value={value} onChange={v => (setValue(v), setState(undefined))} onSubmit={submit} maxLength={3} enabled={state !== 'good'}>
        <Problem>
          {task.a} {op === '+' ? '+' : '−'} {task.b} = <AnswerBox value={value} state={state} />
        </Problem>
        <Line lo={lo} hi={hi} start={task.a} jumps={jumps} sign={sign} />
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <BigButton small tone="violet" onClick={() => setJumps([...jumps, 10])} disabled={left < 10 || state === 'good'}>
            {arrow} скок 10
          </BigButton>
          <BigButton small tone="emerald" onClick={() => setJumps([...jumps, 1])} disabled={left < 1 || state === 'good'}>
            {arrow} скок 1
          </BigButton>
          <BigButton small tone="gray" onClick={() => setJumps(jumps.slice(0, -1))} disabled={jumps.length === 0 || state === 'good'}>
            <Undo2 size={18} className="inline -mt-0.5" /> назад
          </BigButton>
        </div>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
          {left > 0 ? (
            <>
              Зайчето трябва да {op === '+' ? 'отскочи напред' : 'се върне назад'} с <b>{task.b}</b>. Остават още <b>{left}</b>.
            </>
          ) : (
            <>
              Скокове: {tens > 0 && <b className="text-violet-600 dark:text-violet-300">{tens} по 10</b>}
              {tens > 0 && ones > 0 && ' и '}
              {ones > 0 && <b className="text-emerald-600 dark:text-emerald-300">{ones} по 1</b>}. Къде кацна зайчето?
            </>
          )}
        </p>
        {state === 'good' && (
          <Bubble tone="good">
            {msg} {task.a} {op === '+' ? '+' : '−'} {task.b} = {answer}
          </Bubble>
        )}
        {state === 'bad' && <Bubble tone="bad">{msg} {left > 0 ? 'Нека зайчето първо направи скоковете.' : 'Преброй чертичките от най-близкото число с надпис.'}</Bubble>}
        {state === 'good' ? (
          <div className="text-center mt-4">
            <BigButton onClick={next} tone="emerald">
              Следваща →
            </BigButton>
          </div>
        ) : (
          <NumPad value={value} onChange={v => (setValue(v), setState(undefined))} onSubmit={submit} maxLength={3} />
        )}
      </KeyCatcher>
    </>
  );
}

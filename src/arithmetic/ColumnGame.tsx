import { useState, type KeyboardEvent } from 'react';
import { BigButton, Bubble, LevelPicker, RoundBar, RoundDone } from './kit';
import { randInt, praise } from './kidsMath';

// „Писмено събиране/изваждане“: детето попълва цифрите на резултата отдясно наляво.
// При събиране пренесената единица се появява над следващата колона.
// При изваждане със заемане цифрата на съседа се зачерква и над нея се пише новата (напр. 5 → 4, а 3 → 13).

type Op = '+' | '-';
type Level = 'to100' | 'to1000' | 'to10000';
const LEVELS = [
  { id: 'to100', label: 'до 100' },
  { id: 'to1000', label: 'до 1000' },
  { id: 'to10000', label: 'до 10 000' },
] as const;
const ROUND = 4;

type Task = { a: number; b: number };
const FIRST: Record<Op, Task> = { '+': { a: 47, b: 38 }, '-': { a: 52, b: 27 } };

const digits = (n: number, len: number) => String(n).padStart(len, ' ').split('');

/** Колко пъти има пренасяне при a + b. */
function carries(a: number, b: number) {
  let c = 0;
  let k = 0;
  while (a > 0 || b > 0) {
    c = (a % 10) + (b % 10) + c >= 10 ? 1 : 0;
    k += c;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return k;
}

/** Колко пъти има заемане при a − b (a ≥ b). */
function borrows(a: number, b: number) {
  let c = 0;
  let k = 0;
  while (a > 0 || b > 0) {
    c = (a % 10) - c < b % 10 ? 1 : 0;
    k += c;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return k;
}

function newTask(op: Op, level: Level, prev: Task): Task {
  for (;;) {
    let a: number;
    let b: number;
    if (op === '+') {
      if (level === 'to100') {
        a = randInt(11, 79);
        b = randInt(11, 99 - a);
      } else if (level === 'to1000') {
        a = randInt(105, 799);
        b = randInt(102, 999 - a);
      } else {
        a = randInt(1050, 7999);
        b = randInt(randInt(0, 1) ? 105 : 1020, 9999 - a);
      }
    } else if (level === 'to100') {
      a = randInt(30, 99);
      b = randInt(11, a - 10);
    } else if (level === 'to1000') {
      // понякога с нули в умаляемото: 400 − 128, 503 − 267
      a = randInt(0, 2) ? randInt(300, 999) : 100 * randInt(3, 9) + (randInt(0, 1) ? 0 : randInt(1, 9));
      b = randInt(102, a - 50);
    } else {
      a = randInt(0, 2) ? randInt(3000, 9999) : 1000 * randInt(3, 9) + randInt(0, 1) * randInt(1, 99);
      b = randInt(1020, a - 200);
    }
    const need = level === 'to100' ? 1 : 2;
    const k = op === '+' ? carries(a, b) : borrows(a, b);
    if (k >= need && (a !== prev.a || b !== prev.b)) return { a, b };
  }
}

/** Всичко за една задача: цифрите, пренасянията/заеманията и какво става във всяка колона. */
function model(op: Op, { a, b }: Task) {
  const result = op === '+' ? a + b : a - b;
  const len = String(op === '+' ? result : a).length;
  const A = digits(a, len);
  const B = digits(b, len);
  const R = digits(result, len);
  const need = String(result).length;
  const carryInto: number[] = Array(len).fill(0); // събиране: пренесено в колоната
  const lent: number[] = Array(len).fill(0); // изваждане: колоната е дала 1 на дясната
  const borrowed: number[] = Array(len).fill(0); // изваждане: колоната е взела 1 от лявата
  let c = 0;
  for (let i = len - 1; i >= 0; i--) {
    const x = Number(A[i]) || 0;
    const y = Number(B[i]) || 0;
    if (op === '+') {
      carryInto[i] = c;
      c = x + y + c >= 10 ? 1 : 0;
    } else {
      lent[i] = c;
      c = x - c < y ? 1 : 0;
      borrowed[i] = c;
    }
  }
  /** Горната цифра на колоната след заемането. */
  const top = (i: number) => (Number(A[i]) || 0) - lent[i] + 10 * borrowed[i];
  return { result, len, A, B, R, need, carryInto, lent, borrowed, top };
}

export default function ColumnGame({ op = '+' }: { op?: Op }) {
  const [level, setLevel] = useState<Level>('to100');
  const [task, setTask] = useState<Task>(FIRST[op]);
  // Колко цифри от резултата (отдясно) вече са написани.
  const [filled, setFilled] = useState(0);
  const [bad, setBad] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const m = model(op, task);
  const { len, A, B, R } = m;
  const complete = filled >= m.need;
  const col = len - 1 - filled; // активната колона
  const sign = op === '+' ? '+' : '−';

  const reset = (t: Task) => {
    setTask(t);
    setFilled(0);
    setBad(null);
    setMsg('');
  };
  const changeLevel = (l: Level) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    reset(newTask(op, l, task));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    reset(newTask(op, level, task));
  };

  const x = Number(A[col]) || 0;
  const y = Number(B[col]) || 0;
  const press = (d: number) => {
    if (complete) return;
    if (d === Number(R[col])) {
      setBad(null);
      const nf = filled + 1;
      setFilled(nf);
      if (nf >= m.need) {
        const zeros = op === '-' && m.need < len ? ' Нулата отпред не я пишем.' : '';
        setMsg(`${praise()} ${task.a} ${sign} ${task.b} = ${m.result}.${zeros}`);
      } else if (op === '+') {
        const c = m.carryInto[col];
        const s = x + y + c;
        setMsg(s >= 10 ? `${[x, y, c].filter(Boolean).join(' + ')} = ${s}: пишем ${s % 10}, а 1 пренасяме в следващата колона.` : '');
      } else setMsg('');
    } else {
      setBad(col);
      setMistakes(n => n + 1);
      if (op === '+') {
        const c = m.carryInto[col];
        const parts = [A[col], B[col]].filter(v => v.trim() !== '').map(Number);
        setMsg(`Не е ${d}. Събери колоната: ${[...parts, ...(c ? [c] : [])].join(' + ')}${c ? ' (с пренесената 1)' : ''}.`);
      } else {
        setMsg(`Не е ${d}. Извади в колоната: ${m.top(col)} − ${y}${m.lent[col] ? ' (горната цифра вече е намаляла с 1)' : ''}.`);
      }
    }
  };
  const next = () => {
    setDone(n => n + 1);
    reset(newTask(op, level, task));
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
  const place = ['единици', 'десетици', 'стотици', 'хиляди', 'десетохиляди'];
  // Изваждане: заемането се вижда, щом стигнем до колоната, която заема (или до самата колона).
  // При нула (400 − 128) заемането минава през нея наведнъж: 0 → 10 → 9, а стотиците стават 3.
  const lentS: boolean[] = Array(len).fill(false);
  const borS: boolean[] = Array(len).fill(false);
  for (let i = len - 1; i >= 0; i--) {
    lentS[i] = m.lent[i] > 0 && (filled >= len - 2 - i || (i + 1 < len && borS[i + 1]));
    borS[i] = m.borrowed[i] > 0 && (filled >= len - 1 - i || (lentS[i] && (Number(A[i]) || 0) === 0));
  }
  const lentShown = (i: number) => lentS[i];
  const borrowShown = (i: number) => borS[i];
  const changed = (i: number) => op === '-' && (lentShown(i) || borrowShown(i));
  const shownTop = (i: number) => (Number(A[i]) || 0) - (lentShown(i) ? 1 : 0) + (borrowShown(i) ? 10 : 0);

  // Подсказка за активната колона при заемане.
  let hint = '';
  if (op === '-' && !complete && m.borrowed[col]) {
    const before = x - m.lent[col];
    if (before < 0) hint = `Тук имаше 0. Тя взе 1 от съседа вляво (стана 10) и даде 1 надясно – остана ${m.top(col)}.`;
    else {
      const zeroNext = col > 0 && A[col - 1] === '0';
      hint = `${before} − ${y} не става – взимаме 1 от съседа вляво: ${before} става ${m.top(col)}.${zeroNext ? ' Съседът е 0, затова и той взима от своя съсед.' : ''}`;
    }
  }

  return (
    <div onKeyDown={onKeyDown} tabIndex={-1} className="outline-none">
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <div className="flex justify-center">
        <div className="inline-grid gap-x-1 text-3xl sm:text-4xl font-bold tabular-nums text-gray-900 dark:text-white" style={{ gridTemplateColumns: `repeat(${len + 1}, auto)` }}>
          {/* пренасяне / заемане */}
          <span />
          {A.map((_, i) => (
            <span key={`c${i}`} className={`${cell} !h-6 text-lg text-rose-600 dark:text-rose-400`}>
              {op === '+' ? (
                m.carryInto[i] > 0 && len - 1 - i <= filled ? <span className="motion-safe:animate-pop">1</span> : ''
              ) : changed(i) ? (
                <span key={shownTop(i)} className="motion-safe:animate-pop">
                  {shownTop(i)}
                </span>
              ) : (
                ''
              )}
            </span>
          ))}
          <span />
          {A.map((d, i) => (
            <span key={`a${i}`} className={`${cell} ${i === col && !complete ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
              {changed(i) ? <span className="line-through decoration-rose-500 decoration-2 text-gray-400">{d.trim()}</span> : d.trim()}
            </span>
          ))}
          <span className={`${cell} text-gray-500`}>{sign}</span>
          {B.map((d, i) => (
            <span key={`b${i}`} className={`${cell} ${i === col && !complete ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
              {d.trim()}
            </span>
          ))}
          <span className="col-span-full h-1 rounded bg-gray-800 dark:bg-gray-200 my-1" />
          <span />
          {R.map((d, i) => {
            const shown = len - 1 - i < filled;
            const active = i === col && !complete;
            const unused = complete && !shown;
            return (
              <span
                key={`s${i}`}
                className={`${cell} rounded-xl border-2 ${
                  shown
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : active
                      ? `border-amber-500 border-dashed bg-amber-50 dark:bg-amber-900/20 ${bad === i ? 'motion-safe:animate-shake border-rose-500' : ''}`
                      : unused
                        ? 'border-transparent'
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
          Сега пишем {place[len - 1 - col]}. Коя цифра?
        </p>
      )}
      {msg ? <Bubble tone={complete ? 'good' : bad !== null ? 'bad' : 'info'}>{msg}</Bubble> : hint && <Bubble tone="info">{hint}</Bubble>}
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

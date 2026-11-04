import { useState } from 'react';
import { AnswerBox, BigButton, Bubble, KeyCatcher, LevelPicker, NumPad, RoundBar, RoundDone } from './kit';
import { praise, randInt, shuffled } from './kidsMath';

// „Числова пирамида“: всяко камъче е сбор на двете под него. Някои камъчета са празни –
// понякога се събира, а понякога се изважда (горното минус съседа).

type Level = 'small' | 'mid' | 'big';
const LEVELS = [
  { id: 'small', label: 'до 20' },
  { id: 'mid', label: 'до 100' },
  { id: 'big', label: 'до 1000' },
] as const;
const ROUND = 3;

/** rows[0] е долният ред. */
type Pyr = { rows: number[][]; hidden: boolean[][] };

function build(bottom: number[]) {
  const rows = [bottom];
  while (rows[rows.length - 1].length > 1) {
    const r = rows[rows.length - 1];
    rows.push(r.slice(1).map((v, i) => r[i] + v));
  }
  return rows;
}

/** Решима ли е пирамидата само с „сбор“ и „разлика“ стъпка по стъпка. */
function solvable(rows: number[][], hidden: boolean[][]) {
  const known = hidden.map(r => r.map(h => !h));
  for (let changed = true; changed; ) {
    changed = false;
    for (let r = 1; r < rows.length; r++)
      for (let i = 0; i < rows[r].length; i++) {
        const k = [known[r][i], known[r - 1][i], known[r - 1][i + 1]];
        if (k.filter(Boolean).length === 2) {
          known[r][i] = known[r - 1][i] = known[r - 1][i + 1] = true;
          changed = true;
        }
      }
  }
  return known.every(r => r.every(Boolean));
}

function newPyr(level: Level): Pyr {
  for (;;) {
    const n = level === 'small' ? 3 : 4;
    const bottom = Array.from({ length: n }, () => (level === 'small' ? randInt(1, 6) : level === 'mid' ? randInt(2, 15) : 10 * randInt(2, 15) + randInt(0, 9)));
    const rows = build(bottom);
    const top = rows[rows.length - 1][0];
    if (top > (level === 'small' ? 20 : level === 'mid' ? 100 : 1000)) continue;
    const cells = rows.flatMap((r, ri) => r.map((_, i) => [ri, i] as const));
    const blanks = n === 3 ? 3 : randInt(5, 6);
    const pickd = shuffled(cells).slice(0, blanks);
    const hidden = rows.map((r, ri) => r.map((_, i) => pickd.some(([a, b]) => a === ri && b === i)));
    if (!hidden[0].some(Boolean)) continue; // поне едно изваждане
    if (solvable(rows, hidden)) return { rows, hidden };
  }
}

const FIRST: Pyr = {
  rows: build([3, 5, 2]),
  hidden: [
    [false, false, true],
    [true, false],
    [false],
  ],
};

export default function PyramidGame() {
  const [level, setLevel] = useState<Level>('small');
  const [pyr, setPyr] = useState<Pyr>(FIRST);
  const [open, setOpen] = useState<boolean[][]>(FIRST.hidden);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [value, setValue] = useState('');
  const [state, setState] = useState<'good' | 'bad' | undefined>();
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'info'; text: string } | null>(null);
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const solved = open.every(r => r.every(h => !h));

  const load = (p: Pyr) => {
    setPyr(p);
    setOpen(p.hidden.map(r => [...r]));
    setSel(null);
    setValue('');
    setState(undefined);
    setMsg(null);
  };
  const changeLevel = (l: Level) => {
    setLevel(l);
    setDone(0);
    setMistakes(0);
    load(newPyr(l));
  };
  const again = () => {
    setDone(0);
    setMistakes(0);
    load(newPyr(level));
  };

  const submit = () => {
    if (!sel || value === '') return;
    const [r, i] = sel;
    const right = pyr.rows[r][i];
    if (Number(value) === right) {
      const no = open.map((row, ri) => row.map((h, j) => (ri === r && j === i ? false : h)));
      setOpen(no);
      setSel(null);
      setValue('');
      setState(undefined);
      setMsg(no.every(row => row.every(h => !h)) ? { tone: 'good', text: `${praise()} Пирамидата е готова!` } : null);
    } else {
      setState('bad');
      setMistakes(n => n + 1);
      // подсказка от съседите
      const v = (ri: number, j: number) => (open[ri][j] ? null : pyr.rows[ri][j]);
      let hint = 'Всяко камъче е сбор на двете под него.';
      if (r > 0 && v(r - 1, i) !== null && v(r - 1, i + 1) !== null) hint = `Събери двете камъчета под него: ${v(r - 1, i)} + ${v(r - 1, i + 1)}.`;
      else {
        for (const [pr, pi, sib] of [
          [r + 1, i - 1, i - 1],
          [r + 1, i, i + 1],
        ] as const) {
          if (pr < pyr.rows.length && pi >= 0 && pi < pyr.rows[pr].length && v(pr, pi) !== null && sib >= 0 && sib < pyr.rows[r].length && v(r, sib) !== null) {
            hint = `Над него е ${v(pr, pi)}, а до него – ${v(r, sib)}. Колко трябва да добавиш към ${v(r, sib)}, за да стане ${v(pr, pi)}?`;
            break;
          }
        }
      }
      setMsg({ tone: 'bad', text: hint });
    }
  };
  const next = () => {
    setDone(d => d + 1);
    load(newPyr(level));
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

  const top = [...pyr.rows].reverse();
  const brick = 'h-11 sm:h-14 w-[4.2rem] sm:w-20 rounded-lg border-b-4 text-xl sm:text-2xl font-bold tabular-nums flex items-center justify-center';

  return (
    <>
      <LevelPicker levels={LEVELS} value={level} onChange={changeLevel} />
      <RoundBar done={done} total={ROUND} mistakes={mistakes} />
      <div className="flex flex-col items-center gap-1 my-3">
        {top.map((row, k) => {
          const r = pyr.rows.length - 1 - k;
          return (
            <div key={r} className="flex gap-1">
              {row.map((v, i) => {
                const hid = open[r][i];
                const isSel = sel?.[0] === r && sel?.[1] === i;
                return hid ? (
                  <button
                    key={i}
                    onClick={() => (setSel([r, i]), setValue(''), setState(undefined))}
                    className={`${brick} ${isSel ? 'bg-amber-200 border-amber-500 text-amber-900 ring-2 ring-amber-400' : 'bg-white border-gray-300 text-gray-400 hover:bg-amber-50 dark:bg-gray-700 dark:border-gray-900'} border-2 border-dashed`}
                    aria-label="празно камъче"
                  >
                    {isSel ? value || '?' : '?'}
                  </button>
                ) : (
                  <span
                    key={i}
                    className={`${brick} ${pyr.hidden[r][i] ? 'bg-emerald-200 border-emerald-500 text-emerald-900 motion-safe:animate-pop' : 'bg-orange-200 border-orange-400 text-orange-950 dark:bg-orange-800 dark:border-orange-950 dark:text-orange-50'}`}
                  >
                    {v}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      {!solved && !sel && !msg && <Bubble tone="info">Всяко камъче е сбор на двете под него. Докосни празно камъче.</Bubble>}
      {msg && <Bubble tone={msg.tone}>{msg.text}</Bubble>}
      {sel && (
        <KeyCatcher value={value} onChange={type} onSubmit={submit} maxLength={4}>
          <div className="text-center my-2 text-2xl font-bold">
            <AnswerBox value={value} state={state} />
          </div>
          <NumPad value={value} onChange={type} onSubmit={submit} maxLength={4} />
        </KeyCatcher>
      )}
      {solved && (
        <div className="text-center mt-4">
          <BigButton onClick={next} tone="emerald">
            Следваща пирамида →
          </BigButton>
        </div>
      )}
    </>
  );
}

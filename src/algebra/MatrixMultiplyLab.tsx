import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Mat = number[][];

const PAIRS: { id: string; name: string; A: Mat; B: Mat; note: string }[] = [
  {
    id: 'numbers',
    name: 'числа',
    A: [
      [1, 2],
      [3, 4],
    ],
    B: [
      [2, 0],
      [1, -1],
    ],
    note: 'Дори при обикновени числа AB и BA се различават.',
  },
  {
    id: 'rotref',
    name: 'завъртане и отражение',
    A: [
      [0, -1],
      [1, 0],
    ],
    B: [
      [1, 0],
      [0, -1],
    ],
    note: 'A е завъртане на 90°, B – отражение в Ox. AB: първо отражение, после завъртане (отражение в y = x). BA: първо завъртане, после отражение (отражение в y = −x).',
  },
  {
    id: 'shear',
    name: 'хлъзгане и разтягане',
    A: [
      [1, 1],
      [0, 1],
    ],
    B: [
      [2, 0],
      [0, 1],
    ],
    note: 'Хлъзгане след разтягане не е същото като разтягане след хлъзгане.',
  },
];

const mul = (X: Mat, Y: Mat): Mat => X.map(row => Y[0].map((_, j) => row.reduce((s, x, k) => s + x * Y[k][j], 0)));
const sub = ['₁', '₂'];
const factor = (v: number) => (v < 0 ? `(${num(v)})` : num(v));

function Grid({ m, name, row, col, done, tone }: { m: (number | null)[][]; name: string; row?: number; col?: number; done?: boolean[][]; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold ${tone}`}>{name} =</span>
      <div className="relative grid grid-cols-2 gap-1 px-2 py-1 border-x-2 border-gray-400 dark:border-gray-500 rounded-md">
        {m.map((r, i) =>
          r.map((v, j) => {
            const lit = i === row || j === col;
            return (
              <span
                key={`${i}${j}`}
                className={`w-10 h-9 flex items-center justify-center rounded font-mono text-base transition-colors ${
                  lit ? 'bg-amber-100 dark:bg-amber-500/25 text-amber-900 dark:text-amber-100 font-semibold' : done?.[i][j] ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {v === null ? '?' : num(v)}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

/** Умножение на матрици стъпка по стъпка: всеки елемент е „ред по стълб“. */
export default function MatrixMultiplyLab() {
  const [pairId, setPairId] = useState('numbers');
  const [swap, setSwap] = useState(false);
  const [step, setStep] = useState(0); // колко елемента вече са пресметнати (0–4)
  const pair = PAIRS.find(p => p.id === pairId)!;
  const [X, Y] = swap ? [pair.B, pair.A] : [pair.A, pair.B];
  const [nx, ny] = swap ? ['B', 'A'] : ['A', 'B'];
  const C = mul(X, Y);
  const other = mul(Y, X);

  const cur = Math.min(step, 3);
  const [i, j] = [Math.floor(cur / 2), cur % 2];
  const shown = C.map((r, a) => r.map((v, b) => (a * 2 + b < step ? v : null)));
  const done = C.map((r, a) => r.map((_, b) => a * 2 + b < step));
  const finished = step >= 4;

  const reset = (id: string, s: boolean) => {
    setPairId(id);
    setSwap(s);
    setStep(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PAIRS.map(p => (
          <DiagramButton key={p.id} active={p.id === pairId} onClick={() => reset(p.id, swap)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mt-4">
        <Grid m={X} name={nx} row={finished ? undefined : i} tone="text-blue-700 dark:text-blue-300" />
        <Grid m={Y} name={ny} col={finished ? undefined : j} tone="text-rose-600 dark:text-rose-400" />
        <Grid m={shown} name={`${nx}${ny}`} row={undefined} col={undefined} done={done} tone="text-violet-700 dark:text-violet-400" />
      </div>

      <p className="mt-4 text-center font-mono text-sm sm:text-base text-gray-800 dark:text-gray-100 min-h-[1.5rem]">
        {finished
          ? `${nx}${ny} е готово.`
          : `c${sub[i]}${sub[j]} = ред ${i + 1} · стълб ${j + 1} = ${factor(X[i][0])}·${factor(Y[0][j])} + ${factor(X[i][1])}·${factor(Y[1][j])} = ${num(C[i][j])}`}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => setStep(finished ? 0 : step + 1)}
          className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
        >
          {finished ? 'Отначало' : step === 0 ? 'Пресметни първия елемент' : 'Следващ елемент'}
        </button>
        <button
          onClick={() => reset(pairId, !swap)}
          className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-sm text-gray-700 dark:text-gray-200"
        >
          Размени: {swap ? 'AB' : 'BA'}
        </button>
      </div>

      {finished && (
        <Note tone="violet">
          {nx}
          {ny} = ({num(C[0][0])} {num(C[0][1])}; {num(C[1][0])} {num(C[1][1])}), а {ny}
          {nx} = ({num(other[0][0])} {num(other[0][1])}; {num(other[1][0])} {num(other[1][1])}). {pair.note}
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Елементът в ред i и стълб j на произведението е „ред i на първата матрица по стълб j на втората“: умножаваме съответните числа и ги
        събираме. Натисни „Размени“, за да сравниш AB и BA.
      </p>
    </div>
  );
}

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { num, point } from '~/functions/functionMath';
import { Plot, PlotDot, PlotLabel } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { tones, type Tone } from '~/geometry/diagramMath';
import { EqLine } from './EqLine';
import { dets, fmtEq, type Eq } from './systemMath';

const SYSTEMS: [Eq, Eq][] = [
  [
    { a: 3, b: 2, c: 12 },
    { a: 5, b: -3, c: 1 },
  ],
  [
    { a: 4, b: 3, c: 10 },
    { a: 2, b: -5, c: -8 },
  ],
  [
    { a: 1, b: 2, c: 7 },
    { a: 3, b: -1, c: 7 },
  ],
];

const K_MAX = 6;

function Multiplier({ k, setK, eq, tone }: { k: number; setK: (k: number) => void; eq: Eq; tone: Tone }) {
  const step = (d: number) => setK(Math.min(K_MAX, Math.max(-K_MAX, k + d)));
  const btn = 'p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60';
  return (
    <div className="flex items-center justify-center gap-2 font-mono text-sm sm:text-base">
      <button onClick={() => step(-1)} className={btn} aria-label="Намали множителя">
        <Minus size={14} />
      </button>
      <span className="w-8 text-center font-bold">{num(k)}</span>
      <button onClick={() => step(1)} className={btn} aria-label="Увеличи множителя">
        <Plus size={14} />
      </button>
      <span className={tones[tone].text}>· ( {fmtEq(eq)} )</span>
    </div>
  );
}

/** Метод на събирането: множители, при които едното неизвестно изчезва. */
export default function EliminationLab() {
  const [si, setSi] = useState(0);
  const [k1, setK1] = useState(1);
  const [k2, setK2] = useState(1);
  const [e1, e2] = SYSTEMS[si];

  const sum: Eq = { a: k1 * e1.a + k2 * e2.a, b: k1 * e1.b + k2 * e2.b, c: k1 * e1.c + k2 * e2.c };
  const { D, Dx, Dy } = dets(e1, e2);
  const sol = { x: Dx / D, y: Dy / D };
  const trivial = sum.a === 0 && sum.b === 0;
  const lostX = !trivial && sum.a === 0;
  const lostY = !trivial && sum.b === 0;

  const choose = (i: number) => {
    setSi(i);
    setK1(1);
    setK2(1);
  };

  return (
    <Plot
      x={[-6, 8]}
      y={[-4, 6]}
      hint="Всяка комбинация k₁ · (първото) + k₂ · (второто) е права през същата точка. Когато y изчезне, правата става вертикална и направо показва x; когато изчезне x – хоризонтална."
      readout={
        <>
          <Buttons>
            {SYSTEMS.map(([p, q], i) => (
              <DiagramButton key={i} active={i === si} onClick={() => choose(i)}>
                <span className="font-mono">
                  {fmtEq(p)}; {fmtEq(q)}
                </span>
              </DiagramButton>
            ))}
          </Buttons>
          <div className="mt-3 space-y-1.5">
            <Multiplier k={k1} setK={setK1} eq={e1} tone="blue" />
            <Multiplier k={k2} setK={setK2} eq={e2} tone="rose" />
          </div>
          <div className="max-w-sm mx-auto border-t border-gray-300 dark:border-gray-600 mt-2" />
          <Formula>
            <span className={tones.amber.text}>{trivial ? '0 = ' + num(sum.c) : fmtEq(sum)}</span>
          </Formula>
          {lostY && (
            <Note tone="emerald">
              y изчезна! {num(sum.a)}x = {num(sum.c)} ⇒ x = {num(sol.x)}. Заместваме в първото уравнение ⇒ y = {num(sol.y)}.
            </Note>
          )}
          {lostX && (
            <Note tone="emerald">
              x изчезна! {num(sum.b)}y = {num(sum.c)} ⇒ y = {num(sol.y)}. Заместваме в първото уравнение ⇒ x = {num(sol.x)}.
            </Note>
          )}
          {trivial && <Note tone="gray">Двата множителя са 0 – не остана нищо. Избери поне един различен от 0.</Note>}
          {!lostX && !lostY && !trivial && (
            <Note tone="gray">Подбери множителите така, че коефициентите пред y (или пред x) да станат противоположни числа.</Note>
          )}
        </>
      }
    >
      <EqLine eq={e1} tone="blue" />
      <EqLine eq={e2} tone="rose" />
      {!trivial && <EqLine eq={sum} tone="amber" dashed width={2.5} />}
      <PlotDot p={sol} tone="emerald" r={6} />
      <PlotLabel p={sol} dx={10} dy={-14} anchor="start" tone="ink" size={13}>
        {point(sol)}
      </PlotLabel>
    </Plot>
  );
}

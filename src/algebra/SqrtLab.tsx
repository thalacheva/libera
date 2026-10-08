import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note } from '~/geometry/diagram';

const S = 300; // страна на чертежа в px
const MAX = 13; // единици по страната

/** Най-голямото k, за което k² дели A: √A = k√m. */
function simplify(A: number) {
  let k = 1;
  for (let i = 2; i * i <= A; i++) if (A % (i * i) === 0) k = i;
  return { k, m: A / (k * k) };
}

/** Квадратният корен като страна на квадрат с дадено лице. */
export default function SqrtLab() {
  const [A, setA] = useState(50);
  const side = Math.sqrt(A);
  const n = Math.floor(side);
  const exact = n * n === A;
  const { k, m } = simplify(A);
  const u = S / MAX;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">⬛ Коренът като страна на квадрат</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        √A е страната на квадрат с лице A. Между кои два „точни“ квадрата е той – и колко точно е страната му?
      </p>

      <svg viewBox={`-20 -10 ${S + 40} ${S + 30}`} className="w-full max-w-sm mx-auto h-auto block text-gray-700 dark:text-gray-300">
        {Array.from({ length: MAX + 1 }, (_, i) => (
          <g key={i}>
            <line x1={i * u} x2={i * u} y1={0} y2={S} stroke="currentColor" strokeOpacity="0.08" />
            <line x1={0} x2={S} y1={S - i * u} y2={S - i * u} stroke="currentColor" strokeOpacity="0.08" />
          </g>
        ))}
        {/* Съседните точни квадрати */}
        {!exact && <rect x={0} y={S - (n + 1) * u} width={(n + 1) * u} height={(n + 1) * u} className="fill-none stroke-rose-400" strokeWidth="1.5" strokeDasharray="5 4" />}
        <rect x={0} y={S - side * u} width={side * u} height={side * u} className="fill-violet-500/25 stroke-violet-600" strokeWidth="2.5" />
        {n > 0 && <rect x={0} y={S - n * u} width={n * u} height={n * u} className="fill-none stroke-emerald-500" strokeWidth="1.5" strokeDasharray={exact ? undefined : '5 4'} />}
        <text x={(side * u) / 2} y={S + 16} fontSize="13" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300" fontWeight="700">
          √{A} ≈ {num(side, 3)}
        </text>
        <text x={(side * u) / 2} y={S - (side * u) / 2} fontSize="16" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontWeight="700">
          S = {A}
        </text>
      </svg>

      <Sliders>
        <Slider label="A" value={A} onChange={setA} min={1} max={160} step={1} tone="violet" />
      </Sliders>

      {exact ? (
        <Note tone="emerald">
          {A} = {n}² е точен квадрат ⇒ √{A} = {n}
        </Note>
      ) : (
        <>
          <Formula>
            {n}² = {n * n} &lt; {A} &lt; {(n + 1) ** 2} = {n + 1}² ⇒ {n} &lt; √{A} &lt; {n + 1}
          </Formula>
          <Note tone="gray">Зеленият и червеният квадрат са съседните точни квадрати; лилавият е между тях.</Note>
        </>
      )}
      {k > 1 && m > 1 && (
        <Note tone="violet">
          Изнасяне пред корена: √{A} = √({k * k} · {m}) = √{k * k} · √{m} = {k}√{m}
        </Note>
      )}
    </div>
  );
}

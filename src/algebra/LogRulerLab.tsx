import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

const BASES = [2, 3, 10];
const K_MIN = -2;
const K_MAX = 4;
const W = 600;
const PAD = 30;

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴' };
/** lg за основа 10, иначе log₂, log₃. */
const logName = (a: number) => (a === 10 ? 'lg' : `log${'₀₁₂₃₄₅₆₇₈₉'[a]}`);
const sup = (k: number) => String(k).split('').map(c => SUP[c] ?? c).join('');

/** Число с до 4 значещи цифри, с десетична запетая. */
const pretty = (v: number) => num(Number(v.toPrecision(4)), 4);

/** log_a b = мястото на b върху линийка, на която степените на a са на равни разстояния. */
export default function LogRulerLab() {
  const [a, setA] = useState(2);
  const [t, setT] = useState(3); // t = log_a b
  const b = a ** t;
  const k = Math.floor(t + 1e-9);
  const exact = Math.abs(t - Math.round(t)) < 1e-9;
  const X = (u: number) => PAD + ((u - K_MIN) / (K_MAX - K_MIN)) * (W - 2 * PAD);

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-teal-200 dark:border-teal-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📏 Логаритъмът е показател</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        На тази линийка всяко умножение по a е една и съща стъпка надясно. log_a b казва колко стъпки има от 1 до b.
      </p>
      <Buttons>
        {BASES.map(base => (
          <DiagramButton key={base} active={base === a} onClick={() => setA(base)}>
            основа {base}
          </DiagramButton>
        ))}
      </Buttons>

      <svg viewBox={`0 0 ${W} 120`} className="w-full h-auto mt-3 text-gray-700 dark:text-gray-300">
        <line x1={PAD} x2={W - PAD} y1={60} y2={60} stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
        {Array.from({ length: K_MAX - K_MIN + 1 }, (_, i) => K_MIN + i).map(p => (
          <g key={p}>
            <line x1={X(p)} x2={X(p)} y1={50} y2={70} stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
            <text x={X(p)} y={40} fontSize="13" textAnchor="middle" fill="currentColor" fontWeight="700">
              {a}
              {sup(p)}
            </text>
            <text x={X(p)} y={90} fontSize="12" textAnchor="middle" fill="currentColor" opacity="0.7">
              {pretty(a ** p)}
            </text>
            {p < K_MAX && (
              <text x={(X(p) + X(p + 1)) / 2} y={112} fontSize="11" textAnchor="middle" className="fill-teal-600 dark:fill-teal-400">
                · {a}
              </text>
            )}
          </g>
        ))}
        <line x1={X(0)} x2={X(t)} y1={60} y2={60} className="stroke-teal-500" strokeWidth="6" strokeLinecap="round" />
        <circle cx={X(t)} cy={60} r={8} className="fill-rose-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
      </svg>

      <Sliders>
        <Slider label="t" value={t} onChange={setT} min={K_MIN} max={K_MAX} step={0.05} tone="rose" />
      </Sliders>

      <Formula>
        b = {a}^{num(t)} ≈ {pretty(b)} &nbsp; ⇔ &nbsp; {logName(a)} {pretty(b)} = {num(t)}
      </Formula>
      {exact ? (
        <Note tone="emerald">
          b = {a}
          {sup(Math.round(t))} е точна степен на {a} – логаритъмът е цяло число.
        </Note>
      ) : (
        <Note tone="gray">
          {pretty(a ** k)} &lt; {pretty(b)} &lt; {pretty(a ** (k + 1))} ⇒ {k} &lt; {logName(a)} {pretty(b)} &lt; {k + 1}
        </Note>
      )}
      {t < 0 && <Note tone="amber">Числата между 0 и 1 имат отрицателен логаритъм: те са „наляво“ от 1 = {a}⁰.</Note>}
    </div>
  );
}

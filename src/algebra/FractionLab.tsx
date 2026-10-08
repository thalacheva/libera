import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note } from '~/geometry/diagram';
import { FractionBar } from './FractionBar';
import { fracText, gcd, mixed } from './fractionMath';

const BLUE = 'fill-blue-400/70 dark:fill-blue-500/60';
const VIOLET = 'fill-violet-400/70 dark:fill-violet-500/60';

/** Дробта n/d като части от цяло; разширяване и съкращаване. */
export default function FractionLab() {
  const [n, setN] = useState(3);
  const [d, setD] = useState(4);
  const [k, setK] = useState(2);
  const g = gcd(n, d);
  const mix = mixed(n, d);

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🍫 Дробта като части от цяло</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Знаменателят казва на колко равни части делим цялото, числителят – колко от тях взимаме. Разширяването прави частите по-дребни, но
        оцветената площ остава същата.
      </p>

      <FractionBar d={d} runs={[{ parts: n, className: BLUE }]} label={`${n}/${d}`} />
      <FractionBar d={d * k} runs={[{ parts: n * k, className: VIOLET }]} label={`${n}·${k} / ${d}·${k} = ${n * k}/${d * k}`} />

      <Sliders>
        <Slider label="числ." value={n} onChange={setN} min={0} max={2 * d} step={1} tone="blue" />
        <Slider label="знам." value={d} onChange={v => { setD(v); setN(Math.min(n, 2 * v)); }} min={1} max={12} step={1} tone="blue" />
        <Slider label="по k" value={k} onChange={setK} min={1} max={5} step={1} tone="violet" />
      </Sliders>

      <Formula>
        {n}/{d} = {n * k}/{d * k} = {num(n / d, 4)} = {num((100 * n) / d, 2)}%
      </Formula>
      {g > 1 && n > 0 ? (
        <Note tone="emerald">
          НОД({n}, {d}) = {g} ⇒ съкращаваме: {n}/{d} = {fracText(n, d)}
        </Note>
      ) : (
        <Note tone="gray">Дробта е несъкратима – числителят и знаменателят нямат общ делител, по-голям от 1.</Note>
      )}
      {mix && <Note tone="amber">Неправилна дроб (числителят ≥ знаменателя): {n}/{d} = {mix}</Note>}
    </div>
  );
}

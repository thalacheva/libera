import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note } from '~/geometry/diagram';

const W = 600;
const H = 300;

/** Сборът на аритметична прогресия: две „стълбички“ образуват правоъгълник. */
export default function GaussSumLab() {
  const [a1, setA1] = useState(1);
  const [d, setD] = useState(1);
  const [n, setN] = useState(6);
  const [twin, setTwin] = useState(true);

  const terms = Array.from({ length: n }, (_, i) => a1 + i * d);
  const an = terms[n - 1];
  const height = a1 + an;
  const cell = Math.min(36, (W - 40) / n, (H - 30) / height);
  const x0 = (W - n * cell) / 2;
  const yBase = H - 10;
  const S = (n * (a1 + an)) / 2;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🧱 Трикът на Гаус</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Всеки член е стълб от квадратчета. Обърни второ копие на „стълбичката“ отгоре – двете заедно образуват правоъгълник n × (a₁ + aₙ).
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {terms.map((t, i) => {
          const x = x0 + i * cell;
          const flipped = terms[n - 1 - i];
          return (
            <g key={i}>
              {Array.from({ length: t }, (_, k) => (
                <rect key={`b${k}`} x={x} y={yBase - (k + 1) * cell} width={cell} height={cell} className="fill-emerald-400/80 stroke-white dark:stroke-gray-800" strokeWidth="1.5" />
              ))}
              {twin &&
                Array.from({ length: flipped }, (_, k) => (
                  <rect key={`t${k}`} x={x} y={yBase - (t + k + 1) * cell} width={cell} height={cell} className="fill-amber-400/80 stroke-white dark:stroke-gray-800" strokeWidth="1.5" />
                ))}
            </g>
          );
        })}
        {twin && (
          <rect x={x0} y={yBase - height * cell} width={n * cell} height={height * cell} className="fill-none stroke-gray-700 dark:stroke-gray-200" strokeWidth="2" strokeDasharray="6 4" />
        )}
      </svg>

      <label className="flex justify-center items-center gap-2 mt-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" checked={twin} onChange={e => setTwin(e.target.checked)} className="accent-amber-500" />
        покажи обърнатото копие
      </label>
      <Sliders>
        <Slider label="a₁" value={a1} onChange={setA1} min={1} max={4} step={1} tone="emerald" />
        <Slider label="d" value={d} onChange={setD} min={0} max={2} step={1} tone="emerald" />
        <Slider label="n" value={n} onChange={setN} min={2} max={12} step={1} tone="gray" />
      </Sliders>

      <Formula>
        {terms.join(' + ')} = {S}
      </Formula>
      <Formula>
        2S = n · (a₁ + aₙ) = {n} · ({a1} + {an}) = {2 * S} ⇒ S = {S}
      </Formula>
      <Note tone="emerald">Във всяка колона зеленото и жълтото заедно са a₁ + aₙ = {height} квадратчета – колоните са еднакво високи.</Note>
    </div>
  );
}

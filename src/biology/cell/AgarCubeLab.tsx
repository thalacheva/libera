import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note } from '~/geometry/diagram';

const SIDES = [1, 2, 3]; // cm
const PX = 48; // пиксела на сантиметър
const T_MAX = 15; // min
/** Колко навътре е стигнала киселината, cm: дифузията напредва като корен от времето. */
const depth = (t: number) => 0.15 * Math.sqrt(t);
const fmt = (v: number, d = 2) => String(Number(v.toFixed(d))).replace('.', ',');

const th = 'px-2 sm:px-3 py-1.5 text-left font-semibold bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700';
const td = 'px-2 sm:px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 tabular-nums';

/**
 * Агарови кубчета, оцветени розово с фенолфталеин и основа, са потопени в оцет.
 * Киселината прониква навътре и обезцветява агара – виж сечението на кубчетата.
 */
export default function AgarCubeLab() {
  const [t, setT] = useState(4);
  const x = depth(t);

  const cubes = SIDES.map(a => {
    const core = Math.max(0, a - 2 * x);
    return { a, S: 6 * a * a, V: a ** 3, ratio: 6 / a, reached: 1 - core ** 3 / a ** 3, core };
  });
  const xs = [60, 150, 290];
  const base = 200;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 245" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {cubes.map((c, i) => {
          const s = c.a * PX;
          const x0 = xs[i];
          const y0 = base - s;
          const cs = c.core * PX;
          return (
            <g key={c.a}>
              <rect x={x0} y={y0} width={s} height={s} fill="#fefce8" stroke="#a8a29e" strokeWidth="1.5" />
              {cs > 0 && <rect x={x0 + (s - cs) / 2} y={y0 + (s - cs) / 2} width={cs} height={cs} fill="#ec4899" opacity="0.8" />}
              <text x={x0 + s / 2} y={base + 18} fontSize="13" textAnchor="middle" fill="currentColor">
                {c.a} cm
              </text>
              <text x={x0 + s / 2} y={base + 34} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                {Math.round(c.reached * 100)}% достигнати
              </text>
            </g>
          );
        })}
        <text x={470} y={24} fontSize="18" fontWeight="700" textAnchor="end" fill="currentColor">
          {t} min
        </text>
        <text x={470} y={44} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          киселината е навлязла {fmt(x * 10, 1)} mm
        </text>
      </LabSvg>

      <Sliders>
        <Slider label={`Време: ${t} min`} value={t} onChange={setT} min={0} max={T_MAX} step={1} tone="rose" />
      </Sliders>

      <div className="overflow-x-auto mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr>
              <th className={th}>ръб</th>
              <th className={th}>повърхност S</th>
              <th className={th}>обем V</th>
              <th className={th}>S/V</th>
              <th className={th}>достигнат обем</th>
            </tr>
          </thead>
          <tbody>
            {cubes.map(c => (
              <tr key={c.a}>
                <td className={td}>{c.a} cm</td>
                <td className={td}>{c.S} cm²</td>
                <td className={td}>{c.V} cm³</td>
                <td className={td}>{fmt(c.ratio)} cm⁻¹</td>
                <td className={td}>{Math.round(c.reached * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note tone={cubes[0].core === 0 ? 'emerald' : 'violet'}>
        {cubes[0].core === 0
          ? `Малкото кубче е обезцветено цялото, а в голямото киселината е стигнала до ${Math.round(cubes[2].reached * 100)}% от обема. Колкото по-малко е тялото, толкова по-голямо е S/V и толкова по-бързо веществата стигат навсякъде.`
          : 'Киселината навлиза еднакво бързо във всички кубчета – но в малкото тя достига по-голяма част от обема.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Сечението показва средата на кубчето: розовото е частта, до която киселината още не е стигнала. Дълбочината на проникване расте
        като корен от времето – за двойно по-дълбоко трябва четири пъти повече време. Затова клетките са малки.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { worth } from './rlMath';

const BIG = 10;
const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Отстъпка: малка награда на една стъпка наляво срещу голяма награда на n стъпки надясно. */
export default function DiscountLab() {
  const [gamma, setGamma] = useState(0.9);
  const [n, setN] = useState(5);
  const [small, setSmall] = useState(2);

  const left = worth(small, 1, gamma);
  const right = worth(BIG, n, gamma);
  const goRight = right > left;
  const tie = Math.abs(right - left) < 1e-9;
  const border = (small / BIG) ** (1 / (n - 1));
  const scale = Math.max(BIG, small);
  const cellBox = 'flex-1 min-w-0 h-9 sm:h-11 flex items-center justify-center rounded border text-xs sm:text-base';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="max-w-xl mx-auto">
        <div className="flex gap-0.5 sm:gap-1">
          <div className={`${cellBox} border-amber-400 bg-amber-50 dark:bg-amber-950/30`}>🍪</div>
          <div className={`${cellBox} border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30`}>🤖</div>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className={`${cellBox} ${i === n - 1 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
              {i === n - 1 ? '🏆' : ''}
            </div>
          ))}
        </div>
        <div className="flex gap-0.5 sm:gap-1 mt-1 font-mono text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">
          <div className="flex-1 min-w-0 text-center">1</div>
          <div className="flex-1 min-w-0" />
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="flex-1 min-w-0 text-center overflow-hidden">
              {dec(gamma ** i, gamma ** i < 0.995 && n > 8 ? 1 : 2)}
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
          Под всяка клетка: по колко се умножава награда, получена при стъпването в нея (γ на степен „брой стъпки минус 1“).
        </p>
        <div className="mt-3 space-y-1.5 text-sm text-gray-800 dark:text-gray-100">
          {[
            { name: 'наляво 🍪', value: left, text: `${small} · 1 = ${dec(left)}`, on: !goRight && !tie, color: 'bg-amber-500' },
            { name: 'надясно 🏆', value: right, text: `${BIG} · ${dec(gamma ** (n - 1), 3)} = ${dec(right)}`, on: goRight && !tie, color: 'bg-emerald-500' },
          ].map(row => (
            <div key={row.name} className="flex items-center gap-2">
              <span className={`w-24 shrink-0 ${row.on ? 'font-bold' : ''}`}>{row.name}</span>
              <div className="flex-1 min-w-0 h-5 rounded bg-gray-100 dark:bg-gray-900/60 overflow-hidden">
                <div className={`h-full rounded ${row.color}`} style={{ width: `${(row.value / scale) * 100}%` }} />
              </div>
              <span className="w-32 shrink-0 text-right font-mono text-xs">{row.text}</span>
            </div>
          ))}
        </div>
      </div>
      <Sliders>
        <Slider label="γ" value={gamma} onChange={setGamma} min={0} max={1} step={0.05} tone="violet" />
        <Slider label="стъпки" value={n} onChange={setN} min={2} max={12} step={1} tone="emerald" />
        <Slider label="малка" value={small} onChange={setSmall} min={1} max={5} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'по-изгодно', value: tie ? 'все едно' : goRight ? 'надясно' : 'наляво', tone: 'rose' },
            { label: 'границата е при γ ≈', value: dec(border), tone: 'violet' },
            { label: 'хоризонт 1/(1 − γ)', value: gamma >= 1 ? 'безкраен' : `${dec(1 / (1 - gamma), 1)} стъпки`, tone: 'gray' },
          ]}
        />
      </div>
      <Note tone={goRight ? 'emerald' : 'amber'}>
        {gamma === 0
          ? 'При γ = 0 агентът вижда само следващата стъпка: всичко по-далечно струва нула.'
          : gamma >= 1
            ? 'При γ = 1 няма отстъпка: по-голямата награда печели, колкото и далече да е.'
            : goRight
              ? 'Търпеливият агент тръгва надясно: дори след отстъпката голямата награда струва повече.'
              : 'Нетърпеливият агент взима бисквитката: далечната награда се е стопила под близката.'}
      </Note>
    </div>
  );
}

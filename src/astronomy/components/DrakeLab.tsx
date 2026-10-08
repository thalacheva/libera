import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 280;
const CX = 150;
const CY = 140;
const RG = 120; // радиус на диска в px
const R_DISK_LY = 50000;

type Key = 'R' | 'fp' | 'ne' | 'fl' | 'fi' | 'fc' | 'L';
const FACTORS: { k: Key; sym: string; name: string; min: number; max: number; known: boolean; unit?: string }[] = [
  { k: 'R', sym: 'R★', name: 'нови звезди годишно', min: -0.5, max: 1.3, known: true, unit: '/г.' },
  { k: 'fp', sym: 'f_p', name: 'дял звезди с планети', min: -2, max: 0, known: true },
  { k: 'ne', sym: 'n_e', name: 'обитаеми планети в система', min: -2, max: 0.5, known: true },
  { k: 'fl', sym: 'f_l', name: 'дял с възникнал живот', min: -9, max: 0, known: false },
  { k: 'fi', sym: 'f_i', name: 'дял с разумен живот', min: -9, max: 0, known: false },
  { k: 'fc', sym: 'f_c', name: 'дял, който изпраща сигнали', min: -3, max: 0, known: false },
  { k: 'L', sym: 'L', name: 'колко години излъчват', min: 1, max: 9, known: false, unit: ' г.' },
];

const PRESETS: { name: string; v: Record<Key, number> }[] = [
  { name: 'Дрейк, 1961', v: { R: 0, fp: -0.5, ne: 0.3, fl: 0, fi: 0, fc: -1, L: 4 } },
  { name: 'Оптимист', v: { R: 0.3, fp: 0, ne: -0.7, fl: 0, fi: -1, fc: -1, L: 6 } },
  { name: 'Умерено', v: { R: 0.3, fp: 0, ne: -0.7, fl: -1, fi: -2, fc: -1, L: 5 } },
  { name: 'Песимист („рядката Земя“)', v: { R: 0.3, fp: 0, ne: -0.7, fl: -6, fi: -6, fc: -2, L: 3 } },
];

function rnd(n: number) {
  const x = Math.sin(n * 45.164 + 1.7) * 43758.5453;
  return x - Math.floor(x);
}
// Точки в спирален диск (за картата)
const DOTS = Array.from({ length: 1500 }, (_, i) => {
  const r = Math.sqrt(rnd(i)) * 0.95;
  const arm = Math.floor(rnd(i + 3000) * 2);
  const a = arm * Math.PI + 3.2 * Math.log(r + 0.08) + (rnd(i + 6000) - 0.5) * 1.1;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
});

function formatYears(y: number) {
  if (y < 1000) return `${fmt(y, 0)} г.`;
  if (y < 1e6) return `${fmt(y / 1000, 0)} хил. г.`;
  if (y < 1e9) return `${fmt(y / 1e6, 1)} млн. г.`;
  return `${fmt(y / 1e9, 1)} млрд. г.`;
}

export default function DrakeLab() {
  const [v, setV] = useState<Record<Key, number>>(PRESETS[2].v);
  const val = (k: Key) => 10 ** v[k];
  const N = FACTORS.reduce((p, f) => p * val(f.k), 1);
  const shown = Math.min(Math.round(N), DOTS.length);
  // Средно разстояние до най-близката цивилизация в диск
  const dist = N >= 1 ? 0.5 * Math.sqrt((Math.PI * R_DISK_LY * R_DISK_LY) / N) : Infinity;

  const fmtVal = (f: (typeof FACTORS)[number]) => {
    const x = val(f.k);
    if (f.k === 'L') return formatYears(x);
    if (x >= 0.01) return fmt(x, x < 1 ? 2 : 1);
    return sci(x, 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-fuchsia-300 dark:border-fuchsia-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Уравнението на Дрейк</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        N = R★ · f_p · n_e · f_l · f_i · f_c · L – колко цивилизации в Галактиката могат да ни изпратят сигнал точно сега. Първите три
        множителя вече знаем; останалите са чисти предположения.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <radialGradient id="dr-gal">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#a78bfa" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={RG} fill="url(#dr-gal)" />
        {DOTS.slice(600, 1200).map((d, i) => (
          <circle key={`s${i}`} cx={CX - d.y * RG} cy={CY + d.x * RG} r={0.7} fill="white" fillOpacity="0.25" />
        ))}
        {DOTS.slice(0, shown).map((d, i) => (
          <circle key={i} cx={CX + d.x * RG} cy={CY + d.y * RG} r={shown > 300 ? 1.4 : 2.4} fill="#f472b6" />
        ))}
        <circle cx={CX + 0.53 * RG} cy={CY} r={3} fill="#86efac" />
        <text x={CX + 0.53 * RG + 6} y={CY + 3} fontSize="9" fill="#86efac">
          ние
        </text>
        <text x={CX} y={H - 8} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          {N > DOTS.length ? `показани са ${DOTS.length} от ${sci(N, 1)}` : 'розово – цивилизации, които излъчват'}
        </text>

        <g fontSize="11" fill="white" transform="translate(320, 40)">
          <text x={0} y={0} fontSize="12" fillOpacity="0.7">
            цивилизации в Млечния път:
          </text>
          <text x={0} y={34} fontSize="30" fontWeight="700" fill="#f9a8d4">
            N ≈ {N >= 1e4 ? sci(N, 1) : N >= 1 ? fmt(N, N < 10 ? 1 : 0) : sci(N, 0)}
          </text>
          {N >= 1 ? (
            <>
              <text x={0} y={66} fillOpacity="0.85">
                до най-близката: ~{fmt(dist >= 1000 ? Math.round(dist / 100) * 100 : dist, 0)} светлинни години
              </text>
              <text x={0} y={86} fillOpacity="0.85">
                въпрос и отговор: ~{formatYears(2 * dist)}
              </text>
              <text x={0} y={110} fontSize="10" fillOpacity="0.6">
                {2 * dist > val('L') ? 'Разговорът е по-дълъг от живота на цивилизациите!' : 'Има време за разговор между цивилизациите.'}
              </text>
            </>
          ) : (
            <>
              <text x={0} y={66} fillOpacity="0.85">
                N &lt; 1: вероятно сме сами в Галактиката
              </text>
              <text x={0} y={86} fillOpacity="0.85">
                (но във Вселената има ~10¹¹ галактики)
              </text>
            </>
          )}
          <text x={0} y={150} fontSize="10" fillOpacity="0.55">
            Нашият „радиобалон“: от ~1930 г. насам
          </text>
          <text x={0} y={164} fontSize="10" fillOpacity="0.55">
            сигналите ни са стигнали ~95 св. години –
          </text>
          <text x={0} y={178} fontSize="10" fillOpacity="0.55">
            под 0,1% от размера на Галактиката.
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4 mt-1">
        {FACTORS.map(f => (
          <div key={f.k}>
            <label className="block text-sm font-semibold mt-3 mb-1">
              {f.sym} = {fmtVal(f)}
              {f.k === 'R' ? f.unit : ''} <span className="font-normal text-gray-500 dark:text-gray-400">– {f.name}</span>
              {f.known ? <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">(измерено)</span> : <span className="ml-1 text-xs text-fuchsia-600 dark:text-fuchsia-400">(неизвестно)</span>}
            </label>
            <input type="range" min={f.min} max={f.max} step="0.05" value={v[f.k]} onChange={e => setV(prev => ({ ...prev, [f.k]: Number(e.target.value) }))} className="w-full" />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {PRESETS.map(q => (
          <button key={q.name} onClick={() => setV(q.v)} className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            {q.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Франк Дрейк написва уравнението за първата конференция по SETI през 1961 г. – не за да даде точен отговор, а за да подреди
        незнанието ни. Днес знаем, че почти всяка звезда има планети и че обитаемите планети не са рядкост. Но за f_l, f_i и L имаме само
        един пример – нас самите. Затова N може да е между по-малко от 1 и милиони.
      </p>
    </div>
  );
}

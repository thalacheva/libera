import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';

const N = 1000;
const RED = '#dc2626';
const BLUE = '#2563eb';
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

type Kind = { name: string; tone: string; classes: [string, string]; swapAt: number[] };

/**
 * Хромозомата на гаметата като отсечки: тръгва от червената (ABC) и сменя цвета при всяка точка в swapAt
 * (0 – между A и B, 1 – между B и C).
 */
function Gamete({ x, y, w, posB, swapAt, flip }: { x: number; y: number; w: number; posB: number; swapAt: number[]; flip: boolean }) {
  const pts = [0, posB / 2, posB, posB + (1 - posB) / 2, 1];
  // Цветът на всеки от четирите участъка
  const segColor = (seg: number) => {
    const swaps = swapAt.filter(s => (s === 0 ? seg >= 1 : seg >= 3)).length;
    return (swaps % 2 === 0) !== flip ? RED : BLUE;
  };
  return (
    <g>
      {[0, 1, 2, 3].map(seg => (
        <line key={seg} x1={x + pts[seg] * w} x2={x + pts[seg + 1] * w} y1={y} y2={y} stroke={segColor(seg)} strokeWidth={7} strokeLinecap="round" />
      ))}
      {[0, posB, 1].map((p, k) => (
        <text key={k} x={x + p * w} y={y - 9} fontSize="11.5" fontStyle="italic" fontWeight="700" textAnchor="middle" fill="currentColor">
          {segColor(k === 0 ? 0 : k === 1 ? 1 : 3) === RED ? 'ABC'[k] : 'abc'[k]}
        </text>
      ))}
    </g>
  );
}

/** Анализиращо кръстосване ABC/abc × abc/abc: от броя на рекомбинантите – разстоянията и картата. */
export default function LinkageMapLab() {
  const [d1, setD1] = useState(15);
  const [d2, setD2] = useState(10);

  const r1 = d1 / 100;
  const r2 = d2 / 100;
  // Двойни кросинговъри без интерференция: вероятностите се умножават
  // Общо за двата реципрочни класа от всеки тип; родителските – останалото, за да е точно N
  const sco1 = Math.round(r1 * (1 - r2) * N);
  const sco2 = Math.round(r2 * (1 - r1) * N);
  const dco = Math.round(r1 * r2 * N);
  const parental = N - sco1 - sco2 - dco;
  const total = N;

  const kinds: (Kind & { count: number })[] = [
    { name: 'родителски', tone: 'text-gray-700 dark:text-gray-200', classes: ['ABC', 'abc'], swapAt: [], count: parental },
    { name: 'кросинговър A–B', tone: 'text-amber-700 dark:text-amber-400', classes: ['Abc', 'aBC'], swapAt: [0], count: sco1 },
    { name: 'кросинговър B–C', tone: 'text-emerald-700 dark:text-emerald-400', classes: ['ABc', 'abC'], swapAt: [1], count: sco2 },
    { name: 'двоен кросинговър', tone: 'text-violet-700 dark:text-violet-400', classes: ['AbC', 'aBc'], swapAt: [0, 1], count: dco },
  ];

  const rfAB = (100 * (sco1 + dco)) / total;
  const rfBC = (100 * (sco2 + dco)) / total;
  const rfAC = (100 * (sco1 + sco2)) / total;

  // Картата отгоре: целият участък (поне 50 cM) в 400 единици
  const mapX = (cm: number) => 40 + (cm / Math.max(d1 + d2, 50)) * 400;
  const posB = d1 / (d1 + d2);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 236" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={20} y={16} fontSize="11.5" className="fill-gray-500 dark:fill-gray-400">
          хетерозиготният родител (хомоложните хромозоми)
        </text>
        {[
          { y: 44, color: RED, letters: 'ABC' },
          { y: 74, color: BLUE, letters: 'abc' },
        ].map(h => (
          <g key={h.letters}>
            <line x1={mapX(0) - 10} x2={mapX(d1 + d2) + 10} y1={h.y} y2={h.y} stroke={h.color} strokeWidth={8} strokeLinecap="round" />
            {[0, d1, d1 + d2].map((cm, k) => (
              <g key={k}>
                <line x1={mapX(cm)} x2={mapX(cm)} y1={h.y - 7} y2={h.y + 7} className="stroke-gray-800 dark:stroke-gray-100" strokeWidth={2} />
                <text x={mapX(cm)} y={h.y - 10} fontSize="12" fontStyle="italic" fontWeight="700" textAnchor="middle" fill="currentColor">
                  {h.letters[k]}
                </text>
              </g>
            ))}
          </g>
        ))}
        <text x={(mapX(0) + mapX(d1)) / 2} y={98} fontSize="11" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400">
          {d1} cM
        </text>
        <text x={(mapX(d1) + mapX(d1 + d2)) / 2} y={98} fontSize="11" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400">
          {d2} cM
        </text>

        <text x={20} y={126} fontSize="11.5" className="fill-gray-500 dark:fill-gray-400">
          гаметите му и броят на потомците (от {total}) в анализиращото кръстосване
        </text>
        {kinds.map((k, i) => {
          const x = 14 + i * 116;
          return (
            <g key={k.name}>
              <rect x={x} y={136} width={108} height={96} rx={8} className="fill-gray-50 stroke-gray-200 dark:fill-gray-900/50 dark:stroke-gray-700" />
              <Gamete x={x + 14} y={164} w={80} posB={posB} swapAt={k.swapAt} flip={false} />
              <Gamete x={x + 14} y={194} w={80} posB={posB} swapAt={k.swapAt} flip />
              <text x={x + 54} y={224} fontSize="12" fontWeight="700" textAnchor="middle" fill="currentColor">
                {Math.ceil(k.count / 2)} + {Math.floor(k.count / 2)}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <div className="grid grid-cols-4 gap-1 text-[11px] leading-tight sm:text-sm text-center mt-1 max-w-xl mx-auto">
        {kinds.map(k => (
          <p key={k.name} className={`font-semibold ${k.tone}`}>
            {k.name}
          </p>
        ))}
      </div>

      <Sliders>
        <Slider label={`A–B ${d1}`} value={d1} onChange={setD1} min={3} max={45} step={1} tone="amber" />
        <Slider label={`B–C ${d2}`} value={d2} onChange={setD2} min={3} max={45} step={1} tone="emerald" />
      </Sliders>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'RF(A–B)', value: `${fmt(rfAB)}%`, tone: 'amber' },
            { label: 'RF(B–C)', value: `${fmt(rfBC)}%`, tone: 'emerald' },
            { label: 'RF(A–C)', value: `${fmt(rfAC)}%`, tone: 'violet' },
            { label: 'сума A–B + B–C', value: `${fmt(rfAB + rfBC)}%` },
          ]}
        />
      </div>
      <Note tone="violet">
        A и C изглеждат по-близо ({fmt(rfAC)}% вместо {fmt(rfAB + rfBC)}%): при двойния кросинговър краищата остават родителски и тези {dco} потомци не се
        броят като рекомбинанти за A и C.
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Плъзгачите задават честотата на рекомбинация във всеки участък; моделът приема, че двата кросинговъра стават независимо (без интерференция). Най-редките
        класове са двойните кросинговъри – по тях се познава кой ген е в средата. Колкото по-далеч са гените, толкова повече двойни кросинговъри „крият“ – затова
        картите се строят от близки гени, а измерената честота никога не надхвърля 50%.
      </p>
    </div>
  );
}

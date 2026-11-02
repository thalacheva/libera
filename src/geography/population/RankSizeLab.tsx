import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { CITY_SETS, fitRankSize } from './urbanData';

const W = 640;
const H = 330;
const L = 70;
const R = 620;
const T = 20;
const B = 285;

const people = (p: number) => {
  if (p < 1e6) return `${fmt(Math.round(p / 1000))} хил.`;
  const m = p / 1e6;
  return `${fmt(m, Number.isInteger(m) ? 0 : m >= 10 ? 1 : 2)} млн`;
};

/** Правилото ранг–големина в логаритмичен мащаб: P_r = P_1 / r^q. */
export default function RankSizeLab() {
  const [si, setSi] = useState(0);
  const [q, setQ] = useState(1);
  const [skip, setSkip] = useState(false);
  const [sel, setSel] = useState(1);

  const set = CITY_SETS[si];
  const pops = set.cities.map(c => c[1]);
  const n = pops.length;
  const fit = fitRankSize(pops, skip);

  // Оси: ранг 1…n и население в цели десетични порядъци около данните
  const yLo = Math.floor(Math.log10(Math.min(...pops)) - 0.05);
  const yHi = Math.ceil(Math.log10(pops[0]) + 0.05);
  const xHi = Math.log10(n + 2);
  const X = (r: number) => L + (Math.log10(r) / xHi) * (R - L);
  const Y = (p: number) => B - ((Math.log10(p) - yLo) / (yHi - yLo)) * (B - T);

  const zipf = (r: number) => pops[0] / r ** q;
  const fitP = (r: number) => fit.p1 / r ** fit.q;
  const clipY = (p: number) => Math.min(B, Math.max(T, Y(p)));

  const ticksX = [1, 2, 3, 5, 10, 20].filter(r => r <= n + 2);
  const ticksY: number[] = [];
  for (let e = yLo; e <= yHi; e++) for (const m of [1, 2, 5]) if (e + Math.log10(m) <= yHi + 1e-9) ticksY.push(m * 10 ** e);

  const s = Math.min(sel, n - 1);
  const [name, pop] = set.cities[s];
  const expected = zipf(s + 1);
  const primacy = pops[0] / pops[1];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {ticksY.map(p => (
          <g key={p}>
            <line x1={L} y1={Y(p)} x2={R} y2={Y(p)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={String(p)[0] === '1' ? 1 : 0.5} />
            <text x={L - 6} y={Y(p) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {people(p)}
            </text>
          </g>
        ))}
        {ticksX.map(r => (
          <g key={r}>
            <line x1={X(r)} y1={T} x2={X(r)} y2={B} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="0.5" />
            <text x={X(r)} y={B + 15} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {r}
            </text>
          </g>
        ))}
        <text x={(L + R) / 2} y={B + 32} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          ранг r (логаритмична скала)
        </text>

        {/* Идеалното правило от първия град */}
        <line x1={X(1)} y1={clipY(zipf(1))} x2={X(n + 2)} y2={clipY(zipf(n + 2))} className="stroke-amber-500" strokeWidth="2" strokeDasharray="6 4" />
        {/* Правата по данните */}
        <line x1={X(1)} y1={clipY(fitP(1))} x2={X(n + 2)} y2={clipY(fitP(n + 2))} className="stroke-violet-500" strokeWidth="2" />

        {pops.map((p, i) => (
          <g key={set.cities[i][0]} onClick={() => setSel(i)} className="cursor-pointer">
            <circle cx={X(i + 1)} cy={Y(p)} r={10} fill="transparent" />
            <circle
              cx={X(i + 1)}
              cy={Y(p)}
              r={i === s ? 6 : 4.5}
              className={i === s ? 'fill-rose-500 stroke-white dark:stroke-gray-800' : 'fill-sky-600 dark:fill-sky-400'}
              strokeWidth="1.5"
              opacity={skip && i === 0 ? 0.45 : 1}
            />
          </g>
        ))}
        {/* Очакваното място на избрания град */}
        <line x1={X(s + 1)} y1={Y(pop)} x2={X(s + 1)} y2={clipY(expected)} className="stroke-rose-400" strokeWidth="1.5" strokeDasharray="2 3" />
        <text
          x={X(s + 1) + (s > n / 2 ? -10 : 10)}
          y={Y(pop) + (Y(pop) < T + 30 ? 18 : -10)}
          fontSize="12"
          textAnchor={s > n / 2 ? 'end' : 'start'}
          className="fill-rose-600 dark:fill-rose-400 font-semibold"
        >
          {name}: {people(pop)}
        </text>

        <g transform={`translate(${R - 200}, ${T + 8})`}>
          <rect width="200" height="44" rx="6" className="fill-white/85 dark:fill-gray-800/85" />
          <line x1="8" y1="14" x2="34" y2="14" className="stroke-amber-500" strokeWidth="2" strokeDasharray="6 4" />
          <text x="40" y="18" fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            P₁ / r
            <tspan dy="-5" fontSize="8">
              q
            </tspan>
            <tspan dy="5">, q = {fmt(q, 2)}</tspan>
          </text>
          <line x1="8" y1="32" x2="34" y2="32" className="stroke-violet-500" strokeWidth="2" />
          <text x="40" y="36" fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            права по данните, q = {fmt(fit.q, 2)}
          </text>
        </g>
      </LabSvg>
      <Buttons>
        {CITY_SETS.map((c, i) => (
          <DiagramButton key={c.name} active={i === si} onClick={() => setSi(i)}>
            {c.name}
          </DiagramButton>
        ))}
        <DiagramButton active={skip} onClick={() => setSkip(!skip)}>
          права без първия град
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="q" value={q} onChange={setQ} min={0.4} max={1.6} step={0.05} tone="amber" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        {set.note}. Пунктирът тръгва от първия град и пада с наклон q; при q = 1 това е правилото на Ципф. Цъкни върху точка, за да сравниш града с
        правилото.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'по правилото', value: people(expected), tone: 'amber' },
            { label: 'реално', value: people(pop), tone: 'rose' },
            { label: 'q по данните', value: fmt(fit.q, 2), tone: 'violet' },
            { label: 'P₁ / P₂', value: fmt(primacy, 2), tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={primacy > 2.5 ? 'rose' : 'emerald'}>
        {primacy > 2.5
          ? `${set.cities[0][0]} е ${fmt(primacy, 1)} пъти по-голям от втория град – повече, отколкото предвижда правилото (2 пъти): град-примат.`
          : `Първият град е само ${fmt(primacy, 1)} пъти по-голям от втория – няма изразен град-примат.`}
      </Note>
    </div>
  );
}

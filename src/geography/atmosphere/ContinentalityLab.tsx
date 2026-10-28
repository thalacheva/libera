import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt, rad } from '../geo';
import { MONTHS } from './koppen';

// Опростен модел: континент в северното полукълбо с океан на запад (като Европа и Азия).
// Средна годишна температура по ширина – приблизително средното за ширинния кръг при морското равнище.
const ZONAL = [25, 23, 20, 17, 14, 10, 6, 2.5, -1, -5, -10]; // 20°, 25°, … 70°
const zonalMean = (lat: number) => {
  const x = (lat - 20) / 5;
  const i = Math.min(ZONAL.length - 2, Math.floor(x));
  return ZONAL[i] + (ZONAL[i + 1] - ZONAL[i]) * (x - i);
};
/** Каква част от пълната континенталност е достигната на d km от океана. */
const inland = (d: number) => 1 - Math.exp(-d / 2500);

function climateAt(lat: number, d: number, h: number) {
  const f = inland(d);
  const A = 2 + 0.12 * lat + (1 + 0.85 * lat - (2 + 0.12 * lat)) * f;
  // Над океана най-топло е чак през август, във вътрешността – през юли
  const peak = 6.6 + 0.8 * (1 - f);
  const mean = zonalMean(lat) - 0.0065 * h;
  return (m: number) => mean + (A / 2) * Math.cos((2 * Math.PI * (m + 0.5 - peak)) / 12);
}

/** Индекс на континенталност на Горчински. */
const gorczynski = (A: number, lat: number) => (1.7 * A) / Math.sin(rad(lat)) - 20.4;

const X0 = 60;
const X1 = 580;
const Y0 = 78;
const Y1 = 268;
const LO = -45;
const HI = 35;
const xOf = (m: number) => X0 + ((m + 0.5) / 12) * (X1 - X0);
const yOf = (t: number) => Y1 - ((t - LO) / (HI - LO)) * (Y1 - Y0);
const DMAX = 8000;

const path = (f: (m: number) => number) =>
  Array.from({ length: 111 }, (_, i) => {
    const m = -0.5 + (i / 110) * 12;
    return `${i ? 'L' : 'M'}${xOf(m).toFixed(1)} ${yOf(f(m)).toFixed(1)}`;
  }).join('');

/** Как разстоянието от океана, ширината и височината менят годишния ход на температурата. */
export default function ContinentalityLab() {
  const [lat, setLat] = useState(50);
  const [d, setD] = useState(2000);
  const [h, setH] = useState(0);
  const here = climateAt(lat, d, h);
  const coast = climateAt(lat, 0, h);
  const months = MONTHS.map((_, m) => here(m));
  const coastMonths = MONTHS.map((_, m) => coast(m));
  const A = Math.max(...months) - Math.min(...months);
  const Ac = Math.max(...coastMonths) - Math.min(...coastMonths);
  const K = gorczynski(A, lat);
  const warm = months.indexOf(Math.max(...months));
  const kind = K < 20 ? 'морски климат – малка амплитуда, мека зима и прохладно лято' : K < 50 ? 'умерено континентален климат' : 'рязко континентален климат – люта зима и горещо лято';
  const MONTH_NAMES = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];

  const landX = 120;
  const markX = landX + (d / DMAX) * (620 - landX);
  const peakH = (h / 3000) * 34;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Схема: океан на запад, суша на изток */}
        <rect x={20} y={46} width={landX - 20} height={14} className="fill-sky-400/70 dark:fill-sky-600/70" />
        <rect x={landX} y={46} width={620 - landX} height={14} className="fill-lime-600/50 dark:fill-lime-700/50" />
        <text x={30} y={40} fontSize="11" className="fill-sky-700 dark:fill-sky-300">
          океан
        </text>
        <text x={landX + 6} y={40} fontSize="11" className="fill-lime-800 dark:fill-lime-300">
          континент →
        </text>
        <path d={`M${markX - 16} 46 L${markX} ${46 - 6 - peakH} L${markX + 16} 46 Z`} className="fill-stone-500/80" />
        <circle cx={markX} cy={46 - 6 - peakH} r={4} className="fill-rose-600" />
        <text x={markX} y={74} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {fmt(d)} km от брега
        </text>

        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} className="fill-white dark:fill-slate-900 stroke-gray-300 dark:stroke-gray-600" />
        {[-40, -30, -20, -10, 0, 10, 20, 30].map(t => (
          <g key={t}>
            <line x1={X0} y1={yOf(t)} x2={X1} y2={yOf(t)} className={t === 0 ? 'stroke-gray-500' : 'stroke-gray-200 dark:stroke-gray-700'} />
            <text x={X0 - 6} y={yOf(t) + 4} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {fmt(t)}
            </text>
          </g>
        ))}
        <text x={X0 - 6} y={Y0 - 4} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          °C
        </text>
        <path d={path(coast)} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="2" strokeDasharray="6 4" />
        <path d={path(here)} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
        {months.map((t, m) => (
          <circle key={m} cx={xOf(m)} cy={yOf(t)} r={3.5} className="fill-rose-600 dark:fill-rose-400" />
        ))}
        {MONTHS.map((name, m) => (
          <text key={`m${m}`} x={xOf(m)} y={Y1 + 15} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {name}
          </text>
        ))}
        <g transform={`translate(${X1 - 170} ${Y0 + 16})`} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          <line x1={0} y1={-4} x2={20} y2={-4} className="stroke-rose-600" strokeWidth="2.5" />
          <text x={26} y={0}>избраното място</text>
          <line x1={0} y1={12} x2={20} y2={12} className="stroke-sky-600" strokeWidth="2" strokeDasharray="6 4" />
          <text x={26} y={16}>на брега на океана</text>
        </g>
      </LabSvg>
      <Sliders>
        <Slider label="φ, °" value={lat} onChange={setLat} min={25} max={70} step={1} tone="violet" />
        <Slider label="d, km" value={d} onChange={setD} min={0} max={DMAX} step={100} tone="emerald" />
        <Slider label="h, m" value={h} onChange={setH} min={0} max={3000} step={100} tone="gray" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        φ – географска ширина (северна), d – разстояние от океана навътре в континента, h – надморска височина. Моделът е опростен и числата са ориентировъчни.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'най-студен', value: `${fmt(Math.min(...months), 1)} °C`, tone: 'blue' },
            { label: 'най-топъл', value: `${fmt(Math.max(...months), 1)} °C`, tone: 'rose' },
            { label: 'амплитуда', value: `${fmt(A, 1)} °C (на брега ${fmt(Ac, 1)})`, tone: 'amber' },
            { label: 'K по Горчински', value: fmt(K), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={K < 20 ? 'blue' : K < 50 ? 'emerald' : 'rose'}>
        {kind}; най-топъл е {MONTH_NAMES[warm]}
      </Note>
    </div>
  );
}

import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note } from '~/geometry/diagram';

// Модел (условни единици O₂ за минута): брутната фотосинтеза расте със светлината до таван,
// който се определя от CO₂ и температурата (ъгъл като в опитите на Блекман); дишането расте с температурата (Q₁₀ = 2).
const SLOPE = 0.25; // начален наклон: фотосинтеза на единица светлина
const THETA = 0.97; // колко остър е „ъгълът“ на кривата
const tempFactor = (t: number) => (t <= 30 ? Math.max(0.05, 2 ** ((t - 30) / 10)) : Math.max(0, 1 - ((t - 30) / 15) ** 2));
const co2Factor = (c: number) => (c + 0.05) / (c + 0.45);
const ceiling = (c: number, t: number) => 30 * co2Factor(c) * tempFactor(t);
const gross = (light: number, c: number, t: number) => {
  const x = SLOPE * light;
  const p = ceiling(c, t);
  return (x + p - Math.sqrt((x + p) ** 2 - 4 * THETA * x * p)) / (2 * THETA);
};
const respiration = (t: number) => 1.5 * 2 ** ((t - 20) / 10);
const net = (light: number, c: number, t: number) => gross(light, c, t) - respiration(t);
/** Относителна осветеност: 100 при лампа на 10 cm, обратно пропорционална на квадрата на разстоянието. */
const lightAt = (d: number) => 100 * (10 / d) ** 2;

// Графиката
const GX = 330;
const GW = 250;
const GY = 18;
const GH = 180;
const Y_MIN = -8;
const Y_MAX = 24;
const gx = (light: number) => GX + (light / 100) * GW;
const gy = (v: number) => GY + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * GH;

// Апаратурата
const BEAKER_X = 200;
const lampX = (d: number) => BEAKER_X - 12 - d * 1.5;

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',').replace('-', '−');

/** Водна чума под лампа: мехурчетата кислород при различна светлина, CO₂ и температура. */
export default function LimitingFactorsLab() {
  const [d, setD] = useState(30);
  const [c, setC] = useState(0.5);
  const [t, setT] = useState(20);

  const light = lightAt(d);
  const value = net(light, c, t);
  const bubbles = Math.max(0, Math.round(value * 2));
  const nBubbles = Math.min(14, Math.ceil(bubbles / 3));
  const resp = respiration(t);
  const cap = ceiling(c, t);

  // Точка на компенсация: светлината, при която брутната фотосинтеза = дишането
  let comp: number | null = null;
  if (cap > resp * 1.02) {
    let lo = 0;
    let hi = 1000;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (net(mid, c, t) < 0) lo = mid;
      else hi = mid;
    }
    comp = lo;
  }

  const curve = Array.from({ length: 101 }, (_, i) => `${gx(i).toFixed(1)},${gy(Math.max(Y_MIN, net(i, c, t))).toFixed(1)}`).join(' ');

  let note: string;
  if (cap <= resp * 1.02) note = 'При тези условия дишането е по-бързо от фотосинтезата при всяка светлина – растението само губи захари.';
  else if (value <= 0) note = 'Под точката на компенсация: растението диша по-бързо, отколкото фотосинтезира, и не отделя кислород.';
  else if (SLOPE * light < 0.6 * cap) note = 'Ограничава светлината: приближи лампата и мехурчетата ще се учестят. Кривата тук е почти права.';
  else if (SLOPE * light > 1.6 * cap) {
    if (t > 34) note = 'Кривата е на плато, а температурата е твърде висока: ензимите (особено РуБисКО) работят все по-зле. Охлади водата.';
    else if (t < 17 && tempFactor(t) < co2Factor(c)) note = 'Кривата е на плато и ограничава ниската температура – ензимите на цикъла на Калвин са бавни. Затопли водата.';
    else note = 'Кривата е на плато: още светлина не помага. Ограничава CO₂ – добави сода бикарбонат.';
  } else note = 'Близо до ъгъла на кривата: тук скоростта зависи и от светлината, и от CO₂ и температурата.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 600 236" className="w-full h-auto max-w-2xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Лампата и лъчите */}
        <g>
          <line x1={lampX(d)} x2={BEAKER_X} y1={120} y2={120} stroke="#fbbf24" strokeOpacity={0.25 + 0.6 * Math.min(1, light / 100)} strokeWidth={18} />
          <rect x={lampX(d) - 18} y={102} width={14} height={36} rx={3} className="fill-gray-500 dark:fill-gray-400" />
          <circle cx={lampX(d) - 2} cy={120} r={10} fill="#fde047" stroke="#ca8a04" />
          <line x1={lampX(d) - 11} x2={lampX(d) - 11} y1={138} y2={186} className="stroke-gray-500" strokeWidth={3} />
        </g>
        {/* Линийка */}
        <line x1={lampX(100) - 2} x2={BEAKER_X} y1={196} y2={196} className="stroke-gray-400" />
        {[10, 20, 40, 60, 80, 100].map(v => (
          <g key={v}>
            <line x1={lampX(v) - 2} x2={lampX(v) - 2} y1={192} y2={200} className="stroke-gray-400" />
            <text x={lampX(v) - 2} y={212} fontSize="10" textAnchor="middle" fill="currentColor">
              {v}
            </text>
          </g>
        ))}
        <text x={BEAKER_X} y={226} fontSize="10.5" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          разстояние до лампата, cm
        </text>

        {/* Чашата с водна чума */}
        <rect x={BEAKER_X} y={70} width={64} height={116} rx={4} className="fill-sky-100/70 dark:fill-sky-900/40 stroke-gray-400" />
        <rect x={BEAKER_X} y={70} width={64} height={116} rx={4} fill="#22c55e" fillOpacity={0.04 + 0.12 * Math.min(1, c / 2)} />
        <path d={`M ${BEAKER_X + 32} 178 C ${BEAKER_X + 20} 150, ${BEAKER_X + 44} 130, ${BEAKER_X + 32} 100`} fill="none" stroke="#15803d" strokeWidth={3} />
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i}>
            <ellipse cx={BEAKER_X + 24} cy={168 - i * 15} rx={8} ry={3} fill="#16a34a" transform={`rotate(-25 ${BEAKER_X + 24} ${168 - i * 15})`} />
            <ellipse cx={BEAKER_X + 41} cy={162 - i * 15} rx={8} ry={3} fill="#16a34a" transform={`rotate(25 ${BEAKER_X + 41} ${162 - i * 15})`} />
          </g>
        ))}
        {/* Мехурчетата – колкото по-бърза е фотосинтезата, толкова по-гъсто */}
        <g key={bubbles}>
          {Array.from({ length: nBubbles }, (_, i) => (
            <circle key={i} cx={BEAKER_X + 32} r={2.6} cy={100} className="fill-white stroke-sky-500" strokeWidth={0.8}>
              <animate attributeName="cy" from="100" to="74" dur="2s" begin={`${(-2 * i) / nBubbles}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
        <text x={BEAKER_X + 32} y={62} fontSize="10.5" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {fmt(t, 0)} °C
        </text>
        <text x={BEAKER_X + 32} y={48} fontSize="11" fontWeight="700" textAnchor="middle" fill="currentColor">
          {bubbles} мехурчета/min
        </text>

        {/* Графиката: нетна скорост спрямо светлината */}
        <line x1={GX} x2={GX + GW} y1={gy(0)} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
        {[20, 10, 0, -5].map(v => (
          <text key={v} x={GX - 5} y={gy(v) + 4} fontSize="10" textAnchor="end" fill="currentColor">
            {fmt(v, 0)}
          </text>
        ))}
        {[0, 25, 50, 75, 100].map(v => (
          <text key={v} x={gx(v)} y={GY + GH + 14} fontSize="10" textAnchor="middle" fill="currentColor">
            {v}
          </text>
        ))}
        <text x={GX + GW} y={GY + GH + 28} fontSize="10.5" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          светлина, усл. ед.
        </text>
        <text x={GX + 6} y={GY + 8} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
          нетно отделяне на O₂
        </text>
        <line x1={GX} x2={GX + GW} y1={gy(cap - resp)} y2={gy(cap - resp)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <polyline points={curve} fill="none" stroke="#16a34a" strokeWidth={2.5} />
        {comp !== null && comp <= 100 && (
          <g>
            <circle cx={gx(comp)} cy={gy(0)} r={4} fill="#7c3aed" />
            <text x={gx(comp) + 6} y={gy(0) + 15} fontSize="10" className="fill-violet-700 dark:fill-violet-300">
              компенсация
            </text>
          </g>
        )}
        <circle cx={gx(Math.min(100, light))} cy={gy(Math.max(Y_MIN, value))} r={5.5} fill="#e11d48" stroke="white" strokeWidth={1.5} />
      </LabSvg>

      <Sliders>
        <Slider label="d, cm" value={d} onChange={setD} min={10} max={100} step={1} tone="amber" />
        <Slider label="NaHCO₃" value={c} onChange={setC} min={0} max={2} step={0.1} tone="emerald" />
        <Slider label="t, °C" value={t} onChange={setT} min={5} max={45} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs sm:text-sm">
        <div className="rounded bg-gray-50 dark:bg-gray-900/40 px-2 py-1">
          светлина <div className="font-mono">{fmt(light)}</div>
        </div>
        <div className="rounded bg-gray-50 dark:bg-gray-900/40 px-2 py-1">
          брутна <div className="font-mono">{fmt(gross(light, c, t))}</div>
        </div>
        <div className="rounded bg-gray-50 dark:bg-gray-900/40 px-2 py-1">
          дишане <div className="font-mono">{fmt(resp)}</div>
        </div>
        <div className="rounded bg-gray-50 dark:bg-gray-900/40 px-2 py-1">
          нетна <div className="font-mono">{fmt(value)}</div>
        </div>
      </div>
      <Note tone="emerald">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Светлината от малка лампа намалява с квадрата на разстоянието: на 20 cm тя е 4 пъти по-слаба, отколкото на 10 cm. Содата
        бикарбонат (NaHCO₃, в %) дава CO₂ във водата. Пунктирът е таванът, до който стига кривата при тези CO₂ и температура. Моделът е
        опростен и в условни единици, но формата на кривите е като в истинските опити.
      </p>
    </div>
  );
}

import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { WORLD, WORLD_UN } from './demographyModel';

const Y0 = 1700;
const Y1 = 2100;
const VMAX = 16;
const X0 = 50;
const X1 = 610;
const T0 = 20;
const B0 = 300;
const xOf = (y: number) => X0 + ((y - Y0) / (Y1 - Y0)) * (X1 - X0);
const yOf = (v: number) => B0 - (Math.min(v, VMAX) / VMAX) * (B0 - T0);
const START = 2024;
const P0 = 8.16;

/** Растежът на населението на Земята: експоненциален и логистичен модел срещу прогнозата на ООН. */
export default function GrowthLab() {
  const [r, setR] = useState(0.9);
  const [K, setK] = useState(11);
  const [logistic, setLogistic] = useState(false);

  const rr = r / 100;
  const k = Math.log(1 + rr);
  // Логистичният модел започва със същия темп r като днешния
  const kl = K > P0 ? k / (1 - P0 / K) : 0;
  const model = (y: number) => {
    const t = y - START;
    if (!logistic) return P0 * Math.exp(k * t);
    if (K <= P0) return P0;
    return K / (1 + (K / P0 - 1) * Math.exp(-kl * t));
  };
  const pts: string[] = [];
  for (let y = START; y <= Y1; y += 1) pts.push(`${xOf(y).toFixed(1)},${yOf(model(y)).toFixed(1)}`);
  const p2100 = model(2100);
  const t70 = 70 / r;
  const tExact = Math.log(2) / k;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(v => (
          <g key={v}>
            <line x1={X0} y1={yOf(v)} x2={X1} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={yOf(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        <text x={X0 - 6} y={T0 - 8} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          млрд.
        </text>
        {[1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050, 2100].map(y => (
          <text key={y} x={xOf(y)} y={B0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {y}
          </text>
        ))}
        <line x1={xOf(START)} y1={T0} x2={xOf(START)} y2={B0} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="2 3" />
        {/* Прогноза на ООН */}
        <polyline
          points={WORLD_UN.map(([y, v]) => `${xOf(y).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ')}
          fill="none"
          className="stroke-gray-500 dark:stroke-gray-400"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text x={xOf(2100) - 4} y={yOf(10.18) + 16} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          ООН
        </text>
        {/* Историческите данни */}
        <polyline
          points={WORLD.map(([y, v]) => `${xOf(y).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ')}
          fill="none"
          className="stroke-sky-600 dark:stroke-sky-400"
          strokeWidth="2.5"
        />
        {WORLD.filter(([, v]) => Number.isInteger(v)).map(([y, v]) => (
          <g key={y}>
            <circle cx={xOf(y)} cy={yOf(v)} r={3} className="fill-sky-600 dark:fill-sky-400" />
            <text x={xOf(y) - 5} y={yOf(v) - 4} fontSize="9" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {v === 1 ? '' : y}
            </text>
          </g>
        ))}
        {/* Моделът */}
        <polyline points={pts.join(' ')} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" />
        {logistic && K > P0 && (
          <>
            <line x1={xOf(START)} y1={yOf(K)} x2={X1} y2={yOf(K)} className="stroke-rose-400" strokeDasharray="2 3" />
            <text x={xOf(START) + 4} y={yOf(K) - 4} fontSize="10" className="fill-rose-600 dark:fill-rose-400">
              K = {fmt(K, 1)} млрд.
            </text>
          </>
        )}
        {p2100 > VMAX && (
          <text x={xOf(START) - 8} y={T0 + 12} fontSize="10" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
            модел: {fmt(p2100, 0)} млрд. през 2100 г. ↗
          </text>
        )}
      </LabSvg>
      <Buttons>
        <DiagramButton active={!logistic} onClick={() => setLogistic(false)}>
          Експоненциален
        </DiagramButton>
        <DiagramButton active={logistic} onClick={() => setLogistic(true)}>
          Логистичен
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="r, %" value={r} onChange={setR} min={0.1} max={2.5} step={0.1} tone="rose" />
        {logistic && <Slider label="K, млрд" value={K} onChange={setK} min={8.5} max={16} step={0.1} tone="amber" />}
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        r – годишният темп на нарастване през 2024 г. (по данни на ООН около 0,9%); K – границата, към която се изравнява логистичната крива. Синята линия
        са оценките до 2024 г., пунктирът – средният вариант на прогнозата на ООН (WPP 2024).
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'удвояване (70/r)', value: `${fmt(t70)} г.`, tone: 'rose' },
            { label: 'точно', value: `${fmt(tExact)} г.`, tone: 'gray' },
            { label: '2100 г.', value: `${fmt(p2100, 1)} млрд.`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="blue">
        {logistic
          ? 'Логистичният растеж се забавя, когато населението доближи K – подобно на прогнозата на ООН.'
          : `При постоянни ${fmt(r, 1)}% годишно населението се удвоява на всеки ${fmt(tExact)} години – до безкрай.`}
      </Note>
    </div>
  );
}

import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { dewPoint, LCL_PER_DEGREE, satAbsHumidity } from './humidity';

// Кривата на насищане: температура −20…40 °C, абсолютна влажност 0…55 g/m³
const PX = 56;
const PW = 410;
const PY = 16;
const PH = 250;
const T_MIN = -20;
const T_MAX = 40;
const A_MAX = 55;
const xOf = (t: number) => PX + ((t - T_MIN) / (T_MAX - T_MIN)) * PW;
const yOf = (a: number) => PY + PH - (a / A_MAX) * PH;

const curve = (t0: number, t1: number) =>
  Array.from({ length: 81 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / 80;
    return `${i ? 'L' : 'M'}${xOf(t).toFixed(1)} ${yOf(satAbsHumidity(t)).toFixed(1)}`;
  }).join('');

const PRESETS = [
  { name: 'лятна вечер', t: 25, rh: 60, t2: 14 },
  { name: 'есенна нощ', t: 12, rh: 85, t2: 5 },
  { name: 'зимен ден в стаята', t: 0, rh: 90, t2: 22 },
  { name: 'пустиня', t: 38, rh: 12, t2: 15 },
];

/** Кривата на насищане: колко пара побира въздухът, точка на оросяване и какво става при охлаждане. */
export default function SaturationLab() {
  const [t, setT] = useState(25);
  const [rh, setRh] = useState(60);
  const [t2, setT2] = useState(14);

  const a = (satAbsHumidity(t) * rh) / 100;
  const td = dewPoint(t, rh);
  const condensing = t2 < td;
  const a2 = condensing ? satAbsHumidity(t2) : a;
  const rh2 = Math.min(100, (a / satAbsHumidity(t2)) * 100);
  // Пътят при охлаждане: хоризонтално до кривата, после по нея надолу
  const path = condensing ? `M${xOf(t)} ${yOf(a)}L${xOf(td)} ${yOf(a)}${curve(td, t2).replace(/^M/, 'L')}` : `M${xOf(t)} ${yOf(a)}L${xOf(t2)} ${yOf(a)}`;
  const visible = (v: number) => v >= T_MIN && v <= T_MAX;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="sat-plot">
            <rect x={PX} y={PY} width={PW} height={PH} />
          </clipPath>
        </defs>
        <rect x={PX} y={PY} width={PW} height={PH} className="fill-amber-50 dark:fill-slate-900" />
        <g clipPath="url(#sat-plot)">
          <path d={`${curve(T_MIN, T_MAX)}L${xOf(T_MAX)} ${PY}L${xOf(T_MIN)} ${PY}Z`} className="fill-sky-200/70 dark:fill-sky-900/50" />
          {[-10, 0, 10, 20, 30].map(v => (
            <line key={v} x1={xOf(v)} y1={PY} x2={xOf(v)} y2={PY + PH} className="stroke-gray-200 dark:stroke-gray-700" />
          ))}
          {[10, 20, 30, 40, 50].map(v => (
            <line key={v} x1={PX} y1={yOf(v)} x2={PX + PW} y2={yOf(v)} className="stroke-gray-200 dark:stroke-gray-700" />
          ))}
          <path d={curve(T_MIN, T_MAX)} fill="none" className="stroke-sky-700 dark:stroke-sky-300" strokeWidth="2.4" />
          <line x1={xOf(t)} y1={yOf(a)} x2={xOf(t)} y2={yOf(satAbsHumidity(t))} className="stroke-gray-500" strokeDasharray="4 3" />
          <path d={path} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.2" />
          {condensing && (
            <line x1={xOf(t2)} y1={yOf(a)} x2={xOf(t2)} y2={yOf(a2)} className="stroke-emerald-600" strokeWidth="3" />
          )}
        </g>
        {[-20, -10, 0, 10, 20, 30, 40].map(v => (
          <text key={v} x={xOf(v)} y={PY + PH + 15} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {v}
          </text>
        ))}
        {[0, 10, 20, 30, 40, 50].map(v => (
          <text key={v} x={PX - 6} y={yOf(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
            {v}
          </text>
        ))}
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" className="stroke-gray-500" />
        <text x={PX + PW / 2} y={PY + PH + 32} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          температура, °C
        </text>
        <text x={14} y={PY + PH / 2} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" transform={`rotate(-90 14 ${PY + PH / 2})`}>
          водна пара, g/m³
        </text>
        <text x={xOf(-14)} y={yOf(40)} fontSize="11" fontWeight="bold" className="fill-sky-800 dark:fill-sky-200">
          пренаситен въздух –
        </text>
        <text x={xOf(-14)} y={yOf(40) + 14} fontSize="11" fontWeight="bold" className="fill-sky-800 dark:fill-sky-200">
          парата се кондензира
        </text>
        <text x={xOf(22)} y={yOf(4)} fontSize="11" fontWeight="bold" className="fill-amber-800 dark:fill-amber-200">
          ненаситен въздух
        </text>
        {visible(td) && (
          <g>
            <circle cx={xOf(td)} cy={yOf(a)} r={4.5} className="fill-sky-600" />
            <text x={xOf(td) - 6} y={yOf(a) - 7} fontSize="10" textAnchor="end" className="fill-sky-800 dark:fill-sky-200">
              точка на оросяване
            </text>
          </g>
        )}
        {visible(t2) && <circle cx={xOf(t2)} cy={yOf(a2)} r={5} className="fill-fuchsia-600" />}
        <circle cx={xOf(t)} cy={yOf(a)} r={6} className="fill-amber-400 stroke-amber-800" strokeWidth="1.5" />
        {/* Легенда */}
        <g transform="translate(484 36)">
          <line x1={0} y1={0} x2={22} y2={0} className="stroke-sky-700 dark:stroke-sky-300" strokeWidth="2.4" />
          <text x={28} y={4} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            насищане
          </text>
          <circle cx={11} cy={22} r={5} className="fill-amber-400 stroke-amber-800" />
          <text x={28} y={26} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            въздухът сега
          </text>
          <line x1={0} y1={44} x2={22} y2={44} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.2" />
          <text x={28} y={48} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            към T₂
          </text>
          <line x1={11} y1={60} x2={11} y2={76} className="stroke-emerald-600" strokeWidth="3" />
          <text x={28} y={72} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            кондензирала
          </text>
          <text x={28} y={86} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
            вода
          </text>
          <text x={0} y={122} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
            <tspan x={0}>На всеки 10 °C</tspan>
            <tspan x={0} dy="14">въздухът побира</tspan>
            <tspan x={0} dy="14">почти двойно</tspan>
            <tspan x={0} dy="14">повече пара.</tspan>
          </text>
        </g>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        T и RH задават въздуха; T₂ е температурата, до която той се охлажда (или затопля), без да се добавя или маха пара.
      </p>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton
            key={p.name}
            active={t === p.t && rh === p.rh && t2 === p.t2}
            onClick={() => {
              setT(p.t);
              setRh(p.rh);
              setT2(p.t2);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="T, °C" value={t} onChange={setT} min={-10} max={40} step={1} tone="amber" />
        <Slider label="RH, %" value={rh} onChange={setRh} min={10} max={100} step={1} tone="blue" />
        <Slider label="T₂, °C" value={t2} onChange={setT2} min={-20} max={40} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'пара', value: `${fmt(a, 1)} g/m³` },
            { label: 'побира най-много', value: `${fmt(satAbsHumidity(t), 1)} g/m³`, tone: 'blue' },
            { label: 'точка на оросяване', value: `${fmt(td, 1)} °C`, tone: 'blue' },
            { label: 'T − Td', value: `${fmt(t - td, 1)} °C` },
            { label: 'облак от', value: `≈ ${fmt(LCL_PER_DEGREE * (t - td))} m` },
            { label: 'RH при T₂', value: `${fmt(rh2)} %`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={condensing ? 'emerald' : t2 > t ? 'amber' : 'blue'}>
        {condensing
          ? `При ${fmt(t2)} °C въздухът побира само ${fmt(a2, 1)} g/m³ – излишните ${fmt(a - a2, 1)} g/m³ се кондензират: ${t2 < 0 ? 'скреж, слана или ледена мъгла' : 'роса или мъгла'}.`
          : t2 > t
            ? 'При затопляне парата не се променя, но въздухът може да побере повече – относителната влажност пада.'
            : 'Въздухът още не е наситен – пара не се кондензира.'}
      </Note>
    </div>
  );
}

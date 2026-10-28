import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Разрез по екватора през Тихия океан: от Индонезия (вляво) до Перу (вдясно), горните 300 m
const X0 = 40;
const X1 = 600;
const SEA = 150;
const PX_PER_M = 130 / 300;
const yOf = (z: number) => SEA + z * PX_PER_M;
const NORMAL_EAST_SST = 24;

/** Модел на Ел Ниньо: силата на пасатите накланя термоклина и мести топлата вода и облаците. */
export default function EnsoLab() {
  const [w, setW] = useState(1);

  // Опростен модел: при силни пасати топлата вода се натрупва на запад, а на изток студената излиза отдолу
  const zWest = 110 + 50 * w;
  const zEast = Math.max(20, 130 - 90 * w);
  const sstWest = 29.5 - 0.6 * Math.abs(1 - w);
  const sstEast = Math.max(20.5, 29 - 5 * w);
  const anomaly = sstEast - NORMAL_EAST_SST;
  const phase = anomaly >= 0.5 ? 'Ел Ниньо' : anomaly <= -0.5 ? 'Ла Ниня' : 'неутрално';
  // Апвелингът почти спира, когато пасатите са слаби
  const upwelling = Math.max(0, w - 0.45);
  const catchIdx = Math.round(100 * Math.min(1.3, Math.max(0.15, w ** 1.5)));
  // Издигането на въздух и облаците са над най-топлата вода; при Ел Ниньо се местят на изток
  const convX = X0 + 90 + (1 - Math.min(1, w)) * 300;

  const thermo = Array.from({ length: 41 }, (_, i) => {
    const x = X0 + ((X1 - X0) * i) / 40;
    const f = i / 40;
    const z = zWest + (zEast - zWest) * f ** 1.4;
    return { x, y: yOf(z) };
  });
  const warmPath = `M${X0} ${SEA}` + thermo.map(p => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') + `L${X1} ${SEA}Z`;
  const thermoLine = thermo.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');

  const windLen = 40 + 70 * w;
  const arrows = [140, 300, 460];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <linearGradient id="enso-warm" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#f87171" />
            <stop offset="1" stopColor={sstEast > 26 ? '#fb923c' : sstEast > 23 ? '#fcd34d' : '#a5f3fc'} />
          </linearGradient>
          <marker id="enso-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" className="fill-sky-700 dark:fill-sky-300" />
          </marker>
          <marker id="enso-up" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0 0 L7 3.5 L0 7 Z" className="fill-blue-700 dark:fill-blue-300" />
          </marker>
        </defs>
        {/* Небе, дълбока студена вода, топъл слой */}
        <rect x={X0} y={10} width={X1 - X0} height={SEA - 10} className="fill-sky-50 dark:fill-slate-900" />
        <rect x={X0} y={SEA} width={X1 - X0} height={yOf(300) - SEA} className="fill-blue-200 dark:fill-blue-950" />
        <path d={warmPath} fill="url(#enso-warm)" opacity={0.85} />
        <path d={thermoLine} fill="none" className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.6" strokeDasharray="5 3" />
        <text x={X0 + 200} y={yOf((zWest + zEast) / 2) + 16} fontSize="10" className="fill-blue-900 dark:fill-blue-200">
          термоклин
        </text>
        {/* Брегове */}
        <path d={`M${X0 - 30} ${SEA - 8} L${X0} ${SEA - 8} L${X0 + 6} ${yOf(300)} L${X0 - 30} ${yOf(300)} Z`} className="fill-stone-400 dark:fill-stone-600" />
        <path
          d={`M${X1} ${SEA - 18} L${X1 + 30} ${SEA - 40} L${X1 + 40} ${yOf(300)} L${X1 - 12} ${yOf(300)} Z`}
          className="fill-stone-400 dark:fill-stone-600"
        />
        <text x={X0 - 14} y={SEA - 16} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          Индонезия
        </text>
        <text x={X1 + 12} y={SEA - 46} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          Перу
        </text>
        {/* Облаци и дъжд над най-топлата вода */}
        <g>
          <ellipse cx={convX} cy={42} rx={44} ry={16} className="fill-gray-300 dark:fill-gray-500" />
          <ellipse cx={convX - 24} cy={50} rx={26} ry={12} className="fill-gray-300 dark:fill-gray-500" />
          <ellipse cx={convX + 26} cy={50} rx={26} ry={12} className="fill-gray-300 dark:fill-gray-500" />
          {[-30, -15, 0, 15, 30].map(d => (
            <line
              key={d}
              x1={convX + d}
              y1={64}
              x2={convX + d - 6}
              y2={SEA - 6}
              className="stroke-sky-600 dark:stroke-sky-400"
              strokeDasharray="4 4"
              strokeWidth="1.3"
            />
          ))}
        </g>
        {/* Пасатите – от изток на запад */}
        {arrows.map(x => (
          <line
            key={x}
            x1={x + windLen / 2}
            y1={SEA - 30}
            x2={x - windLen / 2}
            y2={SEA - 30}
            className="stroke-sky-700 dark:stroke-sky-300"
            strokeWidth="2.5"
            markerEnd="url(#enso-arrow)"
          />
        ))}
        <text x={X1 - 10} y={SEA - 40} fontSize="10" textAnchor="end" className="fill-sky-800 dark:fill-sky-200">
          пасати
        </text>
        {/* Апвелинг край Перу */}
        {upwelling > 0.15 &&
          [0, 1, 2].map(i => (
            <path
              key={i}
              d={`M${X1 - 70 + i * 22} ${yOf(170)} Q${X1 - 40 + i * 14} ${yOf(90)} ${X1 - 30 + i * 8} ${SEA + 6}`}
              fill="none"
              className="stroke-blue-700 dark:stroke-blue-300"
              strokeWidth={0.6 + 1.6 * Math.min(1.3, upwelling)}
              markerEnd="url(#enso-up)"
            />
          ))}
        {/* Температури на повърхността */}
        <text x={X0 + 8} y={SEA - 8} fontSize="11" fontWeight="bold" className="fill-red-700 dark:fill-red-300">
          {fmt(sstWest, 1)} °C
        </text>
        <text
          x={X1 - 8}
          y={SEA - 8}
          fontSize="11"
          fontWeight="bold"
          textAnchor="end"
          className={sstEast > 26 ? 'fill-red-700 dark:fill-red-300' : 'fill-blue-700 dark:fill-blue-300'}
        >
          {fmt(sstEast, 1)} °C
        </text>
        {[100, 200, 300].map(z => (
          <text key={z} x={X0 + 4} y={yOf(z) - 3} fontSize="9" className="fill-blue-900/70 dark:fill-blue-200/70">
            {z} m
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={yOf(300) + 16} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          Тихият океан по екватора, около 15 000 km (дълбочините са силно преувеличени)
        </text>
      </LabSvg>
      <Buttons>
        {(
          [
            [0.3, 'Ел Ниньо'],
            [1, 'Нормално'],
            [1.6, 'Ла Ниня'],
          ] as [number, string][]
        ).map(([v, t]) => (
          <DiagramButton key={t} active={Math.abs(w - v) < 0.01} onClick={() => setW(v)}>
            {t}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="пасати" value={w} onChange={setW} min={0.2} max={1.8} step={0.05} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'изток', value: `${fmt(sstEast, 1)} °C`, tone: 'rose' },
            {
              label: 'аномалия',
              value: `${anomaly > 0 ? '+' : ''}${fmt(anomaly, 1)} °C`,
              tone: 'rose',
            },
            {
              label: 'термоклин З/И',
              value: `${fmt(zWest)} / ${fmt(zEast)} m`,
              tone: 'blue',
            },
            {
              label: 'улов на аншоа',
              value: `≈ ${catchIdx} % от нормалния`,
              tone: 'emerald',
            },
            { label: 'фаза', value: phase, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={phase === 'Ел Ниньо' ? 'rose' : phase === 'Ла Ниня' ? 'blue' : 'emerald'}>
        {phase === 'Ел Ниньо'
          ? 'Пасатите отслабват, топлата вода се разлива на изток и покрива студената. Апвелингът спира, рибата изчезва; в пустините на Перу валят порои, а в Индонезия и Австралия настъпва суша.'
          : phase === 'Ла Ниня'
            ? 'Пасатите са по-силни от обикновено: топлата вода се трупа още по-плътно на запад, а край Перу излиза още повече студена вода. В Индонезия и Австралия валежите се засилват.'
            : 'Пасатите гонят топлата вода на запад; край Перу термоклинът е плитък и студената вода излиза на повърхността – това е апвелингът.'}
      </Note>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Опростен модел: температурите, дълбочините и уловът са илюстративни. „Аномалия“ е отклонението на температурата в източната част от нормалните около{' '}
        {NORMAL_EAST_SST} °C; Ел Ниньо се обявява, когато трайно е поне +0,5 °C.
      </p>
    </div>
  );
}

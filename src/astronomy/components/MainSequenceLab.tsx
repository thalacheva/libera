import { useState } from 'react';
import { hrAxes, msLifetime, msLuminosity, msRadius, msTemperature } from './hrData';
import { temperatureToRGB } from './light';
import { T_SUN, classOf } from './starData';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 300;
// Малка HR диаграма вдясно
const PX0 = 400;
const PX1 = 620;
const PY0 = 24;
const PY1 = 170;
const { x: hx, y: hy } = hrAxes(PX0, PX1, PY0, PY1);
// Скала на живота
const LX0 = 40;
const LX1 = 620;
const LY = 255;
const LOG_T_MIN = 6;
const LOG_T_MAX = 13;
const lx = (years: number) => LX0 + ((Math.log10(years) - LOG_T_MIN) / (LOG_T_MAX - LOG_T_MIN)) * (LX1 - LX0);

const MS_LINE = Array.from({ length: 60 }, (_, i) => {
  const M = 0.08 * 750 ** (i / 59);
  return `${hx(Math.min(msTemperature(M), 45000))},${hy(msLuminosity(M))}`;
}).join(' ');

const MARKS = [
  { t: 13.8e9, name: 'възраст на Вселената' },
  { t: 4.6e9, name: 'възраст на Земята' },
  { t: 66e6, name: 'изчезване на динозаврите' },
];

function formatYears(y: number) {
  if (y < 1e9) return `${fmt(y / 1e6, 0)} млн. години`;
  if (y < 1e12) return `${fmt(y / 1e9, 1)} млрд. години`;
  return `${fmt(y / 1e12, 1)} трлн. години`;
}

export default function MainSequenceLab() {
  const [logM, setLogM] = useState(0);
  const M = 10 ** logM;
  const L = msLuminosity(M);
  const R = msRadius(M);
  const T = msTemperature(M);
  const life = msLifetime(M);
  const cls = classOf(T);

  const scale = 70 / Math.max(R, 1);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Масата решава всичко</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Главната последователност не е случайна ивица: всяка точка от нея отговаря на определена маса. Променете масата и вижте какво
        следва за светимостта, размера, цвета и живота на звездата.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Звездата и Слънцето в общ мащаб */}
        <circle cx={110} cy={100} r={Math.max(1.5, R * scale)} fill={temperatureToRGB(T)} />
        <circle cx={110} cy={100} r={scale} fill="none" stroke={temperatureToRGB(T_SUN)} strokeDasharray="4 3" strokeOpacity="0.8" />
        <text x={110} y={100 - scale - 5} fontSize="9" textAnchor="middle" fill={temperatureToRGB(T_SUN)}>
          Слънце
        </text>

        <g fontSize="11" fill="white" transform="translate(215, 34)">
          <text x={0} y={0} fontSize="14" fontWeight="700">
            M = {fmt(M, M < 1 ? 2 : 1)} M☉
          </text>
          <text x={0} y={22} fillOpacity="0.85">
            L ≈ {L >= 1000 ? sci(L, 1) : fmt(L, L < 0.01 ? 4 : L < 10 ? 2 : 0)} L☉
          </text>
          <text x={0} y={40} fillOpacity="0.85">
            R ≈ {fmt(R, 2)} R☉
          </text>
          <text x={0} y={58} fillOpacity="0.85">
            T ≈ {fmt(Math.round(T / 10) * 10, 0)} K
          </text>
          <text x={0} y={76} fill={cls.color} fontWeight="700">
            клас {cls.letter}V
          </text>
          <text x={0} y={102} fillOpacity="0.6" fontSize="10">
            {M < 0.08 ? '' : M < 0.5 ? 'червено джудже' : M < 1.4 ? 'като Слънцето' : M < 8 ? 'ярка бяла звезда' : 'гореща синя звезда'}
          </text>
        </g>

        {/* Малка HR диаграма */}
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={MS_LINE} fill="none" stroke="#fde68a" strokeOpacity="0.5" strokeWidth="3" />
        <circle cx={hx(Math.min(T, 45000))} cy={hy(L)} r="6" fill={temperatureToRGB(T)} stroke="white" strokeWidth="1.5" />
        <circle cx={hx(T_SUN)} cy={hy(1)} r="2.5" fill="none" stroke="white" strokeOpacity="0.6" />
        <text x={PX0 + 4} y={PY1 - 4} fontSize="8" fill="white" fillOpacity="0.5">
          ← горещи
        </text>
        <text x={PX1 - 4} y={PY1 - 4} fontSize="8" textAnchor="end" fill="white" fillOpacity="0.5">
          студени →
        </text>
        <text x={PX0 + 4} y={PY0 + 10} fontSize="8" fill="white" fillOpacity="0.5">
          ярки ↑
        </text>

        {/* Живот на главната последователност */}
        <line x1={LX0} x2={LX1} y1={LY} y2={LY} stroke="white" strokeOpacity="0.35" />
        {[6, 7, 8, 9, 10, 11, 12, 13].map(p => (
          <g key={p}>
            <line x1={lx(10 ** p)} x2={lx(10 ** p)} y1={LY - 3} y2={LY + 3} stroke="white" strokeOpacity="0.5" />
            <text x={lx(10 ** p)} y={LY + 15} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
              10{['⁶', '⁷', '⁸', '⁹', '¹⁰', '¹¹', '¹²', '¹³'][p - 6]} г.
            </text>
          </g>
        ))}
        {MARKS.map((m, i) => (
          <g key={m.name}>
            <line x1={lx(m.t)} x2={lx(m.t)} y1={LY - 22 + i * 4} y2={LY} stroke="#94a3b8" strokeDasharray="2 2" />
            <text x={lx(m.t)} y={LY - 25 + i * 4 - i * 9} fontSize="8.5" textAnchor="middle" fill="#cbd5e1">
              {m.name}
            </text>
          </g>
        ))}
        <rect x={LX0} y={LY - 6} width={Math.max(2, Math.min(LX1, lx(Math.min(life, 1e13))) - LX0)} height={12} rx="3" fill={temperatureToRGB(T)} fillOpacity="0.8" />
        <text x={LX0} y={LY + 34} fontSize="11" fill="white">
          живот на главната последователност: t ≈ 10¹⁰ г. · M / L ≈{' '}
          <tspan fill="#fde68a" fontWeight="700">
            {formatYears(life)}
          </tspan>
          {life > 13.8e9 ? ' – по-дълго от възрастта на Вселената!' : ''}
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Маса: {fmt(M, M < 1 ? 2 : 1)} M☉</label>
      <input type="range" min={Math.log10(0.08)} max={Math.log10(60)} step="0.005" value={logM} onChange={e => setLogM(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {[0.1, 0.5, 1, 2, 5, 10, 25, 60].map(m => (
          <button
            key={m}
            onClick={() => setLogM(Math.log10(m))}
            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {fmt(m, 1)} M☉
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Масата се променя 750 пъти от най-малките до най-големите звезди, а светимостта – над 10¹⁰ пъти. Масивната звезда има повече
        гориво, но го изгаря несравнимо по-бързо: налягането и температурата в ядрото ѝ са много по-високи, а скоростта на синтеза
        расте стръмно с температурата.
      </p>
    </div>
  );
}

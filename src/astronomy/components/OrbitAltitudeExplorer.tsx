import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { formatDuration } from './earthMath';
import { useAnimationFrame } from './useAnimationFrame';

const GM = 398_600; // km³/s²
const R = 6371; // km
const MAX_RATIO = 62; // до Луната

const C = 210;
const EARTH_PX = 34;
const MAX_PX = 195;

const ORBITS = [
  { label: 'МКС', km: 408, color: 'rgb(147, 197, 253)' },
  { label: 'Хъбъл', km: 540, color: 'rgb(196, 181, 253)' },
  { label: 'GPS', km: 20_200, color: 'rgb(134, 239, 172)' },
  { label: 'Геостационарна', km: 35_786, color: 'rgb(253, 224, 71)' },
  { label: 'Луната', km: 378_000, color: 'rgb(203, 213, 225)' },
];

/** Логаритмичен мащаб на разстоянието, за да се поберат всички орбити. */
const radiusPx = (km: number) =>
  EARTH_PX +
  ((MAX_PX - EARTH_PX) * Math.log10((R + km) / R)) / Math.log10(MAX_RATIO);

export default function OrbitAltitudeExplorer() {
  const [altitude, setAltitude] = useState(408);
  const [hours, setHours] = useState(0);
  const [playing, setPlaying] = useState(true);

  useAnimationFrame(playing, dt => setHours(h => h + dt * 0.5));

  const r = R + altitude;
  const v = Math.sqrt(GM / r);
  const period = (2 * Math.PI * r) / v / 3600; // часове
  const escape = Math.sqrt(2) * v;
  const angle = (2 * Math.PI * hours) / period;
  const px = radiusPx(altitude);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Орбити на различни височини
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Колкото по-високо е спътникът, толкова по-бавно се движи и толкова
        по-дълго обикаля. 1 секунда на екрана = 30 минути.
      </p>

      <div className="grid md:grid-cols-[1fr_240px] gap-4 items-center">
        <svg
          viewBox="0 0 420 420"
          className="w-full h-auto max-w-[420px] mx-auto rounded-lg bg-slate-900"
        >
          <circle cx={C} cy={C} r={EARTH_PX} fill="rgb(37, 99, 235)" />
          {ORBITS.map((o, i) => (
            <g key={o.label}>
              <circle
                cx={C}
                cy={C}
                r={radiusPx(o.km)}
                fill="none"
                stroke={o.color}
                strokeOpacity="0.35"
                strokeDasharray="3,4"
              />
              <text
                x={C + 4}
                y={i === 1 ? C + radiusPx(o.km) + 11 : C - radiusPx(o.km) - 3}
                fontSize="10"
                fill={o.color}
                opacity="0.8"
              >
                {o.label}
              </text>
            </g>
          ))}
          <circle
            cx={C}
            cy={C}
            r={px}
            fill="none"
            stroke="rgb(168, 85, 247)"
            strokeWidth="2"
          />
          <circle
            cx={C + px * Math.cos(angle)}
            cy={C - px * Math.sin(angle)}
            r="6"
            fill="white"
            stroke="rgb(168, 85, 247)"
            strokeWidth="2"
          />
          <text x="8" y="412" fontSize="10" fill="white" opacity="0.6">
            Логаритмичен мащаб на разстоянията · {formatDuration(hours)}{' '}
            изминали
          </text>
        </svg>

        <div className="space-y-2 text-sm">
          {[
            {
              label: 'Радиус на орбитата',
              value: `${Math.round(r).toLocaleString('bg-BG')} km`,
            },
            {
              label: 'Орбитална скорост v = √(GM/r)',
              value: `${v.toFixed(2).replace('.', ',')} km/s`,
            },
            { label: 'Период T = 2πr / v', value: formatDuration(period) },
            {
              label: 'Обиколки за денонощие',
              value: (24 / period).toFixed(2).replace('.', ','),
            },
            {
              label: 'Скорост за бягство √2·v',
              value: `${escape.toFixed(2).replace('.', ',')} km/s`,
            },
          ].map(s => (
            <div
              key={s.label}
              className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg"
            >
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {s.label}
              </div>
              <div className="font-mono font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">
          Височина над Земята: {altitude.toLocaleString('bg-BG')} km
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="p-1.5 rounded bg-blue-500 text-white hover:bg-blue-600"
            aria-label={playing ? 'Пауза' : 'Пусни'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <input
            type="range"
            min="2"
            max="5.6"
            step="0.001"
            value={Math.log10(altitude)}
            onChange={e =>
              setAltitude(Math.round(10 ** Number(e.target.value)))
            }
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {ORBITS.map(o => (
            <button
              key={o.label}
              onClick={() => setAltitude(o.km)}
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

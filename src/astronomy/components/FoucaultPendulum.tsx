import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { formatDuration, SIDEREAL_DAY_HOURS } from './earthMath';
import { DEG } from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';

const C = 130;
const FLOOR_R = 110;
const AMPLITUDE = 95;
const SWING_SECONDS = 1.6;
const HOURS_PER_SECOND = 1.5;

const LOCATIONS = [
  { label: '🇫🇷 Париж (1851)', latitude: 48.85 },
  { label: '🇧🇬 София', latitude: 42.7 },
  { label: '🧭 Полюс', latitude: 90 },
  { label: '🌍 Екватор', latitude: 0 },
];

export default function FoucaultPendulum() {
  const [latitude, setLatitude] = useState(48.85);
  const [hours, setHours] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);

  useAnimationFrame(playing, dt => {
    setHours(h => h + dt * HOURS_PER_SECOND);
    setPhase(p => p + dt / SWING_SECONDS);
  });

  const rate = (360 / SIDEREAL_DAY_HOURS) * Math.sin(latitude * DEG); // °/h
  // В северното полукълбо равнината се върти по часовниковата стрелка
  const planeAngle = -rate * hours;
  const period = Math.abs(rate) < 1e-6 ? Infinity : 360 / Math.abs(rate);

  const dir = (angle: number) => ({
    x: Math.cos(angle * DEG),
    y: -Math.sin(angle * DEG),
  });
  const d = dir(planeAngle);
  const swing = AMPLITUDE * Math.sin(phase * 2 * Math.PI);
  const bob = { x: C + d.x * swing, y: C + d.y * swing };

  // Следи от предишните люлеения – по една на всеки половин час
  const traces = Array.from(
    { length: Math.min(Math.floor(hours * 2), 200) },
    (_, i) => dir(-rate * (i / 2))
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Махалото на Фуко</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Поглед отгоре. Махалото се люлее в неподвижна равнина, а подът се върти
        заедно със Земята под него.
      </p>

      <div className="grid sm:grid-cols-[260px_1fr] gap-4 items-center">
        <svg
          viewBox="0 0 260 260"
          className="w-full h-auto max-w-[260px] mx-auto"
        >
          <circle
            cx={C}
            cy={C}
            r={FLOOR_R + 8}
            fill="rgba(14, 165, 233, 0.08)"
            stroke="rgb(14, 165, 233)"
            strokeWidth="2"
          />
          {Array.from({ length: 24 }, (_, i) => {
            const p = dir(i * 15);
            return (
              <line
                key={i}
                x1={C + p.x * FLOOR_R}
                y1={C + p.y * FLOOR_R}
                x2={C + p.x * (FLOOR_R + 8)}
                y2={C + p.y * (FLOOR_R + 8)}
                stroke="rgb(14, 165, 233)"
                strokeWidth={i % 6 === 0 ? 2 : 1}
              />
            );
          })}
          {traces.map((t, i) => (
            <line
              key={i}
              x1={C - t.x * AMPLITUDE}
              y1={C - t.y * AMPLITUDE}
              x2={C + t.x * AMPLITUDE}
              y2={C + t.y * AMPLITUDE}
              stroke="rgb(14, 165, 233)"
              strokeOpacity="0.2"
            />
          ))}
          <line
            x1={C - d.x * AMPLITUDE}
            y1={C - d.y * AMPLITUDE}
            x2={C + d.x * AMPLITUDE}
            y2={C + d.y * AMPLITUDE}
            stroke="rgb(239, 68, 68)"
            strokeDasharray="4,4"
          />
          <line
            x1={C}
            y1={C}
            x2={bob.x}
            y2={bob.y}
            stroke="rgb(100, 116, 139)"
            strokeWidth="1.5"
          />
          <circle
            cx={bob.x}
            cy={bob.y}
            r="9"
            fill="rgb(234, 179, 8)"
            stroke="white"
            strokeWidth="2"
          />
          <circle cx={C} cy={C} r="3" fill="rgb(100, 116, 139)" />
          <text
            x={C}
            y="12"
            fontSize="11"
            textAnchor="middle"
            className="fill-gray-600 dark:fill-gray-300"
          >
            С
          </text>
        </svg>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Географска ширина: {latitude.toFixed(1)}°
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="0.1"
              value={latitude}
              onChange={e => {
                setLatitude(Number(e.target.value));
                setHours(0);
              }}
              className="w-full"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {LOCATIONS.map(l => (
                <button
                  key={l.label}
                  onClick={() => {
                    setLatitude(l.latitude);
                    setHours(0);
                  }}
                  className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-sky-50 dark:hover:bg-gray-700"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPlaying(p => !p)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-sky-500 text-white hover:bg-sky-600 text-sm"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Пауза' : 'Пусни'}
            </button>
            <button
              onClick={() => setHours(0)}
              className="flex items-center gap-1 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RotateCcw size={14} /> Отначало
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Изминало време
              </div>
              <div className="font-mono font-bold">{formatDuration(hours)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Пълен оборот на равнината
              </div>
              <div className="font-mono font-bold">
                {Number.isFinite(period) ? formatDuration(period) : 'никога'}
              </div>
            </div>
          </div>
          <p className="text-sm font-mono text-center bg-sky-50 dark:bg-sky-900/20 p-2 rounded">
            T = 23h 56m / sin φ
          </p>
        </div>
      </div>
    </div>
  );
}

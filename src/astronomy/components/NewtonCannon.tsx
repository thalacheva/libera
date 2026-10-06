import { Play, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAnimationFrame } from './useAnimationFrame';

const GM = 398_600; // km³/s²
const R = 6371; // km
const MOUNTAIN = 300; // km – въображаема планина над атмосферата
const DT = 4; // s
const MAX_STEPS = 12_000;
const VIEW_LIMIT = 7 * R;

const CX = 300;
const CY = 60;
const SCALE = 40 / R; // px на km

const PRESETS = [
  { label: '4 km/s', v: 4 },
  { label: '7,7 km/s (кръгова)', v: 7.73 },
  { label: '9,5 km/s', v: 9.5 },
  { label: '10,9 km/s (бягство)', v: 10.92 },
];

type Result = 'crash' | 'orbit' | 'escape';

/** Числено интегриране (метод на скачащата жаба) на полета на снаряда. */
function simulate(speed: number) {
  let x = 0;
  let y = R + MOUNTAIN;
  let vx = speed;
  let vy = 0;
  const accel = (px: number, py: number) => {
    const r3 = Math.hypot(px, py) ** 3;
    return [(-GM * px) / r3, (-GM * py) / r3];
  };
  let [ax, ay] = accel(x, y);
  const points: [number, number][] = [[x, y]];
  let angle = 0;
  let prevAngle = Math.atan2(y, x);
  let result: Result = 'orbit';

  for (let i = 0; i < MAX_STEPS; i++) {
    vx += 0.5 * ax * DT;
    vy += 0.5 * ay * DT;
    x += vx * DT;
    y += vy * DT;
    [ax, ay] = accel(x, y);
    vx += 0.5 * ax * DT;
    vy += 0.5 * ay * DT;
    points.push([x, y]);

    const r = Math.hypot(x, y);
    if (r < R) {
      result = 'crash';
      break;
    }
    if (r > VIEW_LIMIT) {
      result = 'escape';
      break;
    }
    const a = Math.atan2(y, x);
    let delta = a - prevAngle;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    angle += Math.abs(delta);
    prevAngle = a;
    if (angle >= 2 * Math.PI) break;
  }
  return { points, result };
}

export default function NewtonCannon() {
  const [speed, setSpeed] = useState(7.73);
  const [progress, setProgress] = useState(1);
  const [firing, setFiring] = useState(false);

  const { points, result } = useMemo(() => simulate(speed), [speed]);

  useAnimationFrame(firing, dt => {
    const next = progress + dt * 0.35;
    if (next >= 1) {
      setProgress(1);
      setFiring(false);
    } else {
      setProgress(next);
    }
  });

  const fire = () => {
    setProgress(0);
    setFiring(true);
  };

  const shown = points.slice(
    0,
    Math.max(2, Math.ceil(points.length * progress))
  );
  const earthCy = CY + R * SCALE + 80;
  const toScreen = ([x, y]: [number, number]) =>
    `${CX + x * SCALE},${earthCy - y * SCALE}`;
  const ball = shown[shown.length - 1];

  const circular = Math.sqrt(GM / (R + MOUNTAIN));
  const escape = Math.sqrt((2 * GM) / (R + MOUNTAIN));

  const message =
    result === 'crash'
      ? '💥 Снарядът пада обратно на Земята'
      : result === 'escape'
        ? '🚀 Снарядът напуска Земята завинаги'
        : Math.abs(speed - circular) < 0.08
          ? '🛰️ Кръгова орбита – снарядът пада, но Земята се „извива“ под него'
          : '🛰️ Елиптична орбита – снарядът се връща в същата точка';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-violet-300 dark:border-violet-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Топът на Нютон</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Нютон си представил топ на връх, по-висок от атмосферата. С каква
        скорост трябва да изстреля гюлето, за да не падне никога?
      </p>

      <svg
        viewBox="0 0 600 400"
        className="w-full h-auto max-h-[400px] rounded-lg bg-slate-900"
      >
        <circle cx={CX} cy={earthCy} r={R * SCALE} fill="rgb(37, 99, 235)" />
        <circle
          cx={CX}
          cy={earthCy}
          r={(R + 100) * SCALE}
          fill="none"
          stroke="rgb(147, 197, 253)"
          strokeOpacity="0.3"
        />
        {/* Планината */}
        <path
          d={`M ${CX - 14},${earthCy - R * SCALE + 2} L ${CX},${earthCy - (R + MOUNTAIN) * SCALE} L ${CX + 14},${earthCy - R * SCALE + 2} Z`}
          fill="rgb(120, 113, 108)"
        />
        <polyline
          points={shown.map(toScreen).join(' ')}
          fill="none"
          stroke="rgb(250, 204, 21)"
          strokeWidth="2"
        />
        {ball && (
          <circle
            cx={CX + ball[0] * SCALE}
            cy={earthCy - ball[1] * SCALE}
            r="5"
            fill="rgb(250, 204, 21)"
            stroke="white"
          />
        )}
        <text x="12" y="22" fontSize="13" fill="white" opacity="0.85">
          v = {speed.toFixed(2).replace('.', ',')} km/s
        </text>
        <text x="12" y="388" fontSize="13" fill="white">
          {progress >= 1 ? message : '…'}
        </text>
      </svg>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">
          Начална скорост: {speed.toFixed(2).replace('.', ',')} km/s
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={fire}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-violet-500 text-white hover:bg-violet-600 text-sm"
          >
            <Play size={14} /> Огън!
          </button>
          <input
            type="range"
            min="1"
            max="12"
            step="0.01"
            value={speed}
            onChange={e => {
              setSpeed(Number(e.target.value));
              setProgress(1);
              setFiring(false);
            }}
            className="w-full"
          />
          <button
            onClick={() => setProgress(1)}
            title="Покажи целия път"
            className="p-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => {
                setSpeed(p.v);
                setProgress(0);
                setFiring(true);
              }}
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-violet-50 dark:hover:bg-gray-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm mt-3 bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg">
        На височина {MOUNTAIN} km кръговата скорост е v₁ = √(GM / r) ≈{' '}
        {circular.toFixed(2).replace('.', ',')} km/s, а скоростта за бягство е
        v₂ = √2 · v₁ ≈ {escape.toFixed(2).replace('.', ',')} km/s. Повече за тях
        – в Лекция 8.
      </p>
    </div>
  );
}

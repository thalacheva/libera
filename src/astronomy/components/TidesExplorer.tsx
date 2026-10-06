import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { SYNODIC_MONTH } from './MoonPhases';
import { DEG } from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';

// Приливното действие на Слънцето е 0,46 от това на Луната
const SUN_RATIO = 0.46;

const CX = 230;
const CY = 190;
const EARTH_R = 80;
const MOON_ORBIT = 165;
const BULGE = 22; // увеличение на издутините, за да се виждат
const ARROW = 22;

/** Приливно ускорение в точка с единичен вектор p от тяло в посока m. */
function tidal(p: [number, number], m: [number, number], k: number) {
  const c = p[0] * m[0] + p[1] * m[1];
  return [k * (3 * c * m[0] - p[0]), k * (3 * c * m[1] - p[1])];
}

export default function TidesExplorer() {
  const [age, setAge] = useState(0);
  const [showSun, setShowSun] = useState(true);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt => setAge(a => (a + dt * 2) % SYNODIC_MONTH));

  const psi = (age / SYNODIC_MONTH) * 2 * Math.PI;
  const moonAngle = Math.PI + psi; // Слънцето е вляво (ъгъл π)
  const moonDir: [number, number] = [Math.cos(moonAngle), Math.sin(moonAngle)];
  const sunDir: [number, number] = [-1, 0];
  const sunK = showSun ? SUN_RATIO : 0;

  // Издутината: h(θ) ∝ cos 2(θ − θ☾) + 0,46 cos 2(θ − θ☉)
  const height = (theta: number) =>
    Math.cos(2 * (theta - moonAngle)) + sunK * Math.cos(2 * (theta - Math.PI));
  const outline = Array.from({ length: 181 }, (_, i) => {
    const t = (i / 180) * 2 * Math.PI;
    const r = EARTH_R + (BULGE / (1 + SUN_RATIO)) * height(t);
    return `${CX + r * Math.cos(t)},${CY - r * Math.sin(t)}`;
  }).join(' ');

  const amplitude = Math.sqrt(1 + sunK ** 2 + 2 * sunK * Math.cos(2 * psi));
  const maxAmplitude = 1 + SUN_RATIO;
  const kind = !showSun
    ? 'Само Луната'
    : amplitude > 1.35
      ? '🌊 Сизигиен прилив (най-силен)'
      : amplitude < 0.65
        ? '〰️ Квадратурен прилив (най-слаб)'
        : 'Междинен прилив';

  const moon = {
    x: CX + MOON_ORBIT * moonDir[0],
    y: CY - MOON_ORBIT * moonDir[1],
  };

  const arrows = Array.from({ length: 12 }, (_, i) => {
    const t = (i / 12) * 2 * Math.PI;
    const p: [number, number] = [Math.cos(t), Math.sin(t)];
    const [mx, my] = tidal(p, moonDir, 1);
    const [sx, sy] = tidal(p, sunDir, sunK);
    const fx = mx + sx;
    const fy = my + sy;
    const base = {
      x: CX + EARTH_R * 0.62 * p[0],
      y: CY - EARTH_R * 0.62 * p[1],
    };
    return {
      key: i,
      x1: base.x,
      y1: base.y,
      x2: base.x + (ARROW / (1 + SUN_RATIO)) * fx,
      y2: base.y - (ARROW / (1 + SUN_RATIO)) * fy,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-cyan-300 dark:border-cyan-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Приливи и отливи</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изглед от север. Стрелките показват приливната сила – разликата между
        привличането в дадена точка и в центъра на Земята.
      </p>

      <svg viewBox="0 0 460 380" className="w-full h-auto max-h-[380px]">
        <defs>
          <marker
            id="tide-arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 z" fill="rgb(239, 68, 68)" />
          </marker>
        </defs>
        {[-70, -35, 0, 35, 70].map(o => (
          <line
            key={o}
            x1="0"
            x2="28"
            y1={CY + o}
            y2={CY + o}
            stroke="rgb(251, 191, 36)"
            strokeWidth="2"
            opacity={showSun ? 0.7 : 0.2}
          />
        ))}
        <text
          x="4"
          y={CY - 85}
          fontSize="12"
          fontWeight="bold"
          fill="rgb(217, 119, 6)"
          opacity={showSun ? 1 : 0.4}
        >
          ☀️ Слънце
        </text>
        <circle
          cx={CX}
          cy={CY}
          r={MOON_ORBIT}
          fill="none"
          stroke="rgb(148, 163, 184)"
          strokeDasharray="4,4"
        />

        {/* Океанът с издутините (силно преувеличени) */}
        <polygon points={outline} fill="rgb(56, 189, 248)" opacity="0.55" />
        <circle
          cx={CX}
          cy={CY}
          r={EARTH_R * 0.85}
          fill="rgb(22, 101, 52)"
          opacity="0.85"
        />
        {arrows.map(a => (
          <line
            key={a.key}
            x1={a.x1}
            y1={a.y1}
            x2={a.x2}
            y2={a.y2}
            stroke="rgb(239, 68, 68)"
            strokeWidth="2"
            markerEnd="url(#tide-arrow)"
          />
        ))}
        <circle
          cx={moon.x}
          cy={moon.y}
          r="12"
          fill="rgb(203, 213, 225)"
          stroke="rgb(100, 116, 139)"
        />
        <text
          x={moon.x}
          y={moon.y + 28}
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          Луна
        </text>
      </svg>

      <div className="mt-3">
        <label className="block text-sm font-semibold mb-1">
          Възраст на Луната: {age.toFixed(1).replace('.', ',')} дни
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="p-1.5 rounded bg-cyan-600 text-white hover:bg-cyan-700"
            aria-label={playing ? 'Пауза' : 'Пусни'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <input
            type="range"
            min="0"
            max={SYNODIC_MONTH}
            step="0.05"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {[
            { label: '🌑 Новолуние', a: 0 },
            { label: '🌓 Първа четвърт', a: SYNODIC_MONTH / 4 },
            { label: '🌕 Пълнолуние', a: SYNODIC_MONTH / 2 },
            { label: '🌗 Последна четвърт', a: (3 * SYNODIC_MONTH) / 4 },
          ].map(b => (
            <button
              key={b.label}
              onClick={() => setAge(b.a)}
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-gray-700"
            >
              {b.label}
            </button>
          ))}
          <label className="flex items-center gap-1 text-xs ml-2">
            <input
              type="checkbox"
              checked={showSun}
              onChange={e => setShowSun(e.target.checked)}
            />
            Включи действието на Слънцето
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm font-semibold w-48">{kind}</span>
        <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-300 to-blue-600"
            style={{ width: `${(amplitude / maxAmplitude) * 100}%` }}
          />
        </div>
        <span className="font-mono text-sm w-24 text-right">
          {((amplitude / maxAmplitude) * 100).toFixed(0)}%
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Височината на издутините е увеличена хиляди пъти: в открития океан
        приливът е около 0,5 m. Ъгълът между Луната и Слънцето е{' '}
        {((psi / DEG) % 180).toFixed(0)}° (по модул 180°).
      </p>
    </div>
  );
}

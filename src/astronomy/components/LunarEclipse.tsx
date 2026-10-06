import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { formatDuration } from './earthMath';
import { DEG } from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';

// Всички ъгли са в дъгови минути
const SUN_PARALLAX = 0.15;
const SUN_RADIUS = 16;
const ATMOSPHERE = 1.02; // атмосферата разширява сянката с ~2%
const INCLINATION = 5.145; // наклон на лунната орбита, градуси

const DISTANCES = {
  perigee: {
    label: 'Перигей',
    km: 363_300,
    parallax: 61.4,
    radius: 16.7,
    speed: 34.4,
  },
  mean: {
    label: 'Средно',
    km: 384_400,
    parallax: 57.0,
    radius: 15.5,
    speed: 30.5,
  },
  apogee: {
    label: 'Апогей',
    km: 405_500,
    parallax: 54.0,
    radius: 14.7,
    speed: 27.1,
  },
};
type DistanceKey = keyof typeof DISTANCES;

const W = 600;
const H = 380;
const C = { x: 300, y: 190 };
const SCALE = 1.8; // px на дъгова минута

type Kind = 'total' | 'partial' | 'penumbral' | 'none';

const KIND_LABELS: Record<Kind, string> = {
  total: 'Пълно затъмнение',
  partial: 'Частично затъмнение',
  penumbral: 'Полусянково затъмнение',
  none: 'Няма затъмнение',
};

export default function LunarEclipse() {
  const [nodeDistance, setNodeDistance] = useState(3);
  const [distance, setDistance] = useState<DistanceKey>('mean');
  const [time, setTime] = useState(-2.5);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt =>
    setTime(t => (t + dt * 0.5 > 3 ? -3 : t + dt * 0.5))
  );

  const moonData = DISTANCES[distance];
  const umbra = ATMOSPHERE * (moonData.parallax + SUN_PARALLAX - SUN_RADIUS);
  const penumbra = ATMOSPHERE * (moonData.parallax + SUN_PARALLAX + SUN_RADIUS);
  const r = moonData.radius;
  const beta = INCLINATION * 60 * Math.sin(nodeDistance * DEG);
  const b = Math.abs(beta);

  const kind: Kind =
    b <= umbra - r
      ? 'total'
      : b < umbra + r
        ? 'partial'
        : b < penumbra + r
          ? 'penumbral'
          : 'none';

  const chord = (radius: number) =>
    radius > b ? (2 * Math.sqrt(radius ** 2 - b ** 2)) / moonData.speed : 0;
  const totality = chord(umbra - r);
  const umbral = chord(umbra + r);

  // Луната се движи на изток – наляво, когато гледаме на юг
  const mx = -moonData.speed * time;
  const d = Math.hypot(mx, beta);
  const stage =
    d <= umbra - r
      ? 'Луната е изцяло в сянката – пълна фаза'
      : d < umbra + r
        ? 'Луната навлиза в сянката – частична фаза'
        : d < penumbra + r
          ? 'Луната е в полусянката – едва забележимо потъмняване'
          : 'Луната е извън сянката';

  const moon = { x: C.x + mx * SCALE, y: C.y - beta * SCALE };
  const depth = Math.max(0, Math.min(1, (umbra - d) / umbra));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Симулатор на лунно затъмнение
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Сянката на Земята, както я „вижда“ Луната, в истински мащаб.
      </p>

      {/* Геометрия на сянката */}
      <svg viewBox="0 0 600 200" className="w-full h-auto mb-2">
        <path
          d="M 260,86 L 400,100 L 260,114 Z"
          fill="rgb(15, 23, 42)"
          opacity="0.75"
        />
        <path
          d="M 260,86 L 560,18 L 560,182 L 260,114 Z"
          fill="rgb(15, 23, 42)"
          opacity="0.15"
        />
        {[
          [40, 64, 400, 100],
          [40, 136, 400, 100],
          [40, 64, 560, 182],
          [40, 136, 560, 18],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgb(148, 163, 184)"
            strokeDasharray="3,3"
          />
        ))}
        <circle cx="40" cy="100" r="36" fill="rgb(251, 191, 36)" />
        <circle cx="260" cy="100" r="14" fill="rgb(59, 130, 246)" />
        <circle cx="340" cy="100" r="5" fill="rgb(185, 28, 28)" />
        <text
          x="40"
          y="160"
          fontSize="12"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          Слънце
        </text>
        <text
          x="260"
          y="80"
          fontSize="12"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          Земя
        </text>
        <text
          x="342"
          y="125"
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-700 dark:fill-gray-200"
        >
          сянка
        </text>
        <text
          x="500"
          y="40"
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          полусянка
        </text>
        <text
          x="300"
          y="196"
          fontSize="10"
          textAnchor="middle"
          className="fill-gray-500 dark:fill-gray-400"
        >
          Схема, не в мащаб: сянката се стеснява, защото Слънцето е по-голямо от
          Земята
        </text>
      </svg>

      {/* Изглед към сянката */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto rounded-lg bg-slate-900"
      >
        <defs>
          <clipPath id="eclipse-moon">
            <circle cx={moon.x} cy={moon.y} r={r * SCALE} />
          </clipPath>
          <radialGradient id="eclipse-umbra">
            <stop offset="0%" stopColor="rgb(80, 15, 5)" />
            <stop offset="100%" stopColor="rgb(150, 45, 15)" />
          </radialGradient>
        </defs>

        <line
          x1="0"
          x2={W}
          y1={C.y}
          y2={C.y}
          stroke="rgb(251, 191, 36)"
          strokeOpacity="0.35"
          strokeDasharray="6,6"
        />
        <text
          x="8"
          y={C.y - 6}
          fontSize="11"
          fill="rgb(251, 191, 36)"
          opacity="0.7"
        >
          еклиптика
        </text>
        <line
          x1="0"
          x2={W}
          y1={C.y - beta * SCALE}
          y2={C.y - beta * SCALE}
          stroke="rgb(148, 163, 184)"
          strokeOpacity="0.4"
          strokeDasharray="2,5"
        />
        <text
          x={W - 8}
          y={C.y - beta * SCALE - 6}
          fontSize="11"
          fill="rgb(203, 213, 225)"
          opacity="0.7"
          textAnchor="end"
        >
          път на Луната
        </text>

        <circle
          cx={C.x}
          cy={C.y}
          r={penumbra * SCALE}
          fill="white"
          fillOpacity="0.04"
          stroke="white"
          strokeOpacity="0.25"
          strokeDasharray="4,4"
        />
        <circle
          cx={C.x}
          cy={C.y}
          r={umbra * SCALE}
          fill="black"
          fillOpacity="0.35"
          stroke="rgb(248, 113, 113)"
          strokeOpacity="0.5"
          strokeDasharray="4,4"
        />
        <text
          x={C.x}
          y={C.y - penumbra * SCALE + 14}
          fontSize="11"
          fill="white"
          opacity="0.5"
          textAnchor="middle"
        >
          полусянка
        </text>
        <text
          x={C.x}
          y={C.y + umbra * SCALE - 8}
          fontSize="11"
          fill="rgb(248, 113, 113)"
          opacity="0.7"
          textAnchor="middle"
        >
          сянка
        </text>

        {/* Луната, оцветена според това в коя част на сянката е */}
        <g clipPath="url(#eclipse-moon)">
          <rect width={W} height={H} fill="rgb(226, 232, 240)" />
          <circle
            cx={C.x}
            cy={C.y}
            r={penumbra * SCALE}
            fill="black"
            opacity="0.3"
          />
          <circle
            cx={C.x}
            cy={C.y}
            r={umbra * SCALE}
            fill="url(#eclipse-umbra)"
            opacity={0.85 + depth * 0.15}
          />
        </g>

        <text x="8" y={H - 10} fontSize="11" fill="white" opacity="0.6">
          ← изток · Луната се движи на изток · запад →
        </text>
      </svg>

      <p className="text-center mt-2 font-semibold">{stage}</p>

      {/* Контроли */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Разстояние на пълнолунието от възела: {nodeDistance.toFixed(1)}°
          </label>
          <input
            type="range"
            min="-18"
            max="18"
            step="0.1"
            value={nodeDistance}
            onChange={e => setNodeDistance(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Еклиптична ширина на Луната: β = {(beta / 60).toFixed(2)}° ={' '}
            {beta.toFixed(0)}′
          </p>
          <div className="flex gap-1 mt-2">
            {(Object.keys(DISTANCES) as DistanceKey[]).map(key => (
              <button
                key={key}
                onClick={() => setDistance(key)}
                className={`px-2 py-0.5 rounded text-xs border ${
                  distance === key
                    ? 'bg-red-500 text-white border-red-500'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-gray-700'
                }`}
              >
                Луната в {DISTANCES[key].label.toLowerCase()} (
                {DISTANCES[key].km.toLocaleString('bg-BG')} km)
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Време спрямо максималната фаза: {time >= 0 ? '+' : '−'}
            {formatDuration(Math.abs(time))}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(p => !p)}
              className="p-1.5 rounded bg-red-500 text-white hover:bg-red-600"
              aria-label={playing ? 'Пауза' : 'Пусни'}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.01"
              value={time}
              onChange={e => setTime(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Вид</div>
          <div className="font-bold">{KIND_LABELS[kind]}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Пълна фаза
          </div>
          <div className="font-mono font-bold">
            {totality > 0 ? formatDuration(totality) : '—'}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            В сянката общо
          </div>
          <div className="font-mono font-bold">
            {umbral > 0 ? formatDuration(umbral) : '—'}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Радиус на сянката
          </div>
          <div className="font-mono font-bold">
            {umbra.toFixed(0)}′ ≈ {(umbra / r).toFixed(1)} лунни радиуса
          </div>
        </div>
      </div>

      <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg text-sm">
        <strong>🎯 Опитайте:</strong> намерете най-голямото разстояние от
        възела, при което затъмнението още е пълно. После сменете на апогей и
        проверете кога пълната фаза е най-дълга.
      </div>
    </div>
  );
}

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { useAnimationFrame } from './useAnimationFrame';

const SUN_RADIUS_KM = 696_000;
const MOON_RADIUS_KM = 1737.4;
const EARTH_RADIUS_KM = 6371;
const ARCMIN = Math.PI / (180 * 60);
const RELATIVE_SPEED = 30; // дъгови минути на час – Луната спрямо Слънцето

const EARTH_DISTANCES = [
  { label: 'Януари (перихелий)', km: 147.1e6 },
  { label: 'Юли (афелий)', km: 152.1e6 },
];

type Kind = 'total' | 'annular' | 'partial' | 'none';

const KIND_LABELS: Record<Kind, string> = {
  total: 'Пълно',
  annular: 'Пръстеновидно',
  partial: 'Частично',
  none: 'Няма затъмнение',
};

/** Площ на сечението на два кръга с радиуси R и r и разстояние d. */
function overlapArea(R: number, r: number, d: number) {
  if (d >= R + r) return 0;
  if (d <= Math.abs(R - r)) return Math.PI * Math.min(R, r) ** 2;
  const a = r * r * Math.acos((d * d + r * r - R * R) / (2 * d * r));
  const b = R * R * Math.acos((d * d + R * R - r * r) / (2 * d * R));
  const c =
    0.5 * Math.sqrt((-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R));
  return a + b - c;
}

export default function SolarEclipse() {
  const [moonDistance, setMoonDistance] = useState(370_000);
  const [earthIndex, setEarthIndex] = useState(1);
  const [offset, setOffset] = useState(0);
  const [time, setTime] = useState(-0.6);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt =>
    setTime(t => (t + dt * 0.12 > 1.2 ? -1.2 : t + dt * 0.12))
  );

  const sunDistance = EARTH_DISTANCES[earthIndex].km;
  // Наблюдателят е под Луната – тя е по-близо с един земен радиус
  const topocentric = moonDistance - EARTH_RADIUS_KM;
  const sunR = Math.asin(SUN_RADIUS_KM / sunDistance) / ARCMIN;
  const moonR = Math.asin(MOON_RADIUS_KM / topocentric) / ARCMIN;

  // Дължина на конуса на пълната сянка
  const umbraLength =
    ((sunDistance - moonDistance) * MOON_RADIUS_KM) /
    (SUN_RADIUS_KM - MOON_RADIUS_KM);
  const reaches = umbraLength >= topocentric;
  const halfAngle = (SUN_RADIUS_KM - MOON_RADIUS_KM) / sunDistance;
  const spotWidth = 2 * Math.abs(umbraLength - topocentric) * halfAngle;

  // Изглед от Земята
  const mx = -RELATIVE_SPEED * time;
  const d = Math.hypot(mx, offset);
  const kind: Kind =
    d >= sunR + moonR
      ? 'none'
      : d <= Math.abs(moonR - sunR)
        ? moonR >= sunR
          ? 'total'
          : 'annular'
        : 'partial';
  const magnitude = Math.max(0, (sunR + moonR - d) / (2 * sunR));
  const obscuration = overlapArea(sunR, moonR, d) / (Math.PI * sunR * sunR);
  const darkness = Math.max(0, (obscuration - 0.85) / 0.15);

  // Най-доброто възможно за този ден (Луната минава през центъра)
  const centralKind: Kind =
    Math.abs(offset) >= sunR + moonR
      ? 'none'
      : Math.abs(offset) <= Math.abs(moonR - sunR)
        ? moonR >= sunR
          ? 'total'
          : 'annular'
        : 'partial';

  const SCALE = 4.2; // px на дъгова минута
  const C = { x: 300, y: 170 };

  // Странична схема: хоризонтален мащаб в km, вертикалът е разтегнат
  const sx = (km: number) => 70 + km * 0.00125;
  const vy = 0.018;
  const coneTip = sx(Math.min(umbraLength, 440_000));
  const earthSurface = sx(topocentric);

  const skyColor = `rgb(${Math.round(56 - 50 * darkness)}, ${Math.round(
    130 - 118 * darkness
  )}, ${Math.round(220 - 190 * darkness)})`;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Симулатор на слънчево затъмнение
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Променете разстоянието до Луната и вижте дали пълната ѝ сянка стига до
        Земята.
      </p>

      {/* Странична схема */}
      <svg viewBox="0 0 640 170" className="w-full h-auto mb-2">
        <text
          x="6"
          y="16"
          fontSize="11"
          className="fill-gray-500 dark:fill-gray-400"
        >
          ☀️ ← към Слънцето
        </text>
        {/* Полусянка */}
        <path
          d={`M ${sx(0)},${85 - MOON_RADIUS_KM * vy} L 640,${85 - MOON_RADIUS_KM * vy - (640 - sx(0)) * 0.12} L 640,${85 + MOON_RADIUS_KM * vy + (640 - sx(0)) * 0.12} L ${sx(0)},${85 + MOON_RADIUS_KM * vy} Z`}
          fill="rgb(15, 23, 42)"
          opacity="0.08"
        />
        {/* Пълна сянка */}
        <path
          d={`M ${sx(0)},${85 - MOON_RADIUS_KM * vy} L ${coneTip},85 L ${sx(0)},${85 + MOON_RADIUS_KM * vy} Z`}
          fill="rgb(15, 23, 42)"
          opacity="0.75"
        />
        {!reaches && (
          <path
            d={`M ${coneTip},85 L ${earthSurface},${85 - spotWidth * vy * 0.5 - 2} L ${earthSurface},${85 + spotWidth * vy * 0.5 + 2} Z`}
            fill="rgb(100, 116, 139)"
            opacity="0.5"
          />
        )}
        <circle
          cx={sx(0)}
          cy="85"
          r={MOON_RADIUS_KM * vy}
          fill="rgb(148, 163, 184)"
        />
        <text
          x={sx(0)}
          y="130"
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          Луна
        </text>
        {/* Повърхността на Земята */}
        <path
          d={`M ${earthSurface + 7},5 Q ${earthSurface - 7},85 ${earthSurface + 7},165 L 640,165 L 640,5 Z`}
          fill="rgb(59, 130, 246)"
          opacity="0.85"
        />
        <text x={earthSurface + 16} y="20" fontSize="11" fill="white">
          Земя
        </text>
        <circle cx={earthSurface} cy="85" r="3" fill="rgb(234, 179, 8)" />
        <text
          x={(sx(0) + earthSurface) / 2}
          y="160"
          fontSize="10"
          textAnchor="middle"
          className="fill-gray-500 dark:fill-gray-400"
        >
          {reaches
            ? 'Върхът на сянката е под повърхността → пълно затъмнение'
            : 'Сянката свършва преди Земята → пръстеновидно затъмнение'}
        </text>
      </svg>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
        Хоризонталният мащаб е верен; вертикалният е разтегнат, за да се вижда
        конусът.
      </p>

      {/* Изглед от Земята */}
      <svg
        viewBox="0 0 600 340"
        className="w-full h-auto rounded-lg"
        style={{ background: skyColor }}
      >
        <defs>
          <radialGradient id="corona">
            <stop offset="30%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <clipPath id="sun-disk">
            <circle cx={C.x} cy={C.y} r={sunR * SCALE} />
          </clipPath>
        </defs>
        {kind === 'total' && (
          <>
            <circle
              cx={C.x}
              cy={C.y}
              r={sunR * SCALE * 3}
              fill="url(#corona)"
              opacity="0.8"
            />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * 2 * Math.PI + 0.3;
              const len = sunR * SCALE * (2.2 + (i % 3) * 0.6);
              return (
                <line
                  key={i}
                  x1={C.x}
                  y1={C.y}
                  x2={C.x + len * Math.cos(a)}
                  y2={C.y + len * Math.sin(a)}
                  stroke="white"
                  strokeOpacity="0.1"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              );
            })}
          </>
        )}
        <circle cx={C.x} cy={C.y} r={sunR * SCALE} fill="rgb(253, 224, 71)" />
        <g clipPath="url(#sun-disk)">
          <circle
            cx={C.x}
            cy={C.y}
            r={sunR * SCALE}
            fill="rgb(251, 191, 36)"
            opacity="0.4"
          />
        </g>
        <circle
          cx={C.x + mx * SCALE}
          cy={C.y - offset * SCALE}
          r={moonR * SCALE}
          fill="rgb(15, 23, 42)"
        />
        {kind === 'total' && (
          <text
            x={C.x}
            y="325"
            fontSize="13"
            textAnchor="middle"
            fill="white"
            opacity="0.85"
          >
            Вижда се короната! Звездите и планетите изгряват посред бял ден.
          </text>
        )}
        <text x="10" y="20" fontSize="12" fill="white" opacity="0.8">
          Слънце: {(2 * sunR).toFixed(1)}′ · Луна: {(2 * moonR).toFixed(1)}′
        </text>
      </svg>

      {/* Контроли */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Разстояние Земя–Луна: {moonDistance.toLocaleString('bg-BG')} km
          </label>
          <input
            type="range"
            min="356500"
            max="406700"
            step="100"
            value={moonDistance}
            onChange={e => setMoonDistance(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>перигей</span>
            <span>апогей</span>
          </div>
          <div className="flex gap-1 mt-2">
            {EARTH_DISTANCES.map((e, i) => (
              <button
                key={e.label}
                onClick={() => setEarthIndex(i)}
                className={`px-2 py-0.5 rounded text-xs border ${
                  earthIndex === i
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-700'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Отместване от централната линия: {offset.toFixed(0)}′
          </label>
          <input
            type="range"
            min="0"
            max="34"
            step="0.5"
            value={offset}
            onChange={e => setOffset(Number(e.target.value))}
            className="w-full"
          />
          <label className="block text-sm font-semibold mt-2 mb-1">
            Време спрямо максимума: {time >= 0 ? '+' : '−'}
            {Math.round(Math.abs(time) * 60)} min
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(p => !p)}
              className="p-1.5 rounded bg-orange-500 text-white hover:bg-orange-600"
              aria-label={playing ? 'Пауза' : 'Пусни'}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <input
              type="range"
              min="-1.2"
              max="1.2"
              step="0.005"
              value={time}
              onChange={e => setTime(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            В момента
          </div>
          <div className="font-bold">{KIND_LABELS[kind]}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Закрита площ от Слънцето
          </div>
          <div className="font-mono font-bold">
            {(obscuration * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Фаза (дял от диаметъра)
          </div>
          <div className="font-mono font-bold">{magnitude.toFixed(2)}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {reaches ? 'Ширина на пълната сянка' : 'Ширина на „пръстена“'}
          </div>
          <div className="font-mono font-bold">≈ {spotWidth.toFixed(0)} km</div>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Конус на пълната сянка: {(umbraLength / 1000).toFixed(0)} хил. km ·
        разстояние до наблюдателя: {(topocentric / 1000).toFixed(0)} хил. km ·
        за това място затъмнението е най-много{' '}
        {KIND_LABELS[centralKind].toLowerCase()}. Ширината е за сянка, падаща
        перпендикулярно на повърхността.
      </p>

      <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg text-sm">
        <strong>🎯 Опитайте:</strong> намерете най-голямото разстояние до
        Луната, при което затъмнението още е пълно – веднъж през януари и веднъж
        през юли. Защо се различават?
      </div>
    </div>
  );
}

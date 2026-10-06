import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import {
  STAR_KIND_COLORS,
  STAR_KIND_LABELS,
  altAz,
  formatHours,
  raDecToHorizon,
  splitRuns,
  starKind,
} from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';

const WIDTH = 720;
const HEIGHT = 380;
const HORIZON_Y = 310;
const SKY_HEIGHT = 285;

type Star = {
  id: string;
  name: string;
  ra: number; // часове
  dec: number; // градуси
  mag: number;
};

// Координати J2000, закръглени
const STARS: Star[] = [
  { id: 'polaris', name: 'Полярна звезда', ra: 2.53, dec: 89.26, mag: 2.0 },
  {
    id: 'dubhe',
    name: 'Дубхе (Голяма мечка)',
    ra: 11.06,
    dec: 61.75,
    mag: 1.8,
  },
  {
    id: 'merak',
    name: 'Мерак (Голяма мечка)',
    ra: 11.03,
    dec: 56.38,
    mag: 2.4,
  },
  {
    id: 'phecda',
    name: 'Фекда (Голяма мечка)',
    ra: 11.9,
    dec: 53.69,
    mag: 2.4,
  },
  {
    id: 'megrez',
    name: 'Мегрец (Голяма мечка)',
    ra: 12.26,
    dec: 57.03,
    mag: 3.3,
  },
  {
    id: 'alioth',
    name: 'Алиот (Голяма мечка)',
    ra: 12.9,
    dec: 55.96,
    mag: 1.8,
  },
  { id: 'mizar', name: 'Мицар (Голяма мечка)', ra: 13.4, dec: 54.93, mag: 2.2 },
  {
    id: 'alkaid',
    name: 'Бенетнаш (Голяма мечка)',
    ra: 13.79,
    dec: 49.31,
    mag: 1.9,
  },
  { id: 'caph', name: 'Каф (Касиопея)', ra: 0.15, dec: 59.15, mag: 2.3 },
  { id: 'schedar', name: 'Шедар (Касиопея)', ra: 0.68, dec: 56.54, mag: 2.2 },
  { id: 'gcas', name: 'γ Касиопея', ra: 0.95, dec: 60.72, mag: 2.4 },
  { id: 'ruchbah', name: 'Рукбах (Касиопея)', ra: 1.43, dec: 60.24, mag: 2.7 },
  { id: 'segin', name: 'Сегин (Касиопея)', ra: 1.91, dec: 63.67, mag: 3.4 },
  {
    id: 'betelgeuse',
    name: 'Бетелгейзе (Орион)',
    ra: 5.92,
    dec: 7.41,
    mag: 0.5,
  },
  { id: 'bellatrix', name: 'Белатрикс (Орион)', ra: 5.42, dec: 6.35, mag: 1.6 },
  { id: 'mintaka', name: 'Минтака (Орион)', ra: 5.53, dec: -0.3, mag: 2.2 },
  { id: 'alnilam', name: 'Алнилам (Орион)', ra: 5.6, dec: -1.2, mag: 1.7 },
  { id: 'alnitak', name: 'Алнитак (Орион)', ra: 5.68, dec: -1.94, mag: 1.8 },
  { id: 'saiph', name: 'Саиф (Орион)', ra: 5.8, dec: -9.67, mag: 2.1 },
  { id: 'rigel', name: 'Ригел (Орион)', ra: 5.24, dec: -8.2, mag: 0.1 },
  { id: 'sirius', name: 'Сириус', ra: 6.75, dec: -16.72, mag: -1.5 },
  { id: 'canopus', name: 'Канопус', ra: 6.4, dec: -52.7, mag: -0.7 },
  { id: 'vega', name: 'Вега', ra: 18.62, dec: 38.78, mag: 0.0 },
  { id: 'capella', name: 'Капела', ra: 5.28, dec: 46.0, mag: 0.1 },
  { id: 'arcturus', name: 'Арктур', ra: 14.26, dec: 19.18, mag: -0.1 },
  { id: 'antares', name: 'Антарес', ra: 16.49, dec: -26.43, mag: 1.0 },
  { id: 'acrux', name: 'Акрукс (Южен кръст)', ra: 12.44, dec: -63.1, mag: 0.8 },
  {
    id: 'mimosa',
    name: 'Мимоза (Южен кръст)',
    ra: 12.8,
    dec: -59.69,
    mag: 1.3,
  },
  {
    id: 'gacrux',
    name: 'Гакрукс (Южен кръст)',
    ra: 12.52,
    dec: -57.11,
    mag: 1.6,
  },
  { id: 'dcru', name: 'δ Южен кръст', ra: 12.25, dec: -58.75, mag: 2.8 },
];

const LINES: [string, string][] = [
  ['dubhe', 'merak'],
  ['merak', 'phecda'],
  ['phecda', 'megrez'],
  ['megrez', 'dubhe'],
  ['megrez', 'alioth'],
  ['alioth', 'mizar'],
  ['mizar', 'alkaid'],
  ['caph', 'schedar'],
  ['schedar', 'gcas'],
  ['gcas', 'ruchbah'],
  ['ruchbah', 'segin'],
  ['betelgeuse', 'bellatrix'],
  ['betelgeuse', 'alnitak'],
  ['bellatrix', 'mintaka'],
  ['mintaka', 'alnilam'],
  ['alnilam', 'alnitak'],
  ['alnitak', 'saiph'],
  ['mintaka', 'rigel'],
  ['acrux', 'gacrux'],
  ['mimosa', 'dcru'],
];

const DIRECTIONS = [
  { label: 'Север', azimuth: 0 },
  { label: 'Изток', azimuth: 90 },
  { label: 'Юг', azimuth: 180 },
  { label: 'Запад', azimuth: 270 },
];

const COMPASS = ['С', 'СИ', 'И', 'ЮИ', 'Ю', 'ЮЗ', 'З', 'СЗ'];

const LOCATIONS = [
  { label: '🇧🇬 София', latitude: 43 },
  { label: '🌍 Екватор', latitude: 0 },
  { label: '🧭 Северен полюс', latitude: 90 },
  { label: '🇦🇺 Сидни', latitude: -34 },
];

const starById = Object.fromEntries(STARS.map(s => [s.id, s]));

export default function SkyView() {
  const [latitude, setLatitude] = useState(43);
  const [facing, setFacing] = useState(0);
  const [sidereal, setSidereal] = useState(10);
  const [playing, setPlaying] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useAnimationFrame(playing, dt => setSidereal(s => (s + dt * 0.6) % 24));

  const project = (alt: number, az: number) => {
    const delta = ((az - facing + 540) % 360) - 180;
    return {
      x: WIDTH / 2 + (delta / 90) * (WIDTH / 2),
      y: HORIZON_Y - (alt / 90) * SKY_HEIGHT,
      visible: alt >= 0 && Math.abs(delta) <= 90,
    };
  };

  const position = (star: Star, hours = sidereal) => {
    const { alt, az } = altAz(
      raDecToHorizon(latitude, hours, star.ra, star.dec)
    );
    return { alt, az, ...project(alt, az) };
  };

  const trail = (ra: number, dec: number) => {
    const points = Array.from({ length: 241 }, (_, i) => {
      const { alt, az } = altAz(
        raDecToHorizon(latitude, (i / 240) * 24, ra, dec)
      );
      return project(alt, az);
    });
    return splitRuns(points, p => p.visible)
      .filter(r => r.key)
      .flatMap(r => {
        // Разделяме при прескачане през ръба на зрителното поле
        const parts: { x: number; y: number }[][] = [[]];
        r.points.forEach((p, i) => {
          const prev = r.points[i - 1];
          if (prev && Math.abs(p.x - prev.x) > WIDTH / 4) parts.push([]);
          parts[parts.length - 1].push(p);
        });
        return parts.filter(p => p.length > 1);
      })
      .map(pts => 'M' + pts.map(p => `${p.x},${p.y}`).join(' L'))
      .join(' ');
  };

  const pole = project(Math.abs(latitude), latitude >= 0 ? 0 : 180);
  const selectedStar = selected ? starById[selected] : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Виртуално нощно небе</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Обърнете се в различни посоки и наблюдавайте как се движат истинските
        звезди и съзвездия.
      </p>

      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {DIRECTIONS.map(d => (
          <button
            key={d.label}
            onClick={() => setFacing(d.azimuth)}
            className={`px-3 py-1 rounded text-sm border ${
              facing === d.azimuth
                ? 'bg-purple-500 text-white border-purple-500'
                : 'border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            Гледам на {d.label.toLowerCase()}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto rounded-lg"
      >
        <defs>
          <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect width={WIDTH} height={HORIZON_Y} fill="url(#sky-gradient)" />

        {/* Височинна мрежа */}
        {[30, 60].map(alt => (
          <g key={alt}>
            <line
              x1="0"
              x2={WIDTH}
              y1={HORIZON_Y - (alt / 90) * SKY_HEIGHT}
              y2={HORIZON_Y - (alt / 90) * SKY_HEIGHT}
              stroke="white"
              strokeOpacity="0.1"
              strokeDasharray="2,6"
            />
            <text
              x="4"
              y={HORIZON_Y - (alt / 90) * SKY_HEIGHT - 4}
              fontSize="10"
              fill="white"
              opacity="0.4"
            >
              h = {alt}°
            </text>
          </g>
        ))}

        {/* Небесен екватор */}
        <path
          d={trail(0, 0)}
          fill="none"
          stroke="rgb(168, 85, 247)"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          opacity="0.7"
        />

        {/* Денонощни пътища */}
        {showTrails &&
          STARS.map(star => (
            <path
              key={star.id}
              d={trail(star.ra, star.dec)}
              fill="none"
              stroke={STAR_KIND_COLORS[starKind(latitude, star.dec)]}
              strokeWidth={selected === star.id ? 2 : 1}
              opacity={selected === star.id ? 0.9 : 0.25}
            />
          ))}

        {/* Съзвездия */}
        {LINES.map(([a, b]) => {
          const pa = position(starById[a]);
          const pb = position(starById[b]);
          if (!pa.visible || !pb.visible || Math.abs(pa.x - pb.x) > WIDTH / 4)
            return null;
          return (
            <line
              key={a + b}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="rgb(147, 197, 253)"
              strokeOpacity="0.45"
              strokeWidth="1"
            />
          );
        })}

        {/* Полюс на света */}
        {pole.visible && latitude !== 0 && (
          <g opacity="0.8">
            <line
              x1={pole.x - 8}
              x2={pole.x + 8}
              y1={pole.y}
              y2={pole.y}
              stroke="rgb(239, 68, 68)"
            />
            <line
              x1={pole.x}
              x2={pole.x}
              y1={pole.y - 8}
              y2={pole.y + 8}
              stroke="rgb(239, 68, 68)"
            />
            <text
              x={pole.x + 10}
              y={pole.y + 18}
              fontSize="11"
              fill="rgb(248, 113, 113)"
            >
              {latitude > 0 ? 'P' : "P'"}
            </text>
          </g>
        )}

        {/* Звезди */}
        {STARS.map(star => {
          const p = position(star);
          if (!p.visible) return null;
          const r = Math.max(1.5, 4.5 - star.mag * 1.1);
          return (
            <g
              key={star.id}
              className="cursor-pointer"
              onClick={() => setSelected(s => (s === star.id ? null : star.id))}
            >
              <circle cx={p.x} cy={p.y} r={r + 8} fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={star.id === 'polaris' ? '#fde68a' : 'white'}
                stroke={selected === star.id ? 'rgb(250, 204, 21)' : 'none'}
                strokeWidth="2"
              />
              {(star.mag < 0.6 ||
                star.id === 'polaris' ||
                selected === star.id) && (
                <text
                  x={p.x + r + 4}
                  y={p.y - r - 2}
                  fontSize="11"
                  fill="white"
                  opacity="0.85"
                  className="select-none"
                >
                  {star.name.split(' (')[0]}
                </text>
              )}
            </g>
          );
        })}

        {/* Земя и посоки */}
        <rect
          y={HORIZON_Y}
          width={WIDTH}
          height={HEIGHT - HORIZON_Y}
          fill="#14532d"
        />
        <line
          x1="0"
          x2={WIDTH}
          y1={HORIZON_Y}
          y2={HORIZON_Y}
          stroke="rgb(34, 197, 94)"
          strokeWidth="2"
        />
        {COMPASS.map((label, i) => {
          const p = project(0, i * 45);
          if (!p.visible) return null;
          return (
            <text
              key={label}
              x={Math.max(14, Math.min(WIDTH - 14, p.x))}
              y={HORIZON_Y + 22}
              fontSize={label.length === 1 ? 16 : 12}
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
        <text
          x={WIDTH - 8}
          y={HEIGHT - 10}
          fontSize="11"
          fill="white"
          textAnchor="end"
          opacity="0.8"
        >
          Звездно време {formatHours(sidereal)}
        </text>
      </svg>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Географска ширина: {Math.abs(latitude)}°
            {latitude > 0 ? ' с.ш.' : latitude < 0 ? ' ю.ш.' : ''}
          </label>
          <input
            type="range"
            min="-90"
            max="90"
            value={latitude}
            onChange={e => setLatitude(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {LOCATIONS.map(loc => (
              <button
                key={loc.label}
                onClick={() => setLatitude(loc.latitude)}
                className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-gray-700"
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Време</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(p => !p)}
              className="p-2 rounded bg-purple-500 text-white hover:bg-purple-600"
              aria-label={playing ? 'Пауза' : 'Пусни'}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="24"
              step="0.05"
              value={sidereal}
              onChange={e => setSidereal(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <label className="flex items-center gap-2 text-sm mt-2">
            <input
              type="checkbox"
              checked={showTrails}
              onChange={e => setShowTrails(e.target.checked)}
            />
            Покажи денонощните пътища
          </label>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 justify-center text-xs">
        {(['circumpolar', 'rising', 'never'] as const).map(kind => (
          <span key={kind} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-0.5"
              style={{ background: STAR_KIND_COLORS[kind] }}
            />
            {STAR_KIND_LABELS[kind]}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t-2 border-dashed border-purple-500" />
          небесен екватор
        </span>
      </div>

      <div className="mt-4 p-4 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg text-sm min-h-[90px]">
        {selectedStar ? (
          <StarInfo star={selectedStar} latitude={latitude} />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Натиснете звезда, за да видите дали залязва и колко високо се
            издига. Опитайте: обърнете се на север в София и намерете Голямата
            мечка, а после погледнете на юг за Орион и Сириус.
          </p>
        )}
      </div>
    </div>
  );
}

function StarInfo({ star, latitude }: { star: Star; latitude: number }) {
  const kind = starKind(latitude, star.dec);
  const maxAlt = 90 - Math.abs(latitude - star.dec);
  const minAlt = Math.abs(latitude + star.dec) - 90;
  return (
    <div className="space-y-1">
      <p className="font-bold">
        ⭐ {star.name}{' '}
        <span className="font-normal text-gray-600 dark:text-gray-400">
          (δ = {star.dec > 0 ? '+' : ''}
          {star.dec.toFixed(1)}°)
        </span>
      </p>
      <p>
        Тип:{' '}
        <strong style={{ color: STAR_KIND_COLORS[kind] }}>
          {STAR_KIND_LABELS[kind]}
        </strong>
      </p>
      {kind !== 'never' && (
        <p>
          Най-голяма височина: h<sub>max</sub> = 90° − |φ − δ| ={' '}
          {maxAlt.toFixed(1)}°
        </p>
      )}
      {kind === 'circumpolar' && (
        <p>
          Най-малка височина: h<sub>min</sub> = |φ + δ| − 90° ={' '}
          {minAlt.toFixed(1)}° – дори тогава е над хоризонта!
        </p>
      )}
    </div>
  );
}

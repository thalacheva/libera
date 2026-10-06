import { CheckCircle2, Circle, Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  DEG,
  EAST,
  NORTH,
  SOUTH,
  WEST,
  ZENITH,
  altAz,
  equatorialFrame,
  formatHours,
  hourAngleToHorizon,
  normalize,
  raDecToHorizon,
  scale,
  splitRuns,
  type Vec3,
} from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';
import { circlePoints, useSphereView } from './useSphereView';

const WIDTH = 600;
const HEIGHT = 500;
const CX = 300;
const CY = 250;
const R = 185;

const COLORS = {
  horizon: 'rgb(34, 197, 94)',
  equator: 'rgb(168, 85, 247)',
  meridian: 'rgb(239, 68, 68)',
  axis: 'rgb(100, 116, 139)',
  zenith: 'rgb(59, 130, 246)',
  star: 'rgb(234, 179, 8)',
  azimuth: 'rgb(239, 68, 68)',
  altitude: 'rgb(59, 130, 246)',
  zenithDistance: 'rgb(14, 165, 233)',
  hourAngle: 'rgb(249, 115, 22)',
  declination: 'rgb(236, 72, 153)',
  ra: 'rgb(16, 185, 129)',
  sidereal: 'rgb(99, 102, 241)',
};

export type CoordinateMode =
  | 'horizontal'
  | 'hourAngle'
  | 'equatorial'
  | 'sidereal';

const MODES: { id: CoordinateMode; label: string; description: string }[] = [
  {
    id: 'horizontal',
    label: 'Хоризонтална (A, h)',
    description:
      'Основен кръг – хоризонтът. Азимутът A се мери по хоризонта от северната точка С по посока на часовниковата стрелка (през И) до вертикалния кръг на звездата. Височината h се мери по вертикалния кръг от хоризонта до звездата; z = 90° − h.',
  },
  {
    id: 'hourAngle',
    label: 'I екваториална (t, δ)',
    description:
      'Основен кръг – небесният екватор. Часовият ъгъл t се мери по екватора от горната му точка Q на меридиана на запад (по посока на денонощното движение) до часовия кръг на звездата. Деклинацията δ се мери по часовия кръг от екватора до звездата.',
  },
  {
    id: 'equatorial',
    label: 'II екваториална (α, δ)',
    description:
      'Ректасцензията α се мери по екватора от пролетната точка ♈ на изток (обратно на денонощното движение). Тъй като ♈ се върти заедно със звездите, α и δ не се променят. Пуснете времето и сравнете!',
  },
  {
    id: 'sidereal',
    label: 'Звездно време S = t + α',
    description:
      'Звездното време S е часовият ъгъл на пролетната точка. По екватора от Q на запад до ♈ има S, от Q на запад до звездата – t, а от ♈ на изток до звездата – α. Затова S = t + α.',
  },
];

const STARS = [
  { name: 'Вега', ra: 18.62, dec: 39 },
  { name: 'Сириус', ra: 6.75, dec: -17 },
  { name: 'Полярна', ra: 2.53, dec: 89 },
  { name: 'Бетелгейзе', ra: 5.92, dec: 7 },
  { name: 'Арктур', ra: 14.26, dec: 19 },
];

const LATITUDE = 43;

const fmtDeg = (v: number) => `${v.toFixed(1)}°`;
const wrap24 = (h: number) => ((h % 24) + 24) % 24;

export default function CoordinateSphere({
  initialMode = 'horizontal',
}: {
  initialMode?: CoordinateMode;
}) {
  const [mode, setMode] = useState<CoordinateMode>(initialMode);
  const [ra, setRa] = useState(18.62);
  const [dec, setDec] = useState(39);
  const [sidereal, setSidereal] = useState(20);
  const [playing, setPlaying] = useState(false);

  const { project, resetView, dragHandlers } = useSphereView(
    { azimuth: -115, elevation: 18 },
    { x: CX, y: CY },
    R
  );

  useAnimationFrame(playing, dt => setSidereal(s => wrap24(s + dt * 1.2)));

  const { pole, q } = equatorialFrame(LATITUDE);
  const star = raDecToHorizon(LATITUDE, sidereal, ra, dec);
  const { alt, az } = altAz(star);
  const hourAngle = wrap24(sidereal - ra);
  const tDeg = hourAngle * 15;
  const vernal = hourAngleToHorizon(LATITUDE, 0, sidereal * 15);

  // Основни кръгове
  const horizonPts = circlePoints(t => [Math.cos(t), Math.sin(t), 0]);
  const meridianPts = circlePoints(t => [Math.cos(t), 0, Math.sin(t)]);
  const equatorPts = circlePoints(t =>
    hourAngleToHorizon(LATITUDE, 0, t / DEG)
  );

  // Вертикален кръг на звездата
  const foot: Vec3 =
    Math.hypot(star[0], star[1]) < 1e-6
      ? SOUTH
      : normalize([star[0], star[1], 0]);
  const vertical = (from: number, to: number) =>
    circlePoints(
      u => [foot[0] * Math.cos(u), foot[1] * Math.cos(u), Math.sin(u)],
      from,
      to
    );
  // Часов кръг на звездата
  const hourCircle = (from: number, to: number) =>
    circlePoints(u => hourAngleToHorizon(LATITUDE, u / DEG, tDeg), from, to);
  // Дъга по екватора между часови ъгли from и to (в градуси)
  const equatorArc = (from: number, to: number) =>
    circlePoints(u => hourAngleToHorizon(LATITUDE, 0, u / DEG), from, to);
  const horizonArc = (from: number, to: number) =>
    circlePoints(u => [-Math.cos(u), Math.sin(u), 0], from, to);

  const toPath = (points: Vec3[]) =>
    splitRuns(
      points.map(p => project(p)),
      p => p.front
    ).map(r => ({
      front: r.key,
      d: 'M' + r.points.map(p => `${p.x},${p.y}`).join(' L'),
    }));

  const curve = (points: Vec3[], color: string, width = 2, opacity = 1) =>
    toPath(points).map((seg, i) => (
      <path
        key={i}
        d={seg.d}
        fill="none"
        stroke={color}
        strokeWidth={seg.front ? width : Math.max(1.2, width - 1.5)}
        strokeDasharray={seg.front ? undefined : '5,5'}
        opacity={opacity * (seg.front ? 1 : 0.5)}
        strokeLinecap="round"
      />
    ));

  const arc = (points: Vec3[], color: string, label: string) => {
    const mid = points[Math.floor(points.length / 2)];
    const labelPos = project(scale(mid, 1.13));
    return (
      <g>
        {curve(points, color, 5)}
        <text
          x={labelPos.x}
          y={labelPos.y + 5}
          fontSize="15"
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
          className="select-none"
        >
          {label}
        </text>
      </g>
    );
  };

  const point = (v: Vec3, label: string, color: string, r = 5) => {
    const p = project(v);
    const dx = p.x - CX;
    const dy = p.y - CY;
    const len = Math.hypot(dx, dy);
    const [ox, oy] = len > 20 ? [(dx / len) * 17, (dy / len) * 17] : [14, -10];
    return (
      <g opacity={p.front ? 1 : 0.55}>
        <circle
          cx={p.x}
          cy={p.y}
          r={r}
          fill={p.front ? color : 'white'}
          stroke={color}
          strokeWidth="2"
        />
        <text
          x={p.x + ox}
          y={p.y + oy + 5}
          fontSize="13"
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
          className="select-none"
        >
          {label}
        </text>
      </g>
    );
  };

  const showHorizontal = mode === 'horizontal';
  const showEquatorial = !showHorizontal;
  const starPos = project(star);

  const challenges = [
    {
      text: 'Сложете Сириус в горна кулминация (t = 0h).',
      done:
        Math.abs(ra - 6.75) < 0.05 &&
        Math.abs(dec + 17) < 1 &&
        (hourAngle < 0.1 || hourAngle > 23.9),
    },
    {
      text: 'Намерете звезда и момент, в който тя е точно в зенита (h > 89°).',
      done: alt > 89,
    },
    {
      text: 'Накарайте звездата да залязва точно в западната точка (A = 270°, h = 0°).',
      done: Math.abs(az - 270) < 1.5 && Math.abs(alt) < 1.5,
    },
    {
      text: 'Каква е стойността на S, когато пролетната точка ♈ кулминира?',
      done: sidereal < 0.1 || sidereal > 23.9,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
              mode === m.id
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto cursor-grab active:cursor-grabbing"
            style={{ maxHeight: '500px', touchAction: 'pan-y' }}
            {...dragHandlers}
          >
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="rgba(59, 130, 246, 0.06)"
              stroke={COLORS.zenith}
              strokeWidth="1.5"
            />
            <polygon
              points={horizonPts
                .map(project)
                .map(p => `${p.x},${p.y}`)
                .join(' ')}
              fill="rgba(34, 197, 94, 0.12)"
            />

            {curve(horizonPts, COLORS.horizon, showHorizontal ? 3 : 1.5)}
            {curve(meridianPts, COLORS.meridian, 1.5, 0.6)}
            {curve(equatorPts, COLORS.equator, showEquatorial ? 3 : 1.5)}

            {showHorizontal && (
              <>
                {curve(vertical(0, 180), COLORS.altitude, 1.2, 0.5)}
                {arc(horizonArc(0, az), COLORS.azimuth, 'A')}
                {arc(vertical(0, alt), COLORS.altitude, 'h')}
                {alt > 0 && arc(vertical(alt, 90), COLORS.zenithDistance, 'z')}
              </>
            )}

            {showEquatorial && (
              <>
                {curve(hourCircle(-90, 90), COLORS.declination, 1.2, 0.5)}
                {arc(hourCircle(0, dec), COLORS.declination, 'δ')}
                {(mode === 'hourAngle' || mode === 'sidereal') &&
                  arc(equatorArc(0, tDeg), COLORS.hourAngle, 't')}
                {mode === 'equatorial' &&
                  arc(
                    equatorArc(sidereal * 15, sidereal * 15 - ra * 15),
                    COLORS.ra,
                    'α'
                  )}
                {mode === 'sidereal' && (
                  <>
                    {arc(
                      equatorArc(sidereal * 15, sidereal * 15 - ra * 15).map(
                        v => scale(v, 0.86)
                      ),
                      COLORS.ra,
                      'α'
                    )}
                    {arc(
                      equatorArc(0, sidereal * 15).map(v => scale(v, 0.7)),
                      COLORS.sidereal,
                      'S'
                    )}
                  </>
                )}
              </>
            )}

            {/* Ос на света и вертикала */}
            {[
              [pole, scale(pole, -1), COLORS.axis],
              [ZENITH, scale(ZENITH, -1), COLORS.zenith],
            ].map(([a, b, color], i) => {
              const pa = project(a as Vec3);
              const pb = project(b as Vec3);
              return (
                <line
                  key={i}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={color as string}
                  strokeDasharray="6,4"
                  opacity="0.6"
                />
              );
            })}

            {point(NORTH, 'С', COLORS.horizon)}
            {point(SOUTH, 'Ю', COLORS.horizon)}
            {point(EAST, 'И', COLORS.horizon)}
            {point(WEST, 'З', COLORS.horizon)}
            {point(ZENITH, 'Z', COLORS.zenith)}
            {point(pole, 'P', COLORS.meridian)}
            {showEquatorial && point(q, 'Q', COLORS.hourAngle)}
            {showEquatorial && point(vernal, '♈', COLORS.ra)}

            {/* Звездата */}
            <g opacity={starPos.front ? 1 : 0.6}>
              <circle
                cx={starPos.x}
                cy={starPos.y}
                r="9"
                fill={COLORS.star}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={starPos.x}
                y={starPos.y + 4}
                fontSize="11"
                textAnchor="middle"
                fill="white"
                className="select-none"
              >
                ★
              </text>
            </g>
          </svg>
          <button
            onClick={resetView}
            className="absolute top-0 right-0 flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw size={12} /> Изглед
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            🖱️ Завъртете сферата с мишката · наблюдател в България (φ ={' '}
            {LATITUDE}°)
          </p>
        </div>

        <CoordinateTable
          mode={mode}
          az={az}
          alt={alt}
          hourAngle={hourAngle}
          ra={ra}
          dec={dec}
          sidereal={sidereal}
          playing={playing}
        />
      </div>

      <p className="mt-3 text-sm bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
        {MODES.find(m => m.id === mode)!.description}
      </p>

      {/* Контроли */}
      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Ректасцензия α = {formatHours(ra)}
          </label>
          <input
            type="range"
            min="0"
            max="23.99"
            step="0.05"
            value={ra}
            onChange={e => setRa(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Деклинация δ = {dec > 0 ? '+' : ''}
            {dec}°
          </label>
          <input
            type="range"
            min="-90"
            max="90"
            value={dec}
            onChange={e => setDec(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Звездно време S = {formatHours(sidereal)}
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
              min="0"
              max="24"
              step="0.05"
              value={sidereal}
              onChange={e => setSidereal(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-3">
        {STARS.map(s => (
          <button
            key={s.name}
            onClick={() => {
              setRa(s.ra);
              setDec(s.dec);
            }}
            className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-yellow-50 dark:hover:bg-gray-700"
          >
            ⭐ {s.name}
          </button>
        ))}
      </div>

      <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">🎯 Предизвикателства</h4>
        <ul className="space-y-1.5 text-sm">
          {challenges.map(c => (
            <li key={c.text} className="flex items-start gap-2">
              {c.done ? (
                <CheckCircle2
                  size={18}
                  className="text-green-600 dark:text-green-400 shrink-0"
                />
              ) : (
                <Circle size={18} className="text-gray-400 shrink-0" />
              )}
              <span
                className={c.done ? 'text-green-700 dark:text-green-300' : ''}
              >
                {c.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CoordinateTable({
  mode,
  az,
  alt,
  hourAngle,
  ra,
  dec,
  sidereal,
  playing,
}: {
  mode: CoordinateMode;
  az: number;
  alt: number;
  hourAngle: number;
  ra: number;
  dec: number;
  sidereal: number;
  playing: boolean;
}) {
  const rows = [
    {
      group: 'Хоризонтални',
      items: [
        {
          sym: 'A',
          name: 'азимут',
          value: fmtDeg(az),
          color: COLORS.azimuth,
          varies: true,
          modes: ['horizontal'],
        },
        {
          sym: 'h',
          name: 'височина',
          value: fmtDeg(alt),
          color: COLORS.altitude,
          varies: true,
          modes: ['horizontal'],
        },
        {
          sym: 'z',
          name: 'зенитно разст.',
          value: fmtDeg(90 - alt),
          color: COLORS.zenithDistance,
          varies: true,
          modes: ['horizontal'],
        },
      ],
    },
    {
      group: 'Екваториални',
      items: [
        {
          sym: 't',
          name: 'часов ъгъл',
          value: formatHours(hourAngle),
          color: COLORS.hourAngle,
          varies: true,
          modes: ['hourAngle', 'sidereal'],
        },
        {
          sym: 'δ',
          name: 'деклинация',
          value: `${dec > 0 ? '+' : ''}${dec}°`,
          color: COLORS.declination,
          varies: false,
          modes: ['hourAngle', 'equatorial'],
        },
        {
          sym: 'α',
          name: 'ректасцензия',
          value: formatHours(ra),
          color: COLORS.ra,
          varies: false,
          modes: ['equatorial', 'sidereal'],
        },
      ],
    },
  ];

  return (
    <div className="text-sm space-y-3">
      {rows.map(group => (
        <div key={group.group}>
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {group.group}
          </div>
          <div className="space-y-1">
            {group.items.map(item => (
              <div
                key={item.sym}
                className={`flex items-center justify-between px-2 py-1 rounded ${
                  item.modes.includes(mode)
                    ? 'bg-gray-100 dark:bg-gray-700 font-semibold'
                    : ''
                }`}
              >
                <span>
                  <span style={{ color: item.color }} className="font-bold">
                    {item.sym}
                  </span>{' '}
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    {item.name}
                  </span>
                </span>
                <span className="font-mono flex items-center gap-1">
                  {item.value}
                  <span
                    className={`text-xs ${
                      item.varies && playing
                        ? 'text-orange-500 animate-spin'
                        : 'invisible'
                    }`}
                  >
                    ⟳
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          Проверка
        </div>
        <p className="font-mono text-xs">
          <span style={{ color: COLORS.sidereal }}>S</span> ={' '}
          <span style={{ color: COLORS.hourAngle }}>t</span> +{' '}
          <span style={{ color: COLORS.ra }}>α</span>
        </p>
        <p className="font-mono text-xs">
          {formatHours(sidereal)} = {formatHours(hourAngle)} + {formatHours(ra)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          (по модул 24h)
        </p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Пуснете времето: ⟳ показва кои координати се променят.
      </p>
    </div>
  );
}

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import {
  AU_MILLION_KM,
  MONTH_STARTS,
  dayLength,
  formatDate,
  formatDuration,
  litPath,
  monthShort,
  noonAltitude,
  sunDeclination,
  sunDistance,
  sunLongitude,
} from './earthMath';
import {
  DEG,
  OBLIQUITY,
  cross,
  dot,
  normalize,
  scale,
  add,
  formatHours,
  type Vec3,
} from './skyMath';
import { useAnimationFrame } from './useAnimationFrame';

const KEY_DAYS = [
  { label: '🌸 20 март', day: 78.5 },
  { label: '☀️ 21 юни', day: 171 },
  { label: '🍂 22 септ.', day: 264.5 },
  { label: '❄️ 21 дек.', day: 354 },
  { label: '🔥 3 ян. (перихелий)', day: 2 },
];

const LOCATIONS = [
  { label: 'София', latitude: 42.7 },
  { label: 'Екватор', latitude: 0 },
  { label: 'Тропик на Рака', latitude: 23.4 },
  { label: 'Северен полярен кръг', latitude: 66.6 },
  { label: 'Северен полюс', latitude: 90 },
  { label: 'Сидни', latitude: -33.9 },
];

const SUN_COLOR = 'rgb(251, 191, 36)';
const EARTH_COLOR = 'rgb(59, 130, 246)';
const AXIS_COLOR = 'rgb(239, 68, 68)';

// Изглед към орбитата: камера над равнината на еклиптиката
const ORBIT = { cx: 210, cy: 150, r: 150, elevation: 28, azimuth: 40 };

function orbitProjector() {
  const el = ORBIT.elevation * DEG;
  const a = ORBIT.azimuth * DEG;
  const right: Vec3 = [Math.cos(a), Math.sin(a), 0];
  const up: Vec3 = [
    -Math.sin(a) * Math.sin(el),
    Math.cos(a) * Math.sin(el),
    Math.cos(el),
  ];
  const camera: Vec3 = [
    Math.sin(a) * Math.cos(el),
    -Math.cos(a) * Math.cos(el),
    Math.sin(el),
  ];
  return { right, up, camera };
}

export default function SeasonsExplorer() {
  const [day, setDay] = useState(171);
  const [latitude, setLatitude] = useState(42.7);
  const [localTime, setLocalTime] = useState(12);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt => setDay(d => (d + dt * 30) % 365));

  const lambda = sunLongitude(day);
  const delta = sunDeclination(day);
  const distance = sunDistance(day);
  const length = dayLength(latitude, delta);
  const noon = noonAltitude(latitude, delta);
  const eps = OBLIQUITY * DEG;

  // --- Орбита ---
  const { right, up, camera } = orbitProjector();
  const toOrbit = (v: Vec3) => ({
    x: ORBIT.cx + ORBIT.r * dot(v, right),
    y: ORBIT.cy - ORBIT.r * dot(v, up),
  });
  // Посока от Земята към Слънцето и положение на Земята (хелиоцентрично)
  const sunDir: Vec3 = [Math.cos(lambda * DEG), Math.sin(lambda * DEG), 0];
  const earthAt = (d: number) =>
    scale(
      [Math.cos(sunLongitude(d) * DEG), Math.sin(sunLongitude(d) * DEG), 0],
      -sunDistance(d)
    );
  const earth = toOrbit(earthAt(day));
  const orbitPath =
    'M' +
    Array.from({ length: 121 }, (_, i) => toOrbit(earthAt((i / 120) * 365)))
      .map(p => `${p.x},${p.y}`)
      .join(' L') +
    ' Z';
  const axis: Vec3 = [0, Math.sin(eps), Math.cos(eps)];
  const axisScreen = { x: dot(axis, right), y: dot(axis, up) };
  const earthLit = litPath(
    earth.x,
    earth.y,
    13,
    dot(sunDir, right),
    dot(sunDir, up),
    dot(sunDir, camera)
  );

  // --- Земята отблизо: Слънцето е вляво, гледаме перпендикулярно на лъчите ---
  const CX = 160;
  const CY = 160;
  const R = 105;
  const N = normalize([
    -Math.sin(delta * DEG),
    Math.cos(eps),
    Math.sin(eps) * Math.cos(lambda * DEG),
  ]);
  const toSun: Vec3 = [-1, 0, 0];
  const e1 = normalize(add(toSun, scale(N, -dot(toSun, N))));
  const e2 = cross(N, e1);
  const onEarth = (lat: number, theta: number): Vec3 =>
    add(
      scale(N, Math.sin(lat * DEG)),
      scale(
        add(scale(e1, Math.cos(theta)), scale(e2, Math.sin(theta))),
        Math.cos(lat * DEG)
      )
    );
  // Гледаме леко отгоре (от север на еклиптиката), за да се виждат
  // успоредниците като елипси; завъртането е около посоката към Слънцето,
  // затова терминаторът остава вертикален.
  const tilt = 20 * DEG;
  const toClose = (v: Vec3) => ({
    x: CX + R * v[0],
    y: CY - R * (v[1] * Math.cos(tilt) - v[2] * Math.sin(tilt)),
    front: v[1] * Math.sin(tilt) + v[2] * Math.cos(tilt) >= 0,
    day: v[0] < 0,
  });

  const parallel = (lat: number) =>
    Array.from({ length: 181 }, (_, i) =>
      toClose(onEarth(lat, (i / 180) * 2 * Math.PI))
    );
  const segments = (
    points: ReturnType<typeof toClose>[],
    key: (p: ReturnType<typeof toClose>) => string
  ) => {
    const runs: { key: string; pts: typeof points }[] = [];
    points.forEach((p, i) => {
      const k = key(p);
      const last = runs[runs.length - 1];
      if (last && last.key === k) last.pts.push(p);
      else runs.push({ key: k, pts: i > 0 ? [points[i - 1], p] : [p] });
    });
    return runs.map(r => ({
      key: r.key,
      d: 'M' + r.pts.map(p => `${p.x},${p.y}`).join(' L'),
    }));
  };

  const observer = toClose(
    onEarth(latitude, (((localTime - 12) * 15) % 360) * DEG)
  );
  const north = toClose(scale(N, 1.25));
  const south = toClose(scale(N, -1.25));

  const status =
    length >= 24
      ? 'Полярен ден – Слънцето не залязва'
      : length <= 0
        ? 'Полярна нощ – Слънцето не изгрява'
        : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Лаборатория „Сезони“</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Движете датата и вижте как наклонът на оста – а не разстоянието –
        променя деня и височината на Слънцето.
      </p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Орбита */}
        <div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-1">
            Орбитата, погледната отгоре и отстрани
          </p>
          <svg viewBox="0 0 420 300" className="w-full h-auto">
            <path
              d={orbitPath}
              fill="none"
              stroke="rgb(148, 163, 184)"
              strokeDasharray="4,4"
            />
            {MONTH_STARTS.map((d, i) => {
              const p = toOrbit(scale(earthAt(d), 1.13));
              return (
                <text
                  key={i}
                  x={p.x}
                  y={p.y + 4}
                  fontSize="10"
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-gray-400 select-none"
                >
                  {monthShort(i)}
                </text>
              );
            })}
            <circle cx={ORBIT.cx} cy={ORBIT.cy} r="20" fill={SUN_COLOR} />
            <circle
              cx={ORBIT.cx}
              cy={ORBIT.cy}
              r="26"
              fill={SUN_COLOR}
              opacity="0.25"
            />
            <line
              x1={ORBIT.cx}
              y1={ORBIT.cy}
              x2={earth.x}
              y2={earth.y}
              stroke={SUN_COLOR}
              strokeOpacity="0.5"
              strokeDasharray="2,3"
            />
            <circle cx={earth.x} cy={earth.y} r="13" fill="rgb(30, 41, 59)" />
            <path d={earthLit} fill={EARTH_COLOR} />
            <line
              x1={earth.x - 24 * axisScreen.x}
              y1={earth.y + 24 * axisScreen.y}
              x2={earth.x + 24 * axisScreen.x}
              y2={earth.y - 24 * axisScreen.y}
              stroke={AXIS_COLOR}
              strokeWidth="2.5"
            />
            <circle
              cx={earth.x + 24 * axisScreen.x}
              cy={earth.y - 24 * axisScreen.y}
              r="3"
              fill={AXIS_COLOR}
            />
            <text
              x="8"
              y="292"
              fontSize="10"
              className="fill-gray-500 dark:fill-gray-400"
            >
              Оста сочи винаги в една посока (към Полярната звезда)
            </text>
          </svg>
        </div>

        {/* Земята отблизо */}
        <div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-1">
            Земята отблизо: Слънцето е вляво
          </p>
          <svg viewBox="0 0 320 320" className="w-full h-auto max-h-[320px]">
            <defs>
              <clipPath id="seasons-earth">
                <circle cx={CX} cy={CY} r={R} />
              </clipPath>
            </defs>
            {[-60, -30, 0, 30, 60].map(y => (
              <line
                key={y}
                x1="0"
                x2={CX - R - 8}
                y1={CY + y}
                y2={CY + y}
                stroke={SUN_COLOR}
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
            <circle cx={CX} cy={CY} r={R} fill={EARTH_COLOR} opacity="0.85" />
            <rect
              x={CX}
              y={CY - R}
              width={R}
              height={2 * R}
              fill="rgb(15, 23, 42)"
              opacity="0.65"
              clipPath="url(#seasons-earth)"
            />
            {[
              { lat: 0, color: 'white', width: 1.5, dash: undefined },
              { lat: 23.44, color: 'white', width: 1, dash: '3,3' },
              { lat: -23.44, color: 'white', width: 1, dash: '3,3' },
              {
                lat: 66.56,
                color: 'rgb(186, 230, 253)',
                width: 1,
                dash: '3,3',
              },
              {
                lat: -66.56,
                color: 'rgb(186, 230, 253)',
                width: 1,
                dash: '3,3',
              },
            ].map(p =>
              segments(parallel(p.lat), q => String(q.front))
                .filter(s => s.key === 'true')
                .map((s, i) => (
                  <path
                    key={`${p.lat}-${i}`}
                    d={s.d}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={p.width}
                    strokeDasharray={p.dash}
                    opacity="0.7"
                  />
                ))
            )}
            {/* Успоредникът на наблюдателя: дневна и нощна част */}
            {segments(parallel(latitude), q => `${q.front}|${q.day}`).map(
              (s, i) => {
                const [front, isDay] = s.key.split('|');
                return (
                  <path
                    key={i}
                    d={s.d}
                    fill="none"
                    stroke={isDay === 'true' ? SUN_COLOR : 'rgb(129, 140, 248)'}
                    strokeWidth={front === 'true' ? 4 : 1.5}
                    strokeDasharray={front === 'true' ? undefined : '3,4'}
                    opacity={front === 'true' ? 1 : 0.5}
                    strokeLinecap="round"
                  />
                );
              }
            )}
            <line
              x1={south.x}
              y1={south.y}
              x2={north.x}
              y2={north.y}
              stroke={AXIS_COLOR}
              strokeWidth="2.5"
            />
            <text
              x={north.x + 6}
              y={north.y}
              fontSize="13"
              fontWeight="bold"
              fill={AXIS_COLOR}
            >
              N
            </text>
            <circle
              cx={observer.x}
              cy={observer.y}
              r="6"
              fill={observer.day ? SUN_COLOR : 'rgb(129, 140, 248)'}
              stroke="white"
              strokeWidth="2"
              opacity={observer.front ? 1 : 0.4}
            />
          </svg>
        </div>
      </div>

      {/* Контроли */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Дата: {formatDate(day)}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(p => !p)}
              className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700"
              aria-label={playing ? 'Пауза' : 'Пусни'}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="364"
              step="0.5"
              value={day}
              onChange={e => setDay(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {KEY_DAYS.map(k => (
              <button
                key={k.label}
                onClick={() => setDay(k.day)}
                className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-700"
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Географска ширина: {Math.abs(latitude).toFixed(1)}°
            {latitude > 0 ? ' с.ш.' : latitude < 0 ? ' ю.ш.' : ''}
          </label>
          <input
            type="range"
            min="-90"
            max="90"
            step="0.1"
            value={latitude}
            onChange={e => setLatitude(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {LOCATIONS.map(l => (
              <button
                key={l.label}
                onClick={() => setLatitude(l.latitude)}
                className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-700"
              >
                {l.label}
              </button>
            ))}
          </div>
          <label className="block text-sm font-semibold mt-3 mb-1">
            Местно слънчево време: {formatHours(localTime)}
          </label>
          <input
            type="range"
            min="0"
            max="24"
            step="0.1"
            value={localTime}
            onChange={e => setLocalTime(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Резултати */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center">
        <Stat
          label="Деклинация на Слънцето"
          value={`${delta >= 0 ? '+' : ''}${delta.toFixed(1)}°`}
        />
        <Stat
          label="Продължителност на деня"
          value={formatDuration(length)}
          note={status ?? undefined}
        />
        <Stat
          label="Височина по пладне"
          value={noon > 0 ? `${noon.toFixed(1)}°` : 'под хоризонта'}
        />
        <Stat
          label="Разстояние до Слънцето"
          value={`${(distance * AU_MILLION_KM).toFixed(1)} млн. km`}
        />
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Енергия на 1 m² по пладне (∝ sin h)</span>
          <span>{Math.max(0, Math.sin(noon * DEG) * 100).toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 to-orange-500"
            style={{ width: `${Math.max(0, Math.sin(noon * DEG) * 100)}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <strong>Как се чете дясната картинка:</strong> жълтата част от
        успоредника на наблюдателя е на дневната страна, а синята – на нощната.
        Делът на жълтата част от целия кръг е точно делът на деня от
        денонощието. Плъзнете „Местно време“, за да видите как наблюдателят
        минава от ден в нощ.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
      <div className="font-bold font-mono">{value}</div>
      {note && (
        <div className="text-xs text-orange-600 dark:text-orange-400">
          {note}
        </div>
      )}
    </div>
  );
}

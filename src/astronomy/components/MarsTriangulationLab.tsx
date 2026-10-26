import { useState } from 'react';
import { fmt } from './terrestrialData';
import LabSvg from '~/LabSvg';

const W = 640;
const H = 340;
const DEG = Math.PI / 180;
const SUN = { x: 196, y: 170 };
const SCALE = 88; // px за 1 AU
const MARS_PERIOD = 686.98; // дни

type Orbit = { a: number; e: number; perihelion: number; meanLongitude: number; daily: number };
// Средни елементи за J2000 (наклонът на орбитата на Марс, 1,85°, се пренебрегва)
const EARTH: Orbit = { a: 1.00000, e: 0.01671, perihelion: 102.94, meanLongitude: 100.46, daily: 0.9856474 };
const MARS: Orbit = { a: 1.52368, e: 0.0934, perihelion: 336.06, meanLongitude: 355.45, daily: 360 / MARS_PERIOD };

/** Хелиоцентрично положение (AU) в деня t: уравнение на Кеплер E − e sin E = M. */
function position(o: Orbit, t: number) {
  const M = (o.meanLongitude + o.daily * t - o.perihelion) * DEG;
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - o.e * Math.sin(E) - M) / (1 - o.e * Math.cos(E));
  const nu = 2 * Math.atan2(Math.sqrt(1 + o.e) * Math.sin(E / 2), Math.sqrt(1 - o.e) * Math.cos(E / 2));
  const r = o.a * (1 - o.e * Math.cos(E));
  const lon = nu + o.perihelion * DEG;
  return { x: r * Math.cos(lon), y: r * Math.sin(lon), r };
}

const toPx = (p: { x: number; y: number }) => ({ x: SUN.x + p.x * SCALE, y: SUN.y - p.y * SCALE });

/** Пресечната точка на два лъча (от точка по посока) – там е Марс. */
function intersect(p1: { x: number; y: number }, a1: number, p2: { x: number; y: number }, a2: number) {
  const d1 = { x: Math.cos(a1), y: Math.sin(a1) };
  const d2 = { x: Math.cos(a2), y: Math.sin(a2) };
  const det = d1.x * d2.y - d1.y * d2.x;
  const s = ((p2.x - p1.x) * d2.y - (p2.y - p1.y) * d2.x) / det;
  return { x: p1.x + s * d1.x, y: p1.y + s * d1.y };
}

// Орбитата на Марс – за сравнение накрая
const MARS_ORBIT = Array.from({ length: 181 }, (_, i) => toPx(position(MARS, (i / 180) * MARS_PERIOD)));
const MARS_ORBIT_POINTS = MARS_ORBIT.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

export default function MarsTriangulationLab() {
  const [day, setDay] = useState(120);
  const [points, setPoints] = useState<number[]>([]);
  const [showOrbit, setShowOrbit] = useState(false);

  // Две наблюдения през един период на Марс: Марс е на същото място, а Земята – не
  const earth1 = position(EARTH, day);
  const earth2 = position(EARTH, day + MARS_PERIOD);
  const mars = position(MARS, day);
  // Посоките, които Тихо мери на небето (геоцентричната дължина на Марс)
  const dir1 = Math.atan2(mars.y - earth1.y, mars.x - earth1.x);
  const dir2 = Math.atan2(mars.y - earth2.y, mars.x - earth2.x);
  const found = intersect(earth1, dir1, earth2, dir2);
  const r = Math.hypot(found.x, found.y);

  const recorded = points.map(t => position(MARS, t));
  const radii = recorded.map(p => p.r);
  const rMin = radii.length ? Math.min(...radii) : 0;
  const rMax = radii.length ? Math.max(...radii) : 0;

  const e1 = toPx(earth1);
  const e2 = toPx(earth2);
  const m = toPx(found);
  const ray = (from: { x: number; y: number }, angle: number) => ({
    x: from.x + Math.cos(angle) * 260,
    y: from.y - Math.sin(angle) * 260,
  });
  const r1 = ray(e1, dir1);
  const r2 = ray(e2, dir2);
  const center = toPx({ x: -MARS.a * MARS.e * Math.cos(MARS.perihelion * DEG), y: -MARS.a * MARS.e * Math.sin(MARS.perihelion * DEG) });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Как Кеплер намери орбитата на Марс</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Марс се връща на същото място на всеки 687 дни, а Земята дотогава е обиколила Слънцето 1,88 пъти и е на друго място.
        Двете посоки към Марс, измерени от Тихо, се пресичат точно в Марс.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <clipPath id="mars-triangulation-view">
            <rect x={0} y={0} width={392} height={H} />
          </clipPath>
        </defs>

        <g clipPath="url(#mars-triangulation-view)">
          {/* Орбитата на Земята */}
          <circle cx={SUN.x} cy={SUN.y} r={SCALE} fill="none" stroke="#60a5fa" strokeOpacity="0.35" />
          {showOrbit && (
            <>
              <circle cx={SUN.x} cy={SUN.y} r={MARS.a * SCALE} fill="none" stroke="white" strokeOpacity="0.35" strokeDasharray="4 4" />
              <polyline points={MARS_ORBIT_POINTS} fill="none" stroke="#f87171" strokeWidth="1.5" />
              <circle cx={center.x} cy={center.y} r={2.5} fill="white" fillOpacity="0.7" />
            </>
          )}

          {/* Лъчите на зрението от двете положения на Земята */}
          <line x1={e1.x} y1={e1.y} x2={r1.x} y2={r1.y} stroke="#fde68a" strokeOpacity="0.7" />
          <line x1={e2.x} y1={e2.y} x2={r2.x} y2={r2.y} stroke="#fde68a" strokeOpacity="0.7" strokeDasharray="5 3" />

          <circle cx={SUN.x} cy={SUN.y} r={9} fill="#fcd34d" />
          <circle cx={e1.x} cy={e1.y} r={5} fill="#3b82f6" />
          <circle cx={e2.x} cy={e2.y} r={5} fill="#3b82f6" fillOpacity="0.6" />
          <text x={e1.x + 8} y={e1.y + 4} fontSize="10" fill="#93c5fd">
            Земя, ден {Math.round(day)}
          </text>
          <text x={e2.x + 8} y={e2.y + 14} fontSize="10" fill="#93c5fd" fillOpacity="0.8">
            Земя, +687 дни
          </text>

          {/* Записаните точки */}
          {recorded.map((p, i) => {
            const q = toPx(p);
            return <circle key={i} cx={q.x} cy={q.y} r={3.5} fill="#f87171" />;
          })}
          <circle cx={m.x} cy={m.y} r={6} fill="#ef4444" stroke="white" strokeWidth="1.5" />
        </g>

        {/* Числата */}
        <g fontSize="12" fill="white" transform="translate(410, 36)">
          <text x={0} y={0} fontWeight="700" fill="#fca5a5">
            Марс: r = {fmt(r, 3)} AU
          </text>
          <text x={0} y={24} fillOpacity="0.85">
            Записани точки: {points.length}
          </text>
          {points.length >= 2 && (
            <>
              <text x={0} y={52} fillOpacity="0.85">
                най-близо: {fmt(rMin, 3)} AU
              </text>
              <text x={0} y={72} fillOpacity="0.85">
                най-далеч: {fmt(rMax, 3)} AU
              </text>
              <text x={0} y={100} fill="#fde68a">
                Разлика: {fmt(rMax - rMin, 2)} AU
              </text>
              <text x={0} y={118} fill="#fde68a">
                ≈ {Math.round(((rMax - rMin) / (rMax + rMin)) * 200)}% от средното
              </text>
            </>
          )}
          {showOrbit && (
            <>
              <text x={0} y={156} fill="#f87171">
                — елипса, e = 0,093
              </text>
              <text x={0} y={176} fillOpacity="0.7">
                - - окръжност около Слънцето
              </text>
              <text x={0} y={204} fontSize="11" fillOpacity="0.7">
                Бялата точка е центърът на елипсата –
              </text>
              <text x={0} y={220} fontSize="11" fillOpacity="0.7">
                на {fmt(MARS.a * MARS.e, 2)} AU от Слънцето.
              </text>
            </>
          )}
        </g>
      </LabSvg>

      <label className="block text-sm font-semibold mt-4 mb-1">Ден на първото наблюдение: {Math.round(day)}</label>
      <input type="range" min={0} max={687} step={1} value={day} onChange={e => setDay(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => setPoints(p => (p.includes(day) ? p : [...p, day]))}
          className="px-3 py-1.5 rounded text-sm border border-red-400 bg-red-50 text-red-800 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
        >
          Запиши точката
        </button>
        <button
          onClick={() => setPoints(Array.from({ length: 16 }, (_, i) => Math.round((i * MARS_PERIOD) / 16)))}
          className="px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          16 точки наведнъж
        </button>
        <button
          onClick={() => setShowOrbit(s => !s)}
          className={`px-3 py-1.5 rounded text-sm border ${
            showOrbit
              ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Сравни с окръжност
        </button>
        <button
          onClick={() => setPoints([])}
          className="px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Изчисти
        </button>
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Разстоянието от Слънцето до Марс се мени от 1,38 до 1,67 AU – точките не лежат на окръжност около Слънцето. Окръжност с
        изместен център почти ги покрива – разликата е само няколко ъглови минути. Точно такава разлика от 8′ спрямо наблюденията
        на Тихо кара Кеплер да опита елипса със Слънцето във фокуса. С нея всички наблюдения се подреждат.
      </p>
    </div>
  );
}

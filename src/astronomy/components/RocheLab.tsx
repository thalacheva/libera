import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const CX = 190;
const CY = 160;
const RP = 34; // радиус на планетата в пиксели
const D_MIN = 1.2;
const D_MAX = 4.4;
const MOON_R = 7;
const OMEGA_2 = 1.2; // ъглова скорост в rad/s на разстояние 2 радиуса (за анимацията)

const PLANETS = [
  { id: 'saturn', name: 'Сатурн', radius: 60268, density: 0.69, color: '#e9d18f', rings: [1.24, 2.27] as [number, number] },
  { id: 'jupiter', name: 'Юпитер', radius: 71492, density: 1.33, color: '#d6a46c', rings: null },
  { id: 'neptune', name: 'Нептун', radius: 24764, density: 1.64, color: '#4f7fe0', rings: null },
  { id: 'earth', name: 'Земя', radius: 6371, density: 5.51, color: '#3b82f6', rings: null },
];

const MOONS = [
  { id: 'ice', name: 'леден спътник', density: 0.92, color: '#e0f2fe' },
  { id: 'rock', name: 'скален спътник', density: 3.0, color: '#a8a29e' },
  { id: 'comet', name: 'рохкава комета', density: 0.5, color: '#cbd5e1' },
];

/** Границата на Рош за течно (податливо) тяло, в радиуси на планетата. */
const rocheFluid = (rhoP: number, rhoM: number) => 2.44 * Math.cbrt(rhoP / rhoM);
/** Границата за твърдо тяло, държано само от собствената си гравитация. */
const rocheRigid = (rhoP: number, rhoM: number) => 1.26 * Math.cbrt(rhoP / rhoM);

const omega = (d: number) => OMEGA_2 * (d / 2) ** -1.5;

// Отломките: отклонение по радиус (в радиуси на планетата) и по ъгъл (rad)
const FRAGMENTS = (() => {
  let seed = 4242;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 160 }, () => ({ dr: (rand() - 0.5) * 0.5, dTheta: (rand() - 0.5) * 0.25, size: 0.8 + rand() * 1.4 }));
})();

type Breakup = { t: number; theta: number; d: number };

export default function RocheLab() {
  const [planetIndex, setPlanetIndex] = useState(0);
  const [moonIndex, setMoonIndex] = useState(0);
  const [d, setD] = useState(3.2);
  const [t, setT] = useState(0);
  const [theta, setTheta] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [breakup, setBreakup] = useState<Breakup | null>(null);

  const planet = PLANETS[planetIndex];
  const moon = MOONS[moonIndex];

  useAnimationFrame(playing, dt => {
    setT(v => v + dt);
    setTheta(v => v + omega(d) * dt);
  });

  /** Проверява дали спътникът е вътре в границата и при нужда го разкъсва или „слепва“ отново. */
  const update = (dNew: number, pi: number, mi: number) => {
    const limit = rocheFluid(PLANETS[pi].density, MOONS[mi].density);
    if (dNew < limit && !breakup) {
      setBreakup({ t, theta, d: dNew });
      setPlaying(true);
    } else if (dNew >= limit && breakup) {
      setBreakup(null);
    }
  };

  const fluid = rocheFluid(planet.density, moon.density);
  const rigid = rocheRigid(planet.density, moon.density);
  const ratio = 2 * (planet.density / moon.density) * d ** -3; // приливно ускорение / собствена гравитация
  const stretch = Math.min(1 + 0.9 * (fluid / d) ** 3, 2);

  const mx = CX + d * RP * Math.cos(theta);
  const my = CY - d * RP * Math.sin(theta);
  const rotDeg = (-theta * 180) / Math.PI;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Как се ражда пръстен</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Приближете спътника до планетата. Вътре в пунктираната граница на Рош приливите го разкъсват, а отломките се разтягат в пръстен –
        по-близките обикалят по-бързо.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Реалните пръстени на Сатурн за сравнение */}
        {planet.rings && (
          <g>
            <circle
              cx={CX}
              cy={CY}
              r={((planet.rings[0] + planet.rings[1]) / 2) * RP}
              fill="none"
              stroke="#efe2c0"
              strokeOpacity="0.12"
              strokeWidth={(planet.rings[1] - planet.rings[0]) * RP}
            />
            <text x={CX} y={CY - planet.rings[1] * RP + 12} fontSize="9" textAnchor="middle" fill="#efe2c0" fillOpacity="0.6">
              реалните пръстени
            </text>
          </g>
        )}

        {/* Граници */}
        <circle cx={CX} cy={CY} r={fluid * RP} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={CX + fluid * RP * 0.72} y={CY + fluid * RP * 0.72 + 12} fontSize="10" fill="#fbbf24">
          граница на Рош
        </text>
        <circle cx={CX} cy={CY} r={rigid * RP} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 3" />

        {/* Орбита */}
        {!breakup && <circle cx={CX} cy={CY} r={d * RP} fill="none" stroke="white" strokeOpacity="0.15" />}

        {/* Планетата */}
        <circle cx={CX} cy={CY} r={RP} fill={planet.color} />
        <text x={CX} y={CY + 4} fontSize="11" textAnchor="middle" fill="#0f172a" fontWeight="600">
          {planet.name}
        </text>

        {/* Спътникът – или отломките му */}
        {breakup ? (
          FRAGMENTS.map((f, i) => {
            const r = breakup.d + f.dr;
            const a = breakup.theta + f.dTheta + omega(r) * (t - breakup.t);
            return <circle key={i} cx={CX + r * RP * Math.cos(a)} cy={CY - r * RP * Math.sin(a)} r={f.size} fill={moon.color} fillOpacity="0.85" />;
          })
        ) : (
          <ellipse cx={mx} cy={my} rx={MOON_R * stretch} ry={MOON_R / Math.sqrt(stretch)} fill={moon.color} transform={`rotate(${rotDeg} ${mx} ${my})`} />
        )}

        {/* Отдясно – силите върху спътника */}
        <g transform="translate(510, 110)">
          <text x={0} y={-72} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
            силите в спътника
          </text>
          <text x={-80} y={-50} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
            ← към планетата
          </text>
          {breakup ? (
            <text x={0} y={4} fontSize="12" textAnchor="middle" fill="#fbbf24">
              💥 разкъсан
            </text>
          ) : (
            <g>
              <ellipse rx={36 * stretch} ry={36 / Math.sqrt(stretch)} fill={moon.color} fillOpacity="0.85" />
              {/* Самогравитация – стрелки навътре */}
              {[90, 270].map(a => {
                const y = a === 90 ? -36 / Math.sqrt(stretch) : 36 / Math.sqrt(stretch);
                const dir = a === 90 ? 1 : -1;
                return <line key={a} x1={0} y1={y - dir * 22} x2={0} y2={y - dir * 4} stroke="#22c55e" strokeWidth="3" markerEnd="url(#rl-arrow-g)" />;
              })}
              {/* Прилив – стрелки навън по линията към планетата */}
              {[-1, 1].map(dir => {
                const x0 = dir * 36 * stretch;
                const len = Math.min(42, 22 * ratio * 3);
                return <line key={dir} x1={x0} y1={0} x2={x0 + dir * len} y2={0} stroke="#ef4444" strokeWidth="3" markerEnd="url(#rl-arrow-r)" />;
              })}
            </g>
          )}
        </g>
        <defs>
          <marker id="rl-arrow-g" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
          </marker>
          <marker id="rl-arrow-r" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>
        <text x={510} y={215} fontSize="10" textAnchor="middle" fill="#ef4444">
          прилив / собствена гравитация = {fmt(ratio, 2)}
        </text>
        <text x={510} y={232} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          разстояние: {fmt(d, 2)} R = {fmt(d * planet.radius, 0)} km
        </text>
        <text x={510} y={256} fontSize="10" textAnchor="middle" fill="#fbbf24">
          граница за течно тяло: {fmt(fluid, 2)} R
        </text>
        <text x={510} y={272} fontSize="10" textAnchor="middle" fill="#94a3b8">
          за твърдо тяло: {fmt(rigid, 2)} R
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {PLANETS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setPlanetIndex(i);
              update(d, i, moonIndex);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              i === planetIndex
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name} ({fmt(p.density, 2)} g/cm³)
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {MOONS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => {
              setMoonIndex(i);
              update(d, planetIndex, i);
            }}
            className={`px-2 py-1 rounded text-xs border ${
              i === moonIndex
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.name} ({fmt(m.density, 2)} g/cm³)
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold mt-4 mb-1">Разстояние до центъра на планетата: {fmt(d, 2)} радиуса</label>
      <input
        type="range"
        min={D_MIN}
        max={D_MAX}
        step="0.02"
        value={d}
        onChange={e => {
          const v = Number(e.target.value);
          setD(v);
          update(v, planetIndex, moonIndex);
        }}
        className="w-full"
      />
      <div className="flex justify-center mt-2">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-amber-600 text-white text-sm hover:bg-amber-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        {breakup
          ? 'Спътникът е разкъсан. Отломките не могат да се слепят обратно, защото приливът е по-силен от взаимното им привличане – затова пръстените съществуват само близо до планетата. Изтеглете спътника отвъд границата и отломките отново ще се съберат в едно тяло.'
          : d < fluid * 1.4
            ? 'Приливът разтяга спътника по линията към планетата – той вече е издължен. Течно или рохкаво тяло ще се разпадне на границата на Рош, а здраво скално тяло може да оцелее малко по-навътре.'
            : 'Далеч от планетата собствената гравитация на спътника лесно надвива разликата в привличането между близката и далечната му страна.'}
      </p>
    </div>
  );
}

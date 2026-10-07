import { useState } from 'react';

const W = 640;
const H = 280;
const S_EARTH = 1361; // W/m²
const SUN = { x: 40, y: 140 };
const UNIT = 95; // пиксела за 1 AU в лявата схема

const PLANETS = [
  { name: 'Меркурий', d: 0.387, albedo: 0.07, actual: '−173 … +427 °C (без атмосфера)' },
  { name: 'Венера', d: 0.723, albedo: 0.76, actual: '+464 °C (парников ефект!)' },
  { name: 'Земя', d: 1, albedo: 0.31, actual: '+15 °C средно' },
  { name: 'Марс', d: 1.524, albedo: 0.25, actual: '−63 °C средно' },
  { name: 'Юпитер', d: 5.203, albedo: 0.34, actual: '−108 °C (горе в облаците)' },
  { name: 'Сатурн', d: 9.537, albedo: 0.34, actual: '−139 °C' },
  { name: 'Уран', d: 19.19, albedo: 0.3, actual: '−197 °C' },
  { name: 'Нептун', d: 30.07, albedo: 0.29, actual: '−201 °C' },
];

const fmt = (v: number, d = 0) => v.toLocaleString('bg-BG', { maximumFractionDigits: d });

export default function SolarConstantLab() {
  const [index, setIndex] = useState(2);
  const planet = PLANETS[index];
  const S = S_EARTH / planet.d ** 2;
  const tEq = (278 * (1 - planet.albedo) ** 0.25) / Math.sqrt(planet.d);
  const angular = 32 / planet.d; // ъглов диаметър в минути
  const lightTime = 499 * planet.d; // s

  // Сферата на разстояние d: квадратчето „1 m²“ на 1 AU става d² пъти по-голямо
  const half = 14;
  const squares = [1, 2, 3].map(k => ({ k, x: SUN.x + k * UNIT, h: half * k }));

  // Видимото Слънце вдясно: при Земята радиус 40 px
  const diskR = Math.max(1.5, 40 / planet.d);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко слънце получава всяка планета</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Енергията на Слънцето се разлива по все по-голяма сфера. Два пъти по-далеч същият сноп покрива 4 пъти по-голяма площ – и всеки
        квадратен метър получава 4 пъти по-малко.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="sc-sun">
            <stop offset="0" stopColor="#fff7d6" />
            <stop offset="0.7" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#f59e0b" />
          </radialGradient>
          <radialGradient id="sc-glow">
            <stop offset="0.5" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Снопът */}
        <polygon
          points={`${SUN.x},${SUN.y} ${SUN.x + 3.4 * UNIT},${SUN.y - 3.4 * half} ${SUN.x + 3.4 * UNIT},${SUN.y + 3.4 * half}`}
          fill="#fbbf24"
          fillOpacity="0.1"
        />
        <line x1={SUN.x} y1={SUN.y} x2={SUN.x + 3.4 * UNIT} y2={SUN.y - 3.4 * half} stroke="#fbbf24" strokeOpacity="0.5" />
        <line x1={SUN.x} y1={SUN.y} x2={SUN.x + 3.4 * UNIT} y2={SUN.y + 3.4 * half} stroke="#fbbf24" strokeOpacity="0.5" />
        {squares.map(s => (
          <g key={s.k}>
            {/* Квадрат в перспектива, разделен на k × k клетки */}
            {Array.from({ length: s.k + 1 }, (_, i) => (
              <line key={`h${i}`} x1={s.x - s.h * 0.35} x2={s.x + s.h * 0.35} y1={SUN.y - s.h + (2 * s.h * i) / s.k} y2={SUN.y - s.h + (2 * s.h * i) / s.k} stroke="#fde68a" strokeOpacity="0.8" />
            ))}
            {Array.from({ length: s.k + 1 }, (_, i) => (
              <line key={`v${i}`} x1={s.x - s.h * 0.35 + (0.7 * s.h * i) / s.k} x2={s.x - s.h * 0.35 + (0.7 * s.h * i) / s.k} y1={SUN.y - s.h} y2={SUN.y + s.h} stroke="#fde68a" strokeOpacity="0.8" />
            ))}
            <polygon
              points={`${s.x - s.h * 0.35},${SUN.y - s.h} ${s.x + s.h * 0.35},${SUN.y - s.h} ${s.x + s.h * 0.35},${SUN.y + s.h} ${s.x - s.h * 0.35},${SUN.y + s.h}`}
              fill="#fde68a"
              fillOpacity={0.35 / (s.k * s.k)}
              stroke="#fde68a"
            />
            <text x={s.x} y={SUN.y + s.h + 18} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
              {s.k} AU
            </text>
            <text x={s.x} y={SUN.y - s.h - 8} fontSize="11" textAnchor="middle" fill="#fde68a">
              {s.k === 1 ? 'S' : `S / ${s.k * s.k}`}
            </text>
          </g>
        ))}
        <circle cx={SUN.x} cy={SUN.y} r={26} fill="url(#sc-glow)" />
        <circle cx={SUN.x} cy={SUN.y} r={14} fill="url(#sc-sun)" />

        {/* Небето на избраната планета */}
        <rect x={405} y={20} width={220} height={220} rx="10" fill={planet.d < 2 ? '#1e3a8a' : '#020617'} />
        <circle cx={515} cy={125} r={diskR * 2.2} fill="url(#sc-glow)" opacity={Math.min(1, 1.5 / planet.d)} />
        <circle cx={515} cy={125} r={diskR} fill="url(#sc-sun)" />
        <text x={515} y={258} fontSize="12" textAnchor="middle" fill="white">
          Слънцето, видяно от {planet.name === 'Земя' ? 'Земята' : planet.name}
        </text>
        <text x={515} y={40} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          ъглов диаметър {fmt(angular, 1)}′
        </text>
      </svg>

      <div className="flex flex-wrap gap-1 mt-3">
        {PLANETS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setIndex(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === index
                ? 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Разстояние', value: `${fmt(planet.d, 3)} AU` },
          { label: 'Поток S = S⊕ / d²', value: `${fmt(S, S < 10 ? 1 : 0)} W/m²` },
          { label: 'Светлината пътува', value: lightTime < 3600 ? `${fmt(lightTime / 60, 1)} min` : `${fmt(lightTime / 3600, 1)} h` },
          { label: 'Равновесна температура', value: `${fmt(tEq)} K (${fmt(tEq - 273)} °C)` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        Равновесната температура T ≈ 278 K · (1 − A)^¼ / √d отчита само колко светлина поглъща планетата (A е отражателната
        способност, албедото). Измерената температура е <strong>{planet.actual}</strong>
        {planet.name === 'Венера' || planet.name === 'Земя' ? ' – разликата идва от атмосферата.' : '.'}
      </p>
    </div>
  );
}

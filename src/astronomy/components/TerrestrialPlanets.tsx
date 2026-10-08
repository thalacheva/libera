import { useState } from 'react';
import { fmt, TERRESTRIAL, type PlanetId } from './terrestrialData';

const W = 640;
const H = 220;
const CY = 105;
const SCALE = 70 / 6371; // пиксела на km – Земята е с радиус 70 px

const MOON_R = 1737 * SCALE;

// Къде стоят центровете на дисковете по хоризонтала
const X: Record<PlanetId | 'moon', number> = { mercury: 50, venus: 155, earth: 306, mars: 448, moon: 560 };

const HIGHLIGHTS: Record<PlanetId, { text: string; tone: string }> = {
  mercury: {
    tone: 'bg-stone-100/70 dark:bg-stone-500/10',
    text: 'Най-малката планета – по-малка дори от спътниците Ганимед и Титан. Огромното ѝ желязно ядро заема ~85% от радиуса. Повърхността е покрита с кратери като лунната, но и с дълги стотици километри стъпаловидни разломи: докато ядрото е изстивало, планетата се е свила с ~7 km по радиус. В постоянно засенчени кратери при полюсите има воден лед – на планетата, най-близка до Слънцето!',
  },
  venus: {
    tone: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'Почти близнак на Земята по размер и маса, но с най-негостоприемната повърхност в Слънчевата система: 464 °C – по-горещо от Меркурий и достатъчно, за да се разтопи олово, – и налягане като на 900 m под водата. Повърхността е скрита под облаци от сярна киселина; картографирана е с радар („Магелан“, 1990–1994). Върти се обратно и толкова бавно, че денят ѝ е по-дълъг от годината.',
  },
  earth: {
    tone: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'Най-голямата и най-плътната от скалистите планети. Единствената с течна вода на повърхността, тектоника на плочите и атмосфера, богата на кислород – произведен от живите организми. Силното магнитно поле, създавано от течното външно ядро, отклонява слънчевия вятър. Луната е необичайно голяма спрямо планетата и стабилизира наклона на оста ѝ.',
  },
  mars: {
    tone: 'bg-red-50 dark:bg-red-500/10',
    text: 'Червен е заради железния оксид (ръжда) в праха. Наклонът на оста е почти като земния, затова има сезони, а полярните шапки от воден лед и сух лед (CO₂) растат и се топят. Тук са Олимп (висок ~22 km, 2,5 пъти колкото Еверест) – най-високият вулкан в Слънчевата система, и каньонът Valles Marineris – дълъг 4000 km. Сухи речни долини и делти показват, че преди ~3,5 млрд. години по повърхността е текла вода.',
  },
};

export default function TerrestrialPlanets() {
  const [selected, setSelected] = useState<PlanetId>('earth');
  const planet = TERRESTRIAL.find(p => p.id === selected)!;

  const stats = [
    { label: 'Радиус', value: `${fmt(planet.radius, 0)} km`, note: `${fmt(planet.radius / 6371, 2)} R⊕` },
    { label: 'Маса', value: `${fmt(planet.mass, 3)} M⊕`, note: '' },
    { label: 'Средна плътност', value: `${fmt(planet.density, 2)} g/cm³`, note: '' },
    { label: 'g на повърхността', value: `${fmt(planet.gravity, 2)} m/s²`, note: `${fmt(planet.gravity / 9.81, 2)} g⊕` },
    { label: 'Втора космическа скорост', value: `${fmt(planet.escape, 1)} km/s`, note: '' },
    { label: 'Разстояние от Слънцето', value: `${fmt(planet.a, 3)} AU`, note: `e = ${fmt(planet.e, 3)}` },
    { label: 'Година', value: `${fmt(planet.year, 1)} дни`, note: '' },
    {
      label: 'Въртене (сидерично)',
      value: Math.abs(planet.rotation) < 2 ? `${fmt(Math.abs(planet.rotation) * 24, 2)} h` : `${fmt(Math.abs(planet.rotation), 1)} дни`,
      note: planet.rotation < 0 ? 'обратно' : '',
    },
    { label: 'Слънчево денонощие', value: planet.solarDay, note: '' },
    { label: 'Наклон на оста', value: `${fmt(planet.tilt, 1)}°`, note: '' },
    { label: 'Налягане', value: planet.pressure, note: '' },
    { label: 'Спътници', value: planet.moons, note: '' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Четирите скалисти свята в един и същ мащаб</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Щракнете върху планета. Луната е добавена за сравнение.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="tp-shade" cx="0.35" cy="0.35" r="0.75">
            <stop offset="0" stopColor="white" stopOpacity="0.25" />
            <stop offset="0.6" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.55" />
          </radialGradient>
          {TERRESTRIAL.map(p => (
            <clipPath key={p.id} id={`tp-clip-${p.id}`}>
              <circle cx={X[p.id]} cy={CY} r={p.radius * SCALE} />
            </clipPath>
          ))}
          <clipPath id="tp-clip-moon">
            <circle cx={X.moon} cy={CY} r={MOON_R} />
          </clipPath>
        </defs>

        {/* Меркурий – кратери */}
        <g clipPath="url(#tp-clip-mercury)">
          <circle cx={X.mercury} cy={CY} r={2440 * SCALE} fill="#a8a29e" />
          {[
            [-10, -8, 5],
            [8, 4, 6],
            [-4, 12, 3],
            [12, -12, 3],
            [-16, 6, 2.5],
            [2, -16, 2],
          ].map(([dx, dy, r], i) => (
            <circle key={i} cx={X.mercury + dx} cy={CY + dy} r={r} fill="#78716c" stroke="#d6d3d1" strokeWidth="0.6" />
          ))}
        </g>

        {/* Венера – облачни ивици */}
        <g clipPath="url(#tp-clip-venus)">
          <circle cx={X.venus} cy={CY} r={6052 * SCALE} fill="#fcd34d" />
          {[-40, -18, 6, 30, 52].map((dy, i) => (
            <ellipse key={i} cx={X.venus + (i % 2 ? 12 : -10)} cy={CY + dy} rx="80" ry="8" fill="#fef3c7" fillOpacity="0.45" transform={`rotate(-12 ${X.venus} ${CY})`} />
          ))}
        </g>

        {/* Земя – океани, континенти, облаци */}
        <g clipPath="url(#tp-clip-earth)">
          <circle cx={X.earth} cy={CY} r={70} fill="#2563eb" />
          <path d={`M ${X.earth - 40} ${CY - 45} q 30 -10 40 10 q 5 25 -15 35 q -10 20 -5 45 q -25 -10 -30 -40 q -15 -25 10 -50 z`} fill="#16a34a" />
          <path d={`M ${X.earth + 15} ${CY - 30} q 25 -5 40 15 q 5 20 -10 30 q -20 5 -25 -15 z`} fill="#65a30d" />
          <ellipse cx={X.earth} cy={CY - 66} rx="50" ry="10" fill="white" />
          <ellipse cx={X.earth} cy={CY + 68} rx="50" ry="9" fill="white" />
          <path d={`M ${X.earth - 60} ${CY + 15} q 40 -10 80 5 q 30 10 50 -5`} stroke="white" strokeOpacity="0.7" strokeWidth="5" fill="none" />
        </g>

        {/* Марс – тъмни области и полярна шапка */}
        <g clipPath="url(#tp-clip-mars)">
          <circle cx={X.mars} cy={CY} r={3390 * SCALE} fill="#dc6b3f" />
          <path d={`M ${X.mars - 35} ${CY + 2} q 20 -12 40 0 q 15 8 30 -2 l 0 10 q -20 10 -40 0 q -15 -5 -30 4 z`} fill="#92400e" fillOpacity="0.6" />
          <ellipse cx={X.mars} cy={CY - 36} rx="14" ry="5" fill="white" />
          <line x1={X.mars - 18} y1={CY - 10} x2={X.mars + 14} y2={CY - 6} stroke="#7c2d12" strokeWidth="1.5" />
        </g>

        {/* Луна – морета */}
        <g clipPath="url(#tp-clip-moon)">
          <circle cx={X.moon} cy={CY} r={MOON_R} fill="#d4d4d4" />
          <circle cx={X.moon - 5} cy={CY - 5} r="5" fill="#a3a3a3" />
          <circle cx={X.moon + 6} cy={CY + 3} r="4" fill="#a3a3a3" />
        </g>

        {/* Обемно засенчване и рамка на избраната */}
        {TERRESTRIAL.map(p => (
          <g key={p.id} className="cursor-pointer" onClick={() => setSelected(p.id)}>
            <circle cx={X[p.id]} cy={CY} r={p.radius * SCALE} fill="url(#tp-shade)" />
            {selected === p.id && (
              <circle cx={X[p.id]} cy={CY} r={p.radius * SCALE + 5} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" />
            )}
            <text x={X[p.id]} y={CY + 95} fontSize="12" textAnchor="middle" fill="white" fontWeight={selected === p.id ? 700 : 400}>
              {p.name}
            </text>
            <text x={X[p.id]} y={CY + 110} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {fmt(p.radius * 2, 0)} km
            </text>
          </g>
        ))}
        <circle cx={X.moon} cy={CY} r={MOON_R} fill="url(#tp-shade)" />
        <text x={X.moon} y={CY + 95} fontSize="12" textAnchor="middle" fill="white" fillOpacity="0.7">
          Луна
        </text>
        <text x={X.moon} y={CY + 110} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.5">
          3 474 km
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {TERRESTRIAL.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`px-3 py-1 rounded text-sm border ${
              selected === p.id
                ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: p.color }} />
            {p.symbol} {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-sm">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
            {s.note && <div className="text-xs text-gray-500 dark:text-gray-400">{s.note}</div>}
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mt-2 text-sm">
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400">Атмосфера: </span>
          {planet.atmosphere}
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400">Температура на повърхността: </span>
          {planet.temperature}
        </div>
      </div>

      <p className={`mt-3 p-3 rounded-lg text-sm sm:text-base ${HIGHLIGHTS[selected].tone}`}>{HIGHLIGHTS[selected].text}</p>
    </div>
  );
}

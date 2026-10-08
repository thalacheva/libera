import { useState } from 'react';
import { fmt } from './terrestrialData';
import { GIANTS, rotationText, type GiantId } from './giantData';

const W = 760;
const H = 250;
const CY = 110;
const SCALE = 80 / 71492; // пиксела на km – Юпитер е с радиус 80 px

const EARTH_R = 6371 * SCALE;

// Къде стоят центровете на дисковете по хоризонтала
const X: Record<GiantId | 'earth', number> = { jupiter: 95, earth: 200, saturn: 385, uranus: 595, neptune: 690 };

// Пръстените на Сатурн: вътрешен и външен радиус в km
const SATURN_RINGS = [
  { name: 'C', from: 74500, to: 92000, color: '#a8977a', opacity: 0.45 },
  { name: 'B', from: 92000, to: 117580, color: '#efe2c0', opacity: 0.95 },
  { name: 'A', from: 122170, to: 136775, color: '#d9c9a3', opacity: 0.8 },
];

const HIGHLIGHTS: Record<GiantId, { text: string; tone: string }> = {
  jupiter: {
    tone: 'bg-orange-50 dark:bg-orange-500/10',
    text: 'Най-голямата планета – 2,5 пъти по-масивна от всички останали взети заедно. В обема ѝ се побират ~1300 Земи. Върти се най-бързо от всички планети: денят е под 10 часа, затова е видимо сплескана, а облаците са изтеглени в ивици, успоредни на екватора. Великото червено петно е антициклон, наблюдаван поне от 1830 г. (а вероятно и от 1665 г.). Юпитер излъчва ~1,7 пъти повече енергия, отколкото получава от Слънцето – той все още изстива и се свива след раждането си.',
  },
  saturn: {
    tone: 'bg-yellow-50 dark:bg-yellow-500/10',
    text: 'Средната плътност е 0,69 g/cm³ – по-малка от тази на водата. Най-сплесканата планета: екваториалният диаметър е с ~10% по-голям от полярния. Главните пръстени са широки ~62 000 km, но обикновено са дебели около 10 m. Над северния полюс се върти шестоъгълна струйна система, по-широка от две Земи. Сатурн излъчва ~1,8 пъти повече, отколкото получава: в недрата му хелият се сгъстява в капки и „вали“ към центъра, като освобождава енергия.',
  },
  uranus: {
    tone: 'bg-cyan-50 dark:bg-cyan-500/10',
    text: 'Първата планета, открита с телескоп – от Уилям Хершел през 1781 г. Оста ѝ е наклонена на 98° и планетата обикаля Слънцето „легнала“. Затова всеки полюс има по 42 години ден и 42 години нощ. Синьо-зеленият цвят идва от метана, който поглъща червената светлина. Уран почти не излъчва собствена топлина – загадка, свързана може би с гигантския сблъсък, който го е обърнал. Единствената сонда, посетила Уран, е „Вояджър 2“ през 1986 г.',
  },
  neptune: {
    tone: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'Открит през 1846 г. не с търсене, а с изчисление: Урбен льо Верие предсказва къде трябва да е непознатата планета, която смущава движението на Уран, и Йохан Гале я намира на по-малко от 1° от предсказаното място още същата нощ. Ветровете на Нептун са най-силните в Слънчевата система – до ~2100 km/h. Нептун излъчва 2,6 пъти повече, отколкото получава – затова атмосферата му е толкова бурна, въпреки че Слънцето е 900 пъти по-слабо, отколкото при Земята.',
  },
};

export default function GiantPlanets() {
  const [selected, setSelected] = useState<GiantId>('jupiter');
  const planet = GIANTS.find(p => p.id === selected)!;

  const stats = [
    { label: 'Екв. радиус', value: `${fmt(planet.radius, 0)} km`, note: `${fmt(planet.radius / 6378, 2)} R⊕` },
    { label: 'Маса', value: `${fmt(planet.mass, 1)} M⊕`, note: `${fmt(planet.mass / 317.8, 3)} M♃` },
    { label: 'Средна плътност', value: `${fmt(planet.density, 2)} g/cm³`, note: planet.density < 1 ? 'по-малка от водата!' : '' },
    { label: 'g при 1 bar', value: `${fmt(planet.gravity, 2)} m/s²`, note: `${fmt(planet.gravity / 9.81, 2)} g⊕` },
    { label: 'Втора космическа скорост', value: `${fmt(planet.escape, 1)} km/s`, note: '' },
    { label: 'Разстояние от Слънцето', value: `${fmt(planet.a, 2)} AU`, note: `светлината идва за ${fmt((planet.a * 499) / 3600, 1)} h` },
    { label: 'Година', value: `${fmt(planet.year, 2)} г.`, note: '' },
    { label: 'Въртене', value: rotationText(planet.rotation), note: planet.rotation < 0 ? 'обратно' : '' },
    { label: 'Наклон на оста', value: `${fmt(planet.tilt, 1)}°`, note: '' },
    { label: 'Сплескване', value: `${fmt(planet.flattening * 100, 1)}%`, note: 'Земя: 0,3%' },
    { label: 'T при 1 bar', value: `${planet.T1bar} K`, note: `${planet.T1bar - 273} °C` },
    { label: 'Излъчва / получава', value: `${fmt(planet.heat, 1)}×`, note: 'вътрешна топлина' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Четирите гиганта в един и същ мащаб</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Щракнете върху планета. Малката синя точка до Юпитер е Земята.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="gp-shade" cx="0.35" cy="0.35" r="0.75">
            <stop offset="0" stopColor="white" stopOpacity="0.2" />
            <stop offset="0.6" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.55" />
          </radialGradient>
          {GIANTS.map(p => (
            <clipPath key={p.id} id={`gp-clip-${p.id}`}>
              <ellipse cx={X[p.id]} cy={CY} rx={p.radius * SCALE} ry={p.radius * SCALE * (1 - p.flattening)} />
            </clipPath>
          ))}
          {/* Задната и предната половина на пръстените (в собствената им координатна система) */}
          <clipPath id="gp-ring-back">
            <rect x={-200} y={-200} width={400} height={200} />
          </clipPath>
          <clipPath id="gp-ring-front">
            <rect x={-200} y={0} width={400} height={200} />
          </clipPath>
        </defs>

        {/* Сатурн – задната половина на пръстените */}
        <g transform={`translate(${X.saturn} ${CY}) rotate(-12) scale(1 0.32)`} clipPath="url(#gp-ring-back)" pointerEvents="none">
          {SATURN_RINGS.map(r => (
            <circle key={r.name} r={((r.from + r.to) / 2) * SCALE} fill="none" stroke={r.color} strokeOpacity={r.opacity} strokeWidth={(r.to - r.from) * SCALE} />
          ))}
        </g>

        {/* Уран – тесните пръстени стоят почти вертикално */}
        <g transform={`translate(${X.uranus} ${CY}) rotate(-82) scale(1 0.3)`} clipPath="url(#gp-ring-back)" pointerEvents="none">
          {[44700, 47200, 51150].map(r => (
            <circle key={r} r={r * SCALE} fill="none" stroke="#94a3b8" strokeOpacity="0.6" strokeWidth="1" />
          ))}
        </g>

        {/* Юпитер – ивици и Червеното петно */}
        <g clipPath="url(#gp-clip-jupiter)">
          <rect x={X.jupiter - 80} y={CY - 80} width={160} height={160} fill="#e8cfa8" />
          {[
            [-62, 14, '#b08a63'],
            [-36, 9, '#a0714a'],
            [-22, 12, '#c28d5c'],
            [12, 13, '#a96f45'],
            [34, 7, '#b88a62'],
            [52, 10, '#9e7a5a'],
          ].map(([dy, h, c], i) => (
            <rect key={i} x={X.jupiter - 80} y={CY + (dy as number)} width={160} height={h as number} fill={c as string} />
          ))}
          <ellipse cx={X.jupiter + 22} cy={CY + 30} rx="9" ry="5.5" fill="#c2410c" />
        </g>

        {/* Земята за сравнение */}
        <circle cx={X.earth} cy={CY} r={EARTH_R} fill="#3b82f6" />
        <circle cx={X.earth} cy={CY} r={EARTH_R} fill="url(#gp-shade)" />

        {/* Сатурн – диск с бледи ивици */}
        <g clipPath="url(#gp-clip-saturn)">
          <rect x={X.saturn - 70} y={CY - 70} width={140} height={140} fill="#e9d18f" />
          {[-50, -28, -8, 18, 40].map((dy, i) => (
            <rect key={i} x={X.saturn - 70} y={CY + dy} width={140} height={i % 2 ? 6 : 10} fill="#c8a96a" fillOpacity="0.5" />
          ))}
          <rect x={X.saturn - 70} y={CY - 70} width={140} height={14} fill="#a3a77a" fillOpacity="0.5" />
        </g>

        {/* Сатурн – предната половина на пръстените */}
        <g transform={`translate(${X.saturn} ${CY}) rotate(-12) scale(1 0.32)`} clipPath="url(#gp-ring-front)" pointerEvents="none">
          {SATURN_RINGS.map(r => (
            <circle key={r.name} r={((r.from + r.to) / 2) * SCALE} fill="none" stroke={r.color} strokeOpacity={r.opacity} strokeWidth={(r.to - r.from) * SCALE} />
          ))}
        </g>

        {/* Уран – гладък синьо-зелен диск */}
        <g clipPath="url(#gp-clip-uranus)">
          <circle cx={X.uranus} cy={CY} r={30} fill="#9fdde6" />
        </g>
        <g transform={`translate(${X.uranus} ${CY}) rotate(-82) scale(1 0.3)`} clipPath="url(#gp-ring-front)" pointerEvents="none">
          {[44700, 47200, 51150].map(r => (
            <circle key={r} r={r * SCALE} fill="none" stroke="#94a3b8" strokeOpacity="0.6" strokeWidth="1" />
          ))}
        </g>

        {/* Нептун – синьо с тъмно петно и бели облаци */}
        <g clipPath="url(#gp-clip-neptune)">
          <circle cx={X.neptune} cy={CY} r={30} fill="#4f7fe0" />
          <rect x={X.neptune - 30} y={CY + 10} width={60} height={4} fill="#3b63bd" />
          <ellipse cx={X.neptune - 6} cy={CY - 8} rx="6" ry="3.5" fill="#1e3a8a" />
          <ellipse cx={X.neptune + 2} cy={CY - 13} rx="5" ry="1.2" fill="white" fillOpacity="0.8" />
        </g>

        {/* Обемно засенчване, рамка на избраната и надписи */}
        {GIANTS.map(p => {
          const r = p.radius * SCALE;
          return (
            <g key={p.id} className="cursor-pointer" onClick={() => setSelected(p.id)}>
              <ellipse cx={X[p.id]} cy={CY} rx={r} ry={r * (1 - p.flattening)} fill="url(#gp-shade)" />
              {selected === p.id && <circle cx={X[p.id]} cy={CY} r={r + 6} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" />}
              <text x={X[p.id]} y={CY + 108} fontSize="12" textAnchor="middle" fill="white" fontWeight={selected === p.id ? 700 : 400}>
                {p.name}
              </text>
              <text x={X[p.id]} y={CY + 123} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
                {fmt(p.radius * 2, 0)} km
              </text>
            </g>
          );
        })}
        <text x={X.earth} y={CY + 108} fontSize="12" textAnchor="middle" fill="white" fillOpacity="0.7">
          Земя
        </text>
        <text x={X.earth} y={CY + 123} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.5">
          12 756 km
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {GIANTS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`px-3 py-1 rounded text-sm border ${
              selected === p.id
                ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
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
          <span className="text-xs text-gray-600 dark:text-gray-400">Магнитно поле: </span>
          {planet.field}
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400">Спътници: </span>
          {planet.moons}
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400">Пръстени: </span>
          {planet.rings}
        </div>
      </div>

      <p className={`mt-3 p-3 rounded-lg text-sm sm:text-base ${HIGHLIGHTS[selected].tone}`}>{HIGHLIGHTS[selected].text}</p>
    </div>
  );
}

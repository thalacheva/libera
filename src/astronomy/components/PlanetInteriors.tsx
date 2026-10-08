import { useState } from 'react';
import { fmt, TERRESTRIAL, type PlanetId } from './terrestrialData';

const W = 640;
const H = 320;
const CX = 160;
const CY = 160;
const SCALE = 140 / 6371; // Земята – 140 px радиус, останалите в същия мащаб
const MIN_CRUST = 3; // кората е твърде тънка – рисуваме я поне 3 px

type Layer = { name: string; to: number; color: string; text: string };

const INTERIORS: Record<PlanetId, { layers: Layer[]; field: string }> = {
  mercury: {
    field: 'Слабо глобално магнитно поле (~1% от земното) – значи част от ядрото е течна.',
    layers: [
      { name: 'Ядро (Fe–Ni)', to: 0.83, color: '#94a3b8', text: 'Огромно желязно ядро с радиус ~2000 km – около 70% от масата на планетата. Може би е останало, след като гигантски сблъсък в младостта ѝ е отнесъл голяма част от скалната мантия.' },
      { name: 'Мантия', to: 0.986, color: '#a16207', text: 'Тънка силикатна мантия – само ~400 km.' },
      { name: 'Кора', to: 1, color: '#d6d3d1', text: 'Кора от ~35 km, покрита с кратери и пресечена от разломи, образувани при свиването на планетата.' },
    ],
  },
  venus: {
    field: 'Няма собствено магнитно поле. Вероятно бавното въртене и липсата на тектоника на плочите спират конвекцията в ядрото.',
    layers: [
      { name: 'Ядро (Fe–Ni)', to: 0.5, color: '#94a3b8', text: 'Предполага се желязно ядро с радиус ~3000 km. Не знаем дали е течно – сеизмични измервания на Венера още не са правени.' },
      { name: 'Мантия', to: 0.995, color: '#b45309', text: 'Силикатна мантия, подобна на земната. Липсата на подвижни плочи кара топлината да се натрупва и да се освобождава рядко, при масови вулканични изригвания.' },
      { name: 'Кора', to: 1, color: '#fcd34d', text: 'Базалтова кора от ~30 km. Повърхността е само на ~500 млн. години – цялата планета е била „заляна“ с лава.' },
    ],
  },
  earth: {
    field: 'Силно магнитно поле, създавано от конвекцията в течното външно ядро (геодинамо).',
    layers: [
      { name: 'Вътрешно ядро', to: 0.19, color: '#e2e8f0', text: 'Твърда желязо-никелова топка с радиус ~1220 km и температура ~5400 °C – колкото повърхността на Слънцето. Твърдо е въпреки жегата, защото налягането е огромно.' },
      { name: 'Външно ядро', to: 0.55, color: '#f59e0b', text: 'Течно желязо, дебело ~2260 km. Движението му създава земното магнитно поле. Знаем, че е течно, защото напречните сеизмични вълни (S) не минават през него.' },
      { name: 'Мантия', to: 0.995, color: '#dc2626', text: 'Горещи силикатни скали, дебели ~2900 km. Твърди са, но за милиони години текат бавно – тази конвекция движи литосферните плочи.' },
      { name: 'Кора', to: 1, color: '#65a30d', text: 'Само 5–10 km под океаните и 30–70 km под континентите. В мащаба на чертежа е по-тънка от линия.' },
    ],
  },
  mars: {
    field: 'Днес няма глобално поле, но намагнитените древни скали показват, че преди ~4 млрд. години е имало.',
    layers: [
      { name: 'Ядро (Fe, S)', to: 0.54, color: '#94a3b8', text: 'Течно ядро с радиус ~1800 km, богато на сяра и затова по-леко. Размерът му е измерен през 2021 г. от сеизмометъра на сондата InSight.' },
      { name: 'Мантия', to: 0.985, color: '#b45309', text: 'Силикатна мантия. Без тектоника на плочите горещите петна под вулканите са стояли на едно място – така са израснали гиганти като Олимп.' },
      { name: 'Кора', to: 1, color: '#dc6b3f', text: 'Дебела ~40–70 km. Южното полукълбо е по-високо и по-старо от северното.' },
    ],
  },
};

// Радиус на металното ядро като дял от радиуса на тялото
const CORES = [
  { name: 'Меркурий', core: 0.83, density: 5.43 },
  { name: 'Венера', core: 0.5, density: 5.24 },
  { name: 'Земя', core: 0.55, density: 5.51 },
  { name: 'Марс', core: 0.54, density: 3.93 },
  { name: 'Луна', core: 0.2, density: 3.34 },
];

export default function PlanetInteriors() {
  const [planetId, setPlanetId] = useState<PlanetId>('earth');
  const [layerIndex, setLayerIndex] = useState(0);
  const planet = TERRESTRIAL.find(p => p.id === planetId)!;
  const { layers, field } = INTERIORS[planetId];
  const layer = layers[Math.min(layerIndex, layers.length - 1)];
  const R = planet.radius * SCALE;

  // Радиуси за чертане (кората се удебелява, за да се вижда)
  const drawTo = layers.map((l, i) => (i === layers.length - 1 ? R : Math.min(l.to * R, R - MIN_CRUST)));

  const choosePlanet = (id: PlanetId) => {
    setPlanetId(id);
    setLayerIndex(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Какво има вътре</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Разрез на планетите в общ мащаб. Щракнете върху слой. Вдясно – колко голямо е металното ядро на всяко тяло.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <clipPath id="pi-left">
            <rect x={0} y={0} width={CX} height={H} />
          </clipPath>
          <clipPath id="pi-right">
            <rect x={CX} y={0} width={W - CX} height={H} />
          </clipPath>
          <radialGradient id="pi-shade" cx="0.35" cy="0.35" r="0.75">
            <stop offset="0" stopColor="white" stopOpacity="0.2" />
            <stop offset="0.6" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Лявата половина – повърхността */}
        <g clipPath="url(#pi-left)">
          <circle cx={CX} cy={CY} r={R} fill={planet.color} />
          <circle cx={CX} cy={CY} r={R} fill="url(#pi-shade)" />
        </g>

        {/* Дясната половина – разрезът */}
        <g clipPath="url(#pi-right)">
          {[...layers].reverse().map((l, ri) => {
            const i = layers.length - 1 - ri;
            return (
              <circle
                key={l.name}
                cx={CX}
                cy={CY}
                r={drawTo[i]}
                fill={l.color}
                stroke={i === layerIndex ? 'white' : '#0f172a'}
                strokeWidth={i === layerIndex ? 2 : 0.5}
                className="cursor-pointer"
                onClick={() => setLayerIndex(i)}
              />
            );
          })}
        </g>
        <line x1={CX} x2={CX} y1={CY - R} y2={CY + R} stroke="#0f172a" strokeWidth="1" />

        {/* Етикети: точките са по лъч под 40°, кората е най-горе – линиите не се пресичат */}
        {layers.map((l, i) => {
          const inner = i === 0 ? 0 : drawTo[i - 1];
          const mid = i === layers.length - 1 ? R - 1 : (inner + drawTo[i]) / 2;
          const x = CX + mid * Math.cos(0.7);
          const y = CY - mid * Math.sin(0.7);
          const ly = CY - R * 0.8 - 30 + (layers.length - 1 - i) * 22;
          return (
            <g key={l.name} pointerEvents="none">
              <circle cx={x} cy={y} r="2.5" fill="white" />
              <line x1={x} y1={y} x2={CX + R + 14} y2={ly - 4} stroke="white" strokeOpacity="0.6" />
              <text x={CX + R + 18} y={ly} fontSize="11" fill="white" fontWeight={i === layerIndex ? 700 : 400}>
                {l.name}
              </text>
            </g>
          );
        })}
        <text x={CX} y={H - 10} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          {planet.name}, R = {fmt(planet.radius, 0)} km
        </text>

        {/* Графика: радиус на ядрото / радиус на тялото */}
        <g transform="translate(450, 40)">
          <text x={0} y={-14} fontSize="11" fill="white" fillOpacity="0.8">
            ядро / радиус
          </text>
          {CORES.map((c, i) => {
            const y = i * 46;
            return (
              <g key={c.name}>
                <text x={0} y={y + 10} fontSize="11" fill="white" fontWeight={c.name === planet.name ? 700 : 400}>
                  {c.name}
                </text>
                <rect x={0} y={y + 16} width={140} height={12} rx="3" fill="white" fillOpacity="0.1" />
                <rect x={0} y={y + 16} width={140 * c.core} height={12} rx="3" fill={c.name === planet.name ? '#f59e0b' : '#94a3b8'} />
                <text x={144} y={y + 26} fontSize="10" fill="white" fillOpacity="0.7">
                  {Math.round(c.core * 100)}%
                </text>
                <text x={140} y={y + 10} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.5">
                  ρ = {fmt(c.density, 2)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {TERRESTRIAL.map(p => (
          <button
            key={p.id}
            onClick={() => choosePlanet(p.id)}
            className={`px-3 py-1 rounded text-sm border ${
              planetId === p.id
                ? 'border-slate-500 bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.symbol} {p.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {layers.map((l, i) => (
          <button
            key={l.name}
            onClick={() => setLayerIndex(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === layerIndex
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: l.color }} />
            {l.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        <strong>{layer.name}</strong> (до {Math.round(layer.to * 100)}% от радиуса): {layer.text}
      </p>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">🧲 {field}</p>
    </div>
  );
}

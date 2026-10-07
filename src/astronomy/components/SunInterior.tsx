import { useState } from 'react';

const W = 640;
const H = 340;
const CX = 175;
const CY = 175;
const R = 140; // радиус на фотосферата в пиксели

type Layer = {
  id: string;
  name: string;
  from: number; // r / R☉
  to: number;
  color: string;
  temperature: string;
  density: string;
  transport: string;
  text: string;
};

const LAYERS: Layer[] = [
  {
    id: 'core',
    name: 'Ядро',
    from: 0,
    to: 0.25,
    color: '#fff7c2',
    temperature: '15,7 – 7 милиона K',
    density: 'до 150 g/cm³ (13 пъти повече от оловото)',
    transport: 'термоядрен синтез',
    text: 'Тук се отделя почти цялата енергия. При тези температура и налягане ядрата на водорода се сблъскват достатъчно силно, за да се слеят в хелий. Ядрото съдържа около половината от масата на Слънцето в 1,5% от обема му.',
  },
  {
    id: 'radiative',
    name: 'Радиационна зона',
    from: 0.25,
    to: 0.7,
    color: '#fcd34d',
    temperature: '7 – 2 милиона K',
    density: '20 – 0,2 g/cm³',
    transport: 'излъчване (фотони)',
    text: 'Енергията се пренася от фотони, които непрекъснато се поглъщат и излъчват наново в случайна посока. Пътят им наподобява лутане на пиян човек – нужни са десетки хиляди години, за да прекосят зоната.',
  },
  {
    id: 'convective',
    name: 'Конвективна зона',
    from: 0.7,
    to: 1,
    color: '#fb923c',
    temperature: '2 милиона – 5800 K',
    density: '0,2 g/cm³ – почти вакуум',
    transport: 'конвекция',
    text: 'Тук газът е твърде непрозрачен и излъчването не стига. Горещи маси газ се издигат като вода във вряща тенджера, изстиват на повърхността и потъват обратно. Цикълът отнема около седмица до месец.',
  },
  {
    id: 'photosphere',
    name: 'Фотосфера',
    from: 1,
    to: 1.0007,
    color: '#f97316',
    temperature: '~5772 K',
    density: '~2 · 10⁻⁷ g/cm³',
    transport: 'излъчване в космоса',
    text: '„Повърхността“ на Слънцето – тънък слой от около 500 km, от който светлината излиза свободно. Вижда се зърнеста структура (гранулация) – върховете на конвективните клетки. Към ръба дискът изглежда по-тъмен, защото там виждаме по-високите и по-хладни слоеве.',
  },
  {
    id: 'chromosphere',
    name: 'Хромосфера',
    from: 1.0007,
    to: 1.003,
    color: '#f43f5e',
    temperature: '4000 – 20 000 K',
    density: 'хиляди пъти по-рядка от фотосферата',
    transport: 'излъчване',
    text: 'Тънък слой с дебелина ~2000 km. Свети в червената линия Hα на водорода и се вижда като розов ръб само при пълно слънчево затъмнение. От него непрекъснато изскачат тънки струи – спикули.',
  },
  {
    id: 'corona',
    name: 'Корона',
    from: 1.003,
    to: 3,
    color: '#c4b5fd',
    temperature: '1 – 3 милиона K',
    density: 'милиарди пъти по-рядка от въздуха',
    transport: 'излъчване, слънчев вятър',
    text: 'Външната атмосфера, която се простира на милиони километри и преминава в слънчевия вятър. Тя е стотици пъти по-гореща от фотосферата под нея – защо, все още не е напълно изяснено (проблемът за нагряването на короната).',
  },
];

// Приблизителен стандартен модел на Слънцето: r / R☉, T (K), ρ (g/cm³)
const MODEL: [number, number, number][] = [
  [0, 1.57e7, 150],
  [0.1, 1.3e7, 85],
  [0.2, 9.5e6, 36],
  [0.3, 6.6e6, 12],
  [0.4, 4.9e6, 3.5],
  [0.5, 3.9e6, 1.1],
  [0.6, 3.0e6, 0.42],
  [0.7, 2.2e6, 0.19],
  [0.8, 1.4e6, 0.09],
  [0.9, 6.5e5, 0.025],
  [0.95, 3.2e5, 0.007],
  [0.99, 7e4, 4e-4],
  [1, 5772, 2e-7],
];

// Графика вдясно
const GX0 = 380;
const GX1 = 620;
const GY0 = 40;
const GY1 = 300;
const gx = (r: number) => GX0 + r * (GX1 - GX0);
// Логаритмична вертикална скала: T от 10³ до 10⁸ K, ρ от 10⁻⁷ до 10³ g/cm³
const gyT = (T: number) => GY1 - ((Math.log10(T) - 3) / 5) * (GY1 - GY0);
const gyRho = (rho: number) => GY1 - ((Math.log10(rho) + 7) / 10) * (GY1 - GY0);

export default function SunInterior() {
  const [selected, setSelected] = useState('core');
  const layer = LAYERS.find(l => l.id === selected)!;

  // Слоевете отвън са много тънки – на чертежа ги удебеляваме
  const drawR: Record<string, [number, number]> = {
    core: [0, 0.25 * R],
    radiative: [0.25 * R, 0.7 * R],
    convective: [0.7 * R, R],
    photosphere: [R, R + 4],
    chromosphere: [R + 4, R + 9],
    corona: [R + 9, R + 34],
  };

  // Конвективни клетки – стрелки в кръг
  const cells = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * 2 * Math.PI;
    const rr = 0.85 * R;
    return { x: CX + rr * Math.cos(a), y: CY + rr * Math.sin(a), a };
  });

  const showOuter = ['photosphere', 'chromosphere', 'corona'].includes(selected);
  const markerR = showOuter ? 1 : (layer.from + layer.to) / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Пътешествие към центъра на Слънцето</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Щракнете върху слой. Вдясно – как температурата и плътността се променят от центъра (r = 0) до повърхността (r = R☉),
        в логаритмичен мащаб.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="sun-corona">
            <stop offset="0.8" stopColor="#c4b5fd" stopOpacity="0.35" />
            <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Слоевете като пълни кръгове – от външния към вътрешния */}
        <circle cx={CX} cy={CY} r={drawR.corona[1]} fill="url(#sun-corona)" />
        {[...LAYERS].reverse().filter(l => l.id !== 'corona').map(l => (
          <circle
            key={l.id}
            cx={CX}
            cy={CY}
            r={drawR[l.id][1]}
            fill={l.color}
            stroke={selected === l.id ? 'white' : 'none'}
            strokeWidth="2"
            opacity={selected === l.id ? 1 : 0.85}
          />
        ))}

        {/* Конвекция */}
        {cells.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={0.11 * R} fill="none" stroke="#9a3412" strokeOpacity="0.5" strokeDasharray="4 3" />
        ))}
        {/* Зигзаг в радиационната зона */}
        <polyline
          points={[0.27, 0.33, 0.3, 0.39, 0.36, 0.45, 0.42, 0.5, 0.48, 0.56, 0.52, 0.62, 0.6, 0.68]
            .map((r, i) => `${CX + r * R * Math.cos(-0.6 + (i % 2) * 0.12)},${CY + r * R * Math.sin(-0.6 + (i % 2) * 0.12)}`)
            .join(' ')}
          fill="none"
          stroke="#b45309"
          strokeWidth="1.5"
        />

        {/* Невидими зони за щракане */}
        {LAYERS.map(l => (
          <circle
            key={l.id}
            cx={CX}
            cy={CY}
            r={(drawR[l.id][0] + drawR[l.id][1]) / 2}
            fill="none"
            stroke="transparent"
            strokeWidth={Math.max(12, drawR[l.id][1] - drawR[l.id][0])}
            className="cursor-pointer"
            onClick={() => setSelected(l.id)}
          />
        ))}
        <text x={CX} y={CY + 4} fontSize="11" textAnchor="middle" fill="#78350f" fontWeight="600" pointerEvents="none">
          ядро
        </text>

        {/* Графиката */}
        <rect x={gx(layer.from)} y={GY0} width={Math.max(3, gx(Math.min(layer.to, 1)) - gx(layer.from))} height={GY1 - GY0} fill="white" fillOpacity="0.07" />
        <line x1={GX0} x2={GX1} y1={GY1} y2={GY1} stroke="white" strokeOpacity="0.4" />
        <line x1={GX0} x2={GX0} y1={GY0} y2={GY1} stroke="white" strokeOpacity="0.4" />
        {[0, 0.25, 0.5, 0.7, 1].map(r => (
          <text key={r} x={gx(r)} y={GY1 + 16} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
            {String(r).replace('.', ',')}
          </text>
        ))}
        <text x={GX1} y={GY1 + 32} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.6">
          r / R☉
        </text>
        <polyline points={MODEL.map(([r, T]) => `${gx(r)},${gyT(T)}`).join(' ')} fill="none" stroke="#f87171" strokeWidth="2.5" />
        <polyline points={MODEL.map(([r, , rho]) => `${gx(r)},${gyRho(rho)}`).join(' ')} fill="none" stroke="#60a5fa" strokeWidth="2.5" />
        <text x={GX0 + 6} y={GY0 - 14} fontSize="11" fill="#f87171">
          температура (10³ – 10⁸ K)
        </text>
        <text x={GX0 + 6} y={GY0 - 1} fontSize="11" fill="#60a5fa">
          плътност (10⁻⁷ – 10³ g/cm³)
        </text>
        <line x1={gx(markerR)} x2={gx(markerR)} y1={GY0} y2={GY1} stroke="white" strokeDasharray="3 3" strokeOpacity="0.6" />
      </svg>

      <div className="flex flex-wrap gap-1 mt-3">
        {LAYERS.map(l => (
          <button
            key={l.id}
            onClick={() => setSelected(l.id)}
            className={`px-2 py-1 rounded text-xs border ${
              selected === l.id
                ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: l.color }} />
            {l.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-center text-sm">
        {[
          { label: 'Температура', value: layer.temperature },
          { label: 'Плътност', value: layer.density },
          { label: 'Пренос на енергията', value: layer.transport },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        <strong>{layer.name}</strong>
        {layer.to <= 1 ? ` (от ${String(layer.from).replace('.', ',')} до ${String(layer.to).replace('.', ',')} R☉)` : ''}: {layer.text}
      </p>
      {showOuter && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Външните слоеве са удебелени на чертежа – в действителност са много по-тънки.</p>
      )}
    </div>
  );
}

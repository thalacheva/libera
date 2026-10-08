import { useState } from 'react';
import { fmt } from './terrestrialData';
import { GIANTS, type GiantId } from './giantData';

const W = 640;
const H = 320;
const CX = 160;
const CY = 160;
const SCALE = 135 / 71492; // Юпитер – 135 px радиус, останалите в същия мащаб
const MIN_SHELL = 3; // атмосферата е твърде тънка – рисуваме я поне 3 px

type Layer = { name: string; to: number; color: string; text: string };

const INTERIORS: Record<GiantId, { layers: Layer[]; heat: string }> = {
  jupiter: {
    heat: 'Юпитер още изстива след раждането си. Докато губи топлина, той се свива с ~2 cm годишно, а гравитационната енергия на свиването се превръща в топлина (механизъм на Келвин–Хелмхолц).',
    layers: [
      { name: 'Размито ядро', to: 0.3, color: '#78716c', text: 'Тежки елементи (скали и лед) с маса ~10–25 M⊕. Сондата Juno откри, че ядрото не е компактно, а размито – смесено с водород и простиращо се може би до половината от радиуса. Вероятно е „разбъркано“ от гигантски сблъсък в младостта на планетата. Температура ~20 000 K.' },
      { name: 'Метален водород', to: 0.85, color: '#94a3b8', text: 'При налягане над ~2 милиона bar водородните молекули се разпадат, а електроните се откъсват от атомите и се движат свободно. Водородът става течен метал, който провежда ток. Конвекцията в този огромен океан създава най-силното планетно магнитно поле в Слънчевата система.' },
      { name: 'Молекулен H₂ и He', to: 0.995, color: '#d6a46c', text: 'Водород и хелий, които с дълбочината преминават плавно от газ в течност – няма граница, няма повърхност. Сонда, която се спуска, просто потъва във все по-гъста и гореща среда, докато не бъде смачкана.' },
      { name: 'Облаци', to: 1, color: '#f5e1c0', text: 'Видимата „повърхност“ е горната граница на облаците – само ~50 km дебел слой. Отгоре надолу: амонячен лед (NH₃, ~0,7 bar), амониев хидросулфид (NH₄SH, ~2 bar) и воден лед (~5 bar).' },
    ],
  },
  saturn: {
    heat: 'Сатурн е по-малък и би трябвало вече да е изстинал. Допълнителната топлина идва от „хелиев дъжд“: в недрата хелият не се смесва с металния водород, сгъстява се в капки и потъва, като освобождава гравитационна енергия. Затова горните слоеве на Сатурн са бедни на хелий.',
    layers: [
      { name: 'Ядро', to: 0.25, color: '#78716c', text: 'Скали и лед, ~15–20 M⊕. „Сеизмологията на пръстените“ – вълни в пръстените, предизвикани от трептенията на планетата, измерени от сондата Cassini – показва, че и това ядро е размито и смесено с водород.' },
      { name: 'Метален водород', to: 0.5, color: '#94a3b8', text: 'По-тънък слой, отколкото при Юпитер, защото Сатурн е по-лек и налягането в него е по-малко. Тук „вали“ хелий.' },
      { name: 'Молекулен H₂ и He', to: 0.995, color: '#e9d18f', text: 'Плавен преход от газ към течност. Слабата гравитация прави обвивката „пухкава“ – затова средната плътност на Сатурн е под тази на водата.' },
      { name: 'Облаци и мъгла', to: 1, color: '#fdf3d0', text: 'Облаците са като тези на Юпитер, но по-дълбоко и скрити под дебел слой фотохимична мъгла – затова Сатурн изглежда блед и с размити ивици.' },
    ],
  },
  uranus: {
    heat: 'Уран почти не излъчва собствена топлина. Може би гигантският сблъсък, наклонил оста му, е изхвърлил топлината рано; може би слоевете в недрата не се смесват и пречат на топлината да излезе. Отговорът се очаква от бъдеща мисия до Уран.',
    layers: [
      { name: 'Скално ядро', to: 0.2, color: '#78716c', text: 'Силикати и желязо с маса около една Земя и температура ~5000 K.' },
      { name: 'Ледена мантия', to: 0.75, color: '#5eead4', text: 'В астрономията „лед“ са водата, амонякът и метанът, без значение дали са замръзнали. Тук те са гореща, гъста течност под огромно налягане. Водата е йонизирана и провежда ток – затова магнитното поле е изместено от центъра. Метанът вероятно се разпада, а въглеродът потъва като „диамантен дъжд“.' },
      { name: 'Обвивка H₂, He, CH₄', to: 1, color: '#9fdde6', text: 'Тънка в сравнение с газовите гиганти – само ~20–25% от радиуса. Метанът в горните слоеве поглъща червената светлина и придава синьо-зеления цвят.' },
    ],
  },
  neptune: {
    heat: 'Нептун излъчва 2,6 пъти повече, отколкото получава – най-голямото отношение сред гигантите. Тази вътрешна топлина движи най-силните ветрове в Слънчевата система, въпреки че слънчевата енергия там е нищожна.',
    layers: [
      { name: 'Скално ядро', to: 0.25, color: '#78716c', text: 'Силикати и желязо, около 1–1,5 земни маси.' },
      { name: 'Ледена мантия', to: 0.85, color: '#2dd4bf', text: 'Гореща течна смес от вода, амоняк и метан. Нептун е по-плътен от Уран (1,64 срещу 1,27 g/cm³) – вероятно има повече „лед“ и скали спрямо газа.' },
      { name: 'Обвивка H₂, He, CH₄', to: 1, color: '#4f7fe0', text: 'Синият цвят е по-наситен от този на Уран – вероятно защото мъглата в атмосферата на Нептун е по-тънка.' },
    ],
  },
};

// Отношение между излъчената и погълнатата енергия
const HEAT = [
  ...GIANTS.map(g => ({ id: g.id, name: g.name, value: g.heat })),
  { id: 'earth', name: 'Земя', value: 1.0 },
];
const HEAT_MAX = 3;

export default function GiantInteriors() {
  const [planetId, setPlanetId] = useState<GiantId>('jupiter');
  const [layerIndex, setLayerIndex] = useState(1);
  const planet = GIANTS.find(p => p.id === planetId)!;
  const { layers, heat } = INTERIORS[planetId];
  const layer = layers[Math.min(layerIndex, layers.length - 1)];
  const R = planet.radius * SCALE;

  // Радиуси за чертане (най-горният слой се удебелява, за да се вижда)
  const drawTo = layers.map((l, i) => (i === layers.length - 1 ? R : Math.min(l.to * R, R - MIN_SHELL)));

  const choosePlanet = (id: GiantId) => {
    setPlanetId(id);
    setLayerIndex(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Под облаците</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Разрез на гигантите в общ мащаб. Щракнете върху слой. Вдясно – колко пъти повече енергия излъчва всяка планета, отколкото
        получава от Слънцето.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <clipPath id="gi-left">
            <rect x={0} y={0} width={CX} height={H} />
          </clipPath>
          <clipPath id="gi-right">
            <rect x={CX} y={0} width={W - CX} height={H} />
          </clipPath>
          <radialGradient id="gi-shade" cx="0.35" cy="0.35" r="0.75">
            <stop offset="0" stopColor="white" stopOpacity="0.2" />
            <stop offset="0.6" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Лявата половина – облаците */}
        <g clipPath="url(#gi-left)">
          <circle cx={CX} cy={CY} r={R} fill={planet.color} />
          <circle cx={CX} cy={CY} r={R} fill="url(#gi-shade)" />
        </g>

        {/* Дясната половина – разрезът */}
        <g clipPath="url(#gi-right)">
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

        {/* Етикети вдясно, най-горният слой е най-горе */}
        {layers.map((l, i) => {
          const inner = i === 0 ? 0 : drawTo[i - 1];
          const mid = i === layers.length - 1 ? R - 1 : (inner + drawTo[i]) / 2;
          const x = CX + mid * Math.cos(0.7);
          const y = CY - mid * Math.sin(0.7);
          const lx = Math.max(CX + R + 14, 250);
          const ly = 34 + (layers.length - 1 - i) * 20;
          return (
            <g key={l.name} pointerEvents="none">
              <circle cx={x} cy={y} r="2.5" fill="white" />
              <line x1={x} y1={y} x2={lx - 4} y2={ly - 4} stroke="white" strokeOpacity="0.5" />
              <text x={lx} y={ly} fontSize="11" fill="white" fontWeight={i === layerIndex ? 700 : 400}>
                {l.name}
              </text>
            </g>
          );
        })}
        <text x={CX} y={H - 8} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          {planet.name}, R = {fmt(planet.radius, 0)} km
        </text>

        {/* Графика: излъчена / погълната енергия */}
        <g transform="translate(420, 150)">
          <text x={0} y={-14} fontSize="11" fill="white" fillOpacity="0.8">
            излъчва / получава
          </text>
          <line x1={140 / HEAT_MAX} x2={140 / HEAT_MAX} y1={-6} y2={HEAT.length * 30} stroke="#fbbf24" strokeDasharray="3 3" strokeOpacity="0.7" />
          {HEAT.map((c, i) => {
            const y = i * 30;
            const active = c.id === planetId;
            return (
              <g key={c.id}>
                <text x={0} y={y + 8} fontSize="10" fill="white" fontWeight={active ? 700 : 400} fillOpacity={c.id === 'earth' ? 0.6 : 1}>
                  {c.name}
                </text>
                <rect x={0} y={y + 12} width={140} height={9} rx="3" fill="white" fillOpacity="0.1" />
                <rect x={0} y={y + 12} width={(140 * c.value) / HEAT_MAX} height={9} rx="3" fill={active ? '#f59e0b' : '#94a3b8'} />
                <text x={146} y={y + 20} fontSize="10" fill="white" fillOpacity="0.7">
                  {fmt(c.value, 1)}×
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {GIANTS.map(p => (
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
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">🔥 {heat}</p>
    </div>
  );
}

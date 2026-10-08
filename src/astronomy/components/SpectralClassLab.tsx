import { useState } from 'react';
import { temperatureToRGB } from './light';
import { SpectrumStrip } from './SpectrumStrip';
import { CLASSES, classOf } from './starData';
import { fmt } from './terrestrialData';

const W = 640;
const H = 325;
const GX0 = 50;
const GX1 = 620;
const GY0 = 140;
const GY1 = 280;
const LOG_MIN = Math.log10(2500);
const LOG_MAX = Math.log10(45000);
// По оста x горещите звезди са вляво – както в спектралната последователност O B A F G K M
const tx = (logT: number) => GX0 + ((LOG_MAX - logT) / (LOG_MAX - LOG_MIN)) * (GX1 - GX0);

type Species = { id: string; name: string; color: string; peak: number; width: number; lines: number[]; why: string };

// Сила на линиите като функция на log T (приблизително, по формулите на Саха и Болцман)
const SPECIES: Species[] = [
  { id: 'he2', name: 'He II', color: '#a78bfa', peak: 4.62, width: 0.09, lines: [468.6, 541.1], why: 'Само в най-горещите звезди има достатъчно енергия, за да се откъсне електрон от хелия – най-трудно йонизиращия се елемент.' },
  { id: 'he1', name: 'He I', color: '#60a5fa', peak: 4.32, width: 0.1, lines: [447.1, 501.6, 587.6, 667.8], why: 'Неутралният хелий поглъща видима светлина само ако електронът му вече е възбуден – а за това са нужни ~20 000 K.' },
  { id: 'h', name: 'H (Балмер)', color: '#f472b6', peak: 3.98, width: 0.13, lines: [410.2, 434.0, 486.1, 656.3], why: 'Линиите на Балмер се образуват, когато електронът на водорода е на второ ниво. При Слънцето почти всички атоми са на първото ниво; при 20 000 K водородът е йонизиран. Оптимумът е около 9500 K – клас A.' },
  { id: 'ca2', name: 'Ca II (H и K)', color: '#fbbf24', peak: 3.72, width: 0.11, lines: [393.4, 396.8], why: 'Калцият губи първия си електрон лесно – още при ~5000 K той е почти изцяло йонизиран веднъж. Затова линиите H и K са най-силните в спектъра на Слънцето.' },
  { id: 'metal', name: 'Fe I, Na I, Mg I', color: '#fb923c', peak: 3.6, width: 0.11, lines: [430.8, 438.4, 495.7, 517.3, 527.0, 589.0], why: 'Неутралните метали оцеляват само в по-хладните атмосфери. Линиите им са хиляди – в класовете G и K спектърът е „гора“ от тях.' },
  { id: 'tio', name: 'TiO (молекули)', color: '#ef4444', peak: 3.46, width: 0.06, lines: [476.1, 495.4, 516.7, 544.8, 586.2, 615.9, 670.5, 705.5], why: 'Молекулите се разпадат при висока температура. Само в студените M-звезди (под ~3700 K) титановият оксид оцелява и дава широки тъмни ивици.' },
];

const strength = (s: Species, logT: number) => {
  const g = Math.exp(-((logT - s.peak) ** 2) / (2 * s.width * s.width));
  return s.id === 'tio' && logT > 3.58 ? g * 0.1 : g;
};

export default function SpectralClassLab() {
  const [logT, setLogT] = useState(Math.log10(5772));
  const [focus, setFocus] = useState('h');
  const T = 10 ** logT;
  const cls = classOf(T);
  const sel = SPECIES.find(s => s.id === focus)!;

  const lines = SPECIES.flatMap(s => s.lines.map(nm => ({ nm, strength: Math.min(1, strength(s, logT) * 1.1) }))).filter(l => l.strength > 0.08);

  const curve = (s: Species) =>
    Array.from({ length: 121 }, (_, i) => {
      const lt = LOG_MIN + (i / 120) * (LOG_MAX - LOG_MIN);
      return `${tx(lt)},${GY1 - strength(s, lt) * (GY1 - GY0 - 10)}`;
    }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Защо спектрите са различни</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Почти всички звезди са изградени от едно и също – ~74% водород и ~24% хелий. Спектрите им се различават, защото температурата
        решава кои атоми са в подходящото състояние, за да поглъщат видима светлина.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <circle cx={GX0 + 18} cy={48} r={18} fill={temperatureToRGB(T)} />
        <text x={GX0 + 46} y={44} fontSize="13" fill="white" fontWeight="700">
          {fmt(T, 0)} K – клас {cls.letter}
        </text>
        <text x={GX0 + 46} y={60} fontSize="10" fill="white" fillOpacity="0.7">
          {cls.lines}
        </text>
        <SpectrumStrip x={GX0} y={78} width={GX1 - GX0} height={26} kind="absorption" lines={lines} ticks />

        {/* Сила на линиите срещу температурата */}
        {CLASSES.slice(0, 7).map(c => (
          <g key={c.letter}>
            <rect
              x={tx(Math.log10(Math.min(c.to, 45000)))}
              y={GY0}
              width={tx(Math.log10(Math.max(c.from, 2500))) - tx(Math.log10(Math.min(c.to, 45000)))}
              height={GY1 - GY0}
              fill={c.color}
              fillOpacity={c.letter === cls.letter ? 0.12 : 0.03}
            />
            <text x={(tx(Math.log10(Math.min(c.to, 45000))) + tx(Math.log10(Math.max(c.from, 2500)))) / 2} y={GY1 + 16} fontSize="12" textAnchor="middle" fill={c.color} fontWeight="700">
              {c.letter}
            </text>
          </g>
        ))}
        {SPECIES.map(s => (
          <polyline
            key={s.id}
            points={curve(s)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.id === focus ? 3 : 1.5}
            strokeOpacity={s.id === focus ? 1 : 0.6}
            className="cursor-pointer"
            onClick={() => setFocus(s.id)}
          />
        ))}
        {SPECIES.map((s, i) => (
          <text key={s.id} x={tx(s.peak)} y={GY1 - (GY1 - GY0 - 10) - 4 - (i % 2) * 10} fontSize="9" textAnchor="middle" fill={s.color} className="cursor-pointer" onClick={() => setFocus(s.id)}>
            {s.name}
          </text>
        ))}
        <line x1={tx(logT)} x2={tx(logT)} y1={GY0 - 4} y2={GY1} stroke="white" strokeWidth="1.5" />
        <text x={GX0} y={GY1 + 32} fontSize="9" fill="white" fillOpacity="0.5">
          ← горещи
        </text>
        <text x={GX1} y={GY1 + 32} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
          студени →
        </text>
        <text x={(GX0 + GX1) / 2} y={GY1 + 32} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
          сила на линиите
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Температура на повърхността: {fmt(T, 0)} K</label>
      <input
        type="range"
        min={LOG_MIN}
        max={LOG_MAX}
        step="0.001"
        value={LOG_MAX + LOG_MIN - logT}
        onChange={e => setLogT(LOG_MAX + LOG_MIN - Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>горещи (O)</span>
        <span>студени (M)</span>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {SPECIES.map(s => (
          <button
            key={s.id}
            onClick={() => setFocus(s.id)}
            className={`px-2 py-1 rounded text-xs border ${
              s.id === focus
                ? 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        <strong>{sel.name}:</strong> {sel.why} <span className="text-gray-500 dark:text-gray-400">Примери за клас {cls.letter}: {cls.examples}.</span>
      </p>
    </div>
  );
}

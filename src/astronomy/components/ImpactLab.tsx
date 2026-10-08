import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 260;
const MT = 4.184e15; // J в една мегатона тротил

const MATERIALS = [
  { id: 'comet', name: 'комета', density: 0.6 },
  { id: 'stone', name: 'камък', density: 2.6 },
  { id: 'iron', name: 'желязо', density: 7.8 },
];

const PRESETS = [
  { name: 'Челябинск', d: 19, v: 19, material: 'stone' },
  { name: 'Тунгуска', d: 55, v: 20, material: 'stone' },
  { name: 'Кратерът в Аризона', d: 50, v: 13, material: 'iron' },
  { name: 'Апофис', d: 340, v: 12.6, material: 'stone' },
  { name: '1 km', d: 1000, v: 20, material: 'stone' },
  { name: 'Чиксулуб (динозаврите)', d: 10000, v: 20, material: 'stone' },
];

// Мащаби за сравнение (характерен размер в km)
const REFERENCES = [
  { name: 'София', km: 25 },
  { name: 'България', km: 450 },
  { name: 'Европа', km: 4000 },
];

/** Средно колко години минават между два удара на тела, по-големи от d (km). Приблизителна степенна зависимост. */
const interval = (dKm: number) => 5e5 * dKm ** 2.3;

function formatYears(y: number) {
  if (y < 1) return `${fmt(y * 365, 0)} дни`;
  if (y < 1e4) return `${fmt(y, 0)} години`;
  if (y < 1e6) return `${fmt(y / 1000, 0)} хил. години`;
  return `${fmt(y / 1e6, 0)} млн. години`;
}

function formatEnergy(mt: number) {
  if (mt < 1e-3) return `${fmt(mt * 1e6, 0)} t тротил`;
  if (mt < 1) return `${fmt(mt * 1000, 0)} kt тротил`;
  if (mt < 1e4) return `${fmt(mt, mt < 10 ? 1 : 0)} Mt тротил`;
  return `${(mt / 1e6).toLocaleString('bg-BG', { maximumFractionDigits: 1 })} млн. Mt тротил`;
}

export default function ImpactLab() {
  const [logD, setLogD] = useState(Math.log10(55)); // m
  const [v, setV] = useState(20);
  const [materialId, setMaterialId] = useState('stone');
  const material = MATERIALS.find(m => m.id === materialId)!;

  const d = 10 ** logD;
  const mass = material.density * 1000 * (Math.PI / 6) * d ** 3;
  const mt = (0.5 * mass * (v * 1000) ** 2) / MT;

  // Достига ли повърхността? (груб критерий – по-голямо и по-здраво тяло влиза по-дълбоко)
  const reachesGround = (materialId === 'iron' && d > 20) || (materialId === 'stone' && d > 100) || (materialId === 'comet' && d > 300);
  const EARTH_HALF = 20000; // km – половин обиколка на Земята: по-далеч няма накъде
  const severe = Math.min(EARTH_HALF, 11 * Math.cbrt(mt)); // km: радиус на поваляне на гори (като Тунгуска)
  const glass = Math.min(EARTH_HALF, severe * 8); // km: счупени прозорци
  const crater = reachesGround ? (d * 20) / 1000 : 0; // km

  let level: { name: string; color: string; text: string };
  if (d < 1) level = { name: 'Безопасно', color: '#4ade80', text: 'Изгаря високо в атмосферата като ярък болид. Такива тела удрят Земята всяка седмица.' };
  else if (d < 25) level = { name: 'Местни щети', color: '#facc15', text: 'Въздушна експлозия на десетки километри височина. Ударната вълна може да чупи прозорци в цял град, както в Челябинск.' };
  else if (d < 140) level = { name: 'Разрушен град', color: '#fb923c', text: 'Като Тунгуска: повалени гори на площ, по-голяма от София, или кратер при здраво желязно тяло. В населено място – катастрофа.' };
  else if (d < 1000) level = { name: 'Регионална катастрофа', color: '#f87171', text: 'Разрушения в радиус от десетки до стотици километри – цяла държава. Удар в океана би предизвикал огромно цунами. Затова търсим всички тела над 140 m.' };
  else if (d < 5000) level = { name: 'Глобална катастрофа', color: '#ef4444', text: 'Прахът и саждите в стратосферата затъмняват Слънцето за месеци. Реколтите в целия свят пропадат. Познаваме ~95% от телата над 1 km и нито едно не ни застрашава в следващите 100 години.' };
  else level = { name: 'Масово измиране', color: '#dc2626', text: 'Като преди 66 млн. години: кратерът Чиксулуб (~180 km), пожари по целия свят, години на студ и мрак. Изчезват ~75% от видовете, включително нептичите динозаври.' };

  // Мащаб за картата: най-големият кръг да се побира
  const maxKm = Math.max(glass, crater / 2, 1);
  const pxPerKm = 105 / maxKm;
  const MX = 160;
  const MY = 130;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Ако удари Земята…</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Енергията и последиците от удара на тяло с даден размер – и колко често се случва. Оценките са ориентировъчни.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Зони на разрушения */}
        <circle cx={MX} cy={MY} r={glass * pxPerKm} fill="#facc15" fillOpacity="0.08" stroke="#facc15" strokeOpacity="0.5" strokeDasharray="4 3" />
        <circle cx={MX} cy={MY} r={severe * pxPerKm} fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" />
        {crater > 0 && <circle cx={MX} cy={MY} r={Math.max(1.5, (crater / 2) * pxPerKm)} fill="#1c1917" stroke="#a16207" />}
        <circle cx={MX} cy={MY} r="2" fill="white" />
        <text x={MX} y={Math.max(12, MY - glass * pxPerKm - 4)} fontSize="9" textAnchor="middle" fill="#fde68a">
          счупени прозорци {glass >= EARTH_HALF ? 'по цялата Земя' : `в радиус ${fmt(glass, glass < 10 ? 1 : 0)} km`}
        </text>
        <text x={MX} y={Math.min(H - 44, MY + severe * pxPerKm + 12)} fontSize="9" textAnchor="middle" fill="#fca5a5">
          тежки разрушения {severe >= EARTH_HALF ? 'по цялата Земя' : `в радиус ${fmt(severe, severe < 10 ? 1 : 0)} km`}
        </text>

        {/* Сравнителни мащаби */}
        {REFERENCES.filter(r => r.km * pxPerKm > 6 && r.km * pxPerKm < 300).map((r, i) => (
          <g key={r.name}>
            <line x1={20} x2={20 + r.km * pxPerKm} y1={H - 30 + i * 10} y2={H - 30 + i * 10} stroke="#93c5fd" strokeWidth="2" />
            <text x={24 + r.km * pxPerKm} y={H - 27 + i * 10} fontSize="9" fill="#93c5fd">
              {r.name} (~{fmt(r.km, 0)} km)
            </text>
          </g>
        ))}

        {/* Данни */}
        <g transform="translate(340, 34)" fontSize="11" fill="white">
          <text x={0} y={0} fontSize="14" fontWeight="700" fill={level.color}>
            {level.name}
          </text>
          <text x={0} y={26} fillOpacity="0.85">
            диаметър {d < 1000 ? `${fmt(d, 0)} m` : `${fmt(d / 1000, 1)} km`}, скорост {fmt(v, 1)} km/s
          </text>
          <text x={0} y={44} fillOpacity="0.85">
            маса ≈ {sci(mass)} kg
          </text>
          <text x={0} y={70} fill="#fde68a">
            E ≈ {formatEnergy(mt)}
          </text>
          <text x={0} y={86} fontSize="10" fillOpacity="0.6">
            = {(mt * 1000) / 15 < 1e6 ? fmt((mt * 1000) / 15, 0) : sci((mt * 1000) / 15)} × Хирошима
          </text>
          <text x={0} y={112} fillOpacity="0.85">
            {reachesGround ? `кратер ≈ ${crater < 1 ? `${fmt(crater * 1000, 0)} m` : `${fmt(crater, 0)} km`}` : 'експлодира във въздуха'}
          </text>
          <text x={0} y={138} fill="#93c5fd">
            такъв удар: средно веднъж на {formatYears(interval(d / 1000))}
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Диаметър: {d < 1000 ? `${fmt(d, 0)} m` : `${fmt(d / 1000, 1)} km`}</label>
      <input type="range" min="0" max="4.2" step="0.01" value={logD} onChange={e => setLogD(Number(e.target.value))} className="w-full" />
      <label className="block text-sm font-semibold mt-3 mb-1">Скорост: {fmt(v, 1)} km/s</label>
      <input type="range" min="11" max="40" step="0.1" value={v} onChange={e => setV(Number(e.target.value))} className="w-full" />

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {MATERIALS.map(m => (
          <button
            key={m.id}
            onClick={() => setMaterialId(m.id)}
            className={`px-3 py-1 rounded text-sm border ${
              m.id === materialId
                ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.name} ({fmt(m.density, 1)} g/cm³)
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => {
              setLogD(Math.log10(p.d));
              setV(p.v);
              setMaterialId(p.material);
            }}
            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{level.text}</p>
    </div>
  );
}

import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 250;
const CY = 120;

const TYPES = [
  { id: 'C', name: 'C – въглероден', albedo: 0.06, density: 1.4, color: '#57534e', text: 'Тъмни като въглен, богати на въглерод, глини и вода в минералите. Най-чести са (~75%), особено във външната част на пояса. Бену и Рюгу са такива – в пробите им има аминокиселини.' },
  { id: 'S', name: 'S – силикатен', albedo: 0.25, density: 2.7, color: '#a8a29e', text: 'Скали от силикати и малко метал. Преобладават във вътрешната част на пояса (~17%). От тях идват обикновените хондрити – най-честите метеорити.' },
  { id: 'M', name: 'M – метален', albedo: 0.15, density: 4.0, color: '#94a3b8', text: 'Вероятно оголени желязно-никелови ядра на разбити зародиши на планети. Най-големият е Психея (~220 km) – там лети сондата Psyche.' },
  { id: 'E', name: 'E – енстатитов', albedo: 0.5, density: 2.7, color: '#e7e5e4', text: 'Много светли, изградени от минерала енстатит. Редки са и повечето са в групата Хунгарии, близо до вътрешния ръб на пояса.' },
];

const PRESETS = [
  { name: 'Церера', H: 3.34, type: 'C', albedo: 0.09 },
  { name: 'Дидимос', H: 18.2, type: 'S', albedo: 0.15 },
  { name: 'Апофис', H: 19.1, type: 'S', albedo: 0.35 },
  { name: 'Бену', H: 20.2, type: 'C', albedo: 0.044 },
  { name: 'Граница за PHA', H: 22, type: 'S', albedo: 0.14 },
];

/** Диаметър в km от абсолютната звездна величина H и геометричното албедо p. */
const diameterKm = (h: number, p: number) => (1329 / Math.sqrt(p)) * 10 ** (-h / 5);

function formatD(km: number) {
  if (km >= 10) return `${fmt(km, 0)} km`;
  if (km >= 1) return `${fmt(km, 1)} km`;
  return `${fmt(km * 1000, 0)} m`;
}

export default function AsteroidSizeLab() {
  const [h, setH] = useState(18);
  const [typeId, setTypeId] = useState('S');
  const [albedo, setAlbedo] = useState(0.25);
  const [preset, setPreset] = useState<string | null>(null);
  const type = TYPES.find(t => t.id === typeId)!;

  const d = diameterKm(h, albedo);
  const mass = type.density * 1000 * (Math.PI / 6) * (d * 1000) ** 3;

  // За сравнение: едно и също H, но най-тъмното и най-светлото албедо
  const dDark = diameterKm(h, 0.04);
  const dBright = diameterKm(h, 0.5);
  const pxPerKm = 70 / dDark; // най-тъмното тяло е с радиус 70 px

  const chooseType = (id: string) => {
    const t = TYPES.find(x => x.id === id)!;
    setTypeId(id);
    setAlbedo(t.albedo);
    setPreset(null);
  };
  const choosePreset = (p: (typeof PRESETS)[number]) => {
    setH(p.H);
    setTypeId(p.type);
    setAlbedo(p.albedo);
    setPreset(p.name);
  };

  const discs = [
    { label: 'p = 0,04', d: dDark, color: '#44403c', x: 140 },
    { label: `p = ${fmt(albedo, 2)}`, d, color: type.color, x: 320 },
    { label: 'p = 0,50', d: dBright, color: '#f5f5f4', x: 470 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-stone-300 dark:border-stone-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко е голям астероидът?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        В телескопа астероидът е само светла точка. От блясъка ѝ знаем H, но не и размера: тъмно голямо тяло и светло малко тяло
        изглеждат еднакво. Трите тела по-долу имат едно и също H.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {discs.map(c => (
          <g key={c.label}>
            <circle cx={c.x} cy={CY} r={(c.d / 2) * pxPerKm * 2} fill={c.color} stroke="white" strokeOpacity="0.3" />
            <text x={c.x} y={CY + 95} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
              {c.label}
            </text>
            <text x={c.x} y={CY + 110} fontSize="11" textAnchor="middle" fill="white" fontWeight="700">
              D ≈ {formatD(c.d)}
            </text>
          </g>
        ))}
        <text x={W - 12} y={22} fontSize="11" textAnchor="end" fill="white" fillOpacity="0.8">
          D = 1329 km / √p · 10^(−H/5)
        </text>
        <text x={12} y={22} fontSize="11" fill="white" fillOpacity="0.8">
          H = {fmt(h, 1)}
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Абсолютна звездна величина: H = {fmt(h, 1)}</label>
      <input
        type="range"
        min="3"
        max="28"
        step="0.1"
        value={h}
        onChange={e => {
          setH(Number(e.target.value));
          setPreset(null);
        }}
        className="w-full"
      />
      <label className="block text-sm font-semibold mt-3 mb-1">Албедо: p = {fmt(albedo, 3)}</label>
      <input
        type="range"
        min="0.03"
        max="0.6"
        step="0.005"
        value={albedo}
        onChange={e => {
          setAlbedo(Number(e.target.value));
          setPreset(null);
        }}
        className="w-full"
      />

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => chooseType(t.id)}
            className={`px-3 py-1 rounded text-sm border ${
              t.id === typeId
                ? 'border-stone-500 bg-stone-100 text-stone-800 dark:bg-stone-500/20 dark:text-stone-200'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: t.color }} />
            {t.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => choosePreset(p)}
            className={`px-2 py-1 rounded text-xs border ${
              p.name === preset
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
        {[
          { label: 'Диаметър', value: formatD(d) },
          { label: `Маса (ρ = ${fmt(type.density, 1)} g/cm³)`, value: `${sci(mass)} kg` },
          { label: 'Отношение светло/тъмно', value: `${fmt(dDark / dBright, 1)} пъти по размер` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{type.text}</p>
    </div>
  );
}

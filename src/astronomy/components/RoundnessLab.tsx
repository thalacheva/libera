import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 280;
const CX = 170;
const CY = 140;
const DRAW_R = 105;
const G = 6.674e-11;

const MATERIALS = [
  { id: 'ice', name: 'лед', density: 1.0, strength: 5e6 },
  { id: 'mix', name: 'лед и скала', density: 2.1, strength: 2e7 },
  { id: 'rock', name: 'скала', density: 3.4, strength: 1e8 },
];

const BODIES = [
  { name: 'Арокот', radius: 9, material: 'ice', density: 0.5, text: 'Ледено тяло от пояса на Кайпер, прилича на снежен човек от две слепени топки. New Horizons прелетя покрай него на 1 януари 2019 г. – най-далечният посетен свят.' },
  { name: 'Фобос', radius: 11, material: 'rock', density: 1.86, text: 'Спътникът на Марс прилича на картоф. Ниската плътност показва, че е порест – купчина отломки.' },
  { name: 'Мимас', radius: 198, material: 'ice', density: 1.15, text: 'Спътникът на Сатурн е най-малкото известно тяло, което е почти кръгло – въпреки огромния кратер Хершел, заради който прилича на Звездата на смъртта.' },
  { name: 'Веста', radius: 263, material: 'rock', density: 3.46, text: 'Скалите са много по-здрави от леда, затова на Веста не ѝ стига гравитацията да бъде съвсем кръгла. Не е джуджеста планета.' },
  { name: 'Хигия', radius: 217, material: 'mix', density: 2.06, text: 'Почти идеално кръгла. Някои астрономи предлагат да бъде призната за джуджеста планета.' },
  { name: 'Церера', radius: 470, material: 'mix', density: 2.16, text: 'Кръгла – в хидростатично равновесие. Затова е джуджеста планета.' },
];

// Фиксирани „неравности“ на формата: хармоници с амплитуда и фаза
const BUMPS = [
  { k: 2, a: 1, p: 0.3 },
  { k: 3, a: 0.6, p: 1.7 },
  { k: 4, a: 0.35, p: 2.9 },
  { k: 5, a: 0.25, p: 0.8 },
  { k: 7, a: 0.15, p: 4.1 },
];

const CRATERS = [
  [-0.35, -0.25, 0.14],
  [0.3, 0.2, 0.18],
  [0.05, 0.5, 0.1],
  [0.45, -0.4, 0.08],
  [-0.5, 0.3, 0.07],
];

/** Налягане в центъра на хомогенно кълбо (Pa). */
const centralPressure = (rho: number, R: number) => (2 * Math.PI * G * rho * rho * R * R) / 3;

export default function RoundnessLab() {
  const [radius, setRadius] = useState(100); // km
  const [materialId, setMaterialId] = useState('ice');
  const [density, setDensity] = useState(1.0); // g/cm³
  const [bodyName, setBodyName] = useState<string | null>(null);
  const material = MATERIALS.find(m => m.id === materialId)!;
  const body = BODIES.find(b => b.name === bodyName);

  const rho = density * 1000;
  const P = centralPressure(rho, radius * 1000);
  const ratio = P / material.strength;
  const rMin = Math.sqrt((3 * material.strength) / (2 * Math.PI * G * rho * rho)) / 1000;
  const amp = Math.min(0.3, 0.3 * Math.exp(-1.5 * (ratio - 0.3)));

  const points = Array.from({ length: 120 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI;
    const bump = BUMPS.reduce((s, b) => s + b.a * Math.cos(b.k * t + b.p), 0) / 1.6;
    const r = DRAW_R * (1 + amp * bump);
    return `${CX + r * Math.cos(t)},${CY + r * Math.sin(t)}`;
  }).join(' ');

  const chooseMaterial = (id: string) => {
    const m = MATERIALS.find(x => x.id === id)!;
    setMaterialId(id);
    setDensity(m.density);
    setBodyName(null);
  };

  const chooseBody = (name: string) => {
    const b = BODIES.find(x => x.name === name)!;
    setBodyName(name);
    setRadius(b.radius);
    setMaterialId(b.material);
    setDensity(b.density);
  };

  // Логаритмичен плъзгач: 5 … 1500 km
  const sliderToR = (v: number) => Math.round(5 * 300 ** (v / 1000));
  const rToSlider = (r: number) => (1000 * Math.log(r / 5)) / Math.log(300);

  const status = ratio < 0.6 ? 'неправилна форма' : ratio < 1.2 ? 'на границата' : 'кръгло';
  const statusColor = ratio < 0.6 ? '#f87171' : ratio < 1.2 ? '#fbbf24' : '#4ade80';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-stone-300 dark:border-stone-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Кога едно тяло става кълбо</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Увеличете радиуса. Щом налягането в центъра надхвърли якостта на материала, гравитацията „смачква“ неравностите и тялото
        става кръгло.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="rn-shade" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0" stopColor="white" stopOpacity="0.25" />
            <stop offset="0.6" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.6" />
          </radialGradient>
          <clipPath id="rn-clip">
            <polygon points={points} />
          </clipPath>
        </defs>
        <polygon points={points} fill={materialId === 'ice' ? '#cbd5e1' : materialId === 'rock' ? '#a8a29e' : '#9ca3af'} />
        <g clipPath="url(#rn-clip)">
          {CRATERS.map(([dx, dy, r], i) => (
            <circle key={i} cx={CX + dx * DRAW_R} cy={CY + dy * DRAW_R} r={r * DRAW_R} fill="black" fillOpacity="0.15" stroke="white" strokeOpacity="0.2" />
          ))}
          <polygon points={points} fill="url(#rn-shade)" />
        </g>
        <text x={CX} y={H - 10} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.7">
          {body ? body.name : 'тяло'}, R = {fmt(radius, 0)} km (не в мащаб)
        </text>

        {/* Налягане срещу якост */}
        <g transform="translate(360, 40)">
          <text x={0} y={0} fontSize="11" fill="white" fillOpacity="0.8">
            налягане в центъра / якост на материала
          </text>
          <rect x={0} y={14} width={240} height={16} rx="4" fill="white" fillOpacity="0.1" />
          <rect x={0} y={14} width={Math.min(240, (240 * Math.log10(1 + ratio * 9)) / Math.log10(1 + 4 * 9))} height={16} rx="4" fill={statusColor} />
          <line x1={(240 * Math.log10(10)) / Math.log10(37)} x2={(240 * Math.log10(10)) / Math.log10(37)} y1={10} y2={34} stroke="white" strokeDasharray="3 2" />
          <text x={(240 * Math.log10(10)) / Math.log10(37)} y={46} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.7">
            = 1
          </text>
          <text x={0} y={72} fontSize="12" fill={statusColor} fontWeight="700">
            {status} (×{fmt(ratio, 2)})
          </text>
          <text x={0} y={98} fontSize="11" fill="white" fillOpacity="0.8">
            P_ц = (2π/3)Gρ²R² ≈ {fmt(P / 1e6, 1)} MPa
          </text>
          <text x={0} y={116} fontSize="11" fill="white" fillOpacity="0.8">
            якост на „{material.name}“ ≈ {fmt(material.strength / 1e6, 0)} MPa
          </text>
          <text x={0} y={140} fontSize="11" fill="#fbbf24">
            кълбо става при R ≳ {fmt(rMin, 0)} km
          </text>
          <text x={0} y={158} fontSize="10" fill="white" fillOpacity="0.55">
            (за плътност {fmt(density, 2)} g/cm³)
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Радиус: {fmt(radius, 0)} km</label>
      <input
        type="range"
        min="0"
        max="1000"
        value={rToSlider(radius)}
        onChange={e => {
          setRadius(sliderToR(Number(e.target.value)));
          setBodyName(null);
        }}
        className="w-full"
      />

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Материал:</span>
        {MATERIALS.map(m => (
          <button
            key={m.id}
            onClick={() => chooseMaterial(m.id)}
            className={`px-3 py-1 rounded text-sm border ${
              m.id === materialId
                ? 'border-stone-500 bg-stone-100 text-stone-800 dark:bg-stone-500/20 dark:text-stone-200'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Реални тела:</span>
        {BODIES.map(b => (
          <button
            key={b.name}
            onClick={() => chooseBody(b.name)}
            className={`px-2 py-1 rounded text-xs border ${
              b.name === bodyName
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {b.name} ({b.radius} km)
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        {body
          ? body.text
          : 'Границата не е рязка: зависи от температурата (топлият лед тече по-лесно), от състава и от историята на тялото – удари могат да деформират и голямо кълбо. Грубо: ледените тела стават кръгли при радиус ~200 km, а скалистите – при ~250–300 km.'}
      </p>
    </div>
  );
}

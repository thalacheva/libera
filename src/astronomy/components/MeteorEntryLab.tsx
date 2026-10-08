import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const GROUND = 270;
const TOP = 20;
const H_MAX = 140; // km в горния край на картината
const KT = 4.184e12; // J в една килотона тротил
const AX0 = 70; // начало на траекторията по x
const AX1 = 360;

const hy = (km: number) => GROUND - (km / H_MAX) * (GROUND - TOP);
/** Траекторията под ~45°: x за дадена височина. */
const hx = (km: number) => AX0 + ((H_MAX - km) / H_MAX) * (AX1 - AX0);

const MATERIALS = [
  { id: 'comet', name: 'кометен прах', density: 0.6, shift: 8 },
  { id: 'stone', name: 'камък', density: 3.3, shift: 0 },
  { id: 'iron', name: 'желязо', density: 7.8, shift: -10 },
];

const PRESETS = [
  { name: 'Персеид', d: 0.001, v: 59, material: 'comet' },
  { name: 'Ярък болид', d: 0.05, v: 25, material: 'stone' },
  { name: 'Падане на метеорит', d: 0.4, v: 15, material: 'stone' },
  { name: 'Челябинск, 2013', d: 19, v: 19, material: 'stone' },
  { name: 'Тунгуска, 1908', d: 55, v: 20, material: 'stone' },
  { name: 'Кратерът в Аризона', d: 50, v: 13, material: 'iron' },
];

function formatSize(d: number) {
  if (d < 0.001) return `${fmt(d * 1e6, 0)} µm`;
  if (d < 0.01) return `${fmt(d * 1000, 1)} mm`;
  if (d < 1) return `${fmt(d * 100, 1)} cm`;
  return `${fmt(d, 1)} m`;
}

function formatMass(kg: number) {
  if (kg < 1e-3) return `${fmt(kg * 1e6, kg < 1e-5 ? 3 : 1)} mg`;
  if (kg < 1) return `${fmt(kg * 1000, 1)} g`;
  if (kg < 1000) return `${fmt(kg, 1)} kg`;
  return `${fmt(kg / 1000, 0)} t`;
}

function formatEnergy(j: number) {
  const kt = j / KT;
  if (kt >= 1000) return `${fmt(kt / 1000, 1)} Mt тротил`;
  if (kt >= 1) return `${fmt(kt, 0)} kt тротил`;
  if (kt * 1e6 >= 1) return `${fmt(kt * 1e6, 0)} kg тротил`;
  return `${fmt(j, 0)} J`;
}

export default function MeteorEntryLab() {
  const [logD, setLogD] = useState(-3); // log₁₀ на диаметъра в метри
  const [v, setV] = useState(59);
  const [materialId, setMaterialId] = useState('comet');
  const material = MATERIALS.find(m => m.id === materialId)!;

  const d = 10 ** logD;
  const mass = material.density * 1000 * (Math.PI / 6) * d ** 3;
  const energy = 0.5 * mass * (v * 1000) ** 2;
  // Приблизителна звездна величина: светимостта расте с масата и много силно със скоростта
  // (калибрирано: Персеид от 1 mm ≈ +2, Челябинск ≈ −27)
  const magnitude = -5 - 2.5 * Math.log10(mass * 1000) - 8.75 * Math.log10(v / 40);

  // Груб модел за височините на светене (km)
  const L = Math.log10(d * 1000); // log₁₀ на диаметъра в mm
  const hStart = Math.min(125, 85 + (v - 11) * 0.55);
  const depth = L <= 2.6 ? 80 - 20 * L : 28 - 6 * (L - 2.6) - 8 * Math.max(0, L - 4) ** 2;
  const hEndRaw = depth + material.shift + (v - 20) * 0.25;
  const hEnd = Math.max(0, Math.min(hStart - 6, hEndRaw));
  const impact = hEndRaw <= 0 && d > 20;

  let outcome: { title: string; text: string; color: string };
  if (d < 5e-5) {
    outcome = { title: 'Микрометеорит', color: '#94a3b8', text: 'Толкова малка прашинка се спира в горните слоеве, без да успее да се нагрее силно, и седмици наред бавно пада към повърхността. Такъв прах пада навсякъде – и по покривите на къщите.' };
  } else if (d < 0.01) {
    outcome = { title: 'Метеор – „падаща звезда“', color: '#fde68a', text: 'Частицата се нагрява от удара в молекулите на въздуха (не от триене!), изпарява се и йонизира въздуха около себе си. Светят главно изпарените атоми и йонизираният въздух, а не самата прашинка. Изгаря напълно за около секунда.' };
  } else if (d < 1) {
    const survives = materialId !== 'comet' && v < 30 && d > 0.1;
    outcome = survives
      ? { title: 'Болид и метеорит', color: '#fb923c', text: 'Много ярък болид. Горната част се изпарява, но ядрото забавя до ~3 km/s на 20–30 km височина, после угасва и пада свободно („тъмен полет“). Пада метеорит, който е студен – вътрешността му не е успяла да се нагрее.' }
      : { title: 'Болид', color: '#fb923c', text: 'По-ярък от Венера, може да се види и денем. Често се разпада на парчета с проблясъци. Бързите и рохкавите тела не оцеляват – стигат до земята само бавни каменни и железни тела.' };
  } else if (!impact) {
    outcome =
      d < 30
        ? { title: 'Въздушна експлозия', color: '#f87171', text: 'Налягането пред тялото надвишава якостта му и то се раздробява на височина 20–40 km. Енергията се освобождава за части от секундата като взрив. Ударната вълна чупи прозорци на десетки километри. Падат множество метеорити.' }
        : { title: 'Голяма въздушна експлозия', color: '#ef4444', text: 'Тялото експлодира на няколко километра височина. Ударната вълна поваля гори на площ от стотици km², но кратер не остава. Такива събития стават веднъж на няколкостотин години (Лекция 17).' };
  } else {
    outcome = { title: 'Удар и кратер', color: '#dc2626', text: `Здраво желязно тяло стига до повърхността почти без да забави и издълбава кратер ~${fmt(d * 20, 0)} m в диаметър – около 20 пъти по-широк от самото тяло. Така е образуван Метеоритният кратер в Аризона преди ~50 000 години (1,2 km).` };
  }

  const glow = Math.min(9, Math.max(1.5, (6 - magnitude) / 3));
  const choose = (p: (typeof PRESETS)[number]) => {
    setLogD(Math.log10(p.d));
    setV(p.v);
    setMaterialId(p.material);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">От прашинка до кратер</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете размер, скорост и материал. Колкото по-голямо и по-здраво е тялото, толкова по-дълбоко влиза в атмосферата.
        (Опростен модел – височините са ориентировъчни.)
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <linearGradient id="me-air" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0f172a" />
            <stop offset="0.6" stopColor="#1e3a8a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#60a5fa" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect x={40} y={TOP} width={360} height={GROUND - TOP} fill="url(#me-air)" />
        <rect x={40} y={GROUND} width={360} height={H - GROUND} fill="#3f6212" />

        {/* Скала на височината */}
        {[0, 20, 40, 60, 80, 100, 120].map(km => (
          <g key={km}>
            <line x1={36} x2={40} y1={hy(km)} y2={hy(km)} stroke="white" strokeOpacity="0.5" />
            <text x={32} y={hy(km) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
              {km}
            </text>
          </g>
        ))}
        <text x={14} y={TOP + 6} fontSize="9" fill="white" fillOpacity="0.6">
          km
        </text>
        <text x={396} y={hy(100) - 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.4">
          линия на Карман
        </text>
        <line x1={40} x2={400} y1={hy(100)} y2={hy(100)} stroke="white" strokeOpacity="0.15" strokeDasharray="3 3" />

        {/* Траектория */}
        <line x1={hx(H_MAX)} y1={hy(H_MAX)} x2={hx(hStart)} y2={hy(hStart)} stroke="white" strokeOpacity="0.3" strokeDasharray="2 3" />
        <line x1={hx(hStart)} y1={hy(hStart)} x2={hx(hEnd)} y2={hy(hEnd)} stroke={outcome.color} strokeWidth={glow} strokeLinecap="round" strokeOpacity="0.9" />
        <line x1={hx(hStart)} y1={hy(hStart)} x2={hx(hEnd)} y2={hy(hEnd)} stroke="white" strokeWidth={Math.max(0.8, glow / 3)} strokeLinecap="round" />
        {d >= 1 && !impact && <circle cx={hx(hEnd)} cy={hy(hEnd)} r={6 + glow * 1.5} fill="#fde68a" fillOpacity="0.35" />}
        {outcome.title.includes('метеорит') && d < 1 && (
          <line x1={hx(hEnd)} y1={hy(hEnd)} x2={hx(hEnd) + 10} y2={GROUND} stroke="#a8a29e" strokeDasharray="2 3" />
        )}
        {impact && <ellipse cx={hx(0)} cy={GROUND + 4} rx="22" ry="6" fill="#1c1917" stroke="#a16207" />}
        <text x={hx(hStart) + 8} y={hy(hStart) + 4} fontSize="9" fill="white" fillOpacity="0.75">
          започва да свети ~{fmt(hStart, 0)} km
        </text>
        {hEnd > 2 && (
          <text x={hx(hEnd) + 10} y={hy(hEnd) + 4} fontSize="9" fill="white" fillOpacity="0.75">
            угасва ~{fmt(hEnd, 0)} km
          </text>
        )}

        {/* Данни */}
        <g transform="translate(420, 40)" fontSize="11" fill="white">
          <text x={0} y={0} fontWeight="700" fill={outcome.color} fontSize="13">
            {outcome.title}
          </text>
          <text x={0} y={26} fillOpacity="0.85">
            диаметър: {formatSize(d)}
          </text>
          <text x={0} y={44} fillOpacity="0.85">
            маса: {formatMass(mass)}
          </text>
          <text x={0} y={62} fillOpacity="0.85">
            скорост: {v} km/s
          </text>
          <text x={0} y={88} fill="#fde68a">
            E = mv²/2 ≈ {formatEnergy(energy)}
          </text>
          {energy / KT >= 1 && (
            <text x={0} y={104} fontSize="10" fillOpacity="0.6">
              = {fmt(energy / KT / 15, energy / KT / 15 < 10 ? 1 : 0)} × бомбата над Хирошима
            </text>
          )}
          <text x={0} y={130} fillOpacity="0.85">
            звездна величина ≈ {fmt(magnitude, 0)}
          </text>
          <text x={0} y={146} fontSize="10" fillOpacity="0.6">
            {magnitude > 1 ? 'като слаба звезда' : magnitude > -4 ? 'като най-ярките звезди' : magnitude > -12.7 ? 'по-ярък от Венера' : magnitude > -26.7 ? 'по-ярък от пълната Луна' : 'по-ярък от Слънцето!'}
          </text>
          <text x={0} y={172} fontSize="10" fillOpacity="0.6">
            За сравнение: Венера −4,6;
          </text>
          <text x={0} y={186} fontSize="10" fillOpacity="0.6">
            пълна Луна −12,7; Слънце −26,7
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Диаметър: {formatSize(d)}</label>
      <input type="range" min="-5" max="2" step="0.02" value={logD} onChange={e => setLogD(Number(e.target.value))} className="w-full" />
      <label className="block text-sm font-semibold mt-3 mb-1">Скорост при навлизане: {v} km/s</label>
      <input type="range" min="11" max="72" value={v} onChange={e => setV(Number(e.target.value))} className="w-full" />

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Материал:</span>
        {MATERIALS.map(m => (
          <button
            key={m.id}
            onClick={() => setMaterialId(m.id)}
            className={`px-3 py-1 rounded text-sm border ${
              m.id === materialId
                ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.name} ({fmt(m.density, 1)} g/cm³)
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Примери:</span>
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => choose(p)}
            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {p.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{outcome.text}</p>
    </div>
  );
}

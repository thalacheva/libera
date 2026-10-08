import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 280;
const OM_R = 9.1e-5; // излъчване (фотони + неутрино)
const OM_B = 0.049;
const OM_DM = 0.266;
const OM_L = 0.685;
const H0 = 67.4 / 977.8; // 1/млрд. години
const LOG_A_MIN = -6;
const LOG_A_MAX = 1;
// Графиката
const GX0 = 300;
const GX1 = 620;
const GY0 = 30;
const GY1 = 230;

const dens = (a: number) => ({ r: OM_R / a ** 4, b: OM_B / a ** 3, dm: OM_DM / a ** 3, l: OM_L });

// Възраст t(a) = ∫ da / (a H(a)) – таблица по lg a
const AGE = (() => {
  const rows: [number, number][] = [];
  let t = 0;
  let prev = 1e-8;
  for (let k = 0; k <= 700; k++) {
    const lg = -8 + (k / 700) * 9;
    const a = 10 ** lg;
    const steps = 20;
    for (let s = 0; s < steps; s++) {
      const a1 = prev + ((a - prev) * (s + 0.5)) / steps;
      const d = dens(a1);
      const Ha = H0 * Math.sqrt(d.r + d.b + d.dm + d.l);
      t += (a - prev) / steps / (a1 * Ha);
    }
    prev = a;
    rows.push([lg, t]);
  }
  return rows;
})();
const ageAt = (lg: number) => {
  const i = AGE.findIndex(r => r[0] >= lg);
  if (i <= 0) return AGE[0][1];
  const [l0, t0] = AGE[i - 1];
  const [l1, t1] = AGE[i];
  return t0 + ((t1 - t0) * (lg - l0)) / (l1 - l0);
};

function formatAge(gyr: number) {
  const s = gyr * 3.156e16;
  if (s < 3600 * 24 * 365) return s < 86400 ? `${fmt(s / 3600, 1)} часа` : `${fmt(s / 86400, 0)} дни`;
  if (gyr < 1e-3) return `${fmt(gyr * 1e9, 0)} години`;
  if (gyr < 1) return `${fmt(gyr * 1000, 0)} млн. години`;
  return `${fmt(gyr, 2)} млрд. години`;
}

const COMPONENTS = [
  { k: 'r' as const, name: 'излъчване', color: '#fbbf24' },
  { k: 'b' as const, name: 'обикновено вещество', color: '#60a5fa' },
  { k: 'dm' as const, name: 'тъмна материя', color: '#a78bfa' },
  { k: 'l' as const, name: 'тъмна енергия', color: '#f472b6' },
];

export default function CosmicBudgetLab() {
  const [lgA, setLgA] = useState(0);
  const a = 10 ** lgA;
  const d = dens(a);
  const total = d.r + d.b + d.dm + d.l;
  const frac = { r: d.r / total, b: d.b / total, dm: d.dm / total, l: d.l / total };
  const age = ageAt(lgA);
  const z = 1 / a - 1;

  const gx = (lg: number) => GX0 + ((lg - LOG_A_MIN) / (LOG_A_MAX - LOG_A_MIN)) * (GX1 - GX0);
  const LOG_RHO_MIN = -3;
  const LOG_RHO_MAX = 20;
  const gy = (rho: number) => GY1 - ((Math.log10(rho) - LOG_RHO_MIN) / (LOG_RHO_MAX - LOG_RHO_MIN)) * (GY1 - GY0);
  const line = (k: 'r' | 'b' | 'dm' | 'l') =>
    Array.from({ length: 71 }, (_, i) => {
      const lg = LOG_A_MIN + (i / 70) * (LOG_A_MAX - LOG_A_MIN);
      return `${gx(lg)},${gy(dens(10 ** lg)[k])}`;
    }).join(' ');

  // Кръгова диаграма
  let acc = 0;
  const slices = COMPONENTS.map(c => {
    const f = frac[c.k];
    const a0 = acc * 2 * Math.PI - Math.PI / 2;
    acc += f;
    const a1 = acc * 2 * Math.PI - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const R = 80;
    const px = 140;
    const py = 130;
    const path = f > 0.9999 ? `M ${px} ${py - R} A ${R} ${R} 0 1 1 ${px - 0.01} ${py - R} Z` : `M ${px} ${py} L ${px + R * Math.cos(a0)} ${py + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${px + R * Math.cos(a1)} ${py + R * Math.sin(a1)} Z`;
    return { ...c, f, path };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-pink-300 dark:border-pink-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Съставът на Вселената през времето</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        При разширение веществото се разрежда като a⁻³, излъчването – още по-бързо, като a⁻⁴ (фотоните и отслабват), а тъмната енергия
        не се разрежда изобщо. Затова във всяка епоха „управлява“ друга съставка.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {slices.map(s => (s.f > 0.0005 ? <path key={s.k} d={s.path} fill={s.color} fillOpacity="0.9" stroke="#0f172a" strokeWidth="1" /> : null))}
        <text x={140} y={232} fontSize="11" textAnchor="middle" fill="white" fontWeight="700">
          {formatAge(age)} след Големия взрив
        </text>
        <text x={140} y={248} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          a = {a < 0.01 ? sci(a, 1) : fmt(a, 2)} · z = {z > 1000 ? sci(z, 1) : fmt(Math.max(z, -0.99), z < 10 ? 2 : 0)}
        </text>

        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <defs>
          <clipPath id="cb-clip">
            <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} />
          </clipPath>
        </defs>
        <g clipPath="url(#cb-clip)">
          {COMPONENTS.map(c => (
            <polyline key={c.k} points={line(c.k)} fill="none" stroke={c.color} strokeWidth="2" />
          ))}
        </g>
        <line x1={gx(lgA)} x2={gx(lgA)} y1={GY0} y2={GY1} stroke="white" strokeOpacity="0.6" />
        <line x1={gx(0)} x2={gx(0)} y1={GY0} y2={GY1} stroke="white" strokeOpacity="0.2" strokeDasharray="3 3" />
        <text x={gx(0) + 3} y={GY0 + 10} fontSize="8" fill="white" fillOpacity="0.5">
          днес
        </text>
        {[-6, -4, -2, 0].map(lg => (
          <text key={lg} x={gx(lg)} y={GY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {lg === 0 ? '1' : `10${['⁻⁶', '', '⁻⁴', '', '⁻²'][lg + 6]}`}
          </text>
        ))}
        <text x={(GX0 + GX1) / 2} y={GY1 + 27} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          мащабен фактор a
        </text>
        <rect x={GX0 + 2} y={GY0 + 2} width={150} height={74} rx="4" fill="#0b1120" fillOpacity="0.85" />
        <text x={GX0 + 6} y={GY0 + 14} fontSize="9" fill="white" fillOpacity="0.6">
          плътност (лог. скала)
        </text>
        {COMPONENTS.map((c, i) => (
          <g key={c.k}>
            <rect x={GX0 + 6} y={GY0 + 22 + i * 13} width={9} height={9} fill={c.color} />
            <text x={GX0 + 19} y={GY0 + 30 + i * 13} fontSize="9" fill="white" fillOpacity="0.85">
              {c.name}: {fmt(frac[c.k] * 100, frac[c.k] < 0.01 ? 2 : 0)}%
            </text>
          </g>
        ))}
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Мащабен фактор a = {a < 0.01 ? sci(a, 1) : fmt(a, 3)}</label>
      <input type="range" min={LOG_A_MIN} max={LOG_A_MAX} step="0.01" value={lgA} onChange={e => setLgA(Number(e.target.value))} className="w-full" />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {frac.r > 0.5
          ? 'Ерата на излъчването: първите ~50 000 години енергията на фотоните и неутриното надвишава тази на веществото.'
          : frac.l > 0.5
            ? 'Ерата на тъмната енергия: от ~4 млрд. години насам (z ≈ 0,3) тъмната енергия надвишава веществото и разширението се ускорява. В далечното бъдеще тя ще е почти всичко.'
            : 'Ерата на веществото: гравитацията на тъмната материя събира газа в галактики и купове. Обикновеното вещество е само 1/6 от цялото вещество.'}
      </p>
    </div>
  );
}

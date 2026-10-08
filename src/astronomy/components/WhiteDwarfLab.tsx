import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 270;
const M_CH = 1.44; // граница на Чандрасекар, M☉
const R_SUN_KM = 696000;
const M_SUN = 1.989e30;
// Графиката маса–радиус
const GX0 = 340;
const GX1 = 620;
const GY0 = 30;
const GY1 = 230;
const R_MAX = 20000; // km
const gx = (m: number) => GX0 + (m / 1.5) * (GX1 - GX0);
const gy = (r: number) => GY1 - (r / R_MAX) * (GY1 - GY0);

/** Радиус на бяло джудже (km) по приближението на Науенберг. */
function wdRadius(M: number) {
  const x = M / M_CH;
  if (x >= 1) return 0;
  return 0.0112 * R_SUN_KM * Math.sqrt(x ** (-2 / 3) - x ** (2 / 3));
}

const KNOWN = [
  { name: 'Сириус B', m: 1.02, r: 5800 },
  { name: 'Процион B', m: 0.6, r: 8600 },
  { name: '40 Еридан B', m: 0.57, r: 9400 },
];

const CURVE = Array.from({ length: 141 }, (_, i) => {
  const m = 0.15 + (i / 140) * (M_CH - 0.15);
  return `${gx(m)},${gy(wdRadius(m))}`;
}).join(' ');

export default function WhiteDwarfLab() {
  const [m, setM] = useState(0.6);
  const R = wdRadius(m);
  const rho = R > 0 ? (m * M_SUN) / ((4 / 3) * Math.PI * (R * 1000) ** 3) : Infinity;
  const kmPx = 75 / 6371;
  const collapsed = m >= M_CH;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колкото по-тежко, толкова по-малко</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Увеличете масата на бялото джудже. Повече маса значи повече гравитация, която натъпква електроните още по-плътно – и
        звездата се свива. При 1,44 M☉ налягането вече не може да я удържи.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Земята и бялото джудже */}
        <circle cx={90} cy={125} r={6371 * kmPx} fill="#3b82f6" fillOpacity="0.85" />
        <text x={90} y={225} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          Земя
        </text>
        {collapsed ? (
          <text x={240} y={130} fontSize="12" textAnchor="middle" fill="#f87171" fontWeight="700">
            💥 колапс!
          </text>
        ) : (
          <circle cx={240} cy={125} r={Math.max(1, R * kmPx)} fill="#e0f2fe" />
        )}
        <text x={240} y={225} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          бяло джудже
        </text>

        {/* Графика маса–радиус */}
        <line x1={GX0} x2={GX1} y1={GY1} y2={GY1} stroke="white" strokeOpacity="0.35" />
        <line x1={GX0} x2={GX0} y1={GY0} y2={GY1} stroke="white" strokeOpacity="0.35" />
        <line x1={gx(M_CH)} x2={gx(M_CH)} y1={GY0} y2={GY1} stroke="#f87171" strokeDasharray="4 3" />
        <text x={gx(M_CH) - 4} y={GY0 + 10} fontSize="9" textAnchor="end" fill="#fca5a5">
          граница на Чандрасекар
        </text>
        <line x1={GX0} x2={GX1} y1={gy(6371)} y2={gy(6371)} stroke="#3b82f6" strokeOpacity="0.5" strokeDasharray="2 3" />
        <text x={GX1} y={gy(6371) - 3} fontSize="9" textAnchor="end" fill="#93c5fd">
          радиус на Земята
        </text>
        <polyline points={CURVE} fill="none" stroke="#7dd3fc" strokeWidth="2" />
        {KNOWN.map(k => (
          <g key={k.name}>
            <circle cx={gx(k.m)} cy={gy(k.r)} r="3.5" fill="#fde68a" />
            <text x={gx(k.m) + 5} y={gy(k.r) - 4} fontSize="9" fill="#fde68a">
              {k.name}
            </text>
          </g>
        ))}
        {!collapsed && <circle cx={gx(m)} cy={gy(R)} r="6" fill="#e0f2fe" stroke="#f472b6" strokeWidth="2" />}
        {[0.5, 1.0, 1.4].map(v => (
          <text key={v} x={gx(v)} y={GY1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {fmt(v, 1)} M☉
          </text>
        ))}
        {[5000, 10000, 15000].map(v => (
          <text key={v} x={GX0 - 4} y={gy(v) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {fmt(v / 1000, 0)}k
          </text>
        ))}
        <text x={GX0 + 4} y={GY0 - 8} fontSize="9" fill="white" fillOpacity="0.55">
          радиус, km
        </text>
        <text x={(GX0 + GX1) / 2} y={H - 8} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          маса
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Маса: {fmt(m, 2)} M☉</label>
      <input type="range" min="0.2" max="1.46" step="0.01" value={m} onChange={e => setM(Number(e.target.value))} className="w-full" />
      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
        {[
          { label: 'Радиус', value: collapsed ? '→ 0' : `${fmt(R, 0)} km` },
          { label: 'Средна плътност', value: collapsed ? '→ ∞' : `${fmt(rho / 1e6, rho < 1e7 ? 2 : 0)} t/cm³` },
          { label: 'Чаена лъжичка (5 cm³)', value: collapsed ? '–' : `${(rho * 5e-6) / 1000 < 1e4 ? fmt((rho * 5e-6) / 1000, 1) : sci((rho * 5e-6) / 1000, 1)} t` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {collapsed
          ? 'Над границата на Чандрасекар няма равновесие. Ако бялото джудже е в двойна система и трупа вещество от съседа си, при приближаване до границата въглеродът се запалва изведнъж и звездата се взривява като свръхнова тип Ia – без да остане нищо.'
          : m > 1.2
            ? 'Близо до границата електроните се движат почти със скоростта на светлината. Тогава налягането им расте по-бавно с плътността и вече не може да спре гравитацията.'
            : 'Обикновените бели джуджета имат маса 0,5–0,7 M☉. Те вече не произвеждат енергия: светят само от запасената топлина и бавно изстиват.'}
      </p>
    </div>
  );
}

import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// Скала на pH с ориентировъчни стойности
const PH_MARKS: { ph: number; label: string; up: boolean }[] = [
  { ph: 7, label: 'чиста вода 7', up: true },
  { ph: 5.6, label: 'дъжд 5,6', up: false },
  { ph: 4.2, label: 'кисел дъжд ≈ 4–4,5', up: true },
  { ph: 2.9, label: 'оцет ≈ 2,9', up: false },
];
const PX = (ph: number) => 40 + ((ph - 2) / (8 - 2)) * 400;

/**
 * От въглищата в ТЕЦ до разтворения мрамор: сярата → SO₂ → H₂SO₄ → CaCO₃.
 * Сероочистването (мокър варовиков метод) задържа част от SO₂ още в комина.
 */
export default function AcidRainLab() {
  const [coal, setCoal] = useState(100);
  const [sulfur, setSulfur] = useState(2);
  const [scrub, setScrub] = useState(0);

  const S = (coal * 1000 * sulfur) / 100; // kg сяра
  const nS = S / 32; // kmol
  const so2Total = nS * 64;
  const escaped = 1 - scrub / 100;
  const so2Out = so2Total * escaped;
  const h2so4 = nS * escaped * 98;
  const marble = nS * escaped * 100;
  const gypsum = nS * (scrub / 100) * 172; // CaSO₄·2H₂O

  // Колко гъст е „облакът“ – за рисунката
  const smoke = Math.min(1, so2Out / 4000);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 250" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* земя */}
        <rect x={0} y={150} width={480} height={4} className="fill-gray-300 dark:fill-gray-600" />
        {/* ТЕЦ и комин */}
        <rect x={30} y={110} width={70} height={40} className="fill-gray-400 dark:fill-gray-500" />
        <rect x={80} y={50} width={16} height={60} className="fill-gray-500 dark:fill-gray-400" />
        <text x={65} y={168} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          ТЕЦ
        </text>
        {scrub > 0 && (
          <g>
            <rect x={100} y={118} width={50} height={32} rx={4} className="fill-sky-200 dark:fill-sky-800 stroke-sky-500" />
            <text x={125} y={138} fontSize="10" textAnchor="middle" className="fill-sky-900 dark:fill-sky-100">
              очистване
            </text>
          </g>
        )}
        {/* дим, който става облак */}
        {[0, 1, 2, 3].map(i => (
          <circle key={i} cx={100 + i * 40} cy={46 - i * 4} r={10 + i * 4} className="fill-gray-500" opacity={0.15 + 0.55 * smoke} />
        ))}
        <ellipse cx={300} cy={34} rx={70} ry={20} className="fill-gray-400 dark:fill-gray-500" opacity={0.35 + 0.5 * smoke} />
        <text x={300} y={38} fontSize="12" fontWeight="600" textAnchor="middle" className="fill-gray-900 dark:fill-gray-50">
          SO₂ → SO₃ → H₂SO₄
        </text>
        {/* капки */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={250 + (i % 6) * 20} x2={246 + (i % 6) * 20} y1={64 + Math.floor(i / 6) * 34} y2={76 + Math.floor(i / 6) * 34} strokeWidth="2" className={smoke > 0.05 ? 'stroke-amber-500' : 'stroke-sky-400'} />
        ))}
        {/* мраморна статуя */}
        <rect x={392} y={128} width={50} height={22} className="fill-gray-200 dark:fill-gray-300 stroke-gray-400" />
        <rect x={404} y={82} width={26} height={46} rx={6} className="fill-gray-100 dark:fill-gray-200 stroke-gray-400" opacity={1 - 0.6 * smoke} />
        <circle cx={417} cy={72} r={11} className="fill-gray-100 dark:fill-gray-200 stroke-gray-400" opacity={1 - 0.6 * smoke} />
        <text x={417} y={168} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          мрамор CaCO₃
        </text>

        {/* скала на pH */}
        <defs>
          <linearGradient id="acid-rain-ph" x1="0" x2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <rect x={40} y={206} width={400} height={10} rx={5} fill="url(#acid-rain-ph)" />
        {[2, 3, 4, 5, 6, 7, 8].map(v => (
          <text key={v} x={PX(v)} y={230} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {v}
          </text>
        ))}
        {PH_MARKS.map(m => (
          <g key={m.label}>
            <line x1={PX(m.ph)} x2={PX(m.ph)} y1={m.up ? 194 : 216} y2={m.up ? 206 : 240} className="stroke-gray-700 dark:stroke-gray-200" />
            <text x={PX(m.ph)} y={m.up ? 190 : 248} fontSize="10" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
              {m.label}
            </text>
          </g>
        ))}
      </LabSvg>

      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">m – изгорени въглища, S – сяра във въглищата, η – колко от SO₂ задържа сероочистването</p>
      <Sliders>
        <Slider label="m, t" value={coal} onChange={setCoal} min={10} max={500} step={10} tone="gray" />
        <Slider label="S, %" value={sulfur} onChange={setSulfur} min={0.5} max={5} step={0.5} tone="amber" />
        <Slider label="η, %" value={scrub} onChange={setScrub} min={0} max={95} step={5} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'сяра:', value: `${fmt(S, 0)} kg = ${fmt(nS, 1)} kmol` },
            { label: 'SO₂ в атмосферата:', value: `${fmt(so2Out, 0)} kg`, tone: 'amber' },
            { label: 'може да даде H₂SO₄:', value: `${fmt(h2so4, 0)} kg`, tone: 'rose' },
            { label: 'може да разтвори CaCO₃:', value: `${fmt(marble, 0)} kg`, tone: 'gray' },
            ...(scrub > 0 ? [{ label: 'гипс от очистването:', value: `${fmt(gypsum, 0)} kg`, tone: 'blue' as const }] : []),
          ]}
        />
      </div>
      <Note tone={scrub >= 90 ? 'emerald' : 'amber'}>
        S + O₂ → SO₂; 2SO₂ + O₂ → 2SO₃; SO₃ + H₂O → H₂SO₄; CaCO₃ + H₂SO₄ → CaSO₄ + H₂O + CO₂. Всяка стъпка е мол за мол по сярата, затова
        един мол сяра в горивото може да разтвори до един мол (100 g) мрамор.
        {scrub > 0 && ' При сероочистването SO₂ реагира с варовик още в комина и се получава гипс: 2CaCO₃ + 2SO₂ + O₂ + 4H₂O → 2CaSO₄·2H₂O + 2CO₂.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Дори чистият дъжд е леко кисел (pH около 5,6), защото в него се разтваря CO₂ от въздуха. Кисел дъжд наричаме валежи с pH под 5,6.
        Сметката е горна граница – не цялата сярна киселина пада върху мрамор.
      </p>
    </div>
  );
}

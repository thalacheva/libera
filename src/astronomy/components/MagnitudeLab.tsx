import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 250;
const X0 = 25;
const X1 = 615;
const M_MIN = -27;
const M_MAX = 32;
const AXIS_Y = 70;
const PHOTONS_M0 = 3.4e5; // фотона в секунда през зеницата (7 mm) от звезда с m = 0 във видимата област

const mx = (m: number) => X0 + ((m - M_MIN) / (M_MAX - M_MIN)) * (X1 - X0);

const LADDER = [
  { m: -26.7, name: 'Слънце' },
  { m: -12.7, name: 'пълна Луна' },
  { m: -4.6, name: 'Венера' },
  { m: -1.46, name: 'Сириус' },
  { m: 0.03, name: 'Вега' },
  { m: 1.98, name: 'Полярна' },
  { m: 4, name: 'граница в града' },
  { m: 6.5, name: 'граница с просто око' },
  { m: 9.5, name: 'бинокъл' },
  { m: 14, name: 'телескоп 20 cm' },
  { m: 27, name: 'телескоп 10 m' },
  { m: 31, name: 'Хъбъл' },
];

const ratioText = (r: number) => (r < 1e4 ? fmt(r, r < 10 ? 2 : 0) : sci(r, 1));

export default function MagnitudeLab() {
  const [mA, setMA] = useState(1);
  const [mB, setMB] = useState(6);

  const ratio = 10 ** (0.4 * (mB - mA));
  const photons = (m: number) => PHOTONS_M0 * 10 ** (-0.4 * m);
  const dotR = (m: number) => Math.max(1.2, 22 - 2.2 * (m + 2));
  const glow = (m: number) => Math.max(0.15, Math.min(1, 1 - (m - 1) / 10));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Стълбата на звездните величини</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Колкото по-голяма е величината, толкова по-слаб е обектът. Разлика от 5 величини е точно 100 пъти по блясък. Преместете двете
        звезди и сравнете.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} stroke="white" strokeOpacity="0.4" />
        {Array.from({ length: 12 }, (_, i) => -25 + i * 5).map(m => (
          <g key={m}>
            <line x1={mx(m)} x2={mx(m)} y1={AXIS_Y - 4} y2={AXIS_Y + 4} stroke="white" strokeOpacity="0.5" />
            <text x={mx(m)} y={AXIS_Y + 16} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
              {m}
            </text>
          </g>
        ))}
        <text x={X1} y={AXIS_Y + 30} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
          по-слаби →
        </text>
        <text x={X0} y={AXIS_Y + 30} fontSize="9" fill="white" fillOpacity="0.5">
          ← по-ярки
        </text>
        {LADDER.map((o, i) => {
          const up = i % 2 === 0;
          return (
            <g key={o.name}>
              <circle cx={mx(o.m)} cy={AXIS_Y} r="2.5" fill="#fde68a" />
              <line x1={mx(o.m)} x2={mx(o.m)} y1={AXIS_Y} y2={up ? AXIS_Y - 14 - (i % 4) * 6 : AXIS_Y + 34 + (i % 4) * 5} stroke="#fde68a" strokeOpacity="0.3" />
              <text x={mx(o.m)} y={up ? AXIS_Y - 18 - (i % 4) * 6 : AXIS_Y + 44 + (i % 4) * 5} fontSize="9" textAnchor="middle" fill="#fde68a" fillOpacity="0.85">
                {o.name}
              </text>
            </g>
          );
        })}

        {/* Маркерите на двете звезди */}
        {[
          { m: mA, color: '#60a5fa', label: 'A' },
          { m: mB, color: '#f472b6', label: 'B' },
        ].map(s => (
          <g key={s.label}>
            <path d={`M ${mx(s.m)} ${AXIS_Y - 5} l -5 -9 l 10 0 z`} fill={s.color} />
            <text x={mx(s.m)} y={AXIS_Y - 17} fontSize="10" textAnchor="middle" fill={s.color} fontWeight="700">
              {s.label}
            </text>
          </g>
        ))}

        {/* Двете звезди „в окуляра“ */}
        {[
          { m: mA, x: 110, color: '#60a5fa', label: 'A' },
          { m: mB, x: 260, color: '#f472b6', label: 'B' },
        ].map(s => (
          <g key={s.label}>
            <circle cx={s.x} cy={180} r={42} fill="black" stroke="white" strokeOpacity="0.15" />
            <circle cx={s.x} cy={180} r={Math.min(40, dotR(s.m) * 1.6)} fill="white" fillOpacity={glow(s.m) * 0.07} />
            <circle cx={s.x} cy={180} r={Math.min(30, dotR(s.m))} fill="white" fillOpacity={glow(s.m)} />
            <text x={s.x} y={236} fontSize="11" textAnchor="middle" fill={s.color} fontWeight="700">
              {s.label}: m = {fmt(s.m, 1)}
            </text>
          </g>
        ))}

        <g transform="translate(340, 140)" fontSize="11" fill="white">
          <text x={0} y={0} fillOpacity="0.85">
            Δm = m_B − m_A = {fmt(mB - mA, 1)}
          </text>
          <text x={0} y={20} fill="#fde68a" fontWeight="700">
            {ratio >= 1 ? `A е ${ratioText(ratio)} пъти по-ярка от B` : `B е ${ratioText(1 / ratio)} пъти по-ярка от A`}
          </text>
          <text x={0} y={38} fontSize="10" fillOpacity="0.6">
            F_A / F_B = 10^(0,4 · Δm) = 2,512^Δm
          </text>
          <text x={0} y={62} fillOpacity="0.85">
            фотони в окото за секунда:
          </text>
          <text x={0} y={78} fill="#93c5fd">
            A: ~{ratioText(photons(mA))}
          </text>
          <text x={120} y={78} fill="#f9a8d4">
            B: ~{ratioText(photons(mB))}
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1 text-blue-600 dark:text-blue-400">Звезда A: m = {fmt(mA, 1)}</label>
          <input type="range" min={M_MIN} max={M_MAX - 2} step="0.1" value={mA} onChange={e => setMA(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1 text-pink-600 dark:text-pink-400">Звезда B: m = {fmt(mB, 1)}</label>
          <input type="range" min={M_MIN} max={M_MAX - 2} step="0.1" value={mB} onChange={e => setMB(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        Слънцето е ~10¹⁰ пъти по-ярко от Сириус, а Хъбъл улавя обекти 10¹⁰ пъти по-слаби от това, което виждаме с просто око. Без
        логаритмична скала тези числа просто не могат да се сравняват. Окото ни също възприема блясъка логаритмично – затова древната
        скала на Хипарх се оказва толкова сполучлива.
      </p>
    </div>
  );
}

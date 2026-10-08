import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const CX = 150;
const CY = 150;
const ORBIT_PX = 115;
const AU = 1.496e11;
const YEAR = 3.156e7;
const C_KMS = 299792;
// Графика на радиалните скорости
const GX0 = 330;
const GX1 = 620;
const GY0 = 40;
const GY1 = 190;
// Спектрална линия
const SX0 = 330;
const SX1 = 620;
const SY = 228;
const LAMBDA = 656.28; // Hα, nm

/** Ексцентрична аномалия от средната (уравнение на Кеплер). */
function kepler(M: number, e: number) {
  let E = M;
  for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/** Относително положение (в единици a) и истинска аномалия при средна аномалия M. */
function relative(M: number, e: number) {
  const E = kepler(M, e);
  const x = Math.cos(E) - e;
  const y = Math.sqrt(1 - e * e) * Math.sin(E);
  return { x, y, nu: Math.atan2(y, x) };
}

const PRESETS = [
  { name: 'Сириус A и B', m1: 2.06, m2: 1.02, a: 19.8, e: 0.59, i: 90 },
  { name: 'Алфа Кентавър A и B', m1: 1.08, m2: 0.91, a: 23.4, e: 0.52, i: 90 },
  { name: 'Тясна двойка (Спика)', m1: 11.4, m2: 7.2, a: 0.12, e: 0.12, i: 66 },
  { name: 'Слънце и Юпитер', m1: 1, m2: 0.000954, a: 5.2, e: 0.05, i: 90 },
];

export default function BinaryOrbitLab() {
  const [m1, setM1] = useState(2.06);
  const [m2, setM2] = useState(1.02);
  const [logA, setLogA] = useState(Math.log10(19.8));
  const [e, setE] = useState(0.59);
  const [inc, setInc] = useState(90);
  const [phase, setPhase] = useState(0.3);
  const [playing, setPlaying] = useState(false);

  useAnimationFrame(playing, dt => setPhase(v => v + (2 * Math.PI * dt) / 6));

  const a = 10 ** logA;
  const M = m1 + m2;
  const P = Math.sqrt(a ** 3 / M); // години
  const a1 = (a * m2) / M;
  const a2 = (a * m1) / M;
  const sinI = Math.sin((inc * Math.PI) / 180);
  // Амплитуди на радиалната скорост (km/s)
  const kOf = (ai: number) => ((2 * Math.PI * ai * AU * sinI) / (P * YEAR * Math.sqrt(1 - e * e))) / 1000;
  const k1 = kOf(a1);
  const k2 = kOf(a2);
  // Земята е долу (по оста y): скоростта към/от нас е y-компонентата, ∝ cos ν + e
  const vr = (k: number, nu: number, sign: number) => sign * k * (Math.cos(nu) + e);

  const rel = relative(phase % (2 * Math.PI), e);
  const scale = ORBIT_PX / (1 + e);
  const p1 = { x: CX - rel.x * scale * (m2 / M), y: CY + rel.y * scale * (m2 / M) };
  const p2 = { x: CX + rel.x * scale * (m1 / M), y: CY - rel.y * scale * (m1 / M) };
  const v1 = vr(k1, rel.nu, -1);
  const v2 = vr(k2, rel.nu, 1);

  const orbitPts = (f: number, sign: number) =>
    Array.from({ length: 121 }, (_, i) => {
      const q = relative((i / 120) * 2 * Math.PI, e);
      return `${CX + sign * q.x * scale * f},${CY - sign * q.y * scale * f}`;
    }).join(' ');

  const kMax = Math.max(k1, k2, 1e-6) * (1 + e) * 1.05;
  const gy = (v: number) => (GY0 + GY1) / 2 - (v / kMax) * ((GY1 - GY0) / 2);
  const curve = (k: number, sign: number) =>
    Array.from({ length: 121 }, (_, i) => {
      const q = relative((i / 120) * 2 * Math.PI, e);
      return `${GX0 + (i / 120) * (GX1 - GX0)},${gy(vr(k, q.nu, sign))}`;
    }).join(' ');
  const phaseX = GX0 + ((phase % (2 * Math.PI)) / (2 * Math.PI)) * (GX1 - GX0);

  // Спектрална линия: Δλ = λ · v / c, увеличено така, че да се вижда
  const dLambdaMax = (LAMBDA * kMax) / C_KMS;
  const sx = (v: number) => (SX0 + SX1) / 2 + (((LAMBDA * v) / C_KMS) / dLambdaMax) * ((SX1 - SX0) / 2) * 0.9;

  const choose = (p: (typeof PRESETS)[number]) => {
    setM1(p.m1);
    setM2(p.m2);
    setLogA(Math.log10(p.a));
    setE(p.e);
    setInc(p.i);
  };

  const formatP = P < 0.1 ? `${fmt(P * 365.25, 2)} дни` : `${fmt(P, P < 10 ? 2 : 1)} години`;
  const kText = (k: number) => (k < 0.1 ? `${fmt(k * 1000, 1)} m/s` : `${fmt(k, 1)} km/s`);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Двойна звезда: орбита и спектър</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Вляво – орбитите, гледани отгоре; двете звезди обикалят около общия център на масите (+). Вдясно – как ги вижда
        спектроскопът: радиалните скорости и линията Hα, която се разцепва на две.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <polyline points={orbitPts(m2 / M, -1)} fill="none" stroke="#fde68a" strokeOpacity="0.4" />
        <polyline points={orbitPts(m1 / M, 1)} fill="none" stroke="#93c5fd" strokeOpacity="0.4" />
        <path d={`M ${CX - 5} ${CY} h 10 M ${CX} ${CY - 5} v 10`} stroke="#f472b6" strokeWidth="1.5" />
        <circle cx={p1.x} cy={p1.y} r={4 + 3 * Math.cbrt(m1)} fill="#fde68a" />
        <circle cx={p2.x} cy={p2.y} r={Math.max(2.5, 4 + 3 * Math.cbrt(m2) - (m2 < 0.01 ? 5 : 0))} fill="#93c5fd" />
        <text x={14} y={20} fontSize="10" fill="white" fillOpacity="0.6">
          ↓ към Земята (в равнината на листа)
        </text>

        {/* Радиални скорости */}
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <line x1={GX0} x2={GX1} y1={gy(0)} y2={gy(0)} stroke="white" strokeOpacity="0.25" />
        <polyline points={curve(k1, -1)} fill="none" stroke="#fde68a" strokeWidth="1.8" />
        <polyline points={curve(k2, 1)} fill="none" stroke="#93c5fd" strokeWidth="1.8" />
        <line x1={phaseX} x2={phaseX} y1={GY0} y2={GY1} stroke="#f472b6" strokeOpacity="0.8" />
        <circle cx={phaseX} cy={gy(v1)} r="3.5" fill="#fde68a" />
        <circle cx={phaseX} cy={gy(v2)} r="3.5" fill="#93c5fd" />
        <text x={GX0} y={GY0 - 8} fontSize="10" fill="white" fillOpacity="0.7">
          радиална скорост (+ = отдалечава се)
        </text>
        <text x={GX1} y={GY1 + 12} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
          един период →
        </text>

        {/* Спектралната линия */}
        <rect x={SX0} y={SY} width={SX1 - SX0} height={22} fill="#ef4444" fillOpacity="0.75" rx="3" />
        <line x1={(SX0 + SX1) / 2} x2={(SX0 + SX1) / 2} y1={SY - 4} y2={SY + 26} stroke="white" strokeOpacity="0.5" strokeDasharray="2 2" />
        <rect x={sx(v1) - 2} y={SY} width={4} height={22} fill="black" fillOpacity={0.4 + 0.5 * Math.min(1, m1 / Math.max(m1, m2))} />
        <rect x={sx(v2) - 2} y={SY} width={4} height={22} fill="black" fillOpacity={0.4 + 0.5 * Math.min(1, m2 / Math.max(m1, m2))} />
        <text x={SX0} y={SY + 36} fontSize="9" fill="white" fillOpacity="0.55">
          ← към синьо
        </text>
        <text x={SX1} y={SY + 36} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
          към червено →
        </text>
        <text x={(SX0 + SX1) / 2} y={SY + 36} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          Hα в покой (±{fmt(dLambdaMax * 1000, dLambdaMax < 0.01 ? 2 : 0)} pm)
        </text>
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center text-sm">
        {[
          { label: 'Период (P² = a³ / M)', value: formatP },
          { label: 'Разстояния до центъра', value: `${fmt(a1, a1 < 1 ? 3 : 1)} и ${fmt(a2, a2 < 1 ? 3 : 1)} AU` },
          { label: 'Амплитуда K₁ (жълта)', value: kText(k1) },
          { label: 'Амплитуда K₂ (синя)', value: kText(k2) },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1 text-amber-600 dark:text-amber-400">Маса M₁: {fmt(m1, 2)} M☉</label>
          <input type="range" min="0.3" max="15" step="0.01" value={m1} onChange={e2 => setM1(Number(e2.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1 text-blue-600 dark:text-blue-400">Маса M₂: {m2 < 0.01 ? fmt(m2, 5) : fmt(m2, 2)} M☉</label>
          <input type="range" min="0.0009" max="15" step="0.001" value={m2} onChange={e2 => setM2(Number(e2.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Голяма полуос: {fmt(a, a < 1 ? 3 : 1)} AU</label>
          <input type="range" min="-1.5" max="2" step="0.01" value={logA} onChange={e2 => setLogA(Number(e2.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Ексцентрицитет: {fmt(e, 2)}</label>
          <input type="range" min="0" max="0.85" step="0.01" value={e} onChange={e2 => setE(Number(e2.target.value))} className="w-full" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mt-3 mb-1">Наклон на орбитата: i = {inc}° (90° – гледаме я отстрани, 0° – отгоре)</label>
          <input type="range" min="0" max="90" value={inc} onChange={e2 => setInc(Number(e2.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
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
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        По-масивната звезда е по-близо до центъра и се движи по-бавно: a₁ / a₂ = K₁ / K₂ = M₂ / M₁. Затова от отношението на двете
        амплитуди веднага получаваме отношението на масите. При i = 0° радиалните скорости изчезват – спектроскопът не „вижда“
        въртенето.
      </p>
    </div>
  );
}

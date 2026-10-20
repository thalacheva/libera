import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note } from '~/geometry/diagram';

// Опростен модел: белязаният белтък минава поред ГЕМ → Голджи → секреторни мехурчета → навън,
// като от всяко отделение излиза с постоянна скорост (k, 1/min). Стойностите са приблизителни.
const K1 = 0.08;
const K2 = 0.04;
const K3 = 0.015;
const T_MAX = 150;

/** Каква част от белязания белтък е във всяко отделение в момента t (min) след импулса. */
function fractions(t: number) {
  const e1 = Math.exp(-K1 * t);
  const e2 = Math.exp(-K2 * t);
  const e3 = Math.exp(-K3 * t);
  const a = e1;
  const b = (K1 / (K2 - K1)) * (e1 - e2);
  const c = K1 * K2 * (e1 / ((K2 - K1) * (K3 - K1)) + e2 / ((K1 - K2) * (K3 - K2)) + e3 / ((K1 - K3) * (K2 - K3)));
  return [a, b, c, Math.max(0, 1 - a - b - c)];
}

const PARTS = [
  { name: 'грапава ЕПМ', color: '#2563eb' },
  { name: 'апарат на Голджи', color: '#d97706' },
  { name: 'секреторни мехурчета', color: '#16a34a' },
  { name: 'изнесен от клетката', color: '#db2777' },
];
// Областите в схемата на клетката, където се рисуват белязаните частици
const ZONES = [
  { x: 50, w: 44 },
  { x: 104, w: 44 },
  { x: 158, w: 44 },
  { x: 222, w: 18 },
];
const DOTS = 40;
const rand = (i: number) => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};

// Графиката
const GX = 270;
const GW = 200;
const GY = 30;
const GH = 170;
const gx = (t: number) => GX + (t / T_MAX) * GW;
const gy = (f: number) => GY + GH - f * GH;
const CURVES = PARTS.map((_, k) =>
  Array.from({ length: 76 }, (_, i) => {
    const t = (i / 75) * T_MAX;
    return `${gx(t).toFixed(1)},${gy(fractions(t)[k]).toFixed(1)}`;
  }).join(' ')
);

/** Опитът на Паладе „импулс и гонене“: проследи белязания белтък през клетката. */
export default function PulseChaseLab() {
  const [t, setT] = useState(0);
  const f = fractions(t);

  // Разпределяме точките по отделенията; закръгляме така, че сборът да е DOTS
  const counts = f.map(v => Math.floor(v * DOTS));
  let rest = DOTS - counts.reduce((s, v) => s + v, 0);
  [...f.keys()].sort((i, j) => (f[j] * DOTS - counts[j]) - (f[i] * DOTS - counts[i])).forEach(i => {
    if (rest > 0) {
      counts[i]++;
      rest--;
    }
  });
  const main = f.indexOf(Math.max(...f));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Схема на клетката: ядро, ГЕМ, Голджи, мехурчета, мембрана */}
        <rect x={4} y={30} width={212} height={170} rx={14} fill="#fde2e4" />
        <path d="M4 77 A38 38 0 0 1 4 153 Z" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="2" />
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M${56 + i * 10} 45 Q${66 + i * 10} 115 ${56 + i * 10} 185`} fill="none" stroke="#93c5fd" strokeWidth="4" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M${112 + i * 8} 80 Q${100 + i * 8} 115 ${112 + i * 8} 150`} fill="none" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" />
        ))}
        {[60, 95, 130, 165].map(y => (
          <circle key={y} cx={180} cy={y} r={11} fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
        ))}
        <line x1={216} x2={216} y1={30} y2={200} stroke="#be123c" strokeWidth="3" />
        {ZONES.map((z, k) =>
          Array.from({ length: counts[k] }, (_, i) => (
            <circle key={`${k}-${i}`} cx={z.x + rand(i * 4 + k) * z.w} cy={42 + rand(i * 4 + k + 200) * 146} r="3" fill={PARTS[k].color} stroke="white" strokeWidth="0.8" />
          ))
        )}
        <text x={72} y={218} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          ГЕМ
        </text>
        <text x={124} y={218} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          Голджи
        </text>
        <text x={180} y={218} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          мехурчета
        </text>
        <text x={232} y={218} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          навън
        </text>
        <text x={110} y={18} fontSize="15" fontWeight="700" textAnchor="middle" fill="currentColor">
          {t} min след импулса
        </text>

        {/* Графика: каква част от белязания белтък е във всяко отделение */}
        <line x1={GX} x2={GX + GW} y1={GY + GH} y2={GY + GH} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
        {[0, 50, 100, 150].map(v => (
          <text key={v} x={gx(v)} y={GY + GH + 15} fontSize="11" textAnchor="middle" fill="currentColor">
            {v}
          </text>
        ))}
        <text x={GX + GW} y={GY + GH + 30} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          t, min
        </text>
        {[0, 50, 100].map(v => (
          <text key={v} x={GX - 5} y={gy(v / 100) + 4} fontSize="11" textAnchor="end" fill="currentColor">
            {v}%
          </text>
        ))}
        {CURVES.map((pts, k) => (
          <polyline key={k} points={pts} fill="none" stroke={PARTS[k].color} strokeWidth="2.5" />
        ))}
        <line x1={gx(t)} x2={gx(t)} y1={GY} y2={GY + GH} className="stroke-gray-500" strokeDasharray="4 3" />
        {f.map((v, k) => (
          <circle key={k} cx={gx(t)} cy={gy(v)} r="4" fill={PARTS[k].color} />
        ))}
      </LabSvg>

      <Sliders>
        <Slider label={`Време: ${t} min`} value={t} onChange={setT} min={0} max={T_MAX} step={1} tone="rose" />
      </Sliders>
      <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs sm:text-sm">
        {PARTS.map((p, k) => (
          <span key={p.name} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 dark:border-gray-700 dark:bg-gray-900/50">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-700 dark:text-gray-200">{p.name}</span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{Math.round(f[k] * 100)}%</span>
          </span>
        ))}
      </div>
      <Note tone="violet">
        {t === 0
          ? 'Току-що е свършил кратък „импулс“ с радиоактивни аминокиселини – целият нов белтък е в грапавата ЕПМ, където работят рибозомите. Премести плъзгача.'
          : `Сега повечето белязан белтък е в: ${PARTS[main].name}. Пътят е винаги един и същ: ГЕМ → Голджи → мехурчета → навън.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 „Импулс“ – клетките получават за кратко белязани аминокиселини; „гонене“ – след това само обикновени. Така се проследява само
        белтъкът, направен по време на импулса. Кривите са от опростен модел; в истинския опит на Паладе времената са подобни – десетки
        минути до Голджи и около два часа до зрелите мехурчета.
      </p>
    </div>
  );
}

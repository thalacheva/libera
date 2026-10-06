import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { G, formatScientific } from './physics';

const PRESETS = [
  {
    label: 'Земя и Луна',
    a: { name: 'Земя', icon: '🌍', mass: 5.972e24 },
    b: { name: 'Луна', icon: '🌙', mass: 7.342e22 },
    r: 3.844e8,
    rLabel: '384 400 km',
  },
  {
    label: 'Слънце и Земя',
    a: { name: 'Слънце', icon: '☀️', mass: 1.989e30 },
    b: { name: 'Земя', icon: '🌍', mass: 5.972e24 },
    r: 1.496e11,
    rLabel: '1 AU',
  },
  {
    label: 'Земята и ти',
    a: { name: 'Земя', icon: '🌍', mass: 5.972e24 },
    b: { name: 'Ученик (60 kg)', icon: '🧑', mass: 60 },
    r: 6.371e6,
    rLabel: '6371 km (радиус на Земята)',
  },
  {
    label: 'Двама ученици',
    a: { name: 'Ученик', icon: '🧑', mass: 60 },
    b: { name: 'Ученик', icon: '🧑', mass: 60 },
    r: 1,
    rLabel: '1 m',
  },
];

const MIN_K = 0.25;
const MAX_K = 4;

function formatRatio(ratio: number) {
  if (Math.abs(ratio - 1) < 0.005) return 'същата';
  return ratio > 1
    ? `${Number(ratio.toFixed(2)).toLocaleString('bg-BG')} пъти по-голяма`
    : `${Number((1 / ratio).toFixed(2)).toLocaleString('bg-BG')} пъти по-малка`;
}

export default function GravityPlayground() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [k1, setK1] = useState(1);
  const [k2, setK2] = useState(1);
  const [kr, setKr] = useState(1);

  const preset = PRESETS[presetIndex];
  const base = (G * preset.a.mass * preset.b.mass) / preset.r ** 2;
  const force = (base * k1 * k2) / kr ** 2;
  const ratio = force / base;

  const reset = () => {
    setK1(1);
    setK2(1);
    setKr(1);
  };

  const clamp = (v: number) => Math.min(MAX_K, Math.max(MIN_K, v));

  // Графика F(r) за текущите маси
  const GW = 280;
  const GH = 150;
  const gx = (k: number) => 30 + ((k - 0.5) / 3.5) * (GW - 40);
  const maxF = (k1 * k2) / 0.25;
  const gy = (f: number) => GH - 20 - (Math.min(f, maxF) / maxF) * (GH - 35);
  const curve = Array.from({ length: 80 }, (_, i) => {
    const k = 0.5 + (i / 79) * 3.5;
    return `${gx(k)},${gy((k1 * k2) / k ** 2)}`;
  }).join(' ');

  // Визуализация: размерът на телата зависи от масата (логаритмично)
  const sizeA = 12 + Math.log10(preset.a.mass * k1) * 0.8;
  const sizeB = 12 + Math.log10(preset.b.mass * k2) * 0.8;
  const separation = 120 + kr * 70;
  const ax = 300 - separation / 2;
  const bx = 300 + separation / 2;
  // Стрелките растат със силата, но не се застъпват
  const arrow = Math.min(
    26 + 14 * Math.log2(ratio * 4 + 1),
    (separation - sizeA - sizeB) / 2 - 12
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Лаборатория „Привличане“
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Удвоявайте масите и разстоянието и предскажете силата, преди да
        погледнете!
      </p>

      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => {
              setPresetIndex(i);
              reset();
            }}
            className={`px-3 py-1 rounded text-sm border ${
              presetIndex === i
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 600 170" className="w-full h-auto">
        <defs>
          <marker
            id="force-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="rgb(239, 68, 68)" />
          </marker>
        </defs>
        <line
          x1={ax}
          y1="80"
          x2={bx}
          y2="80"
          stroke="rgb(148, 163, 184)"
          strokeDasharray="4,4"
        />
        <text
          x="300"
          y="150"
          fontSize="12"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          r ={' '}
          {kr === 1
            ? preset.rLabel
            : `${Number(kr.toFixed(2)).toLocaleString('bg-BG')} × ${preset.rLabel}`}
        </text>
        <circle
          cx={ax}
          cy="80"
          r={sizeA}
          fill="rgb(59, 130, 246)"
          opacity="0.2"
        />
        <text x={ax} y="88" fontSize={sizeA} textAnchor="middle">
          {preset.a.icon}
        </text>
        <circle
          cx={bx}
          cy="80"
          r={sizeB}
          fill="rgb(148, 163, 184)"
          opacity="0.2"
        />
        <text x={bx} y="88" fontSize={sizeB} textAnchor="middle">
          {preset.b.icon}
        </text>
        {/* Силите са равни по големина и противоположни – III закон */}
        <line
          x1={ax + sizeA + 4}
          y1="80"
          x2={ax + sizeA + 4 + arrow}
          y2="80"
          stroke="rgb(239, 68, 68)"
          strokeWidth="3"
          markerEnd="url(#force-arrow)"
        />
        <line
          x1={bx - sizeB - 4}
          y1="80"
          x2={bx - sizeB - 4 - arrow}
          y2="80"
          stroke="rgb(239, 68, 68)"
          strokeWidth="3"
          markerEnd="url(#force-arrow)"
        />
        <text
          x={ax + sizeA + 8}
          y="66"
          fontSize="12"
          fill="rgb(239, 68, 68)"
          fontWeight="bold"
        >
          F
        </text>
        <text
          x={bx - sizeB - 16}
          y="66"
          fontSize="12"
          fill="rgb(239, 68, 68)"
          fontWeight="bold"
        >
          F
        </text>
        <text
          x={ax}
          y={80 + sizeA + 18}
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          {preset.a.name} {k1 !== 1 && `× ${k1}`}
        </text>
        <text
          x={bx}
          y={80 + sizeB + 18}
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-600 dark:fill-gray-300"
        >
          {preset.b.name} {k2 !== 1 && `× ${k2}`}
        </text>
      </svg>

      <div className="grid sm:grid-cols-3 gap-3 mt-2 text-sm">
        {[
          {
            label: `Маса: ${preset.a.name}`,
            value: k1,
            set: setK1,
          },
          {
            label: `Маса: ${preset.b.name}`,
            value: k2,
            set: setK2,
          },
          { label: 'Разстояние', value: kr, set: setKr },
        ].map(c => (
          <div
            key={c.label}
            className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg text-center"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {c.label}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => c.set(v => clamp(v / 2))}
                className="px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600"
              >
                ÷2
              </button>
              <span className="font-mono font-bold w-12">
                ×{Number(c.value.toFixed(2)).toLocaleString('bg-BG')}
              </span>
              <button
                onClick={() => c.set(v => clamp(v * 2))}
                className="px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600"
              >
                ×2
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <label className="block text-sm font-semibold mb-1">
          Плавно разстояние: × {Number(kr.toFixed(2)).toLocaleString('bg-BG')}
        </label>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.01"
          value={kr}
          onChange={e => setKr(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="grid sm:grid-cols-[1fr_280px] gap-4 mt-4 items-center">
        <div className="text-center sm:text-left space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Сила на привличане
          </p>
          <p className="text-2xl font-bold font-mono">
            F = {formatScientific(force)} N
          </p>
          <p className="text-sm">
            Спрямо началото силата е{' '}
            <strong className="text-blue-600 dark:text-blue-400">
              {formatRatio(ratio)}
            </strong>
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw size={12} /> Начало
          </button>
        </div>
        <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full h-auto">
          <line
            x1="30"
            y1={GH - 20}
            x2={GW - 5}
            y2={GH - 20}
            stroke="rgb(148, 163, 184)"
          />
          <line
            x1="30"
            y1="10"
            x2="30"
            y2={GH - 20}
            stroke="rgb(148, 163, 184)"
          />
          <polyline
            points={curve}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
          <circle cx={gx(kr)} cy={gy(ratio)} r="5" fill="rgb(239, 68, 68)" />
          {[1, 2, 3, 4].map(k => (
            <text
              key={k}
              x={gx(k)}
              y={GH - 6}
              fontSize="10"
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400"
            >
              ×{k}
            </text>
          ))}
          <text
            x="12"
            y="20"
            fontSize="11"
            className="fill-gray-500 dark:fill-gray-400"
          >
            F
          </text>
          <text
            x={GW - 10}
            y={GH - 26}
            fontSize="11"
            textAnchor="end"
            className="fill-gray-500 dark:fill-gray-400"
          >
            r
          </text>
          <text x={gx(2.6)} y="30" fontSize="11" className="fill-blue-500">
            F ∝ 1/r²
          </text>
        </svg>
      </div>
    </div>
  );
}

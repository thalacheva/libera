import { useState } from 'react';

const W = 600;
const H = 400;
const CX = 300;
const CY = 200;
const BODY = 0.35; // радиус на планетата в единици r₀
const VIEW = 3.2; // докъде се вижда, в единици r₀

const PRESETS = [
  { label: '0,8 v₁', k: 0.8 },
  { label: 'v₁ (кръг)', k: 1 },
  { label: '1,2 v₁', k: 1.2 },
  { label: '√2 v₁ = v₂', k: Math.SQRT2 },
  { label: '1,6 v₁', k: 1.6 },
];

type Kind = 'crash' | 'ellipse' | 'circle' | 'parabola' | 'hyperbola';

const KIND_LABELS: Record<Kind, string> = {
  crash: 'Елипса, пресичаща планетата – удар',
  ellipse: 'Елипса (затворена орбита)',
  circle: 'Окръжност',
  parabola: 'Парабола – точно скоростта за бягство',
  hyperbola: 'Хипербола – тялото напуска завинаги',
};

export default function VisVivaLab() {
  const [k, setK] = useState(1.2);

  // В единици r₀ = 1, GM = 1: кръговата скорост е 1
  const eSigned = k * k - 1;
  const e = Math.abs(eSigned);
  const radius = (theta: number) => (k * k) / (1 + eSigned * Math.cos(theta));
  const periapsis = k >= 1 ? 1 : (k * k) / (2 - k * k);
  const apoapsis =
    k >= 1 ? (k < Math.SQRT2 ? (k * k) / (2 - k * k) : Infinity) : 1;
  const energy = (k * k) / 2 - 1;
  const semiMajor = 1 / (2 - k * k);

  const kind: Kind =
    Math.abs(k - 1) < 0.005
      ? 'circle'
      : Math.abs(k - Math.SQRT2) < 0.005
        ? 'parabola'
        : k > Math.SQRT2
          ? 'hyperbola'
          : periapsis < BODY
            ? 'crash'
            : 'ellipse';

  const maxR = Math.min(Number.isFinite(apoapsis) ? apoapsis : VIEW, VIEW);
  // Мащабът се подбира така, че най-далечната точка да е в кадъра
  const scale = Math.min(140, 175 / maxR);

  // Изстрелваме от върха (θ = 0) хоризонтално надясно
  const points: string[] = [];
  for (let i = 0; i <= 720; i++) {
    const theta = (i / 720) * 2 * Math.PI;
    const denom = 1 + eSigned * Math.cos(theta);
    if (denom <= 1e-3) break;
    const r = radius(theta);
    if (r < BODY || r > VIEW * 1.6) break;
    points.push(
      `${CX + r * Math.sin(theta) * scale},${CY - r * Math.cos(theta) * scale}`
    );
  }

  const fmt = (v: number, d = 2) =>
    Number.isFinite(v) ? v.toFixed(d).replace('.', ',') : '∞';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Формата на орбитата зависи от скоростта
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Тяло стартира хоризонтално от разстояние r₀. Променете скоростта му и
        вижте коничното сечение, по което ще полети.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto rounded-lg bg-slate-900"
      >
        <circle
          cx={CX}
          cy={CY}
          r={scale}
          fill="none"
          stroke="white"
          strokeOpacity="0.15"
          strokeDasharray="3,4"
        />
        <circle cx={CX} cy={CY} r={BODY * scale} fill="rgb(37, 99, 235)" />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="rgb(251, 146, 60)"
          strokeWidth="2.5"
        />
        <circle
          cx={CX}
          cy={CY - scale}
          r="6"
          fill="white"
          stroke="rgb(251, 146, 60)"
          strokeWidth="2"
        />
        <line
          x1={CX}
          y1={CY - scale}
          x2={CX + 30 * k}
          y2={CY - scale}
          stroke="rgb(52, 211, 153)"
          strokeWidth="3"
          markerEnd="url(#visviva-arrow)"
        />
        <defs>
          <marker
            id="visviva-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="rgb(52, 211, 153)" />
          </marker>
        </defs>
        <text x="12" y="22" fontSize="13" fill="white">
          {KIND_LABELS[kind]}
        </text>
        <text x="12" y={H - 12} fontSize="10" fill="white" opacity="0.6">
          Пунктирът е кръговата орбита с радиус r₀
        </text>
      </svg>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">
          Начална скорост: v = {fmt(k)} · v₁
        </label>
        <input
          type="range"
          min="0.3"
          max="1.8"
          step="0.001"
          value={k}
          onChange={ev => setK(Number(ev.target.value))}
          className="w-full"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setK(p.k)}
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-center text-sm">
        {[
          { label: 'Ексцентрицитет e', value: fmt(e, 3) },
          {
            label: 'Голяма полуос a',
            value: k >= Math.SQRT2 - 0.005 ? '—' : `${fmt(semiMajor)} r₀`,
          },
          { label: 'Най-близо', value: `${fmt(periapsis)} r₀` },
          { label: 'Най-далеч', value: `${fmt(apoapsis)} r₀` },
          {
            label: 'Енергия ε = v²/2 − GM/r',
            value: energy < -0.002 ? '< 0' : energy > 0.002 ? '> 0' : '= 0',
          },
        ].map(s => (
          <div
            key={s.label}
            className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {s.label}
            </div>
            <div className="font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

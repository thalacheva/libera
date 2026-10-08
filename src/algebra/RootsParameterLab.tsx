import { useState } from 'react';

const W = 640;
const H = 230;
// Лява графика: D(m); дясна: y = A x² + B x + C
const L = { x0: 20, x1: 300 };
const R = { x0: 340, x1: 620 };
const Y0 = 15;
const Y1 = 205;
const M_MIN = -6;
const M_MAX = 6;
const X_MIN = -6;
const X_MAX = 6;

const num = (n: number) => {
  const v = Math.round(n * 100) / 100;
  return v < 0 ? `−${(-v).toLocaleString('bg-BG')}` : v.toLocaleString('bg-BG');
};

const term = (k: number, s: string, first = false) => {
  if (Math.abs(k) < 1e-9) return '';
  const abs = Math.abs(k);
  const body = abs === 1 && s ? s : `${num(abs)}${s}`;
  if (first) return k < 0 ? `−${body}` : body;
  return k < 0 ? ` − ${body}` : ` + ${body}`;
};
const poly = (A: number, B: number, C: number) => `${term(A, 'x²', true)}${term(B, 'x', Math.abs(A) < 1e-9)}${term(C, '')}` || '0';

const FAMILIES = [
  {
    text: 'x² + mx + 4 = 0',
    A: () => 1,
    B: (m: number) => m,
    C: () => 4,
    note: 'D = m² − 16: два корена при |m| > 4, двоен при m = ±4, няма при |m| < 4. Произведението е 4 > 0 – корените винаги са с еднакъв знак.',
  },
  {
    text: '(m − 1)x² + 2x + 1 = 0',
    A: (m: number) => m - 1,
    B: () => 2,
    C: () => 1,
    note: 'Внимание: при m = 1 уравнението е линейно (2x + 1 = 0) и има един корен! При m ≠ 1: D = 4 − 4(m − 1) = 8 − 4m.',
  },
  {
    text: 'x² − 2mx + m + 2 = 0',
    A: () => 1,
    B: (m: number) => -2 * m,
    C: (m: number) => m + 2,
    note: 'D/4 = m² − m − 2 = (m + 1)(m − 2): два корена при m < −1 или m > 2, двоен при m = −1 и m = 2.',
  },
];

export default function RootsParameterLab() {
  const [fi, setFi] = useState(0);
  const [m, setM] = useState(5);
  const f = FAMILIES[fi];
  const A = f.A(m);
  const B = f.B(m);
  const C = f.C(m);
  const linear = Math.abs(A) < 1e-9;
  const D = B * B - 4 * A * C;
  const roots = linear ? [-C / B] : D > 1e-9 ? [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)].sort((p, q) => p - q) : Math.abs(D) <= 1e-9 ? [-B / (2 * A)] : [];

  // D(m) по цялата ос на параметъра
  const Dm = (mm: number) => f.B(mm) ** 2 - 4 * f.A(mm) * f.C(mm);
  const dVals = Array.from({ length: 121 }, (_, i) => Dm(M_MIN + (i / 120) * (M_MAX - M_MIN)));
  const dMax = Math.max(...dVals.map(Math.abs), 4);
  const lx = (mm: number) => L.x0 + ((mm - M_MIN) / (M_MAX - M_MIN)) * (L.x1 - L.x0);
  const ly = (d: number) => (Y0 + Y1) / 2 - (d / dMax) * ((Y1 - Y0) / 2 - 6);
  const dCurve = dVals.map((d, i) => `${lx(M_MIN + (i / 120) * (M_MAX - M_MIN))},${ly(d)}`).join(' ');

  const rx = (x: number) => R.x0 + ((x - X_MIN) / (X_MAX - X_MIN)) * (R.x1 - R.x0);
  const fx = (x: number) => A * x * x + B * x + C;
  const yScale = Math.max(Math.abs(fx(0)), Math.abs(fx(-B / (2 * A || 1))), 8) * 1.3;
  const ry = (y: number) => (Y0 + Y1) / 2 - (y / yScale) * ((Y1 - Y0) / 2);
  const pCurve = Array.from({ length: 161 }, (_, i) => {
    const x = X_MIN + (i / 160) * (X_MAX - X_MIN);
    return `${rx(x)},${ry(fx(x))}`;
  }).join(' ');

  const count = roots.length;
  const sign = !linear && count > 0 ? (C / A > 0 ? (-B / A > 0 ? 'и двата корена са положителни' : 'и двата корена са отрицателни') : C / A < 0 ? 'корените са с различни знаци' : 'единият корен е 0') : '';

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-rose-200 dark:border-rose-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🎚️ Колко корена при всяко m?</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Отляво е дискриминантата като функция на параметъра m, отдясно – параболата при избраното m. Знакът на D решава всичко.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {FAMILIES.map((g, i) => (
          <button
            key={g.text}
            onClick={() => setFi(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono border ${
              i === fi ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {g.text}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        <defs>
          <clipPath id="rp-l">
            <rect x={L.x0} y={Y0} width={L.x1 - L.x0} height={Y1 - Y0} />
          </clipPath>
          <clipPath id="rp-r">
            <rect x={R.x0} y={Y0} width={R.x1 - R.x0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        {/* Зони по знака на D */}
        <rect x={L.x0} y={Y0} width={L.x1 - L.x0} height={ly(0) - Y0} fill="#16a34a" opacity="0.06" />
        <rect x={L.x0} y={ly(0)} width={L.x1 - L.x0} height={Y1 - ly(0)} fill="#ef4444" opacity="0.06" />
        <text x={L.x0 + 4} y={Y0 + 12} fontSize="10" fill="#16a34a">
          D &gt; 0: два корена
        </text>
        <text x={L.x0 + 4} y={Y1 - 4} fontSize="10" fill="#ef4444">
          D &lt; 0: няма корени
        </text>
        <line x1={L.x0} x2={L.x1} y1={ly(0)} y2={ly(0)} stroke="currentColor" strokeWidth="1.2" />
        <line x1={lx(0)} x2={lx(0)} y1={Y0} y2={Y1} stroke="currentColor" strokeOpacity="0.4" />
        <polyline points={dCurve} fill="none" stroke="#e11d48" strokeWidth="2.5" clipPath="url(#rp-l)" />
        <line x1={lx(m)} x2={lx(m)} y1={Y0} y2={Y1} stroke="#e11d48" strokeOpacity="0.4" strokeDasharray="4 3" />
        <circle cx={lx(m)} cy={ly(Math.max(-dMax, Math.min(dMax, D)))} r={6} fill="#e11d48" stroke="white" strokeWidth="2" />
        {[-6, -4, -2, 2, 4, 6].map(v => (
          <text key={v} x={lx(v)} y={Y1 + 14} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.55">
            {num(v)}
          </text>
        ))}
        <text x={L.x1 + 12} y={Y1 + 14} fontSize="10" fill="currentColor" opacity="0.7">
          m
        </text>
        <text x={lx(0) + 4} y={Y0 + 26} fontSize="10" fill="#e11d48">
          D(m)
        </text>

        {/* Парабола */}
        <line x1={R.x0} x2={R.x1} y1={ry(0)} y2={ry(0)} stroke="currentColor" strokeWidth="1.2" />
        <line x1={rx(0)} x2={rx(0)} y1={Y0} y2={Y1} stroke="currentColor" strokeOpacity="0.4" />
        <polyline points={pCurve} fill="none" stroke="#2563eb" strokeWidth="3" clipPath="url(#rp-r)" />
        {roots.map((r, i) =>
          r >= X_MIN && r <= X_MAX ? (
            <g key={i}>
              <circle cx={rx(r)} cy={ry(0)} r={6} fill="#ef4444" stroke="white" strokeWidth="2" />
              <text x={rx(r)} y={ry(0) + (i ? 20 : -10)} fontSize="10" textAnchor="middle" fill="#ef4444" fontWeight="700">
                {num(r)}
              </text>
            </g>
          ) : null,
        )}
        <text x={R.x0} y={Y1 + 14} fontSize="10" fill="currentColor" opacity="0.7">
          {linear ? 'при това m уравнението е линейно' : `y = ${poly(A, B, C)}`}
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-2">
        Параметър m = {num(m)}
        <input type="range" min={M_MIN} max={M_MAX} step="0.25" value={m} onChange={e => setM(Number(e.target.value))} className="w-full" />
      </label>
      <div
        className={`mt-3 rounded-xl p-3 text-sm sm:text-base font-semibold text-center ${
          count === 0 ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        }`}
      >
        {linear
          ? `Линейно уравнение – един корен x = ${num(roots[0])}.`
          : count === 0
            ? `D = ${num(D)} < 0 – няма реални корени.`
            : count === 1
              ? `D = 0 – двоен корен x = ${num(roots[0])}.`
              : `D = ${num(D)} > 0 – два корена: ${num(roots[0])} и ${num(roots[1])}; ${sign}.`}
      </div>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{f.note}</p>
    </div>
  );
}

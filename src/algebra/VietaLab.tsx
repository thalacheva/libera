import { useState } from 'react';

const W = 400;
const H = 240;
const U = 18;
const X = (x: number) => W / 2 + x * U;

const num = (n: number) => {
  const v = Math.round(n * 100) / 100;
  return v < 0 ? `−${(-v).toLocaleString('bg-BG')}` : v.toLocaleString('bg-BG');
};
// Записва коефициент пред член със знак: + 3x, − x, …
const term = (k: number, s: string, first = false) => {
  if (k === 0) return '';
  const abs = Math.abs(k);
  const body = abs === 1 && s ? s : `${num(abs)}${s}`;
  if (first) return k < 0 ? `−${body}` : body;
  return k < 0 ? ` − ${body}` : ` + ${body}`;
};
const factor = (r: number) => (r === 0 ? 'x' : r > 0 ? `(x − ${num(r)})` : `(x + ${num(-r)})`);

export default function VietaLab() {
  const [x1, setX1] = useState(-1);
  const [x2, setX2] = useState(3);
  const [a, setA] = useState(1);

  const S = x1 + x2;
  const P = x1 * x2;
  const b = -a * S;
  const c = a * P;
  const expanded = `${term(a, 'x²', true)}${term(b, 'x')}${term(c, '')} = 0`;
  const factored = `${a === 1 ? '' : a === -1 ? '−' : num(a)}${factor(x1)}${x1 === x2 ? '²' : factor(x2)} = 0`;

  // Парабола y = a(x − x1)(x − x2), мащабирана по височина
  const xv = S / 2;
  const yv = a * (xv - x1) * (xv - x2);
  const yMax = Math.max(Math.abs(yv), Math.abs(a * (7 - x1) * (7 - x2)) * 0.3, 4);
  const uy = (H / 2 - 14) / yMax;
  const Y = (y: number) => H / 2 - y * uy;
  const pts = Array.from({ length: 121 }, (_, i) => {
    const x = -10 + (i / 120) * 20;
    return `${X(x)},${Y(a * (x - x1) * (x - x2))}`;
  }).join(' ');

  const slider = (label: string, v: number, set: (n: number) => void, min: number, max: number) => (
    <label className="text-sm font-semibold">
      {label} = {num(v)}
      <input type="range" min={min} max={max} step="1" value={v} onChange={e => set(Number(e.target.value))} className="w-full" />
    </label>
  );

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🔁 Уравнение по дадени корени</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Избери корените – уравнението се „сглобява“ само. Виж как сборът и произведението им се появяват в коефициентите.
      </p>

      <div className="grid sm:grid-cols-2 gap-2 mb-3 font-mono text-center">
        <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">разложен вид</p>
          <p className="text-base sm:text-lg text-orange-800 dark:text-orange-200">{factored}</p>
        </div>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">нормален вид</p>
          <p className="text-base sm:text-lg text-blue-800 dark:text-blue-200">{expanded}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-lg mx-auto text-gray-700 dark:text-gray-300">
        <defs>
          <clipPath id="vieta-clip">
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        {Array.from({ length: 21 }, (_, i) => i - 10).map(i => (
          <g key={i}>
            <line x1={X(i)} y1={0} x2={X(i)} y2={H} stroke="currentColor" opacity="0.07" />
            {i % 2 === 0 && i !== 0 && (
              <text x={X(i)} y={H / 2 + 13} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.5">
                {num(i)}
              </text>
            )}
          </g>
        ))}
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="currentColor" strokeWidth="1.2" />
        <line x1={X(0)} y1={0} x2={X(0)} y2={H} stroke="currentColor" strokeWidth="1.2" />
        <polyline points={pts} fill="none" stroke="#ea580c" strokeWidth="3" clipPath="url(#vieta-clip)" />
        <line x1={X(xv)} y1={0} x2={X(xv)} y2={H} stroke="#ea580c" strokeOpacity="0.35" strokeDasharray="4 4" />
        <text x={X(xv) + 4} y={12} fontSize="10" fill="#ea580c">
          x = (x₁ + x₂)/2
        </text>
        {[x1, x2].map((r, i) => (
          <g key={i}>
            <circle cx={X(r)} cy={H / 2} r={7} fill="#ef4444" stroke="white" strokeWidth="2" />
            <text x={X(r)} y={H / 2 - 12} fontSize="11" textAnchor="middle" fill="#ef4444" fontWeight="700">
              x{i === 0 ? '₁' : '₂'}
            </text>
          </g>
        ))}
      </svg>

      <div className="grid sm:grid-cols-3 gap-4 mt-2">
        {slider('x₁', x1, setX1, -6, 6)}
        {slider('x₂', x2, setX2, -6, 6)}
        {slider('a', a, v => setA(v === 0 ? 1 : v), -3, 3)}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm sm:text-base">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <p className="font-semibold">Сбор на корените</p>
          <p className="font-mono">
            x₁ + x₂ = {num(S)} = −b/a = −({num(b)})/{num(a)} ✓
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <p className="font-semibold">Произведение на корените</p>
          <p className="font-mono">
            x₁ · x₂ = {num(P)} = c/a = {num(c)}/{num(a)} ✓
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        При a = 1 уравнението с корени x₁ и x₂ е x² − (x₁ + x₂)x + x₁x₂ = 0 – <strong>обратната теорема на Виет</strong>.{' '}
        {x1 === x2 ? 'Двата корена съвпадат – параболата само докосва оста Ox (двоен корен).' : P < 0 ? 'Корените са с различни знаци – тогава c/a < 0.' : P > 0 ? `Корените са с еднакви знаци (c/a > 0) – и двата ${S > 0 ? 'положителни, защото сборът е > 0' : 'отрицателни, защото сборът е < 0'}.` : 'Единият корен е 0 – тогава c = 0.'}
      </p>
    </div>
  );
}

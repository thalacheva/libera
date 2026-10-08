import { useState } from 'react';

const W = 640;
const H = 240;
// Лява графика: t² + bt + c; дясна: x⁴ + bx² + c
const L = { x0: 20, x1: 300, tMin: -8, tMax: 12 };
const R = { x0: 340, x1: 620, xMin: -4.5, xMax: 4.5 };
const Y0 = 20;
const Y1 = 220;

const num = (n: number) => {
  const v = Math.round(n * 100) / 100;
  return v < 0 ? `−${(-v).toLocaleString('bg-BG')}` : v.toLocaleString('bg-BG');
};
const sgn = (k: number, s: string) => (k === 0 ? '' : k < 0 ? ` − ${Math.abs(k) === 1 && s ? '' : num(-k)}${s}` : ` + ${k === 1 && s ? '' : num(k)}${s}`);

export default function BiquadraticLab() {
  const [b, setB] = useState(-5);
  const [c, setC] = useState(4);

  const D = b * b - 4 * c;
  const ts = D > 0 ? [(-b - Math.sqrt(D)) / 2, (-b + Math.sqrt(D)) / 2] : D === 0 ? [-b / 2] : [];
  const xs = ts.flatMap(t => (t > 0 ? [-Math.sqrt(t), Math.sqrt(t)] : t === 0 ? [0] : [])).sort((p, q) => p - q);

  const yMin = -14;
  const yMax = 20;
  const gy = (y: number) => Y1 - ((Math.min(Math.max(y, yMin - 5), yMax + 5) - yMin) / (yMax - yMin)) * (Y1 - Y0);
  const lx = (t: number) => L.x0 + ((t - L.tMin) / (L.tMax - L.tMin)) * (L.x1 - L.x0);
  const rx = (x: number) => R.x0 + ((x - R.xMin) / (R.xMax - R.xMin)) * (R.x1 - R.x0);
  const tCurve = Array.from({ length: 161 }, (_, i) => {
    const t = L.tMin + (i / 160) * (L.tMax - L.tMin);
    return `${lx(t)},${gy(t * t + b * t + c)}`;
  }).join(' ');
  const xCurve = Array.from({ length: 241 }, (_, i) => {
    const x = R.xMin + (i / 240) * (R.xMax - R.xMin);
    return `${rx(x)},${gy(x ** 4 + b * x * x + c)}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-teal-200 dark:border-teal-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🔀 Биквадратно уравнение: смяна t = x²</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Уравнението от четвърта степен става квадратно спрямо t = x². Всеки положителен корен t дава два корена x = ±√t, а отрицателният –
        нито един.
      </p>
      <p className="text-center font-mono text-lg sm:text-xl mb-2 text-teal-700 dark:text-teal-300">
        x⁴{sgn(b, 'x²')}
        {sgn(c, '')} = 0 &nbsp;→&nbsp; t²{sgn(b, 't')}
        {sgn(c, '')} = 0
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        <defs>
          <clipPath id="bq-l">
            <rect x={L.x0} y={Y0} width={L.x1 - L.x0} height={Y1 - Y0} />
          </clipPath>
          <clipPath id="bq-r">
            <rect x={R.x0} y={Y0} width={R.x1 - R.x0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        {/* Лява: забранената област t < 0 */}
        <rect x={L.x0} y={Y0} width={lx(0) - L.x0} height={Y1 - Y0} fill="#ef4444" opacity="0.07" />
        <text x={(L.x0 + lx(0)) / 2} y={Y0 + 14} fontSize="10" textAnchor="middle" fill="#ef4444">
          t = x² &lt; 0 – невъзможно
        </text>
        <line x1={L.x0} x2={L.x1} y1={gy(0)} y2={gy(0)} stroke="currentColor" strokeWidth="1.2" />
        <line x1={lx(0)} x2={lx(0)} y1={Y0} y2={Y1} stroke="currentColor" strokeWidth="1.2" />
        <text x={L.x1 - 4} y={gy(0) - 5} fontSize="11" textAnchor="end" fill="currentColor">
          t
        </text>
        <polyline points={tCurve} fill="none" stroke="#0d9488" strokeWidth="3" clipPath="url(#bq-l)" />
        {ts.map((t, i) => (
          <g key={i}>
            <circle cx={lx(t)} cy={gy(0)} r={6} fill={t >= 0 ? '#16a34a' : '#ef4444'} stroke="white" strokeWidth="2" />
            <text x={lx(t)} y={gy(0) + (i ? 20 : -10)} fontSize="11" textAnchor="middle" fill={t >= 0 ? '#16a34a' : '#ef4444'} fontWeight="700">
              t = {num(t)}
            </text>
          </g>
        ))}
        <text x={L.x0} y={Y1 + 14} fontSize="10" fill="currentColor" opacity="0.6">
          y = t²{sgn(b, 't')}
          {sgn(c, '')}
        </text>

        {/* Дясна: x⁴ + bx² + c */}
        <line x1={R.x0} x2={R.x1} y1={gy(0)} y2={gy(0)} stroke="currentColor" strokeWidth="1.2" />
        <line x1={rx(0)} x2={rx(0)} y1={Y0} y2={Y1} stroke="currentColor" strokeWidth="1.2" />
        <text x={R.x1 - 4} y={gy(0) - 5} fontSize="11" textAnchor="end" fill="currentColor">
          x
        </text>
        <polyline points={xCurve} fill="none" stroke="#7c3aed" strokeWidth="3" clipPath="url(#bq-r)" />
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={rx(x)} cy={gy(0)} r={6} fill="#ef4444" stroke="white" strokeWidth="2" />
            <text x={rx(x)} y={gy(0) + (i % 2 ? 20 : -10)} fontSize="10" textAnchor="middle" fill="#ef4444" fontWeight="700">
              {num(x)}
            </text>
          </g>
        ))}
        <text x={R.x0} y={Y1 + 14} fontSize="10" fill="currentColor" opacity="0.6">
          y = x⁴{sgn(b, 'x²')}
          {sgn(c, '')}
        </text>
      </svg>

      <div className="grid sm:grid-cols-2 gap-4 mt-3">
        <label className="text-sm font-semibold">
          b = {num(b)}
          <input type="range" min="-10" max="10" step="1" value={b} onChange={e => setB(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm font-semibold">
          c = {num(c)}
          <input type="range" min="-10" max="20" step="1" value={c} onChange={e => setC(Number(e.target.value))} className="w-full" />
        </label>
      </div>
      <p className="mt-3 text-center text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">
        {xs.length === 0 ? 'Няма реални корени.' : `${xs.length} реални корен${xs.length === 1 ? '' : 'а'}: x = ${xs.map(num).join('; ')}`}
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">Пробвай b = −13, c = 36 (четири корена) или b = 3, c = 2 (нито един).</p>
    </div>
  );
}

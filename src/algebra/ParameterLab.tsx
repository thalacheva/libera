import { useState } from 'react';

const W = 400;
const H = 260;
const U = 13; // px на единица по x
const X = (x: number) => W / 2 + x * U;

const r2 = (v: number) => Math.round(v * 100) / 100;
const num = (n: number) => {
  const v = r2(n);
  return v < 0 ? `−${(-v).toLocaleString('bg-BG')}` : v.toLocaleString('bg-BG');
};

// Уравнения от вида p(a) · x = q(a)
const FAMILIES = [
  {
    text: '(a − 2)x = a² − 4',
    p: (a: number) => a - 2,
    q: (a: number) => a * a - 4,
    special: [2],
    analysis: ['a ≠ 2: делим на a − 2 ⇒ x = (a − 2)(a + 2)/(a − 2) = a + 2', 'a = 2: 0 · x = 0 ⇒ всяко x е решение'],
  },
  {
    text: '(a − 1)x = a + 1',
    p: (a: number) => a - 1,
    q: (a: number) => a + 1,
    special: [1],
    analysis: ['a ≠ 1: x = (a + 1)/(a − 1)', 'a = 1: 0 · x = 2 ⇒ няма решение'],
  },
  {
    text: '(a² − 9)x = a + 3',
    p: (a: number) => a * a - 9,
    q: (a: number) => a + 3,
    special: [-3, 3],
    analysis: ['a ≠ ±3: x = (a + 3)/((a − 3)(a + 3)) = 1/(a − 3)', 'a = −3: 0 · x = 0 ⇒ безброй решения', 'a = 3: 0 · x = 6 ⇒ няма решение'],
  },
];

export default function ParameterLab() {
  const [fi, setFi] = useState(0);
  const [a, setA] = useState(4);
  const f = FAMILIES[fi];
  const p = f.p(a);
  const q = f.q(a);
  const zero = Math.abs(p) < 1e-9;
  const kind = !zero ? 'one' : Math.abs(q) < 1e-9 ? 'all' : 'none';
  const x = zero ? null : q / p;
  // Вертикалният мащаб се приспособява, за да се вижда дясната страна
  const uy = Math.min(13, (H / 2 - 20) / Math.max(Math.abs(q) + 2, 8));
  const Y = (y: number) => H / 2 - y * uy;
  const yStep = uy < 6 ? 5 : 1;

  // Числова ос на параметъра a
  const AX0 = 30;
  const AX1 = 570;
  const ax = (v: number) => AX0 + ((v + 5) / 10) * (AX1 - AX0);

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🎛️ Уравнение с параметър</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Параметърът a е „число, което още не сме избрали“. За всяко a уравнението е различно. Местѝ a и следи кога решението изчезва или
        решенията стават безброй.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {FAMILIES.map((g, i) => (
          <button
            key={g.text}
            onClick={() => setFi(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono border ${
              i === fi ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {g.text}
          </button>
        ))}
      </div>

      <p className="text-center font-mono text-lg sm:text-xl my-2 text-violet-700 dark:text-violet-300">
        a = {num(a)}: &nbsp; {num(p)} · x = {num(q)}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-lg mx-auto text-gray-700 dark:text-gray-300">
        <defs>
          <clipPath id="par-clip">
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        {Array.from({ length: 31 }, (_, i) => i - 15).map(i => (
          <line key={`v${i}`} x1={X(i)} y1={0} x2={X(i)} y2={H} stroke="currentColor" opacity="0.07" />
        ))}
        {Array.from({ length: 21 }, (_, i) => (i - 10) * yStep).map(i => (
          <line key={`h${i}`} x1={0} y1={Y(i)} x2={W} y2={Y(i)} stroke="currentColor" opacity="0.07" />
        ))}
        <line x1={0} y1={Y(0)} x2={W} y2={Y(0)} stroke="currentColor" strokeWidth="1.2" />
        <line x1={X(0)} y1={0} x2={X(0)} y2={H} stroke="currentColor" strokeWidth="1.2" />
        <g clipPath="url(#par-clip)">
          {/* Лява страна y = p·x */}
          <line x1={X(-20)} y1={Y(p * -20)} x2={X(20)} y2={Y(p * 20)} stroke="#7c3aed" strokeWidth="3" />
          {/* Дясна страна y = q */}
          <line x1={0} y1={Y(q)} x2={W} y2={Y(q)} stroke="#f59e0b" strokeWidth="3" strokeDasharray={kind === 'all' ? '8 6' : undefined} />
          {x !== null && Math.abs(x) < 16 && <circle cx={X(x)} cy={Y(q)} r={7} fill="#ef4444" />}
        </g>
        <text x={8} y={16} fontSize="12" fill="#7c3aed" fontWeight="700">
          y = {num(p)}·x (лявата страна)
        </text>
        <text x={8} y={32} fontSize="12" fill="#d97706" fontWeight="700">
          y = {num(q)} (дясната страна)
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-3">
        Параметър a = {num(a)}
        <input type="range" min="-5" max="5" step="0.25" value={a} onChange={e => setA(Number(e.target.value))} className="w-full" />
      </label>

      {/* Карта на параметъра */}
      <svg viewBox="0 0 600 50" className="w-full h-auto text-gray-700 dark:text-gray-300">
        <line x1={AX0} x2={AX1} y1={22} y2={22} stroke="#86efac" strokeWidth="6" strokeLinecap="round" />
        {f.special.map(s => {
          const all = Math.abs(f.q(s)) < 1e-9;
          return (
            <g key={s}>
              <circle cx={ax(s)} cy={22} r={7} fill={all ? '#3b82f6' : '#ef4444'} stroke="white" strokeWidth="2" />
              <text x={ax(s)} y={44} fontSize="11" textAnchor="middle" fill="currentColor" fontWeight="700">
                a = {num(s)}
              </text>
            </g>
          );
        })}
        <polygon points={`${ax(a) - 6},6 ${ax(a) + 6},6 ${ax(a)},14`} fill="#7c3aed" />
        <text x={AX0} y={44} fontSize="10" fill="currentColor" opacity="0.5">
          −5
        </text>
        <text x={AX1} y={44} fontSize="10" textAnchor="end" fill="currentColor" opacity="0.5">
          5
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <span>🟢 едно решение</span>
        <span>🔴 няма решение</span>
        <span>🔵 безброй решения</span>
      </div>

      <div
        className={`mt-3 rounded-xl p-3 text-sm sm:text-base font-semibold text-center ${
          kind === 'one'
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : kind === 'none'
              ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
        }`}
      >
        {kind === 'one' && `Едно решение: x = ${num(q)} / ${num(p)} = ${num(x!)}. Двете линии се пресичат в една точка.`}
        {kind === 'none' && 'Коефициентът пред x е 0, а дясната страна не е – няма решение. Линиите са успоредни.'}
        {kind === 'all' && 'И двете страни са 0 – всяко x е решение. Линиите съвпадат с оста Ox.'}
      </div>
      <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        <p className="font-semibold mb-1">Пълно изследване:</p>
        <ul className="font-mono text-xs sm:text-sm space-y-0.5">
          {f.analysis.map(s => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useState } from 'react';

const W = 600;
const H = 150;
const X0 = 30;
const X1 = 570;
const MIN = -12;
const MAX = 12;
const AY = 95;
const px = (v: number) => X0 + ((v - MIN) / (MAX - MIN)) * (X1 - X0);

const num = (n: number) => (n < 0 ? `−${(-n).toLocaleString('bg-BG')}` : n.toLocaleString('bg-BG'));

type Mode = 'one' | 'two';

export default function AbsValueLab() {
  const [mode, setMode] = useState<Mode>('one');
  const [a, setA] = useState(2);
  const [b, setB] = useState(5);
  const [c, setC] = useState(-4);

  // |x − a| = b  или  |x − a| = |x − c|
  const sols = mode === 'one' ? (b > 0 ? [a - b, a + b] : b === 0 ? [a] : []) : a === c ? null : [(a + c) / 2];
  const eq = mode === 'one' ? `|x − ${a < 0 ? `(${num(a)})` : a}| = ${num(b)}` : `|x − ${a < 0 ? `(${num(a)})` : a}| = |x − ${c < 0 ? `(${num(c)})` : c}|`;

  const arc = (from: number, to: number, color: string, label: string, lift = 34) => {
    const x1 = px(from);
    const x2 = px(to);
    return (
      <g>
        <path d={`M ${x1} ${AY} Q ${(x1 + x2) / 2} ${AY - lift * 1.6} ${x2} ${AY}`} fill="none" stroke={color} strokeWidth="2" />
        <text x={(x1 + x2) / 2} y={AY - lift * 0.8 - 6} fontSize="12" textAnchor="middle" fill={color} fontWeight="700">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📏 Модулът е разстояние</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        |x − a| е разстоянието от x до a на числовата ос. Уравнението |x − a| = b пита: кои точки са на разстояние b от a?
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {(['one', 'two'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono border ${
              m === mode ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m === 'one' ? '|x − a| = b' : '|x − a| = |x − c|'}
          </button>
        ))}
      </div>

      <p className="text-center font-mono text-lg sm:text-xl my-2 text-sky-700 dark:text-sky-300">{eq}</p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        <line x1={X0 - 10} x2={X1 + 10} y1={AY} y2={AY} stroke="currentColor" strokeWidth="1.5" />
        {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={AY - 4} y2={AY + 4} stroke="currentColor" strokeOpacity={v === 0 ? 0.8 : 0.4} />
            <text x={px(v)} y={AY + 18} fontSize="10" textAnchor="middle" fill="currentColor" opacity={v % 4 === 0 ? 0.8 : 0.45}>
              {v % 2 === 0 ? num(v) : ''}
            </text>
          </g>
        ))}
        {mode === 'one' && sols && sols.length === 2 && (
          <>
            {arc(a, a + b, '#0284c7', `${b}`)}
            {arc(a - b, a, '#0284c7', `${b}`)}
          </>
        )}
        {mode === 'two' && sols && sols.length === 1 && (
          <>
            {arc(Math.min(a, sols[0]), Math.max(a, sols[0]), '#0284c7', `${Math.abs(sols[0] - a)}`, 26)}
            {arc(Math.min(c, sols[0]), Math.max(c, sols[0]), '#f59e0b', `${Math.abs(sols[0] - c)}`, 26)}
          </>
        )}
        {/* Опорните точки */}
        <g>
          <rect x={px(a) - 6} y={AY - 6} width={12} height={12} rx={2} fill="#0284c7" />
          <text x={px(a)} y={AY + 34} fontSize="11" textAnchor="middle" fill="#0284c7" fontWeight="700">
            a
          </text>
        </g>
        {mode === 'two' && (
          <g>
            <rect x={px(c) - 6} y={AY - 6} width={12} height={12} rx={2} fill="#f59e0b" />
            <text x={px(c)} y={AY + 34} fontSize="11" textAnchor="middle" fill="#d97706" fontWeight="700">
              c
            </text>
          </g>
        )}
        {(sols ?? []).map(s => (
          <g key={s}>
            <circle cx={px(s)} cy={AY} r={7} fill="#ef4444" stroke="white" strokeWidth="2" />
            <text x={px(s)} y={AY + 48} fontSize="12" textAnchor="middle" fill="#ef4444" fontWeight="700">
              x = {num(s)}
            </text>
          </g>
        ))}
      </svg>

      <div className="grid gap-4 mt-2 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          a = {num(a)}
          <input type="range" min="-6" max="6" step="1" value={a} onChange={e => setA(Number(e.target.value))} className="w-full" />
        </label>
        {mode === 'one' ? (
          <label className="text-sm font-semibold">
            b = {num(b)}
            <input type="range" min="-3" max="6" step="1" value={b} onChange={e => setB(Number(e.target.value))} className="w-full" />
          </label>
        ) : (
          <label className="text-sm font-semibold">
            c = {num(c)}
            <input type="range" min="-6" max="6" step="1" value={c} onChange={e => setC(Number(e.target.value))} className="w-full" />
          </label>
        )}
      </div>

      <div className="mt-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3 text-sm sm:text-base text-gray-800 dark:text-gray-100">
        {mode === 'one' ? (
          b > 0 ? (
            <p>
              Две точки са на разстояние {b} от {num(a)}: <span className="font-mono">x = {num(a)} − {b} = {num(a - b)}</span> и{' '}
              <span className="font-mono">x = {num(a)} + {b} = {num(a + b)}</span>. Алгебрично: x − a = b или x − a = −b.
            </p>
          ) : b === 0 ? (
            <p>Само самата точка a е на разстояние 0 от a – едно решение x = {num(a)}.</p>
          ) : (
            <p className="text-red-700 dark:text-red-400">Разстояние не може да е отрицателно – уравнението няма решение!</p>
          )
        ) : sols ? (
          <p>
            Точката, еднакво отдалечена от a и c, е средата на отсечката: <span className="font-mono">x = (a + c)/2 = {num(sols[0])}</span>.
          </p>
        ) : (
          <p>Когато a = c, двете страни са еднакви – всяко x е решение.</p>
        )}
      </div>
    </div>
  );
}

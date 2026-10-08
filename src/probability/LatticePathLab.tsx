import { Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note } from '~/geometry/diagram';

const W = 420;
const C = (n: number, k: number) => {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
};

/** Случаен път от m стъпки надясно и n нагоре (в случаен ред). */
const randomPath = (m: number, n: number) => {
  const steps = [...Array(m).fill('R'), ...Array(n).fill('U')] as ('R' | 'U')[];
  for (let i = steps.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [steps[i], steps[j]] = [steps[j], steps[i]];
  }
  return steps;
};

/** Пътища по мрежа: C(m + n, m) – избираме кои от стъпките са „надясно“. */
export default function LatticePathLab() {
  const [m, setM] = useState(4);
  const [n, setN] = useState(3);
  const [path, setPath] = useState(() => randomPath(4, 3));
  const [counts, setCounts] = useState(true);

  const cell = Math.min(60, (W - 60) / Math.max(m, n));
  const X = (i: number) => 40 + i * cell;
  const Y = (j: number) => 32 + (n - j) * cell;
  const H = n * cell + 62;

  const pts = [{ i: 0, j: 0 }];
  path.forEach(s => {
    const p = pts[pts.length - 1];
    pts.push(s === 'R' ? { i: p.i + 1, j: p.j } : { i: p.i, j: p.j + 1 });
  });
  const setSize = (mm: number, nn: number) => {
    setM(mm);
    setN(nn);
    setPath(randomPath(mm, nn));
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🗺️ Пътища в мрежа</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Тръгваме от долния ляв ъгъл и вървим само надясно (→) или нагоре (↑). По колко различни пътя стигаме до горния десен ъгъл?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto h-auto block text-gray-700 dark:text-gray-300">
        {Array.from({ length: m + 1 }, (_, i) => (
          <line key={`v${i}`} x1={X(i)} x2={X(i)} y1={Y(0)} y2={Y(n)} stroke="currentColor" strokeOpacity="0.25" />
        ))}
        {Array.from({ length: n + 1 }, (_, j) => (
          <line key={`h${j}`} x1={X(0)} x2={X(m)} y1={Y(j)} y2={Y(j)} stroke="currentColor" strokeOpacity="0.25" />
        ))}
        <polyline points={pts.map(p => `${X(p.i)},${Y(p.j)}`).join(' ')} fill="none" className="stroke-sky-500" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        {counts &&
          Array.from({ length: m + 1 }, (_, i) =>
            Array.from({ length: n + 1 }, (_, j) => (
              <g key={`${i}-${j}`}>
                <circle cx={X(i)} cy={Y(j)} r={11} className={i === m && j === n ? 'fill-rose-500' : 'fill-white dark:fill-gray-800 stroke-gray-300 dark:stroke-gray-600'} />
                <text x={X(i)} y={Y(j) + 4} fontSize={C(i + j, i) > 99 ? 9 : 11} textAnchor="middle" fontWeight="700" className={i === m && j === n ? 'fill-white' : 'fill-current'}>
                  {C(i + j, i)}
                </text>
              </g>
            )),
          )}
        <text x={X(0)} y={Y(0) + 26} fontSize="12" textAnchor="middle" fill="currentColor">
          A
        </text>
        <text x={X(m)} y={Y(n) - 16} fontSize="12" textAnchor="middle" fill="currentColor">
          B
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-3 mt-2">
        <button onClick={() => setPath(randomPath(m, n))} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold">
          <Shuffle size={14} /> друг път
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={counts} onChange={e => setCounts(e.target.checked)} className="accent-sky-500" />
          брой пътища до всеки възел
        </label>
      </div>
      <Sliders>
        <Slider label="→ m" value={m} onChange={v => setSize(v, n)} min={1} max={6} step={1} tone="blue" />
        <Slider label="↑ n" value={n} onChange={v => setSize(m, v)} min={1} max={6} step={1} tone="rose" />
      </Sliders>

      <p className="text-center font-mono text-base sm:text-lg mt-3 tracking-widest text-gray-800 dark:text-gray-100">{path.map(s => (s === 'R' ? '→' : '↑')).join('')}</p>
      <Formula>
        Пътищата са {m + n} стъпки, от които избираме кои {m} са „→“: C({m + n}, {m}) = {C(m + n, m)}
      </Formula>
      <Note tone="gray">До всеки възел се стига или отляво, или отдолу – затова числото е сбор на двете съседни. Това е триъгълникът на Паскал, „завъртян“.</Note>
    </div>
  );
}

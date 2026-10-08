import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';

type Event = { name: string; p: number; sides: number; hit: (r: number) => boolean };

const EVENTS: Event[] = [
  { name: '🪙 ези', p: 1 / 2, sides: 2, hit: r => r === 1 },
  { name: '🎲 шестица', p: 1 / 6, sides: 6, hit: r => r === 6 },
  { name: '🎲 четно число', p: 1 / 2, sides: 6, hit: r => r % 2 === 0 },
  { name: '🎲 повече от 4', p: 1 / 3, sides: 6, hit: r => r > 4 },
];

const W = 600;
const H = 220;
const PAD = 40;

/** Закон за големите числа: честотата на събитие при много опити. */
export default function FrequencyLab() {
  const [ei, setEi] = useState(1);
  const [hits, setHits] = useState(0);
  const [history, setHistory] = useState<number[]>([]); // относителна честота след всеки опит
  const [last, setLast] = useState<number[]>([]);
  const ev = EVENTS[ei];
  const n = history.length;

  const run = (k: number) => {
    let h = hits;
    const next = history.slice();
    const rolls: number[] = [];
    for (let i = 0; i < k; i++) {
      const r = 1 + Math.floor(Math.random() * ev.sides);
      if (ev.hit(r)) h++;
      next.push(h / (next.length + 1));
      if (i >= k - 12) rolls.push(r);
    }
    setHits(h);
    setHistory(next);
    setLast(rolls);
  };
  const reset = (i = ei) => {
    setEi(i);
    setHits(0);
    setHistory([]);
    setLast([]);
  };

  // Чертаем най-много ~600 точки
  const stride = Math.max(1, Math.ceil(n / 600));
  const X = (i: number) => PAD + (n <= 1 ? 0 : (i / (n - 1)) * (W - PAD - 10));
  const Y = (f: number) => H - 25 - f * (H - 45);
  let d = '';
  for (let i = 0; i < n; i += stride) d += `${i === 0 ? 'M' : 'L'} ${X(i).toFixed(1)} ${Y(history[i]).toFixed(1)} `;
  if (n > 1) d += `L ${X(n - 1).toFixed(1)} ${Y(history[n - 1]).toFixed(1)}`;
  const freq = n ? hits / n : 0;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-sky-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">🎲 Закон за големите числа</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        При малко опити честотата скача насам-натам. При много опити тя се „успокоява“ около вероятността – пунктирната линия.
      </p>
      <Buttons>
        {EVENTS.map((e, i) => (
          <DiagramButton key={e.name} active={i === ei} onClick={() => reset(i)}>
            {e.name}
          </DiagramButton>
        ))}
      </Buttons>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-3 text-gray-700 dark:text-gray-300">
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={PAD} x2={W - 10} y1={Y(f)} y2={Y(f)} stroke="currentColor" strokeOpacity="0.1" />
            <text x={PAD - 6} y={Y(f) + 4} fontSize="11" textAnchor="end" fill="currentColor" opacity="0.6">
              {num(f)}
            </text>
          </g>
        ))}
        <line x1={PAD} x2={W - 10} y1={Y(ev.p)} y2={Y(ev.p)} className="stroke-rose-500" strokeWidth="2" strokeDasharray="6 5" />
        <text x={W - 12} y={Y(ev.p) - 6} fontSize="12" textAnchor="end" className="fill-rose-600 dark:fill-rose-400" fontWeight="700">
          P = {num(ev.p, 3)}
        </text>
        {n > 0 && <path d={d} fill="none" className="stroke-sky-500" strokeWidth="2.5" strokeLinejoin="round" />}
        <text x={PAD} y={H - 6} fontSize="11" fill="currentColor" opacity="0.6">
          1
        </text>
        <text x={W - 10} y={H - 6} fontSize="11" textAnchor="end" fill="currentColor" opacity="0.6">
          {n > 0 ? `${n.toLocaleString('bg-BG')} опита` : 'брой опити'}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {[1, 10, 100, 1000].map(k => (
          <button key={k} onClick={() => run(k)} className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold">
            +{k.toLocaleString('bg-BG')}
          </button>
        ))}
        <button onClick={() => reset()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
          <RotateCcw size={14} /> Отначало
        </button>
      </div>

      {last.length > 0 && (
        <p className="text-center font-mono text-sm mt-3 text-gray-600 dark:text-gray-400">
          последни: {last.map(r => (ev.sides === 2 ? (r === 1 ? 'Е' : 'Т') : r)).join(' ')}
        </p>
      )}
      <Formula>
        Честота: {hits} / {n} = {num(freq, 4)} &nbsp; (вероятност {num(ev.p, 4)})
      </Formula>
      {n >= 1000 && <Note tone="emerald">Разлика от вероятността: {num(Math.abs(freq - ev.p), 4)} – при повече опити тя обикновено намалява.</Note>}
    </div>
  );
}

import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import Chart from '../models/Chart';

/** Шест обичайни пътувания до училище (в минути); седмото се мести с плъзгача. */
const USUAL = [12, 14, 15, 15, 17, 18];

const dec = (v: number, d = 1) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });
const mse = (xs: number[], c: number) => xs.reduce((s, v) => s + (v - c) ** 2, 0) / xs.length;
const mae = (xs: number[], c: number) => xs.reduce((s, v) => s + Math.abs(v - c), 0) / xs.length;

/** Едно-единствено предсказание c за всички дни: при кое c е най-малка квадратичната и при кое – абсолютната загуба. */
export default function CenterLab() {
  const [c, setC] = useState(20);
  const [last, setLast] = useState(60);
  const xs = [...USUAL, last];
  const mean = xs.reduce((s, v) => s + v, 0) / xs.length;
  const median = [...xs].sort((a, b) => a - b)[3];
  const grid = Array.from({ length: 81 }, (_, i) => 10 + i * 0.5);
  const top = Math.max(600, Math.ceil(mse(xs, 10) / 200) * 200);
  // Двете криви се чертаят в различен мащаб: квадратичната е много по-голяма
  const k = top / 40;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[10, 50]} y={[0, top]} xTicks={[10, 20, 30, 40, 50]} yTicks={[0, top / 4, top / 2, (3 * top) / 4, top]} xLabel="предсказание c, минути" yLabel="квадратична загуба" height={300}>
        {s => (
          <>
            <polyline points={grid.map(g => `${s.sx(g)},${s.sy(mse(xs, g))}`).join(' ')} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" clipPath={s.clip} />
            <polyline points={grid.map(g => `${s.sx(g)},${s.sy(mae(xs, g) * k)}`).join(' ')} fill="none" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.5" clipPath={s.clip} />
            <line x1={s.sx(c)} y1={s.y0} x2={s.sx(c)} y2={s.y1} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx={s.sx(c)} cy={s.sy(mse(xs, c))} r={6} className="fill-blue-600 dark:fill-blue-400" stroke="white" strokeWidth="1.5" clipPath={s.clip} />
            <circle cx={s.sx(c)} cy={s.sy(mae(xs, c) * k)} r={6} className="fill-amber-500" stroke="white" strokeWidth="1.5" />
            {xs.map((v, i) =>
              v <= 50 ? <circle key={i} cx={s.sx(v)} cy={s.y0 - 7 - 9 * xs.slice(0, i).filter(u => u === v).length} r={4.5} className={i === 6 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-700 dark:fill-gray-200'} stroke="white" strokeWidth="1" /> : null
            )}
            <text x={s.x1 - 8} y={s.y1 + 16} fontSize="12" textAnchor="end" className="fill-blue-700 dark:fill-blue-300">
              синьо – средна квадратична загуба (лявата скала)
            </text>
            <text x={s.x1 - 8} y={s.y1 + 32} fontSize="12" textAnchor="end" className="fill-amber-700 dark:fill-amber-400">
              оранжево – средна абсолютна загуба (× {dec(k, 0)})
            </text>
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="c" value={c} onChange={setC} min={10} max={50} step={0.5} tone="violet" />
        <Slider label="7-и ден" value={last} onChange={setLast} min={18} max={90} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'квадратична', value: dec(mse(xs, c)), tone: 'blue' },
            { label: 'абсолютна', value: dec(mae(xs, c), 2), tone: 'amber' },
            { label: 'средно аритметично', value: dec(mean) },
            { label: 'медиана', value: dec(median, 0) },
          ]}
        />
      </div>
      <Note tone="gray">
        Точките долу са времената за път: шест обичайни дни и един, в който автобусът е закъснял (червената точка; при над 50 минути е извън
        полето). Намери най-ниската точка на всяка крива – и после премести седмия ден.
      </Note>
    </div>
  );
}

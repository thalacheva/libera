import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import Chart, { type Scale } from '../models/Chart';
import { fits, LAST, MAX_CEILING, POINTS, truth } from './safetyMath';

const fmt = (v: number) => (v >= 1000 ? Math.round(v).toLocaleString('bg-BG').replace(/,/g, ' ') : v.toLocaleString('bg-BG', { minimumFractionDigits: v < 100 ? 1 : 0, maximumFractionDigits: v < 100 ? 1 : 0 }));

function path(s: Scale, f: (t: number) => number, from: number, to: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = from + ((to - from) * i) / 120;
    pts.push(`${s.sx(t)},${s.sy(Math.max(-50, Math.min(400, f(t))))}`);
  }
  return pts.join(' ');
}

/** Едни и същи точки, продължени с права, експонента и S-крива; после – какво е станало наистина. */
export default function TrendLab() {
  const [n, setN] = useState(8);
  const [reveal, setReveal] = useState(false);

  const f = fits(n);
  const ahead = [5, 10, 20];
  const rows: { name: string; color: string; fn: (t: number) => number }[] = [
    { name: 'права', color: 'bg-blue-500', fn: f.line },
    { name: 'експонента', color: 'bg-rose-500', fn: f.exp },
    { name: 'S-крива', color: 'bg-emerald-500', fn: f.logistic },
  ];
  if (reveal) rows.push({ name: 'наистина', color: 'bg-gray-500', fn: truth });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0, LAST]} y={[0, 160]} xTicks={[0, 10, 20, 30, 40]} yTicks={[0, 40, 80, 120, 160]} xLabel="време (години)" yLabel="показател" height={300}>
        {s => (
          <>
            <rect x={s.sx(0)} y={s.y1} width={s.sx(n) - s.sx(0)} height={s.y0 - s.y1} className="fill-fuchsia-200/40 dark:fill-fuchsia-500/10" />
            {reveal && <polyline points={path(s, truth, 0, LAST)} fill="none" strokeWidth={2} strokeDasharray="6 4" className="stroke-gray-500" clipPath={s.clip} />}
            <polyline points={path(s, f.line, 0, LAST)} fill="none" strokeWidth={2.5} className="stroke-blue-500" clipPath={s.clip} />
            <polyline points={path(s, f.exp, 0, LAST)} fill="none" strokeWidth={2.5} className="stroke-rose-500" clipPath={s.clip} />
            <polyline points={path(s, f.logistic, 0, LAST)} fill="none" strokeWidth={2.5} className="stroke-emerald-500" clipPath={s.clip} />
            {POINTS.map((y, t) => (t <= n ? <circle key={t} cx={s.sx(t)} cy={s.sy(y)} r={4} className="fill-gray-900 dark:fill-white" /> : reveal ? <circle key={t} cx={s.sx(t)} cy={s.sy(y)} r={3} className="fill-gray-400" /> : null))}
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="днес" value={n} onChange={setN} min={6} max={24} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={reveal} onClick={() => setReveal(!reveal)}>
          {reveal ? 'скрий какво стана' : 'покажи какво стана после'}
        </DiagramButton>
      </Buttons>
      <div className="overflow-x-auto mt-3">
        <table className="mx-auto text-xs sm:text-sm font-mono border-collapse">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1 text-left font-medium">прогноза</th>
              {ahead.map(d => (
                <th key={d} className="px-2 py-1 text-right font-medium">
                  след {d} г.
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.name} className="text-gray-900 dark:text-gray-100">
                <td className="px-2 py-1 whitespace-nowrap">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${r.color}`} />
                  {r.name}
                </td>
                {ahead.map(d => (
                  <td key={d} className="px-2 py-1 text-right">
                    {fmt(r.fn(n + d))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note tone="gray">
        Според експонентата показателят се удвоява на всеки {fmt(f.doubling)} години. Според S-кривата таванът е {f.ceiling >= MAX_CEILING * 0.98 ? `над ${MAX_CEILING} – от тези точки не може да се определи` : `около ${Math.round(f.ceiling)}`}.
      </Note>
    </div>
  );
}

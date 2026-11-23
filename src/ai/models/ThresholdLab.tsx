import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { confusion, makeScores, metrics } from './evaluation';

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Праг върху оценките на модела: матрица на грешките, точност, прецизност и пълнота. */
export default function ThresholdLab() {
  const [t, setT] = useState(0.5);
  const items = useMemo(() => makeScores(200, 0.3, 5), []);
  // Вертикално разместване, за да не се застъпват точките с близки оценки
  const jitter = useMemo(() => items.map((_, i) => ((i * 37) % 23) / 23), [items]);
  const c = confusion(items, t);
  const m = metrics(c);

  const cell = 'px-3 py-2 text-center border border-gray-200 dark:border-gray-700';
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0, 1]} y={[0, 2]} xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} yTicks={[]} xLabel="оценка на модела: колко вероятно е писмото да е спам" yLabel="" height={250}>
        {s => (
          <>
            <rect x={s.sx(t)} y={s.y1} width={s.x1 - s.sx(t)} height={s.y0 - s.y1} className="fill-amber-300/25" />
            <line x1={s.sx(t)} y1={s.y0} x2={s.sx(t)} y2={s.y1} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3" />
            <line x1={s.x0} y1={s.sy(1)} x2={s.x1} y2={s.sy(1)} className="stroke-gray-400" strokeWidth="1" />
            <text x={s.x0 + 6} y={s.sy(2) + 16} fontSize="12" className="fill-rose-600 dark:fill-rose-400">
              спам (60 писма)
            </text>
            <text x={s.x0 + 6} y={s.sy(1) + 16} fontSize="12" className="fill-blue-700 dark:fill-blue-300">
              обикновени писма (140)
            </text>
            {items.map((it, i) => {
              const wrong = it.positive !== it.score >= t;
              return <circle key={i} cx={s.sx(it.score)} cy={s.sy((it.positive ? 1.12 : 0.12) + 0.7 * jitter[i])} r={4} className={it.positive ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'} stroke={wrong ? 'black' : 'white'} strokeWidth={wrong ? 1.8 : 0.8} />;
            })}
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="праг" value={t} onChange={setT} min={0.05} max={0.95} step={0.01} tone="violet" />
      </Sliders>
      <div className="mt-3 overflow-x-auto">
        <table className="mx-auto border-collapse text-sm sm:text-base text-gray-800 dark:text-gray-200">
          <thead>
            <tr>
              <th className={cell}></th>
              <th className={cell}>моделът казва „спам“</th>
              <th className={cell}>моделът казва „не е спам“</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className={`${cell} text-left`}>наистина спам</th>
              <td className={`${cell} bg-emerald-50 font-mono font-semibold dark:bg-emerald-500/15`}>{c.tp}</td>
              <td className={`${cell} bg-rose-50 font-mono font-semibold dark:bg-rose-500/15`}>{c.fn}</td>
            </tr>
            <tr>
              <th className={`${cell} text-left`}>наистина обикновено</th>
              <td className={`${cell} bg-rose-50 font-mono font-semibold dark:bg-rose-500/15`}>{c.fp}</td>
              <td className={`${cell} bg-emerald-50 font-mono font-semibold dark:bg-emerald-500/15`}>{c.tn}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'точност', value: pct(m.accuracy) },
            { label: 'прецизност', value: pct(m.precision), tone: 'violet' },
            { label: 'пълнота', value: pct(m.recall), tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">
        Всичко вдясно от прага моделът обявява за спам. Точките с черен контур са грешките. Нисък праг хваща целия спам, но задържа и
        обикновени писма; висок праг не задържа нищо излишно, но пропуска спам.
      </Note>
    </div>
  );
}

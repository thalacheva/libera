import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { AXIS } from './classify';
import { bestKMeans, type CloudId, CLOUDS, GROUP_FILL, makeCloud } from './clusters';

const KS = [1, 2, 3, 4, 5, 6];

/** Сборът от квадратите за различен брой групи: къде кривата „се пречупва“. */
export default function ElbowLab() {
  const [id, setId] = useState<CloudId>('three');
  const [k, setK] = useState(2);
  const points = useMemo(() => makeCloud(id, 90, 4), [id]);
  const runs = useMemo(() => KS.map(v => bestKMeans(points, v)), [points]);
  const top = Math.ceil(runs[0].scatter / 200) * 200;
  const run = runs[k - 1];
  const drop = k > 1 ? 1 - run.scatter / runs[k - 2].scatter : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="space-y-2">
        <Chart {...AXIS} xLabel="признак x₁" yLabel="признак x₂" height={270}>
          {s => (
            <>
              {points.map((p, i) => (
                <circle key={i} cx={s.sx(p.x)} cy={s.sy(p.y)} r={4.5} className={GROUP_FILL[run.labels[i]]} stroke="white" strokeWidth="1" />
              ))}
            </>
          )}
        </Chart>
        <Chart x={[0.5, 6.5]} y={[0, top]} xTicks={KS} yTicks={[0, top / 4, top / 2, (3 * top) / 4, top]} xLabel="брой групи k" yLabel="сбор от квадратите" height={230}>
          {s => (
            <>
              <polyline points={runs.map((r, i) => `${s.sx(i + 1)},${s.sy(r.scatter)}`).join(' ')} fill="none" className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
              {runs.map((r, i) => (
                <circle key={i} cx={s.sx(i + 1)} cy={s.sy(r.scatter)} r={i + 1 === k ? 9 : 6} className={`cursor-pointer ${i + 1 === k ? 'fill-fuchsia-600 dark:fill-fuchsia-400' : 'fill-gray-500 dark:fill-gray-400'}`} stroke="white" strokeWidth="2" onClick={() => setK(i + 1)} />
              ))}
            </>
          )}
        </Chart>
      </div>
      <Buttons>
        {CLOUDS.map(d => (
          <DiagramButton key={d.id} active={d.id === id} onClick={() => setId(d.id)}>
            {d.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {KS.map(v => (
          <DiagramButton key={v} active={v === k} onClick={() => setK(v)}>
            k = {v}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'групи', value: k, tone: 'violet' },
            { label: 'сбор от квадратите', value: Math.round(run.scatter) },
            ...(k > 1 ? [{ label: `намаление спрямо k = ${k - 1}`, value: `${Math.round(drop * 100)}%`, tone: drop > 0.4 ? ('emerald' as const) : ('amber' as const) }] : []),
          ]}
        />
      </div>
      <Note tone="gray">
        Всяка нова група намалява сбора – но докато групите в данните не са свършили, намалението е голямо, а след това става малко.
        Мястото, където кривата се пречупва, подсказва колко групи има наистина.
      </Note>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import Chart from './Chart';
import { bestDirection, makeStretched, projectionSpread } from './clusters';

// Обхватите са подбрани така, че една единица да е еднакво дълга по двете оси (полето е 570 × 264 единици)
const Y: [number, number] = [0, 10];
const X: [number, number] = [5 - (5 * 570) / 264, 5 + (5 * 570) / 264];

/** Проекция на двумерен облак върху права: коя посока запазва най-много от разсейването. */
export default function ProjectionLab() {
  const [deg, setDeg] = useState(100);
  const points = useMemo(() => makeStretched(50, 6), []);
  const best = useMemo(() => Math.round(bestDirection(points)), [points]);
  const r = projectionSpread(points, deg);
  const far = 12;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={X} y={Y} xTicks={[-4, 0, 4, 8, 12]} yTicks={[0, 2, 4, 6, 8, 10]} xLabel="признак x₁" yLabel="признак x₂">
        {s => (
          <>
            <line x1={s.sx(r.mx - far * r.ux)} y1={s.sy(r.my - far * r.uy)} x2={s.sx(r.mx + far * r.ux)} y2={s.sy(r.my + far * r.uy)} className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="2.5" clipPath={s.clip} />
            {points.map((p, i) => {
              const qx = r.mx + r.along[i] * r.ux;
              const qy = r.my + r.along[i] * r.uy;
              return (
                <g key={i} clipPath={s.clip}>
                  <line x1={s.sx(p.x)} y1={s.sy(p.y)} x2={s.sx(qx)} y2={s.sy(qy)} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" />
                  <circle cx={s.sx(qx)} cy={s.sy(qy)} r={3.5} className="fill-fuchsia-600 dark:fill-fuchsia-400" />
                </g>
              );
            })}
            {points.map((p, i) => (
              <circle key={i} cx={s.sx(p.x)} cy={s.sy(p.y)} r={4.5} className="fill-blue-600 dark:fill-blue-400" stroke="white" strokeWidth="1" />
            ))}
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="ъгъл" value={deg} onChange={setDeg} min={0} max={180} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setDeg(best)}>най-добрата посока</DiagramButton>
        <DiagramButton onClick={() => setDeg(0)}>само x₁</DiagramButton>
        <DiagramButton onClick={() => setDeg(90)}>само x₂</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ъгъл на правата', value: `${deg}°`, tone: 'violet' },
            { label: 'запазено разсейване', value: `${Math.round(r.share * 100)}%`, tone: r.share > 0.9 ? 'emerald' : 'amber' },
            { label: 'изгубено', value: `${Math.round((1 - r.share) * 100)}%` },
          ]}
        />
      </div>
      <Note tone={Math.abs(deg - best) <= 2 ? 'emerald' : 'gray'}>
        {Math.abs(deg - best) <= 2
          ? 'Това е посоката, по която точките са най-разпръснати – първата главна компонента. Едно число на точка пази почти цялата картина.'
          : 'Сините точки имат по два признака. Лилавите са техните „сенки“ върху правата – всяка се описва с едно-единствено число. Завърти правата така, че сенките да са възможно най-разпръснати.'}
      </Note>
    </div>
  );
}

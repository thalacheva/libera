import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { mulberry32 } from '../history/rollouts';
import Chart from './Chart';
import { sigmoid } from './classify';

/** 24 ученици: часове подготовка и дали са взели изпита (1) или не (0). */
const DATA: [number, number][] = (() => {
  const random = mulberry32(5);
  return Array.from({ length: 24 }, () => {
    const x = Math.round(random() * 100) / 10;
    return [x, random() < sigmoid(1.3 * (x - 5)) ? 1 : 0] as [number, number];
  });
})();

/** Най-добрите w и b – с градиентно спускане, пресметнати веднъж. */
const BEST = (() => {
  let w = 0;
  let b = 0;
  for (let s = 0; s < 20000; s++) {
    let gw = 0;
    let gb = 0;
    for (const [x, y] of DATA) {
      const e = sigmoid(w * x + b) - y;
      gw += e * x;
      gb += e;
    }
    w -= (0.05 * gw) / DATA.length;
    b -= (0.05 * gb) / DATA.length;
  }
  return { w: Math.round(w * 10) / 10, b: Math.round(b * 2) / 2 };
})();

const dec = (v: number, d = 1) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');

/** Сигмоидата превръща сумата w·x + b във вероятност; прагът 0,5 дава границата. */
export default function SigmoidLab() {
  const [w, setW] = useState(0.4);
  const [b, setB] = useState(-1);
  const [x, setX] = useState(6);

  const p = sigmoid(w * x + b);
  const border = w === 0 ? null : -b / w;
  const correct = DATA.filter(([q, y]) => (sigmoid(w * q + b) > 0.5 ? 1 : 0) === y).length;
  const curve = Array.from({ length: 101 }, (_, i) => i / 10);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Chart x={[0, 10]} y={[-0.08, 1.08]} xTicks={[0, 2, 4, 6, 8, 10]} yTicks={[0, 0.25, 0.5, 0.75, 1]} xLabel="часове подготовка" yLabel="вероятност да вземе изпита">
        {s => (
          <>
            <line x1={s.x0} y1={s.sy(0.5)} x2={s.x1} y2={s.sy(0.5)} className="stroke-gray-500" strokeWidth="1" strokeDasharray="5 4" />
            {border !== null && border > 0 && border < 10 && <line x1={s.sx(border)} y1={s.y0} x2={s.sx(border)} y2={s.y1} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2" strokeDasharray="6 4" />}
            <polyline points={curve.map(q => `${s.sx(q)},${s.sy(sigmoid(w * q + b))}`).join(' ')} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-400" strokeWidth="3" />
            {DATA.map(([q, y], i) => {
              const wrong = (sigmoid(w * q + b) > 0.5 ? 1 : 0) !== y;
              return <circle key={i} cx={s.sx(q)} cy={s.sy(y)} r={5.5} className={y ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'} stroke={wrong ? 'black' : 'white'} strokeWidth={wrong ? 2.2 : 1.1} />;
            })}
            <line x1={s.sx(x)} y1={s.y0} x2={s.sx(x)} y2={s.sy(p)} className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.5" />
            <circle cx={s.sx(x)} cy={s.sy(p)} r={7} className="fill-emerald-500" stroke="white" strokeWidth="2" />
          </>
        )}
      </Chart>
      <Sliders>
        <Slider label="w" value={w} onChange={setW} min={0} max={4} step={0.1} tone="violet" />
        <Slider label="b" value={b} onChange={setB} min={-20} max={5} step={0.5} tone="amber" />
        <Slider label="x" value={x} onChange={setX} min={0} max={10} step={0.5} tone="emerald" />
      </Sliders>
      <Buttons>
        <DiagramButton
          onClick={() => {
            setW(BEST.w);
            setB(BEST.b);
          }}
        >
          покажи най-добрата крива
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'z = w·x + b', value: dec(w * x + b, 2), tone: 'violet' },
            { label: `вероятност при x = ${dec(x)}`, value: `${Math.round(p * 100)}%`, tone: 'emerald' },
            { label: 'граница при x', value: border === null || border < 0 || border > 10 ? 'извън полето' : dec(border, 2), tone: 'amber' },
            { label: 'вярно', value: `${correct} от ${DATA.length}`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone="gray">
        Червените точки горе са взелите изпита, сините долу – невзелите. По-голямо w прави кривата по-стръмна, а b я мести наляво и надясно.
        Пунктираната вертикала е мястото, където вероятността е точно 50%.
      </Note>
    </div>
  );
}

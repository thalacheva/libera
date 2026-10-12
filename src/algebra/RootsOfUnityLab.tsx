import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Plot, PlotDot, PlotLabel, PlotPolygon, PlotPolyline, Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';
import { complexText } from './complexMath';

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (k: number) => String(k).split('').map(d => SUB[Number(d)]).join('');

/** Корените на zⁿ = 1 са върховете на правилен n-ъгълник, вписан в единичната окръжност. */
export default function RootsOfUnityLab() {
  const [n, setN] = useState(6);
  const roots: Point[] = Array.from({ length: n }, (_, k) => ({ x: Math.cos((2 * Math.PI * k) / n), y: Math.sin((2 * Math.PI * k) / n) }));
  const circle = Array.from({ length: 121 }, (_, i) => ({ x: Math.cos((i / 60) * Math.PI), y: Math.sin((i / 60) * Math.PI) }));
  const round = (p: Point) => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 });

  return (
    <Plot
      x={[-1.6, 1.6]}
      y={[-1.4, 1.4]}
      hint="Уравнението zⁿ = 1 има точно n комплексни корена. Те имат модул 1 и ъгли 0°, 360°/n, 2·360°/n, … – затова лежат на единичната окръжност на равни разстояния."
      readout={
        <>
          <Sliders>
            <Slider label="n" value={n} onChange={setN} min={2} max={12} step={1} tone="violet" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'ъгъл между корените', value: `${num(360 / n, 2)}°`, tone: 'violet' },
                { label: 'ε₁ ≈', value: complexText(round(roots[1])), tone: 'rose' },
                { label: 'сбор на корените', value: '0' },
              ]}
            />
          </div>
          <Note tone="gray">
            {n === 2
              ? 'При n = 2 корените са 1 и −1 – и двата реални.'
              : n % 2 === 0
                ? `Реални корени са само 1 и −1, останалите ${n - 2} са по двойки спрегнати.`
                : `Единственият реален корен е 1, останалите ${n - 1} са по двойки спрегнати.`}
          </Note>
        </>
      }
    >
      <PlotPolyline points={circle} tone="gray" width={1.5} />
      {n > 2 && <PlotPolygon points={roots} tone="violet" />}
      {roots.map((p, k) => (
        <g key={k}>
          <PlotDot p={p} tone={k === 0 ? 'emerald' : k === 1 ? 'rose' : 'violet'} r={6} />
          <PlotLabel p={p} dx={p.x >= -0.01 ? 12 : -12} dy={p.y >= -0.01 ? -10 : 16} anchor={p.x >= -0.01 ? 'start' : 'end'} size={12} tone="violet">
            {`ε${sub(k)}`}
          </PlotLabel>
        </g>
      ))}
    </Plot>
  );
}

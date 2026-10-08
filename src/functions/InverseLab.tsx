import { useState } from 'react';
import { Formula, Note, Readout } from '~/geometry/diagram';
import { num } from './functionMath';
import { Curve, Plot, PlotDot, PlotLabel, PlotPolygon, Slider, Sliders } from './plot';

const x0 = 3; // начална широчина – с нея сравняваме

/** Правоъгълници с постоянно лице: страните са обратно пропорционални. */
export function InverseLab() {
  const [k, setK] = useState(12);
  const [x, setX] = useState(3);
  const y = k / x;

  return (
    <Plot
      x={[-0.5, 10]}
      y={[-0.5, 10]}
      hint="Лицето на правоъгълника е винаги k. Мести широчината x – височината се променя така, че x · y да остане същото. Горният десен ъгъл описва хипербола."
      readout={
        <>
          <Sliders>
            <Slider label="x" value={x} onChange={setX} min={0.5} max={10} step={0.25} tone="blue" />
            <Slider label="k" value={k} onChange={setK} min={2} max={24} step={1} tone="violet" />
          </Sliders>
          <Formula>
            y = k / x = {num(k)} / {num(x)} = {num(y)}
          </Formula>
          <Readout
            items={[
              { label: 'x · y =', value: num(x * y), tone: 'violet' },
              { label: `x : ${num(x0)} =`, value: num(x / x0), tone: 'blue' },
              { label: `y : ${num(k / x0)} =`, value: num(y / (k / x0)), tone: 'emerald' },
            ]}
          />
          <Note tone="violet">
            {x > x0 ? `x нарасна ${num(x / x0)} пъти – y намаля точно толкова пъти.` : x < x0 ? `x намаля ${num(x0 / x)} пъти – y нарасна точно толкова пъти.` : 'Мести x и сравни как се променя y.'}
          </Note>
        </>
      }
    >
      <PlotPolygon
        points={[
          { x: 0, y: 0 },
          { x, y: 0 },
          { x, y: Math.min(y, 10) },
          { x: 0, y: Math.min(y, 10) },
        ]}
        tone="violet"
      />
      <Curve f={t => k / t} tone="violet" from={0.05} />
      <PlotDot p={{ x, y }} tone="rose" />
      <PlotLabel p={{ x: x / 2, y: Math.min(y, 10) / 2 }} tone="violet" size={13}>
        S = {num(k)}
      </PlotLabel>
      <PlotLabel p={{ x, y }} dx={10} dy={-10} anchor="start" tone="rose" size={12}>
        ({num(x)}; {num(y)})
      </PlotLabel>
    </Plot>
  );
}
